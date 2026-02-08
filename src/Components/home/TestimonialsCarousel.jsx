import React, { useState, useEffect } from 'react';

const TestimonialsCarousel = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (testimonials && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      position: 'relative',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Quote marks */}
        <div style={{
          fontSize: '80px',
          color: 'rgba(102,126,234,0.1)',
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontFamily: 'serif',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          "
        </div>
        
        {/* Rating stars */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              style={{
                color: i < (currentTestimonial.rating || 5) ? '#FFD700' : '#e2e8f0',
                fontSize: '24px',
              }}
            >
              ★
            </span>
          ))}
        </div>
        
        {/* Testimonial content */}
        <p style={{
          fontSize: '1.1rem',
          lineHeight: 1.7,
          margin: '0 0 32px 0',
          color: '#1e293b',
          fontStyle: 'italic',
          minHeight: '100px',
          position: 'relative',
          zIndex: 1,
        }}>
          "{currentTestimonial.content}"
        </p>
        
        {/* User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          zIndex: 1,
        }}>
          {currentTestimonial.user_image_url ? (
            <img
              src={currentTestimonial.user_image_url}
              alt={currentTestimonial.user_name}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #667eea',
              }}
            />
          ) : (
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
            }}>
              {currentTestimonial.user_name?.charAt(0) || 'U'}
            </div>
          )}
          
          <div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '4px',
            }}>
              {currentTestimonial.user_name}
            </div>
            
            {currentTestimonial.user_role && (
              <div style={{
                fontSize: '0.9rem',
                color: '#64748b',
                marginBottom: '4px',
              }}>
                {currentTestimonial.user_role}
              </div>
            )}
            
            {currentTestimonial.achievement && (
              <div style={{
                fontSize: '0.85rem',
                color: '#667eea',
                fontWeight: 600,
              }}>
                🏆 {currentTestimonial.achievement}
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation buttons */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={prevTestimonial}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '20px',
                transition: 'all 0.3s ease',
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              ‹
            </button>
            
            <button
              onClick={nextTestimonial}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '20px',
                transition: 'all 0.3s ease',
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              ›
            </button>
          </>
        )}
      </div>
      
      {/* Dots indicator */}
      {testimonials.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
        }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: index === currentIndex ? '#667eea' : '#e2e8f0',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsCarousel;