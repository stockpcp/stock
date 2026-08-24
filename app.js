/* Repinho Stock Finder — logica.
   Porte 1:1 do handoff de design de 18/08 (design_handoff_stock_finder/Stock Finder.dc.html),
   dono do visual, da copy e do fluxo. O canvas roda num runtime proprietario; aqui e vanilla,
   mas estrutura, texto e interacao seguem o handoff.
   Regra de dado: o site NAO deriva nada. Portfolio, m3, sku e id vem prontos do gerador
   (gerar_stock.py, na pasta acima), que e o dono da regra da rpn-core §4. Ele substituiu o
   conversor de navegador xlsx_to_stockjson.html, apagado em 24/08.
   Copy de UI: i18n.js (STR/LANGS), carregado antes deste arquivo. */

'use strict';

// ---------------------------------------------------------------- estado
const S = {
  lang:'en', portfolio:null, gauges:[], species:null,
  refine:{ Certificate:'', Grade:'', Size:'' },                                    // tela 03
  full:{ Portfolio:'', Thickness:'', Logs:'', Certificate:'', Grade:'', Size:'' }, // overlay
  // 24/08 - a lista nasce escolhida. Com a linha magra ela mostra mais itens por tela que a
  // grade e alinha preco em coluna, que e como se compara SKU. A grade continua a um clique.
  list:{}, focus:null, view:'list', fullOpen:false, guideOpen:false, step:0
};
let DATA = [], META = {}, CONTENT = {}, GUIDE = {}, ORDER = ['ns','ss','st','nc'];

// Destinos da lista de interesse — UNICO ponto de configuracao dos dois canais.
// WHATSAPP: formato internacional, so digitos (55 + DDD + numero). Vazio = o botao nao aparece;
// e a linha que a TI destrava quando o chip da Repinho existir.
const EMAIL    = 'comercial01@repinho.ind.br';
const WHATSAPP = '';

const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const n = document.createElement(tag);
  if(cls) n.className = cls; if(html != null) n.innerHTML = html; return n; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);

// ---------------------------------------------------------------- dominio
// Densidades e tons por composicao. Ordem canonica pine → euca (nao alfabetica).
// VALOR UNICO, nao faixa (Fabricio, 14/08): a faixa da rpn-core §3 e o envelope tecnico; o
// site mostra o numero pratico da chapa. `combi e` segue em faixa por nao estar no armazem —
// os tiles so renderizam o que existe no JSON, entao ele nunca aparece hoje.
const SPECIES = {
  'pine'   :{ order:1, density:'~530',    tone:'#E3D6BC' },
  'combi'  :{ order:2, density:'~615',    tone:'#DCC9AC' },
  'twin e' :{ order:3, density:'~545',    tone:'#D8C4A8' },   // 545 e DELIBERADO: fica abaixo da faixa 565-605 da rpn-core §3 — ver CLAUDE.md §7b. NAO 'corrigir'.
  'combi e':{ order:4, density:'600–660', tone:'#D0B69B' },
  'twin'   :{ order:5, density:'~660',    tone:'#CDB295' },
  'euca'   :{ order:6, density:'~700',    tone:'#C9A38C' }
};
const spec = c => SPECIES[c] || { order:9, density:'—', tone:'#DDD3C2' };

// Volume SEMPRE com 3 casas (Fabricio, 13/08). Separador de milhar obrigatorio no agregado:
// "1275.580" sem ele se le como 1,2 MILHAO em pt-BR, onde o ponto separa milhar.
const m3 = v => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits:3, maximumFractionDigits:3 });
const nInt = v => Number(v || 0).toLocaleString('en-US');

const SECTIONS = ['s0','s1','s2','s3'];
const T = () => STR[S.lang] || STR.en;

// ---------------------------------------------------------------- boot
Promise.all([
  fetch('stock_data.json').then(r => r.json()),
  fetch('meta.json').then(r => r.json()).catch(() => ({})),
  fetch('content/portfolio-content.json').then(r => r.json()),
  fetch('content/guide-content.json').then(r => r.json()).catch(() => ({}))
]).then(([rows, meta, content, guide]) => {
  DATA = rows; META = meta; CONTENT = content; GUIDE = guide;
  if(Array.isArray(content._order)) ORDER = content._order;
  build();
}).catch(err => {
  document.body.insertAdjacentHTML('afterbegin',
    '<pre style="position:fixed;z-index:99;inset:20px;background:#fff;padding:20px;font:13px/1.5 monospace;overflow:auto">' +
    'Nao consegui carregar stock_data.json.\n\nAbra o site por HTTP (fetch nao funciona em file://):\n' +
    '  node dev-server.js\n\nDetalhe: ' + err + '</pre>');
});

/* O header e fixo e NAO tem fundo proprio: quem cobre a faixa dele na tela 03 e o padding
   do topo da barra de filtros. Esse padding era 100px cravado contra um header que mede
   109px no desktop e muda de altura quando os botoes de envio aparecem ou no telefone.
   Medir e publicar em --hd-h faz os dois andarem juntos em qualquer tela. */
