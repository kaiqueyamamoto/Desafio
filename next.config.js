/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'swagger-ui-react',
    'swagger-client',
    'react-syntax-highlighter',
  ],
  // Habilitar output standalone para Docker
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
};

module.exports = nextConfig;
