'use server'

import { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { v4 as uuidv4 } from 'uuid'

export async function onSubmit(formaData: FormData) {
    try {
        const client = new S3Client({
            region: process.env.AWS_REGION
        })

        const { url, fields } = await createPresignedPost(client, {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Key: uuidv4(),
        })

        const formDataS3 = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
            formDataS3.append(key, value as string)
        })
        formDataS3.append('file', formaData.get('file') as string)

        console.log(url) 
        console.log(fields)

        const response = await fetch(url, {
            method: 'POST',
            body: formDataS3
        });

        const textResponse = await response.text();
        console.log(textResponse);

        if(response.ok) {
            console.log("Upload feito!")
        } else {
            console.log("falha no upload")
        }

    } catch (error: any) {
        console.error(error);
    }
}