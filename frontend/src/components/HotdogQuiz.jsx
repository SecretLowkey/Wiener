import React, { useState } from 'react';

const WIENER_IMG_URL =
  'https://customer-assets.emergentagent.com/job_6583b0ee-cbd3-4955-a597-92c9cfcc3e14/artifacts/8gh9cgds_image.png';

const QUESTIONS = [
  {
    q: 'how do you feel about mondays?',
    opts: [
      'disgusting. truly criminal.',
      "fine, whatever.",
      "i'm always ready to get going!",
      "i don't experience time.",
    ],
  },
  {
    q: 'someone offers you a hug. you:',
    opts: [
      'accept enthusiastically — i love being squeezed',
      'politely decline and maintain 3ft',
      'counter-offer a high five',
      'immediately suspect a trap',
    ],
  },
  {
    q: 'your ideal outfit is:',
    opts: [
      'cozy bun, sauced up, totally casual',
      'sharp suit, very important vibes',
      'vintage band tee and chaos',
      "whatever's clean",
    ],
  },
  {
    q: 'at a party, you are:',
    opts: [
      "the main event — everyone's here for me",
      'quietly in the corner having a great time',
      'on the grill doing the real work',
      'already thinking about leaving',
    ],
  },
  {
    q: 'your condiment philosophy is:',
    opts: [
      'more is more. pile it on.',
      "plain. don't touch my food.",
      'one signature sauce, always',
      "whatever's left in the fridge",
    ],
  },
  {
    q: 'how do you handle stress?',
    opts: [
      'i sizzle. i let it all out.',
      'i bottle it up until i snap',
      'i handle pressure with grace',
      'i distract myself with snacks',
    ],
  },
  {
    q: 'pick a natural habitat:',
    opts: [
      'baseball stadium, 7th inning',
      'a cozy kitchen at 2am',
      'fancy rooftop party',
      'a quiet forest, far from people',
    ],
  },
];

const WEIGHTS = [
  [3, 1, 0, 2],
  [3, 0, 1, 2],
  [3, 2, 1, 0],
  [3, 1, 2, 0],
  [3, 0, 2, 1],
  [3, 2, 1, 0],
  [3, 1, 2, 0],
];

const RESULTS = [
  {
    range: [0, 2],
    title: 'you are, in fact, a hotdog',
    tag: '100% wiener',
    desc:
      "relax. unpretentious. always a crowd-pleaser. you don't try too hard, you don't need to — you just show up and people are genuinely happy to see you. best enjoyed outdoors with a cold drink nearby.",
    rot: -8,
  },
  {
    range: [3, 4],
    title: 'hotdog-adjacent',
    tag: 'secretly a taco',
    desc:
      "you've got hotdog energy but you're a little more chaotic. you refuse to be contained by a simple bun. people love you but aren't always sure what they're getting. the good kind of unpredictable.",
    rot: 6,
  },
  {
    range: [5, 6],
    title: 'a sophisticated cheese',
    tag: 'not a hotdog',
    desc:
      "you have taste. you have opinions. you pair well with specific people in specific situations. you're not a hotdog — you're more of a charcuterie situation. very respectable, honestly.",
    rot: -4,
  },
  {
    range: [7, 8],
    title: 'definitely not a hotdog',
    tag: 'certified salad',
    desc:
      "you are calm, health-conscious, and make responsible decisions. hotdogs fear you. you probably read the nutrition label before the expiry date. we respect it. but you are not a hotdog.",
    rot: 10,
  },
  {
    range: [9, 99],
    title: 'a concept, not a food',
    tag: 'beyond hotdog',
    desc:
      "no one is quite sure what you are. you defy categorization. scientists are baffled. the hotdog community has issued a formal statement: 'we don't know her.' you are beyond this quiz.",
    rot: -12,
  },
];

function getResult(score) {
  for (const r of RESULTS) {
    if (score >= r.range[0] && score <= r.range[1]) return r;
  }
  return RESULTS[RESULTS.length - 1];
}

export default function HotdogQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const selected = answers[current];
  const isLast = current === total - 1;
  const progress = (current / total) * 100;

  const pick = (i) => {
    const next = [...answers];
    next[current] = i;
    setAnswers(next);
  };

  const goNext = () => {
    if (selected === undefined) return;
    const add = WEIGHTS[current][selected];
    const newScore = score + add;
    setScore(newScore);
    if (isLast) {
      setDone(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const restart = () => {
    setCurrent(0);
    setAnswers([]);
    setScore(0);
    setDone(false);
  };

  const shareOnX = (title, tag) => {
    const text = `i got "${title}" (${tag}) on the am i a hotdog quiz.\n\nfind out if you're a hotdog:`;
    const url = window.location.href;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const result = done ? getResult(score) : null;

  return (
    <section
      id="quiz-section"
      className="quiz-section"
      data-testid="hotdog-quiz-section"
    >
      <div className="quiz-inner">
        <h2 className="quiz-title" data-testid="quiz-title">
          am i a hotdog?
        </h2>
        <p className="quiz-subtitle">a deeply unscientific personality quiz</p>

        {!done && (
          <div className="quiz-card" data-testid="quiz-card">
            <div className="quiz-meta">
              <span>
                question {current + 1} of {total}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="quiz-progress" aria-hidden="true">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="quiz-question" data-testid="quiz-question">
              {QUESTIONS[current].q}
            </p>

            <div className="quiz-options">
              {QUESTIONS[current].opts.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  className={`quiz-opt ${selected === i ? 'selected' : ''}`}
                  onClick={() => pick(i)}
                  data-testid={`quiz-option-${i}`}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="quiz-nav">
              <button
                type="button"
                className={`quiz-next ${selected !== undefined ? 'active' : ''}`}
                onClick={goNext}
                disabled={selected === undefined}
                data-testid="quiz-next-btn"
              >
                {isLast ? 'see my result ↗︎' : 'next question'}
              </button>
            </div>
          </div>
        )}

        {done && result && (
          <div className="quiz-result" data-testid="quiz-result">
            <img
              src={WIENER_IMG_URL}
              alt=""
              className="quiz-result-logo"
              style={{ transform: `rotate(${result.rot}deg)` }}
            />
            <div
              className="quiz-result-tag"
              data-testid="quiz-result-tag"
            >
              {result.tag}
            </div>
            <h3 className="quiz-result-title" data-testid="quiz-result-title">
              {result.title}
            </h3>
            <p className="quiz-result-desc">{result.desc}</p>

            <div className="quiz-result-actions">
              <button
                type="button"
                className="quiz-restart"
                onClick={restart}
                data-testid="quiz-restart-btn"
              >
                try again
              </button>
              <button
                type="button"
                className="quiz-share"
                onClick={() => shareOnX(result.title, result.tag)}
                data-testid="quiz-share-btn"
              >
                share on x ↗︎
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
