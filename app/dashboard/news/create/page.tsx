import AddNewsForm from "@/components/AddNewsForm/AddNewsForm";

export default function CreateNewsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tambah Berita Baru</h1>
      <AddNewsForm />
    </div>
  );
}
