import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GeminiAsistan from './GeminiAsistan';
import { bildirimGoster } from './bildirimSistemi';
import Yukleniyor from './Yukleniyor';

// Backend ile aynı değer olmalı: videoyu kaçar saniyelik dilimlere ("bucket") bölüyoruz.
// Bu, ham depolama çözünürlüğü — admin panelindeki grafik, video süresine göre bunları otomatik gruplayıp gösteriyor.
const BUCKET_SANIYE = 5;

// Transkript metnini "[mm:ss-mm:ss] cümle" satırlarından, tıklanabilir bölüm şeridi için ayrıştırıyoruz.
const transkriptSegmentleriniAyristir = (transcriptMetni) => {
  if (!transcriptMetni) return [];
  const satirDeseni = /\[(\d+):(\d+)-(\d+):(\d+)\]\s*(.*)/;
  return transcriptMetni
    .split('\n')
    .map(satir => satir.match(satirDeseni))
    .filter(Boolean)
    .map(eslesme => ({
      baslangicSaniye: parseInt(eslesme[1]) * 60 + parseInt(eslesme[2]),
      bitisSaniye: parseInt(eslesme[3]) * 60 + parseInt(eslesme[4]),
      metin: eslesme[5].trim()
    }));
};

// Basit, jenerik player ikonları (marka/telif içermeyen geometrik SVG'ler)
const OynatIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z" /></svg>
);
const DurdurIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
);
const SesIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 10v4h4l5 5V5L7 10H3z" />
    <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06c1.5-.74 2.5-2.26 2.5-4.03z" />
  </svg>
);
const SessizIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 10v4h4l5 5V5L7 10H3z" />
    <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M15.5 9.5l4 5m0-5l-4 5" />
  </svg>
);
const TamEkranIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 14H5v5h5v-2H7v-3zM5 10h2V7h3V5H5v5zM17 17h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);
const GeriSarIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11 5v14l-8-7z" /><path d="M20 5v14l-8-7z" />
  </svg>
);
const IleriSarIkonu = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 5v14l8-7z" /><path d="M4 5v14l8-7z" />
  </svg>
);

// Saniyeyi "1:05" formatına çeviriyor (özel kontrol çubuğunda süre gösterimi için)
const sureyiFormatla = (saniye) => {
  if (!saniye || isNaN(saniye)) return '0:00';
  const dk = Math.floor(saniye / 60);
  const sn = Math.floor(saniye % 60);
  return `${dk}:${sn.toString().padStart(2, '0')}`;
};

