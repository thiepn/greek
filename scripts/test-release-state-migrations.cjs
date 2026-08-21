const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{}};vm.createContext(context);vm.runInContext(read('curriculum.js'),context);
const curriculum=context.window.KOINE_CURRICULUM;
const Learning=require('../learning-engine.js');
const clock=()=>new Date('2026-08-22T00:00:00Z');

(function legacyPrototypeMigration(){
  const legacy={done:['alphabet','article','nouns','verbs','john1'],attempts:18,correct:13,review:[{form:'λόγῳ',answer:'Dative singular'}],words:['λόγος']};
  const storage=new Learning.MemoryStorage({'koine-path-v01':JSON.stringify(legacy)});
  const engine=new Learning.LearningEngine({curriculum,storage,clock});
  const state=engine.snapshot();
  assert.equal(state.schemaVersion,3);
  assert.equal(state.migration.legacyImported,true);
  assert.equal(state.migration.from,'koine-path-v01');
  assert.deepEqual(state.prototype.done,legacy.done);
  for(const unitId of [1,5,7,12,16]){
    const unit=engine.getUnit(unitId);
    assert(!unit.masteredAt,`legacy prototype completion must not master Unit ${unitId}`);
    assert(unit.composite<82,`legacy import must remain below mastery composite for Unit ${unitId}`);
  }
  assert(!engine.stageGatePassed('S0'),'legacy prototype completion must not auto-pass Stage 0');
})();

(function currentSchemaSurvivesReload(){
  const storage=new Learning.MemoryStorage();
  const first=new Learning.LearningEngine({curriculum,storage,clock});
  first.recordExposure({unitId:1,itemId:'bg16.persistence',source:'release-test'});
  first.state.settings.releaseSentinel='preserve-me';
  first.persist();
  const before=first.snapshot();
  const second=new Learning.LearningEngine({curriculum,storage,clock});
  const after=second.snapshot();
  assert.equal(after.settings.releaseSentinel,'preserve-me','current-schema settings must survive reload');
  assert(after.events.some(e=>e.itemId==='bg16.persistence'),'current learner events must survive reload');
  assert.equal(after.createdAt,before.createdAt,'reload must not reset learner creation time');
})();

(function malformedSavedStateFailsSafe(){
  const storage=new Learning.MemoryStorage({'koine-path-learning-v3':'{not-json'});
  const engine=new Learning.LearningEngine({curriculum,storage,clock});
  const state=engine.snapshot();
  assert.equal(state.schemaVersion,3);
  assert.equal(state.units['1'].status,'available');
  assert.equal(state.prototype.done.length,0);
})();

(function unrelatedStorageIsNeverDeleted(){
  const storage=new Learning.MemoryStorage({'unrelated-user-key':'keep-this'});
  const engine=new Learning.LearningEngine({curriculum,storage,clock});
  engine.recordExposure({unitId:1,itemId:'bg16.unrelated',source:'release-test'});
  assert.equal(storage.getItem('unrelated-user-key'),'keep-this');
})();

console.log('BG16 learner-state migration tests passed: legacy import, current reload, malformed-state recovery, unrelated-key preservation.');
