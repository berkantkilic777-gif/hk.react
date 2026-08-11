import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const listVariants = {
  gizli: {},
  gorunur: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  gizli: { opacity: 0, y: 20 },
  gorunur: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function Favorilerim() {
  const [favoriler, setFavoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch('https://localhost:7264/api/Favori', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFavoriler(data);
        setYukleniyor(false);
      })
      .catch(err => {
        console.log("Favoriler çekilemedi:", err);
        setYukleniyor(false);
      });
  }, []);

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-ink text-parchment flex items-center justify-center">
        <p className="font-body text-slate-soft">Favoriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-parchment font-body px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block mb-3">
          Favori Videolarım
        </span>
        <h2 className="font-display text-3xl font-medium mb-10">
          <span className="text-brass">[</span> Favorilerim <span className="text-brass">]</span>
        </h2>

        {favoriler.length === 0 ? (
          <div className="bg-panel rounded-xl p-10 text-center">
            <p className="text-slate-soft mb-5">
              Henüz favori bir video eklemedin. Video izlerken kalp ikonuna tıkla, buraya eklensin.
            </p>
            <button
              onClick={() => navigate('/egitimlerim')}
              className="bg-brass hover:bg-brass-soft text-ink font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Eğitimlerime Git
            </button>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="gizli"
            animate="gorunur"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriler.map((video) => (
              <motion.div
                key={video.id}
                variants={cardVariants}
                whileHover={{ y: -6, borderColor: '#4FD1C5' }}
                onClick={() => navigate(`/video/${video.id}`)}
                className="bg-panel border border-transparent rounded-xl p-6 cursor-pointer transition-colors duration-300"
              >
                <h3 className="font-display text-xl font-medium mb-2">{video.baslik}</h3>
                <p className="text-slate-soft text-sm">Aşama: {video.videoSirasi}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Favorilerim;