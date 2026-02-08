import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const HomeManager = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [hero, setHero] = useState(null);
  const [stats, setStats] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [tests, setTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [popups, setPopups] = useState([]);
  
  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        { data: heroData },
        { data: statsData },
        { data: featuresData },
        { data: testimonialsData },
        { data: rewardsData },
        { data: testsData },
        { data: testResultsData },
        { data: popupsData }
      ] = await Promise.all([
        supabase.from('home_hero').select('*').limit(1).single(),
        supabase.from('home_stats').select('*').order('order_index'),
        supabase.from('home_features').select('*').order('order_index'),
        supabase.from('home_testimonials').select('*').order('order_index'),
        supabase.from('home_rewards').select('*').order('order_index'),
        supabase.from('home_tests').select('*').order('test_date'),
        supabase.from('home_test_results').select('*').order('test_date', { ascending: false }),
        supabase.from('home_popups').select('*').order('created_at', { ascending: false })
      ]);

      setHero(heroData || {});
      setStats(statsData || []);
      setFeatures(featuresData || []);
      setTestimonials(testimonialsData || []);
      setRewards(rewardsData || []);
      setTests(testsData || []);
      setTestResults(testResultsData || []);
      setPopups(popupsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file, bucket) => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image: ' + error.message);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // HERO SECTION
  const handleSaveHero = async () => {
    try {
      const { error } = await supabase
        .from('home_hero')
        .upsert(hero);
      
      if (error) throw error;
      alert('Hero section updated successfully!');
      fetchAllData();
    } catch (error) {
      alert('Error updating hero: ' + error.message);
    }
  };

  // STATS SECTION
  const handleSaveStat = async (stat) => {
    try {
      if (stat.id) {
        const { error } = await supabase
          .from('home_stats')
          .update(stat)
          .eq('id', stat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_stats')
          .insert([stat]);
        if (error) throw error;
      }
      alert('Statistic saved successfully!');
      setShowForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error saving statistic: ' + error.message);
    }
  };

  const handleDeleteStat = async (id) => {
    if (!confirm('Delete this statistic?')) return;
    try {
      const { error } = await supabase
        .from('home_stats')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Statistic deleted!');
      fetchAllData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  const handleToggleActive = async (table, id, currentState) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentState })
        .eq('id', id);
      if (error) throw error;
      fetchAllData();
    } catch (error) {
      alert('Error toggling status: ' + error.message);
    }
  };

  // FEATURES SECTION
  const handleSaveFeature = async (feature) => {
    try {
      if (feature.id) {
        const { error } = await supabase
          .from('home_features')
          .update(feature)
          .eq('id', feature.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_features')
          .insert([feature]);
        if (error) throw error;
      }
      alert('Feature saved successfully!');
      setShowForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error saving feature: ' + error.message);
    }
  };

  const handleDeleteFeature = async (id) => {
    if (!confirm('Delete this feature?')) return;
    try {
      const { error } = await supabase
        .from('home_features')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Feature deleted!');
      fetchAllData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // TESTIMONIALS SECTION
  const handleSaveTestimonial = async (testimonial) => {
    try {
      if (testimonial.id) {
        const { error } = await supabase
          .from('home_testimonials')
          .update(testimonial)
          .eq('id', testimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_testimonials')
          .insert([testimonial]);
        if (error) throw error;
      }
      alert('Testimonial saved successfully!');
      setShowForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error saving testimonial: ' + error.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const { error } = await supabase
        .from('home_testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Testimonial deleted!');
      fetchAllData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // REWARDS SECTION
  const handleSaveReward = async (reward) => {
    try {
      if (reward.id) {
        const { error } = await supabase
          .from('home_rewards')
          .update(reward)
          .eq('id', reward.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_rewards')
          .insert([reward]);
        if (error) throw error;
      }
      alert('Reward saved successfully!');
      setShowForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error saving reward: ' + error.message);
    }
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    try {
      const { error } = await supabase
        .from('home_rewards')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Reward deleted!');
      fetchAllData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // TESTS SECTION
  const handleSaveTest = async (test) => {
    try {
      if (test.id) {
        const { error } = await supabase
          .from('home_tests')
          .update(test)
          .eq('id', test.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_tests')
          .insert([test]);
        if (error) throw error;
      }
      alert('Test saved successfully!');
      setShowForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error saving test: ' + error.message);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!confirm('Delete this test?')) return;
    try {
      const { error } = await supabase
        .from('home_tests')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Test deleted!');
      fetchAllData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // POPUPS SECTION
  const handleSavePopup = async (popup) => {
    try {
      if (popup.id) {
        const { error } = await supabase
          .from('home_popups')
          .update(popup)
          .eq('id', popup.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_popups')
          .insert([popup]);
        if (error) throw error;
      }
      alert('Popup saved successfully!');
      setShowForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error saving popup: ' + error.message);
    }
  };

  const handleDeletePopup = async (id) => {
    if (!confirm('Delete this popup?')) return;
    try {
      const { error } = await supabase
        .from('home_popups')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Popup deleted!');
      fetchAllData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // RENDER FUNCTIONS
  const renderHeroEditor = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Hero Section Editor</h2>
      {hero && (
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Headline</label>
            <input
              type="text"
              value={hero.headline || ''}
              onChange={(e) => setHero({ ...hero, headline: e.target.value })}
              style={styles.input}
              placeholder="Enter headline"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Subheadline</label>
            <textarea
              value={hero.subheadline || ''}
              onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
              style={styles.textarea}
              placeholder="Enter subheadline"
              rows={3}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Primary Button Text</label>
              <input
                type="text"
                value={hero.primary_button_text || ''}
                onChange={(e) => setHero({ ...hero, primary_button_text: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Primary Button URL</label>
              <input
                type="text"
                value={hero.primary_button_url || ''}
                onChange={(e) => setHero({ ...hero, primary_button_url: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Secondary Button Text</label>
              <input
                type="text"
                value={hero.secondary_button_text || ''}
                onChange={(e) => setHero({ ...hero, secondary_button_text: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Secondary Button URL</label>
              <input
                type="text"
                value={hero.secondary_button_url || ''}
                onChange={(e) => setHero({ ...hero, secondary_button_url: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const url = await handleUploadImage(file, 'home-images');
                    setHero({ ...hero, background_image_url: url });
                  } catch (error) {
                    // Error already handled in upload function
                  }
                }
              }}
              style={styles.input}
            />
            {hero.background_image_url && (
              <img
                src={hero.background_image_url}
                alt="Preview"
                style={{ width: '200px', marginTop: '10px', borderRadius: '8px' }}
              />
            )}
          </div>
          
          <div style={styles.buttonGroup}>
            <button
              onClick={handleSaveHero}
              style={styles.primaryButton}
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setHero({ ...hero, is_active: !hero.is_active })}
              style={hero.is_active ? styles.dangerButton : styles.successButton}
            >
              {hero.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStatsEditor = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Statistics Editor</h2>
        <button
          onClick={() => {
            setEditingItem({ 
              title: '', 
              value: 0, 
              icon: '', 
              color: '#667eea', 
              order_index: stats.length,
              is_active: true
            });
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          + Add Statistic
        </button>
      </div>
      
      {showForm && activeTab === 'stats' && (
        <div style={{ ...styles.form, marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingItem?.id ? 'Edit Statistic' : 'New Statistic'}
          </h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={editingItem?.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Value</label>
              <input
                type="number"
                value={editingItem?.value || 0}
                onChange={(e) => setEditingItem({ ...editingItem, value: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Icon (emoji)</label>
              <input
                type="text"
                value={editingItem?.icon || ''}
                onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                style={styles.input}
                placeholder="👥"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <input
                type="color"
                value={editingItem?.color || '#667eea'}
                onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Order</label>
              <input
                type="number"
                value={editingItem?.order_index || 0}
                onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={() => handleSaveStat(editingItem)} style={styles.primaryButton}>
              Save
            </button>
            <button onClick={() => { setShowForm(false); setEditingItem(null); }} style={styles.secondaryButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.id} style={styles.card}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontWeight: '700', fontSize: '24px', color: stat.color, marginBottom: '4px' }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{ fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
              {stat.title}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setEditingItem(stat);
                  setShowForm(true);
                }}
                style={styles.iconButton}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteStat(stat.id)}
                style={{ ...styles.iconButton, color: '#ef4444' }}
              >
                🗑️
              </button>
              <button
                onClick={() => handleToggleActive('home_stats', stat.id, stat.is_active)}
                style={styles.iconButton}
              >
                {stat.is_active ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeaturesEditor = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Features Editor</h2>
        <button
          onClick={() => {
            setEditingItem({ 
              title: '', 
              description: '', 
              icon: '✨', 
              icon_color: '#667eea',
              bg_color: 'rgba(102,126,234,0.1)',
              link_url: '',
              link_text: 'Learn More',
              order_index: features.length,
              is_active: true
            });
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          + Add Feature
        </button>
      </div>

      {showForm && activeTab === 'features' && (
        <div style={{ ...styles.form, marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingItem?.id ? 'Edit Feature' : 'New Feature'}
          </h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              style={styles.textarea}
              rows={3}
            />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Icon (emoji)</label>
              <input
                type="text"
                value={editingItem?.icon || ''}
                onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Icon Color</label>
              <input
                type="color"
                value={editingItem?.icon_color || '#667eea'}
                onChange={(e) => setEditingItem({ ...editingItem, icon_color: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Link URL</label>
              <input
                type="text"
                value={editingItem?.link_url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, link_url: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Link Text</label>
              <input
                type="text"
                value={editingItem?.link_text || ''}
                onChange={(e) => setEditingItem({ ...editingItem, link_text: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={() => handleSaveFeature(editingItem)} style={styles.primaryButton}>
              Save
            </button>
            <button onClick={() => { setShowForm(false); setEditingItem(null); }} style={styles.secondaryButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {features.map((feature) => (
          <div key={feature.id} style={styles.card}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{feature.icon}</div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{feature.title}</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              {feature.description.substring(0, 60)}...
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setEditingItem(feature);
                  setShowForm(true);
                }}
                style={styles.iconButton}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteFeature(feature.id)}
                style={{ ...styles.iconButton, color: '#ef4444' }}
              >
                🗑️
              </button>
              <button
                onClick={() => handleToggleActive('home_features', feature.id, feature.is_active)}
                style={styles.iconButton}
              >
                {feature.is_active ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Similar render functions for other tabs would follow the same pattern...
  // For brevity, I'll create simplified versions

  const renderTestimonialsEditor = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Testimonials Editor</h2>
        <button
          onClick={() => {
            setEditingItem({ 
              user_name: '',
              user_role: '',
              user_image_url: '',
              content: '',
              rating: 5,
              achievement: '',
              coins_earned: 0,
              is_featured: false,
              is_active: true,
              order_index: testimonials.length
            });
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          + Add Testimonial
        </button>
      </div>

      {showForm && activeTab === 'testimonials' && (
        <div style={{ ...styles.form, marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingItem?.id ? 'Edit Testimonial' : 'New Testimonial'}
          </h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>User Name *</label>
              <input
                type="text"
                value={editingItem?.user_name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, user_name: e.target.value })}
                style={styles.input}
                placeholder="John Doe"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>User Role</label>
              <input
                type="text"
                value={editingItem?.user_role || ''}
                onChange={(e) => setEditingItem({ ...editingItem, user_role: e.target.value })}
                style={styles.input}
                placeholder="Student / Teacher / Professional"
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>User Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const url = await handleUploadImage(file, 'testimonials');
                    setEditingItem({ ...editingItem, user_image_url: url });
                  } catch (error) {
                    // Error handled in upload function
                  }
                }
              }}
              style={styles.input}
            />
            {editingItem?.user_image_url && (
              <img
                src={editingItem.user_image_url}
                alt="Preview"
                style={{ width: '80px', height: '80px', marginTop: '10px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Testimonial Content *</label>
            <textarea
              value={editingItem?.content || ''}
              onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
              style={styles.textarea}
              rows={4}
              placeholder="Write the testimonial content here..."
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={editingItem?.rating || 5}
                onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Coins Earned</label>
              <input
                type="number"
                value={editingItem?.coins_earned || 0}
                onChange={(e) => setEditingItem({ ...editingItem, coins_earned: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Order</label>
              <input
                type="number"
                value={editingItem?.order_index || 0}
                onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Achievement</label>
            <input
              type="text"
              value={editingItem?.achievement || ''}
              onChange={(e) => setEditingItem({ ...editingItem, achievement: e.target.value })}
              style={styles.input}
              placeholder="Scholarship Winner / Test Champion"
            />
          </div>

          <div style={styles.formRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_featured || false}
                onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                id="testimonial_featured"
              />
              <label htmlFor="testimonial_featured" style={styles.label}>Featured</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_active !== false}
                onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                id="testimonial_active"
              />
              <label htmlFor="testimonial_active" style={styles.label}>Active</label>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleSaveTestimonial(editingItem)} 
              style={styles.primaryButton}
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Save'}
            </button>
            <button 
              onClick={() => { setShowForm(false); setEditingItem(null); }} 
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} style={styles.card}>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{testimonial.user_name}</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              {testimonial.user_role}
            </div>
            <div style={{ fontSize: '12px', marginBottom: '12px' }}>
              "{testimonial.content.substring(0, 80)}..."
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setEditingItem(testimonial);
                  setShowForm(true);
                }}
                style={styles.iconButton}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteTestimonial(testimonial.id)}
                style={{ ...styles.iconButton, color: '#ef4444' }}
              >
                🗑️
              </button>
              <button
                onClick={() => handleToggleActive('home_testimonials', testimonial.id, testimonial.is_active)}
                style={styles.iconButton}
              >
                {testimonial.is_active ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRewardsEditor = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Rewards Editor</h2>
        <button
          onClick={() => {
            setEditingItem({ 
              title: '',
              description: '',
              image_url: '',
              coins_required: 0,
              category: 'voucher',
              is_featured: false,
              is_active: true,
              order_index: rewards.length
            });
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          + Add Reward
        </button>
      </div>

      {showForm && activeTab === 'rewards' && (
        <div style={{ ...styles.form, marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingItem?.id ? 'Edit Reward' : 'New Reward'}
          </h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              style={styles.input}
              placeholder="₹10,000 Scholarship"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              style={styles.textarea}
              rows={3}
              placeholder="Describe the reward..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Reward Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const url = await handleUploadImage(file, 'rewards');
                    setEditingItem({ ...editingItem, image_url: url });
                  } catch (error) {
                    // Error handled in upload function
                  }
                }
              }}
              style={styles.input}
            />
            {editingItem?.image_url && (
              <img
                src={editingItem.image_url}
                alt="Preview"
                style={{ width: '200px', marginTop: '10px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Coins Required *</label>
              <input
                type="number"
                value={editingItem?.coins_required || 0}
                onChange={(e) => setEditingItem({ ...editingItem, coins_required: parseInt(e.target.value) })}
                style={styles.input}
                placeholder="50000"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category *</label>
              <select
                value={editingItem?.category || 'voucher'}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                style={styles.input}
              >
                <option value="scholarship">Scholarship</option>
                <option value="voucher">Voucher</option>
                <option value="cash">Cash</option>
                <option value="merchandise">Merchandise</option>
                <option value="course">Course</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Order</label>
              <input
                type="number"
                value={editingItem?.order_index || 0}
                onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_featured || false}
                onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                id="reward_featured"
              />
              <label htmlFor="reward_featured" style={styles.label}>Featured</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_active !== false}
                onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                id="reward_active"
              />
              <label htmlFor="reward_active" style={styles.label}>Active</label>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleSaveReward(editingItem)} 
              style={styles.primaryButton}
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Save'}
            </button>
            <button 
              onClick={() => { setShowForm(false); setEditingItem(null); }} 
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {rewards.map((reward) => (
          <div key={reward.id} style={styles.card}>
            {reward.image_url && (
              <img src={reward.image_url} alt={reward.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
            )}
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{reward.title}</div>
            <div style={{ fontSize: '14px', color: '#667eea', marginBottom: '8px' }}>
              {reward.coins_required} Coins
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              {reward.category}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => { setEditingItem(reward); setShowForm(true); }} style={styles.iconButton}>✏️</button>
              <button onClick={() => handleDeleteReward(reward.id)} style={{ ...styles.iconButton, color: '#ef4444' }}>🗑️</button>
              <button onClick={() => handleToggleActive('home_rewards', reward.id, reward.is_active)} style={styles.iconButton}>
                {reward.is_active ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestsEditor = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Tests Editor</h2>
        <button
          onClick={() => {
            setEditingItem({ 
              title: '',
              description: '',
              test_date: new Date().toISOString().slice(0, 16),
              registration_deadline: new Date().toISOString().slice(0, 16),
              entry_coins: 0,
              prize_pool_coins: 0,
              max_participants: 100,
              current_participants: 0,
              prize_details: [],
              is_featured: false,
              is_active: true
            });
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          + Add Test
        </button>
      </div>

      {showForm && activeTab === 'tests' && (
        <div style={{ ...styles.form, marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingItem?.id ? 'Edit Test' : 'New Test'}
          </h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Test Title *</label>
            <input
              type="text"
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              style={styles.input}
              placeholder="AI Fundamentals Championship"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              style={styles.textarea}
              rows={3}
              placeholder="Test description..."
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Test Date *</label>
              <input
                type="datetime-local"
                value={editingItem?.test_date ? new Date(editingItem.test_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingItem({ ...editingItem, test_date: new Date(e.target.value).toISOString() })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Registration Deadline</label>
              <input
                type="datetime-local"
                value={editingItem?.registration_deadline ? new Date(editingItem.registration_deadline).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingItem({ ...editingItem, registration_deadline: new Date(e.target.value).toISOString() })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Entry Coins</label>
              <input
                type="number"
                value={editingItem?.entry_coins || 0}
                onChange={(e) => setEditingItem({ ...editingItem, entry_coins: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Prize Pool Coins</label>
              <input
                type="number"
                value={editingItem?.prize_pool_coins || 0}
                onChange={(e) => setEditingItem({ ...editingItem, prize_pool_coins: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Max Participants</label>
              <input
                type="number"
                value={editingItem?.max_participants || 100}
                onChange={(e) => setEditingItem({ ...editingItem, max_participants: parseInt(e.target.value) })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Prize Details (JSON format)</label>
            <textarea
              value={editingItem?.prize_details ? JSON.stringify(editingItem.prize_details, null, 2) : '[]'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setEditingItem({ ...editingItem, prize_details: parsed });
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              style={styles.textarea}
              rows={4}
              placeholder='[{"title": "1st Prize", "value": "₹25,000"}]'
            />
<small style={{ color: '#64748b', fontSize: '12px' }}>
  {`Format: [{"title": "1st Prize", "value": "Rs. 25,000"}, ...]`}
</small>

          </div>

          <div style={styles.formRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_featured || false}
                onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                id="test_featured"
              />
              <label htmlFor="test_featured" style={styles.label}>Featured</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_active !== false}
                onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                id="test_active"
              />
              <label htmlFor="test_active" style={styles.label}>Active</label>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleSaveTest(editingItem)} 
              style={styles.primaryButton}
            >
              Save
            </button>
            <button 
              onClick={() => { setShowForm(false); setEditingItem(null); }} 
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {tests.map((test) => (
          <div key={test.id} style={styles.card}>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{test.title}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              📅 {new Date(test.test_date).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '12px', color: '#667eea', marginBottom: '12px' }}>
              💰 {test.prize_pool_coins} Coins Pool
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => { setEditingItem(test); setShowForm(true); }} style={styles.iconButton}>✏️</button>
              <button onClick={() => handleDeleteTest(test.id)} style={{ ...styles.iconButton, color: '#ef4444' }}>🗑️</button>
              <button onClick={() => handleToggleActive('home_tests', test.id, test.is_active)} style={styles.iconButton}>
                {test.is_active ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPopupsEditor = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Popups Editor</h2>
        <button
          onClick={() => {
            setEditingItem({ 
              title: '',
              content: '',
              button_text: 'Learn More',
              button_url: '',
              image_url: '',
              bg_color: '#667eea',
              text_color: '#ffffff',
              position: 'center',
              delay_seconds: 3,
              frequency_hours: 24,
              max_views: null,
              start_time: new Date().toISOString(),
              end_time: null,
              is_active: true
            });
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          + Add Popup
        </button>
      </div>

      {showForm && activeTab === 'popups' && (
        <div style={{ ...styles.form, marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingItem?.id ? 'Edit Popup' : 'New Popup'}
          </h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Popup Title *</label>
            <input
              type="text"
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              style={styles.input}
              placeholder="Special Offer!"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Content *</label>
            <textarea
              value={editingItem?.content || ''}
              onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
              style={styles.textarea}
              rows={3}
              placeholder="Enter popup message..."
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Button Text</label>
              <input
                type="text"
                value={editingItem?.button_text || ''}
                onChange={(e) => setEditingItem({ ...editingItem, button_text: e.target.value })}
                style={styles.input}
                placeholder="Learn More"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Button URL</label>
              <input
                type="text"
                value={editingItem?.button_url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, button_url: e.target.value })}
                style={styles.input}
                placeholder="/signup"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Popup Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const url = await handleUploadImage(file, 'home-images');
                    setEditingItem({ ...editingItem, image_url: url });
                  } catch (error) {
                    // Error handled in upload function
                  }
                }
              }}
              style={styles.input}
            />
            {editingItem?.image_url && (
              <img
                src={editingItem.image_url}
                alt="Preview"
                style={{ width: '200px', marginTop: '10px', borderRadius: '8px' }}
              />
            )}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Background Color</label>
              <input
                type="color"
                value={editingItem?.bg_color || '#667eea'}
                onChange={(e) => setEditingItem({ ...editingItem, bg_color: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Text Color</label>
              <input
                type="color"
                value={editingItem?.text_color || '#ffffff'}
                onChange={(e) => setEditingItem({ ...editingItem, text_color: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Position</label>
              <select
                value={editingItem?.position || 'center'}
                onChange={(e) => setEditingItem({ ...editingItem, position: e.target.value })}
                style={styles.input}
              >
                <option value="center">Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Delay (seconds)</label>
              <input
                type="number"
                value={editingItem?.delay_seconds || 3}
                onChange={(e) => setEditingItem({ ...editingItem, delay_seconds: parseInt(e.target.value) })}
                style={styles.input}
                placeholder="3"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Frequency (hours)</label>
              <input
                type="number"
                value={editingItem?.frequency_hours || 24}
                onChange={(e) => setEditingItem({ ...editingItem, frequency_hours: parseInt(e.target.value) })}
                style={styles.input}
                placeholder="24"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Max Views</label>
              <input
                type="number"
                value={editingItem?.max_views || ''}
                onChange={(e) => setEditingItem({ ...editingItem, max_views: e.target.value ? parseInt(e.target.value) : null })}
                style={styles.input}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Time</label>
              <input
                type="datetime-local"
                value={editingItem?.start_time ? new Date(editingItem.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingItem({ ...editingItem, start_time: new Date(e.target.value).toISOString() })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>End Time (optional)</label>
              <input
                type="datetime-local"
                value={editingItem?.end_time ? new Date(editingItem.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingItem({ ...editingItem, end_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={editingItem?.is_active !== false}
                onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                id="popup_active"
              />
              <label htmlFor="popup_active" style={styles.label}>Active</label>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleSavePopup(editingItem)} 
              style={styles.primaryButton}
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Save'}
            </button>
            <button 
              onClick={() => { setShowForm(false); setEditingItem(null); }} 
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {popups.map((popup) => (
          <div key={popup.id} style={styles.card}>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{popup.title}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              Position: {popup.position}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Delay: {popup.delay_seconds}s | Freq: {popup.frequency_hours}h
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => { setEditingItem(popup); setShowForm(true); }} style={styles.iconButton}>✏️</button>
              <button onClick={() => handleDeletePopup(popup.id)} style={{ ...styles.iconButton, color: '#ef4444' }}>🗑️</button>
              <button onClick={() => handleToggleActive('home_popups', popup.id, popup.is_active)} style={styles.iconButton}>
                {popup.is_active ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { key: 'hero', label: 'Hero' },
    { key: 'stats', label: 'Statistics' },
    { key: 'features', label: 'Features' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'rewards', label: 'Rewards' },
    { key: 'tests', label: 'Tests' },
    { key: 'popups', label: 'Popups' },
  ];

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
    },
    header: {
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '2px solid #e5e7eb',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0,
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '4px',
      marginBottom: '32px',
      border: '1px solid #e5e7eb',
      overflowX: 'auto',
    },
    tab: (active) => ({
      padding: '12px 20px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: active ? '#667eea' : 'transparent',
      color: active ? '#ffffff' : '#64748b',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    }),
    section: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      flex: 1,
    },
    formRow: {
      display: 'flex',
      gap: '16px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569',
    },
    input: {
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    textarea: {
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
    },
    primaryButton: {
      padding: '10px 20px',
      backgroundColor: '#667eea',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
    },
    secondaryButton: {
      padding: '10px 20px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
    },
    successButton: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
    },
    dangerButton: {
      padding: '10px 20px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
    },
    addButton: {
      padding: '10px 16px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '16px',
      marginTop: '20px',
    },
    card: {
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f8fafc',
      textAlign: 'center',
    },
    iconButton: {
      padding: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '16px',
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px', color: '#667eea' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏠 Home Page Manager</h1>
        <p style={styles.subtitle}>Complete control over your home page content</p>
      </header>
      
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setShowForm(false);
              setEditingItem(null);
            }}
            style={styles.tab(activeTab === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'hero' && renderHeroEditor()}
      {activeTab === 'stats' && renderStatsEditor()}
      {activeTab === 'features' && renderFeaturesEditor()}
      {activeTab === 'testimonials' && renderTestimonialsEditor()}
      {activeTab === 'rewards' && renderRewardsEditor()}
      {activeTab === 'tests' && renderTestsEditor()}
      {activeTab === 'popups' && renderPopupsEditor()}
    </div>
  );
};

export default HomeManager;