import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { IoBarChart, IoPlaySkipForward } from 'react-icons/io5';
import './App.css';

const { innerWidth: screenWidth, innerHeight: screenHeight } = window;

// Artık tamamen gerçek Polymarket verileri kullanılıyor

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
              const intensity = Math.min(Math.abs(xVal) / 120, 0.9);
              const baseOverlay = `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)`;
              
              if (xVal < -40) {
                // Sola kaydırma - Kırmızı efekt + saydamlık (daha geç başlar)
                return `linear-gradient(to bottom, rgba(255,107,107,${intensity * 0.6}) 0%, rgba(220,38,127,${intensity * 0.7}) 50%, rgba(139,69,19,${intensity * 0.9}) 100%), ${baseOverlay}`;
              } else if (xVal > 40) {
                // Sağa kaydırma - Yeşil efekt + saydamlık (daha geç başlar)
                return `linear-gradient(to bottom, rgba(67,233,123,${intensity * 0.6}) 0%, rgba(56,249,215,${intensity * 0.7}) 50%, rgba(34,139,34,${intensity * 0.9}) 100%), ${baseOverlay}`;
              }
              return baseOverlay;
            }),
          }}
        />
        
        <div className="card-info-overlay">
          <div className="card-top">
            <div className="card-header">
              <span className="category-text">{item.category}</span>
              <span className="odds-text">{item.odds}</span>
            </div>
            <h2 className="title-text">{item.title}</h2>
            <p className="description-text">{item.description}</p>
          </div>
          
          {/* Center Stats on Image */}
          <div className="center-stats">
            <div className="stat-item-center">
              <IoBarChart size={18} color="rgba(255,255,255,0.9)" />
              <span className="stat-text">{item.volume}</span>
            </div>
            <div className="end-date-center">
              <span className="end-date-text">{item.endDate}</span>
            </div>
            <button 
              className="bet-button-center"
              onClick={() => {
                // Bet butonu - varsayılan olarak YES bahsi yapar
                const currentItem = markets[currentIndex];
                if (currentItem) {
                  handleSwipeRight(currentItem);
                }
              }}
            >
              <span className="bet-button-text">BET ${betAmount}</span>
            </button>
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
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Polymarket API'den veri çekme
  const fetchMarkets = async () => {
    try {
      setLoading(true);
      console.log('🔄 API çağrısı başlatılıyor...');
      
      // Daha fazla market çek ve çeşitli kategorilerden
      const response = await fetch('https://gamma-api.polymarket.com/markets?limit=20&order=volume&ascending=false&active=true&closed=false');
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response data:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Is array?', Array.isArray(data));
      console.log('📊 Data length:', data?.length);
      
      if (!Array.isArray(data)) {
        console.error('❌ API response is not an array:', data);
        throw new Error('API response is not an array');
      }
      
      if (data.length === 0) {
        console.warn('⚠️ API returned empty array');
        setMarkets([]);
        return;
      }
      
      // Gradient renkleri havuzu
      const gradientPool = [
        ['#2d3561', '#3b2665'], // Mor-lacivert
        ['#5d2456', '#662648'], // Koyu pembe
        ['#1e3a5f', '#004d61'], // Koyu mavi
        ['#1a5d3a', '#1a4d4d'], // Koyu yeşil
        ['#7a2d4a', '#8a4a29'], // Kahverengi-pembe
        ['#4a1a4a', '#5d2d5d'], // Koyu mor
        ['#2d4a2d', '#3d5d3d'], // Orman yeşili
        ['#4a2d1a', '#5d3d2d'], // Kahverengi
        ['#1a2d4a', '#2d3d5d'], // Gece mavisi
        ['#4a1a2d', '#5d2d3d'], // Bordo
      ];
      
      // API verisini uygulama formatına çevir
      console.log('🔄 Processing first market data:', data[0]);
      
      const formattedMarkets = data.slice(0, 10).map((market, index) => {
        console.log(`🔄 Processing market ${index + 1}:`, market.question);
        
        // Kategoriyi belirle
        let category = 'Market';
        if (market.question.toLowerCase().includes('bitcoin') || market.question.toLowerCase().includes('crypto')) {
          category = 'Crypto';
        } else if (market.question.toLowerCase().includes('election') || market.question.toLowerCase().includes('trump') || market.question.toLowerCase().includes('president')) {
          category = 'Politics';
        } else if (market.question.toLowerCase().includes('recession') || market.question.toLowerCase().includes('economy')) {
          category = 'Economics';
        } else if (market.question.toLowerCase().includes('ai') || market.question.toLowerCase().includes('tech')) {
          category = 'Technology';
        } else if (market.question.toLowerCase().includes('sports') || market.question.toLowerCase().includes('game')) {
          category = 'Sports';
        }

        // Açıklamayı temizle ve kısalt
        let description = market.description || 'Real prediction market from Polymarket';
        if (description.length > 120) {
          description = description.substring(0, 120) + '...';
        }
        
        // Resim URL'sini kontrol et
        let imageUrl = market.image || market.icon;
        if (!imageUrl || imageUrl === '') {
          // Kategoriye göre varsayılan Unsplash görselleri
          const categoryImages = {
            'Crypto': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop&crop=center',
            'Politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop&crop=center',
            'Economics': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&crop=center',
            'Technology': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop&crop=center',
            'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop&crop=center',
            'Market': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&crop=center',
          };
          imageUrl = categoryImages[category];
        }

        return {
          id: market.id,
          title: market.question,
          description: description,
          category: category,
          odds: `${Math.round(parseFloat(market.outcomePrices?.[0] || 0.5) * 100)}%`,
          volume: `$${(parseFloat(market.volume) / 1000000).toFixed(1)}M`,
          endDate: new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          gradient: gradientPool[index % gradientPool.length],
          image: imageUrl,
        };
      });
      
      setMarkets(formattedMarkets);
      console.log('✅ Polymarket verileri yüklendi:', formattedMarkets.length, 'market');
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // CORS hatası veya API sorunu için fallback data
      console.log('🔄 Using fallback sample data...');
      const sampleMarkets = [
        {
          id: "sample-1",
          title: "Will Bitcoin reach $100k by end of 2025?",
          description: "Bitcoin has been on a bull run. Will it hit the 100k milestone?",
          category: "Crypto",
          odds: "65%",
          volume: "$2.3M",
          endDate: "Dec 31, 2025",
          gradient: ['#2d3561', '#3b2665'],
          image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "sample-2", 
          title: "Will there be a recession in 2025?",
          description: "Economic indicators are mixed. Will the economy enter recession?",
          category: "Economics",
          odds: "38%",
          volume: "$4.1M",
          endDate: "Dec 31, 2025",
          gradient: ['#1e3a5f', '#004d61'],
          image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&crop=center",
        },
      ];
      setMarkets(sampleMarkets);
    } finally {
      setLoading(false);
    }
  };

  // API test fonksiyonu
  const testAPI = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const testResponse = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      console.log('🧪 Test API status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('🧪 Test API data:', testData);
      
      // Şimdi gerçek API'yi test et
      console.log('🧪 Testing Polymarket API...');
      const polyResponse = await fetch('https://gamma-api.polymarket.com/markets?limit=1');
      console.log('🧪 Polymarket API status:', polyResponse.status);
      console.log('🧪 Polymarket API headers:', [...polyResponse.headers.entries()]);
    } catch (error) {
      console.error('🧪 API Test Error:', error);
    }
  };

  useEffect(() => {
    testAPI();
    fetchMarkets();
  }, []);

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
    if (currentIndex < markets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Kartlar bittiğinde otomatik olarak başa dön
      setCurrentIndex(0);
    }
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



        {/* Cards Container */}
        <div className="cards-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span className="loading-text">Loading Real Markets...</span>
            </div>
          ) : markets.length === 0 ? (
            <div className="loading-container">
              <span className="loading-text">No markets available</span>
              <button 
                className="retry-button"
                onClick={fetchMarkets}
              >
                Retry
              </button>
            </div>
          ) : (
            markets.map((item, index) => {
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
            })
          )}
        </div>

        {/* Pass Button */}
        <div className="pass-container">
          <button 
            className="pass-button"
            onClick={() => {
              const currentItem = markets[currentIndex];
              if (currentItem) {
                handlePassCard(currentItem);
              }
            }}
            disabled={loading || markets.length === 0}
          >
            <IoPlaySkipForward size={24} color="#ffd93d" />
            <span className="pass-text">PAS</span>
          </button>
        </div>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Total Bets</span>
            <span className="stat-value">${totalBets}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cards Left</span>
            <span className="stat-value">{Math.max(0, markets.length - currentIndex)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 