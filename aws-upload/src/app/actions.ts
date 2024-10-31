'use server'

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

export async function onSubmit(formData: FormData) {
    try {
        const client = new S3Client({
            region: process.env.AWS_REGION
        });

        // Gera a URL pré-assinada para upload
        const fileKey = uuidv4();
        const { url, fields } = await createPresignedPost(client, {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Key: fileKey,
        });

        console.log(url)

        // Prepara os dados do formulário para o upload
        const formDataS3 = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            formDataS3.append(key, value as string);
        });
        formDataS3.append('file', formData.get('file') as string);

        // Realiza o upload para o S3
        const response = await fetch(url, {
            method: 'POST',
            body: formDataS3
        });

        if (response.ok) {
            console.log("Upload feito!");

            // Gera uma URL pré-assinada para visualizar o arquivo após o upload
            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileKey
            });
            const viewUrl = await getSignedUrl(client, command);

            console.log("URL de visualização pré-assinada:", viewUrl);
            return viewUrl;  // Retorna a URL de visualização para uso no frontend
        } else {
            console.log("Falha no upload");
            return null;
        }

    } catch (error: any) {
        console.error(error);
        return null;
    }
}
