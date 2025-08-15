import EditHomeSlider from '@/components/EditHomeSliderForm/EditHomeSliderForm';

export default async function EditDakwahPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Slider Beranda</h1>
      <EditHomeSlider id={params.id} />
    </div>
  );
}
