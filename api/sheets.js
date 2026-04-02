export const config = { runtime: 'edge' };

const SHEET_ID = '1Evb7ZeUtS_gNiXDLAtuxMj4yzXAlNY2MK5KgKJu-HIQ';
const MONTH_SHEETS = [
  'JAN_26', 'FEV_26', 'MAR_26', 'ABR_26', 'MAI_26', 'JUN_26',
  'JUL_26', 'AGO_26', 'SET_26', 'OUT_26', 'NOV_26', 'DEZ_26',
];

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
  const n = parseInt((v || '').replace(/[^\d-]/g, ''), 10);
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
  return p.gols * 3 + p.capa * 10 + p.presenca * 3 + p.vitorias * 3
    + p.amarelo * (-5) + p.vermelho * (-10);
}

function mergeMonths(byMonth) {
  const map = {};
  for (const players of Object.values(byMonth)) {
    for (const p of players) {
      if (!map[p.nome]) {
        map[p.nome] = { ...p };
      } else {
        map[p.nome].gols += p.gols;
        map[p.nome].capa += p.capa;
        map[p.nome].presenca += p.presenca;
        map[p.nome].vitorias += p.vitorias;
        map[p.nome].amarelo += p.amarelo;
        map[p.nome].vermelho += p.vermelho;
      }
    }
  }
  return Object.values(map).map(p => ({ ...p, pontos: calcPontos(p) }));
}

export default async function handler(req) {
  const url = new URL(req.url);
  const month = url.searchParams.get('month') || 'all';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const months = month === 'all' ? MONTH_SHEETS : [month];
    const byMonth = {};

    await Promise.all(months.map(async (m) => {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${m}`;
        const resp = await fetch(csvUrl);
        if (!resp.ok) return; // aba ainda não existe, ignora
        const text = await resp.text();
        // Google retorna HTML quando a aba não existe
        if (text.trim().startsWith('<')) return;
        const rows = processRows(parseCSV(text));
        if (rows.length > 0) byMonth[m] = rows;
      } catch (e) {
        // ignora erros de abas inexistentes
      }
    }));

    const data = month === 'all' ? mergeMonths(byMonth) : byMonth[month];

    return new Response(JSON.stringify({ ok: true, data }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
