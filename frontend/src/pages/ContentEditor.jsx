import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Share2, Copy, CheckCircle, Circle, AlertCircle, Loader, RefreshCw, Calendar, Edit2, LayoutGrid, List } from 'lucide-react';
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

    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('list');

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
            setPosts(postsRes.data);
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
            const response = await axios.post(`/api/content/brief/${briefId}/generate`);
            setPosts(response.data);
            showSuccess(`Generated content for ${response.data.length} platforms`);
        } catch (err) {
            console.error('Error generating content:', err);
            showError(err.response?.data?.error || 'Failed to generate content');
        }
        setGenerating(false);
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

            // Update posts list
            setPosts(prev => prev.map(p => p.id === postId ? response.data : p));
            showSuccess(`Created v${response.data.version} for ${response.data.platform_display_name}`);
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
            setPosts(prev => prev.map(p => p.id === post.id ? response.data : p));

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
        if (!window.confirm(`Regenerate ${post.platform_display_name} from scratch? This will delete all versions.`)) {
            return;
        }

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
            setPosts(prev => prev.map(p => p.id === editingPost.postId ? response.data : p));
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

                            <button
                                onClick={handleBulkApprove}
                                className="button button-secondary"
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                Approve All
                            </button>
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
                    {/* Action Bar - Publish & Bulk Actions */}
                    {posts.length > 0 && (
                        <div className="card" style={{
                            padding: '16px 20px',
                            marginBottom: '24px',
                            background: hasApproved ? 'linear-gradient(135deg, var(--success), #059669)' : 'var(--bg-primary)',
                            color: hasApproved ? 'white' : 'var(--text-primary)',
                            border: hasApproved ? 'none' : '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                {/* Status */}
                                <div style={{ flex: '1', minWidth: '200px' }}>
                                    {hasApproved ? (
                                        <>
                                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CheckCircle size={20} />
                                                Ready to Publish
                                            </div>
                                            <div style={{ fontSize: '13px', opacity: 0.9 }}>
                                                {posts.filter(p => p.status === 'approved').length} of {posts.length} platform{posts.length !== 1 ? 's' : ''} approved
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Content Review</div>
                                            <div className="text-secondary" style={{ fontSize: '13px' }}>
                                                {posts.filter(p => p.status === 'draft').length} platform{posts.filter(p => p.status === 'draft').length !== 1 ? 's' : ''} pending approval
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {hasApproved && (
                                        <>
                                            <button
                                                onClick={handlePublish}
                                                disabled={processing}
                                                className="button"
                                                style={{
                                                    background: 'white',
                                                    color: 'var(--success)',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
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
                                                className="button"
                                                style={{
                                                    background: 'rgba(255,255,255,0.2)',
                                                    color: 'white',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
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
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <CheckCircle size={16} />
                                            Approve All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : '1fr',
                        gap: '24px'
                    }}>
                        {posts.map(post => {
                            const platformColor = getPlatformConfig(post.platform).color;
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
                                        flexDirection: 'column'
                                    }}
                                >                              {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: platformColor }}>
                                                    {post.platform_display_name}
                                                </h3>
                                                {post.version > 1 && (
                                                    <span style={{
                                                        fontSize: '12px',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        background: 'var(--bg-tertiary)',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        v{post.version}
                                                    </span>
                                                )}
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
