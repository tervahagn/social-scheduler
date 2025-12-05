import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, FileText, Zap, Filter, ArrowLeft, ExternalLink, LayoutGrid, List } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
    approved: { label: 'Approved', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    scheduled: { label: 'Scheduled', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    published: { label: 'Published', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
};

export default function PostHistory() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const navigate = useNavigate();
    const { showError } = useNotification();

    useEffect(() => {
        fetchHistory();
    }, [statusFilter, sourceFilter]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (sourceFilter !== 'all') params.append('source', sourceFilter);

            const response = await axios.get(`/api/history?${params}`);
            setPosts(response.data.posts);
            setStatusCounts(response.data.statusCounts || {});
        } catch (err) {
            console.error(err);
            showError('Failed to load history');
        }
        setLoading(false);
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                color: config.color,
                background: config.bg
            }}>
                {status === 'scheduled' && <Clock size={12} />}
                {status === 'published' && <Send size={12} />}
                {config.label}
            </span>
        );
    };

    const SourceBadge = ({ source }) => {
        const isQuick = source === 'quick';
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '500',
                color: isQuick ? '#8b5cf6' : '#6366f1',
                background: isQuick ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)'
            }}>
                {isQuick ? <Zap size={10} /> : <FileText size={10} />}
                {isQuick ? 'Quick' : 'Brief'}
            </span>
        );
    };

    if (loading) return <div className="loading">Loading history...</div>;

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="button button-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Post History</h1>
                    <p className="text-secondary">View and manage all your posts</p>
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

            {/* Filters */}
            <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} className="text-secondary" />
                        <span className="text-secondary" style={{ fontSize: '14px' }}>Filters:</span>
                    </div>

                    {/* Status Filter */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['all', 'draft', 'approved', 'scheduled', 'published'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: statusFilter === status ? 'var(--accent)' : 'var(--border-color)',
                                    background: statusFilter === status ? 'var(--accent)' : 'transparent',
                                    color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {status === 'all' ? 'All' : STATUS_CONFIG[status]?.label}
                                {status !== 'all' && statusCounts[status] > 0 && (
                                    <span style={{
                                        background: statusFilter === status ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        fontSize: '11px'
                                    }}>
                                        {statusCounts[status]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Source Filter */}
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        {[
                            { key: 'all', label: 'All Sources' },
                            { key: 'brief', label: 'Briefs', icon: FileText },
                            { key: 'quick', label: 'Quick Posts', icon: Zap }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setSourceFilter(key)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: sourceFilter === key ? 'var(--accent)' : 'var(--border-color)',
                                    background: sourceFilter === key ? 'var(--accent)' : 'transparent',
                                    color: sourceFilter === key ? 'white' : 'var(--text-secondary)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {Icon && <Icon size={14} />}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'var(--bg-tertiary)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 24px'
                    }}>
                        <FileText size={32} color="var(--text-secondary)" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No posts found</h3>
                    <p className="text-secondary">Create a brief or quick post to get started.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
                    gap: viewMode === 'grid' ? '20px' : '12px'
                }}>
                    {posts.map(post => (
                        <div
                            key={`${post.source}-${post.id}`}
                            className="card"
                            style={{
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderLeft: '4px solid transparent'
                            }}
                            onClick={() => {
                                if (post.source === 'brief') {
                                    navigate(`/brief/${post.brief_id}/edit`);
                                }
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)';
                                e.currentTarget.style.borderLeftColor = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.borderLeftColor = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <StatusBadge status={post.status} />
                                        <SourceBadge source={post.source} />
                                        <span style={{
                                            fontSize: '12px',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {post.platform_display_name}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                        {post.brief_title || 'Untitled'}
                                    </h3>

                                    {/* Content preview */}
                                    <p className="text-secondary" style={{
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {post.edited_content || post.content}
                                    </p>
                                </div>

                                {/* Timestamp */}
                                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                    {post.published_at ? (
                                        <div>
                                            <div style={{ color: '#10b981', fontWeight: '500' }}>Published</div>
                                            <div>{new Date(post.published_at).toLocaleDateString()}</div>
                                        </div>
                                    ) : post.scheduled_at ? (
                                        <div>
                                            <div style={{ color: '#f59e0b', fontWeight: '500' }}>Scheduled</div>
                                            <div>{new Date(post.scheduled_at).toLocaleDateString()}</div>
                                        </div>
                                    ) : (
                                        <div>{new Date(post.created_at).toLocaleDateString()}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
