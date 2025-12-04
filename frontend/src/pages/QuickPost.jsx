import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Send,
    AlertCircle,
    CheckCircle,
    Image as ImageIcon,
    X,
    Loader,
    Linkedin,
    Facebook,
    Instagram,
    Twitter,
    Globe,
    MessageSquare,
    Youtube,
    LayoutGrid,
    List
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

// Helper to get platform icon (copied from Platforms.jsx/utils)
const getPlatformIcon = (name) => {
    switch (name) {
        case 'linkedin':
        case 'linkedin-personal': return <Linkedin size={20} />;
        case 'facebook': return <Facebook size={20} />;
        case 'instagram': return <Instagram size={20} />;
        case 'twitter': return <Twitter size={20} />;
        case 'google-business': return <Globe size={20} />;
        case 'blog': return <Globe size={20} />;
        case 'reddit': return <MessageSquare size={20} />;
        case 'youtube-posts': return <Youtube size={20} />;
        default: return <Globe size={20} />;
    }
};

const getPlatformColor = (name) => {
    switch (name) {
        case 'linkedin':
        case 'linkedin-personal': return '#0077b5';
        case 'facebook': return '#1877f2';
        case 'instagram': return '#e4405f';
        case 'twitter': return '#000000';
        case 'google-business': return '#4285f4';
        case 'youtube-posts': return '#ff0000';
        case 'reddit': return '#ff4500';
        default: return '#666';
    }
};

const CHAR_LIMITS = {
    'twitter': 280,
    'linkedin': 3000,
    'linkedin-personal': 3000,
    'instagram': 2200,
    'facebook': 63206,
    'google-business': 1500,
    'youtube-posts': 500
};

