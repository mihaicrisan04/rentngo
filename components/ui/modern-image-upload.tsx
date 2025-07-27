import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ImagePlus, X, Upload, Trash2, Star, FileImage } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { Progress } from "@/components/ui/progress";

interface ModernImageUploadProps {
  vehicleId?: Id<"vehicles">;
  onUpload?: (imageIds: Id<"_storage">[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function ModernImageUpload({
  vehicleId,
  onUpload,
  onError,
  maxFiles = 10,
  className,
  disabled = false,
  label = "Vehicle Images",
  description = "Upload multiple images. Supported formats: JPG, PNG, GIF, WebP (max 10MB each)",
}: ModernImageUploadProps) {
  const {
    selectedFiles,
    fileInputRef,
    isUploading,
    isDragging,
    handleFileChange,
    handleThumbnailClick,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    handleClearAll,
    handleUpload,
    getSummary,
    maxFileSize,
    acceptedFileTypes,
  } = useImageUpload({
    vehicleId,
    onUpload,
    onError,
    maxFiles,
  });

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
        disabled={disabled || isUploading}
      />

      {/* Drop zone */}
      {selectedFiles.length === 0 ? (
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
                disabled={disabled || isUploading || summary.fileCount >= maxFiles}
              >
                <ImagePlus className="h-4 w-4 mr-1" />
                Add More
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={disabled || isUploading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {selectedFiles.map((fileData, index) => (
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
                        disabled={disabled || isUploading}
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
                        First
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Upload progress and controls */}
          {vehicleId && summary.validFileCount > 0 && (
            <div className="space-y-3 pt-2 border-t">
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading images...</span>
                    <span>{summary.validFileCount} files</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Images will be uploaded in the order shown. First image will be the default display image.
                </p>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={disabled || !summary.canUpload || !vehicleId}
                  className="bg-primary hover:bg-primary/80"
                >
                  {isUploading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {summary.validFileCount} Images
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 