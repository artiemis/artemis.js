import { fileTypeFromBuffer } from "file-type";

export async function downloadFile(url: string) {
  const res = await fetch(url);
  const data = Buffer.from(await res.arrayBuffer());
  const type = await fileTypeFromBuffer(data);
  return { data, type };
}
