import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.DEMO_URL||'http://127.0.0.1:3917/';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1000}});
const errors=[],external=[],bad=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
page.on('response',r=>{if(r.status()>=400)bad.push(`${r.status()} ${r.url()}`);});
const settle=()=>page.waitForTimeout(200);
const nav=async name=>{await page.getByRole('button',{name,exact:true}).first().click();await settle();assert.ok(await page.locator('main').first().isVisible());};
try{
 await page.goto(base+'#summary&ticker=NVDA');await page.locator('.sm-ym-row').first().waitFor();
 assert.equal(await page.getByRole('button',{name:'Report',exact:true}).count(),0);
 const metric=await page.locator('.sm-ym-v').first().innerText();await page.getByLabel('Fiscal year',{exact:true}).selectOption('CY2021');await settle();assert.notEqual(await page.locator('.sm-ym-v').first().innerText(),metric);
 await page.getByLabel('Fiscal year',{exact:true}).selectOption('CY2025');
 await page.locator('.co-form input').fill('MSFT');await page.locator('.co-form input').press('Enter');await settle();assert.match(await page.locator('main').first().innerText(),/Demo MSFT Technologies/);
 await page.locator('.co-form input').fill('NVDA');await page.locator('.co-form input').press('Enter');await settle();
 await page.locator('.si-srcbtn').first().click();await settle();assert.match(await page.locator('.si-panel').innerText(),/Generated sample data/);
 await mkdir('docs/images',{recursive:true});await page.screenshot({path:'docs/images/company-dashboard.png'});
 await nav('Management');await page.getByRole('button',{name:/Demo Alex Morgan/}).click();await settle();assert.match(await page.locator('main').first().innerText(),/BEFORE THIS ROLE/);
 await nav('Industry');assert.equal(await page.locator('.ind-sharebar').count(),1);
 await nav('Competitors');await page.getByRole('button',{name:'+ top 5',exact:true}).click();await settle();assert.match(await page.locator('main').first().innerText(),/5 of 5 loaded/);
 await page.getByRole('button',{name:/After insider buys/}).click();await settle();assert.ok(await page.locator('.cmp-record tbody tr').count()>0);
 await page.getByRole('button',{name:/Insights/}).first().click();await settle();assert.match(await page.locator('.insight-body').innerText(),/Generated/);
 await nav('Valuation');const before=await page.locator('.bk-flag').innerText();await page.locator('input[type=range]').first().fill('0.12');await settle();assert.notEqual(await page.locator('.bk-flag').innerText(),before);
 await nav('Risks & Catalysts');assert.match(await page.locator('main').first().innerText(),/Consensus — generated example/i);
 await nav('Graph');await page.locator('#co-t-graph').fill('NVDA');await page.locator('#co-t-graph').press('Enter');await settle();await page.getByRole('button',{name:/Supply chain, figures/}).click();await settle();
 
 const fig=page.getByRole('button',{name:'Figures',exact:true});if(await fig.count()){await fig.click();await settle();}
 await page.keyboard.press('Escape');await page.locator('#corr-sec').evaluate(e=>e.open=true);await page.locator('#corr-btn').click();await settle();assert.ok(await page.locator('#co-grid td').count()>0);
 await page.locator('#co-close').click();await nav('Insider');await page.getByRole('button',{name:'Reset',exact:true}).click();await settle();
 await page.locator('details').evaluateAll(es=>es.forEach(e=>e.open=true));
 await page.locator('#ins-type').selectOption('S');await settle();const types=await page.locator('tbody .ins-code').allTextContents();assert.ok(types.length>0&&types.every(t=>t==='Sell'));
 await page.getByRole('button',{name:'Reset',exact:true}).click();await settle();
 await page.setViewportSize({width:390,height:844});await nav('Company');await nav('Summary');await settle();assert.ok(await page.locator('.sm-surface').isVisible());
 await page.screenshot({path:'/tmp/company-dashboard-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(bad,[]);
 console.log('PASS: eight tabs, ticker/year/peer changes, DCF slider, profile, insights, graph figures and correlation, insider trade filter, mobile render; zero browser errors or external requests.');
}finally{await browser.close();}
