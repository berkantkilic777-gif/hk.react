import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function OdemeModal({ kurs, onKapat, onBasarili }) {
  const [kartNumarasi, setKartNumarasi] = useState('');
  const [kartIsim, setKartIsim] = useState('');
  const [sonKullanma, setSonKullanma] = useState('');
  const [cvv, setCvv] = useState('');

  const [kuponKodu, setKuponKodu] = useState('');
  const [kuponBilgisi, setKuponBilgisi] = useState(null);
  const [kuponDogrulaniyor, setKuponDogrulaniyor] = useState(false);
  const [kuponHatasi, setKuponHatasi] = useState('');

  const [odemeIsleniyor, setOdemeIsleniyor] = useState(false);
  const [hataMesaji, setHataMesaji] = useState('');

  const token = localStorage.getItem('ogrenciYakaKarti');

  const gosterilenFiyat = kuponBilgisi ? kuponBilgisi.indirimliFiyat : kurs.price;

  const kuponUygula = () => {
    if (!kuponKodu.trim()) return;

    setKuponDogrulaniyor(true);
    setKuponHatasi('');

    fetch(`https://localhost:7264/api/Courses/kupon-dogrula?kod=${encodeURIComponent(kuponKodu)}&courseId=${kurs.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        return response.json().then(veri => {
          if (!response.ok) throw new Error(typeof veri === 'string' ? veri : 'Geçersiz kupon kodu.');
          return veri;
        });
      })
      .then(veri => {
        setKuponBilgisi(veri);
        setKuponDogrulaniyor(false);
      })
      .catch(hata => {
        setKuponBilgisi(null);
        setKuponHatasi(hata.message);
        setKuponDogrulaniyor(false);
      });
  };

  const odemeyiTamamla = () => {
    // Bunlar gerçek bir kart doğrulaması değil, sadece boş bırakılmasın diye basit bir kontrol.
    if (kartNumarasi.length < 12 || !kartIsim || sonKullanma.length < 4 || cvv.length < 3) {
      setHataMesaji('Lütfen tüm kart bilgilerini eksiksiz gir.');
      return;
    }

    setHataMesaji('');
    setOdemeIsleniyor(true);

    // Gerçek bir ödeme sağlayıcısına bağlı olmadığımız için sahte bir "işleniyor" gecikmesi koyuyoruz.
    setTimeout(() => {
      fetch('https://localhost:7264/api/Courses/odeme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: kurs.id,
          kuponKodu: kuponBilgisi ? kuponKodu : null
        })
      })
        .then(response => {
          return response.json().then(veri => {
            if (!response.ok) throw new Error(typeof veri === 'string' ? veri : 'Ödeme başarısız.');
            return veri;
          });
        })
        .then(() => {
          setOdemeIsleniyor(false);
          onBasarili();
        })
        .catch(hata => {
          setOdemeIsleniyor(false);
          setHataMesaji(hata.message);
        });
    }, 1200);
  };

  const inputStili = "w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/40 focus:outline-none focus:border-brass transition-colors font-body text-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
        onClick={onKapat}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-panel border border-white/10 rounded-2xl p-8 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass">Ödeme</span>
            <button onClick={onKapat} className="text-slate-soft hover:text-parchment text-xl leading-none">✕</button>
          </div>
          <h3 className="font-display text-2xl font-medium mb-6">{kurs.title}</h3>

          {/* --- KUPON --- */}
          <div className="mb-5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Kupon kodu (opsiyonel)"
                value={kuponKodu}
                onChange={(e) => setKuponKodu(e.target.value)}
                className={inputStili}
              />
              <button
                onClick={kuponUygula}
                disabled={kuponDogrulaniyor}
                className="shrink-0 bg-transparent border border-brass/50 hover:border-brass text-brass px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {kuponDogrulaniyor ? '...' : 'Uygula'}
              </button>
            </div>
            {kuponHatasi && <p className="text-red-400 text-xs mt-1.5">{kuponHatasi}</p>}
            {kuponBilgisi && (
              <p className="text-green-400 text-xs mt-1.5">
                %{kuponBilgisi.indirimYuzdesi} indirim uygulandı 🎉
              </p>
            )}
          </div>

          {/* --- FİYAT ÖZETİ --- */}
          <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-white/10">
            <span className="text-slate-soft text-sm">Ödenecek Tutar</span>
            <div className="text-right">
              {kuponBilgisi && (
                <span className="text-slate-soft/50 text-sm line-through mr-2">{kurs.price} TL</span>
              )}
              <span className="font-practice text-brass text-xl">{gosterilenFiyat} TL</span>
            </div>
          </div>

          {/* --- SAHTE KART FORMU --- */}
          <label className="font-practice text-xs tracking-wider text-brass/80 mb-1.5 block">Kart Numarası</label>
          <input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={kartNumarasi}
            onChange={(e) => setKartNumarasi(e.target.value.replace(/\D/g, ''))}
            maxLength={16}
            className={`${inputStili} mb-4`}
          />

          <label className="font-practice text-xs tracking-wider text-brass/80 mb-1.5 block">Kart Üzerindeki İsim</label>
          <input
            type="text"
            placeholder="Ad Soyad"
            value={kartIsim}
            onChange={(e) => setKartIsim(e.target.value)}
            className={`${inputStili} mb-4`}
          />

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="font-practice text-xs tracking-wider text-brass/80 mb-1.5 block">Son Kullanma</label>
              <input
                type="text"
                placeholder="AA/YY"
                value={sonKullanma}
                onChange={(e) => setSonKullanma(e.target.value)}
                maxLength={5}
                className={inputStili}
              />
            </div>
            <div className="flex-1">
              <label className="font-practice text-xs tracking-wider text-brass/80 mb-1.5 block">CVV</label>
              <input
                type="text"
                placeholder="000"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength={3}
                className={inputStili}
              />
            </div>
          </div>

          {hataMesaji && <p className="text-red-400 text-sm mb-4">{hataMesaji}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={odemeyiTamamla}
            disabled={odemeIsleniyor}
            className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {odemeIsleniyor ? 'İşleniyor...' : `${gosterilenFiyat} TL Öde`}
          </motion.button>

          <p className="text-slate-soft/40 text-xs text-center mt-4">
            Bu bir demo ödeme ekranıdır, gerçek kart bilgisi işlenmez.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default OdemeModal;