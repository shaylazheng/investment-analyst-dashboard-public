// All observations in this module are generated examples, not market observations.
export const stamp = '2026-09-10T12:00:00.000Z';
export const companies = ['NVDA','MSFT','AAPL','AMD','TSM'].map((ticker,i)=>({
 id:ticker,ticker,name:`Demo ${['Semiconductors','Software','Devices','Compute','Foundry'][i]}`,
 role:i<3?'Core':'Supplier',sector:'Technology',cik:String(9000000+i),hasSecData:false,
 revenue:40e9+i*10e9,netIncome:8e9+i*2e9,rnd:4e9+i*1e9,marketCap:400e9+i*50e9,
}));
export function series(id='SP500') {
 const seed=[...id].reduce((s,c)=>s+c.charCodeAt(0),0);
 const bases={SP500:4800,NASDAQCOM:16000,DJIA:38000,VIXCLS:18,CPIAUCSL:310,ICSA:220000,M2SL:21000,DEXUSEU:1.08,DCOILWTICO:75,DCOILBRENTEU:80,DTWEXBGS:120,UMCSENT:70};
 const base=bases[id]??(id.startsWith('T10')?0.3:4.2);
 return {demo:true,observations:Array.from({length:960},(_,i)=>({date:new Date(Date.UTC(2026,8,10-959+i)).toISOString().slice(0,10),value:String(+(base*(1+0.08*i/960+0.025*Math.sin(i/32+seed))).toFixed(4))}))};
}
export function summary(ticker='NVDA') {
 const co=companies.find(c=>c.ticker===ticker)||{...companies[0],ticker,id:ticker};
 return {demo:true,ticker,name:co.name,exists:true,identity:{name:co.name,ticker,sector:'Technology',industry:'Synthetic technology',exchanges:['DEMO'],sic:'3570',sicDescription:'Illustrative technology business',country:'US'},
 business:{description:'A fictional technology company used to demonstrate company research workflows.',employees:{count:18000,asOf:"2025-12-31",quote:"Synthetic example"}},
 scale:{revenue:co.revenue,netIncome:co.netIncome,marketCap:co.marketCap},relationships:{supplier:[{ticker:'TSM',name:'Demo Foundry'}],customer:[],partner:[],competitor:[]},
 competitors:[],concentration:[],outlook:{catalysts:[],guidance:null},sources:[],absent:{},updatedAt:stamp};
}
export const alerts={demo:true,channel:{channel:'demo',configured:false},sources:[{
 id:'demo',title:'Synthetic price monitor',rule:'Illustrative one-percent move',summary:'Demo index −1.20% · synthetic event',running:false,active:false,
 source:{name:'Generated fixtures',polls:1,errors:0,lastOk:stamp},facts:[{label:'Mode',value:'Offline simulation'}],actions:[],detail:null,
 log:[{at:stamp,text:'Synthetic index move −1.20%',events:[],delivery:{ok:true,channel:'demo'}}],
}]};
function basePayload(route,query={}) {
 if(route==='/fred')return series(query.series);
 if(route==='/health')return {ok:true,demo:true};
 if(route==='/version')return {version:'public-demo-1'};
 if(route.startsWith('/refresh'))return {ok:true,running:false,state:'done',results:[],demo:true};
 if(route==='/calendar')return {demo:true,start:'2026-09-10',end:'2026-09-30',generated:stamp,events:[{date:'2026-09-11',time:'8:30 AM',name:'Sample inflation release',cat:'econ',src:'Synthetic fixture',note:'Illustrative scheduled event',sortMins:510},{date:'2026-09-14',time:'After close',name:'Sample earnings release',cat:'earnings',src:'Synthetic fixture',companies:[{symbol:'NVDA',name:'Demo Semiconductors',sector:'Technology',marketCap:400e9,when:'After close'}]}]};
 if(route==='/news')return {demo:true,updated:stamp,items:['Demand rises in illustrative semiconductor scenario','Synthetic yield curve steepens','Sample earnings show margin expansion'].map((title,i)=>({title,date:stamp,pubDate:stamp,source:'Demo News',theme:['Technology','Rates','Earnings'][i],themes:['Demo'],link:'#news',description:'Fictional headline generated for the public demonstration.'}))};
 if(route==='/alerts')return alerts;
 if(route==='/alerts/evidence')return {demo:true,entries:alerts.sources[0].log.map(l=>({...l,sourceId:'demo',sourceTitle:'Synthetic price monitor',outcome:'test'})),feeds:[]};
 if(route==='/graph/data')return {demo:true,graph:{nodes:companies,links:[{source:'NVDA',target:'TSM',type:'supplier',relationship:'Synthetic supply relationship'},{source:'MSFT',target:'NVDA',type:'customer'}]},earnings:{},sources:{},signals:[]};
 if(route==='/graph/tickers')return companies.filter(c=>c.ticker.includes((query.q||'').toUpperCase()));
 if(route==='/graph/concentration/all')return {};
 if(route==='/peers/summary')return summary(query.ticker);
 if(route==='/peers/resolve')return {demo:true,ticker:query.ticker||'NVDA',name:summary(query.ticker).name,cik:'9000000'};
 if(route==='/peers/notes/index')return {};
 if(route==='/peers/notes')return {demo:true,exists:true,note:'Synthetic company used for the public demo.'};
 if(route==='/peers/suggest')return {demo:true,peers:companies};
 if(route==='/insider/stats')return {demo:true,filings:150,transactions:150,latest:stamp};
 if(route==='/insider/vocab')return {roles:[],sectors:[],screens:[],screen_groups:[]};
 if(route==='/insider/stats')return {demo:true,filings:5,transactions:5,issuers:5,owners:5};
 if(route==='/insider/screener')return {demo:true,rows:companies.map((c,i)=>({ticker:c.ticker,issuer_name:c.name,owner_name:`Demo Officer ${i+1}`,filing_datetime:stamp,transaction_date:'2026-09-09',transaction_code:'P',price:100+i*10,shares:1000,value:100000+i*10000,is_officer:true,officer_title:'CEO'})),total:5,limit:100,offset:0};
 if(route==='/insider/prices'){ const obs=series('SP500').observations.slice(-180); const values=obs.map(o=>Number(o.value)/40); return {demo:true,series:Object.fromEntries((query.tickers||'NVDA').split(',').map(t=>[t,{dates:obs.map(o=>o.date),values,close:values,open:values.map(v=>v*.998),high:values.map(v=>v*1.01),low:values.map(v=>v*.99),volume:values.map(()=>1000000)}]))}; }
 if(route==='/management')return {demo:true,ticker:query.ticker,name:summary(query.ticker).name,officers:[],directors:[],owners:[],sources:[],absent:{}};
 if(route==='/industry')return {demo:true,ticker:query.ticker,name:summary(query.ticker).name,classification:{sic:'3570',sector:'Technology'},sources:[],offerings:[]};
 if(route.startsWith('/outlook'))return {demo:true,ticker:query.ticker,name:summary(query.ticker).name,risks:[],catalysts:[],analysts:[],sources:[]};
 return null;
}

