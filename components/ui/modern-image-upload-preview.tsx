import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Star, FileImage } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { useCallback, useEffect, useRef, useState } from "react";

interface ImageFile {
  file: File;
  previewUrl: string;
  error?: string;
}

interface ModernImageUploadPreviewProps {
  files: ImageFile[];
  onFilesChange: (files: ImageFile[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function ModernImageUploadPreview({
  files,
  onFilesChange,
  onError,
  maxFiles = 10,
  className,
  disabled = false,
  label = "Vehicle Images",
  description = "Upload multiple images. Supported formats: JPG, PNG, GIF, WebP (max 10MB each)",
}: ModernImageUploadPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const acceptedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use ${acceptedFileTypes.join(", ")}.`;
    }
    
    if (file.size > maxFileSize) {
      return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the maximum size of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB.`;
    }
    
    return null;
  };

  // Handle file selection (click or drag)
  const handleFileSelect = useCallback((fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    const newFiles: ImageFile[] = [];
    const errors: string[] = [];

    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      onError?.(`Cannot select more than ${maxFiles} files.`);
      return;
    }

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        file,
        previewUrl,
        error: error || undefined,
      });
    });

    if (errors.length > 0) {
      onError?.(errors.join("\n"));
    }

    onFilesChange([...files, ...newFiles]);
  }, [files, maxFiles, onFilesChange, onError]);

  // Handle file input change
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      handleFileSelect(fileList);
    }
  }, [handleFileSelect]);

  // Handle click to open file dialog
  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("image/")
    );
    
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  // Remove a file from selection
  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = [...files];
    const removed = newFiles.splice(index, 1)[0];
    
    // Cleanup preview URL
    if (removed && removed.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  // Clear all files
  const handleClearAll = useCallback(() => {
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    onFilesChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [files, onFilesChange]);

  // Get summary information
  const getSummary = useCallback(() => {
    const validFiles = files.filter(f => !f.error);
    const totalSize = validFiles.reduce((sum, file) => sum + file.file.size, 0);
    
    return {
      fileCount: files.length,
      validFileCount: validFiles.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(1),
      hasErrors: files.some(f => f.error),
    };
  }, [files]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  const summary = getSummary();

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Hidden file input */}
      <Input
        type="file"
        accept={acceptedFileTypes.join(",")}
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Drop zone */}
      {files.length === 0 ? (
        <div
          onClick={disabled ? undefined : handleThumbnailClick}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragEnter={disabled ? undefined : handleDragEnter}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDrop={disabled ? undefined : handleDrop}
          className={cn(
            "flex h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors",
            !disabled && "hover:bg-muted hover:border-muted-foreground/40",
            isDragging && !disabled && "border-primary/50 bg-primary/5",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="rounded-full bg-background p-3 shadow-sm">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {disabled ? "Upload disabled" : "Click to select images"}
            </p>
            {!disabled && (
              <p className="text-xs text-muted-foreground">
                or drag and drop files here
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Max {maxFiles} files, {(maxFileSize / 1024 / 1024).toFixed(0)}MB each
            </p>
          </div>
        </div>
      ) : (
        /* File preview grid */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {summary.validFileCount} of {maxFiles} files selected ({summary.totalSizeMB}MB total)
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleThumbnailClick}
                disabled={disabled || summary.fileCount >= maxFiles}
              >
                <ImagePlus className="h-4 w-4 mr-1" />
                Add More
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((fileData, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-lg overflow-hidden border bg-background"
              >
                {fileData.error ? (
                  /* Error state */
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-2 bg-destructive/5 border-destructive/20">
                    <FileImage className="h-8 w-8 text-destructive/60" />
                    <p className="text-xs text-destructive text-center">{fileData.error}</p>
                  </div>
                ) : (
                  /* Image preview */
                  <>
                    <Image
                      src={fileData.previewUrl}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    
                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveFile(index)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 text-xs truncate">
                      {fileData.file.name}
                    </div>

                    {/* First image indicator */}
                    {index === 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Main
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {summary.validFileCount > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {summary.validFileCount} images ready. First image will be the main display image.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
