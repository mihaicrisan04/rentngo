import { toast } from "sonner";

interface UndoToastOptions {
  message: string;
  description?: string;
  onUndo: () => Promise<unknown>;
}

export function toastWithUndo({
  message,
  description,
  onUndo,
}: UndoToastOptions) {
  toast.success(message, {
    description,
    position: "bottom-right",
    action: {
      label: "Undo",
      onClick: () => {
        void onUndo().then(
          () => toast.success("Change undone", { position: "bottom-right" }),
          (error) => {
            console.error("Undo error:", error);
            toast.error("Failed to undo", {
              description: "Please try again later.",
              position: "bottom-right",
            });
          },
        );
      },
    },
  });
}
