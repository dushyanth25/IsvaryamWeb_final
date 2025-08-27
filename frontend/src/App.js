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

        {/* Chatbot Toggle Button */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1100 }}>
          <button
            onClick={toggleChatbot}
            className="chatbot-toggle-button"
            style={{
              borderRadius: '50%',
              width: isMobile ? '56px' : '68px',
              height: isMobile ? '56px' : '68px',
              background: 'linear-gradient(135deg, #4CAF50, #2E8B57)',
              color: 'white',
              border: 'none',
              fontSize: isMobile ? '22px' : '28px',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              position: 'relative',
              animation: 'pulse 1.5s infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.25)';
            }}
            title="Chat with us"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: '28px', height: '28px' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.78 9.78 0 01-4-.8l-4 1 1-3.6A8.992 8.992 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
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
            }}
          >
            {/* Chatbot Header */}
            <div
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '12px 16px',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
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
                  lineHeight: '1',
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
                overflow: 'hidden',
              }}
              scrolling="no"
              allow="microphone; camera"
              title="Chatbot"
            />
          </div>
        )}
      </div>

      {/* CSS for Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
          }
        `}
      </style>
    </>
  );
}

export default App;
