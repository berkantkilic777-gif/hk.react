// Token'ın içindeki bilgileri (claim'leri) okuyup bir obje olarak döndürür
export function tokenCoz(token) {
  try {
    const parcalar = token.split('.');
    const payloadBase64 = parcalar[1];
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  } catch (hata) {
    console.log("Token okunamadı:", hata);
    return null;
  }
}

// localStorage'daki token'dan direkt Role bilgisini çeker
export function kullaniciRolunuAl() {
  const token = localStorage.getItem('ogrenciYakaKarti');
  if (!token) return null;

  const payload = tokenCoz(token);
  if (!payload) return null;

  // DÜZELTME: .NET, token'ı üretirken Role'ü kısa isimle ("role") yazıyor
  return payload["role"];
}