"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CheckoutNotice } from "@/components/CheckoutNotice";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type PreviewBackground = "checkerboard" | "white" | "black";

type Props = {
  mode: string;
  previewHint: string;
};

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function track(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("clearpng:analytics", {
      detail: { eventName, ...payload },
    }),
  );
}

export function BackgroundRemover({ mode, previewHint }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewBackground, setPreviewBackground] =
    useState<PreviewBackground>("checkerboard");

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  function resetResult() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultUrl(null);
    setResultBlob(null);
  }

  function validate(nextFile: File) {
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      return "Please upload a JPG, PNG, or WebP image.";
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      return `Image is too large. Please upload an image under 5MB. This file is ${formatBytes(nextFile.size)}.`;
    }

    return null;
  }

  function chooseFile(nextFile: File | undefined) {
    if (!nextFile) return;

    const validationError = validate(nextFile);
    setError(validationError);
    resetResult();

    if (validationError) {
      track("upload_failed_validation", {
        reason: validationError,
        size: nextFile.size,
        type: nextFile.type,
      });
      return;
    }

    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }

    setFile(nextFile);
    setOriginalUrl(URL.createObjectURL(nextFile));
    track("upload_validated", {
      size: nextFile.size,
      type: nextFile.type,
      mode,
    });
  }

  async function removeBackground() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    resetResult();
    track("remove_bg_clicked", { mode });

    const formData = new FormData();
    formData.append("image_file", file);

    try {
      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "Background removal failed.");
        }
        throw new Error("Background removal failed. Please try again.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      track("remove_bg_success", { mode, size: blob.size });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Network failed. Please check your connection and retry.";
      setError(message);
      track("remove_bg_failed", { mode, message });
    } finally {
      setIsProcessing(false);
    }
  }

  function download() {
    if (!resultBlob || !resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "clearpng-result.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    track("download_clicked", { mode, size: resultBlob.size });
  }

  const previewClass =
    previewBackground === "checkerboard"
      ? "checkerboard"
      : previewBackground === "black"
        ? "bg-slate-950"
        : "bg-white";

  return (
    <section id="tool" className="tool-shell">
      <CheckoutNotice />
      <div className="tool-panel">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
              {mode}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              Upload, preview, download
            </h2>
            <p className="mt-1 text-sm text-slate-600">{previewHint}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            JPG, PNG, WebP up to 5MB
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
            <button
              type="button"
              className={`upload-zone ${isDragging ? "upload-zone-active" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                track("upload_started", { mode, source: "drop" });
                chooseFile(event.dataTransfer.files[0]);
              }}
            >
              <UploadCloud className="h-10 w-10 text-ocean" aria-hidden />
              <span className="mt-4 text-base font-semibold text-ink">
                Drop an image here or click to upload
              </span>
              <span className="mt-2 text-sm text-slate-500">
                Your file is processed for this request only.
              </span>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                track("upload_started", { mode, source: "picker" });
                chooseFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />

            {file ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <ImageIcon className="mt-0.5 h-5 w-5 text-mint" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {file.type.replace("image/", "").toUpperCase()} ·{" "}
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    title="Choose another image"
                    aria-label="Choose another image"
                    onClick={() => inputRef.current?.click()}
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 flex gap-3 rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-red-900">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden />
                <p>{error}</p>
              </div>
            ) : null}

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              disabled={!file || isProcessing}
              onClick={removeBackground}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              )}
              {isProcessing ? "Removing background..." : "Remove Background"}
            </button>
          </div>

          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">Result preview</p>
              <div className="segmented" aria-label="Preview background">
                {(["checkerboard", "white", "black"] as PreviewBackground[]).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      className={previewBackground === item ? "active" : ""}
                      onClick={() => setPreviewBackground(item)}
                    >
                      {item === "checkerboard" ? "Grid" : item}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PreviewBox label="Original" imageUrl={originalUrl} />
              <PreviewBox
                label="Transparent PNG"
                imageUrl={resultUrl}
                className={previewClass}
                placeholder={
                  isProcessing
                    ? "Processing..."
                    : "Your transparent result will appear here."
                }
              />
            </div>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!resultUrl}
              onClick={download}
            >
              <Download className="h-5 w-5" aria-hidden />
              Download transparent PNG
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewBox({
  label,
  imageUrl,
  className = "bg-white",
  placeholder = "Upload an image to preview.",
}: {
  label: string;
  imageUrl: string | null;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div
        className={`flex aspect-[4/3] items-center justify-center p-3 ${className}`}
      >
        {imageUrl ? (
          // Plain img keeps object URLs simple and avoids remote image config.
          <img
            src={imageUrl}
            alt={`${label} preview`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <p className="max-w-48 text-center text-sm text-slate-500">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}
