'use client'

import { useState } from 'react';
import { onSubmit } from './actions' 
import VideoPlayer from './components/video';

export default function UploadVideoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleUpload = async (formData: FormData) => {
    const url = await onSubmit(formData);
    setVideoUrl(url);
  };

  return (
    <div>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleUpload(formData);
      }}>
        <input type="file" name="file" />
        <button type="submit">Upload</button>
      </form>-
      {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
    </div>
  );
}
