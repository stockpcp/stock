// KILL-SWITCH do Service Worker antigo — Stock Finder, 21/08/2026.
//
// Este arquivo NAO e um service worker de cache. Ele existe para MATAR o service
// worker que o site anterior registrou em 12/09/2025, das 16:37 as 17:30 (53 minutos,
// entre os commits df4bb9d e ac1073d). Quem carregou o site nessa janela tem, ate hoje,
// um SW vivo servindo /styles.css e /*.js do cache — e o Stock Finder usa os MESMOS
// nomes de arquivo, entao a pagina nova apareceria com o CSS velho.
//
// Por que apagar o sw.js nao resolvia: o navegador so descobre que um SW morreu quando
// consegue BAIXAR uma versao nova do script. Sem arquivo no lugar, o registro sobrevive.
// Com este arquivo, o navegador baixa, ve que mudou, instala, ativa, limpa os caches e
// se desregistra. Depois disso o registro deixa de existir e nada mais volta a busca-lo.
//
// ⚠️ NAO APAGAR. Precisa ficar publicado em /sw.js — a mesma URL de antes — por tempo
// indeterminado: enquanto existir um navegador que nunca mais abriu o site, existe um
// registro esperando por esta faxina.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.map(nome => caches.delete(nome)));
    await self.registration.unregister();
    // recarrega as abas abertas para que elas larguem o que ja tinham pego do cache
    const janelas = await self.clients.matchAll({ type: 'window' });
    janelas.forEach(janela => janela.navigate(janela.url));
  })());
});
