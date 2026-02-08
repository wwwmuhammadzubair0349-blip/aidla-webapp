import React from 'react';

const FeaturesGrid = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      padding: '20px 0',
    }}>
      {features.map((feature) => (
        <div
          key={feature.id}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: feature.bg_color || 'rgba(102,126,234,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '20px',
            color: feature.icon_color || '#667eea',
          }}>
            {feature.icon}
          </div>
          
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: '0 0 12px 0',
            color: '#1e293b',
          }}>
            {feature.title}
          </h3>
          
          <p style={{
            fontSize: '0.95rem',
            color: '#64748b',
            lineHeight: 1.6,
            margin: '0 0 16px 0',
          }}>
            {feature.description}
          </p>
          
          {feature.link_url && (
            <a
              href={feature.link_url}
              style={{
                color: '#667eea',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {feature.link_text || 'Learn more'} →
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeaturesGrid;