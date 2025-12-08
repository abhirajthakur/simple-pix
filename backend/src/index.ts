import { Elysia } from "elysia";
import { env } from "./config/env";
import { authRouter } from "./modules/auth";
import { imageRouter } from "./modules/image";

const app = new Elysia().use(authRouter).use(imageRouter).listen(env.PORT);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
