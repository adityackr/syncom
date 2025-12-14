import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatar.vercel.sh',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'avatar.vercel.sh',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'github.com',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
