export const config = { runtime: 'edge' };

const SHEET_ID = '1Evb7ZeUtS_gNiXDLAtuxMj4yzXAlNY2MK5KgKJu-HIQ';

const MONTH_SHEETS = [
  'JAN_26', 'FEV_26', 'MAR_26', 'ABR_26', 'MAI_26', 'JUN_26',
  'JUL_26', 'AGO_26', 'SET_26', 'OUT_26', 'NOV_26', 'DEZ_26',
];

const GOLEIROS_SHEET = 'GOL_26';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const cols = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ''; });
    return row;
  }).filter(r => r['Nome'] && r['Nome'].trim() !== '');
}

function parseNum(v) {
  if (!v || v.trim() === '') return 0;
  const normalized = v.trim().replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function processRows(rows) {
  return rows.map(r => ({
    nome: r['Nome']?.trim() ?? '',
    gols: parseNum(r['Gols']),
    capa: parseNum(r['Capa']),
    presenca: parseNum(r['Presença']),
    vitorias: parseNum(r['Vitorias']),
    amarelo: parseNum(r['C. Amarelo']),
    vermelho: parseNum(r['C. Vermelho']),
    pontos: parseNum(r['Total Pontos']),
  })).filter(p => p.nome !== '');
}

function calcPontos(p) {
  const total = p.gols * 3 + p.capa * 10 + p.presenca * 3 + p.vitorias * 3
    + p.amarelo * (-5) + p.vermelho * (-10);
  return Math.round(total * 10) / 10;
}

function mergeMonths(byMonth) {
  const map = {};
  for (const players of Object.values(byMonth)) {
    for (const p of players) {
      if (!map[p.nome]) {
        map[p.nome] = { ...p };
      } else {
        map[p.nome].gols     += p.gols;
        map[p.nome].capa     += p.capa;
        map[p.nome].presenca += p.presenca;
        map[p.nome].vitorias += p.vitorias;
        map[p.nome].amarelo  += p.amarelo;
        map[p.nome].vermelho += p.vermelho;
      }
    }
  }
  return Object.values(map).map(p => ({ ...p, pontos: calcPontos(p) }));
}

async function fetchSheet(sheetName) {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
    const resp = await fetch(csvUrl);
    if (!resp.ok) return null;
    const text = await resp.text();
    // Google retorna HTML quando a aba não existe
    if (text.trim().startsWith('<')) return null;
    const rows = processRows(parseCSV(text));
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

const normName = (s) => (s || '').trim().toLowerCase();

export default async function handler(req) {
  const url = new URL(req.url);
  const month = url.searchParams.get('month') || 'all';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // ── 1) Goleiros: aba GOL_26 é a fonte canônica (dados acumulados + lista de nomes)
    const goleirosRaw = (await fetchSheet(GOLEIROS_SHEET)) || [];
    const goleirosSet = new Set(goleirosRaw.map(g => normName(g.nome)));

    // Se o CSV já traz Total Pontos, usa; senão, recalcula
    const goleiros = goleirosRaw.map(g => ({
      ...g,
      pontos: g.pontos || calcPontos(g),
    }));

    // ── 2) Jogadores de linha: abas mensais, removendo qualquer nome que esteja na GOL_26
    const months = month === 'all' ? MONTH_SHEETS : [month];
    const byMonth = {};
    await Promise.all(months.map(async (m) => {
      const rows = await fetchSheet(m);
      if (rows && rows.length > 0) byMonth[m] = rows;
    }));

    let jogadores;
    if (month === 'all') {
      jogadores = mergeMonths(byMonth);
    } else {
      jogadores = (byMonth[month] || []).map(p => ({
        ...p,
        pontos: p.pontos || calcPontos(p),
      }));
    }

    // Remove goleiros do ranking dos jogadores de linha
    jogadores = jogadores.filter(p => !goleirosSet.has(normName(p.nome)));

    return new Response(
      JSON.stringify({ ok: true, data: jogadores, goleiros }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
