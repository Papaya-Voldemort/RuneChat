export interface UploadedAttachment {
  kind: "text" | "image";
  name: string;
  mimeType: string;
  size: number;
  content?: string;
  url?: string;
}

export async function uploadAttachment(file: File): Promise<UploadedAttachment> {
  const data = new FormData();
  data.set("file", file);

  const response = await fetch("/api/attachments", {
    method: "POST",
    body: data,
  });
  const result = await response.json().catch(() => null) as
    | (UploadedAttachment & { error?: string })
    | null;

  if (!response.ok || !result) {
    throw new Error(result?.error || `Could not read that file (${response.status})`);
  }

  return result;
}
