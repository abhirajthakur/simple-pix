import { prisma } from "@/lib/prisma";
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { status } from "elysia";
import { ImageModel } from "./model";

export abstract class ImageService {
  static async saveImage({
    file,
    userId,
  }: ImageModel.uploadImageBody & { userId: string }) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await uploadToCloudinary(buffer);
    if (!metadata) {
      throw status(
        400,
        "Error while uploading image to cloudinary" satisfies ImageModel.cloudinaryUploadError,
      );
    }
    const { url, width, height } = metadata;

    const image = await prisma.image.create({
      data: {
        userId: userId,
        filename: file.name,
        url: url,
        mimeType: file.type,
        size: file.size,
        width: width,
        height: height,
      },
    });

    if (!image) {
      throw status(
        500,
        "Internal server error! Error while saving the image" satisfies ImageModel.internalServerError,
      );
    }

    return image;
  }
}

async function uploadToCloudinary(fileBuffer: Buffer): Promise<{
  url: string;
  width: number;
  height: number;
} | null> {
  try {
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "simple-pix" },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              return reject(error);
            }
            if (!result) {
              return reject(new Error("Cloudinary returned no result."));
            }
            resolve(result);
          },
        );

        stream.end(fileBuffer);
      },
    );

    console.log("UPLOAD RESULT", uploadResult);
    return {
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
}
