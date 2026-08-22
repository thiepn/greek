(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KoineDataPortability=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const BACKUP_SCHEMA=1;
  const PRODUCT='Koinē Path';
  const STORAGE_PREFIX='koine-path-';
  const JOURNAL_KEY='koine-path-recovery-journal-v1';
  const MAX_BACKUP_BYTES=5*1024*1024;
  const MAX_KEYS=200;

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function nowIso(clock){return new Date((clock||(()=>new Date()))()).toISOString();}
  function byteLength(text){return typeof TextEncoder!=='undefined'?new TextEncoder().encode(text).length:Buffer.byteLength(text,'utf8');}
  function checksum(text){let hash=0x811c9dc5;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}return hash.toString(16).padStart(8,'0');}
  function stableStores(stores){return Object.keys(stores).sort().reduce((out,key)=>{out[key]=stores[key];return out;},{});}
  function payloadString(schemaVersion,stores){return JSON.stringify({schemaVersion,stores:stableStores(stores)});}
  function safeJson(raw,label){try{return JSON.parse(raw);}catch{throw new Error(`${label} is not valid JSON.`);}}

  class MemoryStorage{
    constructor(seed={}){this.map=new Map(Object.entries(seed));}
    get length(){return this.map.size;}
    key(index){return [...this.map.keys()][index]??null;}
    getItem(key){return this.map.has(key)?this.map.get(key):null;}
    setItem(key,value){this.map.set(key,String(value));}
    removeItem(key){this.map.delete(key);}
    clear(){this.map.clear();}
  }

  function collectStores(storage,{includeJournal=false}={}){
    const stores={};
    for(let i=0;i<storage.length;i++){
      const key=storage.key(i);
      if(!key||!key.startsWith(STORAGE_PREFIX))continue;
      if(!includeJournal&&key===JOURNAL_KEY)continue;
      const value=storage.getItem(key);
      if(value!==null)stores[key]=String(value);
    }
    return stableStores(stores);
  }

  function validateKnownStore(key,value){
    if(key==='koine-path-learning-v3'){
      const parsed=safeJson(value,key);
      if(parsed?.schemaVersion!==3||!parsed.units||typeof parsed.units!=='object')throw new Error('Learning-engine state has an unsupported schema.');
    }else if(key==='koine-path-morphology-lab-v1'){
      const parsed=safeJson(value,key);
      if(parsed?.version!==1)throw new Error('Morphology state has an unsupported schema.');
    }else if(key==='koine-path-vocab-srs-v1'){
      const parsed=safeJson(value,key);
      if(parsed?.schemaVersion!==1||!parsed.cards||typeof parsed.cards!=='object')throw new Error('Vocabulary state has an unsupported schema.');
    }else if(key==='koine-path-vocab-corpus-v1'){
      const parsed=safeJson(value,key);
      if(typeof parsed?.commit!=='string'||!Array.isArray(parsed.entries))throw new Error('Vocabulary corpus cache is malformed.');
    }else if(key==='koine-path-guidance-v1'){
      const parsed=safeJson(value,key);
      if(parsed?.schemaVersion!==1||!parsed.profile||typeof parsed.profile!=='object'||!parsed.placement||typeof parsed.placement!=='object')throw new Error('Guided-study state has an unsupported schema.');
    }else if(key==='koine-path-sessions-v1'){
      const parsed=safeJson(value,key);
      if(parsed?.schemaVersion!==1||!Array.isArray(parsed.history)||(parsed.active!==null&&typeof parsed.active!=='object'))throw new Error('Daily-session state has an unsupported schema.');
      if(parsed.history.length>400)throw new Error('Daily-session history exceeds the supported retention bound.');
    }
  }

  function validateStores(stores){
    if(!stores||typeof stores!=='object'||Array.isArray(stores))throw new Error('Backup stores must be an object.');
    const keys=Object.keys(stores);
    if(keys.length>MAX_KEYS)throw new Error('Backup contains too many storage records.');
    for(const key of keys){
      if(!key.startsWith(STORAGE_PREFIX))throw new Error(`Backup contains an unsafe storage key: ${key}`);
      if(key===JOURNAL_KEY)throw new Error('Recovery journal cannot be imported from a backup.');
      if(typeof stores[key]!=='string')throw new Error(`Backup value for ${key} must be a string.`);
      validateKnownStore(key,stores[key]);
    }
    return stableStores(stores);
  }

  function buildBackup(storage,{clock,appVersion='v1.2'}={}){
    const stores=collectStores(storage);
    const base={product:PRODUCT,schemaVersion:BACKUP_SCHEMA,appVersion,exportedAt:nowIso(clock),stores};
    const integrity=checksum(payloadString(base.schemaVersion,base.stores));
    const backup={...base,integrity:{algorithm:'fnv1a32',value:integrity}};
    const text=JSON.stringify(backup,null,2);
    if(byteLength(text)>MAX_BACKUP_BYTES)throw new Error('Backup exceeds the 5 MB safety limit.');
    return backup;
  }

  function serializeBackup(storage,options){return JSON.stringify(buildBackup(storage,options),null,2);}

  function parseBackup(input){
    const text=typeof input==='string'?input:JSON.stringify(input);
    if(byteLength(text)>MAX_BACKUP_BYTES)throw new Error('Backup exceeds the 5 MB safety limit.');
    const backup=typeof input==='string'?safeJson(input,'Backup'):clone(input);
    if(backup?.product!==PRODUCT)throw new Error('This file is not a Koinē Path backup.');
    if(backup.schemaVersion!==BACKUP_SCHEMA)throw new Error(`Unsupported backup schema ${backup.schemaVersion}.`);
    const stores=validateStores(backup.stores);
    const expected=checksum(payloadString(backup.schemaVersion,stores));
    if(backup.integrity?.algorithm!=='fnv1a32'||backup.integrity?.value!==expected)throw new Error('Backup integrity check failed. The file may be damaged or edited.');
    return {...backup,stores};
  }

  function clearLearnerNamespace(storage){
    const keys=[];
    for(let i=0;i<storage.length;i++){
      const key=storage.key(i);
      if(key?.startsWith(STORAGE_PREFIX)&&key!==JOURNAL_KEY)keys.push(key);
    }
    keys.forEach(key=>storage.removeItem(key));
  }

  function writeStores(storage,stores){for(const [key,value] of Object.entries(stores))storage.setItem(key,value);}
  function sameStores(a,b){return JSON.stringify(stableStores(a))===JSON.stringify(stableStores(b));}

  function restoreBackup(storage,input,{clock}={}){
    const backup=parseBackup(input);
    const before=collectStores(storage);
    const journal={schemaVersion:1,createdAt:nowIso(clock),reason:'pre-restore',stores:before};
    storage.setItem(JOURNAL_KEY,JSON.stringify(journal));
    try{
      clearLearnerNamespace(storage);
      writeStores(storage,backup.stores);
      const after=collectStores(storage);
      if(!sameStores(after,backup.stores))throw new Error('Restore verification failed after writing learner state.');
      return {restoredKeys:Object.keys(after).length,previousKeys:Object.keys(before).length,exportedAt:backup.exportedAt||null,requiresReload:true};
    }catch(error){
      try{clearLearnerNamespace(storage);writeStores(storage,before);storage.removeItem(JOURNAL_KEY);}catch{}
      throw error;
    }
  }

  function getRecoveryJournal(storage){
    const raw=storage.getItem(JOURNAL_KEY);if(!raw)return null;
    try{const journal=JSON.parse(raw);if(journal?.schemaVersion!==1||!journal.stores)return null;validateStores(journal.stores);return journal;}catch{return null;}
  }

  function rollbackLastRestore(storage){
    const journal=getRecoveryJournal(storage);if(!journal)throw new Error('No valid recovery point is available.');
    const current=collectStores(storage);
    try{
      clearLearnerNamespace(storage);
      writeStores(storage,journal.stores);
      if(!sameStores(collectStores(storage),journal.stores))throw new Error('Rollback verification failed.');
      storage.removeItem(JOURNAL_KEY);
      return {restoredKeys:Object.keys(journal.stores).length,replacedKeys:Object.keys(current).length,requiresReload:true};
    }catch(error){
      try{clearLearnerNamespace(storage);writeStores(storage,current);}catch{}
      throw error;
    }
  }

  function discardRecoveryJournal(storage){storage.removeItem(JOURNAL_KEY);}
  function inspectBackup(input){const backup=parseBackup(input);const serialized=JSON.stringify(backup);return{product:backup.product,schemaVersion:backup.schemaVersion,appVersion:backup.appVersion||null,exportedAt:backup.exportedAt||null,keys:Object.keys(backup.stores),keyCount:Object.keys(backup.stores).length,bytes:byteLength(serialized)};}

  return{BACKUP_SCHEMA,PRODUCT,STORAGE_PREFIX,JOURNAL_KEY,MAX_BACKUP_BYTES,MemoryStorage,checksum,collectStores,validateStores,buildBackup,serializeBackup,parseBackup,restoreBackup,getRecoveryJournal,rollbackLastRestore,discardRecoveryJournal,inspectBackup};
});