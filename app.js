'use strict';

// Built-in suggestions and illustrative artwork are public because the GitHub Pages repository is public.
// Built-ins initialize local storage on first use; existing v2 data is preserved unmodified.
const CATS = ['Breakfast', 'Lunch / Dinner', 'Protein Power'];
const DEFAULT_NAMES = {
  'Breakfast': [
    'Dhokla',
    'Parantha: Aloo pyaaz, gobhi, paneer',
    'Idli',
    'Poha',
    'Veg sandwich',
    'Omelette/ fried egg Bread',
    'French Toast',
    'Oats Toast',
    'Chilla: besan, sooji, oats, moong dal',
    'Veg appe, Paneer stuffed appe',
    'Veg oats tikki, Dal tikki, Soya tikki',
    'Dahi toast',
    'Soya Keema parantha',
    'Avocado Toast',
    'Veg sooji toast',
    'Spinach corn sandwich'
  ],
  'Lunch / Dinner': [
    'Sauteed Vegetable',
    'Nutri Pulao',
    'Dosa',
    'Veg Pulav',
    'Pasta',
    'Noodles',
    'Veg quinoa',
    'Veg daliya',
    '3 bean salad',
    '2 channa salad',
    'Bhindi Masala',
    'Rajmah',
    'White channa',
    'Mushroom masala dry',
    'Basil Vegetables Curry & Rice',
    'Egg parantha',
    'Mushroom Stroganoff & herb Rice',
    'Veg cheese quesadillas'
  ],
  'Protein Power': [
    'Shahi paneer',
    'Paneer bhurji w besan',
    'Paneer do pyaaza',
    'Dahi paneer',
    'Matar paneer',
    'Butter garlic lemon paneer',
    'Chicken tikka marinade: curd/ lemon ginger garlic/ coriander garlic black pepper',
    'Chicken masala',
    'Chicken biryani',
    'Chicken tikka roll + coriander chutney'
  ]
};
const KEY = 'meal-picker-v2';
const OLD_KEY = 'meal-picker-v1';
const MAX_ITEMS = 500;
const MAX_NAME = 180;

