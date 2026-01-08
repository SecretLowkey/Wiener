import React, { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

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

  const scrollToChart = () => {
    document.getElementById('chart-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <main className="main-content">
        <section className="hero">
          {/* Bread Logo */}
          <div className="bread-logo">
            <img src={LOGO_URL} alt="Just A Slice Of BREAD" />
          </div>
          
          {/* Title */}
          <h1 className="title">just a slice of</h1>
          <h2 className="ticker-large">BREAD</h2>

          {/* Buttons Row */}
          <div className="buttons-row">
            <button 
              className="btn-buy"
              onClick={() => window.open(BUY_URL, '_blank')}
            >
              buy $bread
            </button>
            
            <button 
              className="btn-x"
              onClick={() => window.open(X_URL, '_blank')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>

          {/* Contract Address */}
          <div className="ca-container">
            <span className="ca-label">ca</span>
            <div className="ca-box" onClick={copyToClipboard}>
              <code className="ca-text">{CA}</code>
              <button className="copy-btn">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* View Chart Link */}
          <button className="view-chart-btn" onClick={scrollToChart}>
            view live chart
            <ChevronDown size={18} className="bounce-arrow" />
          </button>
        </section>

        {/* Chart Section */}
        <section id="chart-section" className="chart-section">
          <div className="chart-container">
            <iframe
              src="https://dexscreener.com/solana/4VDSSMDAPdijzULvhT8L1DLrJ1v9N8ZAUincH86PjwnY?embed=1&theme=light&trades=0&info=0"
              title="DEXScreener Chart"
              className="chart-iframe"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <img src={LOGO_URL} alt="BREAD" className="footer-logo" />
          <span className="footer-text">$bread</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
