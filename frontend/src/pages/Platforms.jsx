import { useState, useEffect } from 'react';
import { getPlatforms, updatePlatform } from '../services/api';
import {
    Save,
    Loader,
    CheckCircle,
    XCircle,
    Settings,
    Link as LinkIcon,
    FileText,
    LayoutGrid,
    List
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { getPlatformConfig } from '../config/platforms';

function PlatformCard({ platform, onUpdate }) {
    const { showSuccess, showError } = useNotification();
    const [editing, setEditing] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(platform.webhook_url || '');
    const [isActive, setIsActive] = useState(platform.is_active === 1);
    const [promptContent, setPromptContent] = useState(platform.prompt_content || '');
    const [ultraShortPrompt, setUltraShortPrompt] = useState(platform.ultra_short_prompt || '');
    const [loading, setLoading] = useState(false);

    const config = getPlatformConfig(platform.name);
    const Icon = config.icon;

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
                        background: config.color + '15', // 15% opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: config.color
                    }}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: config.color }}>{config.name}</h3>
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
    const [viewMode, setViewMode] = useState('grid');

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
        <div className="container" style={{ maxWidth: '1400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>Platform Configuration</h1>
                    <p className="text-secondary">Manage your social media platforms and automation settings</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                        style={{
                            padding: '8px',
                            borderRadius: '6px',
                            background: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
                            color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        title="List View"
                        style={{
                            padding: '8px',
                            borderRadius: '6px',
                            background: viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent',
                            color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px', alignItems: 'start' }}>
                {/* Left Column: Platforms List */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
                    gap: '24px'
                }}>
                    {platforms.map(platform => (
                        <PlatformCard
                            key={platform.id}
                            platform={platform}
                            onUpdate={fetchPlatforms}
                        />
                    ))}
                </div>

                {/* Right Column: Sticky Webhook Guide */}
                <div style={{ position: 'sticky', top: '24px' }}>
                    <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LinkIcon size={20} className="text-accent" />
                            Webhook Setup Guide
                        </h3>

                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            <p style={{ marginBottom: '16px' }}>
                                Connect Social Scheduler to <strong>Make.com</strong> (formerly Integromat) to automate posting to all your social accounts.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                    }}>1</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Create Scenario</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Create a new scenario in Make.com and add a <strong>Custom Webhook</strong> trigger.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                    }}>2</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Copy URL</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Copy the generated webhook URL from Make.com.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                    }}>3</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Paste & Save</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Enable the platform switch here, paste the URL into the <strong>Webhook URL</strong> field, and click Save.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                    }}>4</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Connect Platform</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>In Make.com, add the social media module (e.g., LinkedIn, Instagram) after the webhook to create the post.</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--accent)', fontSize: '13px' }}>💡 Pro Tip</strong>
                                <p style={{ fontSize: '12px', margin: 0 }}>
                                    You can use the same webhook URL for multiple platforms if you route them in Make.com using a Router module based on the <code>platform</code> field.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

