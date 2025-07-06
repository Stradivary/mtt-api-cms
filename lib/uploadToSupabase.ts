export async function uploadToSupabase(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      throw new Error(json.error || 'Gagal upload');
    }
    return json.path;
  } catch (err) {
    console.error('RESPON BUKAN JSON:', text);
    throw new Error('Respon tidak valid JSON: ' + text.slice(0, 100));
  }
}
