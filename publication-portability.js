(()=>{
'use strict';
const dp=window.KoineDataPortability,pub=window.KoinePublication;if(!dp||!pub)return;const KEY=pub.STORAGE_KEY;
function validatePublicationStores(stores){const raw=stores?.[KEY];if(raw===undefined)return;let parsed;try{parsed=JSON.parse(raw)}catch{throw new Error('Publication-profile state is not valid JSON.')}pub.validateState(parsed)}
const originalValidate=dp.validateStores.bind(dp),originalParse=dp.parseBackup.bind(dp),originalRestore=dp.restoreBackup.bind(dp),originalSerialize=dp.serializeBackup.bind(dp);
dp.validateStores=stores=>{validatePublicationStores(stores);return originalValidate(stores)};
dp.parseBackup=input=>{const backup=originalParse(input);validatePublicationStores(backup.stores);return backup};
dp.inspectBackup=input=>{const backup=dp.parseBackup(input),text=typeof input==='string'?input:JSON.stringify(input);return{product:backup.product,schemaVersion:backup.schemaVersion,appVersion:backup.appVersion||null,exportedAt:backup.exportedAt||null,keys:Object.keys(backup.stores),keyCount:Object.keys(backup.stores).length,bytes:new TextEncoder().encode(text).length}};
dp.restoreBackup=(storage,input,options)=>{dp.parseBackup(input);return originalRestore(storage,input,options)};
dp.serializeBackup=(storage,options={})=>{const text=originalSerialize(storage,options),backup=JSON.parse(text);backup.appVersion='v1.11-feature';return JSON.stringify(backup,null,2)};
window.KOINE_PUBLICATION_PORTABILITY={validatePublicationStores};
})();