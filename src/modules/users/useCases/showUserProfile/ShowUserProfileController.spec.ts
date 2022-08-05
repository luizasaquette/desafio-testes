import request from "supertest";

import { app } from '../../../../app';

import { Connection, createConnection, MissingDeleteDateColumnError } from "typeorm";

describe("Show User Profile Controller", () =>{
  let connection: Connection;

  beforeAll(async() =>{
    connection =  await createConnection();
    await connection.runMigrations();
  });

  afterAll(async() =>{
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async() =>{
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

    const response = await request(app).get("/api/v1/profile").set(
      'Authorization',
      `Bearer ${token}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(user);
  });

  it("should not be able to show profile to unauthenticated user", async () =>{
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });
});
