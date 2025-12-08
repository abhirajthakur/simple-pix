import { prisma } from "src/lib/prisma";
import { status } from "elysia";
import { AuthModel } from "./model";

export abstract class AuthService {
  static async signIn({ username, password }: AuthModel.signInBody) {
    const hashedPassword = await hashPassword(password);

    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        hashedPassword,
      },
    });

    if (!existingUser) {
      throw status(404, "User not found" satisfies AuthModel.userNotFound);
    }

    return {
      userId: existingUser.id,
      username: existingUser.username,
    };
  }

  static async signUp({ username, password }: AuthModel.registerBody) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw status(
        409,
        "User with this username already exists" satisfies AuthModel.userAlreadyExists,
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        hashedPassword,
      },
    });

    return {
      userId: user.id,
      username: user.username,
    };
  }
}

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedPassword);

  const hashedPassword = [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashedPassword;
}
