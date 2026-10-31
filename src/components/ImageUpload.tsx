"use client";

import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

export function ImageUpload({
  label = "Upload Course Cover Image (Cloudinary Storage)",
  currentImageUrl,
  onImageUploaded,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary local preview while uploading
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const res = await uploadImageToCloudinary(file);
      if (res.success && res.url) {
        onImageUploaded(res.url);
        setPreview(res.url);
        toast.success("Image saved to Cloudinary storage! ☁️");
      } else {
        toast.error(res.error || "Failed to upload image.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground">{label}</label>
          <span className="text-[10px] text-muted-foreground font-semibold">
            Cloudinary (vujf5uxx)
          </span>
        </div>
      )}

      <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-4 transition-all hover:border-primary/50">
        {preview ? (
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border">
            <img src={preview} alt="Uploaded preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-xs font-bold text-white">Click or drag to replace image</span>
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
            </div>
            <p className="mt-2 text-xs font-bold text-foreground">
              {isUploading ? "Uploading to Cloudinary..." : "Click or drag course cover image"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
