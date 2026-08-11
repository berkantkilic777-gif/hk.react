// Basit, merkezi bir bildirim sistemi. Herhangi bir dosyadan bildirimGoster(mesaj, tip) çağırınca
// window'a özel bir event fırlatıyor, ToastContainer.jsx bunu dinleyip ekranda gösteriyor.
// tip: 'bilgi' (varsayılan) | 'basari' | 'hata'
export const bildirimGoster = (mesaj, tip = 'bilgi') => {
  window.dispatchEvent(new CustomEvent('bildirim', { detail: { mesaj, tip } }));
};