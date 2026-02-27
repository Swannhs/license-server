'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, KeyRound, Copy, Check, Users, ShieldCheck } from 'lucide-react';

interface License {
    id: string;
    username: string;
    key: string;
}

export default function AdminPage() {
    const [username, setUsername] = useState('');
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const fetchLicenses = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/licenses');
            if (res.ok) {
                const data = await res.json();
                setLicenses(data);
            }
        } catch (error) {
            console.error('Failed to fetch licenses', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const generateLicense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        try {
            setGenerating(true);
            const key = uuidv4().toUpperCase();

            const res = await fetch('/api/license', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), key }),
            });

            if (res.ok) {
                setUsername('');
                fetchLicenses();
            } else {
                const data = await res.json();
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to generate license', error);
        } finally {
            setGenerating(false);
        }
    };

    const deleteLicense = async (id: string) => {
        if (!confirm('Are you sure you want to delete this license?')) return;

        try {
            const res = await fetch(`/api/licenses/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchLicenses();
            }
        } catch (error) {
            console.error('Failed to delete license', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-indigo-500/30">
            <div className="max-w-5xl mx-auto space-y-12 mt-10">

                {/* Header */}
                <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">License Manager</h1>
                            <p className="text-neutral-400 mt-1">Generate and manage API licenses</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1 border border-neutral-800 bg-neutral-900/50 rounded-2xl p-6 h-fit backdrop-blur-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-indigo-400" />
                            New License
                        </h2>

                        <form onSubmit={generateLicense} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Client Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter unique username..."
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={generating || !username.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {generating ? 'Generating...' : 'Generate Key'}
                            </button>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2 px-1">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Active Licenses
                                <span className="ml-2 py-0.5 px-2.5 rounded-full bg-neutral-800 text-xs font-medium text-neutral-300">
                                    {licenses.length}
                                </span>
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20 border border-neutral-800 bg-neutral-900/30 rounded-2xl">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : licenses.length === 0 ? (
                            <div className="border border-dashed border-neutral-800 rounded-2xl p-16 text-center bg-neutral-900/20">
                                <KeyRound className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-neutral-300">No licenses found</h3>
                                <p className="text-neutral-500 mt-1">Generate your first license key to get started.</p>
                            </div>
                        ) : (
                            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-xl max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm z-10 hidden sm:table-header-group">
                                        <tr className="border-b border-neutral-800">
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">Username</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">License Key</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/60">
                                        {licenses.map((license) => (
                                            <tr key={license.id} className="hover:bg-neutral-800/30 transition-colors group flex flex-col sm:table-row p-4 sm:p-0">
                                                <td className="py-2 sm:py-4 px-2 sm:px-6 font-medium text-white break-all sm:break-normal">
                                                    <span className="text-xs uppercase text-neutral-500 sm:hidden block mb-1">Username</span>
                                                    {license.username}
                                                </td>
                                                <td className="py-2 sm:py-4 px-2 sm:px-6">
                                                    <span className="text-xs uppercase text-neutral-500 sm:hidden block mb-1">License Key</span>
                                                    <div className="flex items-center gap-3 w-fit">
                                                        <code className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg break-all">
                                                            {license.key}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(license.key)}
                                                            className="text-neutral-500 hover:text-white transition-colors cursor-pointer shrink-0"
                                                            title="Copy Key"
                                                        >
                                                            {copiedKey === license.key ?
                                                                <Check className="w-4 h-4 text-emerald-500" /> :
                                                                <Copy className="w-4 h-4" />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-2 sm:py-4 px-2 sm:px-6 sm:text-right mt-2 sm:mt-0">
                                                    <span className="text-xs uppercase text-neutral-500 sm:hidden block mb-1">Actions</span>
                                                    <button
                                                        onClick={() => deleteLicense(license.id)}
                                                        className="text-neutral-500 hover:text-red-400 transition-colors sm:p-2 rounded-lg hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer flex items-center gap-2 sm:inline-flex"
                                                        title="Revoke License"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="sm:hidden text-sm">Revoke</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
