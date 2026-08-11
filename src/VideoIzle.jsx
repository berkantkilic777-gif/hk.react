import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoIzle = () => {
  const navigate = useNavigate();
  const [videolar, setVideolar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ogrenciYakaKarti');

    fetch('https://localhost:7264/api/Video', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setVideolar(data);
        setYukleniyor(false);
      })
      .catch(error => {
        console.error("Videolar çekilirken hata oluştu:", error);
        setYukleniyor(false);
      });
  }, []);

  if (yukleniyor) {
    return <div className="text-center mt-10 text-xl font-semibold">Videolar Yükleniyor...</div>;
  }

  // --- YENİ: İlerleme yüzdesi hesabı ---
  const toplamVideoSayisi = videolar.length;
  const acikVideoSayisi = videolar.filter(video => video.kilidiAcikMi).length;
  const ilerlemeYuzdesi = toplamVideoSayisi > 0
    ? Math.round((acikVideoSayisi / toplamVideoSayisi) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Eğitim Videoları</h2>

      {/* --- YENİ: İlerleme çubuğu --- */}
      <div className="mb-8">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">İlerlemen</span>
          <span className="text-sm font-medium text-gray-700">
            %{ilerlemeYuzdesi} ({acikVideoSayisi}/{toplamVideoSayisi})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${ilerlemeYuzdesi}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videolar.map((video) => (
          <div
            key={video.id}
            className={`p-5 rounded-lg shadow-md transition-all duration-300 ${
              video.kilidiAcikMi
                ? 'bg-white border-l-4 border-blue-500'
                : 'bg-gray-200 opacity-60 border-l-4 border-gray-400 cursor-not-allowed'
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">{video.baslik}</h3>
            <p className="text-sm text-gray-600 mb-4">Aşama: {video.videoSirasi}</p>

            {video.kilidiAcikMi ? (
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                onClick={() => navigate(`/video/${video.id}`)}
              >
                Hemen İzle
              </button>
            ) : (
              <button
                className="w-full bg-gray-400 text-gray-100 font-bold py-2 px-4 rounded cursor-not-allowed"
                disabled
              >
                🔒 Önceki Videoyu Tamamlayın
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoIzle;