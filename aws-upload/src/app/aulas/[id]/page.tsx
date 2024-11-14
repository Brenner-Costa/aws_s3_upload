'use client';

import { useEffect, useState } from 'react';

type Aula = {
  nome: string;
  url: string;
};

export default function AulaPage({ params }: { params: { id: string } }) {
  const [aula, setAula] = useState<Aula | null>(null);

  useEffect(() => {
    async function fetchAula() {
      const response = await fetch(`/api/aula/${params.id}`);
      const data = await response.json();
      setAula(data);
    }
    fetchAula();
  }, [params.id]);

  return (
    <div>
      {aula ? (
        <>
          <h1>{aula.nome}</h1>
          <video width="50%" controls>
            <source src={aula.url} type="video/mp4" />
            Seu navegador não suporta a reprodução deste vídeo.
          </video>
        </>
      ) : (
        <p>Carregando aula...</p>
      )}
    </div>
  );
}
