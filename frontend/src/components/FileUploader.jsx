import { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon, Film, AlertCircle, Info } from 'lucide-react';

export default function FileUploader({
    files,
    setFiles,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    accept = "*",
    label = "Upload Files",
    infoText = "Supported files: PDF, DOCX, TXT, MD, CSV, Images, Videos. Max 5 files, 5MB each."
}) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        if (file.size > maxSize) {
            return `File "${file.name}" exceeds the size limit of ${maxSize / 1024 / 1024}MB`;
        }
        // Check accept type if needed (simple check)
        if (accept !== "*" && !file.type.match(accept.replace(/\*/g, '.*'))) {
            // This is a loose check, browser input handles strict check usually.
            // We can rely on input accept for now.
        }
        return null;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError('');

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newFiles = Array.from(e.dataTransfer.files);
            processFiles(newFiles);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        setError('');
        if (e.target.files && e.target.files[0]) {
            const newFiles = Array.from(e.target.files);
            processFiles(newFiles);
        }
    };

    const processFiles = (newFiles) => {
        if (files.length + newFiles.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} files.`);
            return;
        }

        const validFiles = [];
        for (const file of newFiles) {
            const err = validateFile(file);
            if (err) {
                setError(err);
                return; // Stop on first error
            }
            validFiles.push(file);
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return <ImageIcon size={20} />;
        if (file.type.startsWith('video/')) return <Film size={20} />;
        return <FileText size={20} />;
    };

    return (
        <div className="file-uploader">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>{label}</label>
                <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block' }}>
                    <Info size={16} className="text-secondary" style={{ cursor: 'help' }} />
                    <div className="tooltip" style={{
                        visibility: 'hidden',
                        width: '250px',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        borderRadius: '6px',
                        padding: '8px',
                        position: 'absolute',
                        zIndex: 1,
                        bottom: '125%',
                        left: '50%',
                        marginLeft: '-125px',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        border: '1px solid var(--border)',
                        fontSize: '12px'
                    }}>
                        {infoText}
                    </div>
                    <style>{`
                        .tooltip-container:hover .tooltip {
                            visibility: visible;
                            opacity: 1;
                        }
                    `}</style>
                </div>
            </div>

            <div
                className={`drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
                style={{
                    border: dragActive ? '2px dashed var(--accent)' : '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: dragActive ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--bg-secondary)',
                    transition: 'all 0.2s'
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                <UploadCloud size={32} className="text-secondary mb-2" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Drag & drop files here or click to upload
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Max {maxFiles} files, {maxSize / 1024 / 1024}MB each
                </p>
            </div>

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '13px', marginTop: '8px' }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="file-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map((file, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="text-secondary">{getFileIcon(file)}</span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{file.name}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
