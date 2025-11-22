import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="var(--success)" />;
            case 'error': return <XCircle size={20} color="var(--danger)" />;
            default: return <Info size={20} color="var(--accent)" />;
        }
    };

    const getStyles = () => {
        const base = {
            background: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${type === 'success' ? 'var(--success)' :
                    type === 'error' ? 'var(--danger)' :
                        'var(--accent)'
                }`
        };
        return base;
    };

    return (
        <div style={getStyles()}>
            {getIcon()}
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', flex: 1 }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--text-secondary)',
                    display: 'flex'
                }}
            >
                <X size={16} />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
