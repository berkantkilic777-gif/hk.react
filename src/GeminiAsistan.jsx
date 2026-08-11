import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bildirimGoster } from './bildirimSistemi';

// --- İKONLAR (jenerik, telif içermeyen geometrik SVG'ler) ---
const NotaIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);
const AtasIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);
const GonderIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
  </svg>
);
const GenisletIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const DaraltIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const HoparlorAcikIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06c1.5-.74 2.5-2.26 2.5-4.03z" />
  </svg>
);
const HoparlorKapaliIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 10v4h4l5 5V5L7 10H3z" />
    <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M15.5 9.5l4 5m0-5l-4 5" />
  </svg>
);
const MikrofonIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0014 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);
const KameraIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const KareYakalaIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const GecmisIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const GaleriIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// Ruh haline göre renk paleti
const RUH_HALI_RENKLERI = {
  notr: { halka: 'bg-brass', gradyan: 'from-brass-soft to-brass' },
  mutlu: { halka: 'bg-amber-400', gradyan: 'from-amber-300 to-amber-500' },
  destekleyici: { halka: 'bg-practice', gradyan: 'from-practice to-teal-600' }
};

const ruhHaliTespitEt = (metin) => {
  const kucukMetin = metin.toLowerCase();
  const mutluKelimeler = ['teşekkür', 'sağol', 'sağ ol', 'harika', 'süper', 'çok iyi', 'güzel oldu', 'anladım', 'mükemmel'];
  const zorlananKelimeler = ['anlamadım', 'zor', 'yapamıyorum', 'kafam karıştı', 'beceremiyorum', 'çok zor', 'olmuyor'];
  if (mutluKelimeler.some((k) => kucukMetin.includes(k))) return 'mutlu';
  if (zorlananKelimeler.some((k) => kucukMetin.includes(k))) return 'destekleyici';
  return 'notr';
};

const zamanDamgalariniLinkle = (metin, onZamanaAtla) => {
  if (!onZamanaAtla) return metin;
  const parcalar = metin.split(/(\d{1,2}:\d{2})/g);
  return parcalar.map((parca, i) => {
    if (/^\d{1,2}:\d{2}$/.test(parca)) {
      const [dk, sn] = parca.split(':').map(Number);
      const saniye = dk * 60 + sn;
      return (
        <button key={i} onClick={() => onZamanaAtla(saniye)} className="font-practice text-brass underline underline-offset-2 decoration-brass/50 hover:text-brass-soft transition-colors">
          {parca}
        </button>
      );
    }
    return parca;
  });
};

const sesCal = (frekans = 600, sure = 0.08) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frekans;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sure);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + sure);
  } catch (e) { /* Web Audio desteklenmiyorsa sessizce geç */ }
};

// Data URL'i dosyaya (Blob) çeviriyor — kamera/video karesi çekimlerini FormData'ya eklemek için
const dataUrlToDosya = (dataUrl, dosyaAdi) => {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new File([array], dosyaAdi, { type: mime });
};

