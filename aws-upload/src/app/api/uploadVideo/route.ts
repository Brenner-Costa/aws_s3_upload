import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const fileKey = req.query.key as string;  // Espera que o cliente forneça a chave do arquivo

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        });

        // Define o tempo de expiração conforme necessário (em segundos)
        const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });  // Expira em 1 hora

        res.status(200).json({ url: signedUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar URL pré-assinada' });
    }
}
