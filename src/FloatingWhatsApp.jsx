import React from 'react';
import './FloatingWhatsApp.css'; 

const FloatingWhatsApp = () => {
  
  const phoneNumber = "905050256858"; 
  const message = "Merhaba, eğitimler hakkında bilgi almak istiyorum.";

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp İletişim"
        className="whatsapp-icon"
      />
    </a>
  );
};

export default FloatingWhatsApp;