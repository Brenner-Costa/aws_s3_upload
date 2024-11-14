'use server'

import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

const client = new S3Client({ region: process.env.AWS_REGION });

async function initiateMultipartUpload(fileName: string) {
    console.log("Iniciando o Multipart")
    const command = new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    });
    const response = await client.send(command);
    console.log(response);
    return { uploadId: response.UploadId, fileKey: fileName };
}

async function uploadPart(uploadId: string, fileKey: string, partNumber: number, body: Buffer) {
    console.log("Iniciando a junção das partes do arquivo")
    const command = new UploadPartCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: body,
    });
    const response = await client.send(command);
    console.log(response);
    return response.ETag;
}

async function completeMultipartUpload(uploadId: string, fileKey: string, parts: { ETag: string, PartNumber: number }[]) {
    console.log("Completando o Multipart")
    const command = new CompleteMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
    });
    console.log(parts)
    return await client.send(command);
}

async function abortMultipartUpload(uploadId: string, fileKey: string) {
    const command = new AbortMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
    });
    await client.send(command);
}


export async function onSubmit(formData: FormData) { 
    const file = formData.get('file') as File;
    const fileKey = uuidv4();

    try {
        // Etapa 1: Iniciar o upload multipart
        const { uploadId }:any = await initiateMultipartUpload(fileKey);
        const partSize = 5 * 1024 * 1024; // Tamanho de cada parte (5 MB)
        const parts:any = [];
        
        // Etapa 2: Carregar partes do arquivo
        for (let partNumber = 1; partNumber <= Math.ceil(file.size / partSize); partNumber++) {
            const start = (partNumber - 1) * partSize;
            const end = Math.min(start + partSize, file.size);
            const partData = file.slice(start, end);
            const arrayBuffer = await partData.arrayBuffer();
            const ETag = await uploadPart(uploadId, fileKey, partNumber, Buffer.from(arrayBuffer));
            parts.push({ ETag, PartNumber: partNumber });
        }

        // Etapa 3: Completar o upload multipart
        await completeMultipartUpload(uploadId, fileKey, parts);
        console.log("Upload multipart concluído!");

        // Gera uma URL pré-assinada para visualizar o arquivo após o upload
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        });
        const viewUrl = await getSignedUrl(client, command);
        
        // Registrar no banco de dados
        const fileName = file.name || 'Aula sem nome';
        const dbResponse = await fetch('http://localhost:3000/api/aula', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: fileName, key: fileKey }),
        });

        if (!dbResponse.ok) {
            console.error("Erro ao salvar a aula no banco de dados");
            return null;
        }

        console.log("Aula registrada no banco de dados com sucesso");
        return viewUrl; // Retorna a URL de visualização para uso no frontend

    } catch (error) {
        console.error("Erro durante o upload multipart:", error);

        // // Em caso de erro, aborta o upload multipart
        // if (uploadId) {
        //     await abortMultipartUpload(uploadId, fileKey);
        //     console.log("Upload multipart abortado com sucesso.");
        // }
        
        return null;
    }
}
