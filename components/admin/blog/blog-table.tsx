"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlogAdminListItem } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye, Star, FileText } from "lucide-react";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { getTableLayout } from "@/components/admin/shared/table-layout";
import { toastWithUndo } from "@/components/admin/shared/undo-toast";
import { formatPublishDate } from "@/lib/blog-utils";
import { formatRelativeTime } from "@/lib/format";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface BlogTableProps {
  blogs: BlogAdminListItem[];
  onEdit: (blog: BlogAdminListItem) => void;
  locale: string;
  onCreate?: () => void;
  fullHeight?: boolean;
}

/** Keeps the actions column reachable when the table scrolls horizontally. */
const stickyActionsClasses = "sticky right-0 bg-background";

export function BlogTable({
  blogs,
  onEdit,
  locale,
  onCreate,
  fullHeight = false,
}: BlogTableProps) {
  const layout = getTableLayout(fullHeight);
  const now = usePeriodicNow();
  const [deleteId, setDeleteId] = useState<Id<"blogs"> | null>(null);
  const deleteBlog = useMutation(api.blogs.remove);
  const setFeatured = useMutation(api.blogs.setFeatured).withOptimisticUpdate(
    (localStore, { id }) => {
      const current = localStore.getQuery(api.blogs.getAllAdmin, {});
      if (current === undefined) return;
      localStore.setQuery(
        api.blogs.getAllAdmin,
        {},
        current.map((blog) => ({ ...blog, isFeatured: blog._id === id })),
      );
    },
  );
  const unsetFeatured = useMutation(
    api.blogs.unsetFeatured,
  ).withOptimisticUpdate((localStore, { id }) => {
    const current = localStore.getQuery(api.blogs.getAllAdmin, {});
    if (current === undefined) return;
    localStore.setQuery(
      api.blogs.getAllAdmin,
      {},
      current.map((blog) =>
        blog._id === id ? { ...blog, isFeatured: false } : blog,
      ),
    );
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteBlog({ id: deleteId });
      toast.success("Blog deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Error deleting blog");
      console.error("Error deleting blog:", error);
    }
  };

  const handleToggleFeatured = async (blog: BlogAdminListItem) => {
    const previousFeatured = blogs.find((b) => b.isFeatured);
    try {
      if (blog.isFeatured) {
        await unsetFeatured({ id: blog._id });
        toastWithUndo({
          message: "Removed from featured",
          onUndo: () => setFeatured({ id: blog._id }),
        });
      } else {
        await setFeatured({ id: blog._id });
        toastWithUndo({
          message: "Set as featured post",
          onUndo: () =>
            previousFeatured
              ? setFeatured({ id: previousFeatured._id })
              : unsetFeatured({ id: blog._id }),
        });
      }
    } catch (error) {
      toast.error("Error updating featured status");
      console.error("Error toggling featured:", error);
    }
  };

  return (
    <div className={layout.root}>
      <div className={cn("rounded-md border", layout.scrollArea)}>
        <Table containerClassName="overflow-x-visible" dense>
          <TableHeader sticky className="z-20">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className={cn("text-right", stickyActionsClasses)}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={FileText}
                    message="No blog posts yet"
                    actionLabel={onCreate ? "Create post" : undefined}
                    onAction={onCreate}
                  />
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id} className="group/row">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleFeatured(blog)}
                      title={
                        blog.isFeatured
                          ? "Remove from featured"
                          : "Set as featured"
                      }
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          blog.isFeatured
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/40 hover:text-muted-foreground",
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div
                      className="max-w-[16rem] truncate lg:max-w-[24rem] xl:max-w-[32rem]"
                      title={blog.title_ro}
                    >
                      {blog.title_ro}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[10rem] truncate" title={blog.author}>
                      {blog.author}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        blog.status === "published" ? "default" : "secondary"
                      }
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    title={
                      blog.publishedAt
                        ? formatPublishDate(blog.publishedAt, locale)
                        : undefined
                    }
                  >
                    {blog.publishedAt === undefined || now === null
                      ? "-"
                      : formatRelativeTime(blog.publishedAt, now, (ts) =>
                          formatPublishDate(ts, locale),
                        )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{blog.views || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right group-hover/row:bg-muted/50",
                      stickyActionsClasses,
                    )}
                  >
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(blog)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(blog._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog</AlertDialogTitle>
            <AlertDialogDescription>
              {
                "Are you sure you want to delete this blog post? This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
