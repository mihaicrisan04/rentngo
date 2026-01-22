"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateBlogDialog } from "@/components/admin/blog/create-blog-dialog";
import { EditBlogDialog } from "@/components/admin/blog/edit-blog-dialog";
import { BlogTable } from "@/components/admin/blog/blog-table";
import { BlogListItem } from "@/types/blog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminBlogsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogListItem | null>(null);

  const blogs = useQuery(api.blogs.getAllAdmin);

  const handleEdit = (blog: BlogListItem) => {
    setSelectedBlog(blog);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedBlog(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Blog Management</CardTitle>
              <CardDescription>Create and manage blog posts</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Blog Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!blogs ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-muted-foreground">Loading blogs...</div>
              </div>
            </div>
          ) : (
            <BlogTable blogs={blogs} onEdit={handleEdit} locale="en" />
          )}
        </CardContent>
      </Card>

      <CreateBlogDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditBlogDialog
        open={editDialogOpen}
        onOpenChange={handleEditClose}
        blog={selectedBlog}
      />
    </div>
  );
}
