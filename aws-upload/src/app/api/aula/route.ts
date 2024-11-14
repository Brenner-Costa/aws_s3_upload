import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
    const { nome, key } = await req.json();

    if (!nome || !key) {
        return NextResponse.json({ error: 'Nome e key são obrigatórios' }, { status: 400 });
    }

    try {
        const aula = await prisma.aula.create({
            data: {
                name: nome,
                key: key
            },
        })
        return NextResponse.json(aula, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const aulas = await prisma.aula.findMany();
        return NextResponse.json(aulas, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar aulas' }, { status: 500 });
    }
}
