import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bildirimGoster } from './bildirimSistemi';
import Yukleniyor from './Yukleniyor';

function AdminPanel() {
  const [kursBaslik, setKursBaslik] = useState("");
  const [kursAciklama, setKursAciklama] = useState("");
  const [kursFiyat, setKursFiyat] = useState("");
  const [kursResimUrl, setKursResimUrl] = useState("");
  const [duzenlenenKursId, setDuzenlenenKursId] = useState(null);

  const [videoBaslik, setVideoBaslik] = useState("");
  const [videoAciklama, setVideoAciklama] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDosya, setVideoDosya] = useState(null);
  const [videoSira, setVideoSira] = useState("");
  const [seciliKursId, setSeciliKursId] = useState("");
  const [duzenlenenVideoId, setDuzenlenenVideoId] = useState(null);

  const [kurslar, setKurslar] = useState([]);
  const [videolar, setVideolar] = useState([]);
  const [istatistikler, setIstatistikler] = useState(null);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [analizModalAcik, setAnalizModalAcik] = useState(false);
  const [onayModali, setOnayModali] = useState(null); // { mesaj, onOnayla } | null
  const [analizVerisi, setAnalizVerisi] = useState(null);
  const [analizYukleniyor, setAnalizYukleniyor] = useState(false);
  const [analizVideoId, setAnalizVideoId] = useState(null);
  const [aiOzetMetni, setAiOzetMetni] = useState('');
  const [aiOzetYukleniyor, setAiOzetYukleniyor] = useState(false);
  const [kursAnalizModalAcik, setKursAnalizModalAcik] = useState(false);
  const [kursAnalizVerisi, setKursAnalizVerisi] = useState(null);
  const [kursAnalizYukleniyor, setKursAnalizYukleniyor] = useState(false);
  const [ogrenciDetayModalAcik, setOgrenciDetayModalAcik] = useState(false);
  const [ogrenciDetayVerisi, setOgrenciDetayVerisi] = useState(null);
  const [ogrenciDetayYukleniyor, setOgrenciDetayYukleniyor] = useState(false);
  const [adminNotu, setAdminNotu] = useState('');
  const [adminNotuKaydediliyor, setAdminNotuKaydediliyor] = useState(false);
  const [referansFotoUrl, setReferansFotoUrl] = useState(null);
  const [referansFotoYukleniyor, setReferansFotoYukleniyor] = useState(false);
  const referansFotoInputRef = useRef(null);
  const [transkriptCikariliyor, setTranskriptCikariliyor] = useState(false);

  const token = localStorage.getItem("ogrenciYakaKarti");

  const kurslariGetir = () => {
    fetch("https://localhost:7264/api/Courses")
      .then(response => response.json())
      .then(data => setKurslar(data))
      .catch(error => console.log("Kurslar çekilemedi:", error));
  };

  const videolariGetir = () => {
    fetch("https://localhost:7264/api/Video", {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setVideolar(data))
      .catch(error => console.log("Videolar çekilemedi:", error));
  };

  useEffect(() => {
    kurslariGetir();
    videolariGetir();

    fetch("https://localhost:7264/api/Admin/istatistikler", {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setIstatistikler(data))
      .catch(error => console.log("İstatistikler çekilemedi:", error));

    fetch("https://localhost:7264/api/Admin/kullanicilar", {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setKullanicilar(data))
      .catch(error => console.log("Kullanıcılar çekilemedi:", error));
  }, []);

  // --- KURS EKLE / GÜNCELLE ---
  const kursKaydet = () => {
    const kursVerisi = {
      title: kursBaslik,
      description: kursAciklama,
      price: parseFloat(kursFiyat),
      imageUrl: kursResimUrl
    };

    const url = duzenlenenKursId
      ? `https://localhost:7264/api/Courses/duzenle/${duzenlenenKursId}`
      : "https://localhost:7264/api/Courses/ekle";
    const yontem = duzenlenenKursId ? 'PUT' : 'POST';

    fetch(url, {
      method: yontem,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(kursVerisi)
    })
      .then(response => {
        return response.text().then(mesaj => {
          if (!response.ok) throw new Error(mesaj);
          return mesaj;
        });
      })
      .then(() => {
        bildirimGoster(duzenlenenKursId ? "Kurs güncellendi!" : "Kurs başarıyla eklendi!", 'basari');
        kursFormuTemizle();
        kurslariGetir();
      })
      .catch(error => bildirimGoster(error.message, 'hata'));
  };

  const kursDuzenlemeyeBasla = (kurs) => {
    setDuzenlenenKursId(kurs.id);
    setKursBaslik(kurs.title);
    setKursAciklama(kurs.description);
    setKursFiyat(kurs.price);
    setKursResimUrl(kurs.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const kursFormuTemizle = () => {
    setDuzenlenenKursId(null);
    setKursBaslik("");
    setKursAciklama("");
    setKursFiyat("");
    setKursResimUrl("");
  };

  const kursSil = (id, baslik) => {
    setOnayModali({
      mesaj: `"${baslik}" kursunu silmek istediğine emin misin? Bu kurstaki tüm videolar da silinecek.`,
      onOnayla: () => {
        setOnayModali(null);
        fetch(`https://localhost:7264/api/Courses/sil/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(response => {
            return response.text().then(mesaj => {
              if (!response.ok) throw new Error(mesaj);
              return mesaj;
            });
          })
          .then(() => {
            setKurslar(prev => prev.filter(k => k.id !== id));
            videolariGetir();
          })
          .catch(error => bildirimGoster(error.message, 'hata'));
      }
    });
  };

  // --- VİDEO EKLE / GÜNCELLE ---
  const videoKaydet = () => {
    if (duzenlenenVideoId) {
      // Düzenleme modunda dosya yeniden yükleme desteklenmiyor, sadece JSON gönderiyoruz.
      const videoVerisi = {
        title: videoBaslik,
        aciklama: videoAciklama,
        orderNumber: parseInt(videoSira),
        videoUrl: videoUrl || null
      };

      fetch(`https://localhost:7264/api/Video/duzenle/${duzenlenenVideoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(videoVerisi)
      })
        .then(response => {
          return response.text().then(mesaj => {
            if (!response.ok) throw new Error(mesaj);
            return mesaj;
          });
        })
        .then(() => {
          bildirimGoster("Video güncellendi!", 'basari');
          videoFormuTemizle();
          videolariGetir();
        })
        .catch(error => bildirimGoster(error.message, 'hata'));
      return;
    }

    const formData = new FormData();
    formData.append("Title", videoBaslik);
    formData.append("Aciklama", videoAciklama);
    formData.append("OrderNumber", parseInt(videoSira));
    formData.append("CourseId", parseInt(seciliKursId));

    if (videoDosya) {
      formData.append("VideoDosyasi", videoDosya);
    } else if (videoUrl) {
      formData.append("VideoUrl", videoUrl);
    } else {
      bildirimGoster("Bir video dosyası seç ya da bir video URL'si gir.", 'hata');
      return;
    }

    fetch("https://localhost:7264/api/Video/ekle", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Dikkat: Content-Type BURADA YOK, kasıtlı olarak silindi
      },
      body: formData
    })
      .then(response => {
        return response.text().then(mesaj => {
          if (!response.ok) throw new Error(mesaj);
          return mesaj;
        });
      })
      .then(() => {
        bildirimGoster("Video başarıyla eklendi!", 'basari');
        videoFormuTemizle();
        videolariGetir();
      })
      .catch(error => bildirimGoster(error.message, 'hata'));
  };

  const videoDuzenlemeyeBasla = (video) => {
    setDuzenlenenVideoId(video.id);
    setVideoBaslik(video.baslik);
    setVideoAciklama(video.aciklama || '');
    setVideoUrl(video.videoUrl);
    setVideoDosya(null);
    setVideoSira(video.videoSirasi);
    setSeciliKursId(video.courseId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const videoFormuTemizle = () => {
    setDuzenlenenVideoId(null);
    setVideoBaslik("");
    setVideoAciklama("");
    setVideoUrl("");
    setVideoDosya(null);
    setVideoSira("");
    setSeciliKursId("");
  };

  const videoSil = (id, baslik) => {
    setOnayModali({
      mesaj: `"${baslik}" videosunu silmek istediğine emin misin?`,
      onOnayla: () => {
        setOnayModali(null);
        fetch(`https://localhost:7264/api/Video/sil/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(response => {
            return response.text().then(mesaj => {
              if (!response.ok) throw new Error(mesaj);
              return mesaj;
            });
          })
          .then(() => {
            setVideolar(prev => prev.filter(v => v.id !== id));
          })
          .catch(error => bildirimGoster(error.message, 'hata'));
      }
    });
  };

  const rolGuncelle = (id, yeniRol) => {
    fetch(`https://localhost:7264/api/Admin/kullanicilar/${id}/rol`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rol: yeniRol })
    })
      .then(response => {
        return response.text().then(mesaj => {
          if (!response.ok) throw new Error(mesaj);
          return mesaj;
        });
      })
      .then(() => {
        setKullanicilar(prev =>
          prev.map(k => k.id === id ? { ...k, role: yeniRol } : k)
        );
      })
      .catch(error => bildirimGoster(error.message, 'hata'));
  };

  const kullaniciSil = (id, isim) => {
    setOnayModali({
      mesaj: `${isim} adlı kullanıcıyı silmek istediğine emin misin?`,
      onOnayla: () => {
        setOnayModali(null);
        fetch(`https://localhost:7264/api/Admin/kullanicilar/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(response => {
            return response.text().then(mesaj => {
              if (!response.ok) throw new Error(mesaj);
              return mesaj;
            });
          })
      .then(() => {
        setKullanicilar(prev => prev.filter(k => k.id !== id));
      })
      .catch(error => bildirimGoster(error.message, 'hata'));
      }
    });
  };

  const inputStili = "w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-parchment placeholder:text-slate-soft/40 focus:outline-none focus:border-brass transition-colors font-body";
  const etiketStili = "font-practice text-xs tracking-wider text-brass/80 mb-1.5 block";
  // --- İZLEME ANALİZİ ---
  const analizGor = (videoId) => {
    setAnalizModalAcik(true);
    setAnalizYukleniyor(true);
    setAnalizVerisi(null);
    setAnalizVideoId(videoId);
    setAiOzetMetni(''); // farklı bir videoya bakınca eski özeti temizle
    setAdminNotu('');
    setReferansFotoUrl(null);

    fetch(`https://localhost:7264/api/Video/${videoId}/izleme-analiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setAnalizVerisi(data);
        setAnalizYukleniyor(false);
      })
      .catch(error => {
        console.log('Analiz çekilemedi:', error);
        setAnalizYukleniyor(false);
      });

    fetch(`https://localhost:7264/api/Video/${videoId}/admin-notu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setAdminNotu(data.notu || ''))
      .catch(error => console.log('Admin notu çekilemedi:', error));

    fetch(`https://localhost:7264/api/Video/${videoId}/referans-foto`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setReferansFotoUrl(data.referansFotoUrl || null))
      .catch(error => console.log('Referans fotoğraf çekilemedi:', error));
  };

  // Admin, bu videoya "doğru pozisyon" referans fotoğrafı yüklüyor — Cadenza öğrenci fotoğrafını buna kıyaslıyor
  const referansFotoSecildi = (e) => {
    const dosya = e.target.files[0];
    if (!dosya || !analizVideoId) return;

    setReferansFotoYukleniyor(true);
    const formData = new FormData();
    formData.append('referansFoto', dosya);

    fetch(`https://localhost:7264/api/Video/${analizVideoId}/referans-foto`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        setReferansFotoUrl(data.referansFotoUrl);
        setReferansFotoYukleniyor(false);
        bildirimGoster('Referans fotoğraf yüklendi.', 'basari');
      })
      .catch(error => {
        bildirimGoster('Referans fotoğraf yüklenemedi.', 'hata');
        setReferansFotoYukleniyor(false);
      });
  };

  // Video ilk yüklenirken transkript çıkarma başarısız olduysa admin buradan yeniden deneyebiliyor
  const transkriptYenidenCikar = () => {
    if (!analizVideoId) return;
    setTranskriptCikariliyor(true);

    fetch(`https://localhost:7264/api/Video/${analizVideoId}/transkript-yeniden-cikar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        return response.json().then(data => {
          if (!response.ok) throw new Error(data.mesaj || 'Transkript çıkarılamadı.');
          return data;
        });
      })
      .then(data => {
        setTranskriptCikariliyor(false);
        bildirimGoster(
          data.transkriptVarMi ? 'Transkript başarıyla çıkarıldı!' : 'Transkript denendi ama sonuç boş geldi.',
          data.transkriptVarMi ? 'basari' : 'hata'
        );
      })
      .catch(error => {
        setTranskriptCikariliyor(false);
        bildirimGoster(error.message, 'hata');
      });
  };

  // "AI Özet Oluştur" butonuna basınca çağrılıyor, Groq'a gidip döndüğü için biraz sürebilir
  const aiOzetOlustur = () => {
    if (!analizVideoId) return;

    setAiOzetYukleniyor(true);
    setAiOzetMetni('');

    fetch(`https://localhost:7264/api/Video/${analizVideoId}/izleme-ai-ozet`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setAiOzetMetni(data.ozet);
        setAiOzetYukleniyor(false);
      })
      .catch(error => {
        console.log('AI özeti alınamadı:', error);
        setAiOzetMetni('AI özeti alınırken bir sorun oluştu.');
        setAiOzetYukleniyor(false);
      });
  };

  // İzlenme yoğunluğu grafiğindeki bir çubuğa tıklanınca videoyu o saniyeden başlatacak şekilde yeni sekmede açıyoruz
  const videoyuSaniyedenAc = (baslangicSaniye) => {
    if (!analizVideoId) return;
    window.open(`/video/${analizVideoId}?start=${Math.floor(baslangicSaniye)}`, '_blank');
  };

  // Admin notu kaydetme
  const notuKaydet = () => {
    if (!analizVideoId) return;
    setAdminNotuKaydediliyor(true);

    fetch(`https://localhost:7264/api/Video/${analizVideoId}/admin-notu`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notu: adminNotu })
    })
      .then(() => setAdminNotuKaydediliyor(false))
      .catch(error => {
        console.log('Not kaydedilemedi:', error);
        setAdminNotuKaydediliyor(false);
      });
  };

  // Analiz verisini CSV olarak indirme
  const csvIndir = () => {
    if (!analizVerisi) return;

    let csv = 'Ogrenci,Yuzde,Tamamlandi\n';
    analizVerisi.ogrenciler.forEach(o => {
      csv += `"${o.ogrenciAdi}",${o.yuzde},${o.tamamlandiMi ? 'Evet' : 'Hayir'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analizVerisi.videoBaslik}-analiz.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // --- ÖĞRENCİ DETAYI (drill-down): bir öğrencinin kurstaki TÜM videolardaki ilerlemesi ---
  const ogrenciDetayGor = (userId) => {
    if (!analizVerisi) return;
    setOgrenciDetayModalAcik(true);
    setOgrenciDetayYukleniyor(true);
    setOgrenciDetayVerisi(null);

    fetch(`https://localhost:7264/api/Video/ogrenci-detay/${userId}/${analizVerisi.courseId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setOgrenciDetayVerisi(data);
        setOgrenciDetayYukleniyor(false);
      })
      .catch(error => {
        console.log('Öğrenci detayı çekilemedi:', error);
        setOgrenciDetayYukleniyor(false);
      });
  };

  // --- KURS GENELİ KARŞILAŞTIRMA ---
  const kursAnalizGor = (courseId) => {
    setKursAnalizModalAcik(true);
    setKursAnalizYukleniyor(true);
    setKursAnalizVerisi(null);

    fetch(`https://localhost:7264/api/Video/kurs-analiz/${courseId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setKursAnalizVerisi(data);
        setKursAnalizYukleniyor(false);
      })
      .catch(error => {
        console.log('Kurs analizi çekilemedi:', error);
        setKursAnalizYukleniyor(false);
      });
  };

  // Saniyeyi "1:05" gibi dakika:saniye formatına çeviriyor (grafik etiketleri için)
  const saniyeyiFormatla = (saniye) => {
    const dakika = Math.floor(saniye / 60);
    const kalanSaniye = Math.floor(saniye % 60);
    return `${dakika}:${kalanSaniye.toString().padStart(2, '0')}`;
  };
  const kursAdiBul = (courseId) => {
    const kurs = kurslar.find(k => k.id === courseId);
    return kurs ? kurs.title : "Bilinmeyen Kurs";
  };

  return (
    <div className="min-h-screen bg-ink bg-blueprint text-parchment font-body px-6 py-16">
      <div className="max-w-2xl mx-auto">

        <span className="font-practice text-xs tracking-[0.3em] uppercase text-slate-soft block mb-2">
          system // yönetim paneli
        </span>
        <h2 className="font-display text-3xl font-medium mb-10">
          <span className="text-brass">[</span> Admin Paneli <span className="text-brass">]</span>
        </h2>

        {istatistikler && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-panel border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-display text-brass">{istatistikler.toplamOgrenci}</p>
              <p className="text-xs text-slate-soft mt-1">Öğrenci</p>
            </div>
            <div className="bg-panel border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-display text-brass">{istatistikler.toplamKurs}</p>
              <p className="text-xs text-slate-soft mt-1">Kurs</p>
            </div>
            <div className="bg-panel border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-display text-brass">{istatistikler.toplamSatis}</p>
              <p className="text-xs text-slate-soft mt-1">Satış</p>
            </div>
            <div className="bg-panel border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-display text-brass">{istatistikler.toplamGelir.toLocaleString('tr-TR')}₺</p>
              <p className="text-xs text-slate-soft mt-1">Gelir</p>
            </div>
          </motion.div>
        )}

        {/* --- KURS EKLE / DÜZENLE --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-practice text-sm tracking-wider text-parchment">
              &gt; {duzenlenenKursId ? "KURSU_DUZENLE" : "YENİ_KURS_EKLE"}
            </h3>
            {duzenlenenKursId && (
              <button
                onClick={kursFormuTemizle}
                className="text-xs text-slate-soft hover:text-brass transition-colors"
              >
                İptal / Yeni Ekle
              </button>
            )}
          </div>

          <label className={etiketStili}>&gt; kurs_basligi</label>
          <input
            type="text"
            placeholder="Örn: Piyano Temelleri"
            value={kursBaslik}
            onChange={(e) => setKursBaslik(e.target.value)}
            className={`${inputStili} mb-4`}
          />

          <label className={etiketStili}>&gt; aciklama</label>
          <textarea
            placeholder="Kurs hakkında kısa bir açıklama"
            value={kursAciklama}
            onChange={(e) => setKursAciklama(e.target.value)}
            className={`${inputStili} mb-4 min-h-[80px] resize-y`}
          />

          <label className={etiketStili}>&gt; fiyat_tl</label>
          <input
            type="number"
            placeholder="250"
            value={kursFiyat}
            onChange={(e) => setKursFiyat(e.target.value)}
            className={`${inputStili} mb-4`}
          />

          <label className={etiketStili}>&gt; resim_url</label>
          <input
            type="text"
            placeholder="https://..."
            value={kursResimUrl}
            onChange={(e) => setKursResimUrl(e.target.value)}
            className={`${inputStili} mb-6`}
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={kursKaydet}
            className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors"
          >
            {duzenlenenKursId ? "Kursu Güncelle" : "Kursu Kaydet"}
          </motion.button>
        </motion.div>

        {/* --- KURS LİSTESİ --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mb-8"
        >
          <h3 className="font-practice text-sm tracking-wider text-parchment mb-6">
            &gt; KURSLAR ({kurslar.length})
          </h3>

          <div className="space-y-3">
            {kurslar.map((kurs) => (
              <div
                key={kurs.id}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 flex-wrap"
              >
                <div>
                  <p className="text-parchment text-sm">{kurs.title}</p>
                  <p className="text-slate-soft text-xs">{kurs.price}₺</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => kursAnalizGor(kurs.id)}
                    className="text-slate-soft hover:text-brass text-sm transition-colors"
                  >
                    Kurs Analizi
                  </button>
                  <button
                    onClick={() => kursDuzenlemeyeBasla(kurs)}
                    className="text-brass hover:text-brass-soft text-sm transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => kursSil(kurs.id, kurs.title)}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- VİDEO EKLE / DÜZENLE --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-panel border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-practice text-sm tracking-wider text-parchment">
              &gt; {duzenlenenVideoId ? "VIDEOYU_DUZENLE" : "YENİ_VIDEO_EKLE"}
            </h3>
            {duzenlenenVideoId && (
              <button
                onClick={videoFormuTemizle}
                className="text-xs text-slate-soft hover:text-brass transition-colors"
              >
                İptal / Yeni Ekle
              </button>
            )}
          </div>

          <label className={etiketStili}>&gt; kurs_sec</label>
          <select
            value={seciliKursId}
            onChange={(e) => setSeciliKursId(e.target.value)}
            disabled={!!duzenlenenVideoId}
            className={`${inputStili} mb-4 ${duzenlenenVideoId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">-- Kurs Seç --</option>
            {kurslar.map((kurs) => (
              <option key={kurs.id} value={kurs.id}>{kurs.title}</option>
            ))}
          </select>
          {duzenlenenVideoId && (
            <p className="text-xs text-slate-soft/60 -mt-3 mb-4">
              Düzenleme modunda kurs değiştirilemez, videoyu silip yeniden ekle.
            </p>
          )}

          <label className={etiketStili}>&gt; video_basligi</label>
          <input
            type="text"
            placeholder="Örn: 1. Ders - Notaları Tanıyalım"
            value={videoBaslik}
            onChange={(e) => setVideoBaslik(e.target.value)}
            className={`${inputStili} mb-4`}
          />

          <label className={etiketStili}>&gt; video_aciklamasi</label>
          <textarea
            placeholder="Örn: Bu derste piyanoda nota okumanın temellerini öğreneceğiz..."
            value={videoAciklama}
            onChange={(e) => setVideoAciklama(e.target.value)}
            className={`${inputStili} mb-4 min-h-[70px] resize-y`}
          />

          <label className={etiketStili}>&gt; video_url</label>
          <input
            type="text"
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={`${inputStili} mb-4`}
          />

          {!duzenlenenVideoId && (
            <>
              <label className={etiketStili}>&gt; video_dosyasi</label>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(e) => setVideoDosya(e.target.files[0])}
                className={`${inputStili} mb-4`}
              />
              <p className="text-xs text-slate-soft/60 -mt-3 mb-4">
                Dosya seçersen video_url alanı yok sayılır.
              </p>
            </>
          )}

          <label className={etiketStili}>&gt; sira_no</label>
          <input
            type="number"
            placeholder="1, 2, 3..."
            value={videoSira}
            onChange={(e) => setVideoSira(e.target.value)}
            className={`${inputStili} mb-6`}
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={videoKaydet}
            className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors"
          >
            {duzenlenenVideoId ? "Videoyu Güncelle" : "Videoyu Kaydet"}
          </motion.button>
        </motion.div>

        {/* --- VİDEO LİSTESİ --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mt-8"
        >
          <h3 className="font-practice text-sm tracking-wider text-parchment mb-6">
            &gt; VIDEOLAR ({videolar.length})
          </h3>

          <div className="space-y-3">
            {videolar.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 flex-wrap"
              >
                <div>
                  <p className="text-parchment text-sm">{video.baslik}</p>
                  <p className="text-slate-soft text-xs">
                    {kursAdiBul(video.courseId)} — Aşama {video.videoSirasi}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => analizGor(video.id)}
                    className="text-slate-soft hover:text-brass text-sm transition-colors"
                  >
                    Analiz Gör
                  </button>
                  <button
                    onClick={() => videoDuzenlemeyeBasla(video)}
                    className="text-brass hover:text-brass-soft text-sm transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => videoSil(video.id, video.baslik)}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- KULLANICI YÖNETİMİ --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-panel border border-white/5 rounded-xl p-6 mt-8"
        >
          <h3 className="font-practice text-sm tracking-wider text-parchment mb-6">
            &gt; KULLANICI_YONETIMI ({kullanicilar.length})
          </h3>

          <div className="space-y-3">
            {kullanicilar.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 flex-wrap"
              >
                <div>
                  <p className="text-parchment text-sm">{k.name} {k.lastName}</p>
                  <p className="text-slate-soft text-xs">{k.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={k.role}
                    onChange={(e) => rolGuncelle(k.id, e.target.value)}
                    className="bg-ink border border-white/10 rounded-lg px-2 py-1.5 text-sm text-parchment focus:outline-none focus:border-brass"
                  >
                    <option value="ogrenci">ogrenci</option>
                    <option value="Admin">Admin</option>
                  </select>

                  <button
                    onClick={() => kullaniciSil(k.id, `${k.name} ${k.lastName}`)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1.5 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
      {/* --- İZLEME ANALİZ MODALI --- */}
      <AnimatePresence>
        {analizModalAcik && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAnalizModalAcik(false)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-brass/30 rounded-2xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            >
              {analizYukleniyor && (
                <div className="py-8"><Yukleniyor mesaj="Analiz yükleniyor..." tamSayfa={false} /></div>
              )}

              {!analizYukleniyor && analizVerisi && (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display text-xl font-medium">{analizVerisi.videoBaslik}</h3>
                    <button
                      onClick={csvIndir}
                      className="text-xs text-slate-soft hover:text-brass transition-colors whitespace-nowrap ml-3"
                    >
                      CSV İndir
                    </button>
                  </div>
                  <p className="text-xs text-slate-soft mb-6">İzleme Analizi</p>

                  <div className="grid grid-cols-4 gap-3 mb-2">
                    <div className="bg-ink border border-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-display text-brass">{analizVerisi.izleyenSayisi}</p>
                      <p className="text-xs text-slate-soft mt-1">İzleyen</p>
                    </div>
                    <div className="bg-ink border border-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-display text-brass">{analizVerisi.tamamlayanSayisi}</p>
                      <p className="text-xs text-slate-soft mt-1">Tamamlayan</p>
                    </div>
                    <div className="bg-ink border border-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-display text-brass">%{analizVerisi.ortalamaTamamlanmaYuzdesi}</p>
                      <p className="text-xs text-slate-soft mt-1">Ort. İlerleme</p>
                    </div>
                    <div className="bg-ink border border-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-display text-brass">
                        {Math.round(analizVerisi.toplamIzlemeSaniyesi / 60)} dk
                      </p>
                      <p className="text-xs text-slate-soft mt-1">Toplam İzleme</p>
                    </div>
                  </div>

                  {analizVerisi.kursOrtalamasi != null && (
                    <p className={`text-xs mb-6 ${
                      analizVerisi.ortalamaTamamlanmaYuzdesi >= analizVerisi.kursOrtalamasi ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Kurs ortalaması: %{analizVerisi.kursOrtalamasi}
                      {' '}— bu video ortalamanın {analizVerisi.ortalamaTamamlanmaYuzdesi >= analizVerisi.kursOrtalamasi ? 'üstünde' : 'altında'}
                    </p>
                  )}

                  {/* --- İZLENME YOĞUNLUĞU GRAFİĞİ: video boyunca hangi bölüm ne kadar izlenmiş --- */}
                  {analizVerisi.bucketSayisi > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-practice tracking-wider text-brass/80 mb-2">
                        &gt; izlenme_yogunlugu
                      </p>
                      <div className="flex items-end gap-[2px] h-16 bg-ink rounded-lg p-2 pt-4 relative">
                        {analizVerisi.yogunlukYuzdeleri.map((yuzde, i) => {
                          const duraklamaSayisi = analizVerisi.duraklamaSayilari[i] || 0;
                          return (
                            <button
                              key={i}
                              onClick={() => videoyuSaniyedenAc(i * analizVerisi.bucketSaniye)}
                              title={`${saniyeyiFormatla(i * analizVerisi.bucketSaniye)} — %${yuzde} izlendi${duraklamaSayisi > 0 ? `, ${duraklamaSayisi} kez duraklatıldı` : ''} (tıkla, videoyu buradan aç)`}
                              className="flex-1 relative h-full flex items-end cursor-pointer group"
                            >
                              {duraklamaSayisi > 0 && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400" />
                              )}
                              <div
                                className="w-full bg-brass rounded-sm group-hover:bg-brass-soft transition-colors"
                                style={{ height: `${Math.max(yuzde, 3)}%`, opacity: 0.35 + (yuzde / 100) * 0.65 }}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-soft/60 mt-1">
                        <span>0:00</span>
                        <span>{saniyeyiFormatla(analizVerisi.bucketSayisi * analizVerisi.bucketSaniye)}</span>
                      </div>
                      <p className="text-[10px] text-slate-soft/50 mt-1">
                        Çubuk ne kadar kısa/soluksa o kadar az izlenmiş. Kırmızı nokta = duraklama noktası. Bir çubuğa tıklayınca video o saniyeden açılır.
                      </p>
                    </div>
                  )}

                  {/* --- EN ÇOK DURAKLATILAN ANLAR --- */}
                  {analizVerisi.duraklamaSayilari.some(sayi => sayi > 0) && (
                    <div className="mb-6">
                      <p className="text-xs font-practice tracking-wider text-brass/80 mb-2">
                        &gt; en_cok_duraklatilan_anlar
                      </p>
                      <div className="space-y-1.5">
                        {analizVerisi.duraklamaSayilari
                          .map((sayi, i) => ({ bucketIndex: i, sayi }))
                          .filter(d => d.sayi > 0)
                          .sort((a, b) => b.sayi - a.sayi)
                          .slice(0, 3)
                          .map((d) => (
                            <div key={d.bucketIndex} className="flex items-center justify-between text-xs">
                              <span className="text-parchment">
                                {saniyeyiFormatla(d.bucketIndex * analizVerisi.bucketSaniye)} dakikası
                              </span>
                              <span className="text-slate-soft">{d.sayi} kez duraklatıldı</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* --- GÜNLÜK YENİ İZLEYEN TRENDİ --- */}
                  {analizVerisi.gunlukTrend && analizVerisi.gunlukTrend.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-practice tracking-wider text-brass/80 mb-2">
                        &gt; gunluk_yeni_izleyen_trendi
                      </p>
                      <div className="flex items-end gap-1.5 h-14 bg-ink rounded-lg p-2">
                        {analizVerisi.gunlukTrend.map((gun, i) => {
                          const enYuksek = Math.max(...analizVerisi.gunlukTrend.map(g => g.yeniIzleyenSayisi));
                          const yukseklikYuzde = enYuksek > 0 ? (gun.yeniIzleyenSayisi / enYuksek) * 100 : 0;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                              <span className="text-[9px] text-slate-soft mb-0.5">{gun.yeniIzleyenSayisi}</span>
                              <div
                                title={`${gun.tarih}: ${gun.yeniIzleyenSayisi} yeni izleyen`}
                                className="w-full bg-brass rounded-sm"
                                style={{ height: `${Math.max(yukseklikYuzde, 8)}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {analizVerisi.gunlukTrend.map((gun, i) => (
                          <span key={i} className="flex-1 text-[9px] text-slate-soft/60 text-center">{gun.tarih}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- ADMİN NOTU --- */}
                  <div className="mb-6">
                    <p className="text-xs font-practice tracking-wider text-brass/80 mb-2">
                      &gt; admin_notu
                    </p>
                    <textarea
                      value={adminNotu}
                      onChange={(e) => setAdminNotu(e.target.value)}
                      placeholder="Örn: 1:30'daki kısım kafa karıştırıyor olabilir, yeniden çekmeyi düşün..."
                      className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2 text-sm text-parchment placeholder:text-slate-soft/40 focus:outline-none focus:border-brass transition-colors min-h-[60px] resize-y mb-2"
                    />
                    <button
                      onClick={notuKaydet}
                      disabled={adminNotuKaydediliyor}
                      className="text-xs text-brass hover:text-brass-soft transition-colors disabled:opacity-50"
                    >
                      {adminNotuKaydediliyor ? 'Kaydediliyor...' : 'Notu Kaydet'}
                    </button>
                  </div>

                  {/* --- REFERANS FOTOĞRAF: Cadenza öğrenci fotoğrafını buna kıyaslıyor --- */}
                  <div className="mb-6">
                    <p className="text-xs font-practice tracking-wider text-brass/80 mb-2">
                      &gt; referans_fotograf
                    </p>
                    <p className="text-[11px] text-slate-soft/70 mb-2">
                      "Doğru pozisyon" fotoğrafı yükle, Cadenza öğrenci fotoğraflarını buna kıyaslasın.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={referansFotoInputRef}
                      onChange={referansFotoSecildi}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      {referansFotoUrl && (
                        <img
                          src={`https://localhost:7264${referansFotoUrl}`}
                          alt="Referans pozisyon"
                          className="w-14 h-14 rounded-lg object-cover border border-brass/30"
                        />
                      )}
                      <button
                        onClick={() => referansFotoInputRef.current.click()}
                        disabled={referansFotoYukleniyor}
                        className="text-xs text-brass hover:text-brass-soft transition-colors disabled:opacity-50"
                      >
                        {referansFotoYukleniyor ? 'Yükleniyor...' : referansFotoUrl ? 'Değiştir' : 'Fotoğraf Yükle'}
                      </button>
                    </div>
                  </div>

                  {/* --- TRANSKRİPT YENİDEN ÇIKARMA --- */}
                  <div className="mb-6">
                    <p className="text-xs font-practice tracking-wider text-brass/80 mb-2">
                      &gt; transkript
                    </p>
                    <p className="text-[11px] text-slate-soft/70 mb-2">
                      Bölüm şeridi ve Cadenza'nın video içeriğini bilmesi için gerekli. Yükleme sırasında çıkmadıysa buradan yeniden dene.
                    </p>
                    <button
                      onClick={transkriptYenidenCikar}
                      disabled={transkriptCikariliyor}
                      className="text-xs text-brass hover:text-brass-soft transition-colors disabled:opacity-50"
                    >
                      {transkriptCikariliyor ? 'Çıkarılıyor (biraz sürebilir)...' : 'Transkripti (Yeniden) Çıkar'}
                    </button>
                  </div>

                  {/* --- AI ÖZET --- */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-practice tracking-wider text-brass/80">
                        &gt; ai_ozet
                      </p>
                      {!aiOzetMetni && !aiOzetYukleniyor && (
                        <button
                          onClick={aiOzetOlustur}
                          className="text-xs text-brass hover:text-brass-soft transition-colors"
                        >
                          Cadenza'ya Sor
                        </button>
                      )}
                    </div>

                    {aiOzetYukleniyor && (
                      <p className="text-xs text-slate-soft/70 italic">Cadenza grafiği inceliyor...</p>
                    )}

                    {aiOzetMetni && !aiOzetYukleniyor && (
                      <div className="bg-ink border border-brass/20 rounded-lg p-3">
                        <p className="text-sm text-parchment leading-relaxed">{aiOzetMetni}</p>
                      </div>
                    )}
                  </div>

                  {analizVerisi.ogrenciler.length === 0 ? (
                    <p className="text-slate-soft text-sm text-center py-4">
                      Bu videoyu henüz kimse izlememiş.
                    </p>
                  ) : (
                    (() => {
                      // En hızlı tamamlayan: tamamlayanlar arasında en kısa sürede bitiren (saat cinsinden)
                      const tamamlayanlar = analizVerisi.ogrenciler.filter(o => o.tamamlandiMi && o.tamamlamaSuresiSaat != null);
                      const enHizliTamamlayan = tamamlayanlar.length > 0
                        ? tamamlayanlar.reduce((en, o) => o.tamamlamaSuresiSaat < en.tamamlamaSuresiSaat ? o : en)
                        : null;

                      return (
                        <div className="space-y-4">
                          <p className="text-xs font-practice tracking-wider text-brass/80">
                            &gt; ogrenci_bazli_ilerleme
                          </p>
                          {analizVerisi.ogrenciler.map((o, i) => {
                            // Bu öğrenci gerçekte içeriğin ne kadarını görmüş (en ileri gittiği noktaya göre) — çok atlamışsa uyarı rozeti
                            const kapsamOrani = o.yuzde > 0 ? (o.gercekIzlenenSaniye / ((o.yuzde / 100) * (analizVerisi.bucketSayisi * analizVerisi.bucketSaniye))) : 1;
                            const cokAtlamis = o.yuzde > 20 && kapsamOrani < 0.6;

                            return (
                              <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                  <button
                                    onClick={() => ogrenciDetayGor(o.userId)}
                                    className="text-sm text-parchment hover:text-brass transition-colors text-left"
                                  >
                                    {o.ogrenciAdi}
                                    {o === enHizliTamamlayan && <span className="ml-1.5 text-[10px] text-brass" title="En hızlı tamamlayan">⚡</span>}
                                    {cokAtlamis && <span className="ml-1.5 text-[10px] text-slate-soft" title="İçeriğin büyük kısmını atlamış">⏭️</span>}
                                  </button>
                                  <span className="text-xs text-slate-soft">
                                    %{o.yuzde} {o.tamamlandiMi && '✓'}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-ink rounded-full overflow-hidden mb-1">
                                  <div
                                    className={`h-full rounded-full ${o.tamamlandiMi ? 'bg-brass' : 'bg-brass/50'}`}
                                    style={{ width: `${o.yuzde}%` }}
                                  />
                                </div>
                                {/* Öğrencinin hangi bölümleri izleyip hangilerini atladığını gösteren mini şerit */}
                                <div className="flex gap-[1px] h-2">
                                  {o.bucketlar.split('').map((deger, j) => (
                                    <div
                                      key={j}
                                      className={`flex-1 rounded-[1px] ${deger === '1' ? 'bg-brass/40' : 'bg-white/5'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </>
              )}

              <button
                onClick={() => setAnalizModalAcik(false)}
                className="w-full mt-6 bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft py-2.5 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- KURS GENELİ KARŞILAŞTIRMA MODALI --- */}
      <AnimatePresence>
        {kursAnalizModalAcik && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setKursAnalizModalAcik(false)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-brass/30 rounded-2xl p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto"
            >
              {kursAnalizYukleniyor && (
                <div className="py-8"><Yukleniyor mesaj="Kurs analizi yükleniyor..." tamSayfa={false} /></div>
              )}

              {!kursAnalizYukleniyor && kursAnalizVerisi && (
                <>
                  <h3 className="font-display text-xl font-medium mb-1">{kursAnalizVerisi.kursBaslik}</h3>
                  <p className="text-xs text-slate-soft mb-6">Kurs Geneli Karşılaştırma</p>

                  {kursAnalizVerisi.videolar.length === 0 ? (
                    <p className="text-slate-soft text-sm text-center py-4">
                      Bu kursta henüz video yok.
                    </p>
                  ) : (
                    (() => {
                      // En düşük tamamlanma oranına sahip video, "en çok terk edilen" olarak öne çıkarılıyor
                      const izlenenler = kursAnalizVerisi.videolar.filter(v => v.izleyenSayisi > 0);
                      const enCokTerkEdilen = izlenenler.length > 0
                        ? izlenenler.reduce((en, v) => v.ortalamaTamamlanmaYuzdesi < en.ortalamaTamamlanmaYuzdesi ? v : en)
                        : null;

                      const siraliVideolar = [...kursAnalizVerisi.videolar].sort(
                        (a, b) => a.ortalamaTamamlanmaYuzdesi - b.ortalamaTamamlanmaYuzdesi
                      );

                      return (
                        <div className="space-y-4">
                          {enCokTerkEdilen && (
                            <div className="bg-ink border border-red-400/20 rounded-lg p-3 mb-2">
                              <p className="text-xs text-red-400">
                                En çok terk edilen: <span className="text-parchment">{enCokTerkEdilen.videoBaslik}</span>
                                {' '}(%{enCokTerkEdilen.ortalamaTamamlanmaYuzdesi} ortalama ilerleme)
                              </p>
                            </div>
                          )}

                          {siraliVideolar.map((v) => (
                            <button
                              key={v.videoId}
                              onClick={() => {
                                setKursAnalizModalAcik(false);
                                analizGor(v.videoId);
                              }}
                              disabled={v.izleyenSayisi === 0}
                              className={`w-full text-left ${v.izleyenSayisi === 0 ? 'cursor-not-allowed' : 'cursor-pointer group'}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm text-parchment ${v.izleyenSayisi > 0 ? 'group-hover:text-brass transition-colors' : ''}`}>
                                  {v.videoSirasi}. {v.videoBaslik}
                                </span>
                                <span className="text-xs text-slate-soft">
                                  %{v.ortalamaTamamlanmaYuzdesi} · {v.izleyenSayisi} izleyen
                                </span>
                              </div>
                              <div className="w-full h-2 bg-ink rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    v.izleyenSayisi === 0
                                      ? 'bg-white/5'
                                      : v === enCokTerkEdilen
                                        ? 'bg-red-400/60'
                                        : 'bg-brass/60'
                                  }`}
                                  style={{ width: `${v.ortalamaTamamlanmaYuzdesi}%` }}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </>
              )}

              <button
                onClick={() => setKursAnalizModalAcik(false)}
                className="w-full mt-6 bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft py-2.5 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ÖĞRENCİ DETAYI (DRILL-DOWN) MODALI --- */}
      <AnimatePresence>
        {ogrenciDetayModalAcik && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOgrenciDetayModalAcik(false)}
            className="fixed inset-0 bg-black/80 flex items-center justify-center px-6 z-[60]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-brass/30 rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              {ogrenciDetayYukleniyor && (
                <div className="py-8"><Yukleniyor mesaj="Öğrenci detayı yükleniyor..." tamSayfa={false} /></div>
              )}

              {!ogrenciDetayYukleniyor && ogrenciDetayVerisi && (
                <>
                  <h3 className="font-display text-xl font-medium mb-1">{ogrenciDetayVerisi.ogrenciAdi}</h3>
                  <p className="text-xs text-slate-soft mb-6">Kurstaki Genel İlerleme</p>

                  <div className="space-y-3">
                    {ogrenciDetayVerisi.videolar.map((v, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                        <span className="text-sm text-parchment">
                          {v.videoSirasi}. {v.videoBaslik}
                        </span>
                        <span className={`text-xs whitespace-nowrap ${v.izlemisMi ? 'text-slate-soft' : 'text-slate-soft/40'}`}>
                          {v.izlemisMi ? `%${v.yuzde} ${v.tamamlandiMi ? '✓' : ''}` : 'İzlememiş'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setOgrenciDetayModalAcik(false)}
                className="w-full mt-6 bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft py-2.5 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SİLME ONAY MODALI: native confirm() yerine markaya uygun bir pencere --- */}
      <AnimatePresence>
        {onayModali && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOnayModali(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6 z-[100]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-red-400/25 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <span className="text-red-400 text-xl">!</span>
              </div>
              <h3 className="font-display text-lg font-medium mb-2">Bunu yapmadan önce emin ol</h3>
              <p className="text-sm text-slate-soft mb-6 leading-relaxed">{onayModali.mesaj}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setOnayModali(null)}
                  className="flex-1 bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft py-2.5 rounded-lg transition-colors text-sm"
                >
                  Vazgeç
                </button>
                <button
                  onClick={onayModali.onOnayla}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPanel;