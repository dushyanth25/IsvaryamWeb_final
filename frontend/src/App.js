import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loading from './components/Loading/Loading';
import { useLoading } from './hooks/useLoading';
import { setLoadingInterceptor } from './interceptors/loadingInterceptor';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

import './App.css';

function App() {
  const { showLoading, hideLoading } = useLoading();
  const [showChatbot, setShowChatbot] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAboutus = location.pathname === '/about';

  useEffect(() => {
    setLoadingInterceptor({ showLoading, hideLoading });

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showLoading, hideLoading]);

  const toggleChatbot = () => {
    setShowChatbot(prev => !prev);
  };

  return (
    <>
      <ScrollToTop />
      <div className="app-container">
        <Loading />
        <Header />

        <main
          className="main-content"
          style={{
            padding: isHome || isAboutus ? '0' : '20px 0',
            flex: 1,
            backgroundColor: isAboutus ? '#f5f5f5' : 'transparent',
          }}
        >
          <AppRoutes />
        </main>

        <Footer />

        {/* Enhanced Chatbot Toggle Button */}
        <div
          className="chatbot-toggle-container"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px'
          }}
        >
          {isHovered && (
            <div style={{
              backgroundColor: 'white',
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              animation: 'fadeIn 0.3s ease'
            }}>
              Need help? Chat with us!
            </div>
          )}
          
          <button
            onClick={toggleChatbot}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="chatbot-toggle-button"
            style={{
              borderRadius: isMobile ? '25px' : '50%',
              width: isMobile ? '50px' : '60px',
              height: isMobile ? '50px' : '60px',
              backgroundColor: showChatbot ? '#4CAF50' : '#007bff',
              color: 'white',
              border: 'none',
              fontSize: isMobile ? '22px' : '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated chat icon */}
            <div style={{
              position: 'relative',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'translateY(-2px)' : 'none'
            }}>
              {showChatbot ? '✖' : '💬'}
            </div>
            
            {/* Pulsing animation effect */}
            {!showChatbot && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                border: '2px solid #007bff',
                animation: 'pulse 2s infinite',
                opacity: '0.5'
              }}></div>
            )}
          </button>
        </div>

        {/* Chatbot Popup */}
        {showChatbot && (
          <div
            style={{
              position: 'fixed',
              bottom: isMobile ? '70px' : '90px',
              right: '20px',
              width: isMobile ? '90vw' : '350px',
              height: isMobile ? '75vh' : '500px',
              maxHeight: '80vh',
              zIndex: 1000,
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              backgroundColor: '#fff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInUp 0.3s ease'
            }}
          >
            {/* Chatbot Header */}
            <div style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px 16px',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Isvaryam Assistant</span>
              <button
                onClick={toggleChatbot}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  padding: '0',
                  lineHeight: '1'
                }}
              >
                ✖
              </button>
            </div>

            {/* Chatbot Iframe */}
            <iframe
              src="https://isvarayam-chatbot-1.onrender.com/"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                flex: 1,
                backgroundColor: '#f5f5f5',
                overflow: 'hidden'
              }}
              scrolling="no"
              allow="microphone; camera"
              title="Chatbot"
            />
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(1); opacity: 0.5; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}

export default App;
