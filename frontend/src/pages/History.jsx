import { useState, useEffect } from 'react';
import { getBriefs, deleteBrief } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Trash2, Copy, ChevronRight, ArrowLeft, Calendar, LayoutGrid, List } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function History() {
    const [briefs, setBriefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchBriefs();
    }, []);

    const fetchBriefs = async () => {
        try {
            const data = await getBriefs();
            setBriefs(data);
        } catch (err) {
            console.error(err);
            showError('Failed to load history');
        }
        setLoading(false);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this brief? This action cannot be undone.')) {
            try {
                await deleteBrief(id);
                setBriefs(prev => prev.filter(b => b.id !== id));
                showSuccess('Brief deleted successfully');
            } catch (err) {
                showError('Failed to delete brief');
            }
        }
    };

    const handleBranch = (e, brief) => {
        e.stopPropagation();
        navigate('/new', {
            state: {
                title: brief.title,
                content: brief.content
            }
        });
    };

    if (loading) return <div className="loading">Loading history...</div>;

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="button button-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                    >
                        <ArrowLeft size={16} />
                        Back to New Brief
                    </button>
                    <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Brief History</h1>
                    <p className="text-secondary">Manage and revisit your past content briefs</p>
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

            {briefs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <FileText size={32} color="var(--text-secondary)" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No briefs yet</h3>
                    <p className="text-secondary" style={{ marginBottom: '24px' }}>Create your first brief to get started with AI-powered content generation.</p>
                    <button onClick={() => navigate('/new')} className="button">
                        Create New Brief
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
                    gap: '24px'
                }}>
                    {briefs.map(brief => (
                        <div
                            key={brief.id}
                            className="card"
                            onClick={() => navigate(`/brief/${brief.slug || brief.id}/edit`)}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                padding: '24px',
                                borderLeft: '4px solid transparent',
                                position: 'relative',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                e.currentTarget.style.borderLeftColor = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderLeftColor = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row', justifyContent: 'space-between', alignItems: viewMode === 'grid' ? 'stretch' : 'flex-start', gap: '24px', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {brief.title || 'Untitled Brief'}
                                        </h3>
                                        <span style={{
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Calendar size={12} />
                                            {new Date(brief.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <p className="text-secondary" style={{
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        marginBottom: '16px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: viewMode === 'grid' ? '3' : '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {brief.content}
                                    </p>

                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                        {brief.media_url && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                📎 Has Media
                                            </span>
                                        )}
                                        {brief.link_url && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                🔗 Has Link
                                            </span>
                                        )}
                                        {brief.selected_platforms && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                📱 {JSON.parse(brief.selected_platforms).length} Platforms
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: viewMode === 'grid' ? 'row' : 'column', gap: '8px', marginTop: viewMode === 'grid' ? '16px' : '0' }}>
                                    <button
                                        onClick={(e) => handleBranch(e, brief)}
                                        className="button button-secondary"
                                        style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                                        title="Create new brief from this one"
                                    >
                                        <Copy size={14} />
                                        Branch
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, brief.id)}
                                        className="button button-secondary"
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '13px',
                                            color: 'var(--danger)',
                                            borderColor: 'var(--danger)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}
                                        title="Delete brief"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
