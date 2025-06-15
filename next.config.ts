import type { NextConfig } from "next";

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
};

export default nextConfig;
