import { useState } from 'react';
import { useData } from './hooks/useData';
import LOGO from './logo.js';
import './index.css';

const MONTHS = [
  { key: 'all', label: 'Geral' },
  { key: 'JAN_26', label: 'Janeiro' },
  { key: 'FEV_26', label: 'Fevereiro' },
  { key: 'MAR_26', label: 'Março' },
];

const PAGES = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'geral', label: 'Geral' },
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
              <div className="ranking-bar" style={{ width: `${barWidth}%` }} />
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

const SORT_COLS = [
  { key: 'pontos',   label: 'Pts' },
  { key: 'gols',     label: 'Gols' },
  { key: 'capa',     label: 'Capas' },
  { key: 'presenca', label: 'Presenças' },
  { key: 'vitorias', label: 'Vitórias' },
  { key: 'amarelo',  label: '🟨' },
  { key: 'vermelho', label: '🟥' },
];

function GeralTable({ data }) {
  const [sortKey, setSortKey] = useState('pontos');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const handleSort = (key) => {
    if (key === sortKey) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const maxPts = data[0]?.pontos || 1;

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="panel-title-dot" />
        Todos os Jogadores
        <span className="panel-count">{data.length} jogadores</span>
      </div>

      <div className="geral-table-wrap">
        <table className="geral-table">
          <thead>
            <tr>
              <th className="col-pos">#</th>
              <th className="col-nome">Nome</th>
              {SORT_COLS.map(c => (
                <th
                  key={c.key}
                  className={`col-num sortable ${sortKey === c.key ? 'sorted' : ''}`}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                  <span className="sort-arrow">
                    {sortKey === c.key ? (sortAsc ? ' ↑' : ' ↓') : ' ↕'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => {
              const isTop3 = i < 3 && sortKey === 'pontos' && !sortAsc;
              const rankClass = isTop3 ? `rank-${i + 1}` : '';
              const barW = Math.round((player.pontos / maxPts) * 100);
              return (
                <tr key={player.nome} className={`geral-row ${rankClass}`}>
                  <td className="col-pos">
                    {isTop3 ? MEDALS[i] : <span className="pos-num">{i + 1}</span>}
                  </td>
                  <td className="col-nome">
                    <div className="nome-wrap">
                      <span className="nome-text">{player.nome}</span>
                      {sortKey === 'pontos' && (
                        <div className="nome-bar" style={{ width: `${barW}%` }} />
                      )}
                    </div>
                  </td>
                  <td className={`col-num pts-col ${rankClass}`}>{player.pontos}</td>
                  <td className="col-num">{player.gols || '—'}</td>
                  <td className="col-num">{player.capa || '—'}</td>
                  <td className="col-num">{player.presenca || '—'}</td>
                  <td className="col-num">{player.vitorias || '—'}</td>
                  <td className="col-num neg">{player.amarelo || '—'}</td>
                  <td className="col-num neg">{player.vermelho || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [month, setMonth] = useState('all');
  const [page, setPage] = useState('resumo');
  const { data, loading, error } = useData(month);
  const best = data[0] ?? null;

  return (
    <div className="app">
      <header className="header">
        <img src={LOGO} alt="Racha da Galera" className="header-logo" />
        <div>
          <div className="header-title">Racha da Galera</div>
          <div className="header-sub">Pontuação</div>
        </div>
      </header>

      <nav className="page-nav">
        {PAGES.map(p => (
          <button
            key={p.key}
            className={`page-nav-btn ${page === p.key ? 'active' : ''}`}
            onClick={() => setPage(p.key)}
          >
            {p.label}
          </button>
        ))}
      </nav>

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
        <div className="error-msg">Erro ao carregar dados: {error}</div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <SummaryStrip data={data} month={month} />

          {page === 'resumo' && (
            <div className="dashboard-grid">
              <TopTen data={data} />
              <div><BestPlayer player={best} /></div>
            </div>
          )}

          {page === 'geral' && (
            <GeralTable data={data} />
          )}
        </>
      )}
    </div>
  );
}
