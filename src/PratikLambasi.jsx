import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Kaç gün üst üste pratik yapıldığını gösteren, alevi büyüyen/parlaklaşan bir mum lambası.
// Renk paletindeki "akşam vakti pratik odası lambası" hikayesine doğrudan bağlanıyor.
const PratikLambasi = () => {
  const [seri, setSeri] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch('https://localhost:7264/api/Video/pratik-serisi', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setSeri(data.seriGunSayisi || 0);
        setYukleniyor(false);
      })
      .catch(() => setYukleniyor(false));
  }, []);

  if (yukleniyor) return null;

  // Alev boyutu ve parlaklığı seri gün sayısına göre büyüyor, üst sınırı var
  const alevOlcek = Math.min(1 + seri * 0.06, 1.8);
  const parlaklik = Math.min(0.35 + seri * 0.05, 1);

  return (
    <div className="bg-panel border border-white/5 rounded-xl p-5 flex items-center gap-4">
      <div className="relative w-10 h-14 flex items-end justify-center flex-shrink-0">
        {/* Mum gövdesi */}
        <div className="w-2.5 h-8 bg-parchment/15 rounded-sm" />
        {/* Alev */}
        <motion.div
          animate={{
            scale: [alevOlcek, alevOlcek * 1.08, alevOlcek],
            opacity: [parlaklik, parlaklik * 0.85, parlaklik]
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1 w-3 h-5 rounded-full bg-gradient-to-t from-brass to-brass-soft"
          style={{
            filter: seri > 0 ? `drop-shadow(0 0 ${6 + seri}px rgba(79,209,197,${parlaklik}))` : 'none',
            opacity: seri > 0 ? 1 : 0.3
          }}
        />
      </div>
      <div>
        <p className="font-display text-2xl text-brass">{seri}</p>
        <p className="font-practice text-[10px] tracking-[0.2em] uppercase text-slate-soft">
          Günlük Pratik Serisi
        </p>
      </div>
    </div>
  );
};

export default PratikLambasi;