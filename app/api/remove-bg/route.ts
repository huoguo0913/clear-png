export const runtime = "edge";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function jsonError(message: string, status = 400) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    return jsonError(
      "Background removal is not configured yet. Please set REMOVE_BG_API_KEY.",
      503,
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid upload. Please send multipart/form-data.");
  }

  const image = formData.get("image_file");

  if (!(image instanceof File)) {
    return jsonError("Please upload an image using the image_file field.");
  }

  if (image.size > MAX_FILE_SIZE) {
    return jsonError("Image is too large. Please upload an image under 5MB.");
  }

  if (!ACCEPTED_TYPES.has(image.type)) {
    return jsonError("Unsupported file type. Please upload JPG, PNG, or WebP.");
  }

  const removeBgForm = new FormData();
  removeBgForm.append("image_file", image, image.name || "upload");
  removeBgForm.append("size", "auto");

  const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: removeBgForm,
  });

  if (!removeBgResponse.ok) {
    if (removeBgResponse.status === 402 || removeBgResponse.status === 429) {
      return jsonError("Service is busy. Please try again later.", 503);
    }

    return jsonError(
      "Background removal failed. Please try another image or retry.",
      502,
    );
  }

  return new Response(removeBgResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