export default function QuickPost() {
    const { showSuccess, showError } = useNotification();
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // State for form data
    const [selectedPlatforms, setSelectedPlatforms] = useState({});
    const [content, setContent] = useState({});
    const [files, setFiles] = useState({}); // { platformName: File[] }

    useEffect(() => {
        fetchPlatforms();
    }, []);

    const fetchPlatforms = async () => {
        try {
            const response = await axios.get('/api/platforms');
            const activePlatforms = response.data.filter(p => p.is_active);
            setPlatforms(activePlatforms);

            // Select all by default
            const initialSelected = {};
            activePlatforms.forEach(p => initialSelected[p.name] = true);
            setSelectedPlatforms(initialSelected);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching platforms:', err);
            showError('Failed to load platforms');
            setLoading(false);
        }
    };

    const handleContentChange = (platformName, text) => {
        setContent(prev => ({
            ...prev,
            [platformName]: text
        }));
    };

    const togglePlatform = (platformName) => {
        setSelectedPlatforms(prev => ({
            ...prev,
            [platformName]: !prev[platformName]
        }));
    };

    const handleFileUpload = async (platformName, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app we'd upload immediately or store file object
        // For now let's simulate upload by storing file object
        // We'll upload it when publishing

        setFiles(prev => ({
            ...prev,
            [platformName]: [...(prev[platformName] || []), file]
        }));
    };

    const removeFile = (platformName, index) => {
        setFiles(prev => ({
            ...prev,
            [platformName]: prev[platformName].filter((_, i) => i !== index)
        }));
    };

    const handlePublishAll = async () => {
        const platformsToPublish = platforms.filter(p => selectedPlatforms[p.name] && content[p.name]?.trim());

        if (platformsToPublish.length === 0) {
            showError('Please select platforms and enter content');
            return;
        }

        // Validate limits
        for (const p of platformsToPublish) {
            const limit = CHAR_LIMITS[p.name] || 2000;
            if (content[p.name].length > limit) {
                showError(`${p.display_name} content exceeds limit (${limit} chars)`);
                return;
            }
        }

        setPublishing(true);

        try {
            // 1. Create Quick Post container
            const createRes = await axios.post('/api/quick-post', {
                title: `Quick Post - ${new Date().toLocaleString()}`,
                items: platformsToPublish.map(p => ({
                    platform_id: p.id,
                    content: content[p.name]
                }))
            });

            const quickPostId = createRes.data.id;
            const items = createRes.data.items;

            // 2. Upload files and attach to items
            for (const item of items) {
                const platformFiles = files[item.platform_name] || []; // Note: item needs platform_name from backend or we map it
                // Actually createRes.data.items might not have platform_name, let's map by platform_id
                const platform = platforms.find(p => p.id === item.platform_id);
                const pFiles = files[platform.name] || [];

                for (const file of pFiles) {
                    const formData = new FormData();
                    formData.append('file', file);

                    // Upload file
                    const uploadRes = await axios.post('/api/quick-post/upload', formData);

                    // Attach to item
                    await axios.post(`/api/quick-post/item/${item.id}/attach`, {
                        path: uploadRes.data.path,
                        originalName: uploadRes.data.originalName,
                        mimeType: uploadRes.data.mimeType
                    });
                }
            }

            // 3. Publish
            await axios.post(`/api/quick-post/${quickPostId}/publish`);

            showSuccess('Published successfully!');

            // Reset form
            setContent({});
            setFiles({});

        } catch (err) {
            console.error('Publish error:', err);
            showError('Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader className="spin" /></div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Quick Post</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Publish content directly to multiple platforms without AI generation.
                    </p>
                </div>

                {/* View Switcher */}
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

            <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(500px, 1fr))' : '1fr',
                gap: '24px'
            }}>
                {platforms.map(platform => {
                    const isSelected = selectedPlatforms[platform.name];
                    const text = content[platform.name] || '';
                    const limit = CHAR_LIMITS[platform.name] || 2000;
                    const isOverLimit = text.length > limit;
                    const platformFiles = files[platform.name] || [];

                    return (
                        <div key={platform.id} style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '16px',
                            border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                            opacity: isSelected ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '16px',
                                borderBottom: isSelected ? '1px solid var(--border-color)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }} onClick={() => togglePlatform(platform.name)}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => { }} // Handled by parent div click
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                                />
                                <div style={{
                                    color: getPlatformColor(platform.name),
                                    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
                                }}>
                                    {getPlatformIcon(platform.name)}
                                    {platform.display_name}
                                </div>
                            </div>

                            {/* Content Area */}
                            {isSelected && (
                                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <textarea
                                        value={text}
                                        onChange={(e) => handleContentChange(platform.name, e.target.value)}
                                        placeholder={`Write your post for ${platform.display_name}...`}
                                        style={{
                                            width: '100%',
                                            minHeight: '150px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${isOverLimit ? 'var(--error)' : 'var(--border-color)'}`,
                                            background: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            marginBottom: '12px',
                                            flex: 1
                                        }}
                                    />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {/* File Upload */}
                                            <label style={{
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '13px', color: 'var(--accent)',
                                                padding: '6px 10px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '6px'
                                            }}>
                                                <ImageIcon size={16} />
                                                Add Media
                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={(e) => handleFileUpload(platform.name, e)}
                                                />
                                            </label>

                                            {/* File List */}
                                            {platformFiles.map((file, idx) => (
                                                <div key={idx} style={{
                                                    fontSize: '12px',
                                                    background: 'var(--bg-tertiary)',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    {file.name.substring(0, 15)}...
                                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFile(platform.name, idx)} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Char Counter */}
                                        <div style={{
                                            fontSize: '12px',
                                            color: isOverLimit ? 'var(--error)' : 'var(--text-secondary)',
                                            fontWeight: isOverLimit ? 'bold' : 'normal',
                                            background: 'var(--bg-tertiary)',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {text.length} / {limit}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sticky Footer */}
            <div style={{
                position: 'sticky',
                bottom: '24px',
                marginTop: '32px',
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {Object.values(selectedPlatforms).filter(Boolean).length} platforms selected
                </div>

                <button
                    onClick={handlePublishAll}
                    disabled={publishing}
                    style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '100px',
                        fontWeight: '600',
                        cursor: publishing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: publishing ? 0.7 : 1
                    }}
                >
                    {publishing ? <Loader className="spin" size={18} /> : <Send size={18} />}
                    {publishing ? 'Publishing...' : 'Publish All'}
                </button>
            </div>
        </div>
    );
}
