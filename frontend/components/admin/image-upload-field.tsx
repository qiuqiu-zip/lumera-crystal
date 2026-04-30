"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import { uploadAdminImage } from "@/lib/admin-api";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

type UploadItem = {
  id?: number;
  url: string;
};

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (next: string, mediaId?: number) => void;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
};

type ImageUploadListFieldProps = {
  label: string;
  values: UploadItem[];
  onChange: (items: UploadItem[]) => void;
  disabled?: boolean;
  hint?: string;
};

function resolvePreviewUrl(input: string): string {
  if (!input) return input;
  if (input.startsWith("/")) return input;
  try {
    const parsed = new URL(input);
    if (parsed.pathname.startsWith("/api/v1/media/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return input;
  } catch {
    return input;
  }
}

function validateImage(file: File): string | null {
  const mime = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  if (mime === "image/heic" || mime === "image/heif" || fileName.endsWith(".heic") || fileName.endsWith(".heif")) {
    return "暂不支持 HEIC/HEIF，请在手机相册中转换为 JPG/PNG 后再上传。";
  }
  if (!IMAGE_MIME_TYPES.has(mime)) {
    return "仅支持 JPG / PNG / WEBP / GIF 格式图片。";
  }
  return null;
}

async function uploadSingleFile(file: File): Promise<UploadItem> {
  const uploaded = await uploadAdminImage(file);
  return { id: uploaded.id, url: uploaded.url };
}

export function ImageUploadField({ label, value, onChange, required, disabled, hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function onPickFile(file?: File | null) {
    if (!file || disabled || uploading) return;
    const checkError = validateImage(file);
    if (checkError) {
      setError(checkError);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const item = await uploadSingleFile(file);
      onChange(item.url, item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片上传失败，请重试。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-700">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </p>
        {value ? (
          <button
            type="button"
            className="inline-flex min-h-9 items-center rounded-lg border border-red-200 px-2.5 text-xs text-red-600"
            onClick={() => onChange("", undefined)}
            disabled={disabled || uploading}
          >
            <Trash2 size={14} className="mr-1" />
            删除
          </button>
        ) : null}
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0])}
        disabled={disabled || uploading}
      />
      {value ? (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          <img src={resolvePreviewUrl(value)} alt={label} className="h-40 w-full object-cover" />
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex min-h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 text-center"
        >
          {uploading ? <Loader2 className="mb-2 h-5 w-5 animate-spin text-stone-500" /> : <ImagePlus className="mb-2 h-5 w-5 text-stone-500" />}
          <p className="text-sm font-medium text-stone-700">{uploading ? "上传中..." : `点击上传${label}`}</p>
          <p className="mt-1 text-xs text-stone-500">支持 {IMAGE_EXTENSIONS.join(" / ")}，可从相册选择或拍照上传</p>
        </label>
      )}
      {value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-3 text-sm text-stone-700 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
          更换图片
        </button>
      ) : null}
      {hint ? <p className="text-xs text-stone-500">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function ImageUploadListField({ label, values, onChange, disabled, hint }: ImageUploadListFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function onPickFiles(fileList?: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled || uploading) return;
    const files = Array.from(fileList);
    for (const file of files) {
      const checkError = validateImage(file);
      if (checkError) {
        setError(checkError);
        return;
      }
    }
    setUploading(true);
    setError(null);
    try {
      const uploadedItems: UploadItem[] = [];
      for (const file of files) {
        const item = await uploadSingleFile(file);
        uploadedItems.push(item);
      }
      onChange([...values, ...uploadedItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片上传失败，请重试。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, idx) => idx !== index));
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-stone-700">{label}</p>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
        multiple
        className="hidden"
        onChange={(e) => onPickFiles(e.target.files)}
        disabled={disabled || uploading}
      />
      <label
        htmlFor={inputId}
        className="flex min-h-24 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 text-center"
      >
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-stone-500" /> : <ImagePlus className="mr-2 h-4 w-4 text-stone-500" />}
        <span className="text-sm text-stone-700">{uploading ? "上传中..." : "上传商品图集"}</span>
      </label>
      {values.length ? (
        <div className="grid grid-cols-3 gap-2">
          {values.map((item, idx) => (
            <div key={`${item.url}-${idx}`} className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
              <img src={resolvePreviewUrl(item.url)} alt={`gallery-${idx}`} className="h-24 w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"
                onClick={() => removeAt(idx)}
                disabled={disabled || uploading}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {hint ? <p className="text-xs text-stone-500">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
