'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, KeyRound, Copy, Check, Users, ShieldCheck, Clock, LogOut, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface License {
    id: string;
    username: string;
    key: string;
    createdAt?: string;
    expiresAt?: string | null;
    allowedDomain?: string | null;
}

export default function AdminPage() {
    const [username, setUsername] = useState('');
    const [duration, setDuration] = useState('lifetime');
    const [allowedDomain, setAllowedDomain] = useState('');
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const router = useRouter();

    // Edit Modal State
    const [editingLicense, setEditingLicense] = useState<License | null>(null);
    const [editExpiryDate, setEditExpiryDate] = useState('');
    const [editDomain, setEditDomain] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    const fetchLicenses = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/licenses');
            if (res.ok) {
                const data = await res.json();
                setLicenses(data);
            } else if (res.status === 401) {
                router.push('/login');
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
                body: JSON.stringify({ username: username.trim(), key, duration, allowedDomain: allowedDomain.trim() }),
            });

            if (res.ok) {
                setUsername('');
                setDuration('lifetime');
                setAllowedDomain('');
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

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLicense) return;

        try {
            setSavingEdit(true);

            // Format dates
            let payloadExpiresAt: string | null = null;
            if (editExpiryDate) {
                // If they picked a date
                payloadExpiresAt = new Date(editExpiryDate).toISOString();
            }

            const payloadDomain = editDomain.trim() === '' ? null : editDomain.trim();

            const res = await fetch(`/api/licenses/${editingLicense.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expiresAt: payloadExpiresAt, allowedDomain: payloadDomain }),
            });

            if (res.ok) {
                setEditingLicense(null);
                fetchLicenses();
            } else {
                const data = await res.json();
                alert('Error updating: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to edit license', error);
        } finally {
            setSavingEdit(false);
        }
    };

    const openEditModal = (license: License) => {
        setEditingLicense(license);
        // Pre-fill existing logic
        if (license.expiresAt) {
            const iso = new Date(license.expiresAt).toISOString();
            // html datetime-local needs YYYY-MM-DDThh:mm format
            setEditExpiryDate(iso.slice(0, 16));
        } else {
            setEditExpiryDate('');
        }
        setEditDomain(license.allowedDomain || '');
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const isExpired = (expiresAt?: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto space-y-12 mt-10">

                {/* Header */}
                <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">License Manager</h1>
                            <p className="text-neutral-400 mt-1">Generate and manage API licenses securely</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-4 py-2 rounded-lg transition-colors border border-neutral-800 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Allowed Domains (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={allowedDomain}
                                        onChange={(e) => setAllowedDomain(e.target.value)}
                                        placeholder="e.g. yoursite.com, admin.site.com"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                                <p className="text-[10px] text-neutral-500 ml-1">Comma separate domains to allow multiple. E.g: google.com, apple.com</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">License Expiration</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-neutral-200 appearance-none"
                                    >
                                        <option value="1">1 Month</option>
                                        <option value="3">3 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="12">1 Year</option>
                                        <option value="lifetime">Lifetime (No Expiry)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={generating || !username.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">Status</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">Identity</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">License Key</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/60">
                                        {licenses.map((license) => {
                                            const expired = isExpired(license.expiresAt);
                                            return (
                                                <tr key={license.id} className="hover:bg-neutral-800/30 transition-colors group flex flex-col sm:table-row p-4 sm:p-0">
                                                    <td className="py-2 sm:py-4 px-2 sm:px-6 align-top pt-5">
                                                        <span className="text-xs uppercase text-neutral-500 sm:hidden block mb-1">Status</span>
                                                        {expired ?
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Expired</span> :
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                                                        }
                                                    </td>
                                                    <td className="py-2 sm:py-4 px-2 sm:px-6 font-medium text-white break-all sm:break-normal align-top sm:pt-4">
                                                        <span className="text-xs uppercase text-neutral-500 sm:hidden block mb-1">Identity</span>
                                                        <div>{license.username}</div>
                                                        {license.expiresAt && (
                                                            <div className="text-[10px] text-neutral-500 font-normal mt-1 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Exp: {new Date(license.expiresAt).toLocaleString()}
                                                            </div>
                                                        )}
                                                        {license.allowedDomain && (
                                                            <div className="text-[10px] text-indigo-400/80 font-normal mt-1 leading-tight flex items-start gap-1">
                                                                <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
                                                                <span>{license.allowedDomain.split(',').join(', ')}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 sm:py-4 px-2 sm:px-6 align-top sm:pt-4">
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
                                                    <td className="py-2 sm:py-4 px-2 sm:px-6 sm:text-right mt-2 sm:mt-0 align-top sm:pt-3">
                                                        <span className="text-xs uppercase text-neutral-500 sm:hidden block mb-1">Actions</span>
                                                        <div className="flex items-center sm:justify-end gap-1">
                                                            <button
                                                                onClick={() => openEditModal(license)}
                                                                className="text-neutral-500 hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-indigo-500/10 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer flex items-center gap-2"
                                                                title="Edit Configuration"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                <span className="sm:hidden text-sm">Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteLicense(license.id)}
                                                                className="text-neutral-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer flex items-center gap-2"
                                                                title="Revoke License"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span className="sm:hidden text-sm">Revoke</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal Layout Overlay */}
            {editingLicense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Edit License</h3>
                            <button
                                onClick={() => setEditingLicense(null)}
                                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSave} className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-neutral-400 mb-1 block">Username Target</label>
                                <div className="text-white bg-neutral-800/50 px-4 py-3 rounded-xl border border-neutral-800 text-sm font-medium opacity-70">
                                    {editingLicense.username}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Update Allowed Domains</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={editDomain}
                                        onChange={(e) => setEditDomain(e.target.value)}
                                        placeholder="Comma-separated domains (blank for all)"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Update Expiration Date</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={editExpiryDate}
                                        onChange={(e) => setEditExpiryDate(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-neutral-200 block"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs mt-1 px-1">
                                    <span className="text-neutral-500">Leave empty for lifetime access</span>
                                    {editExpiryDate && (
                                        <button
                                            type="button"
                                            onClick={() => setEditExpiryDate('')}
                                            className="text-red-400 hover:text-red-300 font-medium cursor-pointer"
                                        >
                                            Clear Expiry
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingLicense(null)}
                                    className="flex-1 px-4 py-3 border border-neutral-700 hover:bg-neutral-800 text-white font-medium rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
