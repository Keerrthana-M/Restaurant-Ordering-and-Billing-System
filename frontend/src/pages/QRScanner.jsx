import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const navigate = useNavigate();

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannedRef = useRef(false);         // ref avoids stale closure bug
  const [error, setError] = useState('');
  const [status, setStatus] = useState(''); // shows "Looking up restaurant…"
  const [uploading, setUploading] = useState(false);

  const lookupRestaurant = async (rawText) => {
    const token = (rawText || '').trim();
    if (!token) {
      setError('Empty QR code — could not read any data.');
      scannedRef.current = false;
      return;
    }

    setStatus('Looking up restaurant…');
    setError('');

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/restaurants/qr/${encodeURIComponent(token)}`
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `QR code not recognised (token: ${token})`);
      }

      const restaurant = await res.json();

      localStorage.setItem('selectedRestaurantId', restaurant.restaurant_id);
      setStatus('');
      navigate('/menu');

    } catch (err) {
      console.error('QR lookup error:', err);
      setError(err.message || 'This QR code is not recognised. Please try again.');
      setStatus('');
      scannedRef.current = false; // allow retry
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
          throw new Error('No camera found');
        }

        const camera =
          cameras.find(cam => cam.label.includes('HP Wide Vision')) ||
          cameras[0];

        const html5QrCode = new Html5Qrcode('qr-reader', {
          verbose: false
        });

        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          camera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            if (!isMounted || scannedRef.current) return; // ref-based guard (no stale closure)
            scannedRef.current = true;
            await lookupRestaurant(decodedText);
          },
          () => {
            // Ignore per-frame scan failures
          }
        );

      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(err.message || 'Unable to access camera. You can upload a QR image instead.');
        }
      }
    };

    const timer = setTimeout(startScanner, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);

      const scanner = html5QrCodeRef.current;
      if (scanner) {
        html5QrCodeRef.current = null;
        scanner.stop().catch(() => {});
        try { scanner.clear(); } catch (e) {}
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setStatus('');

    try {
      // Stop the live camera first
      const liveScanner = html5QrCodeRef.current;
      if (liveScanner) {
        html5QrCodeRef.current = null;
        await liveScanner.stop().catch(() => {});
        try { liveScanner.clear(); } catch (err) {}
      }

      const fileScanner = new Html5Qrcode('qr-reader', { verbose: false });
      const decodedText = await fileScanner.scanFile(file, false);

      try { fileScanner.clear(); } catch (err) {}

      scannedRef.current = true;
      await lookupRestaurant(decodedText);

    } catch (err) {
      console.error('File scan failed:', err);
      setError('Could not read a QR code from that image. Make sure it is the downloaded QR PNG and try again.');
      scannedRef.current = false;
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f1117',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#13151f',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>📷</div>

          <h3
            style={{
              color: '#ffc107',
              marginTop: 10,
              marginBottom: 8
            }}
          >
            Scan QR Code
          </h3>

          <p
            style={{
              color: '#8892b0',
              marginBottom: 25
            }}
          >
            Point your camera at the restaurant QR code
          </p>
        </div>

        <div
          id="qr-reader"
          style={{ width: '100%' }}
        ></div>

        {/* Status feedback */}
        {status && (
          <div
            style={{
              marginTop: 20,
              color: '#ffc107',
              textAlign: 'center',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                border: '2px solid #ffc107',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            {status}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 20,
              background: 'rgba(255,77,79,0.12)',
              border: '1px solid rgba(255,77,79,0.4)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ff4d4f',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#4a5568', fontSize: '0.75rem' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Upload option */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,193,7,0.3)',
            background: 'rgba(255,193,7,0.1)',
            color: '#ffc107',
            fontWeight: 600,
            cursor: uploading ? 'wait' : 'pointer'
          }}
        >
          {uploading ? 'Scanning image…' : '📁 Upload QR Image Instead'}
        </button>

        <button
          onClick={() => navigate('/restaurants')}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          ← Back to Restaurants
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default QRScanner;