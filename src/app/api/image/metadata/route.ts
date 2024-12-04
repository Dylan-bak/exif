import { NextResponse } from 'next/server';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp, { type Sharp } from 'sharp';
import { promises as fs } from 'fs';

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const imageBlobList = [];
    const exifFromReaderList = [];
    const sharpList: Sharp[] = [];
    const metaDataList = [];

    for (let i = 0; i < Number(formData.get('length')); i++) {
      const imageBlob = formData.get(`imageBlob${i}`) as Blob | null;
      const exifSerialize = formData.get(`exif${i}`) as string | null;
      const exifJson = JSON.parse(exifSerialize || '{}');
      const sharpExifFromExifReader = convertExifReaderToShapExif(exifJson);

      imageBlobList[i] = imageBlob;
      exifFromReaderList[i] = sharpExifFromExifReader;

      function convertExifReaderToShapExif(obj: any): any {
        for (const key in obj) {
          const objValue = obj[key];
          if (typeof objValue === 'number') {
            obj[key] = String(objValue);
          } else if (Array.isArray(objValue)) {
            obj[key] = objValue.map((charCode: string) => String.fromCharCode(Number(charCode))).join('');
          } else if (typeof objValue === 'object' && objValue !== null) {
            if (objValue.type == 'Buffer' && Array.isArray(objValue.data)) {
              obj[key] = objValue.data.map((charCode: string) => String.fromCharCode(Number(charCode))).join('');
            } else {
              convertExifReaderToShapExif(obj[key]);
            }
          }
        }
        return obj;
      }
    }

    if (!imageBlobList.length && !exifFromReaderList.length)
      return NextResponse.json({ message: 'Invalid request format' }, { status: 400 });

    for (let index = 0; index < imageBlobList.length; index++) {
      const imageBlob = imageBlobList[index];
      if (!imageBlob) continue;

      const arrayBuffer = await imageBlob.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);
      const inputSharp = sharp(inputBuffer);
      const metadata = await inputSharp.metadata();

      sharpList[index] = inputSharp;
      metaDataList[index] = metadata;
    }

    const sharpData0 = sharpList[0];
    const sharpData1 = sharpList[1];
    const { LensSpecification, RecommendedExposureIndex, ...IFD2 } = exifFromReaderList[1].IFD2;
    // const lensSpecification = LensSpecification.map((value: string) => `${value}`).join(' ');
    // const recommendedExposureIndex = RecommendedExposureIndex.split('').map((char: string) => char.charCodeAt(0));

    const updatedBuffer = await sharpData0
      ?.withMetadata({ density: 320, orientation: 1 })
      .withIccProfile('srgb')
      .withExifMerge({
        IFD0: {
          ...exifFromReaderList[1].IFD0,
          DateTime: '2024:10:08 14:39:05',
        },
        IFD2: {
          ...IFD2,
          DateTimeOriginal: '2024:10:06 17:13:47',
          DateTimeDigitized: '2024:10:06 17:13:47',
        },
      })
      .toFormat('png', { quality: 100 })
      .toBuffer();

    const base64Image = updatedBuffer?.toString('base64');

    return NextResponse.json(
      { updatedExif: {}, imageBlob: base64Image },
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('Error processing image:', err);
    return NextResponse.json({ message: `Failed to update image: ${err}` }, { status: 500 });
  }
}
