import { useState, useEffect } from 'react';

function AnaSayfa() {
   
    const [egitimler, setEgitimler] = useState([]);

    
    useEffect(() => {
        fetch("https://localhost:7264/api/Courses") 
            .then(cevap => cevap.json())
            .then(veri => {
                setEgitimler(veri); 
            })
            .catch(hata => console.log("Kurye yolda kaza yaptı:", hata));
             }, []); 

    return (
        <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
            <h2>Hoş Geldin! İşte Eğitimlerimiz 🎓</h2>
            
            
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
                
                
                {egitimler.map((kurs) => (
                    <div key={kurs.id} style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "12px",
                        width: "250px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff"
                    }}>
                        
                        <h3 style={{ margin: "0 0 10px 0" }}>{kurs.name}</h3> 
                        <p style={{ color: "#555" }}>{kurs.description}</p>
                        <h4 style={{ color: "#28a745" }}>{kurs.price} TL</h4>
                        
                        <button style={{
                            backgroundColor: "#007BFF",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            width: "100%",
                            fontWeight: "bold"
                        }}>
                            Satın Al
                        </button>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default AnaSayfa;