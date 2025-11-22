import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrief, generatePosts, getPlatforms } from '../services/api';
import { Send, Loader } from 'lucide-react';
import FileUploader from '../components/FileUploader';

export default function NewBrief() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [docFiles, setDocFiles] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const data = await getPlatforms();
                const active = data.filter(p => p.is_active);
                setPlatforms(active);
                // Select all by default
                setSelectedPlatforms(active.map(p => p.id));
            } catch (err) {
                console.error(err);
            }
        };
        fetchPlatforms();
    }, []);

    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedPlatforms.length === 0) {
            setError('Please select at least one platform');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title || 'Untitled');
            formData.append('content', content);
            formData.append('selected_platforms', JSON.stringify(selectedPlatforms));

            // Append media files
            mediaFiles.forEach(file => {
                formData.append('media', file);
            });

            // Append document files
            docFiles.forEach(file => {
                formData.append('documents', file);
            });

            // Create brief
            const brief = await createBrief(formData);

            // Navigate to master draft page
            navigate(`/master/${brief.id}`);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '8px' }}>New Brief</h1>
            <p className="text-secondary mb-4">Create a brief and generate posts for selected platforms</p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="card" style={{ maxWidth: '800px' }}>
                    {/* Title */}
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                            Title (optional)
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Brief title for reference"
                        />
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                            Brief / Content *
                        </label>
                        <textarea
                            className="textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe your message. This will be adapted for different platforms."
                            required
                            style={{ minHeight: '200px' }}
                        />
                    </div>

                    {/* Files Grid */}
                    <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Brief Files (Documents) */}
                        <div>
                            <FileUploader
                                files={docFiles}
                                setFiles={setDocFiles}
                                label="Brief Files (Context for LLM)"
                                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx"
                                infoText="Upload documents for the LLM to study (PDF, Word, Excel, Markdown, etc.). Max 5 files."
                            />
                        </div>

                        {/* Media (Images/Videos) */}
                        <div>
                            <FileUploader
                                files={mediaFiles}
                                setFiles={setMediaFiles}
                                label="Media (Images/Videos for Posts)"
                                accept="image/*,video/*"
                                infoText="Upload images or videos to be included in the posts. Max 5 files."
                            />
                        </div>
                    </div>

                    {/* Platform Selection */}
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                            Select Platforms *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                            {platforms.map(platform => (
                                <label
                                    key={platform.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        background: selectedPlatforms.includes(platform.id) ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                        border: selectedPlatforms.includes(platform.id) ? '2px solid var(--accent)' : '2px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selectedPlatforms.includes(platform.id)) {
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedPlatforms.includes(platform.id)) {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPlatforms.includes(platform.id)}
                                        onChange={() => togglePlatform(platform.id)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        {platform.display_name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedPlatforms.length === 0 && (
                            <p className="text-sm text-secondary mt-4" style={{ color: 'var(--danger)' }}>
                                Please select at least one platform
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="button"
                        disabled={loading || !content || selectedPlatforms.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Creating brief...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Create & Start Draft
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
