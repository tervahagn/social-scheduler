
import os

html_content = """<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Social Scheduler - The open-source operating system for sovereign social media management. LLM-independent, version-controlled, and privacy-first.">
    <title>Social Scheduler | The OS for Modern Influence</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="noise-overlay"></div>
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>

    <nav class="nav glass">
        <a href="#" class="nav-brand">
            <div class="logo-container">
                <div class="logo-icon-box">
                    <!-- Zap Icon -->
                    <svg class="logo-icon-svg active" data-index="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    <!-- Calendar Icon -->
                    <svg class="logo-icon-svg" data-index="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <!-- Share Icon -->
                    <svg class="logo-icon-svg" data-index="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    <!-- Message Icon -->
                    <svg class="logo-icon-svg" data-index="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <span class="brand-name">Social Scheduler</span>
            </div>
        </a>
        <div class="nav-links">
            <a href="#brief" class="nav-link">Brief</a>
            <a href="#engine" class="nav-link">Engine</a>
            <a href="#editor" class="nav-link">Editor</a>
            <a href="#integrations" class="nav-link">Integrations</a>
            <a href="https://github.com/tervahagn/social-scheduler" class="btn btn-glow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
            </a>
        </div>
    </nav>

    <main>
        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <div class="pill-badge">
                    <span class="pulse"></span>
                    v1.0 Open Source Release
                </div>
                <h1 class="display-text">
                    The Operating System<br>
                    for <span class="text-gradient">Sovereign Influence</span>
                </h1>
                <p class="hero-sub">
                    Stop renting your workflow. Social Scheduler is the self-hosted, LLM-agnostic engine for orchestrating complex content campaigns across the decentralized web.
                </p>
                <div class="cta-group">
                    <a href="https://github.com/tervahagn/social-scheduler" class="btn btn-primary btn-lg">
                        Deploy Now
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
            
            <div class="hero-ui-preview glass">
                <div class="ui-header">
                    <div class="ui-dots"><span></span><span></span><span></span></div>
                    <div class="ui-bar">social-scheduler.local</div>
                </div>
                <div class="video-container">
                    <img src="assets/demo.webp" alt="Social Scheduler Demo Flow" class="demo-video">
                </div>
            </div>
        </section>

        <!-- Feature 1: The Brief -->
        <section id="brief" class="feature-section">
            <div class="container">
                <div class="feature-row">
                    <div class="feature-content">
                        <span class="feature-label">STRATEGY CENTER</span>
                        <h2 class="feature-title">Don't Start with a Tweet.<br>Start with a Strategy.</h2>
                        <p class="feature-desc">
                            Amateurs post; professionals campaign. The <strong>Brief</strong> is your strategic container. Define your core message, attach assets, and set the context once. The system then "explodes" this into platform-native content for every channel.
                        </p>
                        <ul class="feature-list">
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Unified Campaign Context
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Multi-Channel Selection
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Asset Management
                            </li>
                        </ul>
                    </div>
                    <div class="feature-visual">
                        <div class="screenshot-card glass">
                            <img src="assets/brief.png" alt="New Brief Interface" class="screenshot-img">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Feature 2: The Engine -->
        <section id="engine" class="feature-section">
            <div class="container">
                <div class="feature-row">
                    <div class="feature-visual">
                        <div class="screenshot-card glass">
                            <img src="assets/results.png" alt="Generated Content Results" class="screenshot-img">
                        </div>
                    </div>
                    <div class="feature-content">
                        <span class="feature-label">GENERATION ENGINE</span>
                        <h2 class="feature-title">Cascading Prompt<br>Architecture</h2>
                        <p class="feature-desc">
                            Generic prompts yield generic results. We use a 3-layer inheritance model: <strong>Master Prompt</strong> (Brand Voice) > <strong>Platform Prompt</strong> (Channel Specifics) > <strong>Brief Prompt</strong> (Context). This ensures every post is on-brand and platform-native.
                        </p>
                        <ul class="feature-list">
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                LLM Agnostic (OpenRouter)
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Parallel Generation
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Vision Model Support
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Feature 3: The Editor -->
        <section id="editor" class="feature-section">
            <div class="container">
                <div class="feature-row">
                    <div class="feature-content">
                        <span class="feature-label">VERSION CONTROL</span>
                        <h2 class="feature-title">Git for Your Copy.<br>Safety Built In.</h2>
                        <p class="feature-desc">
                            Never lose a good idea. Every edit, regeneration, and correction is tracked in a version history. Branch your copy to explore different angles, or revert to a previous version if an edit lands flat. It's "ContentOps" for the modern era.
                        </p>
                        <ul class="feature-list">
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Full Version History
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                AI-Assisted Corrections
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Draft / Approval Workflow
                            </li>
                        </ul>
                    </div>
                    <div class="feature-visual">
                        <div class="screenshot-card glass">
                            <img src="assets/editor.png" alt="Editor Modal" class="screenshot-img">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Integrations -->
        <section id="integrations" class="integrations">
            <div class="container">
                <div class="section-label">POWER MODULES</div>
                <h2 class="section-heading">Infinite Extensibility</h2>
                <p class="hero-sub">Connect to the world's best models and automation tools.</p>
                
                <div class="integration-grid">
                    <div class="integration-card glass">
                        <div class="integration-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                        </div>
                        <h3>OpenRouter</h3>
                        <p>Access Claude 3.5, GPT-4o, Llama 3, and more. Bring your own keys. You own the intelligence.</p>
                    </div>

                    <div class="integration-card glass">
                        <div class="integration-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        </div>
                        <h3>Make.com / Zapier</h3>
                        <p>Decoupled publishing. We push to a webhook; you route it anywhere (Slack, CMS, Email, Socials).</p>
                    </div>

                    <div class="integration-card glass">
                        <div class="integration-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h3>Self-Hosted</h3>
                        <p>Your data, your server. No monthly fees per seat. Privacy first and always secure.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <p class="vibe-code">
                    🌴 Vibe-coded in Pasadena, California, by <a href="https://tervahagn.com" target="_blank" class="author-link">Vahagn Ter-Sarkisyan</a> and open for free of charge use.
                </p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
    <script>
        // Logo Animation Logic
        const logoIcons = document.querySelectorAll('.logo-icon-svg');
        let currentIconIndex = 0;

        setInterval(() => {
            // Hide current
            logoIcons[currentIconIndex].classList.remove('active');
            
            // Move to next
            currentIconIndex = (currentIconIndex + 1) % logoIcons.length;
            
            // Show next
            logoIcons[currentIconIndex].classList.add('active');
        }, 3000);
    </script>
</body>
</html>"""

with open('../Social-Scheduler-Landing/index.html', 'w') as f:
    f.write(html_content)

print("Successfully overwrote index.html")
