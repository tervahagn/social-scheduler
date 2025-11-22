import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, FileText, Link as LinkIcon, CheckCircle, AlertCircle, Loader, Send } from 'lucide-react';
import { getPlatforms, createBrief } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

function FileUploader({ files, onFilesChange, onRemove, label, accept, infoText }) {
    const fileInputRef = useRef(null);

    return (
        <div className="file-uploader">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                {label}
            </label>

            <div
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                    transition: 'all 0.2s',
                    marginBottom: '12px'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFilesChange}
                    accept={accept}
                    multiple
                    style={{ display: 'none' }}
                />
                <Upload size={24} style={{ marginBottom: '8px', color: 'var(--text-secondary)' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Click to upload files
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {infoText}
                </p>
            </div>

            {files.length > 0 && (
                <div className="file-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '6px',
                                fontSize: '13px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <FileText size={14} className="text-secondary" />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.name}
                                </span>
                                <span className="text-secondary" style={{ fontSize: '11px' }}>
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(index);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    display: 'flex'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function NewBrief() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showError } = useNotification();
    const [platforms, setPlatforms] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [title, setTitle] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    });
    const [content, setContent] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [files, setFiles] = useState({ media: [], documents: [] });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Check for pre-filled data from navigation state (Branching)
        if (location.state) {
            if (location.state.title) setTitle(location.state.title + ' (Copy)');
            if (location.state.content) setContent(location.state.content);
        }

        const fetchPlatforms = async () => {
            try {
                const data = await getPlatforms();
                const active = data.filter(p => p.is_active);
                setPlatforms(active);
                // Don't select any platforms by default
                setSelectedPlatforms([]);
            } catch (err) {
                console.error(err);
                showError('Failed to load platforms');
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

    const handleFileChange = (e, type) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => ({
            ...prev,
            [type]: [...prev[type], ...newFiles]
        }));
    };

    const removeFile = (type, index) => {
        setFiles(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            showError('Please enter a title for your brief');
            return;
        }

        if (!content.trim()) {
            showError('Please enter content for your brief');
            return;
        }

        if (selectedPlatforms.length === 0) {
            showError('Please select at least one platform');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (linkUrl) formData.append('link_url', linkUrl);
            formData.append('selected_platforms', JSON.stringify(selectedPlatforms));

            files.media.forEach(file => formData.append('media', file));
            files.documents.forEach(file => formData.append('documents', file));

            const brief = await createBrief(formData);
            navigate(`/master/${brief.id}`);
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.error || 'Failed to create brief');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '8px' }}>New Brief</h1>
            <p className="text-secondary mb-4">Create a brief and generate posts for selected platforms</p>

            <form onSubmit={handleSubmit}>
                <div className="card" style={{ maxWidth: '800px' }}>
                    {/* Title */}
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Brief title for reference"
                            required
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
                                files={files.documents}
                                onFilesChange={(e) => handleFileChange(e, 'documents')}
                                onRemove={(index) => removeFile('documents', index)}
                                label="Brief Files (Context for LLM)"
                                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx"
                                infoText="Upload documents for the LLM to study (PDF, Word, Excel, Markdown, etc.). Max 5 files."
                            />
                        </div>

                        {/* Media (Images/Videos) */}
                        <div>
                            <FileUploader
                                files={files.media}
                                onFilesChange={(e) => handleFileChange(e, 'media')}
                                onRemove={(index) => removeFile('media', index)}
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
                        disabled={submitting || !content || selectedPlatforms.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {submitting ? (
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
