import React from 'react';

const SuccessStories = ({ results }) => {
  if (!results || results.length === 0) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      padding: '20px 0',
    }}>
      {results.map((result) => (
        <div
          key={result.id}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {result.is_featured && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#10b981',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
            }}>
              ⭐ CHAMPION
            </div>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}>
            {result.winner_image_url ? (
              <img
                src={result.winner_image_url}
                alt={result.winner_name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #667eea',
                }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 700,
                color: '#ffffff',
                border: '3px solid #667eea',
              }}>
                {result.winner_name?.charAt(0) || 'W'}
              </div>
            )}
            
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 0 4px 0',
                color: '#1e293b',
              }}>
                {result.winner_name}
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.85rem',
                color: '#64748b',
              }}>
                <span>🏆 Winner</span>
                <span>📅 {formatDate(result.test_date)}</span>
              </div>
            </div>
          </div>
          
          {result.winner_achievement && (
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '16px',
              border: '1px solid rgba(245,158,11,0.2)',
            }}>
              {result.winner_achievement}
            </div>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0',
          }}>
            <div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '4px',
              }}>
                Coins Won
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#f59e0b',
              }}>
                {formatNumber(result.coins_won || 0)}
              </div>
            </div>
            
            <button
              style={{
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Story
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuccessStories;