import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
function Login() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");

  const navigate = useNavigate(); 

  const girisYapTiklandi = () => {
    const kargoPaketi = {
      Username: email, 
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

      console.log("C# Bizi İçeri Aldı! Kart cüzdana eklendi:", data.token);
      
      
      navigate("/anasayfa");
    })
    .catch(error => {
      console.log("Hata:", error);
      alert(error.message); 
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Eğitim Platformu Giriş Kapısı</h2>
      
      <div>
        <label>E-posta: </label>
        <input 
          type="email" 
          placeholder="ornek@ogrenci.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      
      <br />
      
      <div>
        <label>Şifre: </label>
        <input 
          type="password" 
          placeholder="Şifreni gir" 
          value={sifre}
          onChange={(e) => setSifre(e.target.value)} 
        />
      </div>
      
      <br />
      
      <button onClick={girisYapTiklandi}>Giriş Yap</button>
    </div>
  )
}

export default Login;