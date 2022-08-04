import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

describe("Create Statement", () =>{
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() =>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should call usersRepository.findById", async() =>{
    const { id } = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: '1234'
    });

    const user_id = id as string;

    const findByIdSpy = jest.spyOn(inMemoryUsersRepository, 'findById');

    await createStatementUseCase.execute({
      user_id,
      description: "Description test",
      amount: 200.00,
      type: OperationType.DEPOSIT
    });

    expect(findByIdSpy).toHaveBeenCalledWith(user_id);
  });

  it("should not be able to create statement if user does not exist", () =>{
    expect(async() =>{
      await createStatementUseCase.execute({
        user_id: "any_id",
        description: "Description test",
        amount: 200.00,
        type: OperationType.DEPOSIT
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should call statamentsRepository.getUserBalance if statement's type is withdraw", async() =>{
    const { id } = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: '1234'
    });

    const user_id = id as string;

    await inMemoryStatementsRepository.create({
        user_id,
        description: "Description deposit test",
        amount: 200.00,
        type: OperationType.DEPOSIT
    });

    const getUserBalanceSpy = jest.spyOn(inMemoryStatementsRepository, 'getUserBalance');

    await createStatementUseCase.execute({
        user_id,
        description: "Description withdraw test",
        amount: 100.00,
        type: OperationType.WITHDRAW
    });

    expect(getUserBalanceSpy).toHaveBeenCalledWith({user_id});
  });

  it("should not be able to create statement with type withdraw if funds is not sufficient", () =>{
    expect(async() =>{
      const { id } = await inMemoryUsersRepository.create({
        name: "User test",
        email: "user@test.com",
        password: '1234'
      });

      const user_id = id as string;

      const getUserBalanceSpy = jest.spyOn(inMemoryStatementsRepository, 'getUserBalance');

      await createStatementUseCase.execute({
          user_id,
          description: "Description withdraw test",
          amount: 100.00,
          type: OperationType.DEPOSIT
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should be able to create a new statement", async()=>{
    const { id } = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: '1234'
    });

    const user_id = id as string;

    const statement = await inMemoryStatementsRepository.create({
        user_id,
        description: "Description deposit test",
        amount: 200.00,
        type: OperationType.DEPOSIT
    });

    expect(statement).toHaveProperty("id");
    expect(statement).toMatchObject({
      user_id,
      description: "Description deposit test",
      amount: 200.00,
      type: 'deposit'
    });
  });
});
