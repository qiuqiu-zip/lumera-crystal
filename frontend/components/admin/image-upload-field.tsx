"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import { resolvePreviewUrl } from "@/lib/image-url";
import { uploadImage } from "@/lib/image-upload-service";

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

async function uploadSingleFile(file: File): Promise<UploadItem> {
  const uploaded = await uploadImage(file);
  return { id: uploaded.id, url: uploaded.url };
}

export function ImageUploadField({ label, value, onChange, required, disabled, hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stageText, setStageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function onPickFile(file?: File | null) {
    if (!file || disabled || uploading) return;
    setUploading(true);
    setStageText("正在处理图片...");
    setError(null);
    try {
      const item = await uploadSingleFile(file);
      onChange(item.url, item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片上传失败，请重试。");
    } finally {
      setUploading(false);
      setStageText("");
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
          <p className="text-sm font-medium text-stone-700">{uploading ? stageText || "上传中..." : `点击上传${label}`}</p>
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
  const [stageText, setStageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function onPickFiles(fileList?: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled || uploading) return;
    const files = Array.from(fileList);
    for (const file of files) {
    }
    setUploading(true);
    setStageText("正在处理图片...");
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
      setStageText("");
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
        <span className="text-sm text-stone-700">{uploading ? stageText || "上传中..." : "上传商品图集"}</span>
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
