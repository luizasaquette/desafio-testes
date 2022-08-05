import { createConnection } from 'typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';

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

  it("should be able to create a new deposit", async()=>{
    const user = authResponse.body.user;
    const token = authResponse.body.token;

    const response = await request(app).post("/api/v1/statements/deposit").send({
        user_id: user.id,
        description: "Description deposit test",
        amount: 200.00,
    }).set(
      'Authorization',
      `Bearer ${token}`
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("deposit");
  });

  it("should be able to create a new withdraw", async() =>{
    const user = authResponse.body.user;
    const token = authResponse.body.token;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      user_id: user.id,
      description: "Description withdraw test",
      amount: 100.00,
    }).set(
      'Authorization',
      `Bearer ${token}`
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("withdraw");
  });

  it("should not be able to create a new withdraw if funds are insufficient", async() =>{
    const user = authResponse.body.user;
    const token = authResponse.body.token;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      user_id: user.id,
      description: "Unavailable with draw",
      amount: 150.00
    }).set(
      'Authorization',
      `Bearer ${token}`
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });

  it("should not be able to create a new statement if user is unauthorized", async() =>{
    const response = await request(app).post("/api/v1/statements/deposit").send({
      user_id: "any_id",
      description: "fake description",
      amount: 10.00
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });
});
