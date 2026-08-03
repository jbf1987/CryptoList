const fs = require('fs/promises');

const ids = [
  'bitcoin',
  'ethereum',
  'chainlink',
  'cardano',
  'polkadot',
  'render-token'
].join(',');

const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=false&price_change_percentage=1h,24h,7d,30d`;

async function main() {
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();

    const mapped = data.map(c => ({
      id: c.id,
      symbol: c.symbol ? c.symbol.toUpperCase() : null,
      name: c.name,
      price_usd: c.current_price,
      change_1h_pct: c.price_change_percentage_1h_in_currency,
      change_24h_pct: c.price_change_percentage_24h_in_currency,
      change_7d_pct: c.price_change_percentage_7d_in_currency,
      change_30d_pct: c.price_change_percentage_30d_in_currency,
      market_cap: c.market_cap,
      volume_24h: c.total_volume,
      market_cap_rank: c.market_cap_rank
    }));

    const out = {
      updated_at: new Date().toISOString(),
      source: url,
      coins: mapped
    };

    await fs.mkdir('data', { recursive: true });
    await fs.writeFile('data/marketdata.json', JSON.stringify(out, null, 2) + '\n', 'utf8');
    console.log('Wrote data/marketdata.json');
  } catch (err) {
    console.error('Failed to fetch/write market data:', err);
    process.exit(1);
  }
}

main();
