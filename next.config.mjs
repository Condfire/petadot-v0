/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar erros de ESLint e TypeScript durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração mínima para imagens
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Desativar compressão para evitar problemas com Bun
  compress: false,
  // Desativar análise de pacotes para evitar problemas com Bun
  productionBrowserSourceMaps: false,
}

export default nextConfig
