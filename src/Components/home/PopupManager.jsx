import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const PopupManager = () => {
  const [popups, setPopups] = useState([]);
  const [visiblePopup, setVisiblePopup] = useState(null);
  const [lastShown, setLastShown] = useState({});

  useEffect(() => {
    fetchPopups();
    
    const subscription = supabase
      .channel('popup-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'home_popups' },
        fetchPopups
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const fetchPopups = async () => {
    try {
      const { data, error } = await supabase
        .from('home_popups')
        .select('*')
        .eq('is_active', true)
        .lte('start_time', new Date().toISOString())
        .or('end_time.is.null,end_time.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPopups(data || []);
      checkPopupsToShow(data || []);
    } catch (error) {
      console.error('Error fetching popups:', error);
    }
  };

  const checkPopupsToShow = (popupList) => {
    const now = Date.now();
    
    popupList.forEach(popup => {
      const lastShownTime = lastShown[popup.id] || 0;
      const timeSinceLastShow = now - lastShownTime;
      const frequencyMs = (popup.frequency_hours || 24) * 60 * 60 * 1000;
      
      const shouldShow = 
        !visiblePopup &&
        timeSinceLastShow >= frequencyMs &&
        (!popup.max_views || (popup.view_count || 0) < popup.max_views);
      
      if (shouldShow) {
        setTimeout(() => {
          setVisiblePopup(popup);
          setLastShown(prev => ({ ...prev, [popup.id]: now }));
          
          // Increment view count
          supabase
            .from('home_popups')
            .update({ view_count: (popup.view_count || 0) + 1 })
            .eq('id', popup.id)
            .then(() => {});
        }, (popup.delay_seconds || 3) * 1000);
      }
    });
  };

  const closePopup = () => {
    setVisiblePopup(null);
  };

  if (!visiblePopup) return null;

  const popupStyles = {
    center: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    'bottom-right': {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
    },
    'bottom-left': {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
    },
    'top-right': {
      position: 'fixed',
      top: '20px',
      right: '20px',
    },
    'top-left': {
      position: 'fixed',
      top: '20px',
      left: '20px',
    },
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        ...popupStyles[visiblePopup.position || 'center'],
        backgroundColor: visiblePopup.bg_color || '#667eea',
        color: visiblePopup.text_color || '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <button
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: visiblePopup.text_color || '#ffffff',
            cursor: 'pointer',
            opacity: 0.7,
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          ✕
        </button>
        
        {visiblePopup.image_url && (
          <img
            src={visiblePopup.image_url}
            alt={visiblePopup.title}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          />
        )}
        
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '24px', 
          fontWeight: 700,
          color: visiblePopup.text_color || '#ffffff'
        }}>
          {visiblePopup.title}
        </h3>
        
        <p style={{ 
          margin: '0 0 24px 0', 
          fontSize: '16px', 
          opacity: 0.9, 
          lineHeight: 1.5,
          color: visiblePopup.text_color || '#ffffff'
        }}>
          {visiblePopup.content}
        </p>
        
        {visiblePopup.button_url && (
          <a
            href={visiblePopup.button_url}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: visiblePopup.text_color || '#ffffff',
              color: visiblePopup.bg_color || '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {visiblePopup.button_text || 'Learn More'}
          </a>
        )}
      </div>
    </div>
  );
};

export default PopupManager;