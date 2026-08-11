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

function Egitimlerim() {
  const [benimEgitimlerim, setBenimEgitimlerim] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [siralama, setSiralama] = useState("varsayilan"); // varsayilan | az | za
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("ogrenciYakaKarti");
    fetch("https://localhost:7264/api/Courses/egitimlerim", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((cevap) => cevap.json())
      .then((veri) => setBenimEgitimlerim(veri))
      .catch((hata) => console.log("Bir sorun çıktı:", hata));
  }, []);

  // Arama metnine göre filtreleme, sonra seçilen sıralamaya göre diziyoruz
  const gosterilecekEgitimler = benimEgitimlerim
    .filter((kurs) => kurs.title.toLowerCase().includes(aramaMetni.toLowerCase()))
    .sort((a, b) => {
      if (siralama === 'az') return a.title.localeCompare(b.title, 'tr');
      if (siralama === 'za') return b.title.localeCompare(a.title, 'tr');
      return 0; // varsayılan: backend'den geldiği sıra
    });

  return (
    <div className="min-h-screen bg-ink text-parchment font-body px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block mb-3">
          Pratik Programın
        </span>
        <h2 className="font-display text-3xl font-medium mb-10">Satın Aldığım Eğitimler</h2>

        {benimEgitimlerim.length === 0 && (
          <div className="bg-panel rounded-xl p-10 text-center">
            <p className="text-slate-soft mb-5">
              Henüz bir eğitim satın almadın. Ana sayfadan birini seç, pratik programın hemen başlasın.
            </p>
            <button
              onClick={() => navigate('/anasayfa')}
              className="bg-brass hover:bg-brass-soft text-ink font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Eğitimlere Göz At
            </button>
          </div>
        )}

        {/* --- ARAMA + SIRALAMA --- */}
        {benimEgitimlerim.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Eğitimlerim içinde ara..."
              className="flex-1 bg-panel border border-white/10 rounded-lg px-4 py-2.5 text-parchment placeholder-slate-soft focus:outline-none focus:border-brass transition-colors"
            />
            <select
              value={siralama}
              onChange={(e) => setSiralama(e.target.value)}
              className="bg-panel border border-white/10 rounded-lg px-4 py-2.5 text-parchment focus:outline-none focus:border-brass transition-colors cursor-pointer"
            >
              <option value="varsayilan">Varsayılan Sıralama</option>
              <option value="az">Alfabetik (A-Z)</option>
              <option value="za">Alfabetik (Z-A)</option>
            </select>
          </div>
        )}

        {benimEgitimlerim.length > 0 && gosterilecekEgitimler.length === 0 && (
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
          {gosterilecekEgitimler.map((kurs) => (
            <motion.div
              key={kurs.id}
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: '#4FD1C5' }}
              onClick={() => navigate(`/egitim/${kurs.id}`)}
              className="group relative bg-panel border border-transparent rounded-xl p-6 cursor-pointer transition-colors duration-300"
            >
              <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-brass/0 group-hover:border-brass/70 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 pointer-events-none" />
              <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-brass/0 group-hover:border-brass/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 pointer-events-none" />
              <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-brass/0 group-hover:border-brass/70 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none" />
              <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-brass/0 group-hover:border-brass/70 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none" />

              <h3 className="font-display text-xl font-medium mb-2">{kurs.title}</h3>
              <p className="text-slate-soft text-sm">{kurs.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Egitimlerim;