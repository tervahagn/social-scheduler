import { useEffect, useState } from 'react';
import { getAnalyticsDashboard } from '../services/api';
import { BarChart2, TrendingUp, FileText, CheckCircle, Send, Zap } from 'lucide-react';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const dashboardData = await getAnalyticsDashboard();
            setData(dashboardData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading analytics...</div>;
    if (error) return <div className="error">{error}</div>;

    const { funnel, platforms, topPosts } = data;

    // Calculate rates
    const approvalRate = funnel.generated > 0 ? ((funnel.approved / funnel.generated) * 100).toFixed(1) : 0;
    const publishRate = funnel.approved > 0 ? ((funnel.published / funnel.approved) * 100).toFixed(1) : 0;

    return (
        <div className="container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ marginBottom: '8px' }}>Analytics</h1>
                <p className="text-secondary">Content performance overview</p>
            </div>

            {/* Funnel Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <StatCard
                    icon={FileText}
                    label="Briefs Created"
                    value={funnel.briefs}
                    color="var(--accent)"
                />
                <StatCard
                    icon={Zap}
                    label="Posts Generated"
                    value={funnel.generated}
                    color="var(--primary)"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Approved"
                    value={funnel.approved}
                    sublabel={`${approvalRate}% approval rate`}
                    color="var(--success)"
                />
                <StatCard
                    icon={Send}
                    label="Published"
                    value={funnel.published}
                    sublabel={`${publishRate}% publish rate`}
                    color="var(--purple)"
                />
            </div>

            {/* Platform Performance */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={20} />
                    Platform Performance
                </h2>

                {platforms.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {platforms.map((platform, idx) => {
                            const publishRate = platform.total_posts > 0
                                ? ((platform.published_count / platform.total_posts) * 100).toFixed(0)
                                : 0;

                            return (
                                <div key={idx} style={{
                                    padding: '16px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{platform.platform}</span>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            <span>{platform.total_posts} posts</span>
                                            <span>{platform.published_count} published</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{
                                        width: '100%',
                                        height: '6px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            width: `${publishRate}%`,
                                            height: '100%',
                                            background: 'var(--success)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <span>Publish rate: <strong style={{ color: 'var(--text-primary)' }}>{publishRate}%</strong></span>
                                        {platform.avg_edits > 0 && (
                                            <span>Avg edits: <strong style={{ color: 'var(--text-primary)' }}>{platform.avg_edits.toFixed(1)}</strong></span>
                                        )}
                                        {platform.avg_gen_time && (
                                            <span>Avg gen time: <strong style={{ color: 'var(--text-primary)' }}>{(platform.avg_gen_time / 1000).toFixed(1)}s</strong></span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No platform data available yet
                    </div>
                )}
            </div>

            {/* Top Posts */}
            <div className="card">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} />
                    Top Performing Posts
                </h2>

                {topPosts.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {topPosts.map((post) => (
                            <div key={post.id} style={{
                                padding: '16px',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginBottom: '8px' }}>
                                            {post.platform}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            color: 'var(--text-primary)',
                                            maxHeight: '60px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {post.content}
                                        </div>
                                    </div>

                                    <div style={{
                                        marginLeft: '16px',
                                        padding: '8px 16px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius)',
                                        textAlign: 'center',
                                        minWidth: '80px'
                                    }}>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                                            {post.engagement_rate ? post.engagement_rate.toFixed(1) : '0'}%
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            engagement
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>👍 {post.likes || 0}</span>
                                    <span>💬 {post.comments || 0}</span>
                                    <span>🔄 {post.shares || 0}</span>
                                    {post.collected_at && (
                                        <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
                                            {new Date(post.collected_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <TrendingUp size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <p>No engagement data collected yet</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>
                            Metrics will appear here once posts are published and tracked
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Minimal stat card component
function StatCard({ icon: Icon, label, value, sublabel, color }) {
    return (
        <div className="card" style={{
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Icon background decoration */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                opacity: 0.05,
            }}>
                <Icon size={80} />
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {label}
                    </span>
                </div>

                <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1', marginBottom: '8px' }}>
                    {value}
                </div>

                {sublabel && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {sublabel}
                    </div>
                )}
            </div>
        </div>
    );
}
