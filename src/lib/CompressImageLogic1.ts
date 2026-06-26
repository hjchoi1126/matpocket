const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const OUTPUT_MIME = "image/jpeg";
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.08;

function LoadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };

    image.src = url;
  });
}

function CanvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, OUTPUT_MIME, quality);
  });
}

function BuildCompressedFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "photo";
  return `${baseName}.jpg`;
}

async function CompressImageToTargetSize(
  image: HTMLImageElement,
  fileName: string,
): Promise<File> {
  let scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(image.width, image.height, 1),
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas_unavailable");
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let quality = 0.88;

    while (quality >= MIN_QUALITY) {
      const blob = await CanvasToBlob(canvas, quality);

      if (!blob) {
        break;
      }

      if (blob.size <= MAX_OUTPUT_BYTES) {
        return new File([blob], BuildCompressedFileName(fileName), {
          type: OUTPUT_MIME,
          lastModified: Date.now(),
        });
      }

      quality -= QUALITY_STEP;
    }

    scale *= 0.82;
  }

  throw new Error("compress_failed");
}

export async function CompressImageLogic1(file: File): Promise<File> {
  if (file.size <= MAX_OUTPUT_BYTES) {
    return file;
  }

  const image = await LoadImageFromFile(file);
  return CompressImageToTargetSize(image, file.name);
}
