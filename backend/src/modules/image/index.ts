import { jwtConfig } from "@/config/jwt";
import { ImagePlain } from "@/generated/prismabox/Image";
import { prisma } from "@/lib/prisma";
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
      const image = await fetch(originalImage.url);
      const inputBuffer = Buffer.from(await image.arrayBuffer());

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
  )
  .get(
    "/",
    async ({ query, userId }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;

      const [total, images] = await Promise.all([
        prisma.image.count({ where: { userId } }),
        prisma.image.findMany({
          where: { userId },
          orderBy: { uploadedAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      const data = images.map((img) => ({
        id: img.id,
        url: img.url,
        width: img.width,
        height: img.height,
        mimeType: img.mimeType,
        size: img.size,
        uploadedAt: img.uploadedAt.toISOString(),
        isOriginal: img.isOriginal,
        parentId: img.parentId,
      }));

      return {
        total,
        page,
        limit,
        data,
      };
    },
    {
      query: ImageModel.listImagesQuery,
      response: {
        200: ImageModel.imageListResponse,
      },
    },
  );
