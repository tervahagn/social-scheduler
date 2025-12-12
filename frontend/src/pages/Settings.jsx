import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader, Key, Cpu, Link as LinkIcon, ChevronDown, ChevronUp, BookOpen, X, Cloud } from 'lucide-react';

const AVAILABLE_MODELS = [
    { id: 'x-ai/grok-4.1-fast:free', name: 'Grok 4.1 Fast (Free - Recommended)' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'openai/gpt-4o', name: 'GPT-4o' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
];

import { useNotification } from '../contexts/NotificationContext';

export default function Settings() {
    const { showSuccess, showError } = useNotification();
    const [settings, setSettings] = useState({
        openrouter_api_key: '',
        openrouter_model: 'x-ai/grok-4.1-fast:free',
        make_webhook_url: '',
        cloudinary_cloud_name: '',
        cloudinary_api_key: '',
        cloudinary_api_secret: ''
    });
    const [customModel, setCustomModel] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [showOpenRouterGuide, setShowOpenRouterGuide] = useState(false);
    const [showWebhookGuide, setShowWebhookGuide] = useState(false);
    const [showDeepGuide, setShowDeepGuide] = useState(false);
    const [showCloudinaryGuide, setShowCloudinaryGuide] = useState(false);
    const [showCloudinarySecret, setShowCloudinarySecret] = useState(false);
    const [showScenarioImg, setShowScenarioImg] = useState(false);
    const [showInstantImg, setShowInstantImg] = useState(false);
    const [showScheduleImg, setShowScheduleImg] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            const storedModel = response.data.openrouter_model || 'x-ai/grok-4.1-fast:free';
            const isPredefined = AVAILABLE_MODELS.some(m => m.id === storedModel);
            setSettings(prev => ({
                ...prev,
                ...response.data,
                openrouter_model: isPredefined ? storedModel : 'custom'
            }));
            if (!isPredefined && storedModel) {
                setCustomModel(storedModel);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching settings:', err);
            showError('Failed to load settings');
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        if (key === 'openrouter_model' && value !== 'custom') {
            setCustomModel('');
        }
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const modelToSave = settings.openrouter_model === 'custom' ? customModel : settings.openrouter_model;
            await Promise.all([
                axios.put('/api/settings/openrouter_api_key', { value: settings.openrouter_api_key }),
                axios.put('/api/settings/openrouter_model', { value: modelToSave }),
                axios.put('/api/settings/make_webhook_url', { value: settings.make_webhook_url }),
                axios.put('/api/settings/cloudinary_cloud_name', { value: settings.cloudinary_cloud_name }),
                axios.put('/api/settings/cloudinary_api_key', { value: settings.cloudinary_api_key }),
                axios.put('/api/settings/cloudinary_api_secret', { value: settings.cloudinary_api_secret })
            ]);

            if (settings.openrouter_model === 'custom') {
                setSettings(prev => ({ ...prev, openrouter_model: 'custom' }));
                setCustomModel(modelToSave);
            } else {
                setSettings(prev => ({ ...prev, openrouter_model: modelToSave }));
                setCustomModel('');
            }
            showSuccess('Settings saved successfully!');
        } catch (err) {
            showError('Error saving settings: ' + err.message);
        }
        setSaving(false);
    };

    if (loading) return <div className="loading">Loading settings...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '8px' }}>Settings</h1>
            <p className="text-secondary mb-4">Configure AI models and webhook integrations</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px', alignItems: 'start' }}>

                {/* Left Column: Settings Form */}
                <div className="card">

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
                                        style={{ paddingLeft: '36px', paddingRight: '60px', width: '100%' }}
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
                                    value={settings.openrouter_model || 'x-ai/grok-4.1-fast:free'}
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
                                        value={customModel}
                                        onChange={(e) => setCustomModel(e.target.value)}
                                    />
                                )}
                                <p className="text-secondary text-sm" style={{ marginTop: '6px' }}>
                                    Select the AI model to use for content generation
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Make.com Webhook Integration */}
                    <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LinkIcon size={20} />
                            Make.com Webhook Integration
                        </h2>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                Webhook URL
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                                    <LinkIcon size={16} />
                                </div>
                                <input
                                    type="url"
                                    className="input"
                                    value={settings.make_webhook_url || ''}
                                    onChange={(e) => handleChange('make_webhook_url', e.target.value)}
                                    placeholder="https://hook.eu2.make.com/..."
                                    style={{ paddingLeft: '36px', width: '100%' }}
                                />
                            </div>
                            <p className="text-secondary text-sm" style={{ marginTop: '6px' }}>
                                Single webhook URL that routes to all your social platforms via Make.com
                            </p>
                        </div>
                    </div>

                    {/* Cloudinary Media Storage */}
                    <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Cloud size={20} />
                            Cloudinary Media Storage
                        </h2>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                    Cloud Name
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={settings.cloudinary_cloud_name || ''}
                                    onChange={(e) => handleChange('cloudinary_cloud_name', e.target.value)}
                                    placeholder="your-cloud-name"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                    API Key
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={settings.cloudinary_api_key || ''}
                                    onChange={(e) => handleChange('cloudinary_api_key', e.target.value)}
                                    placeholder="123456789012345"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                    API Secret
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showCloudinarySecret ? "text" : "password"}
                                        className="input"
                                        value={settings.cloudinary_api_secret || ''}
                                        onChange={(e) => handleChange('cloudinary_api_secret', e.target.value)}
                                        placeholder="Your API Secret"
                                        style={{ paddingRight: '60px', width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCloudinarySecret(!showCloudinarySecret)}
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
                                        {showCloudinarySecret ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-secondary text-sm">
                                Cloudinary stores your images in the cloud so Make.com can access them for publishing.
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div>
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
                    </div>

                    {/* Info Box */}
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
                            <li><strong>Make.com:</strong> One webhook URL routes to all platforms using Make.com's Router module.</li>
                            <li><strong>Cloudinary:</strong> Images are uploaded to cloud storage before publishing, so Make.com can access them.</li>
                            <li>Changes apply immediately to new content generation and publishing.</li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Guides */}
                <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* OpenRouter Guide - Collapsible */}
                    <div className="card" style={{ padding: '16px', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                        <button
                            onClick={() => setShowOpenRouterGuide(!showOpenRouterGuide)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0'
                            }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Cpu size={18} className="text-accent" />
                                OpenRouter Guide
                            </h3>
                            {showOpenRouterGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showOpenRouterGuide && (
                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginTop: '16px' }}>
                                <p style={{ marginBottom: '16px' }}>
                                    <strong>OpenRouter</strong> connects Social Scheduler to top AI models like GPT-4, Claude 3.5, and Llama 3.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>1</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Get API Key</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>
                                                Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>openrouter.ai/keys</a> and create a new key.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>2</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Add Credits</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Ensure your OpenRouter account has credits (min $5). Free models don't need credits.</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>3</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Select Model</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Choose a model on the left. <strong>Grok 4.1 Fast</strong> is currently free and very fast.</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--accent)', fontSize: '13px' }}>💡 Recommendation</strong>
                                    <p style={{ fontSize: '12px', margin: 0 }}>
                                        For best quality, use <strong>Claude 3.5 Sonnet</strong>. For speed and free testing, use <strong>Grok 4.1</strong>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Webhook Setup Guide - Collapsible */}
                    <div className="card" style={{ padding: '16px', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                        <button
                            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0'
                            }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <LinkIcon size={18} className="text-accent" />
                                Webhook Setup Guide
                            </h3>
                            {showWebhookGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showWebhookGuide && (
                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginTop: '16px' }}>
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
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Paste the URL into the <strong>Webhook URL</strong> field on the left and click Save.</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>4</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Connect Platforms</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>In Make.com, add a Router module and connect social media modules (LinkedIn, Instagram, etc.) based on the <code>platform</code> field.</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px' }}>
                                    <button
                                        onClick={() => setShowDeepGuide(true)}
                                        className="button button-secondary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <BookOpen size={16} />
                                        Deep Guide
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cloudinary Guide - Collapsible */}
                    <div className="card" style={{ padding: '16px', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                        <button
                            onClick={() => setShowCloudinaryGuide(!showCloudinaryGuide)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0'
                            }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Cloud size={18} className="text-accent" />
                                Cloudinary Guide
                            </h3>
                            {showCloudinaryGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showCloudinaryGuide && (
                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginTop: '16px' }}>
                                <p style={{ marginBottom: '16px' }}>
                                    <strong>Cloudinary</strong> is a free image hosting service that stores your media so Make.com can access it for publishing.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>1</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Create Account</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>
                                                Go to <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>cloudinary.com</a> and sign up for free.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>2</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Get Credentials</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Go to <strong>Settings → Access Keys</strong> and copy your Cloud Name, API Key, and API Secret.</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                        }}>3</div>
                                        <div>
                                            <strong style={{ color: 'var(--text-primary)' }}>Paste & Save</strong>
                                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Enter the credentials on the left and click Save.</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--accent)', fontSize: '13px' }}>💡 Free Tier</strong>
                                    <p style={{ fontSize: '12px', margin: 0 }}>
                                        Cloudinary offers <strong>25GB free storage</strong> — more than enough for most users!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deep Guide Modal */}
            {showDeepGuide && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        overflow: 'hidden',
                        background: 'var(--bg-primary)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--bg-secondary)'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BookOpen size={24} className="text-accent" />
                                The Ultimate Make.com Integration Guide
                            </h2>
                            <button
                                onClick={() => setShowDeepGuide(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            lineHeight: '1.6',
                            fontSize: '15px'
                        }}>
                            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--accent)', fontSize: '16px' }}>🧠 The Concept</strong>
                                <p style={{ margin: 0 }}>
                                    Instead of creating a separate connection for every single platform, we use <strong>one master connection</strong>.
                                    Social Scheduler sends a package (your post) to Make.com, which opens it, checks the label, and routes it to the correct destination.
                                </p>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 1: The Handshake (Connecting the Apps)</h3>
                            <ol style={{ paddingLeft: '20px', marginBottom: '24px' }}>
                                <li style={{ marginBottom: '8px' }}>Log in to <strong>Make.com</strong> and click <strong>+ Create a new scenario</strong>.</li>
                                <li style={{ marginBottom: '8px' }}>Add a <strong>Webhooks</strong> module and select <strong>Custom webhook</strong>.</li>
                                <li style={{ marginBottom: '8px' }}>Click <strong>Add</strong>, name it "Social Scheduler Master Hook", and click <strong>Save</strong>.</li>
                                <li style={{ marginBottom: '8px' }}>Copy the URL (e.g., <code>https://hook.make.com/...</code>).</li>
                                <li style={{ marginBottom: '8px' }}>Paste it into the <strong>Webhook URL</strong> field in Social Scheduler Settings and click Save.</li>
                            </ol>

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 2: The Traffic Controller (The Router)</h3>
                            <p style={{ marginBottom: '16px' }}>Now we need to tell Make.com how to sort the mail.</p>
                            <ol style={{ paddingLeft: '20px', marginBottom: '24px' }}>
                                <li style={{ marginBottom: '8px' }}>Hover over the Webhook module's right side and add a new module.</li>
                                <li style={{ marginBottom: '8px' }}>Search for <strong>Flow Control</strong> and select <strong>Router</strong>.</li>
                                <li style={{ marginBottom: '8px' }}>You should now see the Webhook connected to a Router splitting into paths.</li>
                            </ol>

                            <button
                                onClick={() => setShowScenarioImg(!showScenarioImg)}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                }}
                            >
                                📷 {showScenarioImg ? 'Hide' : 'See'} Full Scenario Example
                            </button>
                            {showScenarioImg && (
                                <div style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src="/assets/make/scenarios.webp" alt="Make.com full scenario" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 3: The Destinations (Setting up Platforms)</h3>

                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    � Example: LinkedIn Setup
                                </h4>
                                <ol style={{ paddingLeft: '20px', marginBottom: '0' }}>
                                    <li style={{ marginBottom: '8px' }}>Add a <strong>LinkedIn</strong> module (Create a Text/Image Post).</li>
                                    <li style={{ marginBottom: '8px' }}>Map <strong>Content</strong> to <code>content</code>.</li>
                                    <li style={{ marginBottom: '8px' }}>Set up the <strong>Filter</strong>:
                                        <ul style={{ marginTop: '4px' }}>
                                            <li>Label: "Is LinkedIn"</li>
                                            <li>Condition: <code>platform</code> Equal to <code>linkedin</code></li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 4: Understanding the Data Format</h3>
                            <p style={{ marginBottom: '16px' }}>When you publish posts, Social Scheduler sends data to Make.com in JSON format. Here's what it looks like:</p>

                            <div style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontFamily: 'monospace', color: '#d4d4d4', overflow: 'auto' }}>
                                <pre style={{ margin: 0 }}>{`{
  "platform": "twitter",
  "content": "Your generated post text...",
  "media_url": "https://...image.jpg",
  "media_type": "image/jpeg",
  "link_url": "https://yourlink.com",
  "post_id": 123,
  "timestamp": "2025-11-24T19:21:00.000Z"
}`}</pre>
                            </div>

                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>📋 All Platform Identifiers:</h4>
                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                                    <li><code>blog</code> - Blog/Website</li>
                                    <li><code>linkedin</code> - LinkedIn (Company Page)</li>
                                    <li><code>linkedin-personal</code> - LinkedIn (Personal Profile)</li>
                                    <li><code>twitter</code> - Twitter/X</li>
                                    <li><code>facebook</code> - Facebook</li>
                                    <li><code>instagram</code> - Instagram</li>
                                    <li><code>reddit</code> - Reddit</li>
                                    <li><code>google-business</code> - Google Business Profile</li>
                                    <li><code>youtube-posts</code> - YouTube Community Posts</li>
                                </ul>
                            </div>

                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>🔀 Router Setup Example:</h4>
                            <p style={{ marginBottom: '12px' }}>In Make.com Router, you'll create one path for each platform you use:</p>
                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Webhook → Router → 9 paths:</p>
                                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                                    <li><strong>Path 1:</strong> Filter: <code>platform</code> = <code>twitter</code> → Twitter module</li>
                                    <li><strong>Path 2:</strong> Filter: <code>platform</code> = <code>linkedin</code> → LinkedIn module</li>
                                    <li><strong>Path 3:</strong> Filter: <code>platform</code> = <code>facebook</code> → Facebook module</li>
                                    <li><strong>Path 4:</strong> Filter: <code>platform</code> = <code>instagram</code> → Instagram module</li>
                                    <li>...and so on for each platform you use</li>
                                </ul>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 4.5: Quick Post Payload</h3>
                            <p style={{ marginBottom: '16px' }}>Quick Posts send a slightly different JSON format with scheduling support:</p>

                            <div style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontFamily: 'monospace', color: '#d4d4d4', overflow: 'auto' }}>
                                <pre style={{ margin: 0 }}>{`{
  "platform": "linkedin-personal",
  "content": "Your post text...",
  "brief_title": "For Reddit title",
  "media": [{ "url": "...", "mimeType": "..." }],
  "media_url": "https://cloudinary.com/...",
  "isQuickPost": true,
  "scheduled_at": "2025-12-12T10:00:00Z"  // null if immediate
}`}</pre>
                            </div>

                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>🔄 Re-determine Data Structure:</h4>
                            <p style={{ marginBottom: '12px' }}>If Make.com doesn't recognize new fields, send a test JSON to refresh the structure:</p>
                            <div style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontFamily: 'monospace', color: '#d4d4d4', overflow: 'auto' }}>
                                <pre style={{ margin: 0 }}>{`curl -X POST "YOUR_WEBHOOK_URL" \\
  -H "Content-Type: application/json" \\
  -d '{
    "platform": "test",
    "content": "Test content",
    "brief_title": "Test title",
    "media_url": null,
    "isQuickPost": true,
    "scheduled_at": "2025-12-12T10:00:00Z"
  }'`}</pre>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                In Make.com, click on Webhook module → <strong>Re-determine data structure</strong> → Send the curl command above.
                            </p>

                            <button
                                onClick={() => setShowInstantImg(!showInstantImg)}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    color: 'var(--success)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                }}
                            >
                                📷 {showInstantImg ? 'Hide' : 'See'} Instant Publishing Example
                            </button>
                            {showInstantImg && (
                                <div style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src="/assets/make/instant.webp" alt="Instant publishing scenario" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 4.6: Scheduled Posts with Data Store</h3>
                            <p style={{ marginBottom: '16px' }}>To handle scheduled posts, use Make.com's Data Store:</p>

                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--accent)' }}>⚠️ Important: Router Filter Setup</h4>
                                <p style={{ marginBottom: '12px', fontSize: '14px' }}>Your Router needs TWO paths with different filters:</p>

                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                                    <strong style={{ color: 'var(--success)' }}>Path 1: Instant Publishing → LinkedIn/Platform</strong>
                                    <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', fontSize: '13px' }}>
                                        <li><code>scheduled_at</code> <strong>Does not exist</strong></li>
                                        <li>OR: <code>scheduled_at</code> <strong>Less than or equal to</strong> <code>now</code></li>
                                    </ul>
                                </div>

                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                                    <strong style={{ color: '#a855f7' }}>Path 2: Scheduled → Data Store</strong>
                                    <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', fontSize: '13px' }}>
                                        <li><code>scheduled_at</code> <strong>Exists</strong></li>
                                        <li>AND: <code>scheduled_at</code> <strong>Greater than</strong> <code>now</code></li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>📦 Setup Data Store:</h4>
                                <ol style={{ paddingLeft: '20px', marginBottom: '0' }}>
                                    <li style={{ marginBottom: '8px' }}>Go to <strong>Data Stores</strong> in Make.com sidebar</li>
                                    <li style={{ marginBottom: '8px' }}>Create new: "Scheduled Posts"</li>
                                    <li style={{ marginBottom: '8px' }}>Add fields: <code>platform</code>, <code>content</code>, <code>brief_title</code>, <code>media_url</code>, <code>scheduled_at</code></li>
                                </ol>
                            </div>

                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>🔀 Scheduled Path Setup:</h4>
                                <p style={{ marginBottom: '8px' }}>Add Router path for posts scheduled for the future:</p>
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    <li style={{ marginBottom: '4px' }}>Filter: <code>scheduled_at</code> <strong>exists</strong> AND <strong>greater than</strong> <code>now</code></li>
                                    <li style={{ marginBottom: '4px' }}>Module: <strong>Data Store → Add a record</strong></li>
                                    <li>Map all fields from webhook to Data Store</li>
                                </ul>
                            </div>

                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>⏰ Create Publisher Scenario:</h4>
                                <p style={{ marginBottom: '8px' }}>Create a <strong>separate scenario</strong> that checks Data Store every 15 minutes:</p>
                                <ol style={{ paddingLeft: '20px', marginBottom: '0' }}>
                                    <li style={{ marginBottom: '4px' }}>First module: <strong>Data Store → Search records</strong> (NOT Webhook!)</li>
                                    <li style={{ marginBottom: '4px' }}>Filter: <code>scheduled_at</code> ≤ <code>now</code></li>
                                    <li style={{ marginBottom: '4px' }}>Router → Platform modules (same as main scenario)</li>
                                    <li style={{ marginBottom: '4px' }}>After each platform: <strong>Data Store → Delete record</strong> (Key from Search)</li>
                                    <li>Set scenario schedule: <strong>Every 15 minutes</strong> (bottom left clock icon)</li>
                                </ol>
                            </div>

                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#f59e0b' }}>⚠️ Important: No Webhook in Publisher!</h4>
                                <p style={{ fontSize: '14px', margin: 0 }}>
                                    Publisher scenario starts with <strong>Data Store Search</strong>, not Webhook.
                                    Schedule is set in <strong>scenario settings</strong> (clock icon), not as a module.
                                    Delete record after publishing to prevent duplicate posts.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowScheduleImg(!showScheduleImg)}
                                style={{
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    color: '#a855f7',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                }}
                            >
                                📷 {showScheduleImg ? 'Hide' : 'See'} Scheduled Posts Example
                            </button>
                            {showScheduleImg && (
                                <div style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src="/assets/make/schedule.webp" alt="Scheduled posts with Data Store" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Phase 5: Turn it On!</h3>
                            <p>Click the <strong>Save</strong> icon and toggle the <strong>Scheduling</strong> switch to <strong>ON</strong>.</p>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid var(--border)',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowDeepGuide(false)}
                                className="button"
                            >
                                Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
