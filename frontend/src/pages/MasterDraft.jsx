import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getBrief,
    updateBrief,
    getMasterDrafts,
    correctMasterDraft,
    approveMasterDraft,
    generatePostsFromMaster,
    generateMasterDraft
} from '../services/api';
import {
    Loader,
    ArrowLeft,
    CheckCircle,
    MessageSquare,
    Send,
    Sparkles,
    FileEdit,
    ChevronRight,
    Edit2,
    X,
    Save
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function MasterDraft() {
    const { briefId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [brief, setBrief] = useState(null);
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [correctionPrompt, setCorrectionPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Brief editing state
    const [editingBrief, setEditingBrief] = useState(false);
    const [briefTitle, setBriefTitle] = useState('');
    const [briefContent, setBriefContent] = useState('');

    useEffect(() => {
        fetchData();
    }, [briefId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [briefData, draftsData] = await Promise.all([
                getBrief(briefId),
                getMasterDrafts(briefId)
            ]);

            if (!briefData) {
                throw new Error('Brief not found');
            }

            setBrief(briefData);
            setBriefTitle(briefData.title || '');
            setBriefContent(briefData.content || '');
            setDrafts(Array.isArray(draftsData) ? draftsData : []);

            if (Array.isArray(draftsData) && draftsData.length > 0) {
                setSelectedDraft(draftsData[0]); // Select latest
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            showError('Failed to load master draft data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDraft = async () => {
        try {
            setProcessing(true);
            const newDraft = await generateMasterDraft(briefId);
            setDrafts([newDraft]);
            setSelectedDraft(newDraft);
            showSuccess('Master draft generated successfully');
        } catch (err) {
            console.error('Error generating draft:', err);
            showError(err.response?.data?.error || 'Failed to generate draft');
        } finally {
            setProcessing(false);
        }
    };

    const handleCorrect = async (e) => {
        e.preventDefault();
        if (!correctionPrompt.trim() || !selectedDraft) return;

        try {
            setProcessing(true);
            const newDraft = await correctMasterDraft(selectedDraft.id, correctionPrompt);

            const updatedDrafts = [newDraft, ...drafts];
            setDrafts(updatedDrafts);
            setSelectedDraft(newDraft);
            setCorrectionPrompt('');
            showSuccess('Correction applied successfully');
        } catch (err) {
            console.error('Error correcting draft:', err);
            showError(err.response?.data?.error || 'Failed to correct draft');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedDraft) return;

        try {
            setProcessing(true);
            const updatedDraft = await approveMasterDraft(selectedDraft.id);

            const updatedDrafts = drafts.map(d =>
                d.id === updatedDraft.id ? updatedDraft : d
            );
            setDrafts(updatedDrafts);
            setSelectedDraft(updatedDraft);
            showSuccess('Draft approved! You can now generate posts.');
        } catch (err) {
            console.error('Error approving draft:', err);
            showError(err.response?.data?.error || 'Failed to approve draft');
        } finally {
            setProcessing(false);
        }
    };

    const handleGeneratePosts = async () => {
        if (!selectedDraft) return;

        try {
            setProcessing(true);
            await generatePostsFromMaster(selectedDraft.id);
            showSuccess('Posts generated successfully');
            navigate(`/preview/${briefId}`);
        } catch (err) {
            console.error('Error generating posts:', err);
            showError(err.response?.data?.error || 'Failed to generate posts');
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveBrief = async () => {
        if (!briefContent.trim()) {
            showError('Content is required');
            return;
        }

        try {
            setProcessing(true);
            const updatedBrief = await updateBrief(briefId, {
                title: briefTitle || 'Untitled',
                content: briefContent,
                selected_platforms: brief.selected_platforms
            });
            setBrief(updatedBrief);
            setEditingBrief(false);
            showSuccess('Brief updated successfully');
        } catch (err) {
            console.error('Error updating brief:', err);
            showError(err.response?.data?.error || 'Failed to update brief');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset to original brief values
        setBriefTitle(brief.title || '');
        setBriefContent(brief.content || '');
        setEditingBrief(false);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!brief) return <div className="container"><p>Brief not found</p></div>;

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/')}
                    className="button button-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                >
                    <ArrowLeft size={16} />
                    Back to Briefs
                </button>

                <h1 style={{ marginBottom: '8px' }}>Master Content Draft</h1>
                <p className="text-secondary">Create and refine your master content before generating platform posts</p>
            </div>

            {/* Brief Summary - Editable when no drafts or in edit mode */}
            <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Brief Details</h3>
                    {!editingBrief && drafts.length > 0 && (
                        <button
                            className="button button-secondary"
                            style={{ fontSize: '13px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setEditingBrief(true)}
                        >
                            <Edit2 size={14} />
                            Edit
                        </button>
                    )}
                </div>

                {editingBrief || drafts.length === 0 ? (
                    /* Editing Mode or No Drafts Yet */
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                                Title
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={briefTitle}
                                onChange={(e) => setBriefTitle(e.target.value)}
                                placeholder="Enter brief title"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                                Content <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <textarea
                                className="textarea"
                                value={briefContent}
                                onChange={(e) => setBriefContent(e.target.value)}
                                placeholder="Enter brief content"
                                style={{ width: '100%', minHeight: '120px' }}
                            />
                        </div>

                        {drafts.length === 0 && (
                            <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '16px', fontStyle: 'italic' }}>
                                Review and edit your brief before generating master content
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleSaveBrief}
                                disabled={processing || !briefContent.trim()}
                                className="button"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {processing ? (
                                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Save size={16} />
                                )}
                                Save Brief
                            </button>
                            {drafts.length > 0 && (
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={processing}
                                    className="button button-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* View Mode */
                    <div>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Title</div>
                            <div style={{ fontSize: '15px', fontWeight: '600' }}>{brief.title}</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Content</div>
                            <div style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{brief.content}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            {drafts.length === 0 ? (
                /* Initial Generation State */
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
                        Generate Master Content
                    </h2>
                    <p className="text-secondary" style={{ maxWidth: '500px', margin: '0 auto 32px', fontSize: '15px', lineHeight: '1.6' }}>
                        Create a refined master version of your content. You can iterate on it until it's perfect, then generate platform-specific posts.
                    </p>

                    <button
                        onClick={handleGenerateDraft}
                        disabled={processing}
                        className="button"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '16px', padding: '12px 24px' }}
                    >
                        {processing ? (
                            <>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Master Draft
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* Draft Editor View */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {/* Status & Actions Banner */}
                    {selectedDraft?.status === 'approved' ? (
                        <div style={{
                            padding: '16px 20px',
                            background: 'var(--success)',
                            color: 'white',
                            borderRadius: 'var(--radius)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle size={24} />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '15px' }}>Master Content Approved</div>
                                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Ready to generate platform-specific posts</div>
                                </div>
                            </div>
                            <button
                                onClick={handleGeneratePosts}
                                disabled={processing}
                                className="button"
                                style={{
                                    background: 'white',
                                    color: 'var(--success)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '600'
                                }}
                            >
                                {processing ? (
                                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <>
                                        Generate Posts
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            padding: '16px 20px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileEdit size={24} color="var(--accent)" />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '15px' }}>Draft in Progress</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Review and approve when ready</div>
                                </div>
                            </div>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="button"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {processing ? (
                                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Approve
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Content Display */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '16px 20px',
                            background: 'var(--bg-secondary)',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                Version {selectedDraft?.version}
                            </span>
                            <button
                                onClick={() => navigator.clipboard.writeText(selectedDraft?.content)}
                                className="button button-secondary"
                                style={{ fontSize: '13px', padding: '6px 12px' }}
                            >
                                Copy
                            </button>
                        </div>
                        <div style={{
                            padding: '24px',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap',
                            minHeight: '300px',
                            maxHeight: '600px',
                            overflow: 'auto'
                        }}>
                            {selectedDraft?.content}
                        </div>
                    </div>

                    {/* Version History - Compact */}
                    {drafts.length > 1 && (
                        <div className="card">
                            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                                Versions ({drafts.length})
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {drafts.map((draft) => (
                                    <button
                                        key={draft.id}
                                        onClick={() => setSelectedDraft(draft)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 'var(--radius)',
                                            border: selectedDraft?.id === draft.id
                                                ? '2px solid var(--accent)'
                                                : '1px solid var(--border)',
                                            background: selectedDraft?.id === draft.id
                                                ? 'var(--bg-tertiary)'
                                                : 'var(--bg-secondary)',
                                            fontSize: '13px',
                                            fontWeight: selectedDraft?.id === draft.id ? '600' : '400',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        v{draft.version}
                                        {draft.status === 'approved' && (
                                            <CheckCircle size={14} color="var(--success)" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Request Changes */}
                    {selectedDraft?.status !== 'approved' && (
                        <div className="card">
                            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={18} />
                                Request Changes
                            </h3>
                            <form onSubmit={handleCorrect}>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={correctionPrompt}
                                        onChange={(e) => setCorrectionPrompt(e.target.value)}
                                        placeholder="e.g., Make it shorter, remove emojis, add more focus on benefits..."
                                        className="textarea"
                                        style={{ minHeight: '100px', paddingRight: '60px' }}
                                        disabled={processing}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!correctionPrompt.trim() || processing}
                                        style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            right: '12px',
                                            background: correctionPrompt.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: correctionPrompt.trim() ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {processing ? (
                                            <Loader size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <Send size={20} color="white" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
                                    This will create version {(selectedDraft?.version || 0) + 1} based on your feedback
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
