import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader, Edit2, Check, X, RotateCcw, CheckCircle, Circle, Clock, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

export default function ContentEditor() {
    const { briefId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const [brief, setBrief] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [correctionModal, setCorrectionModal] = useState(null); // { postId, platformName, currentContent }
    const [correctionPrompt, setCorrectionPrompt] = useState('');
    const [processing, setProcessing] = useState(false);

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

        setProcessing(true);
        try {
            const response = await axios.post(`/api/content/post/${correctionModal.postId}/correct`, {
                correctionPrompt
            });

            // Update posts list
            setPosts(prev => prev.map(p => p.id === correctionModal.postId ? response.data : p));
            showSuccess(`Created v${response.data.version} for ${correctionModal.platformName}`);
            setCorrectionModal(null);
            setCorrectionPrompt('');
        } catch (err) {
            console.error('Error correcting post:', err);
            showError(err.response?.data?.error || 'Failed to correct post');
        }
        setProcessing(false);
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

        setProcessing(true);
        try {
            const response = await axios.post(`/api/content/post/${post.id}/regenerate`);
            setPosts(prev => prev.map(p => p.id === post.id ? response.data : p));
            showSuccess(`Regenerated ${post.platform_display_name}`);
        } catch (err) {
            console.error('Error regenerating post:', err);
            showError('Failed to regenerate post');
        }
        setProcessing(false);
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

    if (loading) return <div className="loading">Loading...</div>;

    const platformColors = {
        'linkedin': '#0077B5',
        'linkedin-personal': '#0077B5',
        'facebook': '#1877F2',
        'instagram': '#E4405F',
        'twitter': '#1DA1F2',
        'google-business': '#4285F4',
        'blog': '#FF6B6B',
        'reddit': '#FF4500',
        'youtube-posts': '#FF0000'
    };

    const hasDrafts = posts.some(p => p.status === 'draft');

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

                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                    {brief?.title || 'Content Editor'}
                </h1>
                <p className="text-secondary">
                    {brief?.content?.substring(0, 150)}{brief?.content?.length > 150 ? '...' : ''}
                </p>
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
                    {/* Bulk Actions */}
                    {hasDrafts && (
                        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Bulk Actions</div>
                                <div className="text-secondary" style={{ fontSize: '13px' }}>
                                    {posts.filter(p => p.status === 'draft').length} platform{posts.filter(p => p.status === 'draft').length !== 1 ? 's' : ''} pending approval
                                </div>
                            </div>
                            <button
                                onClick={handleApproveAll}
                                disabled={processing}
                                className="button"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <CheckCircle size={16} />
                                Approve All
                            </button>
                        </div>
                    )}

                    {/* Platform Cards */}
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {posts.map(post => {
                            const platformColor = platformColors[post.platform_name] || '#6366f1';
                            const isApproved = post.status === 'approved';

                            return (
                                <div
                                    key={post.id}
                                    className="card"
                                    style={{
                                        padding: '24px',
                                        borderLeft: `4px solid ${platformColor}`,
                                        position: 'relative'
                                    }}
                                >
                                    {/* Header */}
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

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => handleCorrect(post)}
                                            className="button button-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                        >
                                            <Edit2 size={14} />
                                            Request Changes
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

                                        <button
                                            onClick={() => handleRegenerate(post)}
                                            className="button button-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                        >
                                            <RotateCcw size={14} />
                                            Regenerate
                                        </button>
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