import {METRICS,CATEGORIES} from '../packages/core/lib/ratios.js';
import {inputsFrom,impliedGrowth,fairValue} from './dcf.js';
const date='2026-09-10';
const source={kind:'local',label:'Generated sample',detail:'Synthetic illustration; no real filing or data feed.',url:'./demo-data.html'};
const filing={form:'Demo',filed:date,accn:'synthetic',url:'./demo-data.html'};
export function company(ticker='NVDA') {
 const t=String(ticker).toUpperCase(); const n=[...t].reduce((v,c)=>v+c.charCodeAt(0),0)%11;
 return {...(companies.find(c=>c.ticker===t)||companies[0]),ticker:t,id:t,name:`Demo ${t} Technologies`,revenue:(40+n*5)*1e9,netIncome:(8+n)*1e9,price:100+n*8,shares:1e9,margin:.18+n*.005};
}
export function fundamentals(t) {
 const c=company(t),revenue=c.revenue;
 const values={revenue,revenueGrowth:.08,revenueCagr3y:.08,marketCap:c.price*c.shares,netIncome:c.netIncome,grossMargin:.55,operatingMargin:.26,fcfMargin:c.margin,roic:.2,roe:.24,netDebtToEbitda:.4,currentRatio:2.1,pe:c.price/(c.netIncome/c.shares),evToEbitda:(c.price*c.shares+3e9)/(revenue*.3),fcfYield:revenue*c.margin/(c.price*c.shares)};
 return {demo:true,ticker:c.ticker,meta:{...c,sic:'3570',sicDescription:'Synthetic technology',currency:'USD'},frame:'CY2025',basis:'annual',values,notes:Object.fromEntries(METRICS.map(m=>[m.id,'Generated example; no source filing.'])),derived:{},coverage:{},fiscalYearEnd:'1231',isCalendarFY:true,warnings:[]};
}
function companySummary(t) {
 const c=company(t),f=fundamentals(t),s=summary(t);
 return {...s,segmentation:segments(t),geography:{...segments(t),rows:segments(t).rows.map((r,i)=>({...r,label:i?'International':'Domestic'}))},asOf:date,identity:{...s.identity,name:c.name,fiscalYearEnd:'1231',hq:{city:'Demo City',state:'Example'},foundedYear:2000},business:{...s.business,description:`${c.name} is a fictional technology business producing hardware, software and support services. All figures and narratives in this public dashboard are generated examples.`,segments:{count:2,names:['Products','Services']},riskGroups:['Customer concentration','Competitive pricing']},scale:{frame:'CY2025',revenueRaw:c.revenue,values:f.values,years:Array.from({length:5},(_,i)=>({frame:`CY${2021+i}`,end:`${2021+i}-12-31`,metrics:{...f.values,revenue:c.revenue/1.08**(4-i),grossMargin:.51+i*.01}}))},stock:stockStats(t),competitors:companies.filter(x=>x.ticker!==t).map(x=>({ticker:x.ticker,name:company(x.ticker).name,why:'Illustrative peer in the same generated industry'})),relationships:{supplier:[{ticker:'TSM',name:'Demo Foundry',detail:'Illustrative component supplier'}],customer:[],partner:[],competitor:[]},sources:[source]};
}
function valuation(t,q) {
 const c=company(t);const a={wacc:Number(q.wacc??.09),terminal:Number(q.terminal??.025),years:Number(q.years??10),fade:q.fade!=='0',dilution:Number(q.dilution??.01)};
 if(!Object.values(a).every(v=>typeof v==='boolean'||Number.isFinite(v))||a.years<1||a.years>30||a.wacc<=a.terminal)return {error:'Choose a positive horizon and discount rate above terminal growth.',demo:true};
 const inputs=inputsFrom({revenue:c.revenue,cfo:c.revenue*(c.margin+.04),capex:c.revenue*.04,cash:5e9,debt:8e9,shares:c.shares,price:c.price});
 const model={...inputs,...a,targetEv:inputs.ev};const waccAxis=[.06,.075,.09,.105,.12];
 return {demo:true,ticker:c.ticker,name:c.name,sector:'Synthetic technology',frame:'CY2025',instantFrame:'CY2025Q4I',price:{price:c.price,date},inputs,assumptions:a,implied:impliedGrowth(model),trailingGrowth:.08,evToFcf:inputs.ev/inputs.fcf,waccAxis,grid:[5,10,15].map(years=>({years,cells:waccAxis.map(wacc=>({wacc,...impliedGrowth({...model,years,wacc})}))})),scenarios:[0,.05,.1,.15,.2].map(growth=>{const v=fairValue({...model,growth});return {...v,growth,upside:v.perShare/c.price-1};}),missing:[],warnings:[],trace:{},filings:[],refused:false,...a};
}
function management(t) {
 const c=company(t);const people=['Alex Morgan','Jordan Lee','Taylor Chen'].map((name,i)=>({cik:String(9900000+i),name:`Demo ${name}`,title:['CEO','CFO','Director'][i],status:'current',forms:['3','4'],filings:4,since:'2022-01-01',seenSince:'2022-01-01',tenureYears:4.7,monthsSinceFiling:0,trades:{hasAny:false},window:{trades:2,openMarketTrades:2,netValue:10000*(i+1),bought:10000*(i+1),sold:0,ownPct:10,sharesStart:10000,sharesEnd:11000},sources:[]}));
 return {demo:true,ticker:t,name:c.name,asOf:date,officers:people.slice(0,2),directors:people.slice(2),others:[],counts:{officers:2,directors:1,lapsed:0,people:3},turnover:[],turnoverWindowYears:3,window:{days:60,since:'2026-07-12',covered:true},documents:{proxy:filing,annual:filing},coverage:{ownershipFilingsRead:12,ownershipFilingsTotal:12,unreadable:0,oldestRead:'2022-01-01',truncated:false},sources:{}};
}
function industry(t) {
 const cs=companies.map(x=>company(x.ticker)).sort((a,b)=>b.revenue-a.revenue),total=cs.reduce((v,c)=>v+c.revenue,0);
 const top=cs.map((c,i)=>({...c,rank:i+1,share:c.revenue/total,netMargin:c.netIncome/c.revenue,isSelf:c.ticker===t,revenueGrowth:.08}));
 return {demo:true,identity:{ticker:t,name:company(t).name},classification:{sic:'3570',description:'Synthetic technology industry',division:{letter:'D',label:'Manufacturing'},hierarchy:[]},membership:{registrants:5,listedCount:5,truncated:false},measures:{period:'CY2025',priorPeriod:'CY2024',measuredCount:5,totalRevenue:total,medianRevenue:cs[2].revenue,p25Revenue:cs[3].revenue,p75Revenue:cs[1].revenue,medianNetMargin:.2},self:top.find(c=>c.ticker===t),top,concentration:{cr4:top.slice(0,4).reduce((s,c)=>s+c.share,0),cr8:1,hhi:top.reduce((s,c)=>s+(c.share*100)**2,0)},metrics:METRICS.filter(m=>['grossMargin','fcfMargin','roe'].includes(m.id)).map(m=>({...m,n:5,p25:.18,median:.22,p75:.26,self:fundamentals(t).values[m.id],selfPct:.5})),sizes:[],history:Array.from({length:5},(_,i)=>({period:`CY${2021+i}`,totalRevenue:total/1.08**(4-i),measuredCount:5,medianNetMargin:.18+i*.005,cr4:.83,hhi:2050})),insider:{windowDays:90,buys:{top:[],total:0,companies:0,filings:0},sells:{top:[],total:0,companies:0,filings:0}},absent:{},sources:[source]};
}
function outlook(t) {
 return {demo:true,ticker:t,name:company(t).name,asOf:date,company:{risks:{filing,headings:[{text:'Demand could slow in the generated scenario.'},{text:'Customer concentration may amplify revenue volatility.'}],truncated:false},foreignAnnual:null,update:{filing,affirmsAnnual:true},catalysts:{quarter:'Q3 2026',guidance:'Illustrative revenue growth of 8% with stable margins.',items:[{date:'2026-Q4',event:'Sample product launch'},{date:'2027-H1',event:'Illustrative capacity expansion'}],sources:{},asOf:date}},street:{consensus:{available:true,covered:true,totalRows:3,rows:[{periodEnd:'2026-06-30',measure:'EPS',meanEst:2,numEst:8,actual:2.1,surprisePct:.05},{periodEnd:'2026-09-30',measure:'EPS',meanEst:2.2,numEst:8,actual:null},{periodEnd:'2026-12-31',measure:'EPS',meanEst:2.4,numEst:8,actual:null}]},actions:[],actionsOk:true,debate:[],debateOk:true,queries:{},searchedAs:company(t).name},sources:{}};
}
const notes=new Map();
export function payload(route,query={},body={},method='GET') {
 const t=String(query.ticker||body.ticker||'NVDA').toUpperCase();
 if(route.startsWith('/report'))return null;
 if(route==='/peers/summary')return companySummary(t);
 if(route==='/graph/data')return graphData();
 if(route==='/peers/metrics')return {metrics:METRICS,categories:CATEGORIES};
 if(route==='/peers/fundamentals')return fundamentals(t);
 if(route==='/peers/resolve')return {...company(t),demo:true};
 if(route==='/peers/suggest')return {ticker:t,suggestions:companies.filter(c=>c.ticker!==t).map(c=>({...company(c.ticker),source:'Synthetic industry peer',why:'Generated peer',sources:[]})),sources:[source]};
 if(route==='/peers/provenance')return {demo:true,ticker:t,frame:query.frame||'CY2025',instantFrame:'CY2025Q4I',filings:[],inputs:{},ratios:{},trace:{},warnings:['All inputs are generated fixtures. No real filing was read.']};
 if(route==='/peers/notes/index')return {tickers:[...notes.keys()]};
 if(route==='/peers/notes'){if(method==='POST')notes.set(t,body);return {ticker:t,exists:true,data:notes.get(t)||{thesis:'Illustrative technology demand scenario.',sample:true,risks:['Price competition'],falsify:['Two quarters of declining generated revenue']},demo:true};}
 if(route==='/peers/news')return {items:[{title:`Synthetic ${t} scenario: demand expands`,source:'Demo News',date,link:'./demo-data.html',tickers:[t]}]};
 if(route==='/peers/insider'||route==='/peers/insider/record')return peerFlow(query,route.endsWith('/record'));
 if(route==='/valuation')return valuation(t,query);
 if(route==='/valuation/peers'){const rows=companies.map(c=>{const v=valuation(c.ticker,{});return {ticker:c.ticker,name:c.name,evToFcf:v.evToFcf,fcfMargin:v.inputs.margin};});const others=rows.filter(c=>c.ticker!==t).map(c=>c.evToFcf).sort((a,b)=>a-b),median=(others[Math.floor((others.length-1)/2)]+others[Math.floor(others.length/2)])/2,self=valuation(t,{}).evToFcf;return {ticker:t,rows,self,median,n:others.length,premium:self/median-1};}
 if(route==='/management')return management(t);
 if(route==='/management/background')return {demo:true,bio:{kind:'demo',roles:[{org:'Demo Technologies',role:'Executive',period:'2022–present'}],quote:`A fictional executive in the ${t} sample company.`,source:{url:'./demo-data.html',label:'Generated profile'}},news:[],searchedAs:'Demo executive'};
 if(route==='/industry')return industry(t);
 if(route==='/outlook')return outlook(t);
 if(route==='/outlook/risk-gists')return {accn:'synthetic',gists:['Demand uncertainty','Customer concentration']};
 if(route==='/outlook/analysts')return {demo:true,ticker:t,asOf:stamp,ttlMinutes:0,sources:[{id:'demo',name:'Synthetic analyst panel',url:'./demo-data.html',ok:true,score5:2,sourceLabel:'Illustrative Buy',analysts:8,priceTarget:company(t).price*1.12,basis:'Generated demonstration rating'}],changes:[],trend:null,aggregate:null};
 if(['/graph/refresh','/graph/scan','/graph/sweep','/graph/pull','/graph/signals','/peers/scan'].includes(route))return {demo:true,ok:true,running:false,state:'done',status:'done',log:['Synthetic fixtures ready'],result:{},exitCode:0};
 if(route==='/graph/correlation/matrix')return correlations(query.tickers);
 if(route==='/graph/financials')return {ok:true,...fundamentals(t),figures:{concepts:Object.fromEntries(['revenue','netIncome'].map(id=>[id,{label:id,val:fundamentals(t).values[id],unit:'USD',basis:'Generated annual sample',parts:[]}]))}};
 if(route==='/graph/concentration')return {ok:true,ticker:t,customers:[],suppliers:[],items:[],sources:[source]};
 if(route==='/graph/flows')return {ok:true,ticker:t,stocks:{receivables:{value:2e9},inventory:{value:1e9},payables:{value:1.5e9}},derived:{dso:18.25,dio:20.28,dpo:30.42,cashConversion:8.11,freeCashFlow:company(t).revenue*company(t).margin},note:'Generated balance-sheet example.'};
 if(route==='/graph/correlation')return {ok:true,ticker:t,pairs:companies.filter(c=>c.ticker!==t).map(c=>({ticker:c.ticker,other:c.ticker,correlation:.6,r:.6,n:180})),n:180,window:180};
 if(route==='/graph/metrics/company')return {ok:true,ticker:t,metrics:METRICS.map(m=>({...m,value:fundamentals(t).values[m.id]})),frame:'CY2025',sector:'Synthetic technology',sicKnown:true,hasPrice:true};
 if(route==='/graph/private')return {ok:true,name:query.name,description:'Fictional supplier used in the public demonstration.',sources:[source]};
 if(route==='/insider/screener')return screen(query);
 if(route==='/insider/prices')return prices(query);
 if(route==='/insider/stats')return {demo:true,filings:150,transactions:150,latest:stamp};
 if(route==='/insider/vocab')return {roles:['CEO','CFO'],date_presets:[{value:'',label:'Any time'},{value:'7',label:'Last 7 days'},{value:'30',label:'Last 30 days'},{value:'90',label:'Last 90 days'}],age_presets:[{value:'',label:'Any age'},{value:'24',label:'Last 24 hours'},{value:'168',label:'Last 7 days'}],sic_sectors:[{code:'',label:'All sectors'},{code:'tech',label:'Synthetic technology'}],screens:[],screen_groups:[]};
 if(['/insight','/ask','/claude','/brief','/concept'].includes(route))return {content:`Generated ${t} scenario: compare cash-flow margins, peer multiples and growth assumptions. Increasing the discount rate raises the growth needed to justify the same price.`,answer:'Illustrative explanation generated locally.',demo:true};
 if(route==='/fred')return series(query.series); // Local synthetic series only; no FRED adapter.
 return basePayload(route,query);
}

