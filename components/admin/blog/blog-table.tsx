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
import { Edit, Trash2, Eye, Star } from "lucide-react";
import { formatPublishDate } from "@/lib/blog-utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface BlogTableProps {
  blogs: BlogAdminListItem[];
  onEdit: (blog: BlogAdminListItem) => void;
  locale: string;
}

export function BlogTable({ blogs, onEdit, locale }: BlogTableProps) {
  const [deleteId, setDeleteId] = useState<Id<"blogs"> | null>(null);
  const deleteBlog = useMutation(api.blogs.remove);
  const setFeatured = useMutation(api.blogs.setFeatured);
  const unsetFeatured = useMutation(api.blogs.unsetFeatured);

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
    try {
      if (blog.isFeatured) {
        await unsetFeatured({ id: blog._id });
        toast.success("Removed from featured");
      } else {
        await setFeatured({ id: blog._id });
        toast.success("Set as featured post");
      }
    } catch (error) {
      toast.error("Error updating featured status");
      console.error("Error toggling featured:", error);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table containerClassName="overflow-x-visible">
          <TableHeader sticky>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No blog posts found
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleFeatured(blog)}
                      title={blog.isFeatured ? "Remove from featured" : "Set as featured"}
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
                  <TableCell className="font-medium">{blog.title_ro}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        blog.status === "published" ? "default" : "secondary"
                      }
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.publishedAt
                      ? formatPublishDate(blog.publishedAt, locale)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{blog.views || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
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
              {"Are you sure you want to delete this blog post? This action cannot be undone."}
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
    </>
  );
}
