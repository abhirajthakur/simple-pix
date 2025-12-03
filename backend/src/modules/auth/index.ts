import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { AuthModel } from "./model";
import { Auth } from "./service";

export const authRouter = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .post(
    "/register",
    async ({ body, cookie: { session }, jwt }) => {
      const response = await Auth.signUp(body);
      const token = await jwt.sign({
        name: response.username,
        id: response.userId,
      });
      session.value = token;

      return {
        token,
        username: response.username,
      };
    },
    {
      body: AuthModel.registerBody,
      response: {
        200: AuthModel.authResponse,
        400: AuthModel.signInInvalid,
        409: AuthModel.userAlreadyExists,
      },
    },
  )
  .post(
    "/login",
    async ({ body, cookie: { session }, jwt }) => {
      const response = await Auth.signIn(body);
      const token = await jwt.sign({
        name: response.username,
        id: response.userId,
      });

      session.value = token;

      return {
        token,
        username: response.username,
      };
    },
    {
      body: AuthModel.signInBody,
      response: {
        200: AuthModel.authResponse,
        400: AuthModel.signInInvalid,
      },
    },
  );