export function prices(q={}) {
 const dates=Array.from({length:960},(_,i)=>new Date(Date.UTC(2026,8,10-959+i)).toISOString().slice(0,10));
 const out={};for(const t of (q.tickers||'NVDA').split(',')){
 const c=company(t),raw=dates.map((_,i)=>1+i*.0002+.025*Math.sin(i/27)+.015*Math.sin(i/(19+t.charCodeAt(0)%13)+t.charCodeAt(1)));
 const close=raw.map(v=>c.price*v/raw.at(-1));const start=q.start||dates[0];let ix=dates.findIndex(d=>d>=start);if(ix<0)ix=dates.length-1;
 const ds=dates.slice(ix),cs=close.slice(ix);out[t]={dates:ds,close:cs,values:q.rebase==='true'?cs.map(v=>100*v/cs[0]):cs,open:cs.map(v=>v*.998),high:cs.map(v=>v*1.012),low:cs.map(v=>v*.987),volume:cs.map((_,i)=>1000000+i*1000)};
 }return {demo:true,series:out};
}
export function screen(q={}) {
 const isTrue=v=>v===true||v==='true'||v==='1';
 let rows=Array.from({length:150},(_,i)=>{
 const c=company(companies[i%5].ticker),days=i%60,when=new Date(Date.UTC(2026,8,10-days,12)).toISOString();const code=['P','S','A','M','F'][Math.floor(i/5)%5];
 return {ticker:c.ticker,issuer_name:c.name,owner_name:`Demo Officer ${i%15+1}`,filing_datetime:when,trans_date:when.slice(0,10),trans_code:code,shares:1000*(i%10+1),price_per_share:c.price,value:c.price*1000*(i%10+1),delta_own:5+i%20,pct_owned:.2+i%5,r1w:(i%9)-3,r1m:(i%13)-5,is_officer:i%3!==2,is_director:i%3===2,is_ceo:i%3===0,is_cfo:i%3===1,is_ten_percent:false,officer_title:['CEO','CFO','Director'][i%3],accession_number:null,id:`demo-${i}`,owner_cik:String(9900000+i%15),sic:3570,sic_sector:'tech',n_owners:1,filing_delay:0,is_derivative:false,implausible:false};
 });
 const has=k=>q[k]!==''&&q[k]!=null;
 for(const [key,field] of [['ticker','ticker'],['issuer_name','issuer_name'],['insider_name','owner_name']])if(has(key))rows=rows.filter(r=>r[field].toLowerCase().includes(String(q[key]).toLowerCase()));
 if(has('search'))rows=rows.filter(r=>[r.ticker,r.issuer_name,r.owner_name].some(v=>v.toLowerCase().includes(String(q.search).toLowerCase())));
 if(has('trade_type'))rows=rows.filter(r=>r.trans_code===q.trade_type);
 if(has('sic_sector'))rows=rows.filter(r=>r.sic_sector===q.sic_sector);
 const roles=Object.keys(q).filter(k=>k.startsWith('is_')&&isTrue(q[k]));if(roles.length)rows=rows.filter(r=>q.role_match_any==='false'?roles.every(k=>r[k]):roles.some(k=>r[k]));
 for(const [lo,hi,field] of [['value_low','value_high','value'],['price_low','price_high','price_per_share'],['qty_low','qty_high','shares'],['owned_change_low','owned_change_high','delta_own'],['pct_owned_min','pct_owned_max','pct_owned'],['sic_low','sic_high','sic'],['filing_delay_min','filing_delay_max','filing_delay']]){
 if(has(lo))rows=rows.filter(r=>r[field]>=Number(q[lo]));if(has(hi))rows=rows.filter(r=>r[field]<=Number(q[hi]));
 }
 for(const [key,field,after] of [['filed_after','filing_datetime',true],['filed_before','filing_datetime',false],['traded_after','trans_date',true],['traded_before','trans_date',false]])if(has(key))rows=rows.filter(r=>after?r[field].slice(0,10)>=q[key]:r[field].slice(0,10)<=q[key]);
 const now=Date.parse(stamp),age=r=>(now-Date.parse(r.filing_datetime))/3600000;
 if(has('age_preset'))rows=rows.filter(r=>age(r)<=Number(q.age_preset));
 for(const key of ['filed_within_days','traded_within_days'])if(has(key))rows=rows.filter(r=>age(r)<=Number(q[key])*24);
 if(has('age_max_hours'))rows=rows.filter(r=>age(r)<=Number(q.age_max_hours));if(has('age_min_hours'))rows=rows.filter(r=>age(r)>=Number(q.age_min_hours));
 const aggregates=new Map();for(const r of rows){const a=aggregates.get(r.ticker)||{filings:0,insiders:new Set(),officers:new Set(),value:0};a.filings++;a.insiders.add(r.owner_name);if(r.is_officer)a.officers.add(r.owner_name);a.value+=r.value;aggregates.set(r.ticker,a);}
 for(const [lo,hi,metric] of [['num_filings_min','num_filings_max','filings'],['num_insiders_min','num_insiders_max','insiders'],['num_officers_min','num_officers_max','officers'],['group_value_min','group_value_max','value']]){
 const val=r=>{const v=aggregates.get(r.ticker)[metric];return v instanceof Set?v.size:v;};if(has(lo))rows=rows.filter(r=>val(r)>=Number(q[lo]));if(has(hi))rows=rows.filter(r=>val(r)<=Number(q[hi]));
 }
 if(isTrue(q.cluster)||has('min_insiders')){const days=Number(q.cluster_window_days)||7;const min=Number(q.min_insiders)||2;rows=rows.filter(r=>new Set(rows.filter(x=>x.ticker===r.ticker&&x.trans_code==='P'&&Math.abs(Date.parse(x.trans_date)-Date.parse(r.trans_date))<=days*86400000).map(x=>x.owner_name)).size>=min);}
 if(q.group_by==='company'||q.group_by==='owner'){
 const map=new Map();for(const r of rows){const key=q.group_by==='company'?r.ticker:r.owner_name;const prev=map.get(key);if(prev){prev.value+=r.value;prev.shares+=r.shares;prev.n_owners++;}else map.set(key,{...r});}rows=[...map.values()];
 }
 const sort=q.sort||'filing_datetime',direction=q.descending==='false'?1:-1;rows.sort((a,b)=>direction*(typeof a[sort]==='number'?a[sort]-b[sort]:String(a[sort]).localeCompare(String(b[sort]))));
 const total=rows.length,limit=Math.min(1000,Math.max(1,Number(q.limit)||50)),offset=Math.max(0,(Number(q.page)||1)-1)*limit;
 return {demo:true,rows:rows.slice(offset,offset+limit),total,has_more:offset+limit<total,page:Number(q.page)||1,limit,offset,stats:{filings:150,transactions:150,latest:stamp},pages:Math.ceil(total/limit)};
}

