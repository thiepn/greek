(()=>{
'use strict';
const dp=window.KoineDataPortability,syn=window.KoineResearchSynthesis;if(!dp||!syn)return;const KEY=syn.STORAGE_KEY;
function validateSynthesisStores(stores){const raw=stores?.[KEY];if(raw===undefined)return;let parsed;try{parsed=JSON.parse(raw)}catch{throw new Error('Research-synthesis state is not valid JSON.')}syn.validateState(parsed)}
const originalValidate=dp.validateStores.bind(dp),originalParse=dp.parseBackup.bind(dp),originalRestore=dp.restoreBackup.bind(dp),originalSerialize=dp.serializeBackup.bind(dp);
dp.validateStores=stores=>{validateSynthesisStores(stores);return originalValidate(stores)};
dp.parseBackup=input=>{const backup=originalParse(input);validateSynthesisStores(backup.stores);return backup};
dp.inspectBackup=input=>{const backup=dp.parseBackup(input),text=typeof input==='string'?input:JSON.stringify(input);return{product:backup.product,schemaVersion:backup.schemaVersion,appVersion:backup.appVersion||null,exportedAt:backup.exportedAt||null,keys:Object.keys(backup.stores),keyCount:Object.keys(backup.stores).length,bytes:new TextEncoder().encode(text).length}};
dp.restoreBackup=(storage,input,options)=>{dp.parseBackup(input);return originalRestore(storage,input,options)};
dp.serializeBackup=(storage,options={})=>originalSerialize(storage,{...options,appVersion:'v1.9-feature'});
})();