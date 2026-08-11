import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const listVariants = {
  gizli: {},
  gorunur: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  gizli: { opacity: 0, y: 20 },
  gorunur: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const EgitimDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videolar, setVideolar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Video?courseId=${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setVideolar(data);
        setYukleniyor(false);
      })
      .catch(error => {
        console.error("Videolar çekilirken hata oluştu:", error);
        setYukleniyor(false);
      });
  }, [id]);

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-ink text-parchment flex items-center justify-center">
        <p className="font-body text-slate-soft">Videolar yükleniyor...</p>
      </div>
    );
  }

  const toplamVideoSayisi = videolar.length;
  const acikVideoSayisi = videolar.filter(video => video.kilidiAcikMi).length;
  const ilerlemeYuzdesi = toplamVideoSayisi > 0
    ? Math.round((acikVideoSayisi / toplamVideoSayisi) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-ink text-parchment font-body px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-3xl font-medium mb-8">Eğitim Videoları</h2>

        {/* --- İMZA ÖĞE: Nota Portresi İlerleme Çubuğu --- */}
        {toplamVideoSayisi > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm text-slate-soft">İlerlemen</span>
              <span className="font-practice text-brass text-sm">
                %{ilerlemeYuzdesi} ({acikVideoSayisi}/{toplamVideoSayisi})
              </span>
            </div>

            <div className="relative h-14 w-full">
              {/* Soluk, sabit duran nota çizgileri (arkaplan) */}
              <svg
                className="absolute inset-0 w-full h-full text-slate-soft/20"
                viewBox="0 0 400 56"
                preserveAspectRatio="none"
              >
                {[8, 18, 28, 38, 48].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeWidth="1.5" />
                ))}
              </svg>

              {/* Pirinç renkli, ilerleme kadar görünen çizgiler */}
              <motion.svg
                className="absolute inset-0 w-full h-full text-brass"
                viewBox="0 0 400 56"
                preserveAspectRatio="none"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: `inset(0 ${100 - ilerlemeYuzdesi}% 0 0)` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {[8, 18, 28, 38, 48].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeWidth="1.5" />
                ))}
              </motion.svg>

              {/* İlerleyen "nota" noktası */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brass shadow-[0_0_10px_2px_rgba(79, 209, 197, 0.5)]"
                initial={{ left: '0%' }}
                animate={{ left: `${ilerlemeYuzdesi}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {toplamVideoSayisi === 0 && (
          <p className="text-slate-soft">Bu eğitime henüz video eklenmemiş.</p>
        )}

        {/* --- VİDEO KARTLARI --- */}
        <motion.div
          variants={listVariants}
          initial="gizli"
          animate="gorunur"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {videolar.map((video) => (
            <motion.div
              key={video.id}
              variants={cardVariants}
              className={`rounded-xl p-6 border-l-4 transition-colors duration-300 ${
                video.kilidiAcikMi
                  ? 'bg-panel border-brass'
                  : 'bg-panel/40 border-slate-soft/30 opacity-60'
              }`}
            >
              <h3 className="font-display text-lg font-medium mb-1">{video.baslik}</h3>
              <p className="font-practice text-xs text-slate-soft mb-5">
                Aşama: {video.videoSirasi}
              </p>

              {video.kilidiAcikMi ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/video/${video.id}`)}
                  className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2 rounded-lg transition-colors"
                >
                  Hemen İzle
                </motion.button>
              ) : (
                <button
                  disabled
                  className="w-full bg-transparent border border-slate-soft/30 text-slate-soft py-2 rounded-lg cursor-not-allowed text-sm"
                >
                  🔒 Önceki Videoyu Tamamlayın
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EgitimDetay;