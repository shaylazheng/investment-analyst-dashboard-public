import {test} from 'node:test';import assert from 'node:assert/strict';
import {payload,company,prices,screen,stockStats,correlations} from './data.js';
import {createApp} from './server.js';
test('retained company routes respond without any upstream fetch',()=>{
 const fetch=globalThis.fetch;globalThis.fetch=()=>{throw Error('external call');};
 try{for(const ticker of ['NVDA','MSFT','AAPL'])for(const route of ['/peers/summary','/peers/fundamentals','/peers/suggest','/management','/management/background','/industry','/valuation','/valuation/peers','/outlook','/outlook/analysts','/graph/data','/graph/flows','/graph/financials','/graph/metrics/company']){assert.ok(payload(route,{ticker}),route);}}finally{globalThis.fetch=fetch;}
});
test('prices, stock statistics, summary and valuation agree across companies',()=>{for(const ticker of ['NVDA','MSFT','AAPL']){const c=company(ticker),s=payload('/peers/summary',{ticker}),v=payload('/valuation',{ticker}),p=prices({tickers:ticker}).series[ticker];assert.equal(p.close.at(-1),c.price);assert.equal(s.stock.price,v.price.price);assert.equal(s.scale.revenueRaw,v.inputs.revenue);assert.equal(s.segmentation.rows.reduce((n,r)=>n+r.revenue,0),s.scale.revenueRaw);assert.equal(stockStats(ticker).coverage.last,'2026-09-10');}});
test('DCF slider inputs change the calculated result and invalid assumptions fail',()=>{const a=payload('/valuation',{ticker:'NVDA',wacc:.09}),b=payload('/valuation',{ticker:'NVDA',wacc:.12});assert.ok(b.implied.growth>a.implied.growth);assert.ok(payload('/valuation',{wacc:.01,terminal:.02}).error);});
test('insider trade, role, value, sort, grouping and pagination controls affect rows',()=>{
 const sells=screen({trade_type:'S'});assert.ok(sells.total>0);assert.ok(sells.rows.every(r=>r.trans_code==='S'));
 const ceo=screen({is_ceo:'true',value_low:500000});assert.ok(ceo.rows.every(r=>r.is_ceo&&r.value>=500000));
 const one=screen({limit:20,page:1}),two=screen({limit:20,page:2});assert.equal(one.rows.length,20);assert.equal(two.rows.length,20);assert.ok(one.has_more);assert.equal(new Set([...one.rows,...two.rows].map(r=>r.id)).size,40);
 const grouped=screen({group_by:'company'});assert.equal(grouped.rows.length,5);
 const sorted=screen({sort:'value',descending:'false'}).rows;assert.ok(sorted.every((r,i)=>!i||r.value>=sorted[i-1].value));
 assert.equal(screen({ticker:'MISSING'}).total,0);
});
test('correlation grid is symmetric, bounded and has a unit diagonal',()=>{const c=correlations('NVDA,MSFT,AAPL');for(const a of c.tickers)for(const b of c.tickers){assert.equal(c.matrix[a][b],c.matrix[b][a]);assert.ok(Math.abs(c.matrix[a][b])<=1);if(a===b)assert.equal(c.matrix[a][b],1);}});
test('Report endpoints stay absent for GET and POST',async()=>{const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));try{const base=`http://127.0.0.1:${server.address().port}`;for(const method of ['GET','POST'])assert.equal((await fetch(base+'/api/report/build',{method})).status,404);}finally{server.close();}});
