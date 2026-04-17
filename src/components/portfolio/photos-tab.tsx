"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  uploadPortfolioPhoto,
  deletePortfolioPhoto,
} from "@/actions/portfolio";
import type { PortfolioPhoto } from "@/types/portfolio";

export function PhotosTab({ photos }: { photos: PortfolioPhoto[] }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function resetUpload() {
    setUploadOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setAltText("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleUpload() {
    if (!selectedFile) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", selectedFile);
      formData.set("caption", caption);
      formData.set("alt_text", altText);

      const result = await uploadPortfolioPhoto(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Photo uploaded");
      resetUpload();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deletePortfolioPhoto(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Photo deleted");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Upload photos to showcase on your portfolio.
          </CardDescription>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="min-h-[44px]"
        >
          <Plus className="mr-2 size-4" />
          Upload photo
        </Button>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
            <ImageIcon className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No photos yet</p>
              <p className="text-xs text-muted-foreground">
                Upload your first photo to your portfolio gallery.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image_url}
                  alt={photo.alt_text ?? photo.caption ?? "Portfolio photo"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-2">
                    <p className="truncate text-xs text-white">
                      {photo.caption || "No caption"}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-white hover:bg-white/20 hover:text-white"
                      disabled={isPending && deletingId === photo.id}
                      onClick={() => onDelete(photo.id)}
                    >
                      {isPending && deletingId === photo.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={uploadOpen} onOpenChange={(o) => !o && resetUpload()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload photo</DialogTitle>
            <DialogDescription>
              Add a photo to your portfolio gallery. Max 5MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-file">Image *</Label>
              <Input
                id="photo-file"
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
              />
              {preview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-caption">Caption</Label>
              <Input
                id="photo-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe this photo..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-alt">Alt text</Label>
              <Input
                id="photo-alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Accessibility description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetUpload}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isPending || !selectedFile}
              className="min-h-[44px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
