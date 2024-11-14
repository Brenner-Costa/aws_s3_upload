import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const aula = await prisma.aula.findUnique({
            where: { id: id },
        });

        if (!aula) {
            return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
        }

        // Gerar URL pré-assinada da AWS
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: aula.key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log(url)

        return NextResponse.json({ ...aula, url }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar aula' }, { status: 500 });
    }
}
