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
    setShowChatbot((prev) => !prev);
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
        <button
          onClick={toggleChatbot}
          className="chatbot-toggle-button"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1100,
            borderRadius: '50%',
            width: isMobile ? '60px' : '70px',
            height: isMobile ? '60px' : '70px',
            backgroundColor: '#1e73be', // Primary blue color
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          title="Chat with us"
        >
          <div
            style={{
              width: '24px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '6px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 4px',
            }}
          >
            {/* Dots inside */}
            <span style={{ width: '4px', height: '4px', background: '#1e73be', borderRadius: '50%' }}></span>
            <span style={{ width: '4px', height: '4px', background: '#1e73be', borderRadius: '50%' }}></span>
            <span style={{ width: '4px', height: '4px', background: '#1e73be', borderRadius: '50%' }}></span>

            {/* Tail of bubble */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '8px',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid white',
              }}
            ></div>
          </div>
        </button>

        {/* Chatbot Popup */}
        {showChatbot && (
          <div
            style={{
              position: 'fixed',
              bottom: isMobile ? '80px' : '90px',
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
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            {/* Chatbot Header */}
            <div
              style={{
                backgroundColor: '#007bff',
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
    </>
  );
}

export default App;
