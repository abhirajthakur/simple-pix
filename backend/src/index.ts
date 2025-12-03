import { Elysia } from "elysia";
import { authRouter } from "./modules/auth";

const app = new Elysia().use(authRouter).listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
