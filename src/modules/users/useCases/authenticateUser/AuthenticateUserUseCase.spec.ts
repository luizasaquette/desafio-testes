import bcryptjs from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Authenticate User", () =>{
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() =>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should call usersRepository.findByEmail with correct e-mail", async() =>{
    await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const findByEmailSpy = jest.spyOn(inMemoryUsersRepository, "findByEmail");

    await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "1234"
    });

    expect(findByEmailSpy).toHaveBeenCalledWith("user@test.com")
  });

  it("should not be able to authenticate user if e-mail does not exist", () =>{
    expect(async() =>{
      await authenticateUserUseCase.execute({
        email: "userfake@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });


  it("should not be able to authenticate user if e-mail and password do not match", () =>{
    expect(async() =>{
      const user = await createUserUseCase.execute({
        name: "User test",
        email: "user@test.com",
        password: "1234"
      });

      await authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "4567"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should be able to authenticate user", async() =>{
    const existingUser = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const auth = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "1234"
    });

    expect(auth).toHaveProperty("token")
    expect(auth).toHaveProperty("user")
    expect(auth.user.name).toBe(existingUser.name);
  });
});
