import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function SifreSifirla() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");
  const [basarili, setBasarili] = useState(false);

  const navigate = useNavigate();

  const gonder = (e) => {
    e.preventDefault();
    setHataMesaji("");

    if (!token) {
      setHataMesaji("Geçersiz sıfırlama linki. Linki e-postandan tekrar açmayı dene.");
      return;
    }

    if (yeniSifre.length < 4) {
      setHataMesaji("Şifre en az 4 karakter olmalı.");
      return;
    }

    if (yeniSifre !== yeniSifreTekrar) {
      setHataMesaji("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setGonderiliyor(true);

    fetch("https://localhost:7264/api/Auth/sifre-sifirla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, yeniSifre })
    })
      .then(response => {
        return response.text().then(mesaj => {
          if (!response.ok) throw new Error(mesaj);
          return mesaj;
        });
      })
      .then(() => {
        setBasarili(true);
        setGonderiliyor(false);
        setTimeout(() => navigate('/'), 2500);
      })
      .catch(hata => {
        setHataMesaji(hata.message);
        setGonderiliyor(false);
      });
  };

  return (
    <div className="min-h-screen bg-ink text-parchment font-body flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-panel w-full max-w-sm rounded-2xl p-8 border border-white/5"
      >
        <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block text-center mb-3">
          hk. Müzik Akademi
        </span>
        <h2 className="font-display text-2xl font-medium text-center mb-6">
          Yeni Şifre Belirle
        </h2>

        {basarili ? (
          <p className="text-slate-soft text-sm text-center">
            Şifren güncellendi 🎉 Birazdan giriş sayfasına yönlendirileceksin.
          </p>
        ) : !token ? (
          <div className="text-center">
            <p className="text-brass-soft text-sm mb-6">
              Bu link geçersiz görünüyor. Sıfırlama işlemini e-postandaki linke
              tıklayarak başlatmalısın.
            </p>
            <Link to="/sifremi-unuttum" className="text-brass hover:text-brass-soft text-sm transition-colors">
              Yeni bir sıfırlama linki iste
            </Link>
          </div>
        ) : (
          <form onSubmit={gonder}>
            <div className="mb-4">
              <label className="block text-sm text-slate-soft mb-1.5">Yeni Şifre</label>
              <input
                type="password"
                placeholder="Yeni şifreni gir"
                value={yeniSifre}
                onChange={(e) => setYeniSifre(e.target.value)}
                className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-soft mb-1.5">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                placeholder="Yeni şifreni tekrar gir"
                value={yeniSifreTekrar}
                onChange={(e) => setYeniSifreTekrar(e.target.value)}
                className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
              />
            </div>

            {hataMesaji && <p className="text-red-400 text-sm mb-4">{hataMesaji}</p>}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={gonderiliyor}
              className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {gonderiliyor ? "Kaydediliyor..." : "Şifreyi Güncelle"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default SifreSifirla;