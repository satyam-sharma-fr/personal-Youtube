"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Pencil, Trash2, Loader2, MoreVertical, FolderOpen, ImageIcon, Upload } from "lucide-react";
import { createCategoryWithImage, renameCategory, deleteCategory, updateCategoryImage } from "@/app/actions/categories";
import { uploadCategoryImage } from "@/lib/category-images";
import { createClient } from "@/lib/supabase/client";
import type { ChannelCategory } from "@/types/database";

interface CategoryManagerProps {
  categories: ChannelCategory[];
}

export function CategoryManager({ categories: initialCategories }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newCategoryFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleNewCategoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCategoryImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setNewCategoryImagePreview(previewUrl);
    }
  };

  const clearNewCategoryImage = () => {
    setNewCategoryImage(null);
    if (newCategoryImagePreview) {
      URL.revokeObjectURL(newCategoryImagePreview);
      setNewCategoryImagePreview(null);
    }
    if (newCategoryFileInputRef.current) {
      newCategoryFileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if one was selected
      if (newCategoryImage) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const uploadResult = await uploadCategoryImage(newCategoryImage, user.id);
          if (uploadResult.success && uploadResult.url) {
            imageUrl = uploadResult.url;
          } else if (uploadResult.error) {
            toast.error(uploadResult.error);
            setIsCreating(false);
            return;
          }
        }
      }

      const result = await createCategoryWithImage(newCategoryName.trim(), imageUrl);
      if (result.error) {
        toast.error(result.error);
      } else if (result.category) {
        setCategories((prev) => 
          [...prev, result.category!].sort((a, b) => a.name.localeCompare(b.name))
        );
        setNewCategoryName("");
        clearNewCategoryImage();
        toast.success(`Created category "${result.category.name}"`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = async (categoryId: string) => {
    if (!editingName.trim()) return;

    setIsUpdating(true);
    try {
      const result = await renameCategory(categoryId, editingName.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId ? { ...c, name: editingName.trim() } : c
          ).sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        setEditingName("");
        toast.success("Category renamed");
        router.refresh();
      }
    } catch {
      toast.error("Failed to rename category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    setIsUpdating(true);
    try {
      const result = await deleteCategory(categoryId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        toast.success(`Deleted category "${categoryName}"`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingImageFor(categoryId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const uploadResult = await uploadCategoryImage(file, user.id);
      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.error || "Failed to upload image");
        return;
      }

      const updateResult = await updateCategoryImage(categoryId, uploadResult.url);
      if (updateResult.error) {
        toast.error(updateResult.error);
        return;
      }

      // Update local state
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, image_url: uploadResult.url ?? null } : c
        )
      );
      toast.success("Category image updated");
      router.refresh();
    } catch {
      toast.error("Failed to update image");
    } finally {
      setUploadingImageFor(null);
    }
  };

  const handleChangeImageClick = (categoryId: string) => {
    // Store which category we're uploading for
    setUploadingImageFor(categoryId);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingImageFor) {
      handleImageUpload(uploadingImageFor, file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startEditing = (category: ChannelCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="w-4 h-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Manage Categories
          </DialogTitle>
          <DialogDescription>
            Create and organize categories for your channels
          </DialogDescription>
        </DialogHeader>

        {/* Hidden file input for image uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={newCategoryFileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleNewCategoryImageSelect}
        />

        <div className="space-y-4 mt-4">
          {/* Create new category */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                disabled={isCreating}
              />
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newCategoryName.trim()}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Optional image for new category */}
            <div className="flex items-center gap-2">
              {newCategoryImagePreview ? (
                <div className="relative w-12 h-8 rounded overflow-hidden border border-border">
                  <Image
                    src={newCategoryImagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={clearNewCategoryImage}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => newCategoryFileInputRef.current?.click()}
                disabled={isCreating}
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                {newCategoryImagePreview ? "Change" : "Add"} image (optional)
              </Button>
            </div>
          </div>

          {/* Categories list */}
          {categories.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                <AnimatePresence mode="popLayout">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card"
                    >
                      {editingId === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleRename(category.id);
                              } else if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            className="h-8"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRename(category.id)}
                            disabled={isUpdating || !editingName.trim()}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            {/* Category image thumbnail */}
                            {category.image_url ? (
                              <div className="relative w-10 h-7 rounded overflow-hidden border border-border/50 flex-shrink-0">
                                <Image
                                  src={category.image_url}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {uploadingImageFor === category.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleChangeImageClick(category.id)}>
                                <Upload className="w-4 h-4 mr-2" />
                                {category.image_url ? "Change image" : "Add image"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => startEditing(category)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(category.id, category.name)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tag className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No categories yet</p>
              <p className="text-sm text-muted-foreground">
                Create categories to organize your channels
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
