import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://stc.utdstc.com https://aiazrrsyklzrgjsp.public.blob.vercel-storage.com https://res.cloudinary.com",
  "font-src 'self'",
  "frame-src 'self' https://checkout.paystack.com https://js.paystack.co",
  "connect-src 'self' https://api.paystack.co",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    domains: [
      'stc.utdstc.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aiazrrsyklzrgjsp.public.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CSP,
          },
        ],
      },
    ];
  },
};

export default nextConfig;