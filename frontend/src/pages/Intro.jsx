import { Link } from 'react-router-dom';
import { ArrowRight, Zap, FileText, Layers, Share2, Clock, Cloud, Settings, Calendar } from 'lucide-react';

export default function Intro() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Social Scheduler
                    </h1>
                    <p className="hero-subtitle">
                        Create content briefs, generate AI posts for multiple platforms, schedule and publish via Make.com automation.
                    </p>
                    <div className="hero-actions">
                        <Link to="/quick-post" className="button button-primary button-large">
                            <Zap size={18} /> Quick Post
                        </Link>
                        <Link to="/new" className="button button-secondary button-large">
                            New Brief <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="steps-section">
                <div className="section-header">
                    <h2>How It Works</h2>
                </div>

                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">01</div>
                        <div className="step-content">
                            <h3>Create Brief</h3>
                            <p>Write content idea, attach files/images, select target platforms.</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">02</div>
                        <div className="step-content">
                            <h3>AI Generates Posts</h3>
                            <p>OpenRouter AI creates platform-optimized versions (LinkedIn, Twitter, Instagram, etc.).</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">03</div>
                        <div className="step-content">
                            <h3>Review & Edit</h3>
                            <p>Approve or edit each post. Reject and regenerate if needed.</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">04</div>
                        <div className="step-content">
                            <h3>Publish or Schedule</h3>
                            <p>Send immediately via Make.com or schedule for later. Images uploaded to Cloudinary.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Stack</h2>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Zap size={24} />
                        </div>
                        <h3>OpenRouter AI</h3>
                        <p>Content generation via Grok, Claude, GPT. Configure model in Settings.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Share2 size={24} />
                        </div>
                        <h3>Make.com</h3>
                        <p>Webhook receives JSON, Router distributes to platform modules (LinkedIn, Twitter, etc.).</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Cloud size={24} />
                        </div>
                        <h3>Cloudinary</h3>
                        <p>Images uploaded before publishing. Public URLs sent to Make.com.</p>
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="cta-section">
                <div className="quick-links">
                    <Link to="/settings" className="quick-link">
                        <Settings size={20} />
                        Configure APIs
                    </Link>
                    <Link to="/platforms" className="quick-link">
                        <Layers size={20} />
                        Manage Platforms
                    </Link>
                    <Link to="/posts" className="quick-link">
                        <FileText size={20} />
                        View Posts
                    </Link>
                    <Link to="/calendar" className="quick-link">
                        <Calendar size={20} />
                        Calendar
                    </Link>
                </div>
            </section>

            {/* Inline Styles */}
            <style>{`
                .home-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .hero-section {
                    padding: 60px 0 40px;
                    text-align: center;
                }

                .hero-title {
                    font-size: 48px;
                    font-weight: 800;
                    margin-bottom: 16px;
                    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-subtitle {
                    font-size: 18px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 32px;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .hero-actions {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                }

                .button-large {
                    padding: 12px 24px;
                    font-size: 16px;
                    height: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .section-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                }

                /* Steps Section */
                .steps-section {
                    padding: 40px;
                    background: var(--bg-secondary);
                    border-radius: 16px;
                    margin: 20px 0;
                }

                .steps-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                }

                .step-item {
                    text-align: center;
                }

                .step-number {
                    font-size: 36px;
                    font-weight: 900;
                    color: var(--accent);
                    opacity: 0.4;
                    margin-bottom: 8px;
                }

                .step-content h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .step-content p {
                    color: var(--text-secondary);
                    font-size: 14px;
                    line-height: 1.5;
                }

                /* Features Section */
                .features-section {
                    padding: 40px 0;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .feature-card {
                    background: var(--bg-secondary);
                    padding: 24px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }

                .feature-icon {
                    width: 40px;
                    height: 40px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--accent);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }

                .feature-card h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .feature-card p {
                    color: var(--text-secondary);
                    font-size: 14px;
                    line-height: 1.5;
                }

                /* Quick Links */
                .cta-section {
                    padding: 40px 0;
                }

                .quick-links {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .quick-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .quick-link:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border-color: var(--accent);
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 36px;
                    }

                    .hero-actions {
                        flex-direction: column;
                    }

                    .steps-container {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
