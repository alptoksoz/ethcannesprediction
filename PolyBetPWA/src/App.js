import React, { useState, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { IoBarChart, IoArrowBack, IoArrowForward, IoRemove, IoAdd, IoPlaySkipForward } from 'react-icons/io5';
import './App.css';

const { innerWidth: screenWidth, innerHeight: screenHeight } = window;

// Örnek betting verileri
const bettingData = [
  {
    id: 1,
    title: "Will Bitcoin reach $100k by end of 2025?",
    description: "Bitcoin has been on a bull run. Will it hit the 100k milestone?",
    category: "Crypto",
    odds: "65%",
    volume: "$2.3M",
    gradient: ['#667eea', '#764ba2'],
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: 2,
    title: "Will AI replace 30% of jobs by 2030?",
    description: "Artificial Intelligence is rapidly advancing. Will it displace jobs?",
    category: "Technology",
    odds: "42%",
    volume: "$1.8M",
    gradient: ['#f093fb', '#f5576c'],
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: 3,
    title: "Will there be a recession in 2025?",
    description: "Economic indicators are mixed. Will the economy enter recession?",
    category: "Economics",
    odds: "38%",
    volume: "$4.1M",
    gradient: ['#4facfe', '#00f2fe'],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: 4,
    title: "Will Tesla stock hit $300 this year?",
    description: "Tesla has been volatile. Will it reach new highs?",
    category: "Stocks",
    odds: "55%",
    volume: "$3.2M",
    gradient: ['#43e97b', '#38f9d7'],
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: 5,
    title: "Will SpaceX land on Mars by 2026?",
    description: "SpaceX is making progress. Will they achieve Mars landing?",
    category: "Space",
    odds: "28%",
    volume: "$1.5M",
    gradient: ['#fa709a', '#fee140'],
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop&crop=center",
  },
];

const SwipeCard = ({ item, onSwipeLeft, onSwipeRight, onPass, betAmount, isTop }) => {
  const [{ x, y, rotation, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    config: config.wobbly,
  }));

  const bind = useDrag(
    ({ down, movement: [mx, my], velocity, direction: [xDir], cancel }) => {
      if (!isTop) return;

      const threshold = screenWidth * 0.3;
      const isGone = Math.abs(mx) > threshold;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && isGone) {
        cancel();
        api.start({
          x: (screenWidth + 100) * dir,
          y: my,
          rotation: mx / 100 + (isGone ? dir * 10 * velocity : 0),
          opacity: 0,
          config: { ...config.wobbly, velocity: velocity * 0.2 },
        });
        
        setTimeout(() => {
          if (dir === -1) {
            onSwipeLeft(item);
          } else {
            onSwipeRight(item);
          }
        }, 200);
      } else {
        api.start({
          x: down ? mx : 0,
          y: down ? my : 0,
          rotation: down ? mx / 100 : 0,
          opacity: 1,
        });
      }
    },
    { filterTaps: true }
  );

  return (
    <animated.div
      {...bind()}
      className={`swipe-card ${isTop ? 'top-card' : ''}`}
      style={{
        x,
        y,
        transform: rotation.to((r) => `rotate(${r}deg)`),
        opacity,
        background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
        zIndex: isTop ? 2 : 1,
      }}
    >

      <div 
        className="card-content"
        style={{
          backgroundImage: `url(${item.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dynamic Background Overlay */}
        <animated.div
          className="background-overlay"
          style={{
            background: x.to((xVal) => {
              const intensity = Math.min(Math.abs(xVal) / 80, 0.9);
              const baseOverlay = `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)`;
              
              if (xVal < -10) {
                // Sola kaydırma - Kırmızı efekt + saydamlık
                return `linear-gradient(to bottom, rgba(255,107,107,${intensity * 0.6}) 0%, rgba(220,38,127,${intensity * 0.7}) 50%, rgba(139,69,19,${intensity * 0.9}) 100%), ${baseOverlay}`;
              } else if (xVal > 10) {
                // Sağa kaydırma - Yeşil efekt + saydamlık  
                return `linear-gradient(to bottom, rgba(67,233,123,${intensity * 0.6}) 0%, rgba(56,249,215,${intensity * 0.7}) 50%, rgba(34,139,34,${intensity * 0.9}) 100%), ${baseOverlay}`;
              }
              return baseOverlay;
            }),
          }}
        />
        
        <div className="card-info-overlay">
          <div className="card-header">
            <span className="category-text">{item.category}</span>
            <span className="odds-text">{item.odds}</span>
          </div>
          
          <h2 className="title-text">{item.title}</h2>
          <p className="description-text">{item.description}</p>
          
          <div className="card-footer">
            <div className="volume-container">
              <IoBarChart size={16} color="rgba(255,255,255,0.8)" />
              <span className="volume-text">{item.volume}</span>
            </div>
            <div className="bet-amount-container">
              <span className="bet-amount-text">${betAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [totalBets, setTotalBets] = useState(0);
  const [walletBalance, setWalletBalance] = useState(4350);

  const handleSwipeLeft = (item) => {
    // NO bet
    setTotalBets(totalBets + betAmount);
    setWalletBalance(walletBalance - betAmount);
    nextCard();
  };

  const handleSwipeRight = (item) => {
    // YES bet
    setTotalBets(totalBets + betAmount);
    setWalletBalance(walletBalance - betAmount);
    nextCard();
  };

  const handlePassCard = (item) => {
    // Pass without betting
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < bettingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Kartlar bittiğinde otomatik olarak başa dön
      setCurrentIndex(0);
    }
  };

  const adjustBetAmount = (amount) => {
    const newAmount = Math.max(1, betAmount + amount);
    setBetAmount(newAmount);
  };

  return (
    <div className="app-container">
      <div className="app-background">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <h1 className="header-title">PolyMobile</h1>
            <p className="header-subtitle">Swipe to predict the future</p>
          </div>
          <div className="header-right">
            <div className="wallet-balance">
              <span className="balance-amount">{walletBalance.toLocaleString()} USDC</span>
            </div>
          </div>
        </header>

        {/* Bet Amount Controls */}
        <div className="bet-controls">
          <span className="bet-label">Bet Amount</span>
          <div className="bet-amount-controls">
            <button
              className="bet-button"
              onClick={() => adjustBetAmount(-5)}
            >
              <IoRemove size={20} color="#fff" />
            </button>
            
            <div className="bet-amount-display">
              <span className="bet-amount-main-text">${betAmount}</span>
            </div>
            
            <button
              className="bet-button"
              onClick={() => adjustBetAmount(5)}
            >
              <IoAdd size={20} color="#fff" />
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="cards-container">
          {bettingData.map((item, index) => {
            if (index < currentIndex) return null;
            if (index > currentIndex + 1) return null;
            
            return (
              <SwipeCard
                key={item.id}
                item={item}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onPass={handlePassCard}
                betAmount={betAmount}
                isTop={index === currentIndex}
              />
            );
          })}
        </div>

        {/* Swipe Instructions */}
        <div className="instructions-container">
          <div className="instruction-item">
            <IoArrowBack size={24} color="#ff6b6b" />
            <span className="instruction-text">Swipe left for NO</span>
          </div>
          <div className="instruction-item pass-instruction">
            <button 
              className="pass-button"
              onClick={() => {
                const currentItem = bettingData[currentIndex];
                if (currentItem) {
                  handlePassCard(currentItem);
                }
              }}
            >
              <IoPlaySkipForward size={24} color="#ffd93d" />
              <span className="pass-text">PAS</span>
            </button>
          </div>
          <div className="instruction-item">
            <IoArrowForward size={24} color="#4ecdc4" />
            <span className="instruction-text">Swipe right for YES</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Total Bets</span>
            <span className="stat-value">${totalBets}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cards Left</span>
            <span className="stat-value">{bettingData.length - currentIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 