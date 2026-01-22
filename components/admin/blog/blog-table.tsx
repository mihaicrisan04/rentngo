"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlogListItem } from "@/types/blog";
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
import { Edit, Trash2, Eye } from "lucide-react";
// import { useTranslations } from "next-intl";
import { formatPublishDate } from "@/lib/blog-utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface BlogTableProps {
  blogs: BlogListItem[];
  onEdit: (blog: BlogListItem) => void;
  locale: string;
}

export function BlogTable({ blogs, onEdit, locale }: BlogTableProps) {
  // const t = useTranslations("blogAdmin");
  const [deleteId, setDeleteId] = useState<Id<"blogs"> | null>(null);
  const deleteBlog = useMutation(api.blogs.remove);

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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No blog posts found
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        blog.status === "published" ? "default" : "secondary"
                      }
                    >
                      ${blog.status}
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
