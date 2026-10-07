// Fork addition (not in upstream): HEIC/HEIF support.
//
// sharp's prebuilt libvips can read the HEIF container but ships without an
// HEVC decoder, so photos saved as HEIC/HEIF (the default camera format on many
// phones) cannot be resized. They are decoded here with libheif (WASM) and the
// temp file is rewritten as a lossless PNG that the rest of the pipeline reads.

import sharp from "sharp";
import * as fs from "fs";
import decode from "heic-decode";

import * as logs from "./logs";

/**
 * Rewrites `localFile` as a PNG if it is an HEVC-encoded HEIF image.
 * The file content is sniffed rather than trusting the object's contentType,
 * because some clients upload HEIF bytes labelled as image/jpeg.
 */
export async function convertHeifToPng(localFile: string): Promise<boolean> {
  let isHevcHeif = false;
  try {
    const { format, compression } = await sharp(localFile).metadata();
    isHevcHeif = format === "heif" && compression === "hevc";
  } catch (err) {
    // Not something sharp recognises; let the normal pipeline report it.
    return false;
  }

  if (!isHevcHeif) {
    return false;
  }

  logs.heifConverting(localFile);
  // libheif applies the image's rotation/mirror transforms while decoding, so
  // the pixels come out upright and no orientation metadata is needed.
  const { width, height, data } = await decode({
    buffer: await fs.promises.readFile(localFile),
  });
  await sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 1 })
    .toFile(localFile);
  logs.heifConverted(localFile);

  return true;
}
