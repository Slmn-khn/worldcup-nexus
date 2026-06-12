// Brand icon generation (Checkpoint 8E — Brand Assets, Favicon, and Social
// Banner). Generates the favicon / PWA / Apple icon variants from the single
// source icon at public/brand/worldcup-nexus-icon.png.
//
// Usage: pnpm assets:icons
//
// Rules:
//   - The source icon is never overwritten.
//   - Only the small, production-needed variant set below is emitted.
//   - favicon.ico is written as a PNG-encoded ICO (valid for modern
//     browsers and Windows) since sharp has no native .ico encoder.

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const BRAND = path.join(PUBLIC, "brand");
const SOURCE = path.join(BRAND, "worldcup-nexus-icon.png");

type Target = { file: string; size: number };

// Square PNG variants. Keep this list small — no dozens of throwaway sizes.
const PNG_TARGETS: Target[] = [
  { file: path.join(PUBLIC, "icon.png"), size: 512 }, // Next icon metadata
  { file: path.join(PUBLIC, "apple-icon.png"), size: 180 }, // iOS touch icon
  { file: path.join(BRAND, "worldcup-nexus-icon-32.png"), size: 32 },
  { file: path.join(BRAND, "worldcup-nexus-icon-192.png"), size: 192 }, // PWA
  { file: path.join(BRAND, "worldcup-nexus-icon-512.png"), size: 512 }, // PWA
];

const FAVICON = path.join(PUBLIC, "favicon.ico");
const FAVICON_SIZE = 32;

// Wrap a 32x32 PNG buffer in a single-image ICO container (PNG-in-ICO).
function buildIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 == 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // image byte size
  entry.writeUInt32LE(header.length + entry.length, 12); // image offset

  return Buffer.concat([header, entry, png]);
}

async function main(): Promise<void> {
  if (!existsSync(SOURCE)) {
    console.error(
      `\nSource icon not found: ${path.relative(ROOT, SOURCE)}\n` +
        "Add the brand icon before running pnpm assets:icons.",
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(BRAND, { recursive: true });

  const generated: string[] = [];

  for (const { file, size } of PNG_TARGETS) {
    await sharp(SOURCE)
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(file);
    generated.push(`${path.relative(ROOT, file)}  (${size}x${size})`);
  }

  const faviconPng = await sharp(SOURCE)
    .resize(FAVICON_SIZE, FAVICON_SIZE, { fit: "cover" })
    .png()
    .toBuffer();
  await writeFile(FAVICON, buildIco(faviconPng, FAVICON_SIZE));
  generated.push(
    `${path.relative(ROOT, FAVICON)}  (${FAVICON_SIZE}x${FAVICON_SIZE} ICO)`,
  );

  console.log("\nWORLDCUP Nexus — brand icon generation\n");
  console.log(`Source: ${path.relative(ROOT, SOURCE)} (unchanged)\n`);
  console.log("Generated:");
  for (const line of generated) console.log(`  ✓ ${line}`);
  console.log(`\n${generated.length} icon variant(s) written.`);
}

main().catch((error) => {
  console.error(
    "\nIcon generation failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
