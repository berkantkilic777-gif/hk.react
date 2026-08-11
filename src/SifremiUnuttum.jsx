import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");

  const gonder = (e) => {
    e.preventDefault();
    setGonderiliyor(true);
    setHataMesaji("");

    fetch("https://localhost:7264/api/Auth/sifremi-unuttum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(response => {
        return response.text().then(mesaj => {
          if (!response.ok) throw new Error(mesaj);
          return mesaj;
        });
      })
      .then(() => {
        setGonderildi(true);
        setGonderiliyor(false);
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
        <h2 className="font-display text-2xl font-medium text-center mb-3">
          Şifremi Unuttum
        </h2>

        {gonderildi ? (
          <div className="text-center">
            <p className="text-slate-soft text-sm mb-6">
              Eğer <span className="text-parchment">{email}</span> adresi kayıtlıysa,
              sıfırlama linkini içeren bir e-posta gönderdik. Gelen kutunu (ve
              spam klasörünü) kontrol et.
            </p>
            <Link
              to="/"
              className="text-brass hover:text-brass-soft text-sm transition-colors"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-soft text-sm text-center mb-6">
              Hesabına kayıtlı e-posta adresini gir, sana bir sıfırlama linki gönderelim.
            </p>

            <form onSubmit={gonder}>
              <div className="mb-6">
                <label className="block text-sm text-slate-soft mb-1.5">E-posta</label>
                <input
                  type="email"
                  placeholder="ornek@ogrenci.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                {gonderiliyor ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </motion.button>
            </form>

            <div className="text-center mt-6">
              <Link to="/" className="text-slate-soft hover:text-brass text-sm transition-colors">
                Giriş sayfasına dön
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default SifremiUnuttum;