"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BlogListItem } from "@/types/blog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { Plus, X, Upload, Wand2 } from "lucide-react";
import { generateSlugFromTitle, calculateReadingTime } from "@/lib/blogUtils";
import { Badge } from "@/components/ui/badge";
import { BlogPreview } from "@/components/features/blog/blog-preview";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase, hyphens only)",
    ),
  author: z
    .string()
    .min(1, "Author is required")
    .max(100, "Author must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string()).optional(),
  readingTime: z.number().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface EditBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: BlogListItem | null;
}

export function EditBlogDialog({
  open,
  onOpenChange,
  blog,
}: EditBlogDialogProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageIds, setUploadedImageIds] = useState<Id<"_storage">[]>(
    [],
  );
  const [coverImageId, setCoverImageId] = useState<
    Id<"_storage"> | undefined
  >();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const fullBlog = useQuery(
    api.blogs.getById,
    blog ? { id: blog._id } : "skip",
  );
  const updateBlog = useMutation(api.blogs.update);
  const uploadImages = useAction(api.blogs.uploadImages);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      author: "",
      description: "",
      content: "",
      status: "draft",
      tags: [],
      readingTime: 0,
    },
  });

  useEffect(() => {
    if (fullBlog && open) {
      form.reset({
        title: fullBlog.title,
        slug: fullBlog.slug,
        author: fullBlog.author,
        description: fullBlog.description,
        content: fullBlog.content,
        status: fullBlog.status,
        tags: fullBlog.tags || [],
        readingTime: fullBlog.readingTime || 0,
      });
      setTags(fullBlog.tags || []);
      setCoverImageId(fullBlog.coverImage);
      setUploadedImageIds(fullBlog.images || []);
    }
  }, [fullBlog, open, form]);

  const handleGenerateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = generateSlugFromTitle(title);
      form.setValue("slug", slug);
    }
  };

  const handleAutoCalculateReadingTime = () => {
    const content = form.getValues("content");
    if (content) {
      const readingTime = calculateReadingTime(content);
      form.setValue("readingTime", readingTime);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No images selected");
      return;
    }

    try {
      const imageBuffers = await Promise.all(
        selectedFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return arrayBuffer;
        }),
      );

      const imageIds = await uploadImages({ images: imageBuffers });
      setUploadedImageIds((prev) => [...prev, ...imageIds]);
      setSelectedFiles([]);
      toast.success(`Uploaded ${imageIds.length} image(s)`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteUploadedImage = (imageId: Id<"_storage">) => {
    setUploadedImageIds((prev) => prev.filter((id) => id !== imageId));
    if (coverImageId === imageId) {
      setCoverImageId(undefined);
    }
    toast.success("Image removed from list");
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!blog) return;

    try {
      const wasPublished = blog.status === "published";
      const isNowPublished = data.status === "published";
      const publishedAt =
        !wasPublished && isNowPublished ? Date.now() : undefined;

      await updateBlog({
        id: blog._id,
        title: data.title,
        slug: data.slug,
        author: data.author,
        description: data.description,
        content: data.content,
        status: data.status,
        tags: data.tags || [],
        coverImage: coverImageId,
        images: uploadedImageIds,
        publishedAt,
        readingTime: data.readingTime,
      });

      toast.success("Blog post updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update blog post",
      );
    }
  };

  if (!blog) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full grid grid-cols-5">
                <TabsTrigger
                  value="basic"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Images
                </TabsTrigger>
                <TabsTrigger
                  value="metadata"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Metadata
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Preview
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[450px] mt-4">
                <TabsContent value="basic" className="space-y-4 px-1">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter blog post title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="url-friendly-slug" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateSlug}
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>
                          URL-friendly identifier for this post
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description or excerpt of the blog post"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="content" className="space-y-4 px-1">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content (MDX)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your blog post content in MDX format..."
                            rows={15}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          You can use Markdown syntax and reference uploaded
                          images
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="readingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reading Time (minutes)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAutoCalculateReadingTime}
                          >
                            Auto
                          </Button>
                        </div>
                        <FormDescription>
                          Estimated reading time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="images" className="space-y-4 px-1">
                  <div>
                    <FormLabel>Upload Images</FormLabel>
                    <div className="mt-2 space-y-4">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUploadImages}
                          disabled={selectedFiles.length === 0}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Selected: {selectedFiles.length} file(s)
                          </p>
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <span className="text-sm truncate">
                                {file.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {uploadedImageIds.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Uploaded Images (Click to copy storage ID)
                          </p>
                          {uploadedImageIds.map((imageId, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                              onClick={() => {
                                navigator.clipboard.writeText(imageId);
                                toast.success("Storage ID copied to clipboard");
                              }}
                            >
                              <code className="text-xs">{imageId}</code>
                              <div
                                className="flex gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  type="button"
                                  variant={
                                    coverImageId === imageId
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCoverImageId(imageId);
                                    toast.success("Set as cover image");
                                  }}
                                >
                                  {coverImageId === imageId
                                    ? "Cover"
                                    : "Set Cover"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUploadedImage(imageId);
                                  }}
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormDescription className="mt-2">
                      Upload images and copy their storage IDs to use in your
                      content
                    </FormDescription>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4 px-1">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add tags (press Enter)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormDescription className="mt-2">
                      Add tags (press Enter after each tag)
                    </FormDescription>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="px-1">
                  <BlogPreview
                    title={form.watch("title")}
                    author={form.watch("author")}
                    content={form.watch("content")}
                    readingTime={form.watch("readingTime")}
                    tags={tags}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Updating..."
                  : "Update Blog Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
