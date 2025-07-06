import EditNewsForm from "@/components/EditNewsForm/EditNewsForm";

interface EditPageProps {
  params: { id: string };
}

export default async function EditNewsPage({ params }: EditPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Berita</h1>
      <EditNewsForm id={id} />
    </div>
  );
}
