import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';

export const metadata: Metadata = {
  title: 'Sistema de Gestão de Tarefas',
  description: 'Desafio técnico Full Stack - Hubfy.ai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="corporate">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