let hdVW = 0, hdVH = 0;
function syncHeaderHeight(force){
  const hd = $('hd'); if(!hd) return;
  // Sai cedo quando a janela nao mudou de tamanho. A comparacao e com innerWidth/innerHeight,
  // que sao leitura de viewport e NAO forcam layout — por isso da para chamar isto a cada
  // evento de rolagem sem custo. O getBoundingClientRect (esse sim forca) so roda quando
  // a janela mudou de fato, ou quando alguem passa force=true.
  if(!force && innerWidth === hdVW && innerHeight === hdVH) return;
  hdVW = innerWidth; hdVH = innerHeight;
  const h = Math.round(hd.getBoundingClientRect().height);
  if(h > 0) document.documentElement.style.setProperty('--hd-h', h + 'px');
  syncBarHeight();
}
// Altura real do bloco grudado, publicada em --bar-h para o scroll-padding do #scroll.
// Ela muda quando os chips de filtro entram e saem, entao e remedida a cada renderAll - e
// NAO a cada rolagem: getBoundingClientRect forca layout e isto rodaria 60x por segundo.
function syncBarHeight(){
  const n = S.fullOpen ? document.querySelector('.full-top') : document.querySelector('.stock-top');
  if(!n) return;
  const h = Math.round(n.getBoundingClientRect().height);
  if(h > 0) document.documentElement.style.setProperty('--bar-h', h + 'px');
}

function build(){
  buildLangSwitch();
  buildRail();
  wire();
  applyLang();
  ensureRail();
  syncHeaderHeight();
  // Tres gatilhos, porque cada um cobre um buraco do outro:
  //  - resize imediato: o caso comum;
  //  - resize + 80ms: no salto entre telas alta e baixa a media query troca o tamanho do logo
  //    DEPOIS do evento, e a medida imediata pegava o valor velho (medido: token em 109px com
  //    o header ja em 64px, e 45px de faixa morta na barra de filtros);
  //  - ResizeObserver: pega o que resize nao ve — a linha de botoes do header quebrando quando
  //    a lista de interesse recebe o primeiro item.
  //  - fonts.ready: a webfont troca a metrica do header depois do primeiro layout.
  // O resize resolve o caso comum; o +80ms cobre a media query que troca o tamanho do logo
  // depois do evento; o ResizeObserver pega o header crescendo sem a janela mudar (a linha de
  // botoes quebra quando a lista de interesse recebe o primeiro item); fonts.ready cobre a
  // troca de metrica quando a webfont chega. Se TUDO isso falhar, o railTick corrige na
  // primeira rolagem — foi assim que este bug apareceu na medicao e nao quero depender de um
  // unico gatilho de novo.
  let hdTick = 0;
  window.addEventListener('resize', () => {
    syncHeaderHeight();
    clearTimeout(hdTick); hdTick = setTimeout(() => syncHeaderHeight(true), 80);
  }, { passive:true });
  if(window.ResizeObserver) new ResizeObserver(() => syncHeaderHeight(true)).observe($('hd'));
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => syncHeaderHeight(true));
}

// ---------------------------------------------------------------- idioma
function buildLangSwitch(){
  const box = $('langsw'); box.innerHTML = '';
  LANGS.forEach(l => {
    const b = el('button', 'lg', l.code);
    b.title = l.name;
    b.onclick = () => { S.lang = l.key; document.documentElement.lang = l.key; applyLang(); };
    box.appendChild(b);
  });
}

// Reescreve tudo o que depende de idioma. Roda no boot e a cada troca de bandeira — e por
// isso que nenhuma copy fica escrita no index.html, so os nos vazios com `data-t`.
function applyLang(){
  const t = T();
  // ficava "en" mesmo com a tela em PT/ES: leitor de tela le com a pronuncia errada e o
  // navegador oferece traduzir uma pagina que ja esta no idioma do usuario
  document.documentElement.lang = S.lang === 'pt' ? 'pt-BR' : S.lang;
  document.querySelectorAll('[data-t]').forEach(n => { n.textContent = t[n.dataset.t] || ''; });
  [...$('langsw').children].forEach((b, i) => b.classList.toggle('on', LANGS[i].key === S.lang));
  [...$('rail').children].forEach((b, i) => { b.title = t.rail[i]; });
  buildViewSwitches();
  renderPortfolios();
  renderGauges();
  renderSpecies();
  buildFilters();
  buildFullFilters();
  renderGuide();
  renderAll();
}

// ---------------------------------------------------------------- ajuda (pop-up)
// Substitui o UserGuide.pdf do site antigo. Re-renderiza a cada troca de idioma, entao a
// janela nunca abre num idioma diferente do da tela — mesmo se ja estiver aberta.
function renderGuide(){
  const g = GUIDE[S.lang] || GUIDE.en;
  if(!g) return;
  $('guideTitle').textContent = g.title;
  $('closeGuide2').textContent = g.close;
  $('closeGuide').setAttribute('aria-label', g.close);
  $('helpBtn').title = g.title;
  const html = ['<p class="g-intro">' + esc(g.intro) + '</p>'];
  (g.sections || []).forEach(s => {
    html.push('<section class="g-sec"><h3>' + esc(s.h) + '</h3><p>' + esc(s.p) + '</p>');
    if(s.list) html.push('<ul>' + s.list.map(li => '<li>' + esc(li) + '</li>').join('') + '</ul>');
    html.push('</section>');
  });
  $('guideBody').innerHTML = html.join('');
}

