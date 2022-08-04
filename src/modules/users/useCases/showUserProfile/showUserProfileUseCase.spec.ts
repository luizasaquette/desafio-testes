import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () =>{
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() =>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should call usersRepository.findById with correct id", async()=>{
    const user = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const findByIdSpy = jest.spyOn(inMemoryUsersRepository, 'findById');

    const user_id = user.id as string;

    await showUserProfileUseCase.execute(user_id);

    expect(findByIdSpy).toHaveBeenCalledWith(user_id);
  });

  it("should not be able to show user profile if user does not exist", () =>{
    expect(async() => {
      await showUserProfileUseCase.execute('any_id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

  it("should be able to show user profile", async() =>{
    const user = await inMemoryUsersRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = user.id as string;

    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile).toEqual(user);
  });
});
