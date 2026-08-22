const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  MemoryStorage,JOURNAL_KEY,collectStores,serializeBackup,parseBackup,
  restoreBackup,getRecoveryJournal,rollbackLastRestore,inspectBackup
}=require('../data-portability.js');

const learning=JSON.stringify({schemaVersion:3,units:{'1':{}},stages:{},errors:{}});
const morphology=JSON.stringify({version:1,attempts:9,correct:7});
const vocab=JSON.stringify({schemaVersion:1,cards:{a:{id:'a'}},history:[]});
const corpus=JSON.stringify({commit:'abc123',entries:[]});
const initial={
  'koine-path-learning-v3':learning,
  'koine-path-morphology-lab-v1':morphology,
  'koine-path-vocab-srs-v1':vocab,
  'koine-path-vocab-corpus-v1':corpus,
  'unrelated-app-key':'must-not-export'
};

const storage=new MemoryStorage(initial);
const text=serializeBackup(storage,{clock:()=>new Date('2026-08-22T18:00:00Z'),appVersion:'v1.2-test'});
const backup=parseBackup(text);
assert.equal(backup.product,'Koinē Path');
assert.equal(backup.schemaVersion,1);
assert.equal(backup.appVersion,'v1.2-test');
assert.equal(Object.keys(backup.stores).length,4);
assert.equal(backup.stores['unrelated-app-key'],undefined);
assert.equal(backup.stores[JOURNAL_KEY],undefined);
assert.equal(inspectBackup(text).keyCount,4);

const tampered=JSON.parse(text);
tampered.stores['koine-path-morphology-lab-v1']=JSON.stringify({version:1,attempts:999});
assert.throws(()=>parseBackup(JSON.stringify(tampered)),/integrity check failed/i);

const unsafe=JSON.parse(text);
unsafe.stores['other-product-key']='x';
assert.throws(()=>parseBackup(JSON.stringify(unsafe)),/unsafe storage key/i);

const badKnown=JSON.parse(text);
badKnown.stores['koine-path-learning-v3']=JSON.stringify({schemaVersion:99,units:{}});
const stable=JSON.stringify({schemaVersion:badKnown.schemaVersion,stores:Object.keys(badKnown.stores).sort().reduce((o,k)=>(o[k]=badKnown.stores[k],o),{})});
let h=0x811c9dc5;for(let i=0;i<stable.length;i++){h^=stable.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}badKnown.integrity.value=h.toString(16).padStart(8,'0');
assert.throws(()=>parseBackup(JSON.stringify(badKnown)),/unsupported schema/i);

const target=new MemoryStorage({
  'koine-path-learning-v3':JSON.stringify({schemaVersion:3,units:{old:{}},stages:{},errors:{}}),
  'koine-path-custom-future-v1':'future-state',
  unrelated:'preserve-me'
});
const result=restoreBackup(target,text,{clock:()=>new Date('2026-08-22T19:00:00Z')});
assert.equal(result.restoredKeys,4);
assert.equal(target.getItem('unrelated'),'preserve-me');
assert.deepEqual(collectStores(target),backup.stores);
const journal=getRecoveryJournal(target);
assert.ok(journal);
assert.equal(journal.stores['koine-path-custom-future-v1'],'future-state');

const rollback=rollbackLastRestore(target);
assert.equal(rollback.restoredKeys,2);
assert.equal(target.getItem('koine-path-custom-future-v1'),'future-state');
assert.match(target.getItem('koine-path-learning-v3'),/old/);
assert.equal(target.getItem(JOURNAL_KEY),null);
assert.equal(target.getItem('unrelated'),'preserve-me');

class FailingStorage extends MemoryStorage{
  setItem(key,value){if(key==='koine-path-vocab-srs-v1'&&this.fail)throw new Error('quota');super.setItem(key,value);}
}
const failing=new FailingStorage({'koine-path-learning-v3':learning});
failing.fail=true;
assert.throws(()=>restoreBackup(failing,text),/quota/);
failing.fail=false;
assert.equal(failing.getItem('koine-path-learning-v3'),learning);
assert.equal(failing.getItem(JOURNAL_KEY),null);

const html=fs.readFileSync('index.html','utf8');
assert.match(html,/data-portability\.js/);
assert.match(html,/data-portability-ui\.js/);
const ui=fs.readFileSync('data-portability-ui.js','utf8');
for(const id of ['dp-export','dp-import','dp-restore','dp-rollback','dp-status'])assert.match(ui,new RegExp(id));
assert.match(ui,/confirm\(/);
assert.match(ui,/Reload Koinē Path now/);

console.log('V1.2 learner data portability and recovery: PASS');
