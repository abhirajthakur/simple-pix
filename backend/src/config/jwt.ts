import { jwt } from "@elysiajs/jwt";
import { env } from "./env";

export const jwtConfig = jwt({
  name: "jwt",
  secret: env.JWT_SECRET,
  exp: "2d",
});
