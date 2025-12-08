import { t } from "elysia";

export namespace ImageModel {
  export const uploadImageBody = t.Object({
    file: t.File({
      type: "image",
    }),
  });

  export type uploadImageBody = typeof uploadImageBody.static;

  export const internalServerError = t.Literal(
    "Internal server error! Error while saving the image",
  );
  export type internalServerError = typeof internalServerError.static;

  export const cloudinaryUploadError = t.Literal(
    "Error while uploading image to cloudinary",
  );
  export type cloudinaryUploadError = typeof cloudinaryUploadError.static;
}
