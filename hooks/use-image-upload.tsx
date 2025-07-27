import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ImageUploadFile {
  file: File;
  previewUrl: string;
  uploadedId?: Id<"_storage">;
  isUploading?: boolean;
  error?: string;
}

interface UseImageUploadProps {
  vehicleId?: Id<"vehicles">;
  onUpload?: (imageIds: Id<"_storage">[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export function useImageUpload({ 
  vehicleId,
  onUpload,
  onError,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
}: UseImageUploadProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<ImageUploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const uploadImages = useAction(api.vehicles.uploadImages as any);

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
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: ImageUploadFile[] = [];
    const errors: string[] = [];

    // Check total file count
    if (selectedFiles.length + fileArray.length > maxFiles) {
      onError?.(`Cannot select more than ${maxFiles} files.`);
      return;
    }

    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        file,
        previewUrl,
        isUploading: false,
      });
    });

    if (errors.length > 0) {
      onError?.(errors.join("\n"));
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles, maxFiles, maxFileSize, acceptedFileTypes, onError]);

  // Handle file input change
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileSelect(files);
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

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("image/")
    );
    
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Remove a file from selection
  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      
      // Cleanup preview URL
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      
      return newFiles;
    });
  }, []);

  // Clear all files
  const handleClearAll = useCallback(() => {
    selectedFiles.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFiles]);

  // Upload files to Convex
  const handleUpload = useCallback(async () => {
    if (!vehicleId || selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    const filesWithoutErrors = selectedFiles.filter(f => !f.error);
    
    try {
      // Convert files to ArrayBuffers
      const imageBuffers = await Promise.all(
        filesWithoutErrors.map(async (fileData) => {
          const arrayBuffer = await fileData.file.arrayBuffer();
          return arrayBuffer;
        })
      );

      // Upload to Convex
      const uploadedImageIds = await uploadImages({
        vehicleId,
        images: imageBuffers,
      });

      if (uploadedImageIds) {
        onUpload?.(uploadedImageIds);
        handleClearAll(); // Clear files after successful upload
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      onError?.(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  }, [vehicleId, selectedFiles, uploadImages, onUpload, onError, handleClearAll]);

  // Get summary information
  const getSummary = useCallback(() => {
    const validFiles = selectedFiles.filter(f => !f.error);
    const totalSize = validFiles.reduce((sum, file) => sum + file.file.size, 0);
    
    return {
      fileCount: selectedFiles.length,
      validFileCount: validFiles.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(1),
      hasErrors: selectedFiles.some(f => f.error),
      canUpload: validFiles.length > 0 && !isUploading,
    };
  }, [selectedFiles, isUploading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  return {
    // File management
    selectedFiles,
    fileInputRef,
    
    // State
    isUploading,
    isDragging,
    
    // Handlers
    handleFileChange,
    handleThumbnailClick,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    handleClearAll,
    handleUpload,
    
    // Utility
    getSummary,
    
    // Configuration
    maxFiles,
    maxFileSize,
    acceptedFileTypes,
  };
}