import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, onConfirm, title = "Schedule Posts", loading = false }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time) return;

        // Combine date and time into ISO string
        const scheduledAt = new Date(`${date}T${time}`).toISOString();
        onConfirm(scheduledAt);
    };

    // Get min date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            Date
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                min={today}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    paddingLeft: '36px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            />
                            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            Time
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    paddingLeft: '36px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            />
                            <Clock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !date || !time}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--accent)',
                                color: 'white',
                                cursor: loading || !date || !time ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: loading || !date || !time ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? 'Scheduling...' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
