'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Exif } from 'exif-reader';

export default function IndexPage() {
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [exifList, setExifList] = useState<Array<Exif>>([]);
  const [dateInput, setDateInput] = useState<string>('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const { files } = event.target;
    const file = files && files[0];
    if (!file) return;
    fileList[index] = file;
    setFileList([...fileList]);

    const formData = new FormData();
    formData.append('imageBlob', file);

    try {
      const response = await fetch('/api/image/metadata/info', { method: 'POST', body: formData });
      if (response.ok) {
        const exif: Exif = await response.json();
        exifList[index] = exif;
        setExifList([...exifList]);
      } else {
        console.error('Failed to fetch EXIF data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fileList || !exifList) return;

    const formData = new FormData();
    formData.append(`length`, String(fileList.length));
    fileList.forEach((file, index) => formData.append(`imageBlob${index}`, file));
    exifList.forEach((exif, index) => {
      if (!exif) return;

      const Image = exif.Image;
      debugger;
      // && exif.Image.map((item) => { });
      const Photo = exif.Photo;

      const sharpData = {
        IFD0: { ...Image },
        IFD2: { ...Photo },
      };
      formData.append(`exif${index}`, JSON.stringify(sharpData));
    });

    try {
      const response = await fetch('/api/image/metadata', { method: 'PUT', body: formData });

      if (response.ok) {
        const { updatedExif, imageBlob } = await response.json();
        const byteArray = Buffer.from(imageBlob, 'base64');
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'updated_image.png';
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

  const ExifDisplay = ({ data, depth = 0 }: { data: any; depth?: number }) => {
    if (typeof data !== 'object' || data === null || !data) JSON.stringify(data);
    const makeChildren = (value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        return <ExifDisplay data={value} depth={depth + 1} />;
      } else {
        return JSON.stringify(value);
      }
    };
    return (
      <ul className={`${depth > 0 ? 'ml-4' : ''}`}>
        {data &&
          Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong>
              {makeChildren(value)}
            </li>
          ))}
      </ul>
    );
  };

  return (
    <div className="h-full w-full px-8 pb-8">
      <form onSubmit={(event) => handleSubmit(event)}>
        <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 0)} />
        <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 1)} />

        <input type="date" value={dateInput} onChange={(event) => setDateInput(event.target.value)} />
        <button type="submit" disabled={!fileList}>
          Update Metadata and Download
        </button>
      </form>
      <div>
        <h3>Original EXIF Data:</h3>
        {exifList && <ExifDisplay data={exifList[0]} />}
      </div>
    </div>
  );
}
