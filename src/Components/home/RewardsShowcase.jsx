import React from 'react';

const RewardsShowcase = ({ rewards }) => {
  if (!rewards || rewards.length === 0) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'scholarship': return '🎓';
      case 'voucher': return '🎫';
      case 'cash': return '💵';
      case 'merchandise': return '👕';
      case 'course': return '📚';
      default: return '🎁';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      padding: '20px 0',
    }}>
      {rewards.map((reward) => (
        <div
          key={reward.id}
          style={{
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            height: '200px',
            background: `url(${reward.image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}>
            {reward.is_featured && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f59e0b',
                color: '#000',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                FEATURED
              </div>
            )}
            
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontSize: '32px',
              background: 'rgba(0,0,0,0.5)',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}>
              {getCategoryIcon(reward.category)}
            </div>
          </div>
          
          <div style={{ padding: '24px' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              margin: '0 0 8px 0',
              color: '#1e293b',
            }}>
              {reward.title}
            </h3>
            
            {reward.description && (
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: 1.5,
                margin: '0 0 16px 0',
              }}>
                {reward.description}
              </p>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                background: 'rgba(102,126,234,0.1)',
                color: '#667eea',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}>
                {formatNumber(reward.coins_required)} Coins
              </div>
            </div>
            
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Redeem Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RewardsShowcase;