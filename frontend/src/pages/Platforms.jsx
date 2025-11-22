import { useState, useEffect } from 'react';
import { getPlatforms, updatePlatform } from '../services/api';
import { Settings, Link as LinkIcon, CheckCircle, XCircle, FileText } from 'lucide-react';

function PlatformCard({ platform, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(platform.webhook_url || '');
    const [isActive, setIsActive] = useState(platform.is_active === 1);
    const [promptContent, setPromptContent] = useState(platform.prompt_content || '');
    const [ultraShortPrompt, setUltraShortPrompt] = useState(platform.ultra_short_prompt || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updatePlatform(platform.id, {
                webhook_url: webhookUrl,
                is_active: isActive ? 1 : 0
            });
            setEditing(false);
            onUpdate();
        } catch (err) {
            alert('Failed to update: ' + err.message);
        }
        setLoading(false);
    };

    const handleSavePrompt = async () => {
        setLoading(true);
        try {
            await updatePlatform(platform.id, {
                prompt_content: promptContent,
                ultra_short_prompt: ultraShortPrompt
            });
            setEditingPrompt(false);
            onUpdate();
            alert('✅ Prompt updated!');
        } catch (err) {
            alert('Failed to update prompt: ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{platform.display_name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {platform.is_active ? (
                        <CheckCircle size={18} color="var(--success)" />
                    ) : (
                        <XCircle size={18} color="var(--text-secondary)" />
                    )}
                </div>
            </div>

            {/* Webhook Settings */}
            {editing ? (
                <div style={{ marginBottom: '16px' }}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                            <LinkIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Make.com Webhook URL
                        </label>
                        <input
                            type="url"
                            className="input"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://hook.eu1.make.com/..."
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <span style={{ fontSize: '13px' }}>Active</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSave} className="button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => {
                                setEditing(false);
                                setWebhookUrl(platform.webhook_url || '');
                                setIsActive(platform.is_active === 1);
                            }}
                            className="button button-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <p className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Webhook URL:</p>
                        <p className="text-sm" style={{
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            background: 'var(--bg-tertiary)',
                            padding: '8px',
                            borderRadius: '4px'
                        }}>
                            {platform.webhook_url || <span style={{ color: 'var(--text-secondary)' }}>Not configured</span>}
                        </p>
                    </div>
                    <button
                        onClick={() => setEditing(true)}
                        className="button button-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Settings size={14} />
                        Configure Webhook
                    </button>
                </div>
            )}

            {/* Prompt Editor */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={16} />
                        Prompt Settings
                    </h4>
                </div>

                {editingPrompt ? (
                    <div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500' }}>Main Prompt</label>
                            <textarea
                                className="textarea"
                                value={promptContent}
                                onChange={(e) => setPromptContent(e.target.value)}
                                placeholder="Enter platform-specific prompt..."
                                style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '12px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500' }}>Ultra-Short Prompt (for quick updates)</label>
                            <textarea
                                className="textarea"
                                value={ultraShortPrompt}
                                onChange={(e) => setUltraShortPrompt(e.target.value)}
                                placeholder="Enter ultra-short prompt..."
                                style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '12px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={handleSavePrompt} className="button" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Prompts'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditingPrompt(false);
                                    setPromptContent(platform.prompt_content || '');
                                    setUltraShortPrompt(platform.ultra_short_prompt || '');
                                }}
                                className="button button-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Main Prompt</label>
                            <div style={{
                                maxHeight: '100px',
                                overflow: 'auto',
                                background: 'var(--bg-tertiary)',
                                padding: '8px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {platform.prompt_content || platform.prompt_file || <span style={{ color: 'var(--text-secondary)' }}>No prompt set</span>}
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Ultra-Short Prompt</label>
                            <div style={{
                                maxHeight: '60px',
                                overflow: 'auto',
                                background: 'var(--bg-tertiary)',
                                padding: '8px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {platform.ultra_short_prompt || <span style={{ color: 'var(--text-secondary)' }}>No ultra-short prompt set</span>}
                            </div>
                        </div>

                        <button
                            onClick={() => setEditingPrompt(true)}
                            className="button button-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FileText size={14} />
                            Edit Prompts
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Platforms() {
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlatforms = async () => {
        try {
            const data = await getPlatforms();
            setPlatforms(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlatforms();
    }, []);

    if (loading) return <div className="loading">Loading platforms...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '8px' }}>Platforms</h1>
            <p className="text-secondary mb-4">
                Configure Make.com webhooks and prompts for each platform
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '16px' }}>
                {platforms.map(platform => (
                    <PlatformCard key={platform.id} platform={platform} onUpdate={fetchPlatforms} />
                ))}
            </div>
        </div>
    );
}
