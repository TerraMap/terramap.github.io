export const LOCAL_SERVER = 'http://localhost:17385';

export async function downloadFile(path: string, name: string): Promise<File> {
  const res = await fetch(`${LOCAL_SERVER}/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to download ${name}`);
  const blob = await res.blob();
  return new File([blob], name);
}
