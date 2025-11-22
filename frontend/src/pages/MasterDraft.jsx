import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getBrief,
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
    History,
    Send,
    AlertCircle,
    Wand2
} from 'lucide-react';

export default function MasterDraft() {
    const { briefId } = useParams();
    const navigate = useNavigate();

    const [brief, setBrief] = useState(null);
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [correctionPrompt, setCorrectionPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

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

            setBrief(briefData);
            setDrafts(draftsData);

            if (draftsData.length > 0) {
                setSelectedDraft(draftsData[0]); // Select latest
            } else {
                // No drafts yet, maybe auto-generate? 
                // For now, let's show a "Generate" button if empty
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load brief data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFirstDraft = async () => {
        try {
            setProcessing(true);
            const newDraft = await generateMasterDraft(briefId);
            setDrafts([newDraft]);
            setSelectedDraft(newDraft);
        } catch (err) {
            console.error('Error generating draft:', err);
            setError(err.response?.data?.error || 'Failed to generate draft');
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

            // Add to list and select it
            const updatedDrafts = [newDraft, ...drafts];
            setDrafts(updatedDrafts);
            setSelectedDraft(newDraft);
            setCorrectionPrompt('');
        } catch (err) {
            console.error('Error correcting draft:', err);
            setError(err.response?.data?.error || 'Failed to correct draft');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedDraft) return;

        try {
            setProcessing(true);
            const approvedDraft = await approveMasterDraft(selectedDraft.id);

            // Update in list
            const updatedDrafts = drafts.map(d =>
                d.id === approvedDraft.id ? approvedDraft : d
            );
            setDrafts(updatedDrafts);
            setSelectedDraft(approvedDraft);
        } catch (err) {
            console.error('Error approving draft:', err);
            setError(err.response?.data?.error || 'Failed to approve draft');
        } finally {
            setProcessing(false);
        }
    };

    const handleGeneratePosts = async () => {
        if (!selectedDraft) return;

        try {
            setProcessing(true);
            await generatePostsFromMaster(selectedDraft.id);
            navigate(`/preview/${briefId}`);
        } catch (err) {
            console.error('Error generating posts:', err);
            setError(err.response?.data?.error || 'Failed to generate posts');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!brief) {
        return <div className="p-8 text-center">Brief not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Brief & History */}
                <div className="space-y-6">
                    {/* Brief Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Brief Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Title</label>
                                <p className="font-medium">{brief.title}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Original Content</label>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-6">{brief.content}</p>
                            </div>
                            {brief.link_url && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Link</label>
                                    <a href={brief.link_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline truncate">
                                        {brief.link_url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Version History */}
                    {drafts.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center">
                                    <History size={20} className="mr-2" />
                                    History
                                </h2>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                    {drafts.length} versions
                                </span>
                            </div>
                            <div className="space-y-3">
                                {drafts.map((draft) => (
                                    <button
                                        key={draft.id}
                                        onClick={() => setSelectedDraft(draft)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedDraft?.id === draft.id
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium text-sm">Version {draft.version}</span>
                                                <span className="text-xs text-gray-500 block mt-1">
                                                    {new Date(draft.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {draft.status === 'approved' && (
                                                <CheckCircle size={16} className="text-green-500" />
                                            )}
                                        </div>
                                        {draft.correction_prompt && (
                                            <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                                                "{draft.correction_prompt}"
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Master Draft Editor */}
                <div className="lg:col-span-2">
                    {drafts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Wand2 size={32} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Generate Master Draft</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                We'll create a master version of your content using the Master Prompt settings. You can then iterate and refine it before generating platform-specific posts.
                            </p>
                            <button
                                onClick={handleGenerateFirstDraft}
                                disabled={processing}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center mx-auto font-medium transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <Loader size={20} className="animate-spin mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} className="mr-2" />
                                        Generate Master Draft
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Status Banner */}
                            {selectedDraft?.status === 'approved' ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center text-green-800">
                                        <CheckCircle size={20} className="mr-2" />
                                        <span className="font-medium">This version is approved</span>
                                    </div>
                                    <button
                                        onClick={handleGeneratePosts}
                                        disabled={processing}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center text-sm font-medium"
                                    >
                                        {processing ? (
                                            <Loader size={16} className="animate-spin mr-2" />
                                        ) : (
                                            <Send size={16} className="mr-2" />
                                        )}
                                        Generate Platform Posts
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center text-blue-800">
                                        <AlertCircle size={20} className="mr-2" />
                                        <span className="font-medium">Draft in progress</span>
                                    </div>
                                    <button
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm font-medium"
                                    >
                                        {processing ? (
                                            <Loader size={16} className="animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle size={16} className="mr-2" />
                                        )}
                                        Approve This Version
                                    </button>
                                </div>
                            )}

                            {/* Content Display */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Master Content (v{selectedDraft?.version})</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(selectedDraft?.content)}
                                        className="text-xs text-gray-500 hover:text-blue-600"
                                    >
                                        Copy to clipboard
                                    </button>
                                </div>
                                <div className="p-6 whitespace-pre-wrap font-sans text-lg leading-relaxed text-gray-800 min-h-[300px]">
                                    {selectedDraft?.content}
                                </div>
                            </div>

                            {/* Correction Input */}
                            {selectedDraft?.status !== 'approved' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="font-medium mb-4 flex items-center">
                                        <MessageSquare size={20} className="mr-2 text-blue-500" />
                                        Request Changes
                                    </h3>
                                    <form onSubmit={handleCorrect}>
                                        <div className="relative">
                                            <textarea
                                                value={correctionPrompt}
                                                onChange={(e) => setCorrectionPrompt(e.target.value)}
                                                placeholder="e.g., Make it shorter, remove the emojis, add more focus on the benefits..."
                                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 min-h-[100px]"
                                                disabled={processing}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!correctionPrompt.trim() || processing}
                                                className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                                                title="Submit Correction"
                                            >
                                                {processing ? (
                                                    <Loader size={20} className="animate-spin" />
                                                ) : (
                                                    <Send size={20} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            This will generate a new version (v{(selectedDraft?.version || 0) + 1}) based on your feedback.
                                        </p>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
