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
//
// If any file fails, sibling uploads that succeeded are deleted again before
// throwing, so a retry never leaves orphaned storage objects. `deleteFiles`
// is the same best-effort cleanup for IDs the caller ends up never attaching
// to a document (abandoned dialog, failed create).
export function useImageUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFilesMutation = useMutation(api.files.deleteFiles);

  const deleteFiles = useCallback(
    async (storageIds: Id<"_storage">[]): Promise<void> => {
      if (storageIds.length === 0) return;
      try {
        await deleteFilesMutation({ storageIds });
      } catch (error) {
        // Deliberately best-effort: when even this small mutation fails
        // (network down, expired session) no client-side recovery is more
        // likely to succeed. Log the IDs so they stay recoverable; lingering
        // blobs are otherwise a server-side GC concern.
        console.error(
          `Error cleaning up uploaded files (storage IDs: ${storageIds.join(", ")}):`,
          error,
        );
      }
    },
    [deleteFilesMutation],
  );

  const uploadFiles = useCallback(
    async (files: File[]): Promise<Id<"_storage">[]> => {
      const results = await Promise.allSettled(
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

      const uploadedIds = results
        .filter(
          (r): r is PromiseFulfilledResult<Id<"_storage">> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value);
      const failures = results.filter((r) => r.status === "rejected");

      if (failures.length > 0) {
        await deleteFiles(uploadedIds);
        throw new Error(
          failures
            .map((f) =>
              f.reason instanceof Error ? f.reason.message : String(f.reason),
            )
            .join("\n"),
        );
      }

      return uploadedIds;
    },
    [generateUploadUrl, deleteFiles],
  );

  return { uploadFiles, deleteFiles };
}
