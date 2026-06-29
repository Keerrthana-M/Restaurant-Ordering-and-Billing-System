import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        if (!scanned) {
          setScanned(true);
          scanner.clear();
          alert(`QR Scanned: ${decodedText}`);
          navigate('/menu');
        }
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#13151f',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
        <h3 style={{ color: '#ffc107', fontWeight: 800, marginBottom: 8 }}>
          Scan QR Code
        </h3>
        <p style={{ color: '#8892b0', fontSize: '0.85rem', marginBottom: 24 }}>
          Point your camera at the QR code on your table
        </p>

        <div id="qr-reader" style={{ width: '100%' }}></div>

        {error && (
          <p style={{ color: '#ff4757', fontSize: '0.8rem', marginTop: 12 }}>
            {error}
          </p>
        )}

        <button
          onClick={() => navigate('/restaurants')}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '10px 20px',
            color: '#8892b0',
            cursor: 'pointer',
            marginTop: 20,
            fontSize: '0.85rem'
          }}
        >
          ← Back to Restaurants
        </button>
      </div>
    </div>
  );
};

export default QRScanner;