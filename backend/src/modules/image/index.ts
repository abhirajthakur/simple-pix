import { jwtConfig } from "@/config/jwt";
import { Elysia } from "elysia";
import { ImageModel } from "./model";
import { ImageService } from "./service";
import { ImagePlain } from "@/generated/prismabox/Image";

export const imageRouter = new Elysia({ prefix: "/api/images" })
  .use(jwtConfig)
  .derive(async ({ headers: { authorization }, jwt }) => {
    if (!authorization?.startsWith("Bearer ")) {
      throw new Response(
        "Please include a valid Bearer token in your request headers.",
        { status: 401 },
      );
    }
    const token = authorization?.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload || !payload.id) {
      throw new Response("Invalid or expired token", { status: 401 });
    }

    return {
      userId: payload.id as string,
    };
  })
  .post(
    "/",
    ({ body, userId }) => {
      const imageData = {
        file: body.file,
        userId,
      };
      return ImageService.saveImage(imageData);
    },
    {
      body: ImageModel.uploadImageBody,
      response: {
        200: ImagePlain,
        500: ImageModel.internalServerError,
      },
    },
  );
