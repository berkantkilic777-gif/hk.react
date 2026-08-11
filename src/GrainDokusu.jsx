// Tüm sayfaların üzerine çok hafif, hareket etmeyen bir analog grain dokusu bindiriyor.
// Fark edilmeyecek kadar ince ama alt bilinçte "sıcak/vintage" bir premium his bırakıyor.
const GrainDokusu = () => (
  <div
    className="fixed inset-0 z-[85] pointer-events-none opacity-[0.035] mix-blend-overlay"
    aria-hidden="true"
  >
    <svg width="100%" height="100%">
      <filter id="grainFiltresi">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grainFiltresi)" />
    </svg>
  </div>
);

export default GrainDokusu;