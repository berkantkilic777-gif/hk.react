import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bildirimGoster } from './bildirimSistemi';
import Yukleniyor from './Yukleniyor';

const listVariants = {
  gizli: {},
  gorunur: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  gizli: { opacity: 0, y: 20 },
  gorunur: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function Rozetlerim() {
  const [rozetler, setRozetler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');
    fetch('https://localhost:7264/api/Basari', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setRozetler(data);
        setYukleniyor(false);
      })
      .catch(hata => {
        console.log('Rozetler çekilirken hata oluştu:', hata);
        setYukleniyor(false);
      });
  }, []);

  const sertifikaIndir = (courseId) => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Sertifika/indir/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Sertifika indirilemedi.');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sertifika.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(hata => {
        bildirimGoster(hata.message, 'hata');
      });
  };
  if (yukleniyor) {
    return <Yukleniyor mesaj="Rozetler yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-ink text-parchment font-body px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block mb-3">
          Başarı Duvarın
        </span>
        <h2 className="font-display text-3xl font-medium mb-10">Rozetlerim</h2>

        {rozetler.length === 0 && (
          <div className="bg-panel rounded-xl p-10 text-center">
            <p className="text-slate-soft">
              Henüz bir rozet kazanmadın. Bir eğitimin tüm videolarını tamamladığında burada görünecek.
            </p>
          </div>
        )}

        <motion.div
          variants={listVariants}
          initial="gizli"
          animate="gorunur"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rozetler.map((rozet) => (
            <motion.div
              key={rozet.kursId}
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: '#4FD1C5' }}
              className="bg-panel border border-transparent rounded-xl p-6 text-center transition-colors duration-300"
            >
             <div className="text-5xl mb-4">🏆</div>
              <h3 className="font-display text-lg font-medium mb-1">{rozet.kursAdi}</h3>
              <p className="font-practice text-xs text-slate-soft mb-4">
                {new Date(rozet.kazanilmaTarihi).toLocaleDateString('tr-TR')} tarihinde kazanıldı
              </p>
              <button
                onClick={() => sertifikaIndir(rozet.kursId)}
                className="text-xs font-semibold text-brass border border-brass/40 hover:border-brass hover:bg-brass/10 px-4 py-2 rounded-lg transition-colors"
              >
                Sertifikayı İndir
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Rozetlerim;