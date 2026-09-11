// The static website and local server share the exact same generated route data.
// Install before React mounts, so the original screens work on GitHub Pages.
import {payload} from './data.js';
const originalFetch=globalThis.fetch.bind(globalThis);
globalThis.fetch=async (input,init={})=>{
 const raw=typeof input==='string'?input:input.url;
 const url=new URL(raw,location.href);
 if(url.origin!==location.origin)throw new Error('External requests are disabled in this synthetic demo.');
 if(!url.pathname.startsWith('/api/'))return originalFetch(input,init);
 if(init.signal?.aborted)throw new DOMException('Aborted','AbortError');
 const route=url.pathname.slice(4);
 let body={};if(init.body)try{body=JSON.parse(init.body);}catch{return Response.json({error:'Invalid JSON'},{status:400});}
 const result=payload(route,Object.fromEntries(url.searchParams),body,init.method||'GET');
 return Response.json(result??{error:'Unknown demo route'},{status:result===null?404:result.error?400:200});
};
