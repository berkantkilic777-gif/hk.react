import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// Aktif linkin altında kayan brass çizgi — sekmeler arası geçişte doğal bir "tab bar" hissi veriyor
const NavOgesi = ({ to, children, onClick }) => (
  <NavLink to={to} onClick={onClick} className="relative pb-1.5">
    {({ isActive }) => (
      <>
        <span className={`font-body text-sm tracking-wide transition-colors duration-200 ${
          isActive ? 'text-brass' : 'text-slate-soft hover:text-parchment'
        }`}>
          {children}
        </span>
        {isActive && (
          <motion.span
            layoutId="navbar-aktif-cizgi"
            className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-brass rounded-full shadow-[0_0_6px_rgba(79,209,197,0.7)]"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
      </>
    )}
  </NavLink>
);

// Basit zil ve hamburger ikonları (jenerik, telif içermeyen geometrik SVG'ler)
const ZilIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const HamburgerIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const rol = localStorage.getItem("ogrenciRol");
  const token = localStorage.getItem("ogrenciYakaKarti");

  const [profil, setProfil] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
  const [bildirimMenuAcik, setBildirimMenuAcik] = useState(false);
  const [rozetler, setRozetler] = useState([]);
  const menuRef = useRef(null);
  const bildirimRef = useRef(null);

  // Navbar'daki avatar için profil bilgisini (fotoğraf/isim) çekiyoruz
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:7264/api/Profile", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setProfil(data))
      .catch(() => {});
  }, [token]);

  // Bildirim zili için: kazanılan rozetleri "son aktivite" listesi olarak kullanıyoruz
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:7264/api/Basari", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setRozetler(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, [token]);

  // Menülerin dışına tıklanınca kapansın
  useEffect(() => {
    const disaTiklandi = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAcik(false);
      }
      if (bildirimRef.current && !bildirimRef.current.contains(e.target)) {
        setBildirimMenuAcik(false);
      }
    };
    document.addEventListener('mousedown', disaTiklandi);
    return () => document.removeEventListener('mousedown', disaTiklandi);
  }, []);

  const cikisYap = () => {
    localStorage.removeItem("ogrenciYakaKarti");
    localStorage.removeItem("ogrenciRol");
    navigate("/");
  };

  const avatarUrl = profil?.profilFotoUrl ? `https://localhost:7264${profil.profilFotoUrl}` : null;
  const baslangicHarfleri = profil
    ? `${profil.name?.[0] || ''}${profil.lastName?.[0] || ''}`.toUpperCase()
    : '';

  const tarihiFormatla = (tarih) => {
    const d = new Date(tarih);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <nav className="bg-ink border-b border-brass/10 px-6 py-4 relative">
      <div className="flex items-center justify-between">

        {/* --- Logo --- */}
        <motion.span
          whileHover={{ scale: 1.03 }}
          className="font-display text-lg text-parchment tracking-wide cursor-default"
        >
          hk. <span className="text-brass">Müzik</span>Akademi
        </motion.span>

        {/* --- Masaüstü linkleri --- */}
        <div className="hidden md:flex items-center gap-6">
          <NavOgesi to="/anasayfa">Ana Sayfa</NavOgesi>
          <NavOgesi to="/egitimlerim">Eğitimlerim</NavOgesi>
          <NavOgesi to="/favorilerim">Favorilerim</NavOgesi>
          <NavOgesi to="/rozetlerim">Rozetlerim</NavOgesi>

          {rol === "Admin" && (
            <NavOgesi to="/admin">Admin Paneli</NavOgesi>
          )}

          {/* --- BİLDİRİM ZİLİ --- */}
          <div className="relative" ref={bildirimRef}>
            <button
              onClick={() => setBildirimMenuAcik((o) => !o)}
              className="relative text-slate-soft hover:text-brass transition-colors w-8 h-8 flex items-center justify-center flex-shrink-0"
              title="Bildirimler"
            >
              <ZilIkonu className="w-5 h-5" />
              {rozetler.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brass" />
              )}
            </button>

            <AnimatePresence>
              {bildirimMenuAcik && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-panel border border-brass/20 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                >
                  <p className="font-practice text-[10px] tracking-[0.25em] uppercase text-brass/70 px-4 pt-3 pb-2">
                    Son Aktivite
                  </p>
                  {rozetler.length === 0 ? (
                    <p className="text-sm text-slate-soft px-4 pb-4">Henüz bir rozet kazanmadın.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {rozetler.map((r, i) => (
                        <div key={i} className="px-4 py-2.5 border-t border-white/5 flex items-center gap-3">
                          <span className="text-lg flex-shrink-0">🏆</span>
                          <div className="min-w-0">
                            <p className="text-sm text-parchment truncate">"{r.kursAdi}" rozeti kazandın</p>
                            <p className="text-[11px] text-slate-soft">{tarihiFormatla(r.kazanilmaTarihi)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- HESAP AVATARI + DROPDOWN --- */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuAcik((onceki) => !onceki)}
              className="w-9 h-9 rounded-full bg-panel border border-brass/30 overflow-hidden flex items-center justify-center hover:border-brass transition-colors flex-shrink-0"
              title="Hesabım"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profilim" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-xs text-brass">{baslangicHarfleri || '?'}</span>
              )}
            </motion.button>

            <AnimatePresence>
              {menuAcik && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 bg-panel border border-brass/20 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                >
                  <NavLink
                    to="/profil"
                    onClick={() => setMenuAcik(false)}
                    className="block px-4 py-2.5 text-sm text-parchment hover:bg-panel-light hover:text-brass transition-colors"
                  >
                    Profilim
                  </NavLink>
                  <button
                    onClick={() => { setMenuAcik(false); cikisYap(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-soft hover:bg-panel-light hover:text-red-400 transition-colors border-t border-white/5"
                  >
                    Çıkış Yap
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- MOBİL: avatar + hamburger --- */}
        <div className="flex md:hidden items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setBildirimMenuAcik((o) => !o)}
              className="relative text-slate-soft hover:text-brass transition-colors w-8 h-8 flex items-center justify-center"
            >
              <ZilIkonu className="w-5 h-5" />
              {rozetler.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brass" />
              )}
            </button>
          </div>
          <button
            onClick={() => setMobilMenuAcik((o) => !o)}
            className="text-parchment w-9 h-9 flex items-center justify-center flex-shrink-0"
          >
            <HamburgerIkonu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- MOBİL AÇILIR MENÜ --- */}
      <AnimatePresence>
        {mobilMenuAcik && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-1 pt-4 pb-1">
              <NavOgesi to="/anasayfa" onClick={() => setMobilMenuAcik(false)}>Ana Sayfa</NavOgesi>
              <div className="h-2" />
              <NavOgesi to="/egitimlerim" onClick={() => setMobilMenuAcik(false)}>Eğitimlerim</NavOgesi>
              <div className="h-2" />
              <NavOgesi to="/favorilerim" onClick={() => setMobilMenuAcik(false)}>Favorilerim</NavOgesi>
              <div className="h-2" />
              <NavOgesi to="/rozetlerim" onClick={() => setMobilMenuAcik(false)}>Rozetlerim</NavOgesi>
              <div className="h-2" />
              <NavOgesi to="/profil" onClick={() => setMobilMenuAcik(false)}>Profilim</NavOgesi>

              {rol === "Admin" && (
                <>
                  <div className="h-2" />
                  <NavOgesi to="/admin" onClick={() => setMobilMenuAcik(false)}>Admin Paneli</NavOgesi>
                </>
              )}

              <button
                onClick={cikisYap}
                className="mt-4 bg-transparent border border-slate-soft/40 text-slate-soft hover:text-brass text-sm px-4 py-2 rounded-lg transition-colors text-left"
              >
                Çıkış Yap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;