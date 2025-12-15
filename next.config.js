/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'swagger-ui-react',
    'swagger-client',
    'react-syntax-highlighter',
  ],
};

module.exports = nextConfig;
