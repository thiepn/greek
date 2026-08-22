(()=>{
'use strict';
const STORAGE_KEY='koine-path-accessibility-v1';
const defaults={motion:'system',contrast:'system',textSize:'normal'};
const safeParse=value=>{try{return JSON.parse(value)}catch{return null}};
const state={...defaults,...(safeParse(localStorage.getItem(STORAGE_KEY))||{})};
const sourceNav=document.querySelector('.nav');
let mobileDialog=null,settingsDialog=null,mobileTrigger=null,settingsTrigger=null,liveRegion=null,toolbar=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const humanize=id=>String(id||'field').replace(/^reader-|^audio-|^pwa-|^vocab-|^morph-|^fluency-|^syntax-|^exegesis-/,'').replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function applyPreferences(){
  const root=document.documentElement;
  if(state.motion==='system')delete root.dataset.reduceMotion;else root.dataset.reduceMotion=state.motion;
  if(state.contrast==='system')delete root.dataset.contrast;else root.dataset.contrast=state.contrast;
  root.dataset.textSize=state.textSize;
}
function reducedMotion(){return state.motion==='on'||(state.motion==='system'&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function announce(text){if(!liveRegion)return;liveRegion.textContent='';requestAnimationFrame(()=>{liveRegion.textContent=text})}
function activeView(){return document.querySelector('.view.active')}
function focusActiveHeading({announceView=true}={}){
  const view=activeView();if(!view)return;
  const heading=view.querySelector('h1,h2');
  if(heading){if(!heading.id)heading.id=`${view.id}-heading`;heading.tabIndex=-1;heading.focus({preventScroll:true});}
  window.scrollTo({top:0,behavior:reducedMotion()?'auto':'smooth'});
  if(announceView)announce(`${document.querySelector('#top-title')?.textContent||heading?.textContent||view.id} view`);
}
function syncViewSemantics(){
  document.querySelectorAll('.view').forEach(view=>{
    const active=view.classList.contains('active');view.setAttribute('aria-hidden',String(!active));view.toggleAttribute('inert',!active);
    const heading=view.querySelector('h1,h2');if(heading){if(!heading.id)heading.id=`${view.id}-heading`;view.setAttribute('aria-labelledby',heading.id)}
  });
  sourceNav?.querySelectorAll('button[data-view]').forEach(button=>{const current=button.classList.contains('active');if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
  syncMobileNav();
}
function enhanceGreek(){
  document.querySelectorAll('.greek,.greek-big,.reader-text,.fluency-greek,.morph-display,.vocab-front,.word-form').forEach(el=>{el.lang='grc';el.dir='ltr'});
  document.querySelectorAll('.reader-text sup,.fluency-verse sup').forEach(el=>el.lang='en');
}
function enhanceTables(){document.querySelectorAll('table').forEach(table=>{table.querySelectorAll('tr').forEach((row,rowIndex)=>row.querySelectorAll('th').forEach((th,colIndex)=>{if(!th.hasAttribute('scope'))th.scope=rowIndex===0?'col':colIndex===0?'row':'col'}));if(!table.getAttribute('aria-label')&&!table.getAttribute('aria-labelledby')){const heading=table.closest('.view,.panel,.lesson-body')?.querySelector('h1,h2,h3');if(heading){if(!heading.id)heading.id=`table-heading-${Math.random().toString(36).slice(2,8)}`;table.setAttribute('aria-labelledby',heading.id)}}})}
function enhanceFeedback(){
  document.querySelectorAll('.feedback,.offline-note,#audio-message,[id$="-feedback"],[id$="-message"]').forEach(el=>{el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true')});
  const connection=document.querySelector('#pwa-connection');if(connection){connection.setAttribute('role','status');connection.setAttribute('aria-live','polite')}
}
function enhanceForms(){
  document.querySelectorAll('input,select,textarea').forEach(control=>{
    if(control.type==='hidden'||control.getAttribute('aria-label')||control.getAttribute('aria-labelledby'))return;
    if(control.closest('label'))return;
    if(control.id&&document.querySelector(`label[for="${CSS.escape(control.id)}"]`))return;
    const label=control.placeholder||humanize(control.id||control.name);control.setAttribute('aria-label',label);
  });
}
function enhanceButtons(){document.querySelectorAll('button').forEach(button=>{if(!button.textContent.trim()&&!button.getAttribute('aria-label'))button.setAttribute('aria-label',humanize(button.id||button.dataset.view||'Action'))})}
function enhanceAll(){syncViewSemantics();enhanceGreek();enhanceTables();enhanceFeedback();enhanceForms();enhanceButtons()}
function navItems(container){return [...container.querySelectorAll('button[data-view]')].filter(b=>!b.disabled)}
function navKeydown(event){
  if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key))return;
  const buttons=navItems(event.currentTarget);const index=buttons.indexOf(document.activeElement);if(index<0)return;event.preventDefault();
  let next=index;if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%buttons.length;else next=(index-1+buttons.length)%buttons.length;buttons[next]?.focus();
}
function syncMobileNav(){
  if(!mobileDialog||!sourceNav)return;const list=mobileDialog.querySelector('.mobile-nav-list');if(!list)return;
  const source=[...sourceNav.querySelectorAll('button[data-view]')];const signature=source.map(x=>`${x.dataset.view}:${x.textContent.trim()}`).join('|');
  if(list.dataset.signature!==signature){list.dataset.signature=signature;list.innerHTML=source.map(b=>`<button type="button" data-view="${esc(b.dataset.view)}">${esc(b.textContent.trim())}</button>`).join('');list.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{window.openView?.(button.dataset.view);mobileDialog.close();setTimeout(()=>focusActiveHeading(),0)}))}
  list.querySelectorAll('button').forEach(button=>{const current=sourceNav.querySelector(`button[data-view="${CSS.escape(button.dataset.view)}"]`)?.classList.contains('active');if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
}
function buildMobileDialog(){
  mobileDialog=document.createElement('dialog');mobileDialog.id='mobile-nav-dialog';mobileDialog.className='mobile-nav-dialog';mobileDialog.setAttribute('aria-labelledby','mobile-nav-title');
  mobileDialog.innerHTML=`<div class="mobile-nav-dialog-inner"><div class="dialog-head"><div><div class="eyebrow">Koinē Path</div><h2 id="mobile-nav-title">Learning sections</h2></div><button class="dialog-close" type="button" aria-label="Close navigation">×</button></div><p>Choose a workspace. Arrow keys also move through this list.</p><nav class="mobile-nav-list" aria-label="Mobile learning sections"></nav></div>`;
  document.body.appendChild(mobileDialog);mobileDialog.querySelector('.dialog-close').onclick=()=>mobileDialog.close();mobileDialog.querySelector('.mobile-nav-list').addEventListener('keydown',navKeydown);
  mobileDialog.addEventListener('close',()=>{mobileTrigger?.setAttribute('aria-expanded','false');mobileTrigger?.focus()});syncMobileNav();
}
function buildSettingsDialog(){
  settingsDialog=document.createElement('dialog');settingsDialog.id='a11y-dialog';settingsDialog.className='a11y-dialog';settingsDialog.setAttribute('aria-labelledby','a11y-title');
  settingsDialog.innerHTML=`<div class="a11y-dialog-inner"><div class="dialog-head"><div><div class="eyebrow">Display & access</div><h2 id="a11y-title">Accessibility settings</h2></div><button class="dialog-close" type="button" aria-label="Close accessibility settings">×</button></div><div class="a11y-options"><label class="a11y-option"><span><strong>Motion</strong><br>Use your device preference or remove nonessential movement.</span><select id="a11y-motion"><option value="system">System</option><option value="on">Reduce motion</option><option value="off">Allow motion</option></select></label><label class="a11y-option"><span><strong>Contrast</strong><br>Use your device preference or force a stronger black-on-white palette.</span><select id="a11y-contrast"><option value="system">System</option><option value="high">High contrast</option><option value="normal">Standard</option></select></label><label class="a11y-option"><span><strong>Text size</strong><br>Browser zoom remains supported; this optional setting increases the app's base text size.</span><select id="a11y-text"><option value="normal">Standard</option><option value="large">Large</option></select></label></div></div>`;
  document.body.appendChild(settingsDialog);settingsDialog.querySelector('.dialog-close').onclick=()=>settingsDialog.close();
  const motion=settingsDialog.querySelector('#a11y-motion'),contrast=settingsDialog.querySelector('#a11y-contrast'),text=settingsDialog.querySelector('#a11y-text');motion.value=state.motion;contrast.value=state.contrast;text.value=state.textSize;
  const update=()=>{state.motion=motion.value;state.contrast=contrast.value;state.textSize=text.value;persist();applyPreferences();announce('Accessibility preferences updated')};motion.onchange=update;contrast.onchange=update;text.onchange=update;
  settingsDialog.addEventListener('close',()=>settingsTrigger?.focus());
}
function buildToolbar(){
  const top=document.querySelector('.top');if(!top)return;toolbar=document.createElement('div');toolbar.className='a11y-toolbar';
  const connection=top.querySelector('#pwa-connection');if(connection)toolbar.appendChild(connection);
  settingsTrigger=document.createElement('button');settingsTrigger.type='button';settingsTrigger.className='a11y-button';settingsTrigger.textContent='Aa';settingsTrigger.setAttribute('aria-label','Accessibility settings');settingsTrigger.onclick=()=>{settingsDialog.showModal();settingsDialog.querySelector('select')?.focus()};toolbar.appendChild(settingsTrigger);
  mobileTrigger=document.createElement('button');mobileTrigger.type='button';mobileTrigger.className='mobile-nav-trigger';mobileTrigger.textContent='Menu';mobileTrigger.setAttribute('aria-haspopup','dialog');mobileTrigger.setAttribute('aria-controls','mobile-nav-dialog');mobileTrigger.setAttribute('aria-expanded','false');mobileTrigger.onclick=()=>{syncMobileNav();mobileTrigger.setAttribute('aria-expanded','true');mobileDialog.showModal();mobileDialog.querySelector('[aria-current="page"]')?.focus()||mobileDialog.querySelector('.mobile-nav-list button')?.focus()};toolbar.appendChild(mobileTrigger);top.appendChild(toolbar);
}
function installOpenViewHook(){
  const original=window.openView;if(typeof original!=='function')return;
  window.openView=function(id,...rest){const out=original.call(this,id,...rest);requestAnimationFrame(()=>{enhanceAll();focusActiveHeading()});return out};
  sourceNav?.addEventListener('click',event=>{if(event.target.closest('button[data-view]'))requestAnimationFrame(()=>{enhanceAll();focusActiveHeading()})});
}
function installViewportHandling(){
  const update=()=>{const h=window.visualViewport?.height||window.innerHeight;document.documentElement.style.setProperty('--visual-viewport-height',`${Math.round(h)}px`);if(innerWidth>900&&mobileDialog?.open)mobileDialog.close()};update();window.visualViewport?.addEventListener('resize',update);window.addEventListener('resize',update);window.addEventListener('orientationchange',()=>setTimeout(update,100));
  document.addEventListener('focusin',event=>{if(innerWidth>900||!window.visualViewport||!event.target.matches('input,textarea,select'))return;setTimeout(()=>event.target.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'}),120)});
}
function init(){
  applyPreferences();
  const main=document.querySelector('main.main');if(main){main.id='main-content';main.tabIndex=-1}
  if(!document.querySelector('.skip-link')){const skip=document.createElement('a');skip.className='skip-link';skip.href='#main-content';skip.textContent='Skip to main content';document.body.prepend(skip)}
  liveRegion=document.createElement('div');liveRegion.className='sr-only a11y-live';liveRegion.setAttribute('role','status');liveRegion.setAttribute('aria-live','polite');liveRegion.setAttribute('aria-atomic','true');document.body.appendChild(liveRegion);
  buildMobileDialog();buildSettingsDialog();buildToolbar();installOpenViewHook();installViewportHandling();sourceNav?.addEventListener('keydown',navKeydown);
  const observer=new MutationObserver(()=>{enhanceAll();syncMobileNav()});observer.observe(document.querySelector('.app')||document.body,{subtree:true,childList:true});
  enhanceAll();
}
init();
})();
