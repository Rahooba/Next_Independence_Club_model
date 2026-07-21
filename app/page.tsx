'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  
  const words = [
    "الاستقلالية",
    "الثقة",
    "الإبداع",
    "التعاون",
    "التميز"
  ];

  const schoolImage = '/wenewvalley.png';

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F2B4D 0%, #1E3A5F 50%, #2A5F8F 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Circles — client only to avoid hydration mismatch from Math.random() */}
      {mounted && [...Array(isMobile ? 8 : 15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.1, 0],
            scale: [0, 1, 2],
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          style={{
            position: 'absolute',
            width: (isMobile ? 50 : 100) + Math.random() * (isMobile ? 100 : 200),
            height: (isMobile ? 50 : 100) + Math.random() * (isMobile ? 100 : 200),
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,162,97,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Animated Grid Pattern — client only to match circle availability */}
      {mounted && <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(244,162,97,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(244,162,97,0.03) 1px, transparent 1px)
        `,
        backgroundSize: isMobile ? '30px 30px' : '50px 50px',
        pointerEvents: 'none'
      }} />}

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '40px 24px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr' : '1fr 1fr'),
          gap: isMobile ? '32px' : (isTablet ? '40px' : '60px'),
          alignItems: 'center',
          direction: 'rtl'
        }}>
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: isMobile ? 'center' : 'right' }}
          >
            {/* HP IDEA Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                display: 'inline-flex',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '6px 12px' : '8px 20px',
                borderRadius: '50px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span style={{ color: '#F4A261', fontWeight: 'bold', fontSize: isMobile ? '0.85rem' : '1rem' }}>🚀 HP IDEA </span>
              <span style={{ color: 'white', fontSize: isMobile ? '0.85rem' : '1rem' }}>برنامج تحسين التعليم التكنولوجي</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                fontSize: isMobile ? '2rem' : (isTablet ? '2.5rem' : '3.5rem'),
                fontWeight: '800',
                color: 'white',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}
            >
              مرحباً بك في
              <br />
              <span style={{ color: '#F4A261' }}>نادي الاستقلالية</span>
            </motion.h1>

            {/* Animated Word */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                fontSize: isMobile ? '1.2rem' : (isTablet ? '1.5rem' : '1.8rem'),
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              رحلتنا نحو
              <span style={{
                background: 'linear-gradient(135deg, #F4A261, #E76F51)',
                padding: isMobile ? '4px 16px' : '8px 24px',
                borderRadius: '50px',
                fontSize: isMobile ? '1rem' : (isTablet ? '1.3rem' : '1.6rem'),
                display: 'inline-block'
              }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {words[currentWord]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.7',
                marginBottom: '32px',
                maxWidth: isMobile ? '100%' : '500px',
                marginRight: isMobile ? 'auto' : '0',
                marginLeft: isMobile ? 'auto' : '0'
              }}
            >
              نموذج متكامل يجمع بين عدة ادوات مميزة ومبتكرة، 
              لتحويل الطالب من معتمد على المعلم إلى متعلم واع .. مستقل .. وواثق بنفسه.
            </motion.p>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              style={{
                display: 'flex',
                gap: isMobile ? '16px' : '32px',
                marginBottom: '40px',
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}
            >
              {[
                { value: '70%', label: 'زيادة الاعتماد على الذات', icon: '📈' },
                { value: '5-8', label: 'مرات رفع اليد لكل حصة', icon: '✋' },
                { value: '+10', label: 'أخطاء جميلة أسبوعياً', icon: '✨' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  style={{ textAlign: 'center', flex: isMobile ? '1' : 'auto' }}
                >
                  <div style={{ 
                    fontSize: isMobile ? '1.5rem' : '2rem', 
                    fontWeight: 'bold', 
                    color: '#F4A261' 
                  }}>{stat.value}</div>
                  <div style={{ 
                    fontSize: isMobile ? '0.7rem' : '0.8rem', 
                    color: 'rgba(255,255,255,0.7)' 
                  }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5, type: 'spring' }}
              style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}
            >
              <Link href="/home">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 4px 15px rgba(244,162,97,0.3)',
                      '0 8px 30px rgba(244,162,97,0.6)',
                      '0 4px 15px rgba(244,162,97,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(135deg, #F4A261, #E76F51)',
                    border: 'none',
                    padding: isMobile ? '12px 32px' : '16px 48px',
                    borderRadius: '50px',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    color: '#1E3A5F',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  ابدأ الرحلة الآن
                  <motion.span
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </Link>
            </motion.div>

            {/* School Name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              style={{
                marginTop: '40px',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.75rem' : '0.85rem',
                color: 'rgba(255,255,255,0.5)',
                textAlign: isMobile ? 'center' : 'right'
              }}
            >
              تنفيذ وابتكار .. مدرسة وي الوادي الجديد
            </motion.p>
          </motion.div>

          {/* Right Side - School Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              position: 'relative',
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              marginTop: isMobile ? '20px' : '0'
            }}
          >
            <div style={{
              position: 'relative',
              borderRadius: '32px',
              overflow: 'hidden'
            }}>
              <img 
                src={schoolImage}
                alt="مدرسة وي الوادي الجديد"
                style={{
                  width: '100%',
                  height: 'auto',
                  minHeight: isMobile ? '250px' : (isTablet ? '300px' : '400px'),
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x400/1E3A5F/FFFFFF?text=We+New+Valley+School';
                }}
              />
              
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(30,58,95,0.4) 0%, rgba(244,162,97,0.2) 100%)',
                borderRadius: '32px'
              }} />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: isMobile ? '6px 12px' : (isTablet ? '8px 16px' : '12px 20px'),
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ fontSize: isMobile ? '1.2rem' : (isTablet ? '1.5rem' : '2rem') }}>🏫</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1E3A5F', fontSize: isMobile ? '0.75rem' : (isTablet ? '0.85rem' : '1rem') }}>مدرسة وي</div>
                  <div style={{ fontSize: isMobile ? '0.6rem' : (isTablet ? '0.7rem' : '0.75rem'), color: '#6C757D' }}>الوادي الجديد</div>
                </div>
              </motion.div>
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: -20,
                left: -20,
                width: isMobile ? '60px' : '80px',
                height: isMobile ? '60px' : '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(244,162,97,0.3) 0%, transparent 70%)',
                zIndex: -1
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(42,157,143,0.3) 0%, transparent 70%)',
                zIndex: -1
              }}
            />
          </motion.div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: isMobile ? '50px' : '100px',
        background: 'white',
        clipPath: 'polygon(0% 0%, 100% 30%, 100% 100%, 0% 100%)',
        opacity: 0.1
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default function Page() {
  return <WelcomePage />;
}