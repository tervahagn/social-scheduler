import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Clock, Send, FileText, Zap, Filter, ArrowLeft,
    LayoutGrid, List, Trash2, Copy, Calendar, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { getBriefs, deleteBrief } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
    approved: { label: 'Approved', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    scheduled: { label: 'Scheduled', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    published: { label: 'Published', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
};

export default function Content() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'posts';

    const [posts, setPosts] = useState([]);
    const [briefs, setBriefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({});
    const [viewMode, setViewMode] = useState('grid');

    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        if (activeTab === 'posts') {
            fetchPosts();
        } else {
            fetchBriefs();
        }
    }, [activeTab, statusFilter, sourceFilter]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (sourceFilter !== 'all') params.append('source', sourceFilter);

            const response = await axios.get(`/api/history?${params}`);
            setPosts(response.data.posts || []);
            setStatusCounts(response.data.statusCounts || {});
        } catch (err) {
            console.error(err);
            showError('Failed to load posts');
        }
        setLoading(false);
    };

    const fetchBriefs = async () => {
        try {
            setLoading(true);
            const data = await getBriefs();
            setBriefs(data);
        } catch (err) {
            console.error(err);
            showError('Failed to load briefs');
        }
        setLoading(false);
    };

    const handleDeleteBrief = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this brief and all its posts?')) {
            try {
                await deleteBrief(id);
                setBriefs(prev => prev.filter(b => b.id !== id));
                showSuccess('Brief deleted');
            } catch (err) {
                showError('Failed to delete');
            }
        }
    };

    const handleBranch = (e, brief) => {
        e.stopPropagation();
        navigate('/new', { state: { title: brief.title, content: brief.content } });
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
                fontWeight: '500', color: config.color, background: config.bg
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
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', borderRadius: '8px', fontSize: '11px',
                fontWeight: '500',
                color: isQuick ? '#8b5cf6' : '#6366f1',
                background: isQuick ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)'
            }}>
                {isQuick ? <Zap size={10} /> : <FileText size={10} />}
                {isQuick ? 'Quick' : 'Brief'}
            </span>
        );
    };

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Content</h1>
                    <p className="text-secondary">All your briefs and posts in one place</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* View Toggle */}
                    <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <button onClick={() => setViewMode('grid')} title="Grid View"
                            style={{
                                padding: '8px', borderRadius: '6px', background: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
                                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                            }}>
                            <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} title="List View"
                            style={{
                                padding: '8px', borderRadius: '6px', background: viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent',
                                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                            }}>
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
                {[
                    { key: 'posts', label: 'Posts', icon: Send },
                    { key: 'briefs', label: 'Briefs', icon: FileText }
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            padding: '12px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
                            color: activeTab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === key ? '600' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '-1px'
                        }}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Filters (Posts tab only) */}
            {activeTab === 'posts' && (
                <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} className="text-secondary" />
                        </div>

                        {/* Status Filter */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {['all', 'draft', 'approved', 'scheduled', 'published'].map(status => (
                                <button key={status} onClick={() => setStatusFilter(status)}
                                    style={{
                                        padding: '5px 10px', borderRadius: '14px', border: '1px solid',
                                        borderColor: statusFilter === status ? 'var(--accent)' : 'var(--border-color)',
                                        background: statusFilter === status ? 'var(--accent)' : 'transparent',
                                        color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                                        fontSize: '12px', cursor: 'pointer'
                                    }}>
                                    {status === 'all' ? 'All' : STATUS_CONFIG[status]?.label}
                                </button>
                            ))}
                        </div>

                        {/* Source Filter */}
                        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'brief', label: 'Briefs' },
                                { key: 'quick', label: 'Quick' }
                            ].map(({ key, label }) => (
                                <button key={key} onClick={() => setSourceFilter(key)}
                                    style={{
                                        padding: '5px 10px', borderRadius: '8px', border: '1px solid',
                                        borderColor: sourceFilter === key ? 'var(--accent)' : 'var(--border-color)',
                                        background: sourceFilter === key ? 'var(--accent)' : 'transparent',
                                        color: sourceFilter === key ? 'white' : 'var(--text-secondary)',
                                        fontSize: '12px', cursor: 'pointer'
                                    }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && <div className="loading">Loading...</div>}

            {/* Posts Tab Content */}
            {!loading && activeTab === 'posts' && (
                posts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
                        <FileText size={32} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ marginBottom: '8px' }}>No posts yet</h3>
                        <p className="text-secondary">Create a brief or quick post to get started.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                        gap: viewMode === 'grid' ? '16px' : '10px'
                    }}>
                        {posts.map(post => (
                            <div key={`${post.source}-${post.id}`} className="card"
                                style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: '3px solid transparent' }}
                                onClick={() => post.source === 'brief' && navigate(`/brief/${post.brief_id}/edit`)}
                                onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = 'var(--accent)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <StatusBadge status={post.status} />
                                    <SourceBadge source={post.source} />
                                    <span style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                        {post.platform_display_name}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                                    {post.brief_title || 'Untitled'}
                                </h3>

                                <p className="text-secondary" style={{
                                    fontSize: '13px', lineHeight: '1.4',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    {post.edited_content || post.content}
                                </p>

                                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                    {post.published_at ? `Published ${new Date(post.published_at).toLocaleDateString()}` :
                                        post.scheduled_at ? `Scheduled ${new Date(post.scheduled_at).toLocaleDateString()}` :
                                            new Date(post.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Briefs Tab Content */}
            {!loading && activeTab === 'briefs' && (
                briefs.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
                        <FileText size={32} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ marginBottom: '8px' }}>No briefs yet</h3>
                        <p className="text-secondary">Create your first brief to get started.</p>
                        <button onClick={() => navigate('/new')} className="button" style={{ marginTop: '16px' }}>
                            Create New Brief
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                        gap: viewMode === 'grid' ? '16px' : '10px'
                    }}>
                        {briefs.map(brief => (
                            <div key={brief.id} className="card"
                                style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: '3px solid transparent' }}
                                onClick={() => navigate(`/brief/${brief.slug || brief.id}/edit`)}
                                onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = 'var(--accent)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={10} />
                                        {new Date(brief.created_at).toLocaleDateString()}
                                    </span>
                                    {brief.selected_platforms && (
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {JSON.parse(brief.selected_platforms).length} platforms
                                        </span>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                                    {brief.title || 'Untitled Brief'}
                                </h3>

                                <p className="text-secondary" style={{
                                    fontSize: '13px', lineHeight: '1.4',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    {brief.content}
                                </p>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button onClick={(e) => handleBranch(e, brief)}
                                        className="button button-secondary"
                                        style={{ padding: '6px 10px', fontSize: '12px', flex: 1 }}>
                                        <Copy size={12} /> Branch
                                    </button>
                                    <button onClick={(e) => handleDeleteBrief(e, brief.id)}
                                        className="button button-secondary"
                                        style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
