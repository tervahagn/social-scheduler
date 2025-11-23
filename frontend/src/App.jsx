import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Zap, FileText, Clock, Settings as SettingsIcon, CalendarDays, Sliders, Sun, Moon, BarChart2, Share2, MessageCircle, Calendar } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useEffect, useState } from 'react';
import Intro from './pages/Intro';
import NewBrief from './pages/NewBrief';
import MasterDraft from './pages/MasterDraft';
import ContentEditor from './pages/ContentEditor';
import Preview from './pages/Preview';
import History from './pages/History';
import Platforms from './pages/Platforms';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import './index.css';

import { useLocation } from 'react-router-dom';
import { Zap, FileText, Clock, Settings as SettingsIcon, CalendarDays, Sliders, Sun, Moon, BarChart2, Share2, MessageCircle, Calendar } from 'lucide-react';

function AnimatedLogo() {
    const [iconIndex, setIconIndex] = useState(0);
    const icons = [Zap, Calendar, Share2, MessageCircle];
    const CurrentIcon = icons[iconIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setIconIndex((prev) => (prev + 1) % icons.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.5s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
                <CurrentIcon size={24} style={{ animation: 'fadeIn 0.5s ease' }} />
            </div>
            <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.5px', background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Social Scheduler
            </span>
        </div>
    );
}

function Navigation() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: FileText, label: 'New Brief' },
        { path: '/history', icon: Clock, label: 'History' },
        { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
        { path: '/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/platforms', icon: SettingsIcon, label: 'Platforms' },
        { path: '/settings', icon: Sliders, label: 'Settings' },
    ];

    return (
        <nav style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.8)'
        }}>
            <div className="nav-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/intro" style={{ textDecoration: 'none' }}>
                    <AnimatedLogo />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: '100px',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    background: active ? 'var(--accent)' : 'transparent',
                                    color: active ? 'white' : 'var(--text-secondary)',
                                    boxShadow: active ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }
                                }}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />

                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}

function Root() {
    const navigate = useNavigate();

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            localStorage.setItem('hasVisited', 'true');
            navigate('/intro');
        }
    }, [navigate]);

    return <NewBrief />;
}

export default function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <BrowserRouter>
                    <Navigation />
                    <Routes>
                        <Route path="/" element={<Root />} />
                        <Route path="/intro" element={<Intro />} />
                        <Route path="/new" element={<NewBrief />} />
                        <Route path="/master/:briefId" element={<MasterDraft />} />
                        <Route path="/brief/:briefId/edit" element={<ContentEditor />} />
                        <Route path="/preview/:briefId" element={<Preview />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/platforms" element={<Platforms />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </NotificationProvider>
        </ThemeProvider>
    );
}
