import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader, FileCode } from 'lucide-react';

export default function Settings() {
    const [masterPrompt, setMasterPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMasterPrompt();
    }, []);

    const fetchMasterPrompt = async () => {
        try {
            const response = await axios.get('/api/settings/master_prompt');
            setMasterPrompt(response.data.value || '');
            setLoading(false);
        } catch (err) {
            console.error('Error fetching master prompt:', err);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await axios.put('/api/settings/master_prompt', { value: masterPrompt });
            setMessage('Master prompt saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error saving: ' + err.message);
        }
        setSaving(false);
    };

    if (loading) return <div className="loading">Loading settings...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '8px' }}>Settings</h1>
            <p className="text-secondary mb-4">Configure global content generation settings</p>

            <div className="card" style={{ maxWidth: '900px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileCode size={20} />
                        Master Prompt
                    </h2>
                    <p className="text-secondary text-sm">
                        This prompt is combined with platform-specific prompts for all content generation.
                        Use it to define your brand voice, core principles, and general instructions.
                    </p>
                </div>

                <textarea
                    className="textarea"
                    value={masterPrompt}
                    onChange={(e) => setMasterPrompt(e.target.value)}
                    placeholder="Enter your master prompt..."
                    style={{
                        minHeight: '400px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: '1.6'
                    }}
                />

                <div style={{ marginTop: '16px' }}>
                    <button
                        onClick={handleSave}
                        className="button"
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {saving ? (
                            <>
                                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Master Prompt
                            </>
                        )}
                    </button>
                    {message && (
                        <p style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: message.includes('Error') ? 'var(--danger)' : 'var(--success)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '13px'
                        }}>
                            {message}
                        </p>
                    )}
                </div>

                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    fontSize: '13px'
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px' }}>ℹ️ How it works:</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Master prompt is sent first, then platform-specific prompt</li>
                        <li>Use <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>{'{{brief}}'}</code> placeholder for brief content</li>
                        <li>Changes apply immediately to new content generation</li>
                        <li>Leave empty to use only platform-specific prompts</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