const tarihiFormatla = (tarih) => new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const GeminiAsistan = ({ videoId, onZamanaAtla, videoKaresiAl, suankiVideoSaniyesi }) => {
  const [acikMi, setAcikMi] = useState(false);
  const [genisMi, setGenisMi] = useState(false);
  const [soru, setSoru] = useState('');
  const [mesajlar, setMesajlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [fotograflar, setFotograflar] = useState([]); // [{dosya, onizleme, etiket}]
  const [ruhHali, setRuhHali] = useState('notr');
  const [patlamaAnahtari, setPatlamaAnahtari] = useState(0);
  const [sesAcik, setSesAcik] = useState(false);
  const [dinleniyor, setDinleniyor] = useState(false);
  const [ekMenuAcik, setEkMenuAcik] = useState(false);
  const [kameraAcik, setKameraAcik] = useState(false);
  const [gecmisAcik, setGecmisAcik] = useState(false);
  const [gecmisVerisi, setGecmisVerisi] = useState([]);
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false);

  const dosyaInputRef = useRef(null);
  const mesajIdRef = useRef(0);
  const tanimaRef = useRef(null);
  const kameraVideoRef = useRef(null);
  const kameraStreamRef = useRef(null);

  // --- FOTOĞRAF EKLEME (galeri, çoklu seçim) ---
  const fotoSecildi = (e) => {
    const dosyalar = Array.from(e.target.files);
    const yeniler = dosyalar.map((d) => ({ dosya: d, onizleme: URL.createObjectURL(d), etiket: null }));
    setFotograflar((onceki) => [...onceki, ...yeniler]);
  };

  const fotoKaldir = (index) => {
    setFotograflar((onceki) => onceki.filter((_, i) => i !== index));
  };

  // --- KAMERA İLE ÇEKİM ---
  const kamerayiAc = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      kameraStreamRef.current = stream;
      setKameraAcik(true);
      setTimeout(() => {
        if (kameraVideoRef.current) kameraVideoRef.current.srcObject = stream;
      }, 50);
    } catch (e) {
      bildirimGoster('Kameraya erişilemedi, tarayıcı izni verdiğinden emin ol.', 'hata');
    }
  };

  const kamerayiKapat = () => {
    kameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    kameraStreamRef.current = null;
    setKameraAcik(false);
  };

  const fotoCek = () => {
    if (!kameraVideoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = kameraVideoRef.current.videoWidth;
    canvas.height = kameraVideoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(kameraVideoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const dosya = dataUrlToDosya(dataUrl, `cekim-${Date.now()}.jpg`);
    setFotograflar((onceki) => [...onceki, { dosya, onizleme: dataUrl, etiket: null }]);
    kamerayiKapat();
  };

  // --- ÖĞRETMENİN VİDEODAKİ ANLIK KARESİNİ AL ---
  const ogretmenKaresiniAl = () => {
    if (!videoKaresiAl) return;
    const dataUrl = videoKaresiAl();
    if (!dataUrl) {
      bildirimGoster('Video karesi alınamadı, videonun oynadığından emin ol.', 'hata');
      return;
    }
    const dosya = dataUrlToDosya(dataUrl, `ogretmen-karesi-${Date.now()}.jpg`);
    setFotograflar((onceki) => [...onceki, { dosya, onizleme: dataUrl, etiket: 'Öğretmen karesi' }]);
  };

  // --- SESLİ OKUMA (text-to-speech) ---
  const sesliOku = (metin) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const konusma = new SpeechSynthesisUtterance(metin);
    konusma.lang = 'tr-TR';
    konusma.rate = 1;
    window.speechSynthesis.speak(konusma);
  };

  // --- MİKROFONLA SORU SORMA (speech-to-text) ---
  const sesleSoruSor = () => {
    const TanimaSinifi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!TanimaSinifi) {
      bildirimGoster('Tarayıcın sesle soru sormayı desteklemiyor, Chrome ile dener misin?', 'hata');
      return;
    }
    if (dinleniyor) {
      tanimaRef.current?.stop();
      return;
    }
    const tanima = new TanimaSinifi();
    tanima.lang = 'tr-TR';
    tanima.interimResults = false;
    tanima.maxAlternatives = 1;
    tanima.onresult = (e) => {
      const metin = e.results[0][0].transcript;
      setSoru((onceki) => (onceki ? `${onceki} ${metin}` : metin));
    };
    tanima.onend = () => setDinleniyor(false);
    tanima.onerror = () => setDinleniyor(false);
    tanimaRef.current = tanima;
    tanima.start();
    setDinleniyor(true);
  };

  // --- FOTOĞRAF GEÇMİŞİ ---
  const gecmisiGetir = () => {
    setGecmisAcik(true);
    setGecmisYukleniyor(true);
    const token = localStorage.getItem('ogrenciYakaKarti');
    fetch(`https://localhost:7264/api/Video/${videoId}/fotograf-gecmisi`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { setGecmisVerisi(Array.isArray(data) ? data : []); setGecmisYukleniyor(false); })
      .catch(() => setGecmisYukleniyor(false));
  };

  const yaziyormusGibiGoster = (tamMetin, mesajId) => {
    let i = 0;
    const adimAt = () => {
      i++;
      setMesajlar((oncekiler) => oncekiler.map((m) => (m.id === mesajId ? { ...m, metin: tamMetin.slice(0, i) } : m)));
      if (i < tamMetin.length) {
        setTimeout(adimAt, 12 + Math.random() * 18);
      } else {
        setMesajlar((oncekiler) => oncekiler.map((m) => (m.id === mesajId ? { ...m, tamamlandi: true } : m)));
      }
    };
    adimAt();
  };

  const soruGonder = async () => {
    if (soru.trim() === '' && fotograflar.length === 0) return;

    const kullaniciMetni = soru || (fotograflar.length > 0 ? 'Fotoğrafımı gönderiyorum, el pozisyonumu değerlendirir misin?' : '');
    const yeniRuhHali = ruhHaliTespitEt(kullaniciMetni);
    setRuhHali(yeniRuhHali);
    setPatlamaAnahtari((onceki) => onceki + 1);
    if (sesAcik) sesCal(700, 0.06);

    const kullaniciMesaji = {
      id: mesajIdRef.current++,
      rol: 'kullanici',
      metin: kullaniciMetni,
      fotolar: fotograflar.map((f) => f.onizleme),
      tamamlandi: true
    };
    setMesajlar((oncekiler) => [...oncekiler, kullaniciMesaji]);

    const gonderilecekSoru = kullaniciMetni;
    const gonderilecekOgrenciFotolari = fotograflar.filter((f) => f.etiket !== 'Öğretmen karesi').map((f) => f.dosya);
    const gonderilecekOgretmenKaresi = fotograflar.find((f) => f.etiket === 'Öğretmen karesi')?.dosya || null;
    setSoru('');
    setFotograflar([]);
    setYukleniyor(true);

    try {
      const token = localStorage.getItem('ogrenciYakaKarti');
      const formData = new FormData();
      formData.append('soru', gonderilecekSoru);
      gonderilecekOgrenciFotolari.forEach((dosya) => formData.append('fotograflar', dosya));
      if (gonderilecekOgretmenKaresi) formData.append('ogretmenKaresi', gonderilecekOgretmenKaresi);
      if (typeof suankiVideoSaniyesi === 'number' && suankiVideoSaniyesi > 0) {
        formData.append('videoSaniyesi', suankiVideoSaniyesi);
      }

      const response = await fetch(`https://localhost:7264/api/Video/${videoId}/soru`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      setYukleniyor(false);

      if (!response.ok) {
        const hataDetayi = await response.text().catch(() => '');
        console.error('Cadenza /soru hatası:', response.status, hataDetayi);
        const hataId = mesajIdRef.current++;
        setMesajlar((oncekiler) => [...oncekiler, { id: hataId, rol: 'asistan', metin: '', tamamlandi: false }]);
        yaziyormusGibiGoster(
          `Şu an cevap veremiyorum (hata kodu: ${response.status}). Konsolda (F12) daha fazla detay olabilir.`,
          hataId
        );
        return;
      }

      const data = await response.json();
      if (sesAcik) {
        sesCal(500, 0.1);
        sesliOku(data.cevap);
      }
      const asistanId = mesajIdRef.current++;
      setMesajlar((oncekiler) => [...oncekiler, { id: asistanId, rol: 'asistan', metin: '', tamamlandi: false, puan: data.puan }]);
      yaziyormusGibiGoster(data.cevap, asistanId);
    } catch (error) {
      console.error("Asistana soru gönderilirken hata oluştu:", error);
      setYukleniyor(false);
      const hataId = mesajIdRef.current++;
      setMesajlar((oncekiler) => [...oncekiler, { id: hataId, rol: 'asistan', metin: '', tamamlandi: false }]);
      yaziyormusGibiGoster('Bir şeyler ters gitti, tekrar dener misin?', hataId);
    }
  };

  const enterTusunaBasinca = (e) => {
    if (e.key === 'Enter') soruGonder();
  };

  const renkler = RUH_HALI_RENKLERI[ruhHali] || RUH_HALI_RENKLERI.notr;

  return (
    <>
      {/* --- KAMERA ÇEKİM MODALI (çekim kılavuzu overlay'iyle) --- */}
      <AnimatePresence>
        {kameraAcik && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[70] flex flex-col items-center justify-center px-4"
          >
            <div className="relative max-w-full max-h-[65vh]">
              <video ref={kameraVideoRef} autoPlay playsInline muted className="max-w-full max-h-[65vh] rounded-lg" />
              {/* Çekim kılavuzu: elini oturtman gereken çerçeve */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-dashed border-brass/70 rounded-2xl" />
              </div>
            </div>
            <p className="text-parchment text-sm mt-4">Elini kılavuz çerçeveye yerleştirmeye çalış</p>
            <div className="flex gap-4 mt-6">
              <button onClick={kamerayiKapat} className="bg-panel text-parchment px-5 py-2.5 rounded-lg hover:bg-panel-light transition-colors">İptal</button>
              <button onClick={fotoCek} className="bg-brass hover:bg-brass-soft text-ink font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <KameraIkonu className="w-4 h-4" /> Çek
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STÜDYO CAMI ODAK EFEKTİ --- */}
      <AnimatePresence>
        {acikMi && (
          <motion.div
            key="cadenza-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAcikMi(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}

        {acikMi && (
          <motion.div
            key="cadenza-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`fixed z-50 rounded-2xl p-[1.5px] cadenza-kenar shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 font-body bottom-6 right-3 sm:right-6 left-3 sm:left-auto ${
              genisMi ? 'w-auto sm:w-[90vw] max-w-2xl h-[80vh]' : 'w-auto sm:w-80 h-[26rem]'
            }`}
          >
            <div className="w-full h-full bg-panel rounded-2xl flex flex-col overflow-hidden">

              {/* --- BAŞLIK --- */}
              <div className="bg-ink px-4 py-3.5 flex items-center gap-2 border-b border-brass/15 flex-shrink-0">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <AnimatePresence>
                    <motion.span
                      key={patlamaAnahtari}
                      initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 3.2, opacity: 0 }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      className={`absolute inset-0 rounded-full ${renkler.halka} pointer-events-none`}
                    />
                  </AnimatePresence>
                  <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${renkler.gradyan} flex items-center justify-center transition-colors duration-500 ring-2 ring-white/10`}>
                    <NotaIkonu className="w-4 h-4 text-ink" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display italic text-lg text-parchment leading-tight">Cadenza</p>
                    <div className="flex items-end gap-[2px] h-3.5 flex-shrink-0" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i} className="w-[2px] h-full bg-brass/60 rounded-full origin-bottom"
                          animate={{ scaleY: [0.3, 1, 0.5, 0.9, 0.3] }}
                          transition={{ duration: 1.6 + i * 0.15, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-practice text-[9px] tracking-[0.2em] uppercase text-slate-soft">pratik ortağın</p>
                </div>

                <button onClick={gecmisiGetir} title="Fotoğraf geçmişim" className="text-slate-soft hover:text-brass w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors">
                  <GecmisIkonu className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSesAcik((s) => !s); if (sesAcik) window.speechSynthesis?.cancel(); }}
                  title={sesAcik ? 'Sesi kapat' : 'Sesli deneyimi aç'}
                  className={`w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors ${sesAcik ? 'text-brass' : 'text-slate-soft hover:text-brass'}`}
                >
                  {sesAcik ? <HoparlorAcikIkonu className="w-4 h-4" /> : <HoparlorKapaliIkonu className="w-4 h-4" />}
                </button>
                <button onClick={() => setGenisMi((g) => !g)} title={genisMi ? 'Küçült' : 'Genişlet'} className="text-slate-soft hover:text-brass w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors">
                  {genisMi ? <DaraltIkonu className="w-4 h-4" /> : <GenisletIkonu className="w-4 h-4" />}
                </button>
                <button onClick={() => setAcikMi(false)} className="text-slate-soft hover:text-brass text-xl leading-none w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors">×</button>
              </div>

              {/* --- MESAJLAR --- */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-ink">
                {mesajlar.length === 0 && (
                  <p className="text-sm text-slate-soft text-center mt-8 px-3 leading-relaxed">
                    Merhaba, ben Cadenza. Bu video hakkında merak ettiğin bir şey var mı?
                    Ataş ikonundan fotoğraf ekleyip elinin pozisyonu hakkında geri bildirim de alabilirsin.
                  </p>
                )}

                {mesajlar.map((mesaj) => (
                  <div key={mesaj.id} className={`flex ${mesaj.rol === 'kullanici' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${genisMi ? 'max-w-[65%]' : 'max-w-[78%]'} px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                      mesaj.rol === 'kullanici' ? 'bg-brass text-ink font-medium rounded-br-sm' : 'bg-panel-light text-parchment border-l-2 border-brass/50 rounded-bl-sm'
                    }`}>
                      {mesaj.fotolar && mesaj.fotolar.length > 0 && (
                        <div className="flex gap-1.5 mb-1.5 flex-wrap">
                          {mesaj.fotolar.map((f, i) => (
                            <img key={i} src={f} alt="Gönderilen fotoğraf" className="rounded-lg max-h-24 object-cover" />
                          ))}
                        </div>
                      )}
                      {mesaj.rol === 'asistan' && mesaj.tamamlandi ? zamanDamgalariniLinkle(mesaj.metin, onZamanaAtla) : mesaj.metin}
                      {mesaj.rol === 'asistan' && !mesaj.tamamlandi && mesaj.metin && (
                        <span className="inline-block w-1 h-3.5 bg-brass/70 ml-0.5 align-middle motion-safe:animate-pulse" />
                      )}
                      {mesaj.rol === 'asistan' && mesaj.tamamlandi && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <button onClick={() => sesliOku(mesaj.metin)} title="Bu mesajı sesli dinle" className="text-slate-soft hover:text-brass transition-colors">
                            <HoparlorAcikIkonu className="w-3.5 h-3.5" />
                          </button>
                          {mesaj.puan != null && (
                            <span className="font-practice text-[10px] px-1.5 py-0.5 rounded bg-brass/15 text-brass">
                              Pozisyon: {mesaj.puan}/10
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {yukleniyor && (
                  <div className="flex justify-start">
                    <div className="bg-panel-light border-l-2 border-brass/50 rounded-xl rounded-bl-sm px-3.5 py-3 flex items-center gap-2">
                      <span className="sr-only">Cadenza düşünüyor...</span>
                      <span className="relative flex w-2 h-2 flex-shrink-0">
                        <span className="absolute inset-0 rounded-full bg-red-500 motion-safe:animate-ping opacity-60" />
                        <span className="relative w-2 h-2 rounded-full bg-red-500" />
                      </span>
                      <span className="font-practice text-[10px] tracking-[0.25em] uppercase text-slate-soft">Kayıt</span>
                    </div>
                  </div>
                )}
              </div>

              {/* --- FOTOĞRAF ÖNİZLEMELERİ (birden fazla olabilir) --- */}
              {fotograflar.length > 0 && (
                <div className="px-3 pt-2.5 flex items-center gap-2 border-t border-brass/15 bg-ink flex-shrink-0 overflow-x-auto">
                  {fotograflar.map((f, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <img src={f.onizleme} alt="Önizleme" className="w-10 h-10 rounded-lg object-cover border border-brass/20" />
                      {f.etiket && (
                        <span className="absolute -bottom-1 -right-1 bg-brass text-ink text-[8px] px-1 rounded-sm font-practice">🎓</span>
                      )}
                      <button onClick={() => fotoKaldir(i)} className="absolute -top-1.5 -right-1.5 bg-panel border border-white/10 rounded-full w-4 h-4 flex items-center justify-center text-slate-soft hover:text-red-400 text-[10px] leading-none">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* --- GİRİŞ ALANI --- */}
              <div className="p-2.5 border-t border-brass/15 bg-ink flex gap-2 items-center flex-shrink-0 relative">
                <input type="file" accept="image/*" multiple ref={dosyaInputRef} onChange={fotoSecildi} className="hidden" />

                {/* Ekleme menüsü: galeri / kamera / öğretmen karesi */}
                <div className="relative">
                  <button
                    onClick={() => setEkMenuAcik((o) => !o)}
                    title="Fotoğraf ekle"
                    className="text-slate-soft hover:text-brass w-8 h-9 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <AtasIkonu className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {ekMenuAcik && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 bg-panel border border-brass/20 rounded-lg overflow-hidden shadow-lg w-56 z-10"
                      >
                        <button
                          onClick={() => { dosyaInputRef.current.click(); setEkMenuAcik(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-parchment hover:bg-panel-light transition-colors flex items-center gap-2"
                        >
                          <GaleriIkonu className="w-4 h-4 text-slate-soft" /> Galeriden Seç
                        </button>
                        <button
                          onClick={() => { kamerayiAc(); setEkMenuAcik(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-parchment hover:bg-panel-light transition-colors flex items-center gap-2 border-t border-white/5"
                        >
                          <KameraIkonu className="w-4 h-4 text-slate-soft" /> Kamera ile Çek
                        </button>
                        {videoKaresiAl && (
                          <button
                            onClick={() => { ogretmenKaresiniAl(); setEkMenuAcik(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-parchment hover:bg-panel-light transition-colors flex items-center gap-2 border-t border-white/5"
                          >
                            <KareYakalaIkonu className="w-4 h-4 text-slate-soft" /> Öğretmenin Bu Anki Karesini Al
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={sesleSoruSor}
                  title={dinleniyor ? 'Dinlemeyi durdur' : 'Mikrofonla soru sor'}
                  className={`w-8 h-9 flex items-center justify-center flex-shrink-0 transition-colors relative ${dinleniyor ? 'text-red-400' : 'text-slate-soft hover:text-brass'}`}
                >
                  {dinleniyor && <span className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-red-400/30 motion-safe:animate-ping" />}
                  <MikrofonIkonu className="w-4 h-4 relative" />
                </button>

                <input
                  type="text" value={soru} onChange={(e) => setSoru(e.target.value)} onKeyDown={enterTusunaBasinca}
                  placeholder={dinleniyor ? 'Dinleniyor...' : "Cadenza'ya sor..."}
                  className="flex-1 bg-panel border border-white/10 rounded-full px-3.5 py-2 text-sm text-parchment placeholder:text-slate-soft/50 focus:outline-none focus:border-brass transition-colors"
                />
                <button onClick={soruGonder} className="bg-brass hover:bg-brass-soft text-ink rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors">
                  <GonderIkonu className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FOTOĞRAF GEÇMİŞİ MODALI --- */}
      <AnimatePresence>
        {gecmisAcik && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setGecmisAcik(false)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-[60]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-brass/30 rounded-2xl p-6 max-w-md w-full max-h-[75vh] overflow-y-auto"
            >
              <h3 className="font-display text-xl font-medium mb-1">Fotoğraf Geçmişin</h3>
              <p className="text-xs text-slate-soft mb-5">Bu videoda gönderdiğin fotoğraflar ve pozisyon puanların</p>

              {gecmisYukleniyor && <p className="text-sm text-slate-soft text-center py-6">Yükleniyor...</p>}

              {!gecmisYukleniyor && gecmisVerisi.length === 0 && (
                <p className="text-sm text-slate-soft text-center py-6">Bu videoda henüz fotoğraf göndermemişsin.</p>
              )}

              {!gecmisYukleniyor && gecmisVerisi.length > 0 && (
                <div className="space-y-3">
                  {gecmisVerisi.map((g, i) => (
                    <div key={i} className="flex gap-3 bg-ink border border-white/5 rounded-lg p-3">
                      <img src={`https://localhost:7264${g.fotografUrl}`} alt="Geçmiş fotoğraf" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-soft">{tarihiFormatla(g.tarih)}</p>
                          {g.puan != null && (
                            <span className="font-practice text-[10px] px-1.5 py-0.5 rounded bg-brass/15 text-brass flex-shrink-0">{g.puan}/10</span>
                          )}
                        </div>
                        <p className="text-xs text-parchment/80 mt-1 line-clamp-2">{g.analizMetni}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setGecmisAcik(false)}
                className="w-full mt-5 bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft py-2.5 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- AÇMA DÜĞMESİ --- */}
      {!acikMi && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 font-body">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-brass/40 motion-safe:animate-ping" />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setAcikMi(true)}
              className="relative bg-gradient-to-br from-brass-soft to-brass hover:from-brass hover:to-brass-soft text-ink w-14 h-14 rounded-full shadow-[0_8px_30px_-8px_rgba(79,209,197,0.6)] flex items-center justify-center transition-colors"
            >
              <NotaIkonu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiAsistan;