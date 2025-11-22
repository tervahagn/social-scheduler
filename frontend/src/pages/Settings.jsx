import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader, FileCode, Key, Cpu } from 'lucide-react';

const AVAILABLE_MODELS = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Recommended)' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'openai/gpt-4o', name: 'GPT-4o' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
];

export default function Settings() {
    const [settings, setSettings] = useState({
        master_prompt: '',
        openrouter_api_key: '',
        openrouter_model: 'anthropic/claude-3.5-sonnet'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            setSettings(prev => ({
                ...prev,
                ...response.data
            }));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            // Save all settings
            await Promise.all([
                axios.put('/api/settings/master_prompt', { value: settings.master_prompt }),
                axios.put('/api/settings/openrouter_api_key', { value: settings.openrouter_api_key }),
                axios.put('/api/settings/openrouter_model', { value: settings.openrouter_model })
            ]);

            setMessage('Settings saved successfully!');
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

                {/* OpenRouter Configuration */}
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={20} />
                        OpenRouter Configuration
                    </h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                API Key
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                                    <Key size={16} />
                                </div>
                                <input
                                    type={showKey ? "text" : "password"}
                                    className="input"
                                    value={settings.openrouter_api_key || ''}
                                    onChange={(e) => handleChange('openrouter_api_key', e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    style={{ paddingLeft: '36px', width: '100%' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {showKey ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <p className="text-secondary text-sm" style={{ marginTop: '6px' }}>
                                Leave empty to use OPENROUTER_API_KEY from .env file
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                LLM Model
                            </label>
                            <select
                                className="input"
                                value={settings.openrouter_model || 'anthropic/claude-3.5-sonnet'}
                                onChange={(e) => handleChange('openrouter_model', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {AVAILABLE_MODELS.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                                <option value="custom">Custom Model ID...</option>
                            </select>
                            {settings.openrouter_model === 'custom' && (
                                <input
                                    type="text"
                                    className="input"
                                    style={{ marginTop: '8px', width: '100%' }}
                                    placeholder="Enter model ID (e.g. google/gemini-flash-1.5)"
                                    onChange={(e) => handleChange('openrouter_model', e.target.value)}
                                />
                            )}
                            <p className="text-secondary text-sm" style={{ marginTop: '6px' }}>
                                Select the AI model to use for content generation
                            </p>
                        </div>
                    </div>
                </div>

                {/* Master Prompt */}
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
                    value={settings.master_prompt || ''}
                    onChange={(e) => handleChange('master_prompt', e.target.value)}
                    placeholder="Enter your master prompt..."
                    style={{
                        minHeight: '300px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: '1.6'
                    }}
                />

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                                Save Settings
                            </>
                        )}
                    </button>
                    {message && (
                        <p style={{
                            padding: '8px 12px',
                            background: message.includes('Error') ? 'var(--danger)' : 'var(--success)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '13px',
                            margin: 0
                        }}>
                            {message}
                        </p>
                    )}
                </div>

                <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    fontSize: '13px'
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px' }}>ℹ️ How it works:</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li><strong>OpenRouter:</strong> Settings here override the .env file. API Key is stored securely in your local database.</li>
                        <li><strong>Master Prompt:</strong> Sent first, then platform-specific prompt.</li>
                        <li>Use <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>{'{{brief}}'}</code> placeholder for brief content.</li>
                        <li>Changes apply immediately to new content generation.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
