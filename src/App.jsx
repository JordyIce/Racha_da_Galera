import { useState } from 'react';
import { useData } from './hooks/useData';
import LOGO from './logo.js';
import './index.css';

const MONTHS = [
  { key: 'all',    label: 'Geral',     dot: '⬤' },
  { key: 'JAN_26', label: 'Janeiro',   dot: '⬤' },
  { key: 'FEV_26', label: 'Fevereiro', dot: '⬤' },
  { key: 'MAR_26', label: 'Março',     dot: '⬤' },
];

const PAGES = [
  { key: 'resumo', label: 'TOP 10', icon: '📊' },
  { key: 'geral',  label: 'Geral',   icon: '📋' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

const SORT_COLS = [
  { key: 'pontos',   label: 'Pts',      tip: 'Pontuação' },
  { key: 'gols',     label: 'Gols',     tip: 'Gols' },
  { key: 'capa',     label: 'Capas',    tip: 'Capa (Vencedor da Semana)' },
  { key: 'presenca', label: 'Pres.',    tip: 'Presenças' },
  { key: 'vitorias', label: 'Vit.',     tip: 'Vitórias' },
  { key: 'amarelo',  label: '🟨',       tip: 'Cartões Amarelos' },
  { key: 'vermelho', label: '🟥',       tip: 'Cartões Vermelhos' },
];

/* ── SIDEBAR ── */
function Sidebar({ page, setPage, month, setMonth, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={LOGO} alt="Racha da Galera" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-name">Racha da Galera</div>
            <div className="sidebar-logo-sub">Pontuação</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Páginas</div>
          {PAGES.map(p => (
            <button
              key={p.key}
              className={`nav-item ${page === p.key ? 'active' : ''}`}
              onClick={() => { setPage(p.key); setSidebarOpen(false); }}
            >
              <span className="nav-item-icon">{p.icon}</span>
              <span className="nav-item-label">{p.label}</span>
            </button>
          ))}
        </nav>

        {/* Period filter at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-period">Período</div>
          <div className="period-select-wrap">
            <select
              className="period-select"
              value={month}
              onChange={e => setMonth(e.target.value)}
            >
              {MONTHS.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
            <span className="period-select-arrow">▾</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── SUMMARY STRIP ── */
function SummaryStrip({ data }) {
  const totalGols     = data.reduce((s, p) => s + p.gols, 0);
  const totalVitorias = data.reduce((s, p) => s + p.vitorias, 0);
  const totalCapas    = data.reduce((s, p) => s + p.capa, 0);
  const ativos        = data.filter(p => p.pontos > 0).length;

  const cards = [
    { icon: '👥', value: ativos,        label: 'Jogadores Ativos' },
    { icon: '⚽', value: totalGols,     label: 'Total de Gols' },
    { icon: '⚡', value: totalVitorias, label: 'Total de Vitórias' },
    { icon: '🏆', value: totalCapas,    label: 'Capas Distribuídas' },
  ];

  return (
    <div className="summary-strip">
      {cards.map(c => (
        <div key={c.label} className="summary-card">
          <div className="summary-card-icon">{c.icon}</div>
          <div className="summary-card-value">{c.value}</div>
          <div className="summary-card-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── BEST PLAYER ── */
function BestPlayer({ player, isTop1 }) {
  if (!player) return null;
  return (
    <div className="panel best-player">
      <div className="panel-title">
        <span className="panel-title-dot" style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' }} />
        Destaque
      </div>
      {isTop1 && <div className="best-player-crown">👑</div>}
      <div className="best-player-name" style={!isTop1 ? { marginTop: '12px' } : {}}>{player.nome}</div>
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

/* ── TOP 10 ── */
function TopTen({ data, selected, onSelect }) {
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
          const isSelected = player.nome === selected;
          const barWidth = Math.round((player.pontos / maxPts) * 100);
          return (
            <div
              key={player.nome}
              className={`ranking-item ${rankClass} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(player.nome)}
            >
              <div className="ranking-position">
                {i < 3 ? MEDALS[i] : `${i + 1}°`}
              </div>
              <div className="ranking-name">{player.nome}</div>
              <div className="ranking-mini-stats">
                <span>⚽ {player.gols}</span>
                <span>🏆 {player.capa}</span>
                <span>⚡ {player.vitorias}</span>
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

/* ── GERAL TABLE ── */
function GeralTable({ data }) {
  const [sortKey, setSortKey] = useState('pontos');
  const [sortAsc, setSortAsc]  = useState(false);

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const handleSort = (key) => {
    if (key === sortKey) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const maxPts = Math.max(...data.map(p => p.pontos), 1);
  const isPtsSorted = sortKey === 'pontos' && !sortAsc;

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
              <th className="th-nome col-nome">Jogador</th>
              {SORT_COLS.map(c => (
                <th
                  key={c.key}
                  title={c.tip}
                  className={`sortable ${sortKey === c.key ? 'sorted' : ''}`}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                  <span className="sort-arrow">
                    {sortKey === c.key ? (sortAsc ? '↑' : '↓') : '↕'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => {
              const isTop3    = isPtsSorted && i < 3;
              const rankClass = isTop3 ? `rank-${i + 1}` : '';
              const barW      = Math.round((player.pontos / maxPts) * 100);

              const numCell = (val) =>
                val === 0
                  ? <span className="num-zero">—</span>
                  : <span className="num-cell">{val}</span>;

              const negCell = (val) =>
                val === 0
                  ? <span className="neg-zero">—</span>
                  : <span className="neg-cell">-{val}</span>;

              return (
                <tr key={player.nome} className={`geral-row ${rankClass}`}>
                  <td className="col-pos">
                    {isTop3
                      ? <span style={{ fontSize: '1rem' }}>{MEDALS[i]}</span>
                      : <span className="pos-badge">{i + 1}</span>
                    }
                  </td>
                  <td className="col-nome">
                    <div className="nome-cell">
                      <span className="nome-text">{player.nome}</span>
                      <div className="nome-bar-track">
                        <div className="nome-bar-fill" style={{ width: `${barW}%` }} />
                      </div>
                    </div>
                  </td>
                  <td><span className="pts-cell">{player.pontos}</span></td>
                  <td>{numCell(player.gols)}</td>
                  <td>{numCell(player.capa)}</td>
                  <td>{numCell(player.presenca)}</td>
                  <td>{numCell(player.vitorias)}</td>
                  <td>{negCell(player.amarelo)}</td>
                  <td>{negCell(player.vermelho)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  const [month, setMonth]             = useState('all');
  const [page, setPage]               = useState('resumo');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected]       = useState(null);
  const { data, loading, error }      = useData(month);

  // Reset selected when data changes (month filter)
  const prevData = data;
  const featuredPlayer = selected
    ? data.find(p => p.nome === selected) ?? data[0]
    : data[0];

  const monthLabel = MONTHS.find(m => m.key === month)?.label ?? 'Geral';

  return (
    <div className="layout">
      <Sidebar
        page={page} setPage={setPage}
        month={month} setMonth={(m) => { setMonth(m); setSelected(null); }}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
      />

      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            {PAGES.find(p => p.key === page)?.label}
          </div>
          <div className="page-subtitle">
            {monthLabel} · Racha da Galera
          </div>
        </div>

        {loading && (
          <div className="loading-wrap">
            <div className="loading-ball">⚽</div>
            <div className="loading-text">Carregando dados...</div>
          </div>
        )}

        {error && <div className="error-msg">Erro ao carregar dados: {error}</div>}

        {!loading && !error && data.length > 0 && (
          <>
            <SummaryStrip data={data} />

            {page === 'resumo' && (
              <div className="resumo-grid">
                <div className="resumo-top10">
                  <TopTen
                    data={data}
                    selected={featuredPlayer?.nome}
                    onSelect={(nome) => setSelected(nome === featuredPlayer?.nome && nome === data[0]?.nome ? null : nome)}
                  />
                </div>
                <div className="resumo-side">
                  <BestPlayer player={featuredPlayer} isTop1={featuredPlayer?.nome === data[0]?.nome} />
                </div>
              </div>
            )}

            {page === 'geral' && (
              <div className="geral-wrap">
                <GeralTable data={data} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
