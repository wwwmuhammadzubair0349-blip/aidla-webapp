import React from 'react';

const TestsSection = ({ tests }) => {
  if (!tests || tests.length === 0) return null;

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

  const getTimeRemaining = (testDate) => {
    const now = new Date();
    const test = new Date(testDate);
    const diff = test - now;
    
    if (diff <= 0) return 'Ongoing';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      padding: '20px 0',
    }}>
      {tests.map((test) => (
        <div
          key={test.id}
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
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          {test.is_featured && (
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
          }}>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 0 8px 0',
                color: '#1e293b',
              }}>
                {test.title}
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.85rem',
                color: '#64748b',
              }}>
                <span>📅 {formatDate(test.test_date)}</span>
                <span>⏰ {getTimeRemaining(test.test_date)}</span>
              </div>
            </div>
          </div>
          
          {test.description && (
            <p style={{
              fontSize: '0.95rem',
              color: '#64748b',
              lineHeight: 1.6,
              margin: '0 0 24px 0',
            }}>
              {test.description}
            </p>
          )}
          
          {/* Prize pool */}
          {test.prize_pool_coins > 0 && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '8px',
              }}>
                Prize Pool
              </div>
              
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#f59e0b',
                marginBottom: '12px',
              }}>
                {formatNumber(test.prize_pool_coins)} Coins
              </div>
              
              {test.prize_details && Array.isArray(test.prize_details) && test.prize_details.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {test.prize_details.map((prize, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(102,126,234,0.1)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#667eea',
                      }}
                    >
                      {prize.title}: {prize.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Entry and participants */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0',
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: '#64748b',
            }}>
              <div style={{ marginBottom: '8px' }}>
                👥 {test.current_participants || 0} / {test.max_participants || '∞'} joined
              </div>
              {test.entry_coins > 0 && (
                <div>
                  💰 Entry: {formatNumber(test.entry_coins)} Coins
                </div>
              )}
            </div>
            
            <button
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Register Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestsSection;