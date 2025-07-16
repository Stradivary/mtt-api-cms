import EditDakwahForm from '@/components/EditDakwahForm/EditDakwahForm';

export default async function EditDakwahPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Dakwah Harian</h1>
      <EditDakwahForm id={params.id} />
    </div>
  );
}
