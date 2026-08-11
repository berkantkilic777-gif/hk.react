import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

let idSayaci = 0;

// App.jsx'te bir kere mount edilir, bildirimSistemi.js'teki bildirimGoster() ile tetiklenen
// her olayı dinleyip sağ üstte animasyonlu kutucuklar olarak gösterir. alert()'in yerini alıyor.
function ToastContainer() {
  const [bildirimler, setBildirimler] = useState([]);

  useEffect(() => {
    const dinleyici = (e) => {
      const id = idSayaci++;
      const yeni = { id, mesaj: e.detail.mesaj, tip: e.detail.tip || 'bilgi' };
      setBildirimler(onceki => [...onceki, yeni]);

      setTimeout(() => {
        setBildirimler(onceki => onceki.filter(b => b.id !== id));
      }, 4500);
    };

    window.addEventListener('bildirim', dinleyici);
    return () => window.removeEventListener('bildirim', dinleyici);
  }, []);

  const kapat = (id) => setBildirimler(onceki => onceki.filter(b => b.id !== id));

  const renkler = {
    hata: { kenar: 'border-red-400', metin: 'text-red-400', isaret: '✕' },
    basari: { kenar: 'border-practice', metin: 'text-practice', isaret: '✓' },
    bilgi: { kenar: 'border-brass', metin: 'text-brass', isaret: 'ℹ' }
  };

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {bildirimler.map((b) => {
          const stil = renkler[b.tip] || renkler.bilgi;
          return (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className={`pointer-events-auto bg-panel border-l-4 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] px-4 py-3 flex items-start gap-3 ${stil.kenar}`}
            >
              <span className={`text-base leading-none mt-0.5 flex-shrink-0 ${stil.metin}`}>
                {stil.isaret}
              </span>
              <p className="text-sm text-parchment flex-1 leading-relaxed">{b.mesaj}</p>
              <button
                onClick={() => kapat(b.id)}
                className="text-slate-soft hover:text-parchment text-sm leading-none flex-shrink-0 mt-0.5"
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;