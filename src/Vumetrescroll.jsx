import { useState, useEffect } from 'react';

const SEGMENT_SAYISI = 12;

// Sayfa kaydırma ilerlemesini standart bir çubuk yerine bir ses seviyesi metresi (VU-metre) gibi gösteriyor.
// Ekranın sağ kenarında, sadece geniş ekranlarda (masaüstü) görünüyor.
const VuMetreScroll = () => {
  const [yuzde, setYuzde] = useState(0);

  useEffect(() => {
    const kaydirildi = () => {
      const toplamYukseklik = document.documentElement.scrollHeight - window.innerHeight;
      const suankiKonum = window.scrollY;
      setYuzde(toplamYukseklik > 0 ? Math.min(100, (suankiKonum / toplamYukseklik) * 100) : 0);
    };

    window.addEventListener('scroll', kaydirildi, { passive: true });
    kaydirildi();
    return () => window.removeEventListener('scroll', kaydirildi);
  }, []);

  const doluSegmentSayisi = Math.round((yuzde / 100) * SEGMENT_SAYISI);

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-[40] hidden lg:flex flex-col-reverse gap-1 pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: SEGMENT_SAYISI }).map((_, i) => {
        const aktif = i < doluSegmentSayisi;
        // VU-metre mantığı: üst segmentler (en yoğun kaydırma) daha "kritik" camgöbeği tonunda, alt segmentler yeşil
        const renkSinifi = i >= SEGMENT_SAYISI - 3 ? 'bg-brass' : 'bg-practice';

        return (
          <div
            key={i}
            className={`w-1.5 h-3 rounded-sm transition-colors duration-150 ${aktif ? renkSinifi : 'bg-white/10'}`}
          />
        );
      })}
    </div>
  );
};

export default VuMetreScroll;