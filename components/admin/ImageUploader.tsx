"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";

interface MultiImageUploaderProps {
  initialImageUrls?: string[];
  onUrlsChange: (urls: string[]) => void;
  label: string;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const ImageUploader = ({
  initialImageUrls = [],
  onUrlsChange,
  label,
}: MultiImageUploaderProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImageUrls(initialImageUrls);
  }, [initialImageUrls]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error("Cloudinary configuration is missing.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "avenuefashion/products");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Image upload failed.");

      const data = await response.json();
      const newUrls = [...imageUrls, data.secure_url];
      setImageUrls(newUrls);
      onUrlsChange(newUrls);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
      // Reset file input to allow uploading the same file again
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newUrls);
    onUrlsChange(newUrls);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {imageUrls.map((url, index) => (
          <div key={url} className="relative aspect-square w-full">
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="relative aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
          {isUploading ? (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center pointer-events-none text-center p-2">
              <UploadCloud className="h-6 w-6" />
              <p className="mt-1 text-xs">Add Image</p>
            </div>
          )}
          <Input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
};
