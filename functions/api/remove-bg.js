import { getCurrentUser } from "../_shared/auth.js";
import { consumeCredit, getCreditSummary } from "../_shared/credits.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function jsonError(message, status = 400) {
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

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.REMOVE_BG_API_KEY;
  const db = env.CLEARPNG_DB;

  if (!apiKey) {
    return jsonError(
      "Background removal is not configured yet. Please set REMOVE_BG_API_KEY.",
      503,
    );
  }

  if (!db) {
    return jsonError("Credits are not configured yet. Please try again later.", 503);
  }

  const user = await getCurrentUser(request, db);

  if (!user) {
    return jsonError("Please sign in to use your monthly image credits.", 401);
  }

  const credits = await getCreditSummary(db, user.id);

  if (credits.remaining < 1) {
    return jsonError(
      "You have used all monthly image credits. Please upgrade on the pricing page.",
      402,
    );
  }

  let formData;

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

  const credit = await consumeCredit(db, user.id, request);

  if (!credit.ok) {
    return jsonError(
      "You have used all monthly image credits. Please upgrade on the pricing page.",
      402,
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

export function onRequest() {
  return jsonError("Method not allowed.", 405);
}
