import DetailsNews from "@/components/DetailNews/DetailNews";

export default async function DetailNewsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Detail Berita</h1>
      <DetailsNews id={params.id} />
    </div>
  );
}
