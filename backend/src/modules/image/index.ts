import { jwtConfig } from "@/config/jwt";
import { ImagePlain } from "@/generated/prismabox/Image";
import { Elysia } from "elysia";
import fs from "fs";
import { ImageModel } from "./model";
import { ImageService } from "./service";

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
  )
  .post(
    "/:id/transform",
    async ({ params: { id }, body }) => {
      const originalImage = await ImageService.findImageById(id);
      const inputBuffer = fs.readFileSync(originalImage.url);

      const { buffer, metadata } = await ImageService.transformImage(
        inputBuffer,
        body,
      );

      const transformedImage = await ImageService.saveTransformedImage({
        originalImage,
        buffer,
        metadata,
        transformations: body.transformations,
      });

      return {
        id: transformedImage.id,
        url: transformedImage.url,
        width: transformedImage.width,
        height: transformedImage.height,
        size: transformedImage.size,
        parentId: transformedImage.parentId,
        transformations: transformedImage.transformations as Record<
          string,
          any
        >,
      };
    },
    {
      body: ImageModel.transformImageBody,
      response: {
        404: ImageModel.imageNotFound,
        200: ImageModel.transformImageResponse,
      },
    },
  );
