import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './Login';
import AnaSayfa from './AnaSayfa';
import Register from './Register';
import Egitimlerim from './Egitimlerim';
import EgitimDetay from './EgitimDetay';
import Navbar from './Navbar';
import AdminPanel from './AdminPanel';
import AdminRoute from './AdminRoute';
import VideoDetay from './VideoDetay';   // DÜZELTİLDİ: VideoOynatici değil, VideoDetay
import Rozetlerim from './Rozetlerim';
import Favorilerim from './Favorilerim';
import SifremiUnuttum from './SifremiUnuttum';
import SifreSifirla from './SifreSifirla';
import Profile from './Profile';
import SayfaBulunamadi from './SayfaBulunamadi';
import ToastContainer from './ToastContainer';
import GrainDokusu from './GrainDokusu';
import SahneIsigiSpotu from './SahneIsigiSpotu';
import MetronomSayimi from './MetronomSayimi';
import VuMetreScroll from './VuMetreScroll';

// Her sayfa geçişinde uygulanan ortak animasyon. Tek yerden yönetiliyor,
// her sayfa dosyasını tek tek değiştirmemize gerek kalmıyor.
const SayfaGecisi = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Video sayfasına ÖZEL geçiş: sahne perdesi gibi iki yandan aralanarak açılıyor,
// "bir performansın başlaması" hissini vurguluyor. Diğer sayfalarda standart SayfaGecisi kullanılıyor.
const PerdeGecisi = ({ children }) => (
  <div className="relative">
    <motion.div
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      style={{ originX: 0 }}
      className="fixed inset-y-0 left-0 w-1/2 bg-ink z-[80] pointer-events-none"
    />
    <motion.div
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      style={{ originX: 1 }}
      className="fixed inset-y-0 right-0 w-1/2 bg-ink z-[80] pointer-events-none"
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {children}
    </motion.div>
  </div>
);

// useLocation, BrowserRouter'ın İÇİNDE çağrılmak zorunda olduğu için
// rotaları ayrı bir bileşene taşıdık.
function AnimasyonluRotalar() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route path="/" element={<SayfaGecisi><Login /></SayfaGecisi>} />

        <Route path="/anasayfa" element={<SayfaGecisi><AnaSayfa /></SayfaGecisi>} />

        <Route path="/Register" element={<SayfaGecisi><Register /></SayfaGecisi>} />

        <Route path="/egitim/:id" element={<SayfaGecisi><EgitimDetay /></SayfaGecisi>} />

        <Route path="/egitimlerim" element={<SayfaGecisi><Egitimlerim /></SayfaGecisi>} />

        <Route path="/video/:id" element={<PerdeGecisi><VideoDetay /></PerdeGecisi>} />

        <Route path="/rozetlerim" element={<SayfaGecisi><Rozetlerim /></SayfaGecisi>} />

        <Route path="/favorilerim" element={<SayfaGecisi><Favorilerim /></SayfaGecisi>} />

        <Route path="/sifremi-unuttum" element={<SayfaGecisi><SifremiUnuttum /></SayfaGecisi>} />

        <Route path="/sifre-sifirla" element={<SayfaGecisi><SifreSifirla /></SayfaGecisi>} />

        <Route path="/profil" element={<SayfaGecisi><Profile /></SayfaGecisi>} />


        <Route
          path="/admin"
          element={
            <SayfaGecisi>
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            </SayfaGecisi>
          }
        />

        {/* Tanımlanmamış her yol buraya düşer, en altta olmalı */}
        <Route path="*" element={<SayfaGecisi><SayfaBulunamadi /></SayfaGecisi>} />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MetronomSayimi />
      <GrainDokusu />
      <SahneIsigiSpotu />
      <VuMetreScroll />
      <ToastContainer />
      <Navbar />
      <AnimasyonluRotalar />
    </BrowserRouter>
  );
}

export default App;