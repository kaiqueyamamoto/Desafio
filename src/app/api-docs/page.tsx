'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar CSS do Swagger UI estaticamente
import 'swagger-ui-react/swagger-ui.css';

// Importação dinâmica do SwaggerUI para evitar problemas de SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-gray-600">Carregando documentação...</p>
      </div>
    </div>
  ),
});

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar a especificação do Swagger da API
    fetch('/api/swagger.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erro ao carregar documentação');
        }
        return res.json();
      })
      .then((data) => setSpec(data))
      .catch((err) => {
        console.error('Erro ao carregar documentação Swagger:', err);
        setError('Erro ao carregar documentação. Verifique se o servidor está rodando.');
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">Carregando documentação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Documentação da API
          </h1>
          <p className="text-gray-600">
            Documentação interativa da API de Gestão de Tarefas
          </p>
        </div>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
