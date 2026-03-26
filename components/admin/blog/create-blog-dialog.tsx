"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { cn } from "@/lib/utils";
import { generateSlugFromTitle, calculateReadingTime } from "@/lib/blog-utils";
import { Badge } from "@/components/ui/badge";
import { BlogPreview } from "@/components/features/blog/blog-preview";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

const tabTriggerClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow";

const langTabClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-5 py-1.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow";

const blogSchema = z.object({
  title_ro: z
    .string()
    .min(1, "Romanian title is required")
    .max(200, "Title must be less than 200 characters"),
  title_en: z
    .string()
    .min(1, "English title is required")
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
  description_ro: z
    .string()
    .min(1, "Romanian description is required")
    .max(500, "Description must be less than 500 characters"),
  description_en: z
    .string()
    .min(1, "English description is required")
    .max(500, "Description must be less than 500 characters"),
  content_ro: z.string().min(1, "Romanian content is required"),
  content_en: z.string().min(1, "English content is required"),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string()).optional(),
  publishedAt: z.number().optional(),
  readingTime_ro: z.number().optional(),
  readingTime_en: z.number().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface CreateBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBlogDialog({
  open,
  onOpenChange,
}: CreateBlogDialogProps) {
  const [currentTab, setCurrentTab] = useState("content");
  const [contentLang, setContentLang] = useState("ro");
  const [previewLang, setPreviewLang] = useState("ro");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageIds, setUploadedImageIds] = useState<Id<"_storage">[]>(
    [],
  );
  const [coverImageId, setCoverImageId] = useState<
    Id<"_storage"> | undefined
  >();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const createBlog = useMutation(api.blogs.create);
  const uploadImages = useAction(api.blogs.uploadImages);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title_ro: "",
      title_en: "",
      slug: "",
      author: "",
      description_ro: "",
      description_en: "",
      content_ro: "",
      content_en: "",
      status: "draft",
      tags: [],
      readingTime_ro: 0,
      readingTime_en: 0,
    },
  });

  const handleGenerateSlug = () => {
    const title = form.getValues("title_ro");
    if (title) {
      const slug = generateSlugFromTitle(title);
      form.setValue("slug", slug);
    }
  };

  const handleAutoCalculateReadingTime = (lang: "ro" | "en") => {
    const content = form.getValues(lang === "ro" ? "content_ro" : "content_en");
    if (content) {
      const readingTime = calculateReadingTime(content);
      form.setValue(
        lang === "ro" ? "readingTime_ro" : "readingTime_en",
        readingTime,
      );
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
    try {
      const publishedAt = data.status === "published" ? Date.now() : undefined;

      await createBlog({
        title_ro: data.title_ro,
        title_en: data.title_en,
        slug: data.slug,
        author: data.author,
        description_ro: data.description_ro,
        description_en: data.description_en,
        content_ro: data.content_ro,
        content_en: data.content_en,
        status: data.status,
        tags: data.tags || [],
        coverImage: coverImageId,
        images: uploadedImageIds,
        publishedAt,
        readingTime_ro: data.readingTime_ro,
        readingTime_en: data.readingTime_en,
      });

      toast.success("Blog post created successfully");
      form.reset();
      setTags([]);
      setUploadedImageIds([]);
      setCoverImageId(undefined);
      setSelectedFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create blog post",
      );
    }
  };

  const renderContentFields = (lang: "ro" | "en") => {
    const titleField: "title_ro" | "title_en" = lang === "ro" ? "title_ro" : "title_en";
    const descField: "description_ro" | "description_en" = lang === "ro" ? "description_ro" : "description_en";
    const contentField: "content_ro" | "content_en" = lang === "ro" ? "content_ro" : "content_en";
    const readingTimeField: "readingTime_ro" | "readingTime_en" = lang === "ro" ? "readingTime_ro" : "readingTime_en";
    const label = lang === "ro" ? "Romanian" : "English";

    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={titleField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title ({label})</FormLabel>
              <FormControl>
                <Input
                  placeholder={`Enter ${label.toLowerCase()} title`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={descField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description ({label})</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Brief ${label.toLowerCase()} description or excerpt`}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={contentField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content ({label}) — MDX</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Write ${label.toLowerCase()} content in MDX format...`}
                  rows={14}
                  className="font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Markdown syntax with uploaded image references
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={readingTimeField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reading Time ({label}, minutes)</FormLabel>
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
                  onClick={() => handleAutoCalculateReadingTime(lang)}
                >
                  Auto
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Blog Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full grid grid-cols-4">
                <TabsTrigger value="content" className={tabTriggerClass}>
                  Content
                </TabsTrigger>
                <TabsTrigger value="settings" className={tabTriggerClass}>
                  Settings
                </TabsTrigger>
                <TabsTrigger value="images" className={tabTriggerClass}>
                  Images
                </TabsTrigger>
                <TabsTrigger value="preview" className={tabTriggerClass}>
                  Preview
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[650px] mt-4">
                {/* Content tab — main RO/EN language tabs */}
                <TabsContent value="content" className="px-1">
                  <Tabs value={contentLang} onValueChange={setContentLang}>
                    <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground mb-5">
                      <TabsTrigger value="ro" className={langTabClass}>
                        RO
                      </TabsTrigger>
                      <TabsTrigger value="en" className={langTabClass}>
                        EN
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ro">
                      {renderContentFields("ro")}
                    </TabsContent>
                    <TabsContent value="en">
                      {renderContentFields("en")}
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Settings tab — shared fields */}
                <TabsContent value="settings" className="space-y-4 px-1">
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
                          URL-friendly identifier (generated from Romanian
                          title)
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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

                {/* Images tab */}
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

                {/* Preview tab */}
                <TabsContent value="preview" className="px-1">
                  <div className="mb-4">
                    <Tabs value={previewLang} onValueChange={setPreviewLang}>
                      <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                        <TabsTrigger value="ro" className={langTabClass}>
                          RO
                        </TabsTrigger>
                        <TabsTrigger value="en" className={langTabClass}>
                          EN
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <BlogPreview
                    title={form.watch(
                      previewLang === "ro" ? "title_ro" : "title_en",
                    )}
                    author={form.watch("author")}
                    content={form.watch(
                      previewLang === "ro" ? "content_ro" : "content_en",
                    )}
                    readingTime={form.watch(
                      previewLang === "ro"
                        ? "readingTime_ro"
                        : "readingTime_en",
                    )}
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
                  ? "Creating..."
                  : "Create Blog Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