function initialLists() {
  return Object.fromEntries(CATS.map(cat => [cat,
    DEFAULT_NAMES[cat].map((name, idx) => ({id: `starter-${CATS.indexOf(cat)}-${idx}`, name}))
  ]));
}
function fresh() {
  return {
    lists: initialLists(),
    sessions: Object.fromEntries(CATS.map(cat => [cat, {order: [], history: [], cursor: -1}])),
    screen: 'home',
    category: CATS[0]
  };
}
function validateList(raw) {
  if (!Array.isArray(raw) || raw.length > MAX_ITEMS) return null;
  const result = [];
  const seenNames = new Set();
  const seenIds = new Set();
  for (const item of raw) {
    if (!item || typeof item.id !== 'string' || !item.id || item.id.length > 150 ||
        typeof item.name !== 'string' || !item.name.trim() || item.name.length > MAX_NAME) return null;
    const name = item.name.trim();
    const comparisonName = name.toLocaleLowerCase();
    if (seenNames.has(comparisonName) || seenIds.has(item.id)) continue;
    seenNames.add(comparisonName);
    seenIds.add(item.id);
    result.push({id: item.id, name});
  }
  return result;
}
function mergeUnique(target, extras) {
  const names = new Set(target.map(x => x.name.toLocaleLowerCase()));
  const ids = new Set(target.map(x => x.id));
  for (const entry of extras || []) {
    if (target.length >= MAX_ITEMS) break;
    const name = entry.name.toLocaleLowerCase();
    if (names.has(name)) continue;
    const id = ids.has(entry.id) ? crypto.randomUUID() : entry.id;
    target.push({id, name: entry.name});
    names.add(name);
    ids.add(id);
  }
}
function safeSession(raw, list) {
  const allowed = new Set(list.map(x => x.id));
  const cleaned = {order: [], history: [], cursor: -1};
  if (!raw || typeof raw !== 'object') return cleaned;
  if (Array.isArray(raw.order)) cleaned.order = raw.order.filter(id => typeof id === 'string' && allowed.has(id)).slice(0, MAX_ITEMS);
  if (Array.isArray(raw.history)) cleaned.history = raw.history.filter(id => typeof id === 'string' && allowed.has(id)).slice(-10000);
  const cursor = Number.isInteger(raw.cursor) ? raw.cursor : cleaned.history.length - 1;
  cleaned.cursor = Math.min(Math.max(-1, cursor), cleaned.history.length - 1);
  return cleaned;
}
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw && raw.length <= 5000000 ? JSON.parse(raw) : null;
  } catch { return null; }
}
function loadState() {
  const result = fresh();
  const saved = readJSON(KEY);
  if (saved && saved.lists && typeof saved.lists === 'object') {
    for (const cat of CATS) {
      const list = validateList(saved.lists[cat]);
      if (list !== null) result.lists[cat] = list;
      result.sessions[cat] = safeSession(saved.sessions?.[cat], result.lists[cat]);
    }
    return result;
  }
  // One-time migration from the former Breakfast / Lunch / Dinner app.
  // Existing user-added dishes are preserved; old storage remains untouched.
  const old = readJSON(OLD_KEY);
  if (old && old.lists && typeof old.lists === 'object') {
    mergeUnique(result.lists['Breakfast'], validateList(old.lists.Breakfast));
    mergeUnique(result.lists['Lunch / Dinner'], validateList(old.lists.Lunch));
    mergeUnique(result.lists['Lunch / Dinner'], validateList(old.lists.Dinner));
  }
  return result;
}
let state = loadState();
let storageWarningShown = false;
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({lists: state.lists, sessions: state.sessions}));
  } catch {
    if (!storageWarningShown) {
      storageWarningShown = true;
      alert('Unable to save on this device. Changes may be lost. Check available storage and Safari settings.');
    }
  }
}
// The ordering is randomized; this is not used for security purposes.
function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function ids(cat) { return state.lists[cat].map(x => x.id); }
function session(cat) {
  const s = state.sessions[cat];
  const valid = new Set(ids(cat));
  s.order = s.order.filter(x => valid.has(x));
  s.history = s.history.filter(x => valid.has(x));
  s.cursor = Math.min(s.cursor, s.history.length - 1);
  return s;
}
function next(cat) {
  const s = session(cat);
  const all = ids(cat);
  if (!all.length) return;
  if (s.cursor < s.history.length - 1) {
    s.cursor++;
    save();
    return;
  }
  if (!s.order.length) {
    s.order = shuffle(all);
    if (s.history.length && all.length > 1 && s.order[0] === s.history.at(-1)) {
      [s.order[0], s.order[1]] = [s.order[1], s.order[0]];
    }
  }
  s.history.push(s.order.shift());
  if (s.history.length > 3000) s.history = s.history.slice(-3000);
  s.cursor = s.history.length - 1;
  save();
}
function previous(cat) {
  const s = session(cat);
  if (s.cursor > 0) s.cursor--;
  save();
}
function current(cat) {
  const s = session(cat);
  return state.lists[cat].find(x => x.id === s.history[s.cursor]);
}

