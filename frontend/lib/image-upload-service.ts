import { uploadAdminImage } from "@/lib/admin-api";
import { compressImageForUpload, validateUploadImage } from "@/lib/image-processing";

export type UploadedImagePayload = {
  id: number;
  url: string;
  originalUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
};

export async function uploadImage(file: File): Promise<UploadedImagePayload> {
  const error = validateUploadImage(file);
  if (error) throw new Error(error);
  const compressed = await compressImageForUpload(file);
  const uploaded = await uploadAdminImage(compressed);
  return {
    id: uploaded.id,
    url: uploaded.url,
    originalUrl: uploaded.originalUrl ?? uploaded.url,
    mediumUrl: uploaded.mediumUrl ?? uploaded.url,
    thumbnailUrl: uploaded.thumbnailUrl ?? uploaded.url,
  };
}
