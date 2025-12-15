import { Image } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { status } from "elysia";
import sharp from "sharp";
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

  static async findImageById(id: string): Promise<Image> {
    const image = await prisma.image.findUnique({
      where: { id: id },
    });

    if (!image) {
      throw status(404, "Image not found" satisfies ImageModel.imageNotFound);
    }

    return image;
  }

  static async transformImage(
    inputBuffer: Buffer,
    { transformations }: ImageModel.transformImageBody,
  ) {
    let image = sharp(inputBuffer);

    // RESIZE
    if (transformations.resize) {
      image = image.resize({
        width: transformations.resize.width,
        height: transformations.resize.height,
        fit: "cover",
      });
    }

    // CROP
    if (transformations.crop) {
      image = image.extract({
        width: transformations.crop.width,
        height: transformations.crop.height,
        left: transformations.crop.x,
        top: transformations.crop.y,
      });
    }

    // ROTATE
    if (typeof transformations.rotate === "number") {
      image = image.rotate(transformations.rotate);
    }

    // FILTERS
    if (transformations.filters?.grayscale) {
      image = image.grayscale();
    }

    if (transformations.filters?.sepia) {
      image = image.tint({ r: 112, g: 66, b: 20 }); // warm sepia tone
    }

    // FORMAT
    if (transformations.format) {
      const fmt = transformations.format.toLowerCase();

      switch (fmt) {
        case "jpeg":
        case "jpg":
          image = image.jpeg({ quality: 90 });
          break;
        case "png":
          image = image.png();
          break;
        case "webp":
          image = image.webp({ quality: 90 });
          break;
        case "avif":
          image = image.avif();
          break;
        default:
          throw new Error("Unsupported format: " + transformations.format);
      }
    }

    const buffer = await image.toBuffer();
    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      metadata,
    };
  }

  static async saveTransformedImage({
    originalImage,
    buffer,
    metadata,
    transformations,
  }: {
    originalImage: Image;
    buffer: Buffer;
    metadata: sharp.Metadata;
    transformations: ImageModel.transformImageBody["transformations"];
  }) {
    const uploaded = await uploadToCloudinary(buffer);

    if (!uploaded) {
      throw status(
        400,
        "Error while uploading image to cloudinary" satisfies ImageModel.cloudinaryUploadError,
      );
    }

    const image = await prisma.image.create({
      data: {
        userId: originalImage.userId,
        filename: `transformed-${originalImage.filename}`,
        url: uploaded.url,
        mimeType: `image/${metadata.format}`,
        size: buffer.length,
        width: uploaded.width,
        height: uploaded.height,
        isOriginal: false,
        parentId: originalImage.id,
        transformations: transformations,
      },
    });

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
