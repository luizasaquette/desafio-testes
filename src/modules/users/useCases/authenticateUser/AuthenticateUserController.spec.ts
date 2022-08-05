import { createConnection } from 'typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from "../../../../app";

describe("Authenticate User", () =>{
  let connection: Connection;

  beforeAll(async() =>{
    connection =  await createConnection();
    await connection.runMigrations();
  });

  afterAll(async() =>{
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async() =>{
    await request(app).post("/api/v1/users").send({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com",
      password: "1234"
    });

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("should not be able to authenticate non-existing user", async() =>{
    const response = await request(app).post("/api/v1/sessions").send({
      email: "any_email",
      password: "1234"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });

  it("should not be able to authenticate user if email and password not match", async()=>{
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@test.com",
      password: "fake_password"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });
});
