'use client';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-neutral-950 text-neutral-100">
            <main className="flex flex-col gap-8 row-start-2 items-center text-center">
                <ShieldCheck className="w-20 h-20 text-indigo-500" />
                <h1 className="text-4xl font-bold tracking-tight">License Server API</h1>
                <p className="text-neutral-400 max-w-md">
                    A secure, fast, and easy-to-use API for generating and validating software licenses.
                </p>
                <Link
                    href="/admin"
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-500 text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 mt-4"
                >
                    Open Admin Panel
                </Link>
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-neutral-500">
                <p>© {new Date().getFullYear()} License Server. Secure your software.</p>
            </footer>
        </div>
    );
}
