'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

interface ExifData {
  Image: {
    Make: string;
    Model: string;
    DateTime: string;
    [key: string]: any;
  };
  Photo: {
    ExposureTime: number;
    FNumber: number;
    ISOSpeedRatings: number;
    DateTimeOriginal: string;
    DateTimeDigitized: string;
    [key: string]: any;
  };
  [key: string]: any;
}
export default function IndexPage() {
  const [dateTaken, setDateTaken] = useState<string>('');
  const [file, setFile] = useState<File>();
  const [exifData, setExifData] = useState<ExifData>({});
  const [updatedExifData, setUpdatedExifData] = useState<ExifData>({});
  const [dateInput, setDateInput] = useState<string>('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const _file = files && files[0];
    if (!_file) return;
    setFile(_file);

    const formData = new FormData();
    formData.append('imageBlob', _file);

    try {
      const response = await fetch('/api/image/metadata/info', { method: 'POST', body: formData });
      if (response.ok) {
        const data: ExifData = await response.json();
        setExifData(data);
      } else {
        console.error('Failed to fetch EXIF data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    const timestamp = new Date(dateInput).getTime() / 1000;
    const formData = new FormData();
    formData.append('imageBlob', file);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch('/api/image/metadata', { method: 'PATCH', body: formData });

      if (response.ok) {
        const { updatedExif, imageBlob } = await response.json();
        const url = URL.createObjectURL(new Blob([imageBlob]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'updated_image.jpg';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        console.error('Failed to update image metadata:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="h-full w-full px-8 pb-8">
      <form onSubmit={(event) => handleSubmit(event)}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} required />
        <button type="submit" disabled={!file}>
          Update Metadata and Download
        </button>
      </form>
      <div>
        <h3>Original EXIF Data:</h3>
        <h4>Image Information:</h4>
        <ul>
          <li>Make: {exifData.Image?.Make}</li>
          <li>Model: {exifData.Image?.Model}</li>
          <li>Date/Time: {exifData.Image?.DateTime}</li>
          {exifData.Image &&
            Object.entries(exifData.Image).map(
              ([key, value]) =>
                key !== 'Make' &&
                key !== 'Model' &&
                key !== 'DateTime' && (
                  <li key={key}>
                    {key}: {JSON.stringify(value)}
                  </li>
                )
            )}
        </ul>
        <h4>Photo Information:</h4>
        <ul>
          <li>Exposure Time: {exifData.Photo?.ExposureTime}</li>
          <li>F-Number: {exifData.Photo?.FNumber}</li>
          <li>ISO Speed Ratings: {exifData.Photo?.ISOSpeedRatings}</li>
          <li>Original Date/Time: {exifData.Photo?.DateTimeOriginal}</li>
          <li>Digitized Date/Time: {exifData.Photo?.DateTimeDigitized}</li>
          {exifData.Photo &&
            Object.entries(exifData.Photo).map(
              ([key, value]) =>
                !['ExposureTime', 'FNumber', 'ISOSpeedRatings', 'DateTimeOriginal', 'DateTimeDigitized'].includes(
                  key
                ) && (
                  <li key={key}>
                    {key}: {JSON.stringify(value)}
                  </li>
                )
            )}
        </ul>
      </div>
      {Object.keys(updatedExifData).length > 0 && (
        <div>
          <h3>Updated EXIF Data:</h3>
          {Object.entries(updatedExifData).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
