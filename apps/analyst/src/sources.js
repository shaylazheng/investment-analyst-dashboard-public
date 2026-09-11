import {VIEW_IDS} from './views.js';
export const KIND_LABEL={local:'Generated demo data'};
export const SURFACE_SOURCES=Object.fromEntries(VIEW_IDS.map(id=>[id,[{kind:'local',label:'Synthetic fixtures',detail:'Deterministically generated in demo/data.js. No external data service is contacted.'}]]));
