import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, "../public/icons");

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#FF6B6B"/>
  <circle cx="256" cy="256" r="148" fill="#FFFFFF" fill-opacity="0.18"/>
  <path
    d="M196 156v132c0 18 14 32 32 32h8c18 0 32-14 32-32V156"
    stroke="#FFFFFF"
    stroke-width="24"
    stroke-linecap="round"
  />
  <path
    d="M212 156V132c0-12 10-22 22-22s22 10 22 22v24M244 156V132c0-12 10-22 22-22s22 10 22 22v24"
    stroke="#FFFFFF"
    stroke-width="16"
    stroke-linecap="round"
  />
  <path
    d="M316 156v176c0 12-10 22-22 22h-4"
    stroke="#FFFFFF"
    stroke-width="24"
    stroke-linecap="round"
  />
  <path
    d="M316 156c28 0 44 24 44 52s-16 52-44 52"
    stroke="#FFFFFF"
    stroke-width="24"
    stroke-linecap="round"
  />
</svg>`;

async function GeneratePwaIcons() {
  await mkdir(iconsDir, { recursive: true });
  const svgBuffer = Buffer.from(ICON_SVG);

  await sharp(svgBuffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(iconsDir, "icon-512x512.png"));

  await sharp(svgBuffer)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(iconsDir, "icon-192x192.png"));

  await writeFile(path.join(iconsDir, "icon-512x512.svg"), ICON_SVG, "utf8");
  await writeFile(
    path.join(iconsDir, "icon-192x192.svg"),
    ICON_SVG.replace('viewBox="0 0 512 512"', 'viewBox="0 0 512 512"'),
    "utf8",
  );
}

await GeneratePwaIcons();
