import DetailHomeSlider from '@/components/DetailHomeSlider/DetailHomeSlider';

export default async function DetailDailyDakwahPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Detail Slider Beranda</h1>
      <DetailHomeSlider id={id} />
    </div>
  );
}

