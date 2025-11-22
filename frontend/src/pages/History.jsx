import { useState, useEffect } from 'react';
import { getBriefs } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle } from 'lucide-react';

export default function History() {
    const [briefs, setBriefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBriefs = async () => {
            try {
                const data = await getBriefs();
                setBriefs(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchBriefs();
    }, []);

    if (loading) return <div className="loading">Loading history...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '24px' }}>Brief History</h1>

            {briefs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="text-secondary">No briefs created yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {briefs.map(brief => (
                        <div
                            key={brief.id}
                            className="card"
                            onClick={() => navigate(`/preview/${brief.id}`)}
                            style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FileText size={24} color="var(--accent)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                        {brief.title || 'Untitled'}
                                    </h3>
                                    <p className="text-secondary text-sm" style={{ marginBottom: '8px' }}>
                                        {brief.content.substring(0, 120)}
                                        {brief.content.length > 120 && '...'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={14} />
                                            {new Date(brief.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        {brief.media_url && <span>📎 Media</span>}
                                        {brief.link_url && <span>🔗 Link</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
