import { fileTypeFromBuffer } from "file-type";
import ky from "ky";
import { FAKE_USER_AGENT } from "./constants";

export async function downloadFile(url: string) {
  const res = await ky.get(url, { headers: { "User-Agent": FAKE_USER_AGENT } });
  const data = Buffer.from(await res.arrayBuffer());
  const type = await fileTypeFromBuffer(data);
  return { data, type };
}
