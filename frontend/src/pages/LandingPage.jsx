import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const [copied, setCopied] = useState(false);
  
  const CA = '4E8CDFV9DeKVBiUpZo6NwPB7YpyWMWAY3ncgnDqYpump';
  const CHART_URL = 'https://dexscreener.com/solana/4VDSSMDAPdijzULvhT8L1DLrJ1v9N8ZAUincH86PjwnY';
  const BUY_URL = 'https://join.pump.fun/HSag/2j16baja';
  const X_URL = 'https://x.com/i/communities/2009097046159163751';
  const LOGO_URL = 'https://customer-assets.emergentagent.com/job_67754cc0-002f-4257-ba3b-c1a82d72846d/artifacts/c99jcd43_image.png';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-small">
            <img src={LOGO_URL} alt="BREAD" />
            <span className="ticker">$BREAD</span>
          </div>
          <nav className="nav-links">
            <a href={X_URL} target="_blank" rel="noopener noreferrer" className="nav-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="main-content">
        <section className="hero">
          <div className="bread-logo">
            <img src={LOGO_URL} alt="Just A Slice Of BREAD" />
          </div>
          
          <h1 className="title">
            Just A Slice Of
          </h1>
          <h2 className="ticker-large">BREAD</h2>
          
          <p className="tagline">The simplest meme. The finest taste.</p>

          {/* Contract Address */}
          <div className="ca-container">
            <span className="ca-label">CA</span>
            <div className="ca-box" onClick={copyToClipboard}>
              <code className="ca-text">{CA}</code>
              <button className="copy-btn">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <Button 
              className="buy-button"
              onClick={() => window.open(BUY_URL, '_blank')}
            >
              Buy $BREAD
              <ExternalLink size={16} />
            </Button>
            <Button 
              variant="outline"
              className="chart-button"
              onClick={() => window.open(CHART_URL, '_blank')}
            >
              Live Chart
              <ExternalLink size={16} />
            </Button>
          </div>
        </section>

        {/* Chart Embed */}
        <section className="chart-section">
          <div className="chart-container">
            <iframe
              src="https://dexscreener.com/solana/4VDSSMDAPdijzULvhT8L1DLrJ1v9N8ZAUincH86PjwnY?embed=1&theme=dark&trades=0&info=0"
              title="DEXScreener Chart"
              className="chart-iframe"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={LOGO_URL} alt="BREAD" />
            <span>$BREAD</span>
          </div>
          <p className="footer-text">Just a slice. Nothing more. Nothing less.</p>
          <div className="footer-links">
            <a href={X_URL} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
