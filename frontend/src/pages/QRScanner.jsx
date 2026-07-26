import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const navigate = useNavigate();

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);
  const [uploading, setUploading] = useState(false);

  const lookupRestaurant = async (decodedText) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/restaurants/qr/${decodedText}`
      );

      if (!res.ok) {
        throw new Error('Unknown QR Code');
      }

      const restaurant = await res.json();

localStorage.setItem(
  "selectedRestaurantId",
  restaurant.restaurant_id
);

localStorage.setItem(
  "tableNumber",
  restaurant.table_number
);

navigate("/menu");
    } catch (err) {
      console.error(err);
      setError('This QR code is not recognized.');
      setScanned(false);
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
            fps: 5,
            qrbox: { width: 220, height: 220 }
          },
          async (decodedText) => {

            if (!isMounted || scanned) return;

            setScanned(true);
            await lookupRestaurant(decodedText);

          },
          () => {
            // Ignore scan failures while searching
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

        try {
          scanner.clear();
        } catch (e) {}

      }

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Stop the live camera first, since the same #qr-reader div
      // can't be used by camera and file scanning at the same time
      const liveScanner = html5QrCodeRef.current;
      if (liveScanner) {
        html5QrCodeRef.current = null;
        await liveScanner.stop().catch(() => {});
        try { liveScanner.clear(); } catch (err) {}
      }

      const fileScanner = new Html5Qrcode('qr-reader', { verbose: false });
      const decodedText = await fileScanner.scanFile(file, false);

      setScanned(true);
      await lookupRestaurant(decodedText);

      try { fileScanner.clear(); } catch (err) {}

    } catch (err) {
      console.error('File scan failed:', err);
      setError('Could not read a QR code from that image. Try a clearer image.');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file if needed
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
          style={{
            width: '100%'
          }}
        ></div>

        {error && (
          <div
            style={{
              marginTop: 20,
              color: '#ff4d4f',
              textAlign: 'center'
            }}
          >
            {error}
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
          {uploading ? 'Scanning image...' : '📁 Upload QR Image Instead'}
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
      </div>
    </div>
  );
};

export default QRScanner;