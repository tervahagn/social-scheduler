import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Zap, FileText, Clock, Settings as SettingsIcon, CalendarDays, Sliders, Sun, Moon, BarChart2 } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useEffect } from 'react';
import Intro from './pages/Intro';
import NewBrief from './pages/NewBrief';
import MasterDraft from './pages/MasterDraft';
import Preview from './pages/Preview';
import History from './pages/History';
import Platforms from './pages/Platforms';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import './index.css';

function Navigation() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav>
            <div className="nav-container">
                <div className="nav-content">
                    <Link to="/intro" className="logo" style={{ textDecoration: 'none' }}>
                        <Zap size={24} />
                        Social Scheduler
                    </Link>

                    <ul className="nav-links">
                        <li>
                            <Link to="/">
                                <FileText size={16} />
                                New Brief
                            </Link>
                        </li>
                        <li>
                            <Link to="/calendar">
                                <CalendarDays size={16} />
                                Calendar
                            </Link>
                        </li>
                        <li>
                            <Link to="/analytics">
                                <BarChart2 size={16} />
                                Analytics
                            </Link>
                        </li>
                        <li>
                            <Link to="/history">
                                <Clock size={16} />
                                History
                            </Link>
                        </li>
                        <li>
                            <Link to="/platforms">
                                <SettingsIcon size={16} />
                                Platforms
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings">
                                <Sliders size={16} />
                                Settings
                            </Link>
                        </li>
                        <li>
                            <button onClick={toggleTheme} className="theme-toggle">
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        </li>
                    </ul>
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