function graphData(){
 const nodes=companies.map(c=>({...company(c.ticker),hasSecData:false}));
 const earnings=Object.fromEntries(nodes.map(c=>[c.ticker,{asOf:date,lastQuarter:{label:'Q2 2026 · synthetic',date:'2026-06-30',headline:[{metric:'Revenue',value:`$${(c.revenue/4/1e9).toFixed(1)}B`,yoy:'+8%'},{metric:'FCF margin',value:`${(c.margin*100).toFixed(1)}%`}],guidance:'Generated scenario: 8% revenue growth',sources:{}},catalysts:[{date:'2026-11-01',event:'Illustrative earnings release',context:'Generated calendar example'}],priceMovers:[],mentions:nodes.filter(n=>n.ticker!==c.ticker).slice(0,2).map(n=>({ticker:n.ticker,name:n.name,relationship:'competitor',context:'Synthetic relationship'}))}]));
 return {demo:true,graph:{nodes,links:[{source:'TSM',target:'NVDA',relationship:'Synthetic supplier',type:'supplier',note:'Generated relationship'},{source:'NVDA',target:'MSFT',relationship:'Synthetic supplier',type:'supplier',note:'Generated relationship'}],asOf:date},earnings,sources:{},signals:[]};
}

function segments(t){const c=company(t);return {period:'2025-12-31',prevPeriod:'2024-12-31',unit:'USD',revenueSum:c.revenue,revenueTotal:c.revenue,profitLabel:'Operating profit',profitSum:c.revenue*.26,rows:['Products','Services'].map((label,i)=>({member:label,label,revenue:c.revenue*(i?.3:.7),revenuePrev:c.revenue*(i?.3:.7)/1.08,profit:c.revenue*(i?.3:.7)*.26,profitPrev:c.revenue*(i?.3:.7)*.25/1.08})),warnings:[]};}
export function stockStats(t){const s=prices({tickers:t}).series[t],v=s.close,last=v.at(-1),annual=v.slice(-252),hi=Math.max(...annual),lo=Math.min(...annual),ret=n=>v.length>n?last/v.at(-1-n)-1:null;const rs=annual.slice(1).map((x,i)=>x/annual[i]-1),avg=rs.reduce((a,b)=>a+b,0)/rs.length;return {price:last,date:s.dates.at(-1),marketCap:last*company(t).shares,wk52High:{value:hi,date:s.dates[v.indexOf(hi)]},wk52Low:{value:lo,date:s.dates[v.indexOf(lo)]},returns:{m1:ret(21),m6:ret(126),ytd:last/v[s.dates.findIndex(d=>d>='2026-01-01')]-1,y1:ret(252),y3:ret(756)},rangePosition:(last-lo)/(hi-lo),offHigh:last/hi-1,volatility1y:Math.sqrt(rs.reduce((a,b)=>a+(b-avg)**2,0)/(rs.length-1)*252),coverage:{first:s.dates[0],last:s.dates.at(-1)}};}
export function correlations(csv=companies.map(c=>c.ticker).join(',')){
 const tickers=csv.split(','),s=prices({tickers:csv}).series;const returns=t=>s[t].close.slice(-181).map((v,i,vs)=>i?v/vs[i-1]-1:0).slice(1);
 const pearson=(a,b)=>{const ma=a.reduce((s,v)=>s+v,0)/a.length,mb=b.reduce((s,v)=>s+v,0)/b.length;return a.reduce((s,v,i)=>s+(v-ma)*(b[i]-mb),0)/Math.sqrt(a.reduce((s,v)=>s+(v-ma)**2,0)*b.reduce((s,v)=>s+(v-mb)**2,0));};
 const matrix=Object.fromEntries(tickers.map(a=>[a,Object.fromEntries(tickers.map(b=>[b,a===b?1:pearson(returns(a),returns(b))]))])); return {ok:true,demo:true,tickers,matrix,average:Object.fromEntries(tickers.map(a=>[a,tickers.length>1?tickers.filter(b=>b!==a).reduce((s,b)=>s+matrix[a][b],0)/(tickers.length-1):null])),n:180,window:180,spine:{from:s[tickers[0]].dates.at(-180),to:date}};
}

