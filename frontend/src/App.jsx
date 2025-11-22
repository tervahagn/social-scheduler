import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Zap, FileText, Clock, Settings as SettingsIcon, CalendarDays, Sliders } from 'lucide-react';
import NewBrief from './pages/NewBrief';
import Preview from './pages/Preview';
import History from './pages/History';
import Platforms from './pages/Platforms';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import './index.css';

function Navigation() {
    return (
        <nav className="nav">
            <div className="container" style={{ padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap size={24} color="var(--accent)" />
                        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Social Scheduler</h2>
                    </div>

                    <ul className="nav-links">
                        <li>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={16} />
                                New Brief
                            </Link>
                        </li>
                        <li>
                            <Link to="/calendar" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CalendarDays size={16} />
                                Calendar
                            </Link>
                        </li>
                        <li>
                            <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} />
                                History
                            </Link>
                        </li>
                        <li>
                            <Link to="/platforms" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <SettingsIcon size={16} />
                                Platforms
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Sliders size={16} />
                                Settings
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route path="/" element={<NewBrief />} />
                <Route path="/preview/:briefId" element={<Preview />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/history" element={<History />} />
                <Route path="/platforms" element={<Platforms />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
