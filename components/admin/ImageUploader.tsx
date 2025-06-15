"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  initialImageUrl?: string;
  onUploadSuccess: (url: string) => void;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const ImageUploader = ({
  initialImageUrl,
  onUploadSuccess,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error(
        "Cloudinary configuration is missing. Please check your environment variables."
      );
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "avenuefashion/products");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Image upload failed.");

      const data = await response.json();
      onUploadSuccess(data.secure_url);
      setPreview(data.secure_url); // Update preview to permanent Cloudinary URL
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      setPreview(initialImageUrl || null); // Revert to initial image on failure
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreviewUrl); // Free up memory
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Product Image</Label>
      <div className="relative w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
        {preview && (
          <Image
            src={preview}
            alt="Product preview"
            fill
            className="object-contain rounded-lg p-2"
          />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm">Uploading...</p>
          </div>
        )}

        {/* Clickable overlay */}
        <Input
          id="image-upload"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          disabled={isUploading}
        />
        {!isUploading && !preview && (
          <div className="flex flex-col items-center pointer-events-none">
            <UploadCloud className="h-8 w-8" />
            <p className="mt-2 text-sm text-center">Click to upload an image</p>
          </div>
        )}
      </div>
    </div>
  );
};
