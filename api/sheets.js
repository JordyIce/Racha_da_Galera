export const config = { runtime: 'edge' };

const SHEET_ID = '1Evb7ZeUtS_gNiXDLAtuxMj4yzXAlNY2MK5KgKJu-HIQ';

const MONTH_SHEETS = [
  'JAN_26', 'FEV_26', 'MAR_26', 'ABR_26', 'MAI_26', 'JUN_26',
  'JUL_26', 'AGO_26', 'SET_26', 'OUT_26', 'NOV_26', 'DEZ_26',
];

const GOLEIROS_SHEET = 'GOL_26';
const MAX_TRIES = 3;

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

const normName = (s) => (s || '').trim().toLowerCase();

// Soma as abas mensais. A chave é o nome normalizado (sem diferença de
// maiúscula/minúscula ou espaço), para o mesmo jogador não virar duas linhas.
function mergeMonths(byMonth) {
  const map = {};
  for (const players of Object.values(byMonth)) {
    for (const p of players) {
      const key = normName(p.nome);
      if (!map[key]) {
        map[key] = { ...p };
      } else {
        map[key].gols     += p.gols;
        map[key].capa     += p.capa;
        map[key].presenca += p.presenca;
        map[key].vitorias += p.vitorias;
        map[key].amarelo  += p.amarelo;
        map[key].vermelho += p.vermelho;
      }
    }
  }
  return Object.values(map).map(p => ({ ...p, pontos: calcPontos(p) }));
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Devolve { rows, status }. status: ok | empty | missing | http_XXX | error
// Tenta até MAX_TRIES vezes antes de desistir, para uma falha passageira
// do Google não derrubar uma aba inteira da soma.
async function fetchSheet(sheetName) {
  const csvUrl =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv` +
    `&sheet=${encodeURIComponent(sheetName)}&_=${Date.now()}`;
  let lastStatus = 'error';

  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      const resp = await fetch(csvUrl, { cache: 'no-store' });
      if (!resp.ok) {
        lastStatus = `http_${resp.status}`;
      } else {
        const text = await resp.text();
        // Google retorna HTML quando a aba não existe
        if (text.trim().startsWith('<')) return { rows: [], status: 'missing' };
        const rows = processRows(parseCSV(text));
        return { rows, status: rows.length > 0 ? 'ok' : 'empty' };
      }
    } catch {
      lastStatus = 'error';
    }
    if (attempt < MAX_TRIES) await sleep(300 * attempt);
  }
  return { rows: [], status: lastStatus };
}

export default async function handler(req) {
  const url = new URL(req.url);
  const month = url.searchParams.get('month') || 'all';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    // ── 1) Goleiros: aba GOL_26 é a fonte canônica
    const gol = await fetchSheet(GOLEIROS_SHEET);
    const goleirosRaw = gol.rows;
    const goleirosSet = new Set(goleirosRaw.map(g => normName(g.nome)));

    const goleiros = goleirosRaw.map(g => ({
      ...g,
      pontos: g.pontos || calcPontos(g),
    }));

    // ── 2) Jogadores de linha: abas mensais
    const months = month === 'all' ? MONTH_SHEETS : [month];
    const byMonth = {};
    const sheetStatus = { [GOLEIROS_SHEET]: gol.status };

    await Promise.all(months.map(async (m) => {
      const { rows, status } = await fetchSheet(m);
      sheetStatus[m] = status;
      if (rows.length > 0) byMonth[m] = rows;
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

    jogadores = jogadores.filter(p => !goleirosSet.has(normName(p.nome)));

    return new Response(
      JSON.stringify({
        ok: true,
        data: jogadores,
        goleiros,
        // diagnóstico: status de cada aba lida nesta chamada
        meta: { month, sheets: sheetStatus, generatedAt: new Date().toISOString() },
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
