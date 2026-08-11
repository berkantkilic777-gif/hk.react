import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FloatingWhatsApp from './FloatingWhatsApp';
import OdemeModal from './OdemeModal';
import { useNavigate } from 'react-router-dom';
import { bildirimGoster } from './bildirimSistemi';

const listVariants = {
  gizli: {},
  gorunur: {
    transition: { staggerChildren: 0.12 }
  }
};

const cardVariants = {
  gizli: { opacity: 0, y: 24 },
  gorunur: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

function AnaSayfa() {
  const [egitimler, setEgitimler] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenKurs, setSecilenKurs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      const url = aramaMetni
        ? `https://localhost:7264/api/Courses?arama=${encodeURIComponent(aramaMetni)}`
        : "https://localhost:7264/api/Courses";

      fetch(url)
        .then(cevap => cevap.json())
        .then(veri => {
          setEgitimler(veri);
        })
        .catch(hata => console.log("Kurye yolda kaza yaptı:", hata));
    }, 400);

    return () => clearTimeout(zamanlayici);
  }, [aramaMetni]);

  const odemeBasarili = () => {
    setSecilenKurs(null);
    bildirimGoster("Ödeme başarılı, kurs hesabına eklendi!", 'basari');
    navigate('/egitimlerim');
  };

  return (
    <div className="relative min-h-screen bg-ink text-parchment font-body">

      {/* --- SAHNE ATMOSFERİ: sayfanın tamamına yayılan, kaydırma sırasında sabit kalan arka plan efekti --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMin slice">
          <defs>
            <radialGradient id="sahneSpot1" cx="18%" cy="0%" r="60%">
              <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sahneSpot2" cx="82%" cy="8%" r="55%">
              <stop offset="0%" stopColor="#7f77dd" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#7f77dd" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#sahneSpot1)" />
          <rect width="1200" height="800" fill="url(#sahneSpot2)" />
        </svg>

        {/* Yavaşça dönen plaklar, farklı köşelerde */}
        <motion.svg
          className="absolute top-20 left-8 w-20 h-20 opacity-[0.12]"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="50" cy="50" r="47" fill="none" stroke="#4FD1C5" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#4FD1C5" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="#4FD1C5" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="3" fill="#4FD1C5" />
        </motion.svg>
        <motion.svg
          className="absolute bottom-24 right-10 w-16 h-16 opacity-[0.10]"
          viewBox="0 0 100 100"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="50" cy="50" r="47" fill="none" stroke="#7f77dd" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#7f77dd" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="#7f77dd" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="3" fill="#7f77dd" />
        </motion.svg>

        {/* Yukarı doğru süzülen nota parçacıkları, tüm genişliğe yayılmış */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-brass/20 select-none"
            style={{ left: `${5 + i * 10}%`, fontSize: `${14 + (i % 4) * 8}px` }}
            initial={{ bottom: '-5%', opacity: 0 }}
            animate={{ bottom: '110%', opacity: [0, 0.5, 0] }}
            transition={{ duration: 14 + i * 1.3, repeat: Infinity, delay: i * 1.6, ease: 'linear' }}
          >
            {['♪', '♫', '♩', '♬'][i % 4]}
          </motion.span>
        ))}
      </div>

      {/* --- SAYFA İÇERİĞİ: atmosfer arka planının üstünde --- */}
      <div className="relative z-10">

      <section className="px-6 pt-8 max-w-6xl mx-auto">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none z-10"
            viewBox="0 0 24 24"
            fill="#4FD1C5"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Kurs ara..."
            className="w-full bg-panel border border-white/10 rounded-lg pl-12 pr-4 py-3 text-parchment placeholder-slate-soft focus:outline-none focus:border-brass transition-colors"
          />
        </div>
      </section>

      {/* --- HERO --- */}
      <section className="relative overflow-hidden px-6 pt-12 pb-16 text-center">
        <svg
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-40 opacity-10 pointer-events-none"
          viewBox="0 0 800 160"
          preserveAspectRatio="none"
        >
          {[20, 50, 80, 110, 140].map((y, i) => (
            <motion.line
              key={y}
              x1="0" y1={y} x2="800" y2={y}
              stroke="#4FD1C5"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: i * 0.12, ease: 'easeInOut' }}
            />
          ))}
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass">
            hk. Müzik Akademi
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-medium mt-4 mb-5 leading-tight">
            Enstrümanını, kendi stüdyonda<br className="hidden md:block" /> sırayla öğren.
          </h1>
          <p className="text-slate-soft max-w-xl mx-auto text-base md:text-lg">
            Her ders bir öncekinin üzerine kurulur. Kendi hızında ilerle,
            videoları tamamladıkça bir sonrakinin kilidini aç.
          </p>

          {/* --- ETKİLEŞİMLİ PİYANO TUŞLARI --- */}
          <div className="flex justify-center gap-[3px] mt-10 max-w-md mx-auto" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ y: 5, backgroundColor: 'rgba(79, 209, 197, 0.18)', borderColor: 'rgba(79, 209, 197, 0.5)' }}
                transition={{ duration: 0.15 }}
                className="w-6 h-16 bg-panel border border-white/10 rounded-b-md cursor-pointer"
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- KURS LİSTESİ --- */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        {egitimler.length === 0 && aramaMetni && (
          <p className="text-center text-slate-soft mb-6">
            "{aramaMetni}" için sonuç bulunamadı.
          </p>
        )}

        <motion.div
          variants={listVariants}
          initial="gizli"
          animate="gorunur"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {egitimler.map((kurs) => (
            <motion.div
              key={kurs.id}
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: '#4FD1C5' }}
              className="group relative bg-panel border border-transparent rounded-xl p-6 flex flex-col transition-colors duration-300"
            >
              {/* Enstrüman kutusu mandalları: hover'da köşeler hafifçe "açılıyor" */}
              <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-brass/0 group-hover:border-brass/70 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 pointer-events-none" />
              <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-brass/0 group-hover:border-brass/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 pointer-events-none" />
              <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-brass/0 group-hover:border-brass/70 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none" />
              <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-brass/0 group-hover:border-brass/70 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none" />

              <h3 className="font-display text-xl font-medium mb-2">{kurs.title}</h3>
              <p className="text-slate-soft text-sm flex-grow mb-6">{kurs.description}</p>

              <div className="flex items-center justify-between mt-auto">
                <span className="font-practice text-brass text-lg">{kurs.price} TL</span>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSecilenKurs(kurs)}
                  className="bg-brass text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brass-soft transition-colors"
                >
                  Satın Al
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {secilenKurs && (
        <OdemeModal
          kurs={secilenKurs}
          onKapat={() => setSecilenKurs(null)}
          onBasarili={odemeBasarili}
        />
      )}

      <FloatingWhatsApp />
      </div>
    </div>
  );
}

export default AnaSayfa;