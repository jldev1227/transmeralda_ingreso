/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir solicitudes entre subdominios
  // Configura el host personalizado
  experimental: {
    serverActions: true,
  },
  // Configura el host para desarrollo
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