// Indexes correspond to the bundled, 6-column x 8-row illustration atlas.
// The original starter IDs survive the v2 -> v3 migration.
const ART_BY_NAME = new Map(CATS.flatMap(cat => DEFAULT_NAMES[cat].map((name, i) => [
  name.trim().toLocaleLowerCase(), (cat === 'Breakfast' ? 0 : cat === 'Lunch / Dinner' ? 16 : 34) + i
])));
const ICONS = {
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4Z"/>',
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h2.5c5.8 0 7.4-12 13-12H22"/><path d="M2 6h2.5c2.5 0 4.3 2.1 6 4.5"/><path d="M14 16c1 1.2 2.2 2 3.5 2H22"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v3h16v-3"/>',
  upload: '<path d="M12 17V5m-4 4 4-4 4 4"/><path d="M4 17v3h16v-3"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  sparkle: '<path d="m12 3 2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1L12 3Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0ZM12 3v3M7 4v2m10-2v2"/>',
  heart: '<path d="M20 8c0 5-8 11-8 11S4 13 4 8a4.5 4.5 0 0 1 8-2 4.5 4.5 0 0 1 8 2Z"/>'
};
function icon(name) {
  const wrap = document.createElement('span'); wrap.className = 'icon'; wrap.setAttribute('aria-hidden','true');
  const svg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.sparkle) + '</svg>';
  // Only fixed, application-owned SVG strings can reach innerHTML here.
  wrap.innerHTML = svg;
  return wrap;
}
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function btn(label, cls, fn, glyph, glyphAfter=false) {
  const button = el('button', cls);
  button.type = 'button';
  if (glyph && !glyphAfter) button.append(icon(glyph));
  button.append(document.createTextNode(label));
  if (glyph && glyphAfter) button.append(icon(glyph));
  button.addEventListener('click', fn);
  return button;
}
function show(screen, category) {
  state.screen = screen;
  if (category) state.category = category;
  render();
  window.scrollTo({top:0, behavior:'instant'});
}
function artIndex(cat, dish) {
  if (!dish) return -1;
  const categoryIndex = CATS.indexOf(cat);
  const starter = /^starter-(\d+)-(\d+)$/.exec(dish.id);
  if (starter && Number(starter[1]) === categoryIndex) {
    const n = Number(starter[2]);
    const max = DEFAULT_NAMES[cat].length;
    if (n >= 0 && n < max && dish.name.trim().toLocaleLowerCase() === DEFAULT_NAMES[cat][n].toLocaleLowerCase()) return (categoryIndex===0 ? 0 : categoryIndex===1 ? 16 : 34) + n;
  }
  const val = ART_BY_NAME.get(dish.name.trim().toLocaleLowerCase());
  return Number.isInteger(val) ? val : -1;
}
function art(cat, dish, cls='') {
  const frame = el('div','dish-art ' + cls);
  const idx = artIndex(cat,dish);
  if (idx >= 0) frame.classList.add('art-' + idx);
  else {
    frame.classList.add('art-fallback', 'fallback-' + CATS.indexOf(cat));
    frame.append(icon(cat === 'Protein Power' ? 'heart' : 'bowl'));
  }
  frame.setAttribute('role','img');
  frame.setAttribute('aria-label', dish ? `Illustration for ${dish.name}` : 'Illustrated meal');
  return frame;
}
function tag(text, className='eyebrow') {return el('div',className,text);}
function header() {
  const nav = el('header','topbar');
  const logo = el('div','brandmark'); logo.append(icon('bowl'));
  const label = el('div','brand-name','Meal Picker');
  const brand = el('div','brand');brand.append(logo,label);
  if (state.screen === 'home') {
    nav.append(brand,btn('Edit menus','nav-manage',()=>show('manage'),'edit'));
  } else {
    const back = btn('', 'icon-button back',()=>show(state.screen === 'edit' ? 'manage' : 'home'),'back');
    back.setAttribute('aria-label',state.screen === 'edit'?'Back to manage menus':'Back to home');
    nav.append(back,brand);
    const spacer = el('div','topbar-space');nav.append(spacer);
  }
  return nav;
}
function mainHome(root) {
  const lead=el('section','home-intro');
  lead.append(tag('THE LITTLE DAILY DECISION'),el('h1','display-title','What are we eating?'),el('p','lede','Pick a menu. We’ll find the next idea.'));
  root.append(lead);
  const cards=el('section','category-list');
  const summaries=['Slow mornings, sorted.','For every appetite.','An extra helping of protein.'];
  for (let i=0;i<CATS.length;i++) {
    const cat=CATS[i];
    const card=btn('','category-card',()=>{
      if (!current(cat) && ids(cat).length) next(cat);
      show('suggest',cat);
    });
    card.textContent='';
    const featured=state.lists[cat].find(d=>artIndex(cat,d)>=0) || state.lists[cat][0] || {id:`starter-${i}-0`,name:DEFAULT_NAMES[cat][0]};
    card.append(art(cat,featured,'card-art'));
    const textBox=el('span','category-copy');
    textBox.append(el('span','category-title',cat),el('span','category-description',summaries[i]),el('span','category-count',`${state.lists[cat].length} ${state.lists[cat].length===1?'dish':'dishes'}`));
    card.append(textBox);
    const arrow=el('span','category-arrow');arrow.append(icon('next'));card.append(arrow);
    cards.append(card);
  }
  root.append(cards);
  const hint=el('div','shuffle-hint');
  const hintIcon=el('span','hint-icon');hintIcon.append(icon('shuffle'));
  const hintText=el('div');hintText.append(el('strong','','A fresh pick, no repeats'),el('span','','Every dish gets a turn before we reshuffle.'));
  hint.append(hintIcon,hintText);root.append(hint);
}
function mainSuggestion(root){
  const cat=state.category;
  const intro=el('section','suggest-intro');
  intro.append(tag('TODAY’S INSPIRATION'),el('h1','display-title',cat),el('p','lede','One idea at a time. Keep browsing until it feels right.'));
  root.append(intro);
  const dish=current(cat);
  if (!dish){
    const empty=el('section','empty-card');empty.append(icon('bowl'),el('h2','','Your menu is empty'),el('p','','Add a dish to start receiving suggestions.'),btn('Add dishes','solid-button',()=>show('edit',cat),'plus'));
    root.append(empty);return;
  }
  const stage=el('section','suggest-stage');
  const artWrap=el('div','stage-art'); artWrap.append(art(cat,dish,'hero-art'));stage.append(artWrap);
  const info=el('div','stage-info');
  info.append(tag('ON YOUR MENU','stage-eyebrow'));
  const title=el('h2','dish-name',dish.name); info.append(title);
  const pill=el('div','dish-meta'); pill.append(icon('shuffle'),document.createTextNode(`${state.lists[cat].length} dishes in rotation`));info.append(pill);
  stage.append(info);
  root.append(stage);
  const s=session(cat);
  const controls=el('div','nav-actions');
  const back=btn('Previous','previous-button',()=>{previous(cat);render();},'back');back.disabled=s.cursor<=0;
  const forward=btn('Next idea','next-button',()=>{next(cat);render();},'next',true);
  controls.append(back,forward);root.append(controls);
  const note=el('p','supporting-note');note.append(icon('check'),document.createTextNode('Next brings a new dish. Previous retraces your picks.'));
  root.append(note);
  const foot=el('div','bottom-edit');foot.append(btn(`Edit ${cat} menu`,'text-button',()=>show('edit',cat),'edit'));root.append(foot);
}
function mainManage(root){
  const intro=el('section','page-intro');intro.append(tag('MAKE IT YOURS'),el('h1','display-title','Your menus'),el('p','lede','Update your suggestions anytime. Changes are saved on this device.'));root.append(intro);
  for(let i=0;i<CATS.length;i++){
    const cat=CATS[i];const card=btn('','manage-card',()=>show('edit',cat));card.textContent='';
    const text=el('span','manage-copy');text.append(el('strong','',cat),el('span','',`${state.lists[cat].length} dishes · tap to edit`));
    card.append(art(cat,state.lists[cat][0] || {id:`starter-${i}-0`,name:DEFAULT_NAMES[cat][0]},'manage-art'),text,icon('next'));
    root.append(card);
  }
  const backup=el('section','backup-card');backup.append(el('h2','','Keep a copy'),el('p','','Export your lists to iCloud Drive, or restore a backup. Your data is stored locally, not on GitHub.'));
  const buttons=el('div','backup-actions');buttons.append(btn('Export backup','outline-button',exportData,'download'));
  const file=el('input','visually-hidden');file.type='file';file.accept='application/json,.json';file.addEventListener('change',importData);
  buttons.append(btn('Import backup','outline-button',()=>file.click(),'upload'));backup.append(buttons,file);
  root.append(backup);
  const settings=el('div','settings-note');settings.append(icon('info'),document.createTextNode('Appearance automatically follows your iPhone’s Light / Dark Mode setting.'));root.append(settings);
}
let editingId = null;
function mainEdit(root){
  const cat=state.category;
  const intro=el('section','page-intro');intro.append(tag('EDIT MENU'),el('h1','display-title',cat),el('p','lede','Add, rename or remove a dish. The illustrations are included for your original 44 dishes.'));root.append(intro);
  const form=el('form','add-form');const input=el('input','add-input');input.type='text';input.placeholder='Add a dish';input.maxLength=MAX_NAME;input.required=true;input.setAttribute('aria-label','New dish name');
  const add=el('button','add-button');add.type='submit';add.append(icon('plus'),document.createTextNode('Add'));
  form.append(input,add);
  form.addEventListener('submit',event=>{
    event.preventDefault();const name=input.value.trim();if(!name)return;
    if(state.lists[cat].length>=MAX_ITEMS){alert('Category limit reached.');return;}
    if(state.lists[cat].some(x=>x.name.toLocaleLowerCase()===name.toLocaleLowerCase())){alert('This dish is already in the menu.');return;}
    const freshId=crypto.randomUUID();state.lists[cat].push({id:freshId,name});
    // Make a newly added dish eligible in the current non-repeating cycle.
    const s=session(cat);
    if(s.history.length || s.order.length){const pos=Math.floor(Math.random()*(s.order.length+1));s.order.splice(pos,0,freshId);}
    save();editingId=null;render();
  });root.append(form);
  root.append(el('div','list-heading',`${state.lists[cat].length} SAVED DISHES`));
  const list=el('section','edit-list');
  for (const dish of state.lists[cat]){
    const row=el('div','dish-row');row.append(art(cat,dish,'row-art'));
    if(editingId===dish.id){
      const editForm=el('form','inline-edit');const editInput=el('input','edit-input');editInput.value=dish.name;editInput.required=true;editInput.maxLength=MAX_NAME;
      const saveBtn=el('button','mini-save');saveBtn.type='submit';saveBtn.textContent='Save';
      editForm.append(editInput,saveBtn,btn('Cancel','mini-cancel',()=>{editingId=null;render()}));
      editForm.addEventListener('submit',e=>{
        e.preventDefault();const name=editInput.value.trim();
        if(!name || name.length>MAX_NAME){alert('Dish name must be between 1 and 180 characters.');return;}
        if(state.lists[cat].some(x=>x.id!==dish.id&&x.name.toLocaleLowerCase()===name.toLocaleLowerCase())){alert('That dish is already in your list.');return;}
        dish.name=name;editingId=null;save();render();
      });
      row.append(editForm);
    }else{
      row.append(el('span','row-name',dish.name));
      const actions=el('span','row-buttons');
      const editBtn=btn('','row-icon',()=>{editingId=dish.id;render();document.querySelector('.edit-input')?.focus();},'edit');editBtn.setAttribute('aria-label',`Edit ${dish.name}`);
      const delBtn=btn('','row-icon row-delete',()=>{
        if(!confirm(`Delete “${dish.name}”?`))return;
        state.lists[cat]=state.lists[cat].filter(x=>x.id!==dish.id);
        session(cat);save();render();
      },'trash');delBtn.setAttribute('aria-label',`Delete ${dish.name}`);
      actions.append(editBtn,delBtn);row.append(actions);
    }
    list.append(row);
  }
  if(!state.lists[cat].length)list.append(el('p','lede','Nothing here yet. Add your first dish above.'));
  root.append(list);
  root.append(btn('See suggestions','solid-button wide-button',()=>{
    if(!current(cat)&&ids(cat).length)next(cat);
    show('suggest',cat);
  },'next',true));
}
function render(){
  const root=document.getElementById('app');root.replaceChildren();root.append(header());
  const content=el('div','content');
  if(state.screen==='home')mainHome(content);
  else if(state.screen==='suggest')mainSuggestion(content);
  else if(state.screen==='manage')mainManage(content);
  else if(state.screen==='edit')mainEdit(content);
  root.append(content);
  const footer=el('footer','app-footer');footer.append(el('span','','MADE FOR YOUR MENU'),el('span','','v3.0'));
  root.append(footer);
}
function exportData(){
  const data={version:3,lists:state.lists};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download='meal-picker-backup.json';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importData(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
    if(file.size>250000)throw Error('Backup file is too large.');
    const parsed=JSON.parse(await file.text());
    if(!parsed || typeof parsed!=='object'|| !parsed.lists ||typeof parsed.lists!=='object')throw Error('Invalid backup.');
    let candidate;
    if(CATS.every(c=>Object.hasOwn(parsed.lists,c)))candidate=Object.fromEntries(CATS.map(c=>[c,validateList(parsed.lists[c])]));
    else if(['Breakfast','Lunch','Dinner'].every(c=>Array.isArray(parsed.lists[c]))){
      candidate=initialLists();
      const b=validateList(parsed.lists.Breakfast),l=validateList(parsed.lists.Lunch),d=validateList(parsed.lists.Dinner);
      if(b===null||l===null||d===null)throw Error('Invalid legacy backup.');
      mergeUnique(candidate.Breakfast,b);mergeUnique(candidate['Lunch / Dinner'],l);mergeUnique(candidate['Lunch / Dinner'],d);
    }else throw Error('Unrecognized categories.');
    if(Object.values(candidate).some(x=>x===null))throw Error('Invalid dish list.');
    if(!confirm('Replace your current meal lists with this backup?'))return;
    state.lists=candidate;state.sessions=Object.fromEntries(CATS.map(cat=>[cat,{order:[],history:[],cursor:-1}]));
    editingId=null;save();render();
  }catch(error){alert('Could not import: '+error.message);}
  finally{event.target.value='';}
}
save();render();
if('serviceWorker' in navigator){
  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!refreshing){refreshing=true;window.location.reload();}
  });
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
}
