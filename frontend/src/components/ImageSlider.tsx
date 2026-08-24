import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  url: string;
  title?: string;
  tag?: string;
}

interface ImageSliderProps {
  slides: Slide[];
  autoPlayInterval?: number;
  height?: number | string;
  borderRadius?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export default function ImageSlider({
  slides,
  autoPlayInterval = 4000,
  height = 480,
  borderRadius = 24,
  showDots = true,
  showArrows = true,
}: ImageSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval]);

  const handleNext = () => setIndex(prev => (prev + 1) % slides.length);
  const handlePrev = () => setIndex(prev => (prev - 1 + slides.length) % slides.length);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '100%', height }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <img
              src={current.url}
              alt={current.title || `Slide ${index + 1}`}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={e => {
                (e.target as HTMLImageElement).src = '/hero.png';
              }}
            />
            {(current.title || current.tag) && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(3,3,3,0.85) 0%, rgba(3,3,3,0.2) 50%, transparent 100%)',
              }} />
            )}

            {(current.title || current.tag) && (
              <div style={{
                position: 'absolute', bottom: 24, left: 24, right: showArrows ? 80 : 24,
                zIndex: 2,
              }}>
                {current.tag && (
                  <span style={{
                    display: 'inline-block', marginBottom: 6, fontSize: 10,
                    padding: '4px 10px', borderRadius: 99,
                    background: 'var(--red-soft)', color: 'var(--accent)',
                    border: '1px solid var(--border-accent)', fontWeight: 600,
                  }}>{current.tag}</span>
                )}
                {current.title && (
                  <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                    {current.title}
                  </h3>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {showArrows && slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(3,3,3,0.65)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--border)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 5, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,3,3,0.65)'}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next Slide"
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(3,3,3,0.65)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--border)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 5, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,3,3,0.65)'}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {showDots && slides.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 16, right: 20, zIndex: 5,
            display: 'flex', gap: 5, alignItems: 'center',
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === index ? 18 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
