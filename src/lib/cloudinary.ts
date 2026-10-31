/**
 * Cloudinary Image Upload Helper
 *
 * Uploads images securely to Cloudinary via our internal /api/upload endpoint
 * using the configured Cloudinary credentials (cloud name: vujf5uxx).
 */

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to upload image to Cloudinary",
      };
    }

    return {
      success: true,
      url: data.url,
      public_id: data.public_id,
    };
  } catch (err: any) {
    console.error("Cloudinary upload client error:", err);
    return {
      success: false,
      error: err?.message || "Network error while uploading image.",
    };
  }
}
