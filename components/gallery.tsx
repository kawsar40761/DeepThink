"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Input, Spinner, Card, Modal } from "@/components/ui";
import { useToast } from "@/hooks";
import { cloudinaryConfig } from "@/lib/config";
import { cn, formatDate } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  publicId?: string;
  filename: string;
  createdAt: string;
  size: number;
}

const PAGE_SIZE = 12;

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  formData.append("cloud_name", cloudinaryConfig.cloudName);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id, size: file.size };
}

interface GalleryProps {
  onSelect?: (url: string) => void;
  showSelectButton?: boolean;
}

export default function Gallery({ onSelect, showSelectButton }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const fetchImages = useCallback(async (cursor?: DocumentSnapshot) => {
    if (!db) return;
    try {
      setLoading(true);
      const col = collection(db, "gallery");
      let q;
      if (cursor) {
        q = query(col, orderBy("createdAt", "desc"), startAfter(cursor), limit(PAGE_SIZE));
      } else {
        q = query(col, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      }
      const snapshot = await getDocs(q);
      const newImages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage));
      if (cursor) {
        setImages((prev) => [...prev, ...newImages]);
      } else {
        setImages(newImages);
      }
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setUploading(true);
    try {
      const { url, publicId, size } = await uploadToCloudinary(file);
      if (!db) throw new Error("Database not available");
      await addDoc(collection(db, "gallery"), {
        url,
        publicId,
        filename: file.name,
        size,
        createdAt: new Date().toISOString(),
      });
      toast.success("Image uploaded");
      fetchImages();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm("Delete this image permanently?")) return;
    try {
      if (!db) return;
      await deleteDoc(doc(db, "gallery", image.id));
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      if (selectedImage?.id === image.id) {
        setSelectedImage(null);
        setLightboxOpen(false);
      }
      toast.success("Image deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const loadMore = () => {
    if (lastDoc) fetchImages(lastDoc);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Media Gallery</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="gallery-upload"
          />
          <label htmlFor="gallery-upload">
            <Button asChild loading={uploading} size="sm">
              <span>{uploading ? "Uploading..." : "Upload Image"}</span>
            </Button>
          </label>
        </div>
      </div>

      {loading && images.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">No images uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <Card className="p-1 overflow-hidden">
                <div
                  className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedImage(img);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 flex items-center justify-between">
                  <p className="text-xs text-neutral-500 truncate flex-1 mr-2">{img.filename}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showSelectButton && onSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(img.url);
                        }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(img);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && images.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}

      <Modal open={lightboxOpen} onOpenChange={setLightboxOpen} className="max-w-4xl p-2" showCloseButton={true}>
        {selectedImage && (
          <div className="flex flex-col items-center">
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="max-h-[70vh] rounded-xl object-contain"
            />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">{selectedImage.filename}</p>
              <p className="text-xs text-neutral-500">{formatDate(selectedImage.createdAt)}</p>
              {showSelectButton && onSelect && (
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    onSelect(selectedImage.url);
                    setLightboxOpen(false);
                  }}
                >
                  Use This Image
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
