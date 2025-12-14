import { AuthProvider } from '@/components/ui/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/lib/orpc.server';
import { Providers } from '@/lib/providers';
import { ThemeProvider } from '@/lib/theme-provider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Syncom',
	description: 'The AI-ready Home for Team Communication',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AuthProvider>
			<html lang="en" suppressHydrationWarning>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
					suppressHydrationWarning
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Providers>{children}</Providers>
						<Toaster closeButton position="top-center" />
					</ThemeProvider>
				</body>
			</html>
		</AuthProvider>
	);
}
