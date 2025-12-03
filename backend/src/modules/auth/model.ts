import { t } from "elysia";

export namespace AuthModel {
  export const registerBody = t.Object({
    username: t.String(),
    password: t.String(),
  });

  export type registerBody = typeof registerBody.static;

  export const signInBody = t.Object({
    username: t.String(),
    password: t.String(),
  });

  export type signInBody = typeof signInBody.static;

  export const authResponse = t.Object({
    username: t.String(),
    token: t.String(),
  });

  export type signInResponse = typeof authResponse.static;

  export const signInInvalid = t.Literal("Invalid username or password");
  export type signInInvalid = typeof signInInvalid.static;

  export const userAlreadyExists = t.Literal(
    "User with this username already exists",
  );
  export type userAlreadyExists = typeof userAlreadyExists.static;

  export const userNotFound = t.Literal("User not found");
  export type userNotFound = typeof userNotFound.static;
}
