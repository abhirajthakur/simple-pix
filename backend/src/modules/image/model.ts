import { t } from "elysia";

export namespace ImageModel {
  export const uploadImageBody = t.Object({
    file: t.File({
      type: "image",
    }),
  });
  export type uploadImageBody = typeof uploadImageBody.static;

  export const transformImageBody = t.Object({
    transformations: t.Object({
      resize: t.Optional(
        t.Object({
          width: t.Number(),
          height: t.Number(),
        }),
      ),

      crop: t.Optional(
        t.Object({
          width: t.Number(),
          height: t.Number(),
          x: t.Number(),
          y: t.Number(),
        }),
      ),

      rotate: t.Optional(t.Number()),

      format: t.Optional(t.String()),

      filters: t.Optional(
        t.Object({
          grayscale: t.Optional(t.Boolean()),
          sepia: t.Optional(t.Boolean()),
        }),
      ),
    }),
  });
  export type transformImageBody = typeof transformImageBody.static;

  export const transformImageResponse = t.Object({
    id: t.String(),
    url: t.String(),
    width: t.Nullable(t.Number()),
    height: t.Nullable(t.Number()),
    size: t.Number(),
    parentId: t.Nullable(t.String()),
    transformations: t.Nullable(t.Record(t.String(), t.Any())),
  });
  export type transformImageResponse = typeof transformImageResponse.static;

  export const imageNotFound = t.Literal("Image not found");
  export type imageNotFound = typeof imageNotFound.static;

  export const internalServerError = t.Literal(
    "Internal server error! Error while saving the image",
  );
  export type internalServerError = typeof internalServerError.static;

  export const cloudinaryUploadError = t.Literal(
    "Error while uploading image to cloudinary",
  );
  export type cloudinaryUploadError = typeof cloudinaryUploadError.static;
}
