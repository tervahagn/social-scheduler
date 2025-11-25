import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Share2, Copy, CheckCircle, Circle, AlertCircle, Loader, RefreshCw, Calendar, Edit2, LayoutGrid, List, RotateCcw, Check, X, Clock } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import { getPlatformConfig } from '../config/platforms';

export default function ContentEditor() {
    const { briefId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const [brief, setBrief] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [correctionModal, setCorrectionModal] = useState(null);
    const [correctionPrompt, setCorrectionPrompt] = useState('');
    const [processing, setProcessing] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // { postId, content }
    const [loadingPosts, setLoadingPosts] = useState(new Set()); // Track which posts are generating
    const [versionDropdowns, setVersionDropdowns] = useState({});  // { postId: { open: bool, versions: [] } }
    const [loadingVersions, setLoadingVersions] = useState(new Set());

    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchData();
    }, [briefId]);

    const fetchData = async () => {
        try {
            const [briefRes, postsRes] = await Promise.all([
                axios.get(`/api/briefs/${briefId}`),
                axios.get(`/api/briefs/${briefId}/posts`)
            ]);

            setBrief(briefRes.data);
            setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            showError('Failed to load content');
            setLoading(false);
        }
    };

    const handleGenerateContent = async () => {
        setGenerating(true);
        try {
            // Call API to create placeholder posts
            const response = await axios.post(`/api/content/brief/${briefId}/generate`);
            const placeholders = response.data;

            // Immediately show cards with loading states
            setPosts(placeholders);
            setLoadingPosts(new Set(placeholders.map(p => p.id)));

            showSuccess(`Generating content for ${placeholders.length} platforms...`);

            // Start polling for updates
            const pollInterval = setInterval(async () => {
                try {
                    const postsResponse = await axios.get(`/api/briefs/${briefId}/posts`);
                    const updatedPosts = postsResponse.data;

                    setPosts(updatedPosts);

                    // Check which posts are still generating
                    const stillGenerating = updatedPosts.filter(p =>
                        p.status === 'generating' || !p.content
                    );

                    if (stillGenerating.length === 0) {
                        // All done!
                        clearInterval(pollInterval);
                        setGenerating(false);
                        setLoadingPosts(new Set());
                        showSuccess(`Content generated successfully for ${updatedPosts.length} platforms!`);
                    } else {
                        // Update loading states for posts still generating
                        setLoadingPosts(new Set(stillGenerating.map(p => p.id)));
                    }
                } catch (pollErr) {
                    console.error('Polling error:', pollErr);
                    // Don't stop on poll errors, keep trying
                }
            }, 1500); // Poll every 1.5 seconds

            // Safety timeout: stop polling after 2 minutes
            setTimeout(() => {
                if (pollInterval) {
                    clearInterval(pollInterval);
                    setGenerating(false);
                    setLoadingPosts(new Set());
                }
            }, 120000); // 2 minutes max

        } catch (err) {
            console.error('Error generating content:', err);
            showError(err.response?.data?.error || 'Failed to generate content');
            setGenerating(false);
        }
    };

    const handleCorrect = (post) => {
        setCorrectionModal({
            postId: post.id,
            platformName: post.platform_display_name,
            currentContent: post.content,
            version: post.version || 1
        });
        setCorrectionPrompt('');
    };

    const handleSubmitCorrection = async () => {
        if (!correctionPrompt.trim()) return;

        const postId = correctionModal.postId;

        // Close modal immediately and show loading state
        setCorrectionModal(null);
        setCorrectionPrompt('');
        setLoadingPosts(prev => new Set([...prev, postId]));

        try {
            const response = await axios.post(`/api/content/post/${postId}/correct`, {
                correctionPrompt
            });

            // Preserve platform info if not returned by API
            const currentPost = posts.find(p => p.id === postId);
            const updatedPost = {
                ...response.data,
                platform_display_name: response.data.platform_display_name || currentPost?.platform_display_name,
                platform_name: response.data.platform_name || currentPost?.platform_name
            };

            // Update posts list
            setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
            showSuccess(`Created v${updatedPost.version} for ${updatedPost.platform_display_name}`);
        } catch (err) {
            console.error('Error correcting post:', err);
            showError(err.response?.data?.error || 'Failed to correct post');
        } finally {
            setLoadingPosts(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const handleApprove = async (post) => {
        try {
            const response = await axios.post(`/api/posts/${post.id}/approve`);
            // Preserve platform_display_name and platform_name if not returned by API
            const updatedPost = {
                ...response.data,
                platform_display_name: response.data.platform_display_name || post.platform_display_name,
                platform_name: response.data.platform_name || post.platform_name
            };
            setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));

            if (response.data.status === 'approved') {
                showSuccess(`Approved ${post.platform_display_name}`);
            } else {
                showSuccess(`Un-approved ${post.platform_display_name}`);
            }
        } catch (err) {
            console.error('Error toggling approval:', err);
            showError('Failed to update approval status');
        }
    };

    const handleRegenerate = async (post) => {
        const postId = post.id;
        setLoadingPosts(prev => new Set([...prev, postId]));

        try {
            const response = await axios.post(`/api/content/post/${postId}/regenerate`);
            setPosts(prev => prev.map(p => p.id === postId ? response.data : p));
            showSuccess(`Regenerated ${post.platform_display_name}`);
        } catch (err) {
            console.error('Error regenerating post:', err);
            showError('Failed to regenerate post');
        } finally {
            setLoadingPosts(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const handleVersionClick = async (postId) => {
        // Toggle dropdown
        if (versionDropdowns[postId]?.open) {
            setVersionDropdowns(prev => ({
                ...prev,
                [postId]: { ...prev[postId], open: false }
            }));
            return;
        }

        // Fetch versions if not already loaded
        if (!versionDropdowns[postId]?.versions) {
            setLoadingVersions(prev => new Set([...prev, postId]));
            try {
                const response = await axios.get(`/api/content/post/${postId}/versions`);
                setVersionDropdowns(prev => ({
                    ...prev,
                    [postId]: { open: true, versions: response.data }
                }));
            } catch (err) {
                console.error('Error fetching versions:', err);
                showError('Failed to load version history');
            } finally {
                setLoadingVersions(prev => {
                    const next = new Set(prev);
                    next.delete(postId);
                    return next;
                });
            }
        } else {
            setVersionDropdowns(prev => ({
                ...prev,
                [postId]: { ...prev[postId], open: true }
            }));
        }
    };

    const handleSelectVersion = async (postId, version) => {
        setLoadingPosts(prev => new Set([...prev, postId]));
        try {
            // Find the version data
            const versionData = versionDropdowns[postId]?.versions.find(v => v.version === version);
            if (!versionData) return;

            // Update post content with the selected version
            const post = posts.find(p => p.id === postId);
            const updatedPost = {
                ...post,
                content: versionData.content,
                version: version
            };
            setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));

            // Close dropdown
            setVersionDropdowns(prev => ({
                ...prev,
                [postId]: { ...prev[postId], open: false }
            }));

            showSuccess(`Switched to version ${version}`);
        } catch (err) {
            console.error('Error switching version:', err);
            showError('Failed to switch version');
        } finally {
            setLoadingPosts(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    const handleApproveAll = async () => {
        setProcessing(true);
        try {
            const response = await axios.post(`/api/content/brief/${briefId}/approve-all`);
            setPosts(response.data);
            showSuccess('Approved all draft posts');
        } catch (err) {
            console.error('Error approving all:', err);
            showError('Failed to approve all posts');
        }
        setProcessing(false);
    };

    const handleEdit = (post) => {
        setEditingPost({ postId: post.id, content: post.content });
    };

    const handleSaveEdit = async () => {
        if (!editingPost) return;

        try {
            const response = await axios.put(`/api/posts/${editingPost.postId}`, {
                edited_content: editingPost.content
            });
            // Preserve platform info if not returned by API
            const updatedPost = {
                ...response.data,
                platform_display_name: response.data.platform_display_name || posts.find(p => p.id === editingPost.postId)?.platform_display_name,
                platform_name: response.data.platform_name || posts.find(p => p.id === editingPost.postId)?.platform_name
            };
            setPosts(prev => prev.map(p => p.id === editingPost.postId ? updatedPost : p));
            showSuccess('Post updated');
            setEditingPost(null);
        } catch (err) {
            console.error('Error saving edit:', err);
            showError('Failed to save changes');
        }
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
    };

    const handlePublish = async () => {
        if (!window.confirm('Publish all approved posts? This will send them to your configured platforms.')) {
            return;
        }

        setProcessing(true);
        try {
            const response = await axios.post(`/api/publish/brief/${briefId}`);
            // Refresh posts to show published status
            const postsRes = await axios.get(`/api/briefs/${briefId}/posts`);
            setPosts(postsRes.data);

            showSuccess(response.data.message || 'Posts published successfully!');
        } catch (err) {
            console.error('Error publishing:', err);
            showError(err.response?.data?.error || 'Failed to publish posts');
        }
        setProcessing(false);
    };

    const handlePublishSingle = async (post) => {
        if (!window.confirm(`Publish this ${post.platform_display_name} post?`)) {
            return;
        }

        setProcessing(true);
        try {
            const response = await axios.post(`/api/posts/${post.id}/publish`);
            // Update post to show published status
            const updatedPost = {
                ...response.data,
                platform_display_name: response.data.platform_display_name || post.platform_display_name
            };
            setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
            showSuccess(`${post.platform_display_name} post published successfully!`);
        } catch (err) {
            console.error('Error publishing post:', err);
            showError(err.response?.data?.error || `Failed to publish ${post.platform_display_name} post`);
        }
        setProcessing(false);
    };

    if (loading) return <div className="loading">Loading...</div>;

    const hasDrafts = posts.some(p => p.status === 'draft');
    const hasApproved = posts.some(p => p.status === 'approved');

    const handleBulkApprove = async () => {
        if (!window.confirm('Approve all generated posts?')) return;

        try {
            await Promise.all(posts.map(post =>
                axios.put(`/api/content/${post.id}/status`, { status: 'approved' })
            ));

            setPosts(prev => prev.map(p => ({ ...p, status: 'approved', approved_at: new Date().toISOString() })));
            showSuccess('All posts approved');
        } catch (err) {
            showError('Failed to approve posts');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/history')}
                    className="button button-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                >
                    <ArrowLeft size={16} />
                    Back to History
                </button>

                {posts.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>
                            {brief?.title || 'Content Editor'}
                        </h1>
                        <button
                            onClick={() => navigate(`/new`, { state: { editBrief: brief } })}
                            className="button button-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Edit2 size={16} />
                            Edit Brief
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={20} className="text-accent" />
                            Generated Content
                        </h2>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {/* View Switcher */}
                            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                    style={{
                                        padding: '6px',
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
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                    style={{
                                        padding: '6px',
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
                                    <List size={18} />
                                </button>
                            </div>


                            {/* Action Buttons */}
                            {hasApproved && (
                                <>
                                    <button
                                        onClick={handlePublish}
                                        disabled={processing}
                                        className="button"
                                        style={{
                                            background: 'var(--success)',
                                            color: 'white',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            padding: '8px 12px'
                                        }}
                                    >
                                        {processing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                                        Publish Now
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setProcessing(true);
                                            try {
                                                const approvedPosts = posts.filter(p => p.status === 'approved');
                                                for (const post of approvedPosts) {
                                                    const response = await axios.post(`/api/posts/${post.id}/approve`);
                                                    setPosts(prev => prev.map(p => p.id === post.id ? response.data : p));
                                                }
                                                showSuccess('Un-approved all posts');
                                            } catch (err) {
                                                console.error('Error un-approving all:', err);
                                                showError('Failed to un-approve all posts');
                                            }
                                            setProcessing(false);
                                        }}
                                        disabled={processing}
                                        className="button button-secondary"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            padding: '8px 12px'
                                        }}
                                    >
                                        <X size={16} />
                                        Un-approve All
                                    </button>
                                </>
                            )}

                            {hasDrafts && !hasApproved && (
                                <button
                                    onClick={handleApproveAll}
                                    disabled={processing}
                                    className="button"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 12px' }}
                                >
                                    <CheckCircle size={16} />
                                    Approve All
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Brief Details Card */}
                <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                        Brief Content
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                        {brief?.content}
                    </p>

                    {/* Attached Files */}
                    {brief?.files && brief.files.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Attached Files
                            </h4>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {brief.files.filter(f => f.category === 'media').map((file, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '6px',
                                        fontSize: '13px'
                                    }}>
                                        {file.mime_type?.startsWith('image/') && (
                                            <img
                                                src={file.file_path}
                                                alt={file.original_name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500' }}>{file.original_name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                Media • {(file.file_size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {brief.files.filter(f => f.category === 'document').map((file, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '6px',
                                        fontSize: '13px'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'var(--primary)',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: '600'
                                        }}>
                                            {file.original_name.split('.').pop().toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500' }}>{file.original_name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                Document • {(file.file_size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Link */}
                    {brief?.link_url && (
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Link
                            </h4>
                            <a
                                href={brief.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 12px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: 'var(--primary)',
                                    textDecoration: 'none'
                                }}
                            >
                                {brief.link_url}
                            </a>
                        </div>
                    )}

                    {/* Selected Platforms */}
                    {brief?.selected_platforms && (
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Selected Platforms
                            </h4>
                            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                {JSON.parse(brief.selected_platforms).length} platform{JSON.parse(brief.selected_platforms).length !== 1 ? 's' : ''} selected
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Generate or Edit */}
            {posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <Sparkles size={32} color="white" />
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                        Generate Platform Content
                    </h2>
                    <p className="text-secondary" style={{ maxWidth: '500px', margin: '0 auto 32px', fontSize: '15px', lineHeight: '1.6' }}>
                        Create platform-specific content directly from your brief. Each platform will get optimized content ready for review.
                    </p>

                    <button
                        onClick={handleGenerateContent}
                        disabled={generating}
                        className="button"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '16px', padding: '12px 24px' }}
                    >
                        {generating ? (
                            <>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Content
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : '1fr',
                        gap: '24px'
                    }}>
                        {posts.map(post => {
                            const platformConfig = getPlatformConfig(post.platform_name);
                            const platformColor = platformConfig.color;
                            const PlatformIcon = platformConfig.icon;
                            const isApproved = post.status === 'approved';

                            return (
                                <div
                                    key={post.id}
                                    className="card"
                                    style={{
                                        padding: '24px',
                                        borderLeft: `4px solid ${platformColor}`,
                                        position: 'relative',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Background Watermark Icon */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        opacity: 0.05,
                                        transform: 'rotate(15deg)',
                                        pointerEvents: 'none'
                                    }}>
                                        <PlatformIcon size={120} color="var(--text-primary)" />
                                    </div>

                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                {/* Icon Container */}
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: platformColor + '15',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: platformColor,
                                                    flexShrink: 0
                                                }}>
                                                    <PlatformIcon size={24} />
                                                </div>

                                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: platformColor, margin: 0 }}>
                                                    {post.platform_display_name}
                                                </h3>

                                                {/* Version Badge/Dropdown */}
                                                {(() => {
                                                    // Show dropdown if current version > 1 OR if we have multiple versions loaded
                                                    const hasMultipleVersions = post.version > 1 || (versionDropdowns[post.id]?.versions?.length > 1);
                                                    const displayVersion = post.version || 1;

                                                    return hasMultipleVersions ? (
                                                        /* Dropdown for multiple versions */
                                                        <div style={{ position: 'relative' }}>
                                                            <button
                                                                onClick={() => handleVersionClick(post.id)}
                                                                style={{
                                                                    fontSize: '12px',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px',
                                                                    background: 'var(--bg-tertiary)',
                                                                    color: 'var(--text-secondary)',
                                                                    border: '1px solid var(--border)',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                v{displayVersion}
                                                                <span style={{ fontSize: '10px' }}>▼</span>
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {versionDropdowns[post.id]?.open && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    marginTop: '4px',
                                                                    background: 'var(--bg-primary)',
                                                                    border: '1px solid var(--border)',
                                                                    borderRadius: '8px',
                                                                    padding: '4px',
                                                                    minWidth: '80px',
                                                                    zIndex: 10,
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                                }}>
                                                                    {versionDropdowns[post.id]?.versions?.map(v => (
                                                                        <button
                                                                            key={v.version}
                                                                            onClick={() => handleSelectVersion(post.id, v.version)}
                                                                            style={{
                                                                                display: 'block',
                                                                                width: '100%',
                                                                                padding: '6px 10px',
                                                                                background: v.version === displayVersion ? 'var(--bg-tertiary)' : 'transparent',
                                                                                border: 'none',
                                                                                borderRadius: '4px',
                                                                                textAlign: 'left',
                                                                                cursor: 'pointer',
                                                                                fontSize: '13px',
                                                                                color: 'var(--text-primary)'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                if (v.version !== displayVersion) {
                                                                                    e.target.style.background = 'var(--bg-secondary)';
                                                                                }
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                if (v.version !== displayVersion) {
                                                                                    e.target.style.background = 'transparent';
                                                                                }
                                                                            }}
                                                                        >
                                                                            v{v.version} {v.version === displayVersion && '✓'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* Simple badge for v1 only (no history) */
                                                        <span style={{
                                                            fontSize: '12px',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            background: 'var(--bg-tertiary)',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            v{displayVersion}
                                                        </span>
                                                    );
                                                })()}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '13px',
                                                    color: isApproved ? 'var(--success)' : 'var(--text-secondary)'
                                                }}>
                                                    {isApproved ? <CheckCircle size={14} /> : <Circle size={14} />}
                                                    {isApproved ? 'Approved' : 'Draft'}
                                                </div>
                                            </div>
                                            {post.approved_at && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} />
                                                    Approved {new Date(post.approved_at).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    {loadingPosts.has(post.id) ? (
                                        // Loading State
                                        <div style={{
                                            padding: '40px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: platformColor }} />
                                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                Generating new version...
                                            </div>
                                        </div>
                                    ) : editingPost?.postId === post.id ? (
                                        // Edit Mode
                                        <textarea
                                            className="textarea"
                                            value={editingPost.content}
                                            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                            style={{
                                                minHeight: '200px',
                                                marginBottom: '16px',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    ) : (
                                        // View Mode
                                        <div style={{
                                            padding: '16px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            maxHeight: '300px',
                                            overflowY: 'auto'
                                        }}>
                                            {post.content}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {editingPost?.postId === post.id ? (
                                            // Edit Mode Actions
                                            <>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="button"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                                >
                                                    <Check size={14} />
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="button button-secondary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                                >
                                                    <X size={14} />
                                                    Cancel
                                                </button>
                                            </>
                                        ) : !loadingPosts.has(post.id) && (
                                            // Normal Actions
                                            <>
                                                <button
                                                    onClick={() => handleRegenerate(post)}
                                                    disabled={isApproved}
                                                    className="button button-secondary"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        opacity: isApproved ? 0.5 : 1,
                                                        cursor: isApproved ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <RotateCcw size={14} />
                                                    Regenerate
                                                </button>

                                                <button
                                                    onClick={() => handleCorrect(post)}
                                                    disabled={isApproved}
                                                    className="button button-secondary"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        opacity: isApproved ? 0.5 : 1,
                                                        cursor: isApproved ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <Sparkles size={14} />
                                                    Request Changes
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    disabled={isApproved}
                                                    className="button button-secondary"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        opacity: isApproved ? 0.5 : 1,
                                                        cursor: isApproved ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleApprove(post)}
                                                    className="button"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        background: isApproved ? 'var(--bg-secondary)' : 'var(--success)',
                                                        color: isApproved ? 'var(--text-primary)' : 'white',
                                                        border: isApproved ? '1px solid var(--border)' : 'none'
                                                    }}
                                                >
                                                    {isApproved ? <X size={14} /> : <Check size={14} />}
                                                    {isApproved ? 'Un-approve' : 'Approve'}
                                                </button>

                                                {isApproved && (
                                                    <button
                                                        onClick={() => handlePublishSingle(post)}
                                                        disabled={processing}
                                                        className="button"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '13px',
                                                            background: 'var(--success)',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {processing ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Share2 size={14} />}
                                                        Publish
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Correction Modal */}
            {correctionModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="card" style={{
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        padding: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                            Request Changes - {correctionModal.platformName}
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Current version (v{correctionModal.version}):
                            </div>
                            <div style={{
                                padding: '12px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {correctionModal.currentContent}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                                What should be changed?
                            </label>
                            <textarea
                                className="textarea"
                                value={correctionPrompt}
                                onChange={(e) => setCorrectionPrompt(e.target.value)}
                                placeholder="e.g., Make it shorter and more professional..."
                                style={{ minHeight: '100px', width: '100%' }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setCorrectionModal(null)}
                                className="button button-secondary"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitCorrection}
                                className="button"
                                disabled={processing || !correctionPrompt.trim()}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {processing ? (
                                    <>
                                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Generate v{correctionModal.version + 1}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
