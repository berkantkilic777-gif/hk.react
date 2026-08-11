import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { kullaniciRolunuAl } from './jwtYardimci';
import { Link } from 'react-router-dom';
import { bildirimGoster } from './bildirimSistemi';

function Login() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");

  const navigate = useNavigate();

  const girisYapTiklandi = (e) => {
  e.preventDefault();
    const kargoPaketi = {
      username: email,
      Password: sifre
    };

    fetch("https://localhost:7264/api/Auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(kargoPaketi)
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Giriş başarısız! E-posta veya şifre yanlış.");
        }
      })
      .then(data => {
        localStorage.setItem("ogrenciYakaKarti", data.token);

        const rol = kullaniciRolunuAl();
        localStorage.setItem("ogrenciRol", rol);

        navigate("/anasayfa");
      })
      .catch(error => {
        console.log("Hata:", error);
        bildirimGoster(error.message, 'hata');
      });
  };

  return (
    
    <div className="min-h-screen bg-ink bg-blueprint text-parchment font-body flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        {/* Köşe işaretleri — VideoDetay'daki sahne çerçevesiyle aynı imza öge */}
        <span className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-brass rounded-tl-lg pointer-events-none" />
        <span className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-brass rounded-tr-lg pointer-events-none" />
        <span className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-brass rounded-bl-lg pointer-events-none" />
        <span className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-brass rounded-br-lg pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative bg-panel w-full rounded-2xl p-8 ring-1 ring-brass/30 shadow-[0_0_90px_-20px_rgba(79, 209, 197, 0.5)]"
        >
        <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block text-center mb-3">
          hk. Müzik Akademi
        </span>
        <h2 className="font-display text-2xl font-medium text-center mb-8">
          Prova Odasına Giriş
        </h2>
        <form onSubmit={girisYapTiklandi}>
        <div className="mb-4">
          <label className="block text-sm text-slate-soft mb-1.5">
            E-posta
          </label>
          <input
            type="email"
            placeholder="ornek@ogrenci.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-soft mb-1.5">
            Şifre
          </label>
          <input
            type="password"
            placeholder="Şifreni gir"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors"
        >
          Giriş Yap
        </motion.button>

        <div className="text-center mt-4">
          <Link to="/sifremi-unuttum" className="text-slate-soft hover:text-brass text-sm transition-colors">
            Şifremi unuttum
          </Link>
        </div>

        <div className="text-center mt-2">
          <span className="text-slate-soft text-sm">Hesabın yok mu? </span>
          <Link to="/Register" className="text-brass hover:text-brass-soft text-sm transition-colors">
            Kayıt Ol
          </Link>
        </div>
        </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;