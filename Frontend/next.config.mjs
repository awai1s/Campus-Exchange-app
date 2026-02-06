// next.config.mjs
import withPWAInit from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // keep your Unsplash rule
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },

      // FastAPI host that serves /uploads/*
      { protocol: 'https', hostname: 'campus-exchange-fastapi-production.up.railway.app' },

      // Your S3 bucket host that the API now returns
      { protocol: 'https', hostname: 'campus-exchange-bucket-2025.s3.eu-north-1.amazonaws.com' },
      // If you ever return the generic regional host, allow it too:
      { protocol: 'https', hostname: 's3.eu-north-1.amazonaws.com' },
    ],
  },

  async rewrites() {
    return [
      // // keep your API proxy
      // {
      //   source: '/api/v1/:path*',
      //   destination:
      //     'https://campus-exchange-fastapi-production.up.railway.app/api/v1/:path*',
      // },
      // (optional) let the browser request /uploads/* through Next, then rewrite to backend
      {
        source: '/uploads/:path*',
        destination:
          'https://campus-exchange-fastapi-production.up.railway.app/uploads/:path*',
      },
    ]
  },
}

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

export default withPWA(nextConfig)
