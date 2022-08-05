import { createConnection } from 'typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from "../../../../app";

describe("Get Balance Controller", () =>{
  let connection: Connection;

  beforeAll(async() =>{
    connection =  await createConnection();
    await connection.runMigrations();
  });

  afterAll(async() =>{
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement balance", async()=>{
    await request(app).post("/api/v1/users").send({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com",
      password: "1234"
    });

    const { user, token } = authResponse.body;

    await request(app).post("/api/v1/statements/deposit").send({
        user_id: user.id,
        description: "Description deposit test",
        amount: 200.00,
        type: 'deposit'
    }).set(
      'Authorization',
      `Bearer ${token}`
    );


    const response = await request(app).get("/api/v1/statements/balance").set(
      'Authorization',
      `Bearer ${token}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
    expect(response.body.statement).toHaveLength(1);
  });
});
