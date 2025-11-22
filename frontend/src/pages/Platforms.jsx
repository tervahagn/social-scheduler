import { useState, useEffect } from 'react';
import { getPlatforms, updatePlatform } from '../services/api';
import {
    Save,
    Loader,
    Globe,
    Linkedin,
    Twitter,
    Instagram,
    Facebook,
    Youtube,
    MessageSquare,
    Search,
    Share2,
    CheckCircle,
    XCircle,
    Settings,
    Link as LinkIcon,
    FileText
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const PLATFORM_ICONS = {
    'blog': Globe,
    'linkedin': Linkedin,
    'linkedin-personal': Linkedin,
    'twitter': Twitter,
    'instagram': Instagram,
    'facebook': Facebook,
    'youtube-posts': Youtube,
    'reddit': MessageSquare,
    'google-business': Search
};

function PlatformCard({ platform, onUpdate }) {
    const { showSuccess, showError } = useNotification();
    const [editing, setEditing] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(platform.webhook_url || '');
    const [isActive, setIsActive] = useState(platform.is_active === 1);
    const [promptContent, setPromptContent] = useState(platform.prompt_content || '');
    const [ultraShortPrompt, setUltraShortPrompt] = useState(platform.ultra_short_prompt || '');
    const [loading, setLoading] = useState(false);

    const Icon = PLATFORM_ICONS[platform.id] || Share2;

    const handleSave = async () => {
        setLoading(true);
        try {
            await updatePlatform(platform.id, {
                webhook_url: webhookUrl,
                is_active: isActive ? 1 : 0
            });
            setEditing(false);
            onUpdate();
            showSuccess('Platform settings updated');
        } catch (err) {
            showError('Failed to update: ' + err.message);
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
            showSuccess('Prompts updated successfully');
        } catch (err) {
            showError('Failed to update prompt: ' + err.message);
        }
        setLoading(false);
    };

    const handleToggleActive = async () => {
        try {
            await updatePlatform(platform.id, { is_active: !platform.is_active });
            onUpdate();
            showSuccess(`Platform ${!platform.is_active ? 'enabled' : 'disabled'}`);
        } catch (err) {
            showError('Failed to update status');
        }
    };

    return (
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Transparent Icon in Top Right */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                opacity: 0.05,
                transform: 'rotate(15deg)',
                pointerEvents: 'none'
            }}>
                <Icon size={120} color="var(--text-primary)" />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)'
                    }}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{platform.display_name}</h3>
                    </div>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={platform.is_active}
                        onChange={handleToggleActive}
                    />
                    <span className="slider round"></span>
                </label>
            </div>

            {/* Webhook Section */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                {editing ? (
                    <div style={{ marginBottom: '16px' }}>
                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                                <LinkIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Webhook URL
                            </label>
                            <input
                                type="url"
                                className="input"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://hooks.zapier.com/..."
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleSave} className="button" disabled={loading}>
                                {loading ? <Loader size={16} className="animate-spin" /> : 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setWebhookUrl(platform.webhook_url || '');
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
                            <p className="text-sm text-secondary" style={{ marginBottom: '4px', fontSize: '12px' }}>Webhook URL</p>
                            <div style={{
                                wordBreak: 'break-all',
                                fontFamily: 'monospace',
                                background: 'var(--bg-tertiary)',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: platform.webhook_url ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}>
                                {platform.webhook_url || 'Not configured'}
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing(true)}
                            className="button button-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 8px' }}
                        >
                            <Settings size={12} />
                            Configure
                        </button>
                    </div>
                )}
            </div>

            {/* Prompt Editor */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
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
                                style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '12px', width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500' }}>Technical Prompt</label>
                            <textarea
                                className="textarea"
                                value={ultraShortPrompt}
                                onChange={(e) => setUltraShortPrompt(e.target.value)}
                                placeholder="Enter technical constraints (e.g. max characters)..."
                                style={{ minHeight: '60px', fontFamily: 'monospace', fontSize: '12px', width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={handleSavePrompt} className="button" disabled={loading}>
                                {loading ? <Loader size={16} className="animate-spin" /> : 'Save Prompts'}
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
                                maxHeight: '80px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                background: 'var(--bg-tertiary)',
                                padding: '8px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap',
                                color: platform.prompt_content ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}>
                                {platform.prompt_content || 'No prompt set'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Technical Prompt</label>
                            <div style={{
                                maxHeight: '40px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                background: 'var(--bg-tertiary)',
                                padding: '8px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap',
                                color: platform.ultra_short_prompt ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}>
                                {platform.ultra_short_prompt || 'No technical prompt set'}
                            </div>
                        </div>

                        <button
                            onClick={() => setEditingPrompt(true)}
                            className="button button-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 8px' }}
                        >
                            <FileText size={12} />
                            Edit Prompts
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Platforms() {
    const { showError } = useNotification();
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlatforms();
    }, []);

    const fetchPlatforms = async () => {
        try {
            const data = await getPlatforms();
            setPlatforms(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching platforms:', err);
            showError('Failed to load platforms');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading platforms...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '8px' }}>Platforms</h1>
            <p className="text-secondary mb-4">Configure your social media platforms, prompts, and integrations</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {platforms.map(platform => (
                    <PlatformCard key={platform.id} platform={platform} onUpdate={fetchPlatforms} />
                ))}
            </div>
        </div>
    );
}
