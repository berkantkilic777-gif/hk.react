import { useState } from 'react';
import { motion } from 'framer-motion';
import { bildirimGoster } from './bildirimSistemi';

function Register() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const kayitOl = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:7264/api/Auth/register", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name,
          LastName: lastName,
          Email: email,
          Password: password
        })
      });

      if (response.ok) {
        bildirimGoster("Kayıt başarılı! Artık giriş yapabilirsin.", 'basari');
        setTimeout(() => { window.location.href = "/"; }, 1200);
      } else {
        bildirimGoster("Kayıt olunamadı. Belki bu e-posta zaten kayıtlıdır?", 'hata');
      }
    } catch (error) {
      console.log("Sunucuya ulaşılamadı:", error);
    }
  };

  return (
    <div className="min-h-screen bg-ink bg-blueprint text-parchment font-body flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
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
          Aramıza Katıl
        </h2>

        <form onSubmit={kayitOl} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-soft mb-1.5">Adın</label>
            <input
              type="text"
              placeholder="Adın"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-soft mb-1.5">Soyadın</label>
            <input
              type="text"
              placeholder="Soyadın"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-soft mb-1.5">E-posta Adresin</label>
            <input
              type="email"
              placeholder="E-posta Adresin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-soft mb-1.5">Şifren</label>
            <input
              type="password"
              placeholder="Şifren"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            Kayıt İşlemini Tamamla
          </motion.button>
        </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;