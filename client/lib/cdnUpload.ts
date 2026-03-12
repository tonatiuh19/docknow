const CDN_BASE = "https://disruptinglabs.com/data/api";
const UPLOAD_URL = `${CDN_BASE}/uploadImages.php`;
const MAIN_FOLDER = "docknow";

/**
 * Uploads a boat photo to the Disrupting Labs CDN and returns the public URL.
 */
export async function uploadBoatPhoto(
  file: File,
  boatId: number | "temp",
): Promise<string> {
  const formData = new FormData();
  formData.append("main_folder", MAIN_FOLDER);
  formData.append("id", `boat-${boatId}`);
  formData.append("main_image", file);

  const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });

  if (!res.ok) {
    throw new Error(`CDN request failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data.success || !data.main_image) {
    throw new Error("CDN upload failed: " + (data.error ?? "unknown error"));
  }

  return CDN_BASE + data.main_image.path;
}
