import { useState } from 'react';
import { useData } from './hooks/useData';
import './index.css';

const MONTHS = [
  { key: 'all', label: 'Geral' },
  { key: 'JAN_26', label: 'Janeiro' },
  { key: 'FEV_26', label: 'Fevereiro' },
  { key: 'MAR_26', label: 'Março' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function BestPlayer({ player }) {
  if (!player) return null;

  return (
    <div className="panel best-player">
      <div className="panel-title">
        <span className="panel-title-dot" style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' }} />
        Destaque
      </div>

      <div className="best-player-crown">👑</div>
      <div className="best-player-name">{player.nome}</div>

      <div className="best-player-pontos">{player.pontos}</div>
      <div className="best-player-pts-label">pontos totais</div>

      <div className="best-player-stats">
        <div className="stat-box">
          <div className="stat-box-icon">⚽</div>
          <div className="stat-box-value">{player.gols}</div>
          <div className="stat-box-label">Gols</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-icon">🏆</div>
          <div className="stat-box-value">{player.capa}</div>
          <div className="stat-box-label">Capas</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-icon">⚡</div>
          <div className="stat-box-value">{player.vitorias}</div>
          <div className="stat-box-label">Vitórias</div>
        </div>
      </div>

      <div className="stat-cards-row">
        <div className="stat-box">
          <div className="stat-box-icon">✅</div>
          <div className="stat-box-value">{player.presenca}</div>
          <div className="stat-box-label">Presenças</div>
        </div>
        <div className="stat-box negative">
          <div className="stat-box-icon">🟨</div>
          <div className="stat-box-value">{player.amarelo || '—'}</div>
          <div className="stat-box-label">Amarelos</div>
        </div>
      </div>
    </div>
  );
}

function TopTen({ data }) {
  const top10 = data.slice(0, 10);
  const maxPts = top10[0]?.pontos || 1;

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="panel-title-dot" />
        Top 10 — Ranking
      </div>

      <div className="ranking-list">
        {top10.map((player, i) => {
          const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
          const barWidth = Math.round((player.pontos / maxPts) * 100);

          return (
            <div key={player.nome} className={`ranking-item ${rankClass}`}>
              <div className="ranking-position">
                {i < 3 ? MEDALS[i] : `${i + 1}°`}
              </div>

              <div className="ranking-name">{player.nome}</div>

              <div className="ranking-mini-stats">
                <span className="mini-stat">⚽ {player.gols}</span>
                <span className="mini-stat">🏆 {player.capa}</span>
                <span className="mini-stat">⚡ {player.vitorias}</span>
              </div>

              <div className="ranking-points">{player.pontos}</div>

              <div
                className="ranking-bar"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStrip({ data, month }) {
  const totalGols = data.reduce((s, p) => s + p.gols, 0);
  const totalVitorias = data.reduce((s, p) => s + p.vitorias, 0);
  const totalCapas = data.reduce((s, p) => s + p.capa, 0);
  const ativos = data.filter(p => p.pontos > 0).length;
  const monthLabel = MONTHS.find(m => m.key === month)?.label ?? 'Geral';

  return (
    <div className="summary-strip">
      <div className="summary-item">
        <div className="summary-label">Período</div>
        <div className="summary-value" style={{ fontSize: '1rem', color: 'var(--text)' }}>{monthLabel}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Jogadores Ativos</div>
        <div className="summary-value">{ativos}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Total de Gols</div>
        <div className="summary-value">{totalGols}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Total de Vitórias</div>
        <div className="summary-value">{totalVitorias}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Capas Distribuídas</div>
        <div className="summary-value">{totalCapas}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [month, setMonth] = useState('all');
  const { data, loading, error } = useData(month);

  const best = data[0] ?? null;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-icon">⚽</div>
        <div>
          <div className="header-title">Racha FC — Ranking</div>
          <div className="header-sub">Pontuação Geral do Grupo</div>
        </div>
      </header>

      {/* Month Filter */}
      <div className="filter-section">
        <span className="filter-label">Período</span>
        {MONTHS.map(m => (
          <button
            key={m.key}
            className={`filter-btn ${month === m.key ? 'active' : ''}`}
            onClick={() => setMonth(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-wrap">
          <div className="loading-ball">⚽</div>
          <div className="loading-text">Carregando dados...</div>
        </div>
      )}

      {error && (
        <div className="error-msg">
          Erro ao carregar dados: {error}
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <SummaryStrip data={data} month={month} />

          <div className="dashboard-grid">
            {/* Top 10 */}
            <TopTen data={data} />

            {/* Best Player */}
            <div>
              <BestPlayer player={best} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
