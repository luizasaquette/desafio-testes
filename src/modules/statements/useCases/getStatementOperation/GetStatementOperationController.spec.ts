import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

describe("Create Statement Controller", () =>{
  let connection: Connection;

  let authResponse : request.Response;

  beforeAll(async() =>{
    connection =  await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "User 1",
      email: "user@test.com",
      password: "1234"
    });

    authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com",
      password: "1234"
    });
  });

  afterAll(async() =>{
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async() =>{
    const user = authResponse.body.user;
    const token = authResponse.body.token;

    const statementResponse = await request(app).post("/api/v1/statements/deposit").send({
      user_id: user.id,
      description: "Statement description test",
      amount: 200.00
    }).set(
      'Authorization',
      `Bearer ${token}`
    );

    const statement = statementResponse.body;

    const response = await request(app).get(`/api/v1/statements/${statement.id}`).set
    (
      'Authorization',
      `Bearer ${token}`
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(statement.id);
  });

  it("should not be able to get non-existing statement operation", async() =>{
    const token = authResponse.body.token;

    const response = await request(app).get(`/api/v1/statements/${uuidV4()}`).set
    (
      'Authorization',
      `Bearer ${token}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Statement not found");
  });

  it("should not be able to get statement operation if user is unauthenticated", async() =>{
    const response = await request(app).get(`/api/v1/statements/${uuidV4()}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });
});
