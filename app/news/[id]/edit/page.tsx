import EditNewsForm from "@/components/EditNewsForm/EditNewsForm";

export default async function EditNewsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Berita</h1>
      <EditNewsForm id={params.id} />
    </div>
  );
}
