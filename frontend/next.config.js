/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Bagian ini adalah 'jembatan' antara frontend dan backend
  async rewrites() {
    return [
      {
        // Jika browser meminta alamat '/api/...' dari frontend...
        source: '/api/:path*',
        // ...maka Next.js akan secara diam-diam meneruskannya ke backend di port 3001
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
