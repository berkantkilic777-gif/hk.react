import { motion } from 'framer-motion';

// "Yükleniyor..." yazılarının yerini alan, marka kimliğine uygun bir yükleme animasyonu.
// tamSayfa=true ise tüm ekranı kaplar (sayfa ilk yüklenirken), false ise sadece kendi alanında görünür.
const Yukleniyor = ({ mesaj = 'Yükleniyor...', tamSayfa = true }) => {
  const icerik = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-end gap-1.5 h-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="w-1 bg-brass rounded-full"
            animate={{ height: ['20%', '100%', '20%'] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="font-practice text-[11px] tracking-[0.25em] uppercase text-slate-soft">
        {mesaj}
      </p>
    </div>
  );

  if (!tamSayfa) return icerik;

  return (
    <div className="min-h-screen bg-ink bg-blueprint flex items-center justify-center">
      {icerik}
    </div>
  );
};

export default Yukleniyor;