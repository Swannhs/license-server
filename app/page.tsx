'use client';
import LicenseForm from '@/components/LicenseForm';

export default function Home() {
    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">License Management</h1>
            <LicenseForm />
        </main>
    );
}
