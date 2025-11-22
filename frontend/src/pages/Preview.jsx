import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBriefPosts, updatePost, approvePost, publishAllPosts } from '../services/api';
import { CheckCircle, Edit2, Send, Loader, ArrowLeft, Calendar, MessageSquare } from 'lucide-react';

function PostCard({ post, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.edited_content || post.content);
    const [scheduledAt, setScheduledAt] = useState(post.scheduled_at || '');
    const [scheduledComment, setScheduledComment] = useState(post.scheduled_comment || '');
    const [commentScheduledAt, setCommentScheduledAt] = useState(post.comment_scheduled_at || '');
    const [showSchedule, setShowSchedule] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updatePost(post.id, {
                edited_content: editedContent,
                scheduled_at: scheduledAt || null,
                scheduled_comment: scheduledComment || null,
                comment_scheduled_at: commentScheduledAt || null
            });
            setEditing(false);
            setShowSchedule(false);
            onUpdate();
        } catch (err) {
            alert('Failed to update: ' + err.message);
        }
        setLoading(false);
    };

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approvePost(post.id);
            onUpdate();
        } catch (err) {
            alert('Failed to approve: ' + err.message);
        }
        setLoading(false);
    };

    const displayContent = post.edited_content || post.content;
    const isApproved = post.status === 'approved';
    const isPublished = post.status === 'published';
    const isScheduled = post.scheduled_at && new Date(post.scheduled_at) > new Date();

    return (
        <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{post.platform_display_name}</h3>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', alignItems: 'center' }}>
                    {isScheduled && (
                        <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} />
                            {new Date(post.scheduled_at).toLocaleString()}
                        </span>
                    )}
                    {isPublished && (
                        <span style={{ color: 'var(--success)' }}>✓ Published</span>
                    )}
                    {isApproved && !isPublished && (
                        <span style={{ color: 'var(--accent)' }}>✓ Approved</span>
                    )}
                    {!isApproved && !isPublished && (
                        <span style={{ color: 'var(--text-secondary)' }}>Draft</span>
                    )}
                </div>
            </div>

            {editing ? (
                <div>
                    <textarea
                        className="textarea"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        style={{ minHeight: '150px', marginBottom: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSave} className="button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditing(false)} className="button button-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        marginBottom: '12px',
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        lineHeight: '1.6'
                    }}>
                        {displayContent}
                    </div>

                    {/* Schedule Section */}
                    {showSchedule ? (
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '12px'
                        }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Schedule Post
                            </label>
                            <input
                                type="datetime-local"
                                className="input mb-4"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                            />

                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                                <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Scheduled Comment (optional)
                            </label>
                            <textarea
                                className="textarea mb-4"
                                value={scheduledComment}
                                onChange={(e) => setScheduledComment(e.target.value)}
                                placeholder="Add a follow-up comment..."
                                style={{ minHeight: '80px' }}
                            />

                            {scheduledComment && (
                                <>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                                        Comment Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="input mb-4"
                                        value={commentScheduledAt}
                                        onChange={(e) => setCommentScheduledAt(e.target.value)}
                                    />
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={handleSave} className="button" disabled={loading}>
                                    Save Schedule
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSchedule(false);
                                        setScheduledAt(post.scheduled_at || '');
                                        setScheduledComment(post.scheduled_comment || '');
                                        setCommentScheduledAt(post.comment_scheduled_at || '');
                                    }}
                                    className="button button-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : post.scheduled_at || post.scheduled_comment ? (
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '12px',
                            fontSize: '13px'
                        }}>
                            {post.scheduled_at && (
                                <p style={{ marginBottom: '4px' }}>
                                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    Scheduled: {new Date(post.scheduled_at).toLocaleString()}
                                </p>
                            )}
                            {post.scheduled_comment && (
                                <p>
                                    <MessageSquare size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    Comment at: {new Date(post.comment_scheduled_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ) : null}

                    {!isPublished && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setEditing(true)}
                                className="button button-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Edit2 size={14} />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowSchedule(!showSchedule)}
                                className="button button-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Calendar size={14} />
                                {post.scheduled_at ? 'Edit Schedule' : 'Schedule'}
                            </button>
                            {!isApproved && (
                                <button
                                    onClick={handleApprove}
                                    className="button button-success"
                                    disabled={loading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <CheckCircle size={14} />
                                    Approve
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Preview() {
    const { briefId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');

    const fetchPosts = async () => {
        try {
            const data = await getBriefPosts(briefId);
            setPosts(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [briefId]);

    const handlePublishAll = async () => {
        const approved = posts.filter(p => p.status === 'approved' && !p.scheduled_at);
        if (approved.length === 0) {
            alert('No approved posts ready to publish immediately');
            return;
        }

        if (!confirm(`Publish ${approved.length} posts now?`)) {
            return;
        }

        setPublishing(true);
        try {
            const result = await publishAllPosts(briefId);
            alert(result.message);
            fetchPosts();
        } catch (err) {
            alert('Publishing error: ' + err.message);
        }
        setPublishing(false);
    };

    if (loading) return <div className="loading">Loading posts...</div>;
    if (error) return <div className="container"><div className="error">{error}</div></div>;

    const approvedCount = posts.filter(p => p.status === 'approved').length;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const scheduledCount = posts.filter(p => p.scheduled_at && new Date(p.scheduled_at) > new Date()).length;

    return (
        <div className="container">
            <button
                onClick={() => navigate('/')}
                className="button button-secondary mb-4"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ marginBottom: '4px' }}>Post Preview</h1>
                    <p className="text-secondary text-sm">
                        {publishedCount > 0 && `Published: ${publishedCount} • `}
                        {scheduledCount > 0 && `Scheduled: ${scheduledCount} • `}
                        Approved: {approvedCount} • Total: {posts.length}
                    </p>
                </div>
                {approvedCount > 0 && (
                    <button
                        onClick={handlePublishAll}
                        className="button button-success"
                        disabled={publishing}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {publishing ? (
                            <>
                                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Publish All ({approvedCount})
                            </>
                        )}
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
                ))}
            </div>
        </div>
    );
}
