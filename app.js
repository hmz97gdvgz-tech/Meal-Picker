'use strict';

// Built-in suggestions are public because this PWA is hosted in a public repository.
// They are copied to localStorage once and can thereafter be edited on the device.
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
function el(tag, cls, text) {
  const element = document.createElement(tag);
  if (cls) element.className = cls;
  if (text !== undefined) element.textContent = text;
  return element;
}
function btn(label, cls, fn) {
  const button = el('button', cls, label);
  button.type = 'button';
  button.addEventListener('click', fn);
  return button;
}
function go(screen, cat) { state.screen = screen; if (cat) state.category = cat; render(); }
function render() {
  const root = document.getElementById('app');
  root.replaceChildren();
  const header = el('header');
  header.append(el('strong', '', 'Meal Picker'));
  if (state.screen !== 'home') header.append(btn('← Home', 'ghost', () => go('home')));
  root.append(header);

  if (state.screen === 'home') {
    root.append(el('h1', '', 'What are you planning?'), el('p', '', 'Choose a category to see your suggestions.'));
    for (const cat of CATS) {
      const button = btn(cat, 'meal', () => { if (!current(cat) && ids(cat).length) next(cat); go('suggest', cat); });
      button.append(el('small', '', `${state.lists[cat].length} dishes saved`));
      root.append(button);
    }
    root.append(btn('Manage meal lists', 'secondary wide', () => go('manage')));
  }
  if (state.screen === 'suggest') {
    const cat = state.category;
    root.append(el('h1', '', cat));
    const dish = current(cat);
    if (!dish) {
      const empty = el('div', 'empty');
      empty.append(el('p', '', 'No dishes added yet. Add some to start receiving suggestions.'),
        btn('Add dishes', 'primary', () => go('edit', cat)));
      root.append(empty);
    } else {
      const box = el('div', 'suggestion');
      box.append(el('strong', '', dish.name));
      const s = session(cat);
      box.append(el('small', '', `Suggestion ${s.cursor + 1} · ${state.lists[cat].length} dishes available`));
      root.append(box);
      const actions = el('div', 'actions');
      const back = btn('← Previous', 'secondary', () => { previous(cat); render(); });
      back.disabled = s.cursor <= 0;
      actions.append(back, btn('Next →', 'primary', () => { next(cat); render(); }));
      root.append(actions);
    }
    const footer = el('footer');
    footer.append(btn('Edit ' + cat + ' dishes', 'ghost wide', () => go('edit', cat)));
    root.append(footer);
  }
  if (state.screen === 'manage') {
    root.append(el('h1', '', 'Manage meals'), el('p', '', 'Choose a category to add, edit or remove dishes.'));
    for (const cat of CATS) {
      const button = btn(cat, 'meal', () => go('edit', cat));
      button.append(el('small', '', `${state.lists[cat].length} dishes`));
      root.append(button);
    }
    const footer = el('footer');
    footer.append(btn('Export backup', 'secondary wide', exportData));
    root.append(footer);
    const file = el('input');
    file.type = 'file'; file.accept = 'application/json,.json'; file.className = 'hidden';
    file.addEventListener('change', importData);
    root.append(file, btn('Import backup', 'ghost wide', () => file.click()));
  }
  if (state.screen === 'edit') {
    const cat = state.category;
    root.append(el('h1', '', cat + ' dishes'), el('p', '', 'Add, edit or remove suggestions. Changes stay on this device.'));
    const form = el('form', 'editor');
    const input = el('input');
    input.placeholder = 'Enter a dish'; input.maxLength = MAX_NAME; input.required = true;
    const add = el('button', 'primary', 'Add'); add.type = 'submit';
    form.append(input, add);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name) return;
      if (state.lists[cat].length >= MAX_ITEMS) { alert('Category limit reached.'); return; }
      if (state.lists[cat].some(x => x.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
        alert('This dish is already in the list.'); return;
      }
      state.lists[cat].push({id: crypto.randomUUID(), name});
      save(); render();
    });
    root.append(form);
    for (const item of state.lists[cat]) {
      const row = el('div', 'row');
      row.append(el('span', '', item.name));
      const controls = el('div', 'actions');
      controls.append(
        btn('Edit', 'secondary small', () => {
          const value = prompt('Edit dish', item.name);
          if (value === null) return;
          const name = value.trim();
          if (!name || name.length > MAX_NAME) { alert('Dish name must be between 1 and 180 characters.'); return; }
          if (state.lists[cat].some(x => x.id !== item.id && x.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
            alert('Duplicate dish'); return;
          }
          item.name = name; save(); render();
        }),
        btn('Delete', 'ghost small', () => {
          if (!confirm('Delete ' + item.name + '?')) return;
          state.lists[cat] = state.lists[cat].filter(x => x.id !== item.id);
          session(cat); save(); render();
        })
      );
      row.append(controls); root.append(row);
    }
    if (!state.lists[cat].length) root.append(el('p', 'muted', 'No dishes added.'));
    const footer = el('footer');
    footer.append(btn('See suggestions', 'primary wide', () => {
      if (!current(cat) && ids(cat).length) next(cat);
      go('suggest', cat);
    }));
    root.append(footer);
  }
}
function exportData() {
  const data = {version: 2, lists: state.lists};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = el('a');
  a.href = url; a.download = 'meal-picker-backup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 250000) throw Error('Backup file is too large.');
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object' || !parsed.lists) throw Error('Invalid backup.');
    let candidate;
    if (CATS.every(c => Object.hasOwn(parsed.lists, c))) {
      candidate = Object.fromEntries(CATS.map(c => [c, validateList(parsed.lists[c])]));
    } else if (['Breakfast', 'Lunch', 'Dinner'].every(c => Array.isArray(parsed.lists[c]))) {
      // Older backup format: preserve the new Protein Power built-ins.
      candidate = initialLists();
      const breakfast = validateList(parsed.lists.Breakfast);
      const lunch = validateList(parsed.lists.Lunch);
      const dinner = validateList(parsed.lists.Dinner);
      if (breakfast === null || lunch === null || dinner === null) throw Error('Invalid legacy backup.');
      mergeUnique(candidate.Breakfast, breakfast);
      mergeUnique(candidate['Lunch / Dinner'], lunch);
      mergeUnique(candidate['Lunch / Dinner'], dinner);
    } else throw Error('Unrecognized categories.');
    if (Object.values(candidate).some(x => x === null)) throw Error('Invalid dish list.');
    if (!confirm('Replace your current meal lists with this backup?')) return;
    state.lists = candidate;
    state.sessions = Object.fromEntries(CATS.map(c => [c, {order: [], history: [], cursor: -1}]));
    save(); render();
  } catch (err) {
    alert('Could not import: ' + err.message);
  } finally { event.target.value = ''; }
}

save();
render();
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) { refreshing = true; window.location.reload(); }
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', {scope: './'}).catch(() => {}));
}
