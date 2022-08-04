import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

describe("CreateUser", () =>{
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() =>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should call usersRepository.findByEmail with correct email", async() =>{
    const findByEmailSpy = jest.spyOn(inMemoryUsersRepository, 'findByEmail');

    const user = await createUserUseCase.execute({
      name: "User 1",
        email: "user@test.com",
        password: "1234"
    });

    expect(findByEmailSpy).toHaveBeenCalledWith("user@test.com");
  });

  it ("should not be able to create a new user if email already exists", () =>{
    expect(async() =>{
      await inMemoryUsersRepository.create({
        name: "User 1",
        email: "user@test.com",
        password: "1234"
      });

      await createUserUseCase.execute({
        name: "User 2",
        email: "user@test.com",
        password: "5678"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

  it("should be able to create a new user", async () =>{
    const user = await createUserUseCase.execute({
      name: "User 1",
      email: "user@test.com",
      password: "1234"
    });

    expect(user).toHaveProperty("id");
  });
})
