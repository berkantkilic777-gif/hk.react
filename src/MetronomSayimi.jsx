import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Uygulama ilk açıldığında (sayfa yenilenince) çok kısa bir "1-2-3-4" metronom
// nabzı gösterip kayboluyor — bir performansın sayılı başlangıcı gibi.
const MetronomSayimi = () => {
  const [gorunur, setGorunur] = useState(true);
  const [vuru, setVuru] = useState(0);

  useEffect(() => {
    if (vuru >= 4) {
      const kapat = setTimeout(() => setGorunur(false), 180);
      return () => clearTimeout(kapat);
    }
    const zamanlayici = setTimeout(() => setVuru((v) => v + 1), 140);
    return () => clearTimeout(zamanlayici);
  }, [vuru]);

  return (
    <AnimatePresence>
      {gorunur && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-ink flex items-center justify-center"
        >
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                animate={{
                  scale: vuru === i + 1 ? [1, 1.5, 1] : 1,
                  opacity: vuru > i ? 1 : 0.2
                }}
                transition={{ duration: 0.22 }}
                className="w-3 h-3 rounded-full bg-brass"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MetronomSayimi;