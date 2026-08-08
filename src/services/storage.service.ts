import { isSupabaseEnabled, loadSupabase } from '@/supabase/client';
import { randomId, slugify } from '@/utils/slug';

const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export class UploadError extends Error {}

function validate(file: File): void {
  if (!ACCEPTED.includes(file.type)) {
    throw new UploadError('Formato não aceito. Envie JPG, PNG, WebP ou AVIF.');
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('Imagem acima de 5 MB. Reduza o arquivo e tente de novo.');
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new UploadError('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, folder = 'products'): Promise<string> {
  validate(file);
  if (!isSupabaseEnabled) return readAsDataUrl(file);

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'img';
  const path = `${folder}/${randomId(base)}.${extension}`;
  const client = await loadSupabase();
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new UploadError(error.message);

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImages(files: FileList | File[], folder = 'products'): Promise<string[]> {
  return Promise.all(Array.from(files).map((file) => uploadImage(file, folder)));
}

export async function deleteImage(url: string): Promise<void> {
  if (!isSupabaseEnabled || url.startsWith('data:')) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return;

  const path = decodeURIComponent(url.slice(index + marker.length));
  const client = await loadSupabase();
  const { error } = await client.storage.from(BUCKET).remove([path]);
  if (error) throw new UploadError(error.message);
}
