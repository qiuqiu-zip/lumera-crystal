export type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1600;
const DEFAULT_QUALITY = 0.82;
const HARD_LIMIT_BYTES = 50 * 1024 * 1024;

const TRANSPARENT_TYPES = new Set(["image/png", "image/webp"]);

export function validateUploadImage(file: File): string | null {
  const mime = (file.type || "").toLowerCase();
  const lowerName = file.name.toLowerCase();
  if (mime === "image/heic" || mime === "image/heif" || lowerName.endsWith(".heic") || lowerName.endsWith(".heif")) {
    return "暂不支持 HEIC/HEIF，请在手机相册中转换为 JPG/PNG 后再上传。";
  }
  if (!mime.startsWith("image/")) {
    return "仅支持图片文件上传。";
  }
  if (file.size > HARD_LIMIT_BYTES) {
    return "图片过大，请更换一张图片后重试。";
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("图片读取失败"));
    };
    img.src = objectUrl;
  });
}

function computeScaledSize(width: number, height: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export async function compressImageForUpload(file: File, options: CompressImageOptions = {}): Promise<File> {
  if (typeof window === "undefined") return file;
  if (file.type.toLowerCase() === "image/gif") return file;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const image = await loadImage(file);
  const target = computeScaledSize(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight);

  if (target.width === image.naturalWidth && target.height === image.naturalHeight && file.size <= 2 * 1024 * 1024) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return file;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const preferPng = TRANSPARENT_TYPES.has(file.type.toLowerCase());
  const outputType = preferPng ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), outputType, preferPng ? undefined : quality);
  });

  if (!blob) return file;

  const nextName = file.name.replace(/\.(heic|heif|png|jpe?g|webp|gif)$/i, preferPng ? ".png" : ".jpg");
  const compressed = new File([blob], nextName, {
    type: outputType,
    lastModified: Date.now(),
  });

  if (compressed.size >= file.size && file.size <= 3 * 1024 * 1024) {
    return file;
  }
  return compressed;
}
