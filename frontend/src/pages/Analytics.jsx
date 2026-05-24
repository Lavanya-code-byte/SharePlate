import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, Leaf, Award, Utensils, ShieldAlert, Sparkles, Scale,
  Printer, X, Store, Heart, Clock
} from 'lucide-react';

const Analytics = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [simulatedWeight, setSimulatedWeight] = useState(150);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        } else {
          setError('Failed to fetch platform analytics');
        }
      } catch (err) {
        setError('Network error loading analytics statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <h3 className="text-muted">Calculating Carbon Offsets & Aggregating Database Metrics...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <ShieldAlert size={48} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2>Analytics Temporarily Unavailable</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>{error || 'No analytics data returned.'}</p>
      </div>
    );
  }

  const { summary, foodTypeStats, trendData, ngoDistribution, restaurantDistribution } = data;

  // Custom colors for charts
  const PIE_COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b'];

  // Formatting food category stats for Recharts Pie
  const pieData = foodTypeStats.map(stat => ({
    name: stat.type,
    value: stat.weight
  }));

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }} className="gradient-text">
          Eco-Impact & Platform Analytics
        </h1>
        <p className="text-muted">
          Aggregated environmental offsets and social food redistribution metrics mapped in real-time.
        </p>
      </div>

      {/* Impact Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '2.5rem' }}>
        {/* Card 1: CO2 Offset */}
        <div className="glass-card stat-card pulse-glow" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
            <Leaf size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {summary.co2Offset.toLocaleString()} kg
            </div>
            <div className="stat-label">CO2 Carbon Footprint Prevented</div>
          </div>
        </div>

        {/* Card 2: Total Weight Saved */}
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent)' }}>
            <Scale size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.totalWeightSaved.toFixed(1)} kg</div>
            <div className="stat-label">Surplus Food Saved</div>
          </div>
        </div>

        {/* Card 3: Meals Redistributed */}
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.mealsRedistributed.toLocaleString()}</div>
            <div className="stat-label">Estimated Meals Redirected</div>
          </div>
        </div>

        {/* Card 4: Platform Efficiency */}
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">
              {summary.totalListings > 0 
                ? Math.round(((summary.deliveredCount + summary.claimedCount) / summary.totalListings) * 100)
                : 0}%
            </div>
            <div className="stat-label">Redistribution Efficiency Rate</div>
          </div>
        </div>
      </div>

      {/* Premium Feature: Certificate Claim CTA */}
      <div className="glass-card pulse-glow" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        padding: '2rem',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Award size={22} color="var(--color-success)" />
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Official Eco-Impact Savior Recognition</h3>
          </div>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Congratulations! Your contributions have helped avoid carbon emission release, feed families in need, and establish a green circular economy. Verify your credentials and claim your official printable Certificate of Recognition.
          </p>
        </div>
        <button 
          onClick={() => setShowCertificate(true)} 
          className="btn btn-success" 
          style={{
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Sparkles size={18} />
          Claim Savior Certificate
        </button>
      </div>

      {/* Premium Feature: Green Savior Community Leaderboards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="leaderboard-grid">
        
        {/* Leaderboard 1: Top Surplus Donors (Restaurants) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Store size={20} color="var(--color-success)" />
            <h3 style={{ margin: 0 }}>Top Surplus Donors (Restaurants)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {(!restaurantDistribution || restaurantDistribution.length === 0) ? (
              <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                Waiting for successfully delivered donations.
              </div>
            ) : (
              restaurantDistribution.map((item, index) => {
                const isPodium = index < 3;
                const podiumColors = ['#fbbf24', '#cbd5e1', '#d97706']; // Gold, Silver, Bronze
                const podiumBadges = ['🥇', '🥈', '🥉'];
                
                return (
                  <div 
                    key={item.restaurantName} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: isPodium ? `rgba(255, 255, 255, 0.03)` : 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid',
                      borderColor: isPodium ? `rgba(255, 255, 255, 0.08)` : 'var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: index === 0 ? '0 0 15px rgba(251, 191, 36, 0.05)' : 'none',
                      transition: 'var(--transition-fast)'
                    }}
                    className="leaderboard-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Rank Indicator */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isPodium ? podiumColors[index] + '20' : 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid',
                        borderColor: isPodium ? podiumColors[index] : 'var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: isPodium ? podiumColors[index] : 'var(--color-text-secondary)'
                      }}>
                        {isPodium ? podiumBadges[index] : index + 1}
                      </div>
                      
                      {/* Profile Details */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: isPodium ? '1.05rem' : '0.95rem' }}>{item.restaurantName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                          {item.count} rescue operations completed
                        </div>
                      </div>
                    </div>
                    
                    {/* Weight Metric */}
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '1.25rem', color: isPodium ? podiumColors[index] : 'var(--color-text-primary)' }}>
                        {item.weight.toFixed(1)}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '0.2rem' }}>kg</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Leaderboard 2: Top Hunger Relief Heroes (NGOs) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Heart size={20} color="var(--color-accent)" />
            <h3 style={{ margin: 0 }}>Top Hunger Relief Heroes (NGOs)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {(!ngoDistribution || ngoDistribution.length === 0) ? (
              <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                Waiting for claimed/distributed food milestones.
              </div>
            ) : (
              ngoDistribution.map((item, index) => {
                const isPodium = index < 3;
                const podiumColors = ['#fbbf24', '#cbd5e1', '#d97706']; // Gold, Silver, Bronze
                const podiumBadges = ['🥇', '🥈', '🥉'];
                
                return (
                  <div 
                    key={item.ngoName} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: isPodium ? `rgba(255, 255, 255, 0.03)` : 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid',
                      borderColor: isPodium ? `rgba(255, 255, 255, 0.08)` : 'var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: index === 0 ? '0 0 15px rgba(251, 191, 36, 0.05)' : 'none',
                      transition: 'var(--transition-fast)'
                    }}
                    className="leaderboard-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Rank Indicator */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isPodium ? podiumColors[index] + '20' : 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid',
                        borderColor: isPodium ? podiumColors[index] : 'var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: isPodium ? podiumColors[index] : 'var(--color-text-secondary)'
                      }}>
                        {isPodium ? podiumBadges[index] : index + 1}
                      </div>
                      
                      {/* Profile Details */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: isPodium ? '1.05rem' : '0.95rem' }}>{item.ngoName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                          {item.count} distribution runs fulfilled
                        </div>
                      </div>
                    </div>
                    
                    {/* Weight Metric */}
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '1.25rem', color: isPodium ? podiumColors[index] : 'var(--color-text-primary)' }}>
                        {item.weight.toFixed(1)}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '0.2rem' }}>kg</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Premium Feature: Interactive Savior Certificate Modal Overlay */}
      {showCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto'
        }} className="no-print-overlay">
          
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-lg)',
            width: '100%',
            maxWidth: '850px',
            boxShadow: 'var(--shadow-lg), 0 0 50px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} className="certificate-modal-card">
            
            {/* Modal Controls */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>Certificate Hub</h3>
              <button 
                onClick={() => setShowCertificate(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Certificate Canvas Area */}
            <div style={{ padding: '2.5rem', display: 'flex', justifyContent: 'center', background: '#070a13' }}>
              
              <div 
                id="certificate-print-area"
                style={{
                  width: '100%',
                  background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
                  border: '4px double #10b981',
                  borderRadius: '12px',
                  padding: '3rem',
                  position: 'relative',
                  textAlign: 'center',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)'
                }}
              >
                {/* Visual Gold/Green Seal Background */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  border: '2px dashed rgba(16, 185, 129, 0.05)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={150} style={{ opacity: 0.02, color: 'var(--color-success)' }} />
                </div>

                {/* Header Logo */}
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#10b981' }}>
                  SHAREPLATE ENVIRONMENTAL REDISTRIBUTION NETWORK
                </div>

                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800, 
                  color: '#fbbf24', 
                  letterSpacing: '0.05em',
                  textShadow: '0 2px 10px rgba(251, 191, 36, 0.2)',
                  fontFamily: 'serif',
                  marginBottom: '1rem'
                }}>
                  Certificate of Achievement
                </div>

                <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  This certificate of green social stewardship is officially presented to
                </p>

                <h1 style={{ 
                  fontSize: '2.6rem', 
                  fontWeight: 800, 
                  color: 'white', 
                  borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
                  display: 'inline-block',
                  paddingBottom: '0.5rem',
                  minWidth: '350px',
                  marginBottom: '2rem',
                  fontFamily: 'var(--font-main)'
                }}>
                  {user ? user.name : 'Steward of the Planet'}
                </h1>

                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  maxWidth: '600px', 
                  margin: '0 auto 2.5rem auto', 
                  lineHeight: 1.6, 
                  fontSize: '0.95rem' 
                }}>
                  For exemplary partnership with **SharePlate**, displaying dynamic dedication to reclaiming surplus resources, feeding local communities in need, and saving valuable eco-impact resources.
                </p>

                {/* Achievement Statistics Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1.5rem', 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '1.5rem',
                  maxWidth: '550px',
                  margin: '0 auto 2.5rem auto'
                }}>
                  <div>
                    <div style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 800 }}>{summary.totalWeightSaved.toFixed(1)} kg</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.25rem' }}>Food Saved</div>
                  </div>
                  <div>
                    <div style={{ color: '#6366f1', fontSize: '1.4rem', fontWeight: 800 }}>{summary.co2Offset.toFixed(1)} kg</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.25rem' }}>CO2 Prevented</div>
                  </div>
                  <div>
                    <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 800 }}>{summary.mealsRedistributed.toLocaleString()}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.25rem' }}>Meals Provided</div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-end', 
                  maxWidth: '600px', 
                  margin: '0 auto' 
                }}>
                  <div style={{ textAlign: 'left', width: '180px' }}>
                    <div style={{ fontFamily: 'cursive', color: '#fbbf24', fontSize: '1.1rem', marginBottom: '0.25rem' }}>SharePlate Network</div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.35rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Issuing Board Authority
                    </div>
                  </div>
                  
                  {/* Decorative Seal Icon */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '3px double #fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    background: 'rgba(251, 191, 36, 0.05)',
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)'
                  }}>
                    <Award size={28} />
                  </div>

                  <div style={{ textAlign: 'right', width: '180px' }}>
                    <div style={{ fontFamily: 'sans-serif', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.35rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Date Authorized
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Bottom Controls */}
            <div style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              background: 'rgba(0, 0, 0, 0.1)'
            }}>
              <button onClick={() => setShowCertificate(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => window.print()} 
                className="btn btn-success"
              >
                <Printer size={18} />
                Download / Print PDF
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Styled CSS Rules for interactive podiums, modals, and print media scaling */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaderboard-row:hover {
          border-color: rgba(99, 102, 241, 0.3) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .leaderboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        /* Custom styles for printing certificate */
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            border: 4px double #10b981 !important;
            box-shadow: none !important;
            background: #020617 !important;
            color: white !important;
          }
          .no-print-overlay {
            background: none !important;
            backdrop-filter: none !important;
            position: absolute !important;
            padding: 0 !important;
          }
          .certificate-modal-card {
            box-shadow: none !important;
            border: none !important;
            background: none !important;
            width: 100% !important;
          }
        }
      `}} />

      {/* Recruiter Advanced Feature: Interactive Eco-Impact & Emissions Simulator Slider */}
      <div className="glass-card" style={{ marginBottom: '2.5rem', background: 'rgba(22, 33, 59, 0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Leaf size={22} color="var(--color-success)" />
          <h2 style={{ margin: 0 }}>Recruiter Interactive Lab: Eco-Impact & Emissions Simulator</h2>
        </div>
        <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          Tech recruiters can slide the surplus rescue weight below to test our dynamic real-time carbon offsets, water reclamation, and soil-preservation algorithms!
        </p>

        {/* Dynamic Slider Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1.75rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Simulated Surplus Food Rescued:</span>
            <strong style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
              {simulatedWeight} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg</span>
            </strong>
          </div>
          
          <input 
            type="range" 
            min="10" 
            max="1000" 
            step="10"
            value={simulatedWeight}
            onChange={(e) => setSimulatedWeight(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer',
              accentColor: 'var(--color-success)'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            <span>10 kg (Micro scale)</span>
            <span>500 kg (Community scale)</span>
            <span>1000 kg (Industrial scale)</span>
          </div>
        </div>

        {/* Dynamic Calculator Outputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          
          {/* Carbon Savings Column */}
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.03)', 
            border: '1px solid rgba(16, 185, 129, 0.1)', 
            borderRadius: 'var(--border-radius-sm)',
            padding: '1.25rem',
            borderLeft: '4px solid var(--color-success)',
            transition: 'var(--transition-fast)'
          }} className="sim-col">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>🚗 greenhouse carbon savings</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)', margin: '0.5rem 0' }}>
              {(simulatedWeight * 2.5).toFixed(1)} kg <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>CO₂</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Equivalent to avoiding driving a passenger car for <strong>{(simulatedWeight * 2.5 * 2.4).toFixed(0)}</strong> miles (~{(simulatedWeight * 2.5 * 3.86).toFixed(0)} km).
            </p>
          </div>

          {/* Water Savings Column */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.03)', 
            border: '1px solid rgba(99, 102, 241, 0.1)', 
            borderRadius: 'var(--border-radius-sm)',
            padding: '1.25rem',
            borderLeft: '4px solid var(--color-accent)',
            transition: 'var(--transition-fast)'
          }} className="sim-col">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>💧 water supply protection</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-accent)', margin: '0.5rem 0' }}>
              {(simulatedWeight * 1000).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>liters</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Equivalent to the drinking water needs of <strong>{(simulatedWeight * 1000 / 3).toFixed(0)}</strong> humans for a day, or <strong>{(simulatedWeight * 1000 / 60).toFixed(0)}</strong> full hot showers.
            </p>
          </div>

          {/* Land Conservation Column */}
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.03)', 
            border: '1px solid rgba(245, 158, 11, 0.1)', 
            borderRadius: 'var(--border-radius-sm)',
            padding: '1.25rem',
            borderLeft: '4px solid var(--color-warning)',
            transition: 'var(--transition-fast)'
          }} className="sim-col">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>🌿 agricultural land offset</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)', margin: '0.5rem 0' }}>
              {(simulatedWeight * 4).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>m²</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Equivalent to preserving <strong>{(simulatedWeight * 4 / 7140).toFixed(3)}</strong> professional soccer fields worth of rich fertile agricultural soil.
            </p>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .sim-col:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          transform: translateY(-2px);
        }
      `}} />

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Chart 1: Historical Daily Trend */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} color="var(--color-accent)" />
            <h3>Daily Redistribution Weight (kg)</h3>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--color-text-primary)',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="weight" name="Saved Weight (kg)" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Reclaiming NGOs */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Sparkles size={20} color="var(--color-success)" />
            <h3>Top Reclaiming NGOs (kg Saved)</h3>
          </div>
          
          <div className="chart-container">
            {ngoDistribution.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--color-text-muted)' }}>
                No claimed distribution history seeded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ngoDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis type="category" dataKey="ngoName" stroke="var(--color-text-muted)" fontSize={11} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--color-text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="weight" name="Food Reclaimed (kg)" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Food Category Weight Breakdown */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Utensils size={20} color="var(--color-warning)" />
            <h3>Redistributed Weight by Food Category</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', alignItems: 'center', gap: '2rem' }}>
            <div className="chart-container" style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--color-text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Pie Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pieData.map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                    <span style={{ fontWeight: 600 }}>{item.name} Category</span>
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: PIE_COLORS[index % PIE_COLORS.length] }}>
                    {item.value.toFixed(1)} kg
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
