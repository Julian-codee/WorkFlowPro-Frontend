/** @type {import('next').NextConfig} */

// URL interna del backend de FastAPI. El proxy de desarrollo permite llamar a
// la API desde el navegador sin depender de la configuración CORS del backend.
const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL?.trim() || "http://localhost:8000/api/v1";

const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        // /api/backend/* → backend de FastAPI (/api/v1/*)
        source: "/api/backend/:path*",
        destination: `${backendInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