function openGuide(open){
  S.guideOpen = open;
  $('guide').classList.toggle('hidden', !open);
  // a ajuda pode ser aberta POR CIMA do inventario completo — ao fechar, so destrava a rolagem
  // do fundo se o overlay tambem estiver fechado, senao a pagina passa a rolar atras dele
  document.body.classList.toggle('locked', open || S.fullOpen);
  if(open){ $('guide').scrollTop = 0; $('closeGuide').focus(); }
}

// ---------------------------------------------------------------- rail
/* O rail e pintado pelo scroll do container, nao por IntersectionObserver: a tela 03 cresce
   com o catalogo e fica mais alta que a viewport, e razao de interseccao deixa de significar
   "esta na tela" nesse caso (14/08). O criterio aqui e o meio da janela — a secao que cobre o
   centro e a ativa, qualquer que seja a altura dela. */
function buildRail(){
  const rail = $('rail'); rail.innerHTML = '';
  SECTIONS.forEach((id, i) => {
    const b = el('button', i === 0 ? 'on' : '',
      '<span class="n">0' + i + '</span><span class="bar"></span>');
    b.onclick = () => goTo(i);
    rail.appendChild(b);
  });
}
function railTick(){
  const c = $('scroll'); if(!c) return;
  syncHeaderHeight();   // rede de seguranca: nao depende do evento resize ter chegado
  const mid = c.scrollTop + c.clientHeight / 2;
  let step = 0;
  SECTIONS.forEach((id, i) => { const n = $(id); if(n && n.offsetTop <= mid) step = i; });
  if(step !== S.step){
    S.step = step;
    [...$('rail').children].forEach((b, i) => b.classList.toggle('on', i === step));
  }
}
function ensureRail(){
  const c = $('scroll');
  if(c && !c.dataset.railArmed){
    c.dataset.railArmed = '1';
    c.addEventListener('scroll', railTick, { passive:true });
  }
  railTick();
}
function goTo(i){
  const c = $('scroll'), t = $(SECTIONS[i]);
  if(!c || !t) return;
  const start = c.scrollTop, delta = t.offsetTop - start, t0 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t0) / 820);
    const e = p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;   // easeInOutCubic
    c.scrollTop = start + delta * e;
    railTick();
    if(p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------- filtro
function filtered(){
  const R = S.refine;
  return DATA.filter(it =>
    (!S.portfolio || it.Portfolio === S.portfolio) &&
    (!S.gauges.length || S.gauges.indexOf(it.Thickness) !== -1) &&
    (!S.species || it.Logs === S.species) &&
    (!R.Certificate || it.Certificate === R.Certificate) &&
    (!R.Grade || it.Grade === R.Grade) &&
    (!R.Size || it.Size === R.Size)
  ).sort(byPrice);
}
function fullFiltered(){
  const F = S.full;
  return DATA.filter(it =>
    (!F.Portfolio || it.Portfolio === F.Portfolio) &&
    (!F.Thickness || String(it.Thickness) === F.Thickness) &&
    (!F.Logs || it.Logs === F.Logs) &&
    (!F.Certificate || it.Certificate === F.Certificate) &&
    (!F.Grade || it.Grade === F.Grade) &&
    (!F.Size || it.Size === F.Size)
  ).sort(byPrice);
}
// Em estoque primeiro; depois preco do mais alto para o mais baixo (Fabricio, 13/08), para
// cada card ficar ao lado dos seus pares de faixa. Empate resolve por espessura.
function byPrice(a, b){ return (b.Crates > 0) - (a.Crates > 0) || b.Price - a.Price || a.Thickness - b.Thickness; }

// Substituto em 3 camadas: mesma certificacao + mesma composicao → mesma certificacao →
// mesmo portfolio. Dentro da camada vence a espessura mais proxima.
// Hoje nunca dispara: o JSON so traz o que esta no armazem, entao Crates === 0 nao existe.
function suggestFor(item){
  const pool = DATA.filter(i => i.Crates > 0 && i.id !== item.id);
  const tiers = [
    pool.filter(i => i.Certificate === item.Certificate && i.Logs === item.Logs),
    pool.filter(i => i.Certificate === item.Certificate),
    pool.filter(i => i.Portfolio === item.Portfolio)
  ];
  for(const t of tiers)
    if(t.length) return t.slice().sort((a,b) =>
      Math.abs(a.Thickness - item.Thickness) - Math.abs(b.Thickness - item.Thickness))[0];
  return null;
}

const crateSum = rows => nInt(rows.reduce((s,o) => s + (o.Crates || 0), 0));
// Volume agregado: o hero promete "o volume que esta no armazem", entao a tela tem de somar.
// a unidade sai em <span> para levar 3px a menos que o numero (Fabricio, 20/08) -> usar innerHTML
const volSum = rows => m3(rows.reduce((s,o) => s + (Number(o.m3) || 0), 0)) + ' <span class="u">m³</span>';
const uniq = key => [...new Set(DATA.map(o => o[key]))]
  .sort((a,b) => typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
const speciesList = () => uniq('Logs').sort((a,b) => spec(a).order - spec(b).order);

// ---------------------------------------------------------------- facetas que reagem
// Ate 24/08 os chips de espessura e os ladrilhos de composicao nasciam de um DISTINCT do
// catalogo INTEIRO e ignoravam o portfolio escolhido no passo 01. Resultado medido: 52% das
// combinacoes possiveis levavam a uma tela vazia - o cliente respondia duas perguntas para
// receber "nada encontrado", que e a pior coisa que um localizador de estoque pode fazer.
//
// A regra e a da busca facetada: cada faceta conta contra TODAS as outras escolhas, menos
// contra a PROPRIA. Contar contra a propria quebraria a espessura, que e multipla - com 18mm
// marcado, todas as outras zerariam e o segundo clique ficaria impossivel.
//
// F opcional: quando vem, conta sobre o estado do overlay (S.full), que e independente do
// quiz de proposito - o overlay existe para ver o armazem inteiro sem desmontar a resposta.
function base(exceto, F){
  const P = F ? F.Portfolio : S.portfolio;
  const G = F ? (F.Thickness ? [Number(F.Thickness)] : []) : S.gauges;
  const L = F ? F.Logs : S.species;
  const R = F || S.refine;
  return DATA.filter(it =>
    (exceto === 'Portfolio'   || !P || it.Portfolio === P) &&
    (exceto === 'Thickness'   || !G.length || G.indexOf(it.Thickness) !== -1) &&
    (exceto === 'Logs'        || !L || it.Logs === L) &&
    (exceto === 'Certificate' || !R.Certificate || it.Certificate === R.Certificate) &&
    (exceto === 'Grade'       || !R.Grade || it.Grade === R.Grade) &&
    (exceto === 'Size'        || !R.Size || String(it.Size) === String(R.Size))
  );
}
// Trocar de portfolio no passo 01 pode deixar para tras um refino que so existia no anterior
// (24mm nao existe em ST, por exemplo). Podar e o que impede o beco sem saida - e a poda fica
// VISIVEL, porque o chip correspondente some da barra: nao e escolha apagada em silencio.
function podaRefinos(){
  const b = DATA.filter(o => !S.portfolio || o.Portfolio === S.portfolio);
  S.gauges = S.gauges.filter(mm => b.some(o => o.Thickness === mm));
  if(S.species && !b.some(o => o.Logs === S.species)) S.species = null;
  ['Certificate','Grade','Size'].forEach(k => {
    if(S.refine[k] && !b.some(o => String(o[k]) === String(S.refine[k]))) S.refine[k] = '';
  });
}

// ---------------------------------------------------------------- tela 01
function renderPortfolios(){
  const box = $('portfolioCards'); if(!box) return;
  const cards = (CONTENT[S.lang] || CONTENT.en || {}).cards || {};
  box.innerHTML = '';
  ORDER.forEach(k => {
    const c = cards[k] || {}, id = k.toUpperCase(), on = S.portfolio === id;
    const b = el('button', 'pcard' + (on ? ' on' : ''));
    b.dataset.p = id;
    b.innerHTML =
      '<span class="pbg"></span><span class="pring"></span>' +
      '<span class="ptop"><span class="tag">' + esc(c.tag) + '</span>' +
        '<span class="radio"><i></i></span></span>' +
      '<span class="pbot">' +
        '<span class="pmeta"><span>' + esc(c.cert) + '</span>' +
          '<span class="cnt">' + DATA.filter(o => o.Portfolio === id).length + ' ' + esc(T().skus) + '</span></span>' +
        '<span class="ptitle">' + esc(c.title1) + ' <em>' + esc(c.title2) + '</em></span>' +
        '<span class="pdesc">' + esc(c.desc) + '</span>' +
        '<span class="puses">' + esc(c.uses) + '</span>' +
      '</span>';
    b.onclick = () => {
      const was = S.portfolio === id;
      S.portfolio = was ? null : id;
      podaRefinos();
      renderPortfolios(); renderGauges(); renderSpecies(); buildFilters(); renderAll();
      if(!was) setTimeout(() => goTo(2), 420);
    };
    box.appendChild(b);
  });
}

// ---------------------------------------------------------------- tela 02
function renderGauges(){
  const box = $('gaugeChips'); if(!box) return;
  const b0 = base('Thickness');
  const vivas = [...new Set(b0.map(o => o.Thickness))].sort((a,b) => a - b);
  const list = uniq('Thickness');
  // a faixa anunciada e a que sobrou DE PE, nao a do catalogo inteiro
  const faixa = vivas.length ? vivas : list;
  $('gaugeHd').textContent = faixa.length ? T().thicknessRange(faixa[0], faixa[faixa.length-1]) : T().thickness;
  box.innerHTML = '';
  list.forEach(mm => {
    const on = S.gauges.indexOf(mm) !== -1;
    const n = b0.filter(o => o.Thickness === mm).length;
    const morto = n === 0 && !on;
    // A espessura MORTA continua na tela, apagada: sumir com ela mudaria o comprimento da
    // faixa a cada clique e o cliente perderia a referencia de onde estava.
    const b = el('button', 'chip' + (on ? ' on' : '') + (morto ? ' zero' : ''),
      mm + 'mm<span class="n">' + n + '</span>');
    b.disabled = morto;
    if(morto) b.setAttribute('aria-disabled', 'true');
    b.onclick = () => {
      if(morto) return;
      const i = S.gauges.indexOf(mm);
      if(i === -1) S.gauges.push(mm); else S.gauges.splice(i, 1);
      renderGauges(); renderSpecies(); buildFilters(); renderAll();
    };
    box.appendChild(b);
  });
}
function renderSpecies(){
  const box = $('speciesTiles'); if(!box) return;
  const b0 = base('Logs');
  box.innerHTML = '';
  speciesList().forEach(c => {
    const m = spec(c), on = S.species === c;
    const n = b0.filter(o => o.Logs === c).length;
    const morto = n === 0 && !on;
    const b = el('button', 'sp' + (on ? ' on' : '') + (morto ? ' zero' : ''));
    // a unidade acompanha o NUMERO (decisao 14/08); o cabecalho da faixa so nomeia a grandeza
    b.innerHTML = '<span class="swatch" style="background-color:' + m.tone + '"></span>' +
      '<span class="nm">' + esc(c) + '<span class="n">' + n + '</span></span>' +
      '<span class="de num">' + m.density + ' kg/m³</span>';
    b.disabled = morto;
    if(morto) b.setAttribute('aria-disabled', 'true');
    b.onclick = () => {
      if(morto) return;
      S.species = on ? null : c;
      renderGauges(); renderSpecies(); buildFilters(); renderAll();
    };
    box.appendChild(b);
  });
}

// ---------------------------------------------------------------- chips do filtro ativo
function chipList(){
  const t = T(), cards = (CONTENT[S.lang] || CONTENT.en || {}).cards || {}, out = [];
  if(S.portfolio){
    const c = cards[S.portfolio.toLowerCase()];
    out.push({ kind:t.fPortfolio, label: c ? c.title1 + ' ' + c.title2 : S.portfolio,
      drop: () => { S.portfolio = null; renderPortfolios(); } });
  }
  S.gauges.slice().sort((a,b) => a-b).forEach(mm =>
    out.push({ kind:t.kGauge, label: mm + 'mm',
      drop: () => { S.gauges = S.gauges.filter(x => x !== mm); renderGauges(); } }));
  if(S.species) out.push({ kind:t.fComposition, label:S.species,
    drop: () => { S.species = null; renderSpecies(); } });
  [['Certificate', t.fCertificate], ['Grade', t.fQuality], ['Size', t.fDimension]].forEach(([k, label]) => {
    if(S.refine[k]) out.push({ kind:label, label:String(S.refine[k]).toUpperCase(),
      drop: () => { S.refine[k] = ''; } });
  });
  return out;
}
function renderChips(chips){
  const bar = $('chipbar'); bar.innerHTML = '';
  chips.forEach(c => {
    const b = el('button', 'fchip',
      '<span class="k">' + esc(c.kind) + '</span>' + esc(c.label) + '<span class="x">×</span>');
    b.onclick = () => { c.drop(); buildFilters(); renderAll(); };
    bar.appendChild(b);
  });
  if(chips.length){
    const b = el('button', 'clear', esc(T().clearAll));
    b.onclick = resetFilters;
    bar.appendChild(b);
  } else {
    bar.appendChild(el('span', 'nosel', esc(T().noSelectionNote)));
  }
}
function resetFilters(){
  S.portfolio = null; S.gauges = []; S.species = null;
  S.refine = { Certificate:'', Grade:'', Size:'' };
  renderPortfolios(); renderGauges(); renderSpecies(); buildFilters(); renderAll();
}

// ---------------------------------------------------------------- selects
// So oferece o que ainda existe. Antes vinha do catalogo inteiro, entao o seletor listava
// certificados e qualidades que a selecao corrente ja tinha eliminado - cada um deles um
// caminho direto para a tela vazia. O valor JA escolhido nunca some, porque o base() ignora
// a propria dimensao ao contar.
function optionsFor(key, upper, F){
  const rows = base(key, F);
  const vs = [...new Set(rows.map(o => o[key]))]
    .sort((a,b) => typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
  return [{ v:'', t:T().all }].concat(vs.map(v =>
    ({ v:String(v), t: upper ? String(v).toUpperCase() : String(v) })));
}
function mkSelect(label, value, options, onChange){
  const wrap = el('div', 'sel' + (value ? ' on' : ''));
  wrap.appendChild(el('label', null, esc(label)));
  const s = document.createElement('select');
  options.forEach(o => {
    const op = document.createElement('option');
    op.value = o.v; op.textContent = o.t;
    if(String(o.v) === String(value)) op.selected = true;
    s.appendChild(op);
  });
  // o <label> ao lado nao esta ligado ao campo (sem for/id), entao sem isto o leitor de
  // tela anuncia so "lista, All" — sem dizer de que filtro se trata
  s.setAttribute('aria-label', label);
  s.onchange = e => onChange(e.target.value);
  wrap.appendChild(s);
  return wrap;
}
/* Os 6 filtros da tela 03 escrevem no MESMO estado do quiz (portfolio/gauges/species) — mexer
   aqui reflete nos chips e nos passos 01/02. Nao e um segundo conjunto de filtros: e a mesma
   selecao, por outro controle. Thickness aceita so um valor pelo select (os chips do passo 02
   continuam multiplos); com 2+ marcados o select fica em "All" para nao mentir. */
function buildFilters(){
  const box = $('filters'); if(!box) return;
  const t = T();
  // as duas dimensoes que o quiz ja perguntou tambem so listam o que ainda existe
  const vivasLogs = new Set(base('Logs').map(o => o.Logs));
  const gl = [...new Set(base('Thickness').map(o => o.Thickness))].sort((a,b) => a - b);
  box.innerHTML = '';
  [
    mkSelect(t.fComposition, S.species || '',
      [{ v:'', t:t.all }].concat(speciesList().filter(c => vivasLogs.has(c)).map(c => ({ v:c, t:c }))),
      v => { S.species = v || null; renderGauges(); renderSpecies(); buildFilters(); renderAll(); }),
    mkSelect(t.fPortfolio, S.portfolio || '', optionsFor('Portfolio', true),
      v => { S.portfolio = v || null; podaRefinos();
             renderPortfolios(); renderGauges(); renderSpecies(); buildFilters(); renderAll(); }),
    mkSelect(t.fCertificate, S.refine.Certificate, optionsFor('Certificate', true),
      v => { S.refine.Certificate = v; buildFilters(); renderAll(); }),
    mkSelect(t.fQuality, S.refine.Grade, optionsFor('Grade', true),
      v => { S.refine.Grade = v; buildFilters(); renderAll(); }),
    mkSelect(t.fDimension, S.refine.Size, optionsFor('Size', false),
      v => { S.refine.Size = v; buildFilters(); renderAll(); }),
    mkSelect(t.fThickness, S.gauges.length === 1 ? String(S.gauges[0]) : '',
      [{ v:'', t:t.all }].concat(gl.map(mm => ({ v:String(mm), t:mm + 'mm' }))),
      v => { S.gauges = v ? [Number(v)] : []; renderGauges(); renderSpecies(); buildFilters(); renderAll(); })
  ].forEach(n => box.appendChild(n));

  // O botao vai para a ancora FORA do rolamento (.filter-end). Dentro do #filters ele
  // sairia da tela junto com os seletores no telefone e o cliente perderia o caminho
  // para o armazem inteiro. Cai de volta no #filters se a ancora nao existir.
  const b = el('button', 'openfull',
    esc(t.fullInventory) + '<span class="n num">' + DATA.length + '</span>');
  b.onclick = () => openFull(true);
  const end = $('filterEnd');
  if(end){ end.innerHTML = ''; end.appendChild(b); } else { box.appendChild(b); }
}
// O overlay tem filtros proprios (estado S.full), independentes da selecao do quiz: ele existe
// justamente para ver o armazem inteiro sem desmontar a resposta da tela 03.
function buildFullFilters(){
  const box = $('fullFilters'); if(!box) return;
  const t = T();
  [...box.querySelectorAll('.sel')].forEach(n => n.remove());
  const before = box.firstChild;
  // O F=S.full e obrigatorio: sem ele as opcoes do overlay sairiam do estado do QUIZ e o
  // overlay deixaria de mostrar o armazem inteiro - que e a unica razao de ele existir.
  const F = S.full;
  const gl = [...new Set(base('Thickness', F).map(o => o.Thickness))].sort((a,b) => a - b);
  const vivasLogs = new Set(base('Logs', F).map(o => o.Logs));
  [
    ['Logs', t.fComposition, [{ v:'', t:t.all }].concat(speciesList().filter(c => vivasLogs.has(c)).map(c => ({ v:c, t:c })))],
    ['Portfolio', t.fPortfolio, optionsFor('Portfolio', true, F)],
    ['Certificate', t.fCertificate, optionsFor('Certificate', true, F)],
    ['Grade', t.fQuality, optionsFor('Grade', true, F)],
    ['Size', t.fDimension, optionsFor('Size', false, F)],
    ['Thickness', t.fThickness, [{ v:'', t:t.all }].concat(gl.map(mm => ({ v:String(mm), t:mm + 'mm' })))]
  ].forEach(([key, label, opts]) => {
    box.insertBefore(mkSelect(label, S.full[key], opts,
      v => { S.full[key] = v; buildFullFilters(); renderFull(); }), before);
  });
}

// ---------------------------------------------------------------- cards de SKU
function cardNode(it, withSug){
  const t = T(), out = it.Crates === 0, on = !!S.list[it.id];
  const n = el('div', 'sku' + (S.focus === it.id ? ' focus' : ''));
  n.dataset.p = it.Portfolio;
  n.id = (withSug ? 'sku-' : 'fsku-') + it.id;
  n.title = it.sku;

  n.innerHTML =
    '<span class="edge"></span><span class="ring"></span>' +
    '<div class="balloons">' +
      '<span class="bl pf"><span class="k">' + esc(t.fPortfolio) + '</span>' +
        '<span class="v">' + esc(it.Portfolio) + '</span></span>' +
      '<span class="bl"><span class="k">' + esc(t.fCertificate) + '</span>' +
        '<span class="v cert">' + esc(String(it.Certificate).toUpperCase()) + '</span></span>' +
      '<span class="bl"><span class="k">' + esc(t.fQuality) + '</span>' +
        '<span class="v">' + esc(it.Grade) + '</span></span>' +
      '<span class="bl logs"><span class="swatch" style="background-color:' + spec(it.Logs).tone + '"></span>' +
        '<span class="col"><span class="k">' + esc(t.fComposition) + '</span>' +
        '<span class="v">' + esc(it.Logs) + '</span></span></span>' +
    '</div>' +
    '<div class="dim num">' + esc(it.Size) + '<span>' + it.Thickness + 'mm · ' + it.Ply + ' ply</span></div>' +
    '<div class="avail num"><span class="c">' + (out ? esc(t.noCrates) : it.Crates + ' ' + esc(t.cratesLower)) + '</span>' +
      '<span class="vol">' + (out ? '' : m3(it.m3) + ' m³') + '</span></div>' +
    '<div class="price num">$ ' + it.Price + '<small>' + esc(t.priceUnit) + '</small></div>';

  if(out && withSug){
    const s = suggestFor(it);
    if(s){
      const b = el('button', 'sug',
        '<span class="l">' + esc(t.nextMatch) + '</span><span class="v">' +
        esc(s.Logs + ' ' + s.Thickness + 'mm ' + s.Grade + ' · ' + String(s.Certificate).toUpperCase() +
            ' · ' + s.Crates + ' ' + t.cratesLower) + ' →</span>');
      b.onclick = () => {
        S.focus = s.id; renderAll();
        const c = $('scroll'), target = $('sku-' + s.id);
        if(c && target) c.scrollTo({ top: c.scrollTop + target.getBoundingClientRect().top - 300, behavior:'smooth' });
        setTimeout(() => { S.focus = null; renderAll(); }, 2600);
      };
      n.appendChild(b);
    }
  }

  const add = el('button', 'add' + (on ? ' on' : ''),
    '<span class="dot"></span>' + esc(on ? t.onList : (out ? t.notifyMe : t.addToList)));
  add.onclick = () => {
    if(S.list[it.id]) delete S.list[it.id]; else S.list[it.id] = true;
    renderAll();
  };
  n.appendChild(add);
  return n;
}

// O site denuncia o proprio envelhecimento (24/08). O gerador aborta de proposito quando
// nao ha linha do mes corrente no saldo_estoque - erra para o lado seguro. So que a tarefa
// passa a falhar 5x/dia gravando no log, e o site fica congelado no ultimo dado bom sem
// avisar ninguem. A comparacao e feita AQUI, no navegador, contra o relogio de quem esta
// olhando: assim ela sobrevive a qualquer causa de parada - mes nao fechado, tarefa morta,
// maquina desligada, push falhando, Pages fora do ar. Um campo gravado pelo gerador so
// pegaria os casos em que o gerador ainda roda.
// Limite: 3 dias. A publicacao e seg-sex, entao sexta -> segunda da 3 e nao acusa; feriado
// na segunda da 4 e acusa - o que e verdade, nao falso positivo.
const STALE_DIAS = 3;
function staleDays(){
  if(!META.updated_at) return null;
  const p = String(META.updated_at).split('-');
  if(p.length !== 3) return null;
  const d = new Date(+p[0], +p[1] - 1, +p[2]);
  if(isNaN(d)) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.floor((hoje - d) / 86400000);
}
function paintStale(){
  const box = $('rUpdatedBox'), nota = $('rStale'); if(!box || !nota) return;
  const dias = staleDays(), velho = dias !== null && dias > STALE_DIAS;
  box.classList.toggle('stale', velho);
  nota.classList.toggle('hidden', !velho);
  if(velho) nota.textContent = T().staleNote(dias);
}

// ---------------------------------------------------------------- render
function renderAll(){
  const t = T(), items = filtered(), chips = chipList();

  $('heroCount').textContent = DATA.length + ' ' + t.skus + ' · ' + crateSum(DATA) + ' ' + t.cratesLower;
  $('matchNow').textContent = items.length;
  $('matchSub').textContent = t.skus + ' · ' + crateSum(items) + ' ' + t.cratesLower;
  $('seeStock').textContent = chips.length ? t.seeMine(items.length) : t.seeAll(DATA.length);

  $('stockTitle').textContent = chips.length ? t.stockTitleSel : t.stockTitleAll;
  $('stockSub').textContent = chips.length ? t.stockSubSel : t.stockSubAll(DATA.length);
  $('rMatches').textContent = items.length;
  $('rCrates').textContent = crateSum(items);
  $('rVolume').innerHTML = volSum(items);
  $('rUpdated').textContent = META.updated_at || '—';
  paintStale();
  // contador vivo da barra grudada - o unico numero que precisa acompanhar o dedo no filtro
  $('rLive').innerHTML = '<b>' + items.length + '</b> ' + esc(t.skus) +
    '<i>/</i><b>' + crateSum(items) + '</b> ' + esc(t.cratesLower) +
    '<span class="lc-vol"><i>/</i><b>' + volSum(items) + '</b></span>';

  renderChips(chips);

  const grid = $('results'); grid.innerHTML = '';
  items.forEach(it => grid.appendChild(cardNode(it, true)));
  grid.classList.toggle('list', S.view === 'list');
  $('empty').classList.toggle('hidden', !(DATA.length > 0 && items.length === 0));

  syncBarHeight();   // os chips mudaram a altura da barra; o scroll-padding tem de acompanhar

  const nList = Object.keys(S.list).length;
  $('listCount').textContent = nList;
  $('mailBtn').classList.toggle('hidden', nList === 0 || !EMAIL);
  $('waBtn').classList.toggle('hidden', nList === 0 || !WHATSAPP);

  if(S.fullOpen) renderFull();
}
function renderFull(){
  const items = fullFiltered(), grid = $('fullResults');
  $('fShowing').textContent = items.length;
  $('fCrates').textContent = crateSum(items);
  $('fVolume').innerHTML = volSum(items);
  grid.innerHTML = '';
  items.forEach(it => grid.appendChild(cardNode(it, false)));
  grid.classList.toggle('list', S.view === 'list');
}
function openFull(open){
  S.fullOpen = open;
  $('full').classList.toggle('hidden', !open);
  document.body.classList.toggle('locked', open);
  if(open){ buildFullFilters(); renderFull(); $('full').scrollTop = 0; }
}

// Grid/List e um estado so para as duas telas — o cliente escolhe a vista uma vez.
function buildViewSwitches(){
  document.querySelectorAll('.viewsw').forEach(box => {
    box.innerHTML = '';
    [['grid', T().grid], ['list', T().list]].forEach(([v, name]) => {
      const b = el('button', 'vw' + (S.view === v ? ' on' : ''), esc(name));
      b.onclick = () => { S.view = v; buildViewSwitches(); renderAll(); };
      box.appendChild(b);
    });
  });
}

// ---------------------------------------------------------------- lista de interesse
// O corpo sai separado do cabecalho porque o e-mail leva o cabecalho no ASSUNTO — repetir a
// mesma frase no assunto e na primeira linha do corpo e ruido. O WhatsApp junta os dois.
function listBody(){
  const t = T();
  const lines = DATA.filter(i => S.list[i.id]).map(i =>
    '• ' + i.sku + (i.Crates > 0
      ? ' — ' + i.Crates + ' ' + t.cratesLower + ' / ' + m3(i.m3) + ' m³'
      : ' — ' + t.msgNotify));
  return lines.join('\n') + '\n\n' + t.msgTail;
}
function listMessage(){ return T().msgHead + '\n\n' + listBody(); }

// ---------------------------------------------------------------- eventos
function wire(){
  document.querySelectorAll('[data-goto]').forEach(b =>
    b.onclick = () => goTo(Number(b.dataset.goto)));
  $('skipToStock').onclick = () => {
    S.portfolio = null; S.gauges = []; S.species = null;
    renderPortfolios(); renderGauges(); renderSpecies(); buildFilters(); renderAll();
    goTo(3);
  };
  $('clearGauge').onclick = () => { S.gauges = []; renderGauges(); buildFilters(); renderAll(); };
  $('clearSpecies').onclick = () => { S.species = null; renderSpecies(); buildFilters(); renderAll(); };
  $('emptyCta').onclick = resetFilters;
  $('closeFull').onclick = () => openFull(false);
  $('clearFull').onclick = () => {
    S.full = { Portfolio:'', Thickness:'', Logs:'', Certificate:'', Grade:'', Size:'' };
    buildFullFilters(); renderFull();
  };
  $('helpBtn').onclick   = () => openGuide(true);
  $('closeGuide').onclick = () => openGuide(false);
  $('closeGuide2').onclick = () => openGuide(false);
  // clique no fundo escuro fecha; clique dentro da caixa nao
  $('guide').onclick = e => { if(e.target === $('guide')) openGuide(false); };
  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    if(S.guideOpen) openGuide(false);      // a ajuda esta por cima: fecha ela primeiro
    else if(S.fullOpen) openFull(false);
  });
  // mailto: abre o cliente de e-mail do comprador ja preenchido. Sem servico terceiro.
  $('mailBtn').onclick = () => {
    if(!EMAIL) return;
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(T().msgHead) +
      '&body='    + encodeURIComponent(listBody());
  };
  // wa.me SEM numero abre o seletor de contato do proprio cliente — a lista nao chega em ninguem.
  // Por isso o botao so existe quando ha destino; ver CLAUDE.md §7i.
  $('waBtn').onclick = () => {
    if(!WHATSAPP) return;
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(listMessage()),
                '_blank', 'noopener');
  };
}
