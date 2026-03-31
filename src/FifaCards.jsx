import CARD_BG from './cardBg.js';
import { DELA_PHOTO } from './players.js';
import LOGO from './logo.js';

const BrazilFlag = () => (
  <svg viewBox="0 0 22 15" xmlns="http://www.w3.org/2000/svg" style={{width:'30px',height:'20px',borderRadius:'2px',display:'block',boxShadow:'0 1px 4px rgba(0,0,0,0.4)'}}>
    <rect width="22" height="15" fill="#009c3b"/>
    <polygon points="11,1.5 20.5,7.5 11,13.5 1.5,7.5" fill="#FEDF00"/>
    <circle cx="11" cy="7.5" r="3.2" fill="#002776"/>
    <path d="M8.1,6.2 Q11,5.2 13.9,6.6" stroke="white" strokeWidth="0.6" fill="none"/>
  </svg>
);

function FifaCard({ player }) {
  const { nome, posicao, rating, foto, statsLeft, statsRight } = player;

  return (
    <div className="fc-card-wrap">
      <div className="fc-card">
        <img src={CARD_BG} className="fc-card-bg" alt="" />

        {/* Top left info */}
        <div className="fc-top">
          <div className="fc-rating">{rating}</div>
          <div className="fc-posicao">{posicao}</div>
          <div className="fc-flag"><BrazilFlag /></div>
          <div className="fc-clube">
            <img src={LOGO} alt="Racha" className="fc-clube-logo" />
          </div>
        </div>

        {/* Player photo */}
        <div className="fc-photo-wrap">
          <img src={foto} className="fc-photo" alt={nome} />
        </div>

        {/* Bottom */}
        <div className="fc-bottom">
          <div className="fc-nome">{nome}</div>
          <div className="fc-divider" />
          <div className="fc-stats">
            <div className="fc-stats-col">
              {statsLeft.map(([val, label]) => (
                <div key={label} className="fc-stat">
                  <span className="fc-stat-val">{val}</span>
                  <span className="fc-stat-label">{label}</span>
                </div>
              ))}
            </div>
            <div className="fc-stats-col">
              {statsRight.map(([val, label]) => (
                <div key={label} className="fc-stat">
                  <span className="fc-stat-val">{val}</span>
                  <span className="fc-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PLAYERS = [
  {
    nome: 'DELA',
    posicao: 'ST',
    rating: 99,
    foto: DELA_PHOTO,
    statsLeft:  [['99','PAC'], ['99','FIN'], ['99','PAS']],
    statsRight: [['99','DRI'], ['99','DEF'], ['99','PHY']],
  },
];

export default function FifaCards() {
  return (
    <div className="fc-page">
      <div className="fc-grid">
        {PLAYERS.map(p => <FifaCard key={p.nome} player={p} />)}
      </div>
    </div>
  );
}
