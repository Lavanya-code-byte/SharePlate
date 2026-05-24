import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, LayoutDashboard, BarChart3, ShieldAlert, Heart, Truck, Store,
  Bell, X, CheckCheck, Trash2, Clock, Sparkles 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'BBQ Pulled Pork Listed!',
      message: 'Mission Grill & Greenery posted 10.0 kg of fresh surplus BBQ sandwiches.',
      time: '10m ago',
      type: 'listing',
      unread: true,
      icon: <Store size={14} />
    },
    {
      id: 2,
      title: 'Delivery Claimed!',
      message: 'SF Compassion Community Kitchen claimed the Teriyaki Chicken Bowls.',
      time: '1h ago',
      type: 'claim',
      unread: true,
      icon: <Heart size={14} />
    },
    {
      id: 3,
      title: 'Courier En Route',
      message: 'Eco Courier Alex accepted the active routing coordinates.',
      time: '3h ago',
      type: 'transit',
      unread: false,
      icon: <Truck size={14} />
    },
    {
      id: 4,
      title: 'Impact Landmark! 🎉',
      message: 'Platform aggregate reached 50.0 kg carbon offset saving milestones!',
      time: '1d ago',
      type: 'impact',
      unread: false,
      icon: <Sparkles size={14} />
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

        const getRoleIcon = () => {
          if (!user) return null;
          switch (user.role) {
            case 'restaurant': return <Store size={14} />;
            case 'ngo': return <Heart size={14} />;
            case 'delivery': return <Truck size={14} />;
            default: return null;
          }
        };

        return (
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Brand Logo */}
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  position: 'relative'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.35))' }}>
                    {/* Plate circle */}
                    <circle cx="12" cy="12" r="9" stroke="var(--color-success)" strokeWidth="2" />
                    {/* Inner Leaf Sprout (Ecology) */}
                    <path d="M12 15c2-2.5 3-4.5 3-6.5a3 3 0 0 0-6 0c0 2 1 4 3 6.5z" fill="var(--color-success)" opacity="0.25" stroke="var(--color-success)" strokeWidth="1.25" />
                    {/* Inner Fork (Food Service) */}
                    <path d="M12 9v4" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" />
                    <path d="M10.25 10v1.5" stroke="var(--color-accent)" strokeWidth="1.25" strokeLinecap="round" />
                    <path d="M13.75 10v1.5" stroke="var(--color-accent)" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  Share<span style={{ color: 'var(--color-success)' }}>Plate</span>
                </span>
              </Link>

              {/* Navigation Links */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {user ? (
                  <>
                    <Link to="/dashboard" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      transition: 'var(--transition-fast)'
                    }} className="nav-link">
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <Link to="/analytics" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      transition: 'var(--transition-fast)'
                    }} className="nav-link">
                      <BarChart3 size={18} />
                      Analytics
                    </Link>

                    {/* Divider */}
                    <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>

                    {/* Notification Bell Button */}
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        padding: '0.6rem',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: notifications.some(n => n.unread) ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        position: 'relative',
                        transition: 'var(--transition-fast)'
                      }}
                      className="bell-btn"
                      title="Alert Center"
                    >
                      <Bell size={18} className={notifications.some(n => n.unread) ? "pulse-glow" : ""} />
                      {notifications.some(n => n.unread) && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          background: 'var(--color-danger)',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-primary)'
                        }}></span>
                      )}
                    </button>

                    {/* Profile Information */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                        <span className={`badge badge-${user.role}`} style={{ gap: '0.25rem', marginTop: '0.1rem' }}>
                          {getRoleIcon()}
                          {user.role}
                        </span>
                      </div>
                      
                      <button onClick={handleLogout} className="btn btn-secondary" style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--border-radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} title="Log Out">
                        <LogOut size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                      Access Platform
                    </Link>
                  </>
                )}
              </nav>
            </div>
            
            {/* Notification Slide-out Drawer */}
            {showNotifications && (
              <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '380px',
                height: '100vh',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderLeft: '1px solid var(--border-color)',
                boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {/* Drawer Header */}
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bell size={20} color="var(--color-accent)" />
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Alert Center</h3>
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span style={{
                        background: 'var(--color-danger)',
                        color: 'white',
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '50%',
                        fontWeight: 800
                      }}>
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setShowNotifications(false)} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem'
                  }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Actions */}
                {notifications.length > 0 && (
                  <div style={{
                    padding: '0.75rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <button onClick={markAllAsRead} style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 500
                    }} className="drawer-btn">
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                    <button onClick={clearAll} style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-danger)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 500
                    }} className="drawer-btn">
                      <Trash2 size={14} />
                      Clear all
                    </button>
                  </div>
                )}

                {/* Drawer Content */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem'
                }} className="custom-scroll">
                  {notifications.length === 0 ? (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-secondary)',
                      gap: '1rem',
                      textAlign: 'center',
                      padding: '2rem'
                    }}>
                      <Bell size={36} style={{ opacity: 0.3 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>All quiet here!</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>You have caught up with all surplus food rescues.</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{
                          background: n.unread ? 'rgba(99, 102, 241, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid',
                          borderColor: n.unread ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-color)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '1rem',
                          position: 'relative',
                          transition: 'var(--transition-fast)'
                        }} className="notif-card">
                          {n.unread && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '8px',
                              height: '8px',
                              background: 'var(--color-accent)',
                              borderRadius: '50%',
                              boxShadow: '0 0 8px var(--color-accent)'
                            }}></div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span className={`badge badge-${n.type === 'listing' ? 'restaurant' : n.type === 'claim' ? 'ngo' : 'delivery'}`} style={{
                              padding: '0.2rem 0.45rem',
                              fontSize: '0.65rem'
                            }}>
                              {n.icon}
                            </span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{n.title}</strong>
                          </div>

                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>{n.message}</p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} />
                              {n.time}
                            </span>
                            <button onClick={() => deleteNotification(n.id)} style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                              fontSize: '0.75rem'
                            }} className="delete-notif-btn">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* NavLink Hover & Drawer Effect Styles */}
            <style dangerouslySetInnerHTML={{__html: `
              .nav-link:hover {
                color: var(--color-accent) !important;
                transform: translateY(-1px);
              }
              .bell-btn:hover {
                background: rgba(255, 255, 255, 0.08) !important;
                border-color: rgba(99, 102, 241, 0.4) !important;
                transform: translateY(-1px);
              }
              .drawer-btn:hover {
                color: var(--color-text-primary) !important;
                opacity: 0.9;
              }
              .notif-card:hover {
                border-color: rgba(255, 255, 255, 0.15) !important;
                transform: translateX(-2px);
              }
              .delete-notif-btn:hover {
                color: var(--color-danger) !important;
              }
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
              .custom-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.05);
              }
            `}} />
          </header>
        );
      };

      export default Navbar;
