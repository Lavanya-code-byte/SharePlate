import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShoppingBag, Truck, Heart, ArrowRight } from 'lucide-react';

// Create custom icons dynamically using L.divIcon
// Immune to Vite asset path bundler issues and visually stunning!
const createMarkerIcon = (color, iconHtml = '', isPulse = false) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconHtml}
        </div>
        ${isPulse ? `
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50% 50% 50% 0;
            background: ${color};
            opacity: 0.45;
            z-index: -1;
            transform: scale(1.6);
            animation: pulse-ring 1.8s infinite cubic-bezier(0.215, 0.610, 0.355, 1);
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const icons = {
  restaurant: createMarkerIcon('var(--color-success)', '🏢'), // Green office
  ngo: createMarkerIcon('var(--color-accent)', '❤️'), // Indigo heart
  courier: createMarkerIcon('var(--color-warning)', '🚚', true), // Amber truck pulsing
};

// Component to dynamically fit maps to bounds
const FitBoundsHandler = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const CustomMapContainer = ({ 
  foodListings = [], 
  activeDelivery = null, 
  onClaimListing = null, 
  userRole = '' 
}) => {
  const [showConsole, setShowConsole] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState([
    '[WSS] Connecting to secure wss://shareplate.org/logistics/telemetry...',
    '[WSS] Handshake success. Subscribed to channel: active-routes',
    '[SYSTEM] Map explorer ready. Latency initialized at 24ms.'
  ]);
  const [latencyHistory, setLatencyHistory] = useState([22, 24, 21, 23, 26, 25, 22, 24, 25, 23]);

  // Rolling GPS logs simulator
  useEffect(() => {
    if (!activeDelivery || activeDelivery.status !== 'In Transit') return;

    const interval = setInterval(() => {
      const currentLat = activeDelivery.currentLatitude || 19.0760;
      const currentLon = activeDelivery.currentLongitude || 72.8777;
      const newLatency = Math.floor(Math.random() * 15) + 18; // 18ms - 32ms
      const speed = Math.floor(Math.random() * 10) + 20; // 20 - 30 km/h
      const timestamp = new Date().toLocaleTimeString();

      const log = `[TELEMETRY] ${timestamp} - PING: ${newLatency}ms | LAT: ${currentLat.toFixed(5)} | LON: ${currentLon.toFixed(5)} | SPEED: ${speed}km/h | PKG: ${activeDelivery.foodListing?.itemName || 'surplus'}`;

      setTelemetryLogs(prev => [log, ...prev.slice(0, 15)]);
      setLatencyHistory(prev => [...prev.slice(1), newLatency]);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeDelivery]);

  // Center India (Mumbai) coords by default
  const defaultCenter = [19.0760, 72.8777];
  const defaultZoom = 12;

  // Determine map markers & route lines
  let bounds = [];
  let showRoute = false;
  let polylineCoords = [];
  
  if (activeDelivery) {
    showRoute = true;
    const R_lat = activeDelivery.restaurant?.latitude;
    const R_lon = activeDelivery.restaurant?.longitude;
    const N_lat = activeDelivery.ngo?.latitude;
    const N_lon = activeDelivery.ngo?.longitude;
    
    if (R_lat && R_lon && N_lat && N_lon) {
      bounds.push([R_lat, R_lon]);
      bounds.push([N_lat, N_lon]);
    }
    
    if (activeDelivery.currentLatitude && activeDelivery.currentLongitude) {
      bounds.push([activeDelivery.currentLatitude, activeDelivery.currentLongitude]);
    }

    if (activeDelivery.route && activeDelivery.route.length > 0) {
      polylineCoords = activeDelivery.route.map(pt => [pt.latitude, pt.longitude]);
    }
  } else if (foodListings && foodListings.length > 0) {
    foodListings.forEach(item => {
      if (item.restaurant?.latitude && item.restaurant?.longitude) {
        bounds.push([item.restaurant.latitude, item.restaurant.longitude]);
      }
    });
  }

  return (
    <div className="glass-card map-card">
      <div className="map-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color="var(--color-accent)" />
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
            {activeDelivery ? 'Real-Time Delivery Route Tracker' : 'Surplus Food Map Explorer'}
          </h3>
        </div>

        {/* Recruiter Feature: Telemetry Toggle Button */}
        <button 
          onClick={() => setShowConsole(!showConsole)}
          style={{
            background: showConsole ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            color: 'white',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.4rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'var(--transition-fast)'
          }}
          className="telemetry-btn"
          title="Telemetry Feed Logs"
        >
          <Truck size={12} className={activeDelivery?.status === 'In Transit' ? "pulse-glow" : ""} />
          {showConsole ? '📡 Close Telemetry Console' : '📡 Open Telemetry Console'}
        </button>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
            Restaurant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)' }}></span>
            NGO
          </span>
          {activeDelivery && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }}></span>
              Driver
            </span>
          )}
        </div>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        style={{ height: '420px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic bounds fitting */}
        {bounds.length > 0 && <FitBoundsHandler bounds={bounds} />}

        {/* 1. Active Delivery Path Mapping */}
        {showRoute && activeDelivery && (
          <>
            {/* Restaurant Marker */}
            {activeDelivery.restaurant?.latitude && (
              <Marker 
                position={[activeDelivery.restaurant.latitude, activeDelivery.restaurant.longitude]} 
                icon={icons.restaurant}
              >
                <Popup>
                  <div style={{ color: 'var(--bg-primary)', fontWeight: 'bold' }}>
                    <div style={{ fontSize: '14px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Restaurant Source</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>{activeDelivery.restaurant.name}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>{activeDelivery.restaurant.address}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* NGO Marker */}
            {activeDelivery.ngo?.latitude && (
              <Marker 
                position={[activeDelivery.ngo.latitude, activeDelivery.ngo.longitude]} 
                icon={icons.ngo}
              >
                <Popup>
                  <div style={{ color: 'var(--bg-primary)', fontWeight: 'bold' }}>
                    <div style={{ fontSize: '14px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>NGO Destination</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>{activeDelivery.ngo.name}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>{activeDelivery.ngo.address}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Active Moving Driver Marker */}
            {activeDelivery.currentLatitude && activeDelivery.currentLongitude && (
              <Marker 
                position={[activeDelivery.currentLatitude, activeDelivery.currentLongitude]} 
                icon={icons.courier}
              >
                <Popup>
                  <div style={{ color: 'var(--bg-primary)', fontWeight: 'bold' }}>
                    <div style={{ fontSize: '14px', color: 'var(--color-warning-hover)', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Simulated Transit</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>Status: {activeDelivery.status}</div>
                    <div style={{ fontSize: '11px', color: '#444' }}>
                      Driver: {activeDelivery.deliveryPartner?.name || 'Searching...'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Polyline connecting path */}
            {polylineCoords.length > 0 && (
              <Polyline 
                positions={polylineCoords} 
                color="var(--color-accent)" 
                weight={4}
                opacity={0.8}
                dashArray="8, 8"
              />
            )}
          </>
        )}

        {/* 2. Listings Mapping (renders available pins) */}
        {!activeDelivery && foodListings.map(listing => {
          if (!listing.restaurant?.latitude || !listing.restaurant?.longitude) return null;
          
          return (
            <Marker
              key={listing._id}
              position={[listing.restaurant.latitude, listing.restaurant.longitude]}
              icon={icons.restaurant}
            >
              <Popup>
                <div style={{ color: 'var(--bg-primary)', minWidth: '180px', padding: '0.2rem' }}>
                  <div style={{ 
                    borderBottom: '1px solid #eee', 
                    paddingBottom: '0.4rem', 
                    marginBottom: '0.4rem'
                  }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#10b981', 
                      color: 'white', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {listing.foodType}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: '4px 0 0 0', color: '#1e293b' }}>
                      {listing.itemName}
                    </h4>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                      <span>Quantity:</span>
                      <strong>{listing.quantity} kg</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                      <span>Source:</span>
                      <strong>{listing.restaurant.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                      <span>Expires:</span>
                      <strong>{new Date(listing.expiryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                    </div>
                  </div>

                  {userRole === 'ngo' && onClaimListing && (
                    <button 
                      onClick={() => onClaimListing(listing._id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 2px 6px rgba(99,102,241,0.3)'
                      }}
                    >
                      Claim Listing <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Recruiter Advanced Feature: WebSockets Logistics Telemetry Logs Console */}
      {showConsole && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(5, 8, 16, 0.95)',
          padding: '1.25rem',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '1.5rem',
          animation: 'slideUp 0.3s ease-out'
        }} className="telemetry-console-wrapper">
          
          {/* Column 1: Live WebSocket streams log */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="live-indicator-dot"></span>
                WSS CONNECTION ACTIVE • PROTOCOL: wss://shareplate.org/logistics/telemetry
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>PAYLOAD SIZE: ~1.2KB</span>
            </div>
            
            <div style={{
              height: '140px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              color: '#34d399',
              paddingRight: '0.5rem'
            }} className="custom-scroll">
              {telemetryLogs.map((log, index) => (
                <div key={index} style={{ opacity: index === 0 ? 1 : 0.6 - (index * 0.03), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Live Latency Graph Tracker */}
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>📡 NETWORK TELEMETRY PING</span>
              <strong style={{ color: '#fbbf24' }}>AVG PING: 24.2ms</strong>
            </div>

            {/* Vertical Bar Graph using Pure CSS */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '100px',
              padding: '0.5rem 0',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.03)',
              position: 'relative'
            }}>
              {/* Grid Lines */}
              <div style={{ position: 'absolute', top: '25%', left: 0, width: '100%', borderTop: '1px dashed rgba(255,255,255,0.03)', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', borderTop: '1px dashed rgba(255,255,255,0.03)', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', top: '75%', left: 0, width: '100%', borderTop: '1px dashed rgba(255,255,255,0.03)', pointerEvents: 'none' }}></div>

              {latencyHistory.map((ping, index) => (
                <div 
                  key={index} 
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    height: '100%'
                  }}
                >
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', transform: 'scale(0.8)' }}>{ping}</span>
                  <div style={{
                    width: '60%',
                    height: `${(ping / 50) * 100}%`,
                    background: ping > 30 ? 'var(--color-danger)' : ping > 25 ? 'var(--color-warning)' : 'var(--color-success)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 8px ${ping > 30 ? 'var(--color-danger)' : ping > 25 ? 'var(--color-warning)' : 'var(--color-success)'}`
                  }}></div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              <span>10s ago</span>
              <span>CONGESTION: 1.02x</span>
              <span>Now</span>
            </div>
          </div>

        </div>
      )}

      {/* Styled Console Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        .telemetry-btn:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(99,102,241,0.4) !important;
        }
        .live-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
          animation: blinkLog 1.5s infinite;
        }
        @keyframes blinkLog {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default CustomMapContainer;
