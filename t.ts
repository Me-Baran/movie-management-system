// src/auth/domain/entities/user.entity.ts


export class User {
  private _username: string;
  private _password: string;
  
  // Private constructor forces use of factory methods
  private constructor(
    id: string,
    username: string,
    password: string
  ) {
    this._username = username;
    this._password = password;
  }
  
  // Factory method for creating a new user
  public static create(
    id: string,
    username: string,
    password: string,
  ): User {
    const user = new User(
      id,
      username,
      password,
    );
    
    return user;
  }

}

const user = User.create('1','meh','dlksnfkjd')
console.log(user)