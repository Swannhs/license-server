'use client';
import { useState } from 'react';

const LicenseForm = () => {
    const [username, setUsername] = useState('');
    const [key, setKey] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/license', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, key }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`License added successfully! ID: ${data.id}`);
                setUsername('');
                setKey('');
            } else {
                const error = await response.json();
                setMessage(`Error: ${error.error}`);
            }
        } catch (error) {
            setMessage('Failed to connect to the server.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto p-4 border rounded shadow-md">
            <h2 className="text-xl font-bold">Add License</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border rounded"
                required
            />
            <input
                type="text"
                placeholder="License Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="p-2 border rounded"
                required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Add License
            </button>
            {message && <p className="mt-2 text-sm">{message}</p>}
        </form>
    );
};

export default LicenseForm;