function peerFlow(q,record){
 const tickers={};for(const t of (q.tickers||'NVDA').split(',')){
 const rows=screen({ticker:t,limit:1000,filed_within_days:q.days||90}).rows,b=rows.filter(r=>r.trans_code==='P'),s=rows.filter(r=>r.trans_code==='S');
 if(record){const price=prices({tickers:t}).series[t];const horizons=Object.fromEntries([['r1w',5],['r1m',21],['r6m',126]].map(([key,n])=>{const rs=b.map(r=>price.dates.indexOf(r.trans_date)).filter(i=>i>=0&&i+n<price.close.length).map(i=>100*(price.close[i+n]/price.close[i]-1)).sort((a,b)=>a-b);return [key,rs.length?{n:rs.length,mean:rs.reduce((s,v)=>s+v,0)/rs.length,median:(rs[Math.floor((rs.length-1)/2)]+rs[Math.floor(rs.length/2)])/2,hit:rs.filter(v=>v>0).length/rs.length}:{n:0}];}));tickers[t]={purchases:b.length,first:b.at(-1)?.trans_date,last:b[0]?.trans_date,horizons};}
 else tickers[t]={buys:b.length,sells:s.length,other:rows.length-b.length-s.length,distinctFilings:rows.length,netValue:b.reduce((n,r)=>n+r.value,0)-s.reduce((n,r)=>n+r.value,0),ceoCfoBuys:b.filter(r=>r.is_ceo||r.is_cfo).length,ceoCfoSells:s.filter(r=>r.is_ceo||r.is_cfo).length,officerBuys:b.filter(r=>r.is_officer).length,plannedSells:0,medianFilingDelayDays:0};
 }return {demo:true,tickers,days:Number(q.days)||90,years:Number(q.years)||5};
}