const VideoDetay = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [video, setVideo] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hataMesaji, setHataMesaji] = useState('');
  const [favoriMi, setFavoriMi] = useState(false);
  const [videoBitti, setVideoBitti] = useState(false);
  const [rozetModalAcik, setRozetModalAcik] = useState(false);
  const [kazanilanKursAdi, setKazanilanKursAdi] = useState('');
  const [aktifSegmentIndex, setAktifSegmentIndex] = useState(-1);
  const [oynatiliyorMu, setOynatiliyorMu] = useState(false);
  const [suankiSaniye, setSuankiSaniye] = useState(0);
  const [toplamSure, setToplamSure] = useState(0);
  const [sessizMi, setSessizMi] = useState(false);
  const [hiz, setHiz] = useState(1);
  const [hizMenuAcik, setHizMenuAcik] = useState(false);
  const [abLoop, setAbLoop] = useState({ a: null, b: null });
  const [sonKonum, setSonKonum] = useState(0);
  const [kursVideolari, setKursVideolari] = useState([]);
  const [kontrollerGorunur, setKontrollerGorunur] = useState(true);
  const [pratikNotu, setPratikNotu] = useState('');
  const [pratikNotuYukleniyor, setPratikNotuYukleniyor] = useState(false);
  const videoRef = useRef(null);
  const gizlemeZamanlayici = useRef(null);
  const sonGonderilenSaniye = useRef(0);
  const izlenenBucketlar = useRef([]); // bu oturumda hangi dilimlerin izlendiği (boolean dizi)
  const yeniDuraklamalar = useRef([]); // son gönderimden bu yana duraklanan dilim index'leri
  const navigate = useNavigate();

  // Sayfaya her girdiğinde bu öğrencinin bu videoda en son kaldığı saniyeyi çekiyoruz ("kaldığın yerden devam et" için)
  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Video/${id}/son-konum`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setSonKonum(data.sonSaniye || 0))
      .catch(error => console.log('Son konum çekilemedi:', error));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Video/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.status === 403) {
          throw new Error('Bu video henüz kilitli, önce önceki videoları tamamlamalısın.');
        }
        if (!response.ok) {
          throw new Error('Video yüklenirken bir hata oluştu.');
        }
        return response.json();
      })
      .then(data => {
        setVideo(data);
        setYukleniyor(false);
      })
      .catch(error => {
        setHataMesaji(error.message);
        setYukleniyor(false);
      });
  }, [id]);

  // Bu video favorilerde mi diye kontrol ediyoruz (favoriler listesini çekip içinde arıyoruz)
  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch('https://localhost:7264/api/Favori', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const buVideoFavoriMi = data.some(v => v.id === Number(id));
        setFavoriMi(buVideoFavoriMi);
      })
      .catch(error => {
        console.log('Favori durumu kontrol edilemedi:', error);
      });
  }, [id]);

  // video değişince "bitti" durumunu sıfırlıyoruz (başka videoya geçildiğinde buton tekrar pasif olsun)
  useEffect(() => {
    setVideoBitti(false);
    // Yeni videoya geçince izleme takibini de sıfırlıyoruz (bir önceki videonun verisi karışmasın)
    izlenenBucketlar.current = [];
    yeniDuraklamalar.current = [];
    sonGonderilenSaniye.current = 0;
  }, [id]);

  // Klavye kontrolü: Enter -> oynat, Space -> durdur, ←/→ -> 5sn sar (sadece yerel video için, YouTube iframe'e JS'ten erişilemiyor)
  useEffect(() => {
    const tusaBasildi = (e) => {
      if (!videoRef.current) return;

      // input/textarea içindeyken tetiklenmesin
      const aktifEleman = document.activeElement.tagName;
      if (aktifEleman === 'INPUT' || aktifEleman === 'TEXTAREA') return;

      if (e.code === 'Enter') {
        e.preventDefault();
        videoRef.current.play();
      } else if (e.code === 'Space') {
        e.preventDefault();
        videoRef.current.pause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        videoRef.current.currentTime = Math.min(
          videoRef.current.duration || Infinity,
          videoRef.current.currentTime + 5
        );
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      }
    };

    window.addEventListener('keydown', tusaBasildi);
    return () => window.removeEventListener('keydown', tusaBasildi);
  }, [video]);

  // İzleme analitiği: video oynarken her ~10 saniyede bir "nerede kaldı" bilgisini backend'e gönderiyoruz.
  // Sadece kendi sunucumuzdaki (yerel) videolarda çalışıyor, YouTube iframe'ini JS ile takip edemiyoruz.
  useEffect(() => {
    if (!video) return;

    const isYoutubeVideo = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');
    if (isYoutubeVideo) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const zamanGuncellendi = () => {
      const suan = videoElement.currentTime;

      // Şu an oynatılan dilimi "izlendi" olarak işaretliyoruz (nereleri atladığını buradan çıkarıyoruz)
      const bucketIndex = Math.floor(suan / BUCKET_SANIYE);
      izlenenBucketlar.current[bucketIndex] = true;

      // Her frame'de değil, en az 10 saniye ilerlemişse backend'e gönderiyoruz (gereksiz istek atmamak için)
      if (suan - sonGonderilenSaniye.current >= 10) {
        sonGonderilenSaniye.current = suan;
        izlemeLoguGonder(suan, videoElement.duration);
      }
    };

    // Öğrenci videoyu her duraklattığında, o anki dilimi "duraklama noktası" olarak kaydediyoruz
    const durduruldu = () => {
      const bucketIndex = Math.floor(videoElement.currentTime / BUCKET_SANIYE);
      yeniDuraklamalar.current.push(bucketIndex);
    };

    videoElement.addEventListener('timeupdate', zamanGuncellendi);
    videoElement.addEventListener('pause', durduruldu);
    return () => {
      videoElement.removeEventListener('timeupdate', zamanGuncellendi);
      videoElement.removeEventListener('pause', durduruldu);
    };
  }, [video]);

  // Admin panelindeki grafikten bir çubuğa tıklanınca ?start=90 gibi bir parametreyle buraya geliniyor, o öncelikli.
  // Yoksa ve öğrenci bu videoyu daha önce izlemeye başlamışsa (5 saniyeden fazla), kaldığı yerden devam ediyoruz.
  useEffect(() => {
    if (!video) return;
    const urlBaslangici = searchParams.get('start');
    const baslangicSaniyesi = urlBaslangici ? parseFloat(urlBaslangici) : (sonKonum > 5 ? sonKonum : null);
    if (baslangicSaniyesi == null) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const metadataYuklendi = () => {
      videoElement.currentTime = baslangicSaniyesi;
    };

    if (videoElement.readyState >= 1) {
      // Metadata zaten yüklenmişse direkt atla
      videoElement.currentTime = baslangicSaniyesi;
    } else {
      videoElement.addEventListener('loadedmetadata', metadataYuklendi);
    }

    return () => videoElement.removeEventListener('loadedmetadata', metadataYuklendi);
  }, [video, searchParams, sonKonum]);

  // Video yüklenince aynı kurstaki diğer videoları çekiyoruz (önceki/sonraki ders navigasyonu için)
  useEffect(() => {
    if (!video) return;
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Video?courseId=${video.courseId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setKursVideolari(data))
      .catch(error => console.log('Kurs videoları çekilemedi:', error));
  }, [video?.courseId]);

  // A-B tekrar: her iki nokta da işaretlenmişse, video B'ye ulaşınca otomatik olarak A'ya geri sarıyoruz
  useEffect(() => {
    if (!video || abLoop.a == null || abLoop.b == null) return;
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const loopKontrol = () => {
      if (videoElement.currentTime >= abLoop.b) {
        videoElement.currentTime = abLoop.a;
      }
    };

    videoElement.addEventListener('timeupdate', loopKontrol);
    return () => videoElement.removeEventListener('timeupdate', loopKontrol);
  }, [video, abLoop]);

  // Kontrol çubuğu: video oynarken 2.5sn hareketsizlikte otomatik gizleniyor, mouse hareket edince ya da duraklatınca geri geliyor
  useEffect(() => {
    if (!oynatiliyorMu) {
      setKontrollerGorunur(true);
      if (gizlemeZamanlayici.current) clearTimeout(gizlemeZamanlayici.current);
      return;
    }
    gizlemeZamanlayici.current = setTimeout(() => setKontrollerGorunur(false), 2500);
    return () => {
      if (gizlemeZamanlayici.current) clearTimeout(gizlemeZamanlayici.current);
    };
  }, [oynatiliyorMu]);

  const mouseHareketEtti = () => {
    setKontrollerGorunur(true);
    if (gizlemeZamanlayici.current) clearTimeout(gizlemeZamanlayici.current);
    if (oynatiliyorMu) {
      gizlemeZamanlayici.current = setTimeout(() => setKontrollerGorunur(false), 2500);
    }
  };

  // Video oynarken transkriptteki hangi cümlenin üstünde olduğumuzu takip ediyoruz (bölüm şeridinde vurgulamak için)
  const transkriptSegmentleri = useMemo(
    () => transkriptSegmentleriniAyristir(video?.transcriptMetni),
    [video]
  );

  useEffect(() => {
    if (!video || transkriptSegmentleri.length === 0) return;
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const segmentGuncelle = () => {
      const suan = videoElement.currentTime;
      const index = transkriptSegmentleri.findIndex(
        s => suan >= s.baslangicSaniye && suan < s.bitisSaniye
      );
      setAktifSegmentIndex(onceki => (onceki !== index ? index : onceki));
    };

    videoElement.addEventListener('timeupdate', segmentGuncelle);
    return () => videoElement.removeEventListener('timeupdate', segmentGuncelle);
  }, [video, transkriptSegmentleri]);

  // Özel kontrol çubuğumuzu (play/pause, ilerleme, ses) beslemek için video durumunu takip ediyoruz
  useEffect(() => {
    if (!video) return;
    const isYoutubeVideo = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');
    if (isYoutubeVideo) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const zamanGuncelle = () => setSuankiSaniye(videoElement.currentTime);
    const sureYuklendi = () => setToplamSure(videoElement.duration || 0);
    const oynatmayaBasladi = () => setOynatiliyorMu(true);
    const durdu = () => setOynatiliyorMu(false);

    videoElement.addEventListener('timeupdate', zamanGuncelle);
    videoElement.addEventListener('loadedmetadata', sureYuklendi);
    videoElement.addEventListener('play', oynatmayaBasladi);
    videoElement.addEventListener('pause', durdu);
    videoElement.addEventListener('ended', durdu);

    return () => {
      videoElement.removeEventListener('timeupdate', zamanGuncelle);
      videoElement.removeEventListener('loadedmetadata', sureYuklendi);
      videoElement.removeEventListener('play', oynatmayaBasladi);
      videoElement.removeEventListener('pause', durdu);
      videoElement.removeEventListener('ended', durdu);
    };
  }, [video]);

  // Özel kontrol çubuğu fonksiyonları
  const oynatDurdur = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  };

  const cubugaTiklandi = (e) => {
    if (!videoRef.current || !toplamSure) return;
    const cubuk = e.currentTarget;
    const oran = (e.clientX - cubuk.getBoundingClientRect().left) / cubuk.offsetWidth;
    videoRef.current.currentTime = Math.max(0, Math.min(1, oran)) * toplamSure;
  };

  const onSaniyeGeriSar = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };

  const onSaniyeIleriSar = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.duration || Infinity,
      videoRef.current.currentTime + 10
    );
  };

  const sesAcKapa = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setSessizMi(videoRef.current.muted);
  };

  const tamEkranAc = () => {
    if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
  };

  // Oynatma hızı
  const hiziDegistir = (yeniHiz) => {
    if (videoRef.current) videoRef.current.playbackRate = yeniHiz;
    setHiz(yeniHiz);
    setHizMenuAcik(false);
  };

  // A-B tekrar: A noktasını şu anki saniyeye ayarlar
  const aNoktasiAyarla = () => {
    if (!videoRef.current) return;
    setAbLoop(onceki => ({ a: videoRef.current.currentTime, b: onceki.b }));
  };

  // A-B tekrar: B noktasını şu anki saniyeye ayarlar (A'dan sonra olmalı)
  const bNoktasiAyarla = () => {
    if (!videoRef.current) return;
    const suan = videoRef.current.currentTime;
    setAbLoop(onceki => (onceki.a != null && suan > onceki.a ? { a: onceki.a, b: suan } : onceki));
  };

  const loopTemizle = () => setAbLoop({ a: null, b: null });

  const izlemeLoguGonder = (saniye, toplamSure) => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    // izlenenBucketlar.current içinde boşluklar (undefined) olabilir (atlanan dilimler),
    // bu yüzden .map() değil, index bazlı düz bir döngü kullanıyoruz.
    const bucketSayisi = Math.max(izlenenBucketlar.current.length, Math.ceil((toplamSure || 0) / BUCKET_SANIYE));
    let bucketBitmap = '';
    for (let i = 0; i < bucketSayisi; i++) {
      bucketBitmap += izlenenBucketlar.current[i] ? '1' : '0';
    }

    // Duraklama listesini gönderip hemen temizliyoruz ki bir sonraki gönderimde tekrar sayılmasın
    const gonderilecekDuraklamalar = [...yeniDuraklamalar.current];
    yeniDuraklamalar.current = [];

    fetch(`https://localhost:7264/api/Video/${id}/izleme-logu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        saniye,
        toplamSure: toplamSure || 0,
        bucketlar: bucketBitmap,
        yeniDuraklamalar: gonderilecekDuraklamalar
      })
    }).catch(error => console.log('İzleme logu gönderilemedi:', error));
  };

  const favoriDegistir = () => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Favori/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setFavoriMi(data.favoriMi);
      })
      .catch(error => {
        console.log('Favori değiştirilemedi:', error);
      });
  };

  if (yukleniyor) {
    return <Yukleniyor mesaj="Video yükleniyor..." />;
  }

  if (hataMesaji) {
    return (
      <div className="min-h-screen bg-ink text-parchment font-body flex items-center justify-center px-6">
        <div className="bg-panel rounded-xl p-10 text-center max-w-md">
          <p className="text-brass-soft mb-6">{hataMesaji}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft px-5 py-2.5 rounded-lg transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  // YouTube linki mi yoksa bizim sunucumuzdaki yerel dosya mı ayırt ediyoruz
  const isYoutube = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');

  // Yerel video için "Tamamladım" butonu video bitmeden aktif olmasın.
  // YouTube videosunda iframe'in bitişini JS ile yakalayamıyoruz, o yüzden orada buton hep aktif.
  const butonPasif = !isYoutube && !videoBitti;

  // Önceki/sonraki ders navigasyonu için, aynı kurstaki video listesinde şu anki videonun konumunu buluyoruz
  const siraliVideolar = [...kursVideolari].sort((a, b) => a.videoSirasi - b.videoSirasi);
  const suankiIndex = siraliVideolar.findIndex(v => v.id === Number(id));
  const oncekiVideo = suankiIndex > 0 ? siraliVideolar[suankiIndex - 1] : null;
  const sonrakiVideo = suankiIndex >= 0 && suankiIndex < siraliVideolar.length - 1 ? siraliVideolar[suankiIndex + 1] : null;

  const sertifikaIndir = (courseId) => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Sertifika/indir/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Sertifika indirilemedi.');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sertifika.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        bildirimGoster(error.message, 'hata');
      });
  };

  // Cadenza'nın oturum sonu kişisel notunu çekiyor. toastOlarakGoster=true ise (rozet yoksa) toast olarak,
  // false ise rozet modalının içinde gösterilmek üzere state'e yazılıyor.
  const pratikNotuGetir = (toastOlarakGoster) => {
    setPratikNotuYukleniyor(true);
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Video/${video.id}/pratik-notu`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setPratikNotu(data.not);
        setPratikNotuYukleniyor(false);
        if (toastOlarakGoster) {
          bildirimGoster(`🎼 Cadenza'dan: ${data.not}`, 'bilgi');
        }
      })
      .catch(() => setPratikNotuYukleniyor(false));
  };

  const handleTamamla = () => {
  
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch(`https://localhost:7264/api/Video/tamamla/${video.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Bir sorun oluştu, tekrar deneyin.');
        }
        return response.json();
      })
      .then(data => {
        if (data.yeniRozetKazanildi) {
          setKazanilanKursAdi(data.kursAdi);
          setRozetModalAcik(true);
          pratikNotuGetir(false);
        } else {
          bildirimGoster(data.mesaj, 'basari');
          pratikNotuGetir(true);
          setTimeout(() => navigate(-1), 900);
        }
      })
      .catch(error => {
        bildirimGoster(error.message, 'hata');
      });
  };

  // Cadenza'nın "öğretmenin bu anki karesini al" özelliği için: videonun o anki karesini bir görsele dönüştürüyor
  const videoKaresiAl = () => {
    if (!videoRef.current || isYoutube) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.log('Video karesi alınamadı:', e);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-ink bg-blueprint text-parchment font-body px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <GeminiAsistan
          videoId={id}
          onZamanaAtla={(saniye) => {
            if (videoRef.current) videoRef.current.currentTime = saniye;
          }}
          videoKaresiAl={!isYoutube ? videoKaresiAl : null}
          suankiVideoSaniyesi={suankiSaniye}
        />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {video.courseBaslik && (
              <>
                <span className="font-practice text-xs tracking-[0.2em] uppercase text-slate-soft">
                  {video.courseBaslik}
                </span>
                <span className="text-slate-soft/40 text-xs">›</span>
              </>
            )}
            <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass">
              Aşama {video.videoSirasi}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={favoriDegistir}
            className="text-2xl leading-none"
            title={favoriMi ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            {favoriMi ? '❤️' : '🤍'}
          </motion.button>
        </div>

        <h2 className="font-display text-4xl font-medium mb-6">{video.baslik}</h2>

        <div className="relative mb-4">
          {/* Sahne ışığı / vizör tarzı köşe işaretleri — çerçeveyi videonun içeriğinden bağımsız olarak belirginleştiriyor */}
          <span className="absolute -top-2.5 -left-2.5 w-7 h-7 border-t-2 border-l-2 border-brass rounded-tl-lg pointer-events-none z-10" />
          <span className="absolute -top-2.5 -right-2.5 w-7 h-7 border-t-2 border-r-2 border-brass rounded-tr-lg pointer-events-none z-10" />
          <span className="absolute -bottom-2.5 -left-2.5 w-7 h-7 border-b-2 border-l-2 border-brass rounded-bl-lg pointer-events-none z-10" />
          <span className="absolute -bottom-2.5 -right-2.5 w-7 h-7 border-b-2 border-r-2 border-brass rounded-br-lg pointer-events-none z-10" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onMouseMove={!isYoutube ? mouseHareketEtti : undefined}
            className="relative aspect-video rounded-xl overflow-hidden ring-1 ring-brass/40 shadow-[0_0_120px_-15px_rgba(79, 209, 197, 0.65)]"
          >
            {isYoutube ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${video.videoUrl.split('v=')[1]?.split('&')[0]}`}
                title={video.baslik}
                allowFullScreen
              ></iframe>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={`https://localhost:7264${video.videoUrl}`}
                  crossOrigin="anonymous"
                  onClick={oynatDurdur}
                  onContextMenu={(e) => e.preventDefault()}
                  onEnded={() => {
                    setVideoBitti(true);
                    if (videoRef.current) {
                      izlemeLoguGonder(videoRef.current.duration, videoRef.current.duration);
                    }
                  }}
                  className="w-full h-full bg-black cursor-pointer"
                >
                  Tarayıcın video oynatmayı desteklemiyor.
                </video>

                {/* --- ÖZEL KONTROL ÇUBUĞU: markanın brass renginde, native tarayıcı kontrolü yerine --- */}
                <div
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-10 pb-3 px-4 transition-opacity duration-300 ${
                    kontrollerGorunur ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div
                    onClick={cubugaTiklandi}
                    className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group mb-3"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-brass rounded-full"
                      style={{ width: `${toplamSure ? (suankiSaniye / toplamSure) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-brass-soft rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(79, 209, 197, 0.8)]"
                      style={{ left: `calc(${toplamSure ? (suankiSaniye / toplamSure) * 100 : 0}% - 6px)` }}
                    />
                    {/* A-B tekrar noktası işaretleri */}
                    {abLoop.a != null && toplamSure > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-practice pointer-events-none"
                        style={{ left: `${(abLoop.a / toplamSure) * 100}%` }}
                      />
                    )}
                    {abLoop.b != null && toplamSure > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-practice pointer-events-none"
                        style={{ left: `${(abLoop.b / toplamSure) * 100}%` }}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={onSaniyeGeriSar} title="10 saniye geri" className="text-parchment hover:text-brass transition-colors flex-shrink-0">
                      <GeriSarIkonu className="w-5 h-5" />
                    </button>
                    <button onClick={oynatDurdur} className="text-parchment hover:text-brass transition-colors flex-shrink-0">
                      {oynatiliyorMu ? <DurdurIkonu className="w-6 h-6" /> : <OynatIkonu className="w-6 h-6" />}
                    </button>
                    <button onClick={onSaniyeIleriSar} title="10 saniye ileri" className="text-parchment hover:text-brass transition-colors flex-shrink-0">
                      <IleriSarIkonu className="w-5 h-5" />
                    </button>
                    <span className="font-practice text-xs text-parchment/80 tabular-nums flex-shrink-0">
                      {sureyiFormatla(suankiSaniye)} / {sureyiFormatla(toplamSure)}
                    </span>

                    {/* A-B tekrar düğmeleri */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      <button
                        onClick={aNoktasiAyarla}
                        title="Tekrar başlangıcı işaretle"
                        className={`text-[10px] font-practice w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          abLoop.a != null ? 'border-practice text-practice' : 'border-white/25 text-slate-soft hover:border-brass hover:text-brass'
                        }`}
                      >
                        A
                      </button>
                      <button
                        onClick={bNoktasiAyarla}
                        title="Tekrar bitişini işaretle"
                        className={`text-[10px] font-practice w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          abLoop.b != null ? 'border-practice text-practice' : 'border-white/25 text-slate-soft hover:border-brass hover:text-brass'
                        }`}
                      >
                        B
                      </button>
                      {(abLoop.a != null || abLoop.b != null) && (
                        <button
                          onClick={loopTemizle}
                          title="Tekrarı temizle"
                          className="text-slate-soft hover:text-red-400 transition-colors text-sm leading-none px-0.5"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="flex-1" />

                    {/* Oynatma hızı menüsü */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setHizMenuAcik(onceki => !onceki)}
                        className="text-parchment hover:text-brass transition-colors font-practice text-xs w-8 text-center"
                      >
                        {hiz}x
                      </button>
                      {hizMenuAcik && (
                        <div className="absolute bottom-full right-0 mb-2 bg-panel border border-brass/20 rounded-lg overflow-hidden shadow-lg">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(secenek => (
                            <button
                              key={secenek}
                              onClick={() => hiziDegistir(secenek)}
                              className={`block w-full px-4 py-1.5 text-xs text-left transition-colors ${
                                hiz === secenek ? 'text-brass bg-panel-light' : 'text-parchment hover:bg-panel-light'
                              }`}
                            >
                              {secenek}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={sesAcKapa} className="text-parchment hover:text-brass transition-colors flex-shrink-0">
                      {sessizMi ? <SessizIkonu className="w-5 h-5" /> : <SesIkonu className="w-5 h-5" />}
                    </button>
                    <button onClick={tamEkranAc} className="text-parchment hover:text-brass transition-colors flex-shrink-0">
                      <TamEkranIkonu className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* --- BÖLÜM ŞERİDİ: transkriptten türetilen tıklanabilir "nota şeridi", videonun gerçek içeriğini yansıtıyor --- */}
        {!isYoutube && transkriptSegmentleri.length > 0 && (
          <div className="mb-6">
            <div className="flex rounded-full overflow-hidden h-1.5 bg-panel border border-brass/10 gap-px">
              {transkriptSegmentleri.map((segment, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = segment.baslangicSaniye;
                  }}
                  title={segment.metin.slice(0, 80)}
                  style={{ flexGrow: Math.max(segment.bitisSaniye - segment.baslangicSaniye, 1) }}
                  className={`h-full transition-colors cursor-pointer ${
                    i === aktifSegmentIndex ? 'bg-brass' : 'bg-brass/25 hover:bg-brass/50'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2.5 pl-3 border-l-2 border-brass/40 text-xs text-slate-soft italic min-h-[2.5em]">
              {aktifSegmentIndex >= 0 && transkriptSegmentleri[aktifSegmentIndex]
                ? transkriptSegmentleri[aktifSegmentIndex].metin
                : 'Şeritteki bir noktaya tıklayarak videonun o anına atlayabilirsin.'}
            </p>
          </div>
        )}

        {/* --- SÜSLEME ÇİZGİSİ + AÇIKLAMA --- */}
        {video.aciklama && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-brass/20" />
              <span className="w-1.5 h-1.5 rotate-45 bg-brass/50 flex-shrink-0" />
              <div className="flex-1 h-px bg-brass/20" />
            </div>

            <div className="bg-panel-light border-l-2 border-brass/40 rounded-r-lg px-5 py-4 mb-8">
              <p className="font-practice text-[10px] tracking-[0.25em] uppercase text-brass/70 mb-2">
                Bu Derste
              </p>
              <p className="text-sm text-parchment/90 leading-relaxed whitespace-pre-line">
                {video.aciklama}
              </p>
            </div>
          </>
        )}

        {!isYoutube && !videoBitti && (
          <p className="text-xs text-slate-soft/70 mb-5 text-center">
            Devam etmek için videoyu sonuna kadar izlemelisin. (Enter: oynat, Space: durdur, ←/→: sar)
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleTamamla}
          disabled={butonPasif}
          className={`w-full font-semibold py-3.5 rounded-lg transition-colors ${
            butonPasif
              ? 'bg-panel text-slate-soft/40 cursor-not-allowed'
              : 'bg-brass hover:bg-brass-soft text-ink'
          }`}
        >
          Videoyu Tamamladım
        </motion.button>

        {/* --- ÖNCEKİ / SONRAKİ DERS NAVİGASYONU --- */}
        {(oncekiVideo || sonrakiVideo) && (
          <div className="flex items-center justify-between mt-4 gap-3">
            {oncekiVideo ? (
              <button
                onClick={() => navigate(`/video/${oncekiVideo.id}`)}
                className="flex-1 text-left text-xs text-slate-soft hover:text-brass transition-colors truncate"
              >
                ‹ {oncekiVideo.baslik}
              </button>
            ) : <div className="flex-1" />}

            {sonrakiVideo ? (
              <button
                onClick={() => sonrakiVideo.kilidiAcikMi && navigate(`/video/${sonrakiVideo.id}`)}
                disabled={!sonrakiVideo.kilidiAcikMi}
                className={`flex-1 text-right text-xs transition-colors truncate ${
                  sonrakiVideo.kilidiAcikMi ? 'text-slate-soft hover:text-brass' : 'text-slate-soft/30 cursor-not-allowed'
                }`}
              >
                {sonrakiVideo.baslik} ›
              </button>
            ) : <div className="flex-1" />}
          </div>
        )}
      </div>

      {/* --- ROZET KAZANMA MODALI --- */}
      <AnimatePresence>
        {rozetModalAcik && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative bg-panel border border-brass/30 rounded-2xl p-10 text-center max-w-sm overflow-hidden"
            >
              {/* --- UÇUŞAN NOTALAR: konfeti yerine markanın kendi kutlama dili --- */}
              <div className="absolute inset-0 pointer-events-none">
                {['♪', '♫', '♬', '♩', '♪', '♫'].map((nota, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: -140,
                      x: (i % 2 === 0 ? 1 : -1) * (20 + i * 12)
                    }}
                    transition={{
                      duration: 1.8,
                      delay: 0.4 + i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 1.2
                    }}
                    className="absolute left-1/2 top-1/2 text-2xl text-brass"
                  >
                    {nota}
                  </motion.span>
                ))}
              </div>

              {/* --- DAMGA EFEKTİ: trofe bir mühür gibi ağırca "oturuyor" --- */}
              <motion.div
                initial={{ scale: 2.4, opacity: 0, rotate: -10, y: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 14 }}
                className="relative text-6xl mb-4"
              >
                🏆
                <motion.span
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ delay: 0.32, duration: 0.55, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-brass"
                />
              </motion.div>
              <span className="font-practice text-xs tracking-[0.3em] uppercase text-brass block mb-2">
                Yeni Rozet
              </span>
              <h3 className="font-display text-2xl font-medium mb-3">Tebrikler!</h3>
              <p className="text-slate-soft mb-6">
                "{kazanilanKursAdi}" eğitimini tamamladın ve rozet kazandın.
              </p>

              {/* --- CADENZA'DAN PRATİK NOTU --- */}
              <div className="bg-ink border border-brass/20 rounded-lg p-4 mb-6 text-left">
                <p className="font-practice text-[10px] tracking-[0.25em] uppercase text-brass/70 mb-2">
                  Cadenza'dan Pratik Notu
                </p>
                {pratikNotuYukleniyor ? (
                  <p className="text-xs text-slate-soft italic">Notunu yazıyor...</p>
                ) : (
                  <p className="text-sm text-parchment leading-relaxed">{pratikNotu}</p>
                )}
              </div>

             <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sertifikaIndir(video.courseId)}
                  className="w-full bg-brass hover:bg-brass-soft text-ink font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Sertifikayı İndir
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/rozetlerim')}
                  className="w-full bg-transparent border border-brass/50 hover:border-brass text-brass py-2.5 rounded-lg transition-colors"
                >
                  Rozetlerimi Gör
                </motion.button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-transparent border border-slate-soft/40 hover:border-brass hover:text-brass text-slate-soft py-2.5 rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoDetay;