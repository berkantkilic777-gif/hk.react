import { useState } from 'react';

function Register(){
    const [name,setName]= useState('');
    const [lastName,setLastName]= useState('');
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');

        const kayitOl=async (e) => {
           e.preventDefault();

           try {
            const response = await fetch("https://localhost:7264/api/Auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    Name: name, 
                    LastName: lastName, 
                    Email: email, 
                    Password: password 
                }) 
            });

            if (response.ok) {
                alert("Kayıt Başarılı! Artık giriş yapabilirsin.");
                
                window.location.href = "/"; 
            } else {
                alert("Kayıt olunamadı. Belki bu e-posta zaten kayıtlıdır?");
            }
        } catch (error) {
            console.log("Sunucuya ulaşılamadı:", error);
        }
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center' }}>Kayıt Ol 🚀</h2>
                
                <form onSubmit={kayitOl} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="Adın" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px' }} />
                    <input type="text" placeholder="Soyadın" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ padding: '10px' }} />
                    <input type="email" placeholder="E-posta Adresin" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px' }} />
                    <input type="password" placeholder="Şifren" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px' }} />
                    
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Kayıt İşlemini Tamamla
                    </button>
                </form>
            </div>
        </div>
    );

        };
    



export default Register;