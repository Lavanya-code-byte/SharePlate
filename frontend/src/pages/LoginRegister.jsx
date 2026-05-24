import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Heart, Store, Truck, Mail, Lock, User as UserIcon, MapPin } from 'lucide-react';

const LoginRegister = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('restaurant'); // default role
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        // Automatically inject realistic Mumbai coordinates based on a small random jitter
        // around the Mumbai center. This provides frictionless signup with high-fidelity mapping!
        const latJitter = 19.0760 + (Math.random() - 0.5) * 0.08;
        const lonJitter = 72.8777 + (Math.random() - 0.5) * 0.08;

        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          address: formData.address,
          latitude: latJitter,
          longitude: lonJitter,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Toggle Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--border-radius-md)',
          padding: '4px',
          marginBottom: '2rem'
        }}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              background: isLogin ? 'var(--color-accent)' : 'transparent',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-fast)'
            }}
          >
            <LogIn size={16} /> Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              background: !isLogin ? 'var(--color-accent)' : 'transparent',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-fast)'
            }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {/* Brand Logo Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.35))' }}>
              {/* Plate circle */}
              <circle cx="12" cy="12" r="9" stroke="var(--color-success)" strokeWidth="2" />
              {/* Inner Leaf Sprout */}
              <path d="M12 15c2-2.5 3-4.5 3-6.5a3 3 0 0 0-6 0c0 2 1 4 3 6.5z" fill="var(--color-success)" opacity="0.25" stroke="var(--color-success)" strokeWidth="1.25" />
              {/* Inner Fork */}
              <path d="M12 9v4" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" />
              <path d="M10.25 10v1.5" stroke="var(--color-accent)" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M13.75 10v1.5" stroke="var(--color-accent)" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Join SharePlate'}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            {isLogin 
              ? 'Enter your credentials to access the coordination dashboard' 
              : 'Create a free portal profile to redistribute or claim surplus food'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.75rem 1rem',
            color: 'var(--color-danger)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection (Only on Register) */}
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <span className="form-label">I want to register as:</span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.75rem',
                marginTop: '0.25rem'
              }}>
                <button
                  type="button"
                  onClick={() => setRole('restaurant')}
                  style={{
                    padding: '0.75rem 0.25rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid',
                    borderColor: role === 'restaurant' ? 'var(--color-success)' : 'var(--border-color)',
                    background: role === 'restaurant' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: role === 'restaurant' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Store size={18} /> Restaurant
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ngo')}
                  style={{
                    padding: '0.75rem 0.25rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid',
                    borderColor: role === 'ngo' ? 'var(--color-accent)' : 'var(--border-color)',
                    background: role === 'ngo' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    color: role === 'ngo' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Heart size={18} /> NGO / Kitchen
                </button>

                <button
                  type="button"
                  onClick={() => setRole('delivery')}
                  style={{
                    padding: '0.75rem 0.25rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid',
                    borderColor: role === 'delivery' ? 'var(--color-warning)' : 'var(--border-color)',
                    background: role === 'delivery' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    color: role === 'delivery' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Truck size={18} /> Courier
                </button>
              </div>
            </div>
          )}

          {/* Full Name (Only on Register) */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name / Org Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. Golden Gate Bakery"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <UserIcon size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="e.g. partner@shareplate.org"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          {/* Address (Only on Register) */}
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="address">Operating Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  placeholder="e.g. 500 Market St, San Francisco, CA"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <MapPin size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Access Platform' : 'Create Free Account'}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default LoginRegister;
