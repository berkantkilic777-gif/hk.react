import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bildirimGoster } from './bildirimSistemi';
import Yukleniyor from './Yukleniyor';
import PratikLambasi from './PratikLambasi';

function Profile() {
  const [profil, setProfil] = useState(null);
  const [kurslar, setKurslar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");

  const [eskiSifre, setEskiSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");

  const [avatarDosya, setAvatarDosya] = useState(null);
  const [avatarYukleniyor, setAvatarYukleniyor] = useState(false);

  const token = localStorage.getItem("ogrenciYakaKarti");

  useEffect(() => {
    fetch("https://localhost:7264/api/Profile", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfil(data);
        setName(data.name);
        setLastName(data.lastName);
        setYukleniyor(false);
      })
      .catch(err => {
        console.log("Profil çekilemedi:", err);
        setYukleniyor(false);
      });

    fetch("https://localhost:7264/api/Courses/egitimlerim", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setKurslar(data))
      .catch(err => console.log("Kurslar çekilemedi:", err));
  }, []);

  const bilgiGuncelle = (e) => {
    e.preventDefault();

    fetch("https://localhost:7264/api/Profile", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, lastName })
    })
      .then(res => {
        if (!res.ok) throw new Error("Güncelleme başarısız.");
        return res.text();
      })
      .then(() => {
        bildirimGoster("Bilgilerin güncellendi!", 'basari');
        setProfil(prev => ({ ...prev, name, lastName }));
      })
      .catch(err => bildirimGoster(err.message, 'hata'));
  };

  const sifreGuncelle = (e) => {
    e.preventDefault();

    if (yeniSifre !== yeniSifreTekrar) {
      bildirimGoster("Yeni şifreler eşleşmiyor.", 'hata');
      return;
    }

    fetch("https://localhost:7264/api/Profile/sifre", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ eskiSifre, yeniSifre })
    })
      .then(res => {
        return res.text().then(mesaj => {
          if (!res.ok) throw new Error(mesaj);
          return mesaj;
        });
      })
      .then((mesaj) => {
        bildirimGoster(mesaj, 'basari');
        setEskiSifre("");
        setYeniSifre("");
        setYeniSifreTekrar("");
      })
      .catch(err => bildirimGoster(err.message, 'hata'));
  };

  const avatarYukle = () => {
    if (!avatarDosya) {
      bildirimGoster("Önce bir fotoğraf seç.", 'hata');
      return;
    }

    const formData = new FormData();
    formData.append("foto", avatarDosya);

    setAvatarYukleniyor(true);

    fetch("https://localhost:7264/api/Profile/foto", {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => {
        return res.text().then(mesaj => {
          if (!res.ok) throw new Error(mesaj);
          return JSON.parse(mesaj);
        });
      })
      .then((data) => {
        setProfil(prev => ({ ...prev, profilFotoUrl: data.url }));
        setAvatarDosya(null);
        setAvatarYukleniyor(false);
      })
      .catch(err => {
        bildirimGoster(err.message, 'hata');
        setAvatarYukleniyor(false);
      });
  };

  const inputStili = "w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/40 focus:outline-none focus:border-brass transition-colors font-body";
  const etiketStili = "font-practice text-xs tracking-wider text-brass/80 mb-1.5 block";

  if (yukleniyor) {
    return <Yukleniyor mesaj="Profil yükleniyor..." />;
  }

  const avatarUrl = profil.profilFotoUrl
    ? `https://localhost:7264${profil.profilFotoUrl}`
    : null;

  return (
    <div className="min-h-screen bg-ink text-parchment font-body px-6 py-16">
      <div className="max-w-2xl mx-auto">

        <span className="font-practice text-xs tracking-[0.3em] uppercase text-slate-soft block mb-2">
          system // profil
        </span>
        <h2 className="font-display text-3xl font-medium mb-10">
          <span className="text-brass">[</span> Profilim <span className="text-brass">]</span>
        </h2>

        {/* --- PRATİK SERİSİ LAMBASI --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <PratikLambasi />
        </motion.div>

        {/* --- AVATAR --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mb-8 flex items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-ink border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-2xl text-brass">
                {profil.name?.[0]?.toUpperCase()}{profil.lastName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <label className={etiketStili}>&gt; profil_fotografi</label>
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setAvatarDosya(e.target.files[0])}
                className="text-sm text-slate-soft file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brass/20 file:text-brass file:cursor-pointer"
              />
              <button
                onClick={avatarYukle}
                disabled={avatarYukleniyor}
                className="bg-brass hover:bg-brass-soft text-ink font-semibold px-4 py-1.5 rounded-lg transition-colors text-sm shrink-0 disabled:opacity-50"
              >
                {avatarYukleniyor ? "Yükleniyor..." : "Yükle"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* --- BİLGİLER --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mb-8"
        >
          <h3 className="font-practice text-sm tracking-wider text-parchment mb-6">
            &gt; BILGILERIM
          </h3>

          <form onSubmit={bilgiGuncelle}>
            <label className={etiketStili}>&gt; ad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputStili} mb-4`}
            />

            <label className={etiketStili}>&gt; soyad</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`${inputStili} mb-4`}
            />

            <label className={etiketStili}>&gt; email</label>
            <input
              type="email"
              value={profil.email}
              disabled
              className={`${inputStili} mb-6 opacity-50 cursor-not-allowed`}
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors"
            >
              Bilgileri Kaydet
            </motion.button>
          </form>
        </motion.div>

        {/* --- ŞİFRE --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mb-8"
        >
          <h3 className="font-practice text-sm tracking-wider text-parchment mb-6">
            &gt; SIFRE_DEGISTIR
          </h3>

          <form onSubmit={sifreGuncelle}>
            <label className={etiketStili}>&gt; eski_sifre</label>
            <input
              type="password"
              value={eskiSifre}
              onChange={(e) => setEskiSifre(e.target.value)}
              className={`${inputStili} mb-4`}
            />

            <label className={etiketStili}>&gt; yeni_sifre</label>
            <input
              type="password"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
              className={`${inputStili} mb-4`}
            />

            <label className={etiketStili}>&gt; yeni_sifre_tekrar</label>
            <input
              type="password"
              value={yeniSifreTekrar}
              onChange={(e) => setYeniSifreTekrar(e.target.value)}
              className={`${inputStili} mb-6`}
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors"
            >
              Şifreyi Güncelle
            </motion.button>
          </form>
        </motion.div>

        {/* --- KURSLARIM ÖZET --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-panel border border-white/5 rounded-xl p-6"
        >
          <h3 className="font-practice text-sm tracking-wider text-parchment mb-6">
            &gt; SATIN_ALINAN_KURSLAR ({kurslar.length})
          </h3>

          {kurslar.length === 0 ? (
            <p className="text-slate-soft text-sm">Henüz bir kurs satın almadın.</p>
          ) : (
            <ul className="space-y-2">
              {kurslar.map((kurs) => (
                <li key={kurs.id} className="text-sm text-slate-soft border-b border-white/5 pb-2">
                  <span className="text-parchment">{kurs.title}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default Profile;