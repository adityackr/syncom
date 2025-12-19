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
			{
				protocol: 'https',
				hostname: 'nwv08qvo4i.ufs.sh',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
