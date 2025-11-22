import { Link } from 'react-router-dom';
import { ArrowRight, Zap, FileText, Layers, Share2, Sparkles, CheckCircle } from 'lucide-react';

export default function Intro() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>AI-Powered Content Engine</span>
                    </div>
                    <h1 className="hero-title">
                        Turn One Brief into <br />
                        <span className="text-gradient">Endless Social Content</span>
                    </h1>
                    <p className="hero-subtitle">
                        Stop struggling with writer's block. Create a master brief and let our AI generate optimized posts for LinkedIn, Twitter, Instagram, and more in seconds.
                    </p>
                    <div className="hero-actions">
                        <Link to="/new" className="button button-primary button-large">
                            Start Creating <ArrowRight size={18} />
                        </Link>
                        <a href="#how-it-works" className="button button-secondary button-large">
                            How it Works
                        </a>
                    </div>
                </div>

                {/* Abstract Visual Decoration */}
                <div className="hero-visual">
                    <div className="floating-card card-1">
                        <div className="card-icon"><FileText size={20} /></div>
                        <div className="card-lines">
                            <div className="line line-1"></div>
                            <div className="line line-2"></div>
                        </div>
                    </div>
                    <div className="connection-line"></div>
                    <div className="floating-card card-2">
                        <div className="card-icon"><Share2 size={20} /></div>
                        <div className="platform-icons">
                            <div className="p-icon p-1"></div>
                            <div className="p-icon p-2"></div>
                            <div className="p-icon p-3"></div>
                        </div>
                    </div>
                    <div className="glow-effect"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Supercharge Your Workflow</h2>
                    <p>Everything you need to manage your social presence efficiently.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FileText size={24} />
                        </div>
                        <h3>Master Briefs</h3>
                        <p>Write once, repurpose everywhere. Create a comprehensive master document that serves as the source of truth.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Zap size={24} />
                        </div>
                        <h3>AI Generation</h3>
                        <p>Advanced LLMs analyze your brief and generate platform-specific content that sounds just like you.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Layers size={24} />
                        </div>
                        <h3>Multi-Platform</h3>
                        <p>Optimized formats for LinkedIn, Twitter, Instagram, and more. Hashtags and tone included.</p>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="steps-section">
                <div className="section-header">
                    <h2>How It Works</h2>
                    <p>From idea to published content in three simple steps.</p>
                </div>

                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">01</div>
                        <div className="step-content">
                            <h3>Create a Brief</h3>
                            <p>Upload documents or write a quick summary of what you want to talk about.</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">02</div>
                        <div className="step-content">
                            <h3>Refine Master Draft</h3>
                            <p>Review the AI-generated master content and make sure it hits the mark.</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">03</div>
                        <div className="step-content">
                            <h3>Generate & Publish</h3>
                            <p>Get tailored posts for all your connected platforms, ready to share.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to scale your content?</h2>
                    <p>Join the future of social media management today.</p>
                    <Link to="/new" className="button button-primary button-large">
                        Get Started Now
                    </Link>
                </div>
            </section>

            {/* Inline Styles for Landing Page */}
            <style>{`
                .home-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                /* Hero Section */
                .hero-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 80px 0;
                    gap: 40px;
                    min-height: 600px;
                }
                
                .hero-content {
                    flex: 1;
                    max-width: 600px;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: rgba(var(--accent-rgb), 0.1);
                    color: var(--accent);
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 24px;
                    border: 1px solid rgba(var(--accent-rgb), 0.2);
                }

                .hero-title {
                    font-size: 56px;
                    line-height: 1.1;
                    font-weight: 800;
                    margin-bottom: 24px;
                    letter-spacing: -0.02em;
                }

                .text-gradient {
                    background: linear-gradient(135deg, var(--accent) 0%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-subtitle {
                    font-size: 18px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 32px;
                    max-width: 480px;
                }

                .hero-actions {
                    display: flex;
                    gap: 16px;
                }

                .button-large {
                    padding: 12px 24px;
                    font-size: 16px;
                    height: auto;
                }

                /* Hero Visual */
                .hero-visual {
                    flex: 1;
                    position: relative;
                    height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .glow-effect {
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    background: var(--accent);
                    filter: blur(100px);
                    opacity: 0.15;
                    border-radius: 50%;
                    z-index: -1;
                }

                .floating-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 20px;
                    position: absolute;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    animation: float 6s ease-in-out infinite;
                }

                .card-1 {
                    top: 20%;
                    left: 10%;
                    width: 140px;
                    height: 180px;
                    z-index: 2;
                }

                .card-2 {
                    bottom: 20%;
                    right: 10%;
                    width: 160px;
                    height: 120px;
                    z-index: 3;
                    animation-delay: -3s;
                }

                .card-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    color: var(--accent);
                }

                .card-lines .line {
                    height: 8px;
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                    margin-bottom: 8px;
                }

                .line-1 { width: 80%; }
                .line-2 { width: 60%; }

                .platform-icons {
                    display: flex;
                    gap: 8px;
                }

                .p-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                /* Features Section */
                .features-section {
                    padding: 80px 0;
                    border-top: 1px solid var(--border);
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 60px;
                }

                .section-header h2 {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 16px;
                }

                .section-header p {
                    color: var(--text-secondary);
                    font-size: 18px;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 32px;
                }

                .feature-card {
                    background: var(--bg-secondary);
                    padding: 32px;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    transition: transform 0.2s;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                }

                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(var(--accent-rgb), 0.1);
                    color: var(--accent);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .feature-card h3 {
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .feature-card p {
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                /* Steps Section */
                .steps-section {
                    padding: 80px 0;
                    background: var(--bg-secondary);
                    border-radius: 24px;
                    margin: 40px 0;
                }

                .steps-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 40px;
                    padding: 0 40px;
                }

                .step-item {
                    position: relative;
                }

                .step-number {
                    font-size: 64px;
                    font-weight: 900;
                    color: var(--border);
                    opacity: 0.5;
                    margin-bottom: -20px;
                    position: relative;
                    z-index: 0;
                }

                .step-content {
                    position: relative;
                    z-index: 1;
                }

                .step-content h3 {
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .step-content p {
                    color: var(--text-secondary);
                    font-size: 15px;
                    line-height: 1.6;
                }

                /* CTA Section */
                .cta-section {
                    padding: 100px 0;
                    text-align: center;
                }

                .cta-content h2 {
                    font-size: 40px;
                    font-weight: 700;
                    margin-bottom: 16px;
                }

                .cta-content p {
                    color: var(--text-secondary);
                    font-size: 18px;
                    margin-bottom: 32px;
                }

                @media (max-width: 768px) {
                    .hero-section {
                        flex-direction: column;
                        text-align: center;
                        padding: 40px 0;
                    }

                    .hero-content {
                        margin: 0 auto;
                    }

                    .hero-actions {
                        justify-content: center;
                    }

                    .hero-title {
                        font-size: 40px;
                    }

                    .hero-visual {
                        width: 100%;
                        height: 300px;
                    }
                }
            `}</style>
        </div>
    );
}
