import { useState, useEffect } from 'react';
import { getPlatforms, updatePlatform } from '../services/api';
import axios from 'axios';
import {
    Save,
    Loader,
    FileText,
    LayoutGrid,
    List,
    FileCode,
    BookOpen,
    ChevronDown,
    ChevronRight,

    X,
    Info
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { getPlatformConfig } from '../config/platforms';

function PlatformCard({ platform, onUpdate }) {
    const { showSuccess, showError } = useNotification();
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [promptContent, setPromptContent] = useState(platform.prompt_content || '');
    const [loading, setLoading] = useState(false);

    const config = getPlatformConfig(platform.name);
    const Icon = config.icon;

    const handleSavePrompt = async () => {
        setLoading(true);
        try {
            await updatePlatform(platform.id, {
                prompt_content: promptContent
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
                        background: config.color + '15',
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

            {/* Prompt Editor */}
            <div style={{ position: 'relative' }}>
                {editingPrompt ? (
                    <div>
                        <div style={{ marginBottom: '12px' }}>
                            <textarea
                                className="textarea"
                                value={promptContent}
                                onChange={(e) => setPromptContent(e.target.value)}
                                placeholder="Enter platform-specific prompt..."
                                style={{ minHeight: '225px', fontFamily: 'monospace', fontSize: '12px', width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={handleSavePrompt} className="button" disabled={loading}>
                                {loading ? <Loader size={16} className="animate-spin" /> : 'Save Prompt'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditingPrompt(false);
                                    setPromptContent(platform.prompt_content || '');
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
                            <div style={{
                                maxHeight: '180px',
                                minHeight: '180px',
                                overflowY: 'auto',
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

                        <button
                            onClick={() => setEditingPrompt(true)}
                            className="button button-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 8px' }}
                        >
                            <FileText size={12} />
                            Edit Prompt
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function PromptHierarchyModal({ onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
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
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)'
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '600' }}>
                        <BookOpen size={24} className="text-accent" />
                        How Content is Generated
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: '4px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{
                    padding: '24px',
                    lineHeight: '1.6',
                    overflowY: 'auto',
                    fontSize: '15px'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>1. The Ingredients</h3>
                        <p style={{ marginBottom: '12px' }}>The system gathers three main pieces of text:</p>
                        <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li><strong>The Brief</strong>: Your content, links, and attached files.</li>
                            <li><strong>Master Prompt</strong>: The global instructions from this page.</li>
                            <li><strong>Platform Prompt</strong>: The specific "Main Prompt" for the target platform.</li>
                        </ol>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>2. The Hierarchy (The "Sandwich")</h3>
                        <p style={{ marginBottom: '12px' }}>The system builds a single "Final Prompt" to send to the AI, layered like this:</p>

                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--accent)' }}>Layer 1: Master Prompt (The Boss)</strong>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Sets the overall persona and core principles.</li>
                                <li>Injects the <code>{`{{brief}}`}</code> content.</li>
                            </ul>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--accent)' }}>Layer 2: Platform Prompt (The Specialist)</strong>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Appended <strong>below</strong> the Master Prompt.</li>
                                <li>Adds specific rules (e.g., "Use 3 hashtags," "Max 3000 chars").</li>
                                <li>Overrides general instructions with platform-specific constraints.</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>3. Final Output</h3>
                        <p style={{ marginBottom: '12px' }}>The AI receives one sequence:</p>
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            border: '1px dashed var(--border-color)'
                        }}>
                            [MASTER PROMPT] + [BRIEF] + [PLATFORM PROMPT]
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'var(--bg-secondary)'
                }}>
                    <button onClick={onClose} className="button">
                        Close Guide
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Platforms() {
    const { showSuccess, showError } = useNotification();
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [masterPrompt, setMasterPrompt] = useState('');
    const [editingMasterPrompt, setEditingMasterPrompt] = useState(false);
    const [savingMasterPrompt, setSavingMasterPrompt] = useState(false);
    const [showPromptGuide, setShowPromptGuide] = useState(false);
    const [showHierarchyModal, setShowHierarchyModal] = useState(false);


    useEffect(() => {
        fetchPlatforms();
        fetchMasterPrompt();
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

    const fetchMasterPrompt = async () => {
        try {
            const response = await axios.get('/api/settings');
            setMasterPrompt(response.data.master_prompt || '');
        } catch (err) {
            console.error('Error fetching master prompt:', err);
        }
    };

    const handleSaveMasterPrompt = async () => {
        setSavingMasterPrompt(true);
        try {
            await axios.put('/api/settings/master_prompt', { value: masterPrompt });
            setEditingMasterPrompt(false);
            showSuccess('Master prompt updated successfully');
        } catch (err) {
            showError('Failed to update master prompt: ' + err.message);
        }
        setSavingMasterPrompt(false);
    };

    if (loading) return <div className="loading">Loading platforms...</div>;

    return (
        <div className="container" style={{ maxWidth: '1400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>Platform Configuration</h1>
                    <p className="text-secondary">Manage your social media platforms and content generation settings</p>
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

            {/* Top Section: Master Prompt & Guide */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', marginBottom: '32px' }}>

                {/* Master Prompt Card */}
                <div className="card" style={{ background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <FileCode size={24} />
                            Master Prompt
                        </h2>
                        {!editingMasterPrompt && (
                            <button
                                onClick={() => setEditingMasterPrompt(true)}
                                className="button button-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                            >
                                Edit Prompt
                            </button>
                        )}
                    </div>
                    <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                        System prompt used to guide AI content generation across all platforms. This is applied before platform-specific prompts.
                    </p>

                    {editingMasterPrompt ? (
                        <>
                            <textarea
                                className="textarea"
                                value={masterPrompt}
                                onChange={(e) => setMasterPrompt(e.target.value)}
                                placeholder="Enter your master prompt for content generation..."
                                style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '13px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <button
                                    onClick={handleSaveMasterPrompt}
                                    disabled={savingMasterPrompt}
                                    className="button"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    {savingMasterPrompt ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Master Prompt
                                </button>
                                <button
                                    onClick={() => {
                                        fetchMasterPrompt();
                                        setEditingMasterPrompt(false);
                                    }}
                                    className="button button-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: '16px',
                            background: 'var(--bg-primary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            color: 'var(--text-secondary)'
                        }}>
                            {masterPrompt || 'No master prompt set'}
                        </div>
                    )}
                </div>

                {/* Prompt Logic Guide */}
                <div className="card" style={{ height: 'fit-content', padding: '16px', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                    <button
                        onClick={() => setShowPromptGuide(!showPromptGuide)}
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
                            <Info size={18} className="text-accent" />
                            Prompt Logic Guide
                        </h3>
                        {showPromptGuide ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>

                    {showPromptGuide && (
                        <div className="animate-fade-in" style={{ marginTop: '16px' }}>
                            <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                                Understanding how the Master Prompt interacts with Platform Prompts is key to getting the best results.
                            </p>

                            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ background: 'var(--accent)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</span>
                                    <span style={{ fontWeight: '500' }}>Master Prompt</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingLeft: '11px' }}>
                                    <div style={{ width: '2px', height: '16px', background: 'var(--border-color)' }}></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: 'var(--accent)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</span>
                                    <span style={{ fontWeight: '500' }}>Platform Prompt</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowHierarchyModal(true)}
                                className="button button-secondary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <BookOpen size={16} />
                                Deep Guide
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showHierarchyModal && <PromptHierarchyModal onClose={() => setShowHierarchyModal(false)} />}

            {/* Platforms Grid */}
            <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '32px' }}>
                <FileText size={24} />
                Platform Prompts
            </h2>
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
        </div>
    );
}
