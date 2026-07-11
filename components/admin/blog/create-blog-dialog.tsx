"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
import { Separator } from "@/components/ui/separator";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { Plus, X, Upload, Wand2, Image as ImageIcon, Eye, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { generateSlugFromTitle, calculateReadingTime } from "@/lib/blog-utils";
import { Badge } from "@/components/ui/badge";
import { BlogPreview } from "@/components/features/blog/blog-preview";
import { useImageUpload } from "@/hooks/use-image-upload";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

const tabTriggerClass =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow";

const blogSchema = z.object({
  title_ro: z
    .string()
    .min(1, "Romanian title is required")
    .max(200, "Title must be less than 200 characters"),
  title_en: z
    .string()
    .min(1, "English title is required")
    .max(200, "Title must be less than 200 characters"),
  slug_ro: z
    .string()
    .min(1, "Romanian slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase, hyphens only)",
    ),
  slug_en: z
    .string()
    .min(1, "English slug is required")
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

function LangToggle({
  activeLang,
  onChangeLang,
  roStatus,
  enStatus,
}: {
  activeLang: "ro" | "en";
  onChangeLang: (lang: "ro" | "en") => void;
  roStatus: "empty" | "partial" | "complete";
  enStatus: "empty" | "partial" | "complete";
}) {
  const dotColor = {
    empty: "bg-muted-foreground/25",
    partial: "bg-amber-500",
    complete: "bg-green-500",
  };

  return (
    <div className="inline-flex h-8 items-center rounded-lg bg-muted p-0.5 gap-0.5">
      {(["ro", "en"] as const).map((lang) => {
        const status = lang === "ro" ? roStatus : enStatus;
        const isActive = activeLang === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => onChangeLang(lang)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md px-4 py-1 text-sm font-semibold transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                dotColor[status],
              )}
            />
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

function ImageThumbnail({
  imageId,
  isCover,
  onSetCover,
  onDelete,
}: {
  imageId: Id<"_storage">;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  const url = useQuery(api.blogs.getImageUrl, { imageId });

  return (
    <div
      className={cn(
        "group relative rounded-lg border overflow-hidden transition-all",
        isCover
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/30",
      )}
    >
      <div className="aspect-[4/3] bg-muted">
        {url ? (
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Overlay actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        <Button
          type="button"
          variant={isCover ? "default" : "secondary"}
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSetCover();
          }}
        >
          <Star className={cn("h-3 w-3 mr-1", isCover && "fill-current")} />
          {isCover ? "Cover" : "Set Cover"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Cover badge */}
      {isCover && (
        <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
          Cover
        </div>
      )}

      {/* Copy ID on click */}
      <button
        type="button"
        className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-mono px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity text-left"
        onClick={() => {
          navigator.clipboard.writeText(imageId);
          toast.success("Storage ID copied");
        }}
      >
        {imageId}
      </button>
    </div>
  );
}

export function CreateBlogDialog({
  open,
  onOpenChange,
}: CreateBlogDialogProps) {
  const [currentTab, setCurrentTab] = useState("content");
  const [activeLang, setActiveLang] = useState<"ro" | "en">("ro");
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
  const { uploadFiles, deleteFiles } = useImageUpload();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title_ro: "",
      title_en: "",
      slug_ro: "",
      slug_en: "",
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

  function getLocaleStatus(lang: "ro" | "en"): "empty" | "partial" | "complete" {
    const title = form.watch(lang === "ro" ? "title_ro" : "title_en");
    const slug = form.watch(lang === "ro" ? "slug_ro" : "slug_en");
    const description = form.watch(lang === "ro" ? "description_ro" : "description_en");
    const content = form.watch(lang === "ro" ? "content_ro" : "content_en");
    const filled = [title, slug, description, content].filter(
      (v) => v && v.trim().length > 0,
    ).length;
    if (filled === 0) return "empty";
    if (filled === 4) return "complete";
    return "partial";
  }

  const handleGenerateSlug = (lang: "ro" | "en") => {
    const title = form.getValues(lang === "ro" ? "title_ro" : "title_en");
    if (title) {
      const slug = generateSlugFromTitle(title);
      form.setValue(lang === "ro" ? "slug_ro" : "slug_en", slug, {
        shouldValidate: true,
      });
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
      const imageIds = await uploadFiles(selectedFiles);
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
    // The blog doesn't exist yet, so nothing references this file
    void deleteFiles([imageId]);
    toast.success("Image removed");
  };

  // Closing without creating the blog abandons the uploads — no document
  // references them, so remove them from storage again
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      void deleteFiles(uploadedImageIds);
      setUploadedImageIds([]);
      setCoverImageId(undefined);
      setSelectedFiles([]);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      const publishedAt = data.status === "published" ? Date.now() : undefined;

      await createBlog({
        title_ro: data.title_ro,
        title_en: data.title_en,
        slug_ro: data.slug_ro,
        slug_en: data.slug_en,
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
    const slugField: "slug_ro" | "slug_en" = lang === "ro" ? "slug_ro" : "slug_en";
    const descField: "description_ro" | "description_en" = lang === "ro" ? "description_ro" : "description_en";
    const contentField: "content_ro" | "content_en" = lang === "ro" ? "content_ro" : "content_en";
    const readingTimeField: "readingTime_ro" | "readingTime_en" = lang === "ro" ? "readingTime_ro" : "readingTime_en";
    const label = lang === "ro" ? "Romanian" : "English";
    const slugPlaceholder = lang === "ro" ? "slug-in-romana" : "english-slug";
    const urlPrefix = lang === "ro" ? "/ro/blog/" : "/en/blog/";

    return (
      <div className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name={titleField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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

        {/* Slug — right after title */}
        <FormField
          control={form.control}
          name={slugField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                    {urlPrefix}
                  </span>
                  <FormControl>
                    <Input
                      placeholder={slugPlaceholder}
                      className="pl-[5.5rem] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleGenerateSlug(lang)}
                  title="Generate from title"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name={descField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
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

        {/* Content MDX */}
        <FormField
          control={form.control}
          name={contentField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content — MDX</FormLabel>
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

        {/* Reading Time */}
        <FormField
          control={form.control}
          name={readingTimeField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reading Time (minutes)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    type="number"
                    className="w-28"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh]">
        {/* Header with persistent language toggle */}
        <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-10 space-y-0">
          <DialogTitle>Create Blog Post</DialogTitle>
          <LangToggle
            activeLang={activeLang}
            onChangeLang={setActiveLang}
            roStatus={getLocaleStatus("ro")}
            enStatus={getLocaleStatus("en")}
          />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full grid grid-cols-3">
                <TabsTrigger value="content" className={tabTriggerClass}>
                  Content
                </TabsTrigger>
                <TabsTrigger value="settings" className={tabTriggerClass}>
                  <ImageIcon className="h-3.5 w-3.5" />
                  Media & Settings
                </TabsTrigger>
                <TabsTrigger value="preview" className={tabTriggerClass}>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[680px] max-h-[calc(95vh-14rem)] mt-4">
                {/* Content tab — locale-specific fields */}
                <TabsContent value="content" className="px-1 pr-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLang}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderContentFields(activeLang)}
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>

                {/* Media & Settings tab — shared fields */}
                <TabsContent value="settings" className="px-1 pr-4">
                  <div className="space-y-6">
                    {/* Images section */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Images
                      </h3>
                      <div className="space-y-4">
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
                          <div className="space-y-3">
                            <p className="text-sm font-medium">
                              Uploaded Images
                              <span className="text-muted-foreground font-normal ml-1">
                                — hover to copy ID, set cover, or remove
                              </span>
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {uploadedImageIds.map((imageId) => (
                                <ImageThumbnail
                                  key={imageId}
                                  imageId={imageId}
                                  isCover={coverImageId === imageId}
                                  onSetCover={() => {
                                    setCoverImageId(imageId);
                                    toast.success("Set as cover image");
                                  }}
                                  onDelete={() =>
                                    handleDeleteUploadedImage(imageId)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <FormDescription>
                          Upload images and copy their storage IDs to use in
                          your content
                        </FormDescription>
                      </div>
                    </div>

                    <Separator />

                    {/* Post settings section */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Post Settings
                      </h3>

                      <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter author name"
                                {...field}
                              />
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
                                <SelectItem value="published">
                                  Published
                                </SelectItem>
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
                                className="gap-1 pr-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove {tag}</span>
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <FormDescription className="mt-2">
                          Add tags (press Enter after each tag)
                        </FormDescription>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Preview tab — follows activeLang */}
                <TabsContent value="preview" className="px-1 pr-4">
                  <div className="mb-4 text-sm text-muted-foreground">
                    Previewing:{" "}
                    <span className="font-medium text-foreground">
                      {activeLang === "ro" ? "Romana" : "English"}
                    </span>
                  </div>
                  <BlogPreview
                    title={form.watch(
                      activeLang === "ro" ? "title_ro" : "title_en",
                    )}
                    author={form.watch("author")}
                    content={form.watch(
                      activeLang === "ro" ? "content_ro" : "content_en",
                    )}
                    readingTime={form.watch(
                      activeLang === "ro"
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
                onClick={() => handleOpenChange(false)}
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
