"use client";
import { useState } from "react";
import VideoPlayer from "./video";

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("file", file as Blob);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        setPreview(data.url);

        console.log(data)
    };

    const styles = {
        form: 'flex flex-col items-center justify-center h-screen',
        input: 'border p-2 mb-4 w-full',
    };

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className={styles.input}
                />
                <button type="submit">Upload</button>
            </form>

            {preview && (
                <VideoPlayer videoUrl={preview}/>
            )}

        </>

    );
}
