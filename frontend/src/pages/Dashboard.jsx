import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MapContainer from '../components/MapContainer';
import { 
  Plus, ClipboardList, ShieldAlert, Sparkles, Scale, Clock, Heart, 
  MapPin, AlertCircle, CheckCircle, PackageOpen, Play, Check, Trash2, Truck
} from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  
  // Great-Circle Haversine Distance Formula (Recruiter Feature)
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Earth's Radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // States
  const [foodListings, setFoodListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [unassignedDeliveries, setUnassignedDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [foodFilter, setFoodFilter] = useState('All');
  
  const [form, setForm] = useState({
    itemName: '',
    description: '',
    quantity: 5,
    foodType: 'Veg',
    expiryHours: 4,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Fetch initial data based on role
  const fetchData = async () => {
    try {
      // 1. Fetch available food listings (for NGOs and Map display)
      const resAvailable = await fetch('/api/food', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAvailable.ok) {
        const data = await resAvailable.json();
        setFoodListings(data);
      }

      // 2. Role-specific fetches
      if (user.role === 'restaurant') {
        const resMy = await fetch('/api/food/my-listings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resMy.ok) {
          const data = await resMy.json();
          setMyListings(data);
        }
      } else if (user.role === 'delivery') {
        const resUnassigned = await fetch('/api/delivery/unassigned', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resUnassigned.ok) {
          const data = await resUnassigned.json();
          setUnassignedDeliveries(data);
        }
      }

      // 3. Fetch active delivery (for tracking on map!)
      const resActive = await fetch('/api/delivery/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resActive.ok) {
        const data = await resActive.json();
        // Set the first active delivery if found
        setActiveDelivery(data.length > 0 ? data[0] : null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up a polling interval (every 4 seconds) to refresh data and track real-time moving markers!
    // This connects our frontend to the server's simulated delivery movements.
    const pollInterval = setInterval(() => {
      fetchData();
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [user, token]);

  // Form handlers
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ text: '', type: '' });

    try {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(form.expiryHours));

      const res = await fetch('/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName: form.itemName,
          description: form.description,
          quantity: parseFloat(form.quantity),
          foodType: form.foodType,
          expiryTime: expiryDate,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({ text: 'Surplus food listing uploaded successfully!', type: 'success' });
        setForm({
          itemName: '',
          description: '',
          quantity: 5,
          foodType: 'Veg',
          expiryHours: 4,
        });
        fetchData();
      } else {
        setMsg({ text: data.message || 'Failed to upload listing', type: 'danger' });
      }
    } catch (error) {
      setMsg({ text: 'Network error. Could not upload.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  // Claim a listing (NGO action)
  const handleClaimListing = async (listingId) => {
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/food/${listingId}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setMsg({ text: 'Listing claimed! A delivery task has been auto-dispatched.', type: 'success' });
        fetchData();
      } else {
        setMsg({ text: data.message || 'Could not claim food.', type: 'danger' });
      }
    } catch (error) {
      console.error(error);
      setMsg({ text: 'Network error.', type: 'danger' });
    }
  };

  // Delete a listing (Restaurant action)
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this surplus listing?')) return;
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/food/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setMsg({ text: 'Listing deleted successfully!', type: 'success' });
        fetchData();
      } else {
        setMsg({ text: data.message || 'Could not delete listing.', type: 'danger' });
      }
    } catch (error) {
      console.error(error);
      setMsg({ text: 'Network error.', type: 'danger' });
    }
  };

  // Accept a delivery (Delivery Partner action)
  const handleAcceptDelivery = async (deliveryId) => {
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/delivery/${deliveryId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setMsg({ text: 'Delivery accepted! Get ready to transport the food.', type: 'success' });
        fetchData();
      } else {
        setMsg({ text: data.message || 'Failed to accept delivery', type: 'danger' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Start Transit (Delivery Partner action)
  const handleStartTransit = async (deliveryId) => {
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/delivery/${deliveryId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setMsg({ text: 'Transit started! Watch the simulator trace coordinates on the map.', type: 'success' });
        fetchData();
      } else {
        setMsg({ text: data.message || 'Error starting transit', type: 'danger' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // RENDER DYNAMIC DASHBOARDS
  
  // 1. Restaurant Render
  const renderRestaurant = () => {
    const totalQty = myListings.reduce((sum, item) => sum + (item.status === 'Delivered' ? item.quantity : 0), 0);
    const pendingCount = myListings.filter(item => item.status === 'Available').length;
    const claimedCount = myListings.filter(item => item.status === 'Claimed').length;

    return (
      <div>
        {/* Stats */}
        <div className="stat-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon icon-purple"><Scale size={24} /></div>
            <div>
              <div className="stat-value">{totalQty.toFixed(1)} kg</div>
              <div className="stat-label">Food Saved (Delivered)</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-green"><PackageOpen size={24} /></div>
            <div>
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Active Listings</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-amber"><Clock size={24} /></div>
            <div>
              <div className="stat-value">{claimedCount}</div>
              <div className="stat-label">Claimed (Awaiting Courier)</div>
            </div>
          </div>
        </div>

        {/* Double Column Grid */}
        <div className="dashboard-grid">
          {/* Column 1: Upload Form */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Plus size={22} color="var(--color-success)" />
              <h2>Upload Surplus Food</h2>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="itemName">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  required
                  placeholder="e.g. Vegetarian Fried Rice & Stirfry"
                  value={form.itemName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Detailed Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  placeholder="Include storage status, refrigeration requirements, and container details..."
                  value={form.description}
                  onChange={handleInputChange}
                  className="form-control"
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="quantity">Quantity (in Kilograms)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="range"
                      id="quantity"
                      name="quantity"
                      min="1"
                      max="30"
                      step="0.5"
                      value={form.quantity}
                      onChange={handleInputChange}
                      style={{ flex: 1, accentColor: 'var(--color-success)' }}
                    />
                    <strong style={{ fontSize: '1.2rem', color: 'var(--color-success)', width: '60px', textAlign: 'right' }}>
                      {form.quantity} kg
                    </strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="foodType">Food Category</label>
                  <select
                    id="foodType"
                    name="foodType"
                    value={form.foodType}
                    onChange={handleInputChange}
                    className="form-control"
                    style={{ background: 'rgba(15, 23, 42, 0.9)' }}
                  >
                    <option value="Veg">Veg (Vegetarian)</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Vegan">Vegan (Plant-based)</option>
                    <option value="Other">Other / Bread / Pastry</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expiryHours">Expires In (Hours from now)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    id="expiryHours"
                    name="expiryHours"
                    min="1"
                    max="12"
                    value={form.expiryHours}
                    onChange={handleInputChange}
                    style={{ flex: 1, accentColor: 'var(--color-accent)' }}
                  />
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-accent)', width: '60px', textAlign: 'right' }}>
                    {form.expiryHours} hrs
                  </strong>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-success" 
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginTop: '1rem' }}
              >
                {submitting ? 'Posting listing...' : 'Upload Surplus Food'}
              </button>
            </form>
          </div>

          {/* Column 2: Listings Tracker */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <ClipboardList size={22} color="var(--color-accent)" />
              <h2>Uploads History</h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', paddingRight: '0.25rem' }}>
              {myListings.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '4rem' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem auto' }} />
                  <p>You have not uploaded any surplus items yet.</p>
                </div>
              ) : (
                myListings.map(item => (
                  <div 
                    key={item._id} 
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1rem', flex: 1, paddingRight: '0.5rem' }}>{item.itemName}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge badge-${item.status.toLowerCase() === 'available' ? 'restaurant' : item.status.toLowerCase() === 'claimed' ? 'delivery' : 'tag'}`}>
                          {item.status}
                        </span>
                        {item.status === 'Available' && (
                          <button 
                            onClick={() => handleDeleteListing(item._id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: 'var(--color-danger)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.35rem',
                              borderRadius: '6px',
                              transition: '0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'var(--color-danger)';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = 'var(--color-danger)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Delete Listing"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{item.description}</p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.8rem', 
                      color: 'var(--color-text-muted)',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '0.5rem',
                      marginTop: '0.25rem'
                    }}>
                      <span>Qty: <strong>{item.quantity} kg</strong></span>
                      <span>Type: <strong>{item.foodType}</strong></span>
                    </div>
                    {item.claimedBy && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--color-success)', 
                        background: 'rgba(16, 185, 129, 0.08)',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <CheckCircle size={12} /> Claimed by {item.claimedBy.name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real-time Delivery Tracker under the main block if an active listing is In Transit */}
        {activeDelivery && (
          <div style={{ marginTop: '2.5rem' }}>
            <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', padding: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>
                  Active Delivery in Progress 🚚
                </h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                  A delivery courier is moving surplus <strong>{activeDelivery.foodListing?.itemName}</strong> to <strong>{activeDelivery.ngo?.name}</strong>.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div>Courier: <strong>{activeDelivery.deliveryPartner?.name || 'Searching for courier...'}</strong></div>
                  <div>Dest Kitchen: <strong>{activeDelivery.ngo?.address}</strong></div>
                  <div>Simulated Route Progress: 
                    <strong style={{ color: 'var(--color-warning)', marginLeft: '0.5rem' }}>
                      {Math.round((activeDelivery.routeStepIndex / (activeDelivery.route?.length - 1)) * 100)}% Complete
                    </strong>
                  </div>
                </div>
              </div>
              
              <MapContainer activeDelivery={activeDelivery} />
            </div>
          </div>
        )}
      </div>
    );
  };

  // 2. NGO Render
  const renderNGO = () => {
    return (
      <div>
        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-purple"><Heart size={24} /></div>
            <div>
              <div className="stat-value">{foodListings.length}</div>
              <div className="stat-label">Food Listings Available</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-green"><Scale size={24} /></div>
            <div>
              <div className="stat-value">{activeDelivery ? 1 : 0}</div>
              <div className="stat-label">Active Transits</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-amber"><MapPin size={24} /></div>
            <div>
              <div className="stat-value">Mumbai Hub</div>
              <div className="stat-label">Target Safe Redistribution Zone</div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Map Viewer */}
          <div>
            <MapContainer 
              foodListings={foodListings} 
              activeDelivery={activeDelivery} 
              onClaimListing={handleClaimListing}
              userRole="ngo"
            />
          </div>

          {/* Active claimed tracking or Available feed grid */}
          <div className="dashboard-grid">
            {/* Column 1: Available Listings Feed */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Available Surplus Feed</h2>
                
                {/* Veg vs Non-Veg Category Toggle Bar */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem'
                }}>
                  <button 
                    onClick={() => setFoodFilter('All')}
                    style={{
                      background: foodFilter === 'All' ? 'var(--color-accent)' : 'none',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    All Food
                  </button>
                  <button 
                    onClick={() => setFoodFilter('Veg')}
                    style={{
                      background: foodFilter === 'Veg' ? 'var(--color-success)' : 'none',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: foodFilter === 'Veg' ? 'white' : 'var(--color-success)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    🟢 Pure Veg / Vegan
                  </button>
                  <button 
                    onClick={() => setFoodFilter('Non-Veg')}
                    style={{
                      background: foodFilter === 'Non-Veg' ? 'var(--color-danger)' : 'none',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: foodFilter === 'Non-Veg' ? 'white' : 'var(--color-danger)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    🔴 Non-Veg Only
                  </button>
                </div>
              </div>
              
              {foodListings.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem 1rem' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem auto' }} />
                  <p>All surplus food listings have been claimed. Check back shortly!</p>
                </div>
              ) : foodListings.filter(item => {
                if (foodFilter === 'All') return true;
                if (foodFilter === 'Veg') return item.foodType === 'Veg' || item.foodType === 'Vegan';
                if (foodFilter === 'Non-Veg') return item.foodType === 'Non-Veg';
                return true;
              }).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem 1rem' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem auto' }} />
                  <p>No listings match the selected category ({foodFilter === 'Veg' ? 'Vegetarian' : 'Non-Vegetarian'}).</p>
                </div>
              ) : (
                <div className="food-feed">
                  {foodListings.filter(item => {
                    if (foodFilter === 'All') return true;
                    if (foodFilter === 'Veg') return item.foodType === 'Veg' || item.foodType === 'Vegan';
                    if (foodFilter === 'Non-Veg') return item.foodType === 'Non-Veg';
                    return true;
                  }).map(item => {
                    const isVeg = item.foodType === 'Veg' || item.foodType === 'Vegan';
                    const isNonVeg = item.foodType === 'Non-Veg';
                    
                    // Distinct theme color styling
                    const themeColor = isVeg ? 'var(--color-success)' : isNonVeg ? 'var(--color-danger)' : 'var(--color-warning)';
                    const cardBg = isVeg ? 'rgba(16, 185, 129, 0.02)' : isNonVeg ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255, 255, 255, 0.02)';
                    const borderTheme = isVeg ? 'rgba(16, 185, 129, 0.15)' : isNonVeg ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-color)';
                    
                    return (
                      <div 
                        key={item._id} 
                        className="glass-card food-card" 
                        style={{ 
                          background: cardBg,
                          borderColor: borderTheme,
                          borderLeft: `4px solid ${themeColor}`,
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <div className="food-card-header">
                          <h4 style={{ fontSize: '1.05rem' }}>{item.itemName}</h4>
                          <span 
                            className="badge" 
                            style={{
                              background: isVeg ? 'rgba(16, 185, 129, 0.15)' : isNonVeg ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: themeColor,
                              border: `1px solid ${isVeg ? 'rgba(16, 185, 129, 0.3)' : isNonVeg ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                            }}
                          >
                            {isVeg ? '🟢 ' : isNonVeg ? '🔴 ' : '🔸 '}{item.foodType}
                          </span>
                        </div>
                        
                        <div className="food-card-body">
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                            {item.description}
                          </p>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ margin: '2px 0' }}>Restaurant: <strong>{item.restaurant?.name}</strong></div>
                            <div style={{ margin: '2px 0' }}>Address: <strong>{item.restaurant?.address}</strong></div>
                          </div>
                        </div>

                        <div className="food-card-footer" style={{ borderTop: `1px solid ${borderTheme}` }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: themeColor }}>
                            {item.quantity} kg
                          </span>
                          <button 
                            onClick={() => handleClaimListing(item._id)}
                            className="btn" 
                            style={{ 
                              padding: '0.45rem 1rem', 
                              fontSize: '0.8rem',
                              background: isVeg ? 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)' : isNonVeg ? 'linear-gradient(135deg, var(--color-danger) 0%, #dc2626 100%)' : 'linear-gradient(135deg, var(--color-accent) 0%, #4f46e5 100%)',
                              color: 'white',
                              boxShadow: 'none'
                            }}
                          >
                            Claim Food
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2: Active Claim Tracking Panel */}
            <div className="glass-card" style={{ height: 'fit-content' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>Active Tracking Drawer</h2>
              
              {activeDelivery ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '1rem'
                  }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
                      {activeDelivery.foodListing?.itemName}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      Quantity: <strong>{activeDelivery.foodListing?.quantity} kg</strong>
                    </p>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>Source: <strong>{activeDelivery.restaurant?.name}</strong></div>
                    <div>Status: 
                      <strong style={{ 
                        marginLeft: '0.25rem', 
                        color: activeDelivery.status === 'In Transit' ? 'var(--color-warning)' : 'var(--color-success)' 
                      }}>
                        {activeDelivery.status}
                      </strong>
                    </div>
                    <div>Courier: <strong>{activeDelivery.deliveryPartner?.name || 'Awaiting assignment...'}</strong></div>
                  </div>

                  {activeDelivery.status === 'In Transit' && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                        <span>Transit progress:</span>
                        <span>{Math.round((activeDelivery.routeStepIndex / (activeDelivery.route?.length - 1)) * 100)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${(activeDelivery.routeStepIndex / (activeDelivery.route?.length - 1)) * 100}%`,
                          background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-warning) 100%)',
                          transition: 'width 0.5s ease-in-out'
                        }}></div>
                      </div>
                      <small style={{ color: 'var(--color-warning)', display: 'block', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        * Driving simulator path updates coordinates automatically.
                      </small>
                    </div>
                  )}

                  {/* Recruiter Advanced Feature: Algorithmic Haversine Logistics Dispatch Engine */}
                  {(() => {
                    const dist = calculateHaversineDistance(
                      activeDelivery.restaurant?.latitude,
                      activeDelivery.restaurant?.longitude,
                      activeDelivery.ngo?.latitude,
                      activeDelivery.ngo?.longitude
                    );
                    const eta = Math.round((dist / 18) * 60) + 4; // 18 km/h avg speed + 4m buffer
                    return (
                      <div style={{
                        marginTop: '1.25rem',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                          <Sparkles size={14} />
                          <span>BKC-LOGISTICS DISPATCH ENGINE (Haversine)</span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Spherical Distance</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--color-success)' }}>{dist.toFixed(2)} km</strong>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Est. Transit Time</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>{eta} mins</strong>
                          </div>
                        </div>

                        {/* Collapsible formula details */}
                        <details style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem'
                        }}>
                          <summary style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, outline: 'none' }}>
                            View Haversine Calculus Proof
                          </summary>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#34d399', fontFamily: 'monospace', lineHeight: 1.4 }}>
                            <div>d = 2R · asin(√(sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)))</div>
                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '0.35rem 0', paddingTop: '0.35rem' }}>
                              R = 6371 km (Earth Radius)<br />
                              lat1 = {activeDelivery.restaurant?.latitude?.toFixed(4)}° | lon1 = {activeDelivery.restaurant?.longitude?.toFixed(4)}°<br />
                              lat2 = {activeDelivery.ngo?.latitude?.toFixed(4)}° | lon2 = {activeDelivery.ngo?.longitude?.toFixed(4)}°<br />
                              dlat = {((activeDelivery.ngo?.latitude - activeDelivery.restaurant?.latitude) * Math.PI / 180).toFixed(5)} rad<br />
                              dlon = {((activeDelivery.ngo?.longitude - activeDelivery.restaurant?.longitude) * Math.PI / 180).toFixed(5)} rad
                            </div>
                            <div style={{ color: '#fbbf24' }}>
                              RESULTING GREAT-CIRCLE PATH SPAN: {dist.toFixed(4)} km
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
                  <PackageOpen size={32} style={{ margin: '0 auto 1rem auto' }} />
                  <p>No active delivery coordinates mapped. Claim food from the feed to launch coordinates tracking.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Delivery Partner Render
  const renderDelivery = () => {
    return (
      <div>
        {/* Stats */}
        <div className="stat-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon icon-purple"><Truck size={24} /></div>
            <div>
              <div className="stat-value">{unassignedDeliveries.length}</div>
              <div className="stat-label">Tasks Awaiting Courier</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-green"><Scale size={24} /></div>
            <div>
              <div className="stat-value">{activeDelivery ? 1 : 0}</div>
              <div className="stat-label">My Active Tasks</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon icon-amber"><CheckCircle size={24} /></div>
            <div>
              <div className="stat-value">SF Zone</div>
              <div className="stat-label">Operational Network</div>
            </div>
          </div>
        </div>

        {/* Core Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Active delivery focus */}
          {activeDelivery ? (
            <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              <div>
                <span className="badge badge-delivery" style={{ marginBottom: '0.5rem' }}>My Active Delivery Job</span>
                <h2 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>
                  Active Transit: {activeDelivery.foodListing?.itemName}
                </h2>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.95rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem'
                }}>
                  <div>Food Source (Restaurant): <strong>{activeDelivery.restaurant?.name} ({activeDelivery.restaurant?.address})</strong></div>
                  <div>Destination Kitchen (NGO): <strong>{activeDelivery.ngo?.name} ({activeDelivery.ngo?.address})</strong></div>
                  <div>Load weight: <strong>{activeDelivery.foodListing?.quantity} kg</strong></div>
                  <div>Status: <strong style={{ color: 'var(--color-warning)' }}>{activeDelivery.status}</strong></div>
                </div>

                {activeDelivery.status === 'Assigned' && (
                  <button 
                    onClick={() => handleStartTransit(activeDelivery._id)}
                    className="btn btn-primary" 
                    style={{ gap: '0.5rem', width: '100%', padding: '0.8rem' }}
                  >
                    <Play size={16} /> Start Simulated Transit Route
                  </button>
                )}

                {activeDelivery.status === 'In Transit' && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: 'var(--color-success)',
                    fontSize: '0.85rem'
                  }}>
                    <strong>GPS Active:</strong> The courier is progressing along the route map coordinates. 
                    Tracking will auto-complete to <strong>Delivered</strong> once index reaches 100%. 
                    Current Step: {activeDelivery.routeStepIndex} / {activeDelivery.route?.length - 1} ({Math.round((activeDelivery.routeStepIndex / (activeDelivery.route?.length - 1)) * 100)}%)
                  </div>
                )}

                {/* Recruiter Advanced Feature: Algorithmic Haversine Logistics Dispatch Engine */}
                {(() => {
                  const dist = calculateHaversineDistance(
                    activeDelivery.restaurant?.latitude,
                    activeDelivery.restaurant?.longitude,
                    activeDelivery.ngo?.latitude,
                    activeDelivery.ngo?.longitude
                  );
                  const eta = Math.round((dist / 18) * 60) + 4; // 18 km/h avg speed + 4m buffer
                  return (
                    <div style={{
                      marginTop: '1.25rem',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                        <Sparkles size={14} />
                        <span>BKC-LOGISTICS DISPATCH ENGINE (Haversine)</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Spherical Distance</span>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--color-success)' }}>{dist.toFixed(2)} km</strong>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Est. Transit Time</span>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>{eta} mins</strong>
                        </div>
                      </div>

                      {/* Collapsible formula details */}
                      <details style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem'
                      }}>
                        <summary style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, outline: 'none' }}>
                          View Haversine Calculus Proof
                        </summary>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#34d399', fontFamily: 'monospace', lineHeight: 1.4 }}>
                          <div>d = 2R · asin(√(sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)))</div>
                          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '0.35rem 0', paddingTop: '0.35rem' }}>
                            R = 6371 km (Earth Radius)<br />
                            lat1 = {activeDelivery.restaurant?.latitude?.toFixed(4)}° | lon1 = {activeDelivery.restaurant?.longitude?.toFixed(4)}°<br />
                            lat2 = {activeDelivery.ngo?.latitude?.toFixed(4)}° | lon2 = {activeDelivery.ngo?.longitude?.toFixed(4)}°<br />
                            dlat = {((activeDelivery.ngo?.latitude - activeDelivery.restaurant?.latitude) * Math.PI / 180).toFixed(5)} rad<br />
                            dlon = {((activeDelivery.ngo?.longitude - activeDelivery.restaurant?.longitude) * Math.PI / 180).toFixed(5)} rad
                          </div>
                          <div style={{ color: '#fbbf24' }}>
                            RESULTING GREAT-CIRCLE PATH SPAN: {dist.toFixed(4)} km
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })()}
              </div>

              {/* focused tracker map */}
              <MapContainer activeDelivery={activeDelivery} />
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <PackageOpen size={36} style={{ margin: '0 auto 1rem auto', color: 'var(--color-text-muted)' }} />
              <h3>No Active Job Assigned</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Accept an open redistribution task from the listings feed below to get started.
              </p>
            </div>
          )}

          {/* Available Jobs list */}
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem' }}>Available Redistribution Tasks</h2>
            
            {unassignedDeliveries.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 1rem' }}>
                <Check size={32} style={{ margin: '0 auto 1rem auto', color: 'var(--color-success)' }} />
                <p>All redistribution tasks have been successfully claimed. Great work!</p>
              </div>
            ) : (
              <div className="food-feed">
                {unassignedDeliveries.map(job => (
                  <div key={job._id} className="glass-card food-card" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                    <div className="food-card-header">
                      <h4 style={{ fontSize: '1.05rem' }}>{job.foodListing?.itemName}</h4>
                      <span className="badge badge-tag">{job.foodListing?.foodType}</span>
                    </div>

                    <div className="food-card-body" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      <div style={{ margin: '4px 0' }}>Pickup: <strong>{job.restaurant?.name}</strong></div>
                      <div style={{ margin: '2px 0', color: 'var(--color-text-muted)' }}>From: {job.restaurant?.address}</div>
                      <div style={{ margin: '4px 0', borderTop: '1px solid var(--border-color)', paddingTop: '4px' }}>
                        Deliver to: <strong>{job.ngo?.name}</strong>
                      </div>
                      <div style={{ margin: '2px 0', color: 'var(--color-text-muted)' }}>To: {job.ngo?.address}</div>
                    </div>

                    <div className="food-card-footer">
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-warning)' }}>
                        {job.foodListing?.quantity} kg
                      </span>
                      <button 
                        onClick={() => handleAcceptDelivery(job._id)}
                        className="btn btn-primary" 
                        style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                      >
                        Accept Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      {/* Alert Messages Banner */}
      {msg.text && (
        <div style={{
          background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: msg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '0.75rem 1.25rem',
          color: msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          fontWeight: 600,
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.95rem'
        }}>
          <Sparkles size={16} />
          {msg.text}
        </div>
      )}

      {/* Header Info */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="var(--color-success)" strokeWidth="2" />
            <path d="M12 15c2-2.5 3-4.5 3-6.5a3 3 0 0 0-6 0c0 2 1 4 3 6.5z" fill="var(--color-success)" opacity="0.25" stroke="var(--color-success)" strokeWidth="1.25" />
            <path d="M12 9v4" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M10.25 10v1.5" stroke="var(--color-accent)" strokeWidth="1.25" strokeLinecap="round" />
            <path d="M13.75 10v1.5" stroke="var(--color-accent)" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '2.3rem', margin: 0 }} className="gradient-text">
            Portal Control Hub
          </h1>
          <p className="text-muted" style={{ margin: 0, marginTop: '2px' }}>
            Operational Center for <strong>{user.name}</strong> • Role: <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </p>
        </div>
      </div>

      {/* Renders role-specific modules */}
      {user.role === 'restaurant' && renderRestaurant()}
      {user.role === 'ngo' && renderNGO()}
      {user.role === 'delivery' && renderDelivery()}
    </div>
  );
};

export default Dashboard;
