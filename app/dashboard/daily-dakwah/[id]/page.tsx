import DetailDailyDakwah from '@/components/DetailDailyDakwah/DetailDailyDakwah';

export default async function DetailDailyDakwahPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Detail Dakwah Harian</h1>
      <DetailDailyDakwah id={id} />
    </div>
  );
}

