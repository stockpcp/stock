/* Repinho Stock Finder — dicionario de UI.
   EN e o idioma primario; ES e PT-BR seguem. Copy identica a do handoff de 18/08.
   A copy dos 4 cards de portfolio NAO mora aqui: vem de content/portfolio-content.json,
   nos mesmos 3 idiomas. Nunca duplicar texto entre os dois. */

'use strict';

const LANGS = [{ code:'EN', key:'en', name:'English' },
               { code:'ES', key:'es', name:'Español' },
               { code:'PT', key:'pt', name:'Português (BR)' }];

const STR = {
  en: {
    rail: ['Intro','Portfolio','Specification','Your stock'],
    help:'Help', interestList:'Interest list', sendEmail:'Send · Email', sendWhatsApp:'Send · WhatsApp',
    heroOver:'Brazilian plywood · Available inventory, updated daily',
    // 25/08 — o hero seguia a mesma logica do passo 01: "the line you buy" pressupunha compra
    // em quem talvez tenha chegado so para olhar. Uma string por idioma, e era a ultima
    // ocorrencia de verbo de compra na copy (o passo 01 e o 02 sairam mais cedo hoje).
    heroLead:'Two steps between you and the volume available in the warehouse. Tell us the line you are looking for and the thickness you need — the warehouse answers on the last screen. Skip both and see everything available right now.',
    begin:'Begin selection →', showAll:'Show me everything →', scroll:'Scroll',
    skus:'SKUs', crates:'Crates', cratesLower:'crates', noCrates:'No crates staged',
    step01:'Step 01 — Portfolio · optional',
    // 25/08 — era "are you buying?". A ferramenta e nova: muita gente chega para olhar, para
    // entender como funciona ou por curiosidade, e "comprando" faz o passo 01 parecer que
    // avancar compromete. "Looking for" pergunta a mesma coisa sem pedir intencao de compra.
    s1title1:'Which line', s1title2:'are you looking for?',
    s1body:'Every Repinho panel is E1 low-formaldehyde and WBP-bonded with phenolic resin. What separates the portfolios is how the panel is built — and that is what decides the target application and which certifications it can carry. Pick one, or leave it open.',
    step02:'Step 02 — Specification · optional',
    s2title1:'Thickness', s2title2:'and composition.',
    // 25/08 — tres mudancas de uma vez. "you buy" saiu pelo mesmo motivo do titulo do passo 01
    // (nao pedir intencao de compra de quem chegou para olhar). "log mix behind the face" virou
    // "veneer mix": tora e a madeira bruta, lamina e o que forma a chapa — e "behind the face"
    // descrevia so o miolo, mas twin e / combi e se distinguem pela FACE. E a quarta frase
    // ("Leave a row untouched to keep it open") CAIU: o rotulo do passo ja diz "optional", cada
    // fileira tem seu botao a vista e o contador ao vivo ensina sozinho. Ela repetia em jargao
    // o que a tela mostra — o proprio Fabricio nao a entendeu, que e o teste de leitura falhando.
    s2body:'Pick the thickness you are looking for and, if it matters, the veneer mix in the panel. More eucalyptus means higher density; more pine means a lighter panel.',
    matchingNow:'Matching now', thickness:'Thickness', clear:'Clear', any:'Any',
    composition:'Composition', densityNote:'· density',
    thicknessRange:(a,b) => 'Thickness · ' + a + 'mm to ' + b + 'mm',
    seeMine:n => 'See my ' + n + ' SKUs →', seeAll:n => 'See all ' + n + ' SKUs →',
    step03:'Step 03 — Your result · last screen',
    stockTitleSel:'Your selection', stockTitleAll:'Everything available in the warehouse',
    stockSubSel:'These are the crates matching your answers. Remove a filter to widen it, or open the full inventory in its own screen.',
    stockSubAll:n => 'You have not narrowed anything, so this is the entire warehouse — ' + n + ' SKUs, sorted by FOB price.',
    matches:'Matches', volume:'Volume', updated:'Updated', grid:'Grid', list:'List',
    staleNote:d => 'no refresh for ' + d + ' days \u2014 ask us for live availability',
    clearAll:'Clear all',
    noSelectionNote:'No selection yet — this is the whole warehouse. Narrow it with the filters below, or go back to steps 01–02.',
    fullInventory:'Full inventory', fullOver:'Full inventory · separate screen',
    fullTitle:'Everything in the warehouse', showing:'Showing',
    backToResult:'Back to my result', clearFilters:'Clear filters',
    // 25/08 — a chave da folha de filtros do telefone (item 7). O numero entre parenteses
    // e posto pelo JS: "Filters (2)". Serve de rotulo do botao E de titulo da folha.
    filtersBtn:'Filters',
    fPortfolio:'Portfolio', fThickness:'Thickness', fComposition:'Composition',
    fCertificate:'Certificate', fQuality:'Grade', fDimension:'Dimension', all:'All',
    kGauge:'Thickness',
    priceUnit:' / m³ FOB', nextMatch:'Nearest substitute',
    addToList:'Add to list', onList:'On your list', notifyMe:'Notify me',
    emptyTitle:'Nothing in the warehouse for that combination',
    emptyBody:'Remove one of the filters above — the nearest logical substitute is usually one thickness away.',
    emptyCta:'Clear the selection',
    footNote:'Volumes reflect crates staged for export at Paranaguá and Itapoá. All panels are WBP phenolic, E1 emission class. Certification covers the thickness and sheet size shown. — End of the selection: the full inventory opens in its own screen.',
    msgHead:'Repinho Stock Finder — interest list', msgNotify:'notify when available',
    msgTail:'Please confirm availability and FOB pricing.'
  },

  es: {
    rail: ['Intro','Portafolio','Especificación','Su stock'],
    help:'Ayuda', interestList:'Lista de interés', sendEmail:'Enviar · Email', sendWhatsApp:'Enviar · WhatsApp',
    heroOver:'Contrachapado brasileño · Inventario disponible, actualizado a diario',
    heroLead:'Dos pasos entre usted y el volumen que hay en el almacén. Diga la línea que busca y el espesor que necesita — el almacén responde en la última pantalla. Omita ambos y vea todo lo disponible ahora.',
    begin:'Comenzar selección →', showAll:'Mostrar todo →', scroll:'Desplace',
    skus:'SKUs', crates:'Cajas', cratesLower:'cajas', noCrates:'Sin cajas disponibles',
    step01:'Paso 01 — Portafolio · opcional',
    s1title1:'¿Qué línea', s1title2:'está buscando?',
    s1body:'Cada panel Repinho es E1 de baja emisión y encolado WBP con resina fenólica. Lo que separa los portafolios es cómo se construye el panel — y eso define la aplicación y qué certificaciones puede llevar. Elija uno o déjelo abierto.',
    step02:'Paso 02 — Especificación · opcional',
    s2title1:'Espesor', s2title2:'y composición.',
    s2body:'Elija el espesor que busca y, si importa, la mezcla de láminas del panel. Más eucalipto significa mayor densidad; más pino, un panel más liviano.',
    matchingNow:'Coincidencias ahora', thickness:'Espesor', clear:'Limpiar', any:'Cualquiera',
    composition:'Composición', densityNote:'· densidad',
    thicknessRange:(a,b) => 'Espesor · ' + a + 'mm a ' + b + 'mm',
    seeMine:n => 'Ver mis ' + n + ' SKUs →', seeAll:n => 'Ver los ' + n + ' SKUs →',
    step03:'Paso 03 — Su resultado · última pantalla',
    stockTitleSel:'Su selección', stockTitleAll:'Todo lo que hay en el almacén',
    stockSubSel:'Estas son las cajas que coinciden con sus respuestas. Quite un filtro para ampliar, o abra el inventario completo en su propia pantalla.',
    stockSubAll:n => 'No ha filtrado nada, así que este es el almacén completo — ' + n + ' SKUs, ordenados por precio FOB.',
    matches:'Coincidencias', volume:'Volumen', updated:'Actualizado', grid:'Cuadrícula', list:'Lista',
    staleNote:d => 'sin actualizar hace ' + d + ' días \u2014 consulte la disponibilidad real',
    clearAll:'Limpiar todo',
    noSelectionNote:'Sin selección — este es el almacén completo. Refine con los filtros de abajo, o vuelva a los pasos 01–02.',
    fullInventory:'Inventario completo', fullOver:'Inventario completo · pantalla aparte',
    fullTitle:'Todo el inventario', showing:'Mostrando',
    backToResult:'Volver a mi resultado', clearFilters:'Limpiar filtros',
    filtersBtn:'Filtros',
    fPortfolio:'Portafolio', fThickness:'Espesor', fComposition:'Composición',
    fCertificate:'Certificado', fQuality:'Grado', fDimension:'Dimensión', all:'Todos',
    kGauge:'Espesor',
    priceUnit:' / m³ FOB', nextMatch:'Sustituto más cercano',
    addToList:'Agregar a la lista', onList:'En su lista', notifyMe:'Avísenme',
    emptyTitle:'No hay nada en el almacén para esa combinación',
    emptyBody:'Quite uno de los filtros de arriba — el sustituto más cercano suele estar a un espesor de distancia.',
    emptyCta:'Limpiar la selección',
    footNote:'Los volúmenes corresponden a cajas listas para exportación en Paranaguá e Itapoá. Todos los paneles son WBP fenólicos, clase de emisión E1. La certificación cubre el espesor y la medida indicados. — Fin de la selección: el inventario completo abre en su propia pantalla.',
    msgHead:'Repinho Stock Finder — lista de interés', msgNotify:'avisar cuando esté disponible',
    msgTail:'Por favor confirmar disponibilidad y precio FOB.'
  },

  pt: {
    rail: ['Intro','Portfólio','Especificação','Seu estoque'],
    help:'Ajuda', interestList:'Lista de interesse', sendEmail:'Enviar · E-mail', sendWhatsApp:'Enviar · WhatsApp',
    heroOver:'Compensado brasileiro · Estoque disponível, atualizado diariamente',
    heroLead:'Duas etapas entre você e o volume que está no armazém. Diga a linha que você procura e a espessura que precisa — o armazém responde na última tela. Pule as duas e veja tudo o que está disponível agora.',
    begin:'Começar seleção →', showAll:'Mostrar tudo →', scroll:'Role',
    skus:'SKUs', crates:'Caixas', cratesLower:'caixas', noCrates:'Sem caixas no armazém',
    step01:'Passo 01 — Portfólio · opcional',
    s1title1:'Qual linha', s1title2:'você procura?',
    s1body:'Todo painel Repinho é E1 de baixa emissão e colado WBP com resina fenólica. O que separa os portfólios é como o painel é construído — e é isso que define a aplicação e quais certificações ele pode carregar. Escolha um ou deixe aberto.',
    step02:'Passo 02 — Especificação · opcional',
    s2title1:'Espessura', s2title2:'e composição.',
    s2body:'Escolha a espessura que você procura e, se fizer diferença, a mistura de lâminas da chapa. Mais eucalipto significa maior densidade; mais pinus, painel mais leve.',
    matchingNow:'Correspondências agora', thickness:'Espessura', clear:'Limpar', any:'Qualquer',
    composition:'Composição', densityNote:'· densidade',
    thicknessRange:(a,b) => 'Espessura · ' + a + 'mm a ' + b + 'mm',
    seeMine:n => 'Ver meus ' + n + ' SKUs →', seeAll:n => 'Ver os ' + n + ' SKUs →',
    step03:'Passo 03 — Seu resultado · última tela',
    stockTitleSel:'Sua seleção', stockTitleAll:'Tudo o que está no armazém',
    stockSubSel:'Estas são as caixas que atendem às suas respostas. Remova um filtro para ampliar, ou abra o inventário completo em tela própria.',
    stockSubAll:n => 'Você não filtrou nada, então este é o armazém completo — ' + n + ' SKUs, ordenados por preço FOB.',
    matches:'Correspondências', volume:'Volume', updated:'Atualizado', grid:'Grade', list:'Lista',
    staleNote:d => 'sem atualizar há ' + d + ' dias \u2014 confirme a disponibilidade real',
    clearAll:'Limpar tudo',
    noSelectionNote:'Nenhuma seleção — este é o armazém completo. Refine nos filtros abaixo ou volte aos passos 01–02.',
    fullInventory:'Inventário completo', fullOver:'Inventário completo · tela separada',
    fullTitle:'Todo o estoque no armazém', showing:'Exibindo',
    backToResult:'Voltar ao meu resultado', clearFilters:'Limpar filtros',
    filtersBtn:'Filtros',
    fPortfolio:'Portfólio', fThickness:'Espessura', fComposition:'Composição',
    fCertificate:'Certificado', fQuality:'Qualidade', fDimension:'Dimensão', all:'Todos',
    kGauge:'Espessura',
    priceUnit:' / m³ FOB', nextMatch:'Substituto mais próximo',
    addToList:'Adicionar à lista', onList:'Na sua lista', notifyMe:'Avise-me',
    emptyTitle:'Nada no armazém para essa combinação',
    emptyBody:'Remova um dos filtros acima — o substituto mais próximo costuma estar a uma espessura de distância.',
    emptyCta:'Limpar a seleção',
    footNote:'Os volumes correspondem a caixas prontas para embarque em Paranaguá e Itapoá. Todos os painéis são WBP fenólicos, classe de emissão E1. A certificação cobre a espessura e a medida indicadas. — Fim da seleção: o inventário completo abre em tela própria.',
    msgHead:'Repinho Stock Finder — lista de interesse', msgNotify:'avisar quando disponível',
    msgTail:'Por favor confirmar disponibilidade e preço FOB.'
  }
};
