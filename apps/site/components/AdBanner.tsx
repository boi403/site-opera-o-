
import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner: React.FC = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense já inicializado
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '16px 0', background: 'transparent' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="autorelaxed"
        data-ad-client="ca-pub-2091933256294245"
        data-ad-slot="4386430855"
      />
    </div>
  );
};

export default AdBanner;
