'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { X } from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
  name: string;
  created_at: string;
}

interface ImageGalleryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

export default function ImageGalleryModal({
  open,
  onClose,
  onSelectImage,
}: ImageGalleryModalProps) {
  const [tab, setTab] = useState('gallery');
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 9;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/galery-news?page=${reset ? 1 : page}&limit=${limit}`);
      if (!res.ok) throw new Error('Respon server tidak valid');

      const data = await res.json();
      const newImages = data.data as GalleryItem[];

      if (reset) {
        setImages(newImages);
        setPage(1);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }

      setHasMore(newImages.length === limit);
    } catch (e) {
      toast.error('Gagal memuat gambar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchImages(true);
    }
  }, [open]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 200 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Ukuran gambar maksimal 200KB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Mengunggah gambar...');
    setLoading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        toast.error('Upload gagal', { id: toastId });
        return;
      }

      toast.success('Berhasil diunggah', { id: toastId });
      setTab('gallery');
      await fetchImages(true);
    } catch (err) {
      toast.error('Error saat upload', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (img: GalleryItem) => {
    const toastId = toast.loading('Menghapus gambar...');
    setLoading(true);

    try {
      const filePath = img.url.split('/mtt-images/')[1];

      const res = await fetch('/api/delete-galery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus gambar');
      }

      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success('Gambar berhasil dihapus', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus gambar', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl left-[calc(50%+170px)] -translate-x-1/2">
        <DialogHeader>
          <DialogTitle>Galeri Gambar</DialogTitle>
          <DialogDescription>Pilih gambar atau unggah yang baru.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} defaultValue="gallery" className="mt-4">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger className="cursor-pointer" value="gallery">
              Galeri
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="upload">
              Tambah Gambar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            {loading && images.length === 0 ? (
              <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[100px] w-full rounded" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="rounded border cursor-pointer hover:ring-2 hover:ring-indigo-400"
                        onClick={() => {
                          onSelectImage(img.url);
                          onClose();
                        }}
                      />
                      <button
                        disabled={loading}
                        className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow hidden group-hover:flex items-center justify-center w-[30px] h-[30px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(img);
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <Button
                      className="cursor-pointer"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      Muat Lebih Banyak
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <div className="flex flex-col items-center justify-center gap-4 mt-6">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleUpload}
              />
              <Button
                className="cursor-pointer"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
              >
                Pilih Gambar
              </Button>
              <p className="text-sm text-muted-foreground">
                Maksimal ukuran gambar 200KB
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
