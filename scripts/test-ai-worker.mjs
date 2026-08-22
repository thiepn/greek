import assert from 'node:assert/strict';
import {sanitize,cors,buildOpenAIRequest,RESPONSE_SCHEMA,instructions} from '../worker/src/index.js';
const env={ALLOWED_ORIGINS:'https://thiepn.dev,https://thiepn.github.io',OPENAI_MODEL:'gpt-5.6-terra'};
assert(cors('https://thiepn.dev',env));assert.equal(cors('https://evil.example',env),null);
const req=sanitize({version:1,clientId:'abc',mode:'socratic',message:'Why is ἀρχῇ dative?',history:Array.from({length:20},()=>({role:'user',content:'x'})),context:{evidence:Array.from({length:30},(_,i)=>({id:`e${i}`,kind:'morph',authority:'MorphGNT',content:'x'.repeat(1200)}))}});
assert.equal(req.history.length,8);assert.equal(req.context.evidence.length,24);assert.equal(req.context.evidence[0].content.length,900);
const body=buildOpenAIRequest(req,env);assert.equal(body.model,'gpt-5.6-terra');assert.equal(body.store,false);assert.equal(body.text.format.type,'json_schema');assert.equal(body.text.format.strict,true);assert.deepEqual(body.text.format.schema,RESPONSE_SCHEMA);assert(!JSON.stringify(body).includes('OPENAI_API_KEY'));
const prompt=instructions();assert.match(prompt,/Never invent a parse/i);assert.match(prompt,/theology/i);assert.match(prompt,/aorist/i);assert.throws(()=>sanitize({version:1,message:''}));assert.throws(()=>sanitize({version:2,message:'x'}));
console.log('BG8 secure Worker contract tests passed.');