import React, { useEffect, useState } from 'react';

const StatisticsSection = ({ stats }) => {
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    if (stats && stats.length > 0) {
      stats.forEach(stat => {
        animateValue(stat.id, 0, stat.value, 2000);
      });
    }
  }, [stats]);

  const animateValue = (id, start, end, duration) => {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setAnimatedValues(prev => ({
        ...prev,
        [id]: Math.floor(current)
      }));
    }, 16);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (!stats || stats.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      padding: '40px 20px',
    }}>
      {stats.map((stat) => (
        <div
          key={stat.id}
          style={{
            textAlign: 'center',
            padding: '24px',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {stat.icon && (
            <div style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}>
              {stat.icon}
            </div>
          )}
          
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: stat.color || '#667eea',
            marginBottom: '8px',
            lineHeight: 1,
          }}>
            {formatNumber(animatedValues[stat.id] || stat.value)}
          </div>
          
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#64748b',
          }}>
            {stat.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsSection;