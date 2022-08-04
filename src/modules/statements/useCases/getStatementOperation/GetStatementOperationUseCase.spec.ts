import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get Statement Operation", () =>{
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  beforeEach(() =>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should call usersRepository.findById with correct id", async() =>{
    const user = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = user.id as string;

    const statement = await inMemoryStatementsRepository.create({
      user_id,
      description: "Description test",
      amount: 200,
      type: OperationType.DEPOSIT
    });

    const statement_id = statement.id as string;

    const findByIdSpy = jest.spyOn(inMemoryUsersRepository, 'findById');

    await getStatementOperationUseCase.execute({ user_id, statement_id });

    expect(findByIdSpy).toHaveBeenCalledWith(user_id);
  });

  it("should not be able to get statement operations if user does not exist", () =>{
    expect(async ()=>{
      await inMemoryStatementsRepository.create({
        user_id: "any_id",
        description: "Description test",
        amount: 100.00,
        type: OperationType.DEPOSIT
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should call statementsRepository.findStatementOperation with correct values", async() =>{
    const user = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: '1234'
    });

    const user_id = user.id as string;

    const statement = await inMemoryStatementsRepository.create({
      user_id,
      description: "Description test",
      amount: 100.00,
      type: OperationType.DEPOSIT
    });

    const statement_id = statement.id as string;

    const findStatementOperationSpy = jest.spyOn(inMemoryStatementsRepository, 'findStatementOperation');

    await getStatementOperationUseCase.execute({ user_id, statement_id });

    expect(findStatementOperationSpy).toHaveBeenCalledWith({ statement_id, user_id });
  });

  it("should be able to get statement operation", async() =>{
    const user = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: '1234'
    });

    const user_id = user.id as string;

    const statement = await inMemoryStatementsRepository.create({
      user_id,
      description: "Description test",
      amount: 100.00,
      type: OperationType.DEPOSIT
    });

    const statement_id = statement.id as string;

    const result = await getStatementOperationUseCase.execute({ user_id, statement_id });

    expect(result).toEqual(statement);
  });
});
