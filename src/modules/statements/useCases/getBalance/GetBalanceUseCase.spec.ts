import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { OperationType } from "../../entities/Statement";
import { GetBalanceError } from "./GetBalanceError";

describe("Get Balance", () =>{
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let getBalanceUseCase: GetBalanceUseCase;


  beforeEach(() =>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  // it should call usersRepository.findById with correct id
  it("should call usersRepository.findById with correct id", async() =>{
    const { id } = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = id as string;

    await inMemoryStatementsRepository.create({
      user_id,
      description: "description test",
      amount: 200.00,
      type: OperationType.DEPOSIT
    });

    const findByIdSpy = jest.spyOn(inMemoryUsersRepository, 'findById');

    await getBalanceUseCase.execute({
      user_id,
    });

    expect(findByIdSpy).toHaveBeenCalledWith(user_id);
  });
  // it should not be able to get statement balance if user does not exist
  it("should not be able to get statement balance if user does not exist", () =>{
    expect(async() =>{
      await getBalanceUseCase.execute({ user_id: 'any_id'});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  // it should call statementsRepository.getUserBalance with correct values
  it("should call statementsRepository.getUserBalance with correct values", async() =>{
    const { id } = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = id as string;

    await inMemoryStatementsRepository.create({
      user_id,
      description: "description test",
      amount: 200.00,
      type: OperationType.DEPOSIT
    });

    const getUserBalanceSpy = jest.spyOn(inMemoryStatementsRepository, 'getUserBalance');

    await getBalanceUseCase.execute({
      user_id,
    });

    expect(getUserBalanceSpy).toHaveBeenCalledWith(
      {
        user_id,
        with_statement: true
      }
    );
  });

  // it should be able to get user statement balance
  it("should be able to get user statement balance", async() =>{
    const { id } = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = id as string;

    await inMemoryStatementsRepository.create({
      user_id,
      description: "description test",
      amount: 200.00,
      type: OperationType.DEPOSIT
    });

    const balance = await getBalanceUseCase.execute({
      user_id,
    });

    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("statement");
  });
});

