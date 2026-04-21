import React, { useEffect, useRef, useState } from 'react';

const WIENER_IMG_URL =
  'https://customer-assets.emergentagent.com/job_6583b0ee-cbd3-4955-a597-92c9cfcc3e14/artifacts/8gh9cgds_image.png';

const FlappyWienerGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem('flappyWienerBest') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const wienerImg = new Image();
    wienerImg.src = WIENER_IMG_URL;

    let state = 'idle';
    let localScore = 0;
    let localBest = 0;
    try {
      localBest = parseInt(localStorage.getItem('flappyWienerBest') || '0', 10) || 0;
    } catch {
      localBest = 0;
    }
    let wy, wvy, wrot;
    let pipes = [];
    let rafId;

    const GRAVITY = 0.45;
    const FLAP = -8.5;
    const PIPE_W = 70;
    const GAP = 170;
    const PIPE_SPEED = 2.8;
    const WIENER_W = 72;
    const WIENER_H = 72;
    const WIENER_X = 100;
    // Hitbox is smaller than sprite because the wiener is diagonal inside a square image
    const HITBOX_W = 44;
    const HITBOX_H = 22;

    const reset = () => {
      wy = H / 2;
      wvy = 0;
      wrot = 0;
      pipes = [];
      localScore = 0;
      setScore(0);
      addPipe();
    };

    const addPipe = () => {
      const minTop = 60;
      const maxTop = H - GAP - 60;
      const topH = Math.random() * (maxTop - minTop) + minTop;
      pipes.push({ x: W + PIPE_W, topH, scored: false });
    };

    const flap = () => {
      if (state === 'idle') {
        state = 'playing';
        reset();
        return;
      }
      if (state === 'dead') {
        state = 'playing';
        reset();
        return;
      }
      wvy = FLAP;
    };

    const onClick = () => flap();
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      flap();
    }, { passive: false });
    document.addEventListener('keydown', onKey);

    const roundRect = (c, x, y, w, h, r) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.arcTo(x + w, y, x + w, y + r, r);
      c.lineTo(x + w, y + h - r);
      c.arcTo(x + w, y + h, x + w - r, y + h, r);
      c.lineTo(x + r, y + h);
      c.arcTo(x, y + h, x, y + h - r, r);
      c.lineTo(x, y + r);
      c.arcTo(x, y, x + r, y, r);
      c.closePath();
    };

    const drawSky = () => {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#87CEEB');
      grad.addColorStop(1, '#C5E8F7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      const clouds = [
        { x: 60, y: 80, r: 22 },
        { x: 95, y: 70, r: 28 },
        { x: 130, y: 85, r: 20 },
        { x: 320, y: 120, r: 24 },
        { x: 355, y: 110, r: 30 },
        { x: 390, y: 125, r: 22 },
      ];
      clouds.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground
      ctx.fillStyle = '#a8d9a2';
      ctx.fillRect(0, H - 80, W, 80);
      ctx.fillStyle = '#54B347';
      ctx.fillRect(0, H - 80, W, 8);
    };

    const drawPipe = (x, topH) => {
      const R = 8;
      const capH = 24;
      const capW = PIPE_W + 16;
      const capX = x - 8;

      ctx.fillStyle = '#5DBB3F';
      ctx.strokeStyle = '#3A8F20';
      ctx.lineWidth = 2;

      roundRect(ctx, x, 0, PIPE_W, topH - capH, R);
      ctx.fill();
      ctx.stroke();

      roundRect(ctx, capX, topH - capH, capW, capH, R);
      ctx.fill();
      ctx.stroke();

      const botY = topH + GAP;
      roundRect(ctx, capX, botY, capW, capH, R);
      ctx.fill();
      ctx.stroke();

      roundRect(ctx, x, botY + capH, PIPE_W, H - botY - capH - 80, R);
      ctx.fill();
      ctx.stroke();
    };

    const drawWiener = () => {
      ctx.save();
      ctx.translate(WIENER_X, wy);
      const rot = Math.max(-0.4, Math.min(1.2, wrot));
      ctx.rotate(rot);
      if (wienerImg.complete && wienerImg.naturalWidth > 0) {
        ctx.drawImage(wienerImg, -WIENER_W / 2, -WIENER_H / 2, WIENER_W, WIENER_H);
      } else {
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, 0, WIENER_W / 2, WIENER_H / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawOverlay = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';

      if (state === 'idle') {
        ctx.font = "600 38px 'Caveat', cursive";
        ctx.fillText('flappy wiener', W / 2, H / 2 - 40);
        ctx.font = "400 22px 'Patrick Hand', sans-serif";
        ctx.fillStyle = '#eee';
        ctx.fillText('click or press space to start', W / 2, H / 2 + 10);
        ctx.font = '42px sans-serif';
        ctx.fillText('🌭', W / 2, H / 2 + 70);
      } else if (state === 'dead') {
        ctx.font = "600 34px 'Caveat', cursive";
        ctx.fillText('game over', W / 2, H / 2 - 60);
        ctx.font = "400 24px 'Patrick Hand', sans-serif";
        ctx.fillStyle = '#eee';
        ctx.fillText('score: ' + localScore, W / 2, H / 2 - 10);
        ctx.fillText('best: ' + localBest, W / 2, H / 2 + 22);
        ctx.font = "400 18px 'Patrick Hand', sans-serif";
        ctx.fillStyle = '#ccc';
        ctx.fillText('click to play again', W / 2, H / 2 + 70);
      }
      ctx.textAlign = 'left';
    };

    const checkCollision = () => {
      const wx = WIENER_X;
      const hx = HITBOX_W / 2;
      const hy = HITBOX_H / 2;
      if (wy - hy <= 0 || wy + hy >= H - 80) return true;
      for (const p of pipes) {
        const px1 = p.x;
        const px2 = p.x + PIPE_W;
        if (wx + hx > px1 && wx - hx < px2) {
          if (wy - hy < p.topH || wy + hy > p.topH + GAP) return true;
        }
      }
      return false;
    };

    const update = () => {
      if (state !== 'playing') return;
      wvy += GRAVITY;
      wy += wvy;
      wrot = wvy * 0.07;

      for (const p of pipes) p.x -= PIPE_SPEED;

      if (pipes.length === 0 || pipes[pipes.length - 1].x < W - 220) addPipe();

      pipes = pipes.filter((p) => p.x > -PIPE_W - 20);

      for (const p of pipes) {
        if (!p.scored && p.x + PIPE_W < WIENER_X) {
          p.scored = true;
          localScore++;
          setScore(localScore);
        }
      }

      if (checkCollision()) {
        state = 'dead';
        if (localScore > localBest) {
          localBest = localScore;
          setBest(localBest);
          try {
            localStorage.setItem('flappyWienerBest', String(localBest));
          } catch {
            /* ignore */
          }
        }
      }
    };

    const drawScore = () => {
      if (state !== 'playing') return;
      ctx.fillStyle = '#fff';
      ctx.font = "600 44px 'Caveat', cursive";
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fillText(localScore, W / 2, 64);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    };

    const loop = () => {
      update();
      drawSky();
      for (const p of pipes) drawPipe(p.x, p.topH);
      drawWiener();
      drawScore();
      if (state !== 'playing') drawOverlay();
      rafId = requestAnimationFrame(loop);
    };

    reset();
    drawSky();
    drawWiener();
    drawOverlay();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <section id="game-section" className="game-section">
      <div className="game-inner">
        <h2 className="game-title">flappy wiener</h2>
        <p className="game-subtitle">tap, click, or space to flap</p>

        <div className="game-stats">
          <div className="game-stat">
            <div className="game-stat-label">score</div>
            <div className="game-stat-val">{score}</div>
          </div>
          <div className="game-stat">
            <div className="game-stat-label">best</div>
            <div className="game-stat-val">{best}</div>
          </div>
        </div>

        <div className="game-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={480}
            height={540}
            className="game-canvas"
          />
        </div>

        <p className="game-hint">
          <img src={WIENER_IMG_URL} alt="wiener" className="game-hint-icon" />
          don't touch the pipes — save the trenches
        </p>
      </div>
    </section>
  );
};

export default FlappyWienerGame;
