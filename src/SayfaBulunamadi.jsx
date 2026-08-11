import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Yanlış bir adrese gidildiğinde gösterilen 404 sayfası — "yanlış nota" temalı
function SayfaBulunamadi() {
  return (
    <div className="min-h-screen bg-ink bg-blueprint text-parchment font-body flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Sarsılan, "pes" eden bir nota ikonu */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-7xl mb-2 text-brass/70 select-none"
          aria-hidden="true"
        >
          ♪
        </motion.div>

        <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block mb-3">
          Hata 404
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-medium mb-4">
          Yanlış bir nota çaldın gibi.
        </h1>
        <p className="text-slate-soft mb-8 leading-relaxed">
          Aradığın sayfa burada değil — silinmiş, taşınmış ya da hiç var olmamış olabilir.
          Ana sayfadan tekrar başlayabilirsin.
        </p>

        <Link
          to="/anasayfa"
          className="inline-block bg-brass hover:bg-brass-soft text-ink font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </motion.div>
    </div>
  );
}

export default SayfaBulunamadi;