import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

const LandingPage = () => {
  const [copied, setCopied] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introStage, setIntroStage] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  const CA = 'GvQH1VGGbrjeRSbsCreptYN4GUcZ9w7vMFJ5ic8ypump';
  const CHART_URL = 'https://dexscreener.com/solana/DSSA7dRkM2gTHxDVfTKwPvpVcqWP1G2gydLXd1twFWWh';
  const BUY_URL = 'https://pump.fun/coin/GvQH1VGGbrjeRSbsCreptYN4GUcZ9w7vMFJ5ic8ypump';
  const X_URL = 'https://x.com/i/communities/2024489711939502328';
  const LOGO_URL = 'https://customer-assets.emergentagent.com/job_6583b0ee-cbd3-4955-a597-92c9cfcc3e14/artifacts/8gh9cgds_image.png';

  const answerText = "it's just a hotdog -";

  // Intro animation sequence
  useEffect(() => {
    if (!showIntro) return;

    // Stage 0: Show question "What's this?"
    const stage1Timer = setTimeout(() => setIntroStage(1), 800);
    
    // Stage 1: Show bread logo
    const stage2Timer = setTimeout(() => setIntroStage(2), 2000);
    
    // Stage 2: Start typing answer
    const stage3Timer = setTimeout(() => setIntroStage(3), 3200);
    
    return () => {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
    };
  }, [showIntro]);

  // Typing effect for answer
  useEffect(() => {
    if (introStage !== 3) return;
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= answerText.length) {
        setTypedText(answerText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Show BREAD after typing completes
        setTimeout(() => setIntroStage(4), 400);
      }
    }, 80);
    
    return () => clearInterval(typingInterval);
  }, [introStage]);

  // Transition to main page after BREAD appears
  useEffect(() => {
    if (introStage === 4) {
      const transitionTimer = setTimeout(() => {
        setShowIntro(false);
      }, 2500);
      return () => clearTimeout(transitionTimer);
    }
  }, [introStage]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToChart = () => {
    document.getElementById('chart-section').scrollIntoView({ behavior: 'smooth' });
  };

  // Skip intro on click
  const skipIntro = () => {
    setShowIntro(false);
  };

  // Intro Screen
  if (showIntro) {
    return (
      <div className="intro-container" onClick={skipIntro}>
        {/* Question */}
        <div className={`intro-question ${introStage >= 1 ? 'visible' : ''}`}>
          what's this?
        </div>

        {/* Wiener Logo */}
        <div className={`intro-logo ${introStage >= 2 ? 'visible' : ''}`}>
          <img src={LOGO_URL} alt="Wiener" />
        </div>

        {/* Typed Answer */}
        <div className={`intro-answer ${introStage >= 3 ? 'visible' : ''}`}>
          {typedText}
          <span className="typing-cursor">|</span>
        </div>

        {/* WIENER Pop Up */}
        <div className={`intro-bread ${introStage >= 4 ? 'visible' : ''}`}>
          $WIENER
        </div>

        {/* Skip hint */}
        <div className="skip-hint">
          click anywhere to skip
        </div>
      </div>
    );
  }

  // Main Landing Page
  return (
    <div className="landing-container fade-in">
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
