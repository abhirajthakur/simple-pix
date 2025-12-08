import { jwtConfig } from "@/config/jwt";
import { Elysia } from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";

export const authRouter = new Elysia({ prefix: "/api/auth" })
  .use(jwtConfig)
  .post(
    "/register",
    async ({ body, jwt }) => {
      const response = await AuthService.signUp(body);
      const token = await jwt.sign({
        id: response.userId,
      });

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
    async ({ body, jwt }) => {
      const response = await AuthService.signIn(body);
      const token = await jwt.sign({
        name: response.username,
        id: response.userId,
      });

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
