"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BlogTable } from "@/components/admin/blog/blog-table";
import { BlogAdminListItem } from "@/types/blog";

const CreateBlogDialog = dynamic(
  () => import("@/components/admin/blog/create-blog-dialog").then(m => m.CreateBlogDialog),
  { ssr: false }
);

const EditBlogDialog = dynamic(
  () => import("@/components/admin/blog/edit-blog-dialog").then(m => m.EditBlogDialog),
  { ssr: false }
);

export default function AdminBlogsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogAdminListItem | null>(null);

  const blogs = useQuery(api.blogs.getAllAdmin);

  const handleEdit = (blog: BlogAdminListItem) => {
    setSelectedBlog(blog);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedBlog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Blog Post
        </Button>
      </div>

      {!blogs ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading blogs...</div>
        </div>
      ) : (
        <BlogTable
          blogs={blogs}
          onEdit={handleEdit}
          locale="en"
          onCreate={() => setCreateDialogOpen(true)}
        />
      )}

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
