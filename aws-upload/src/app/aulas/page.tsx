'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Aula = {
  id: number;
  nome: string;
};

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchAulas() {
      const response = await fetch('/api/aula');
      const data = await response.json();
      setAulas(data);
    }
    fetchAulas();
  }, []);

  const handleAulaClick = (id: number) => {
    router.push(`/aulas/${id}`);
  };

  return (
    <div>
      <h1>Lista de Aulas</h1>
      <ul>
        {aulas.map((aula) => (
          <li key={aula.id}>
            <button onClick={() => handleAulaClick(aula.id)} className="text-blue-500 underline">
              {aula.nome}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
