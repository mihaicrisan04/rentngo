import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface ImageFile {
  file: File;
  previewUrl: string;
  error?: string;
}

export function revokeImageFiles(files: ImageFile[]) {
  files.forEach((file) => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
  });
}

// Owns staged image files for a dialog and guarantees their blob preview
// URLs are revoked on clear and on unmount (via a ref, so the cleanup sees
// the latest files instead of the initial prop).
export function useImageFiles() {
  const [files, setFiles] = useState<ImageFile[]>([]);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => {
    return () => {
      revokeImageFiles(filesRef.current);
    };
  }, []);

  const clearFiles = useCallback(() => {
    revokeImageFiles(filesRef.current);
    setFiles([]);
  }, []);

  return { files, setFiles, clearFiles };
}

// Uploads files directly to Convex storage: one short-lived upload URL +
// POST per file, so uploads are not subject to function argument size
// limits. Returns the storage IDs; persisting them (vehicles.addImages,
// blogs.create/update) is the caller's responsibility.
export function useImageUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<Id<"_storage">[]> => {
      return await Promise.all(
        files.map(async (file) => {
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!response.ok) {
            throw new Error(
              `Failed to upload ${file.name} (${response.status} ${response.statusText})`,
            );
          }
          const { storageId } = (await response.json()) as {
            storageId: Id<"_storage">;
          };
          return storageId;
        }),
      );
    },
    [generateUploadUrl],
  );

  return { uploadFiles };
}
