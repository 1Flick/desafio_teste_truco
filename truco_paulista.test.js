/**
 * ESPECIFICAÇÃO EXECUTÁVEL — TRUCO PAULISTA, QUATRO JOGADORES EM DUAS DUPLAS
 * Origem: github.com/JoaoChoma/teste_software_2026/blob/main/desafios.md
 * Exigido: programa e testes em JavaScript; truco paulista de 02 duplas.
 * Colaboradores: Pedro Lucas Gomes Braido (24190443-2);
 * Leonardo Fratoni Borges da Silva (24047610-2).
 *
 * Node.js >= 24. Crie truco_paulista.js, ESM, ao lado deste arquivo.
 * Execute: node --test truco_paulista.test.js
 * Opcional: MODULO_TRUCO_PAULISTA = caminho de outra implementação.
 *
 * API EXATA:
 * baralho():Array<{valor:string,naipe:string}>;
 * forca(carta,vira):number; vencedorVaza([{jogador,carta},...4],vira):0..3|null;
 * vencedorMao([equipe|null,...até3],equipeMao=0):0|1|undefined.
 * class Truco: iniciar({cartas=baralho(),mao=maoAtual}), jogar(jogador,indice),
 * pedir(jogador):novoValor, responder(jogador,aceitar:boolean), correr(jogador).
 * Estado público: pontos=[0,0],vencedor=null,ativa=false,mao=0 no início;
 * após iniciar: maos[4][3],vira,turno,mesa=[],vazas=[],valor,pendente=null,
 * ultimaSolicitante=null,especial:boolean. Snapshots de pontos são usados nas
 * fixtures para testar fronteiras de 11/12 sem jogar dezenas de mãos redundantes.
 *
 * REGRAS E DECISÕES DE VARIANTE, EXPLICITADAS PARA A IMPLEMENTAÇÃO:
 * - Jogadores 0,1,2,3 em sentido crescente; dupla 0 = jogadores 0/2; dupla 1 = 1/3.
 * - Baralho LIMPO de 40 cartas: 4,5,6,7,Q,J,K,A,2,3 × ouros,espadas,copas,paus.
 * - Forças normais são índices 0..9 nessa ordem. A manilha é a sucessora do
 *   valor do vira (3 volta a 4), com forças 10=ouros,11=espadas,12=copas,13=paus.
 *   Naipe não desempata carta normal. Nenhuma manilha pode perder para normal.
 * - baralho() retorna ordem valor→naipe documentada e novas cartas a cada chamada.
 *   iniciar recebe ordem já embaralhada por quem chama: primeiras três cartas
 *   para J0, próximas três J1, depois J2/J3; 13ª é vira. Exige pelo menos 13
 *   cartas físicas válidas e distintas nas posições utilizadas; sobras ignoradas.
 *   Não se exige RNG, modo online, cartas cobertas ou simulação de sinais.
 * - O jogador de mão abre a primeira vaza. Cada jogador joga uma carta da mão
 *   ATUAL por vez; carta sai da mão e entra na mesa. Não há obrigação de seguir naipe.
 * - Maior carta vence a vaza. Empate máximo entre DUPLAS = null; máximos empatados
 *   apenas entre parceiros vencem juntos, e o primeiro deles que jogou abre a próxima.
 * - Vencedor abre próxima vaza. Empate mantém quem abriu aquela vaza.
 * - Duas vazas ganhas encerram a mão. Primeira empatada: quem ganha a segunda
 *   vence; segunda empatada: quem ganhou a primeira vence. Uma vaza de cada dupla:
 *   a terceira decide, e empate nela favorece quem ganhou a primeira. Três empates
 *   favorecem a DUPLA DO JOGADOR DE MÃO, não necessariamente dupla 0.
 * - vencedorMao retorna undefined enquanto não há decisão (não null). Vaza null
 *   significa empate, equipe 0 é vitória válida e NÃO pode ser tratada como falsy.
 * - Mão normal vale 1. Pedidos aceitos sobem estritamente 1→3→6→9→12.
 *   Só o jogador da vez pede e o pedido não consome sua carta/turno. A mesma dupla
 *   não pede aumentos consecutivos aceitos. Não se permite pular níveis.
 * - Pedido pendente suspende jogadas e novos pedidos. Qualquer jogador adversário
 *   pode responder (incluindo parceiro fora da ordem de cartas); só boolean aceita.
 *   Recusa encerra e concede à solicitante o VALOR ANTERIOR. Aceite mantém o turno.
 * - correr pode ser declarado por qualquer integrante de uma dupla enquanto a
 *   mão está ativa e sem pedido pendente; dá o valor atual à outra dupla.
 * - Somente a dupla vencedora pontua. Chegar a PELO MENOS 12 encerra a partida.
 *   Não há empate geral, pontos negativos, exigência de fechar exatamente 12 ou
 *   reinício automático. Jogador de mão avança (mao+1)%4 ao terminar cada mão.
 * - VARIANTE SIMPLIFICADA DE MÃO DE ONZE: se só uma dupla tem 11, a mão automática
 *   vale 3; se ambas têm 11, vale 1. Aumento é proibido nas duas situações.
 *   Não há consulta/recusa especial, visão do parceiro nem restrição visual de mão
 *   de ferro; correr concede o valor atual. Essas escolhas NÃO constavam no enunciado.
 * - Ações inválidas e ações depois de fim lançam Error, sem mudar o estado.
 *   O texto do erro não é contrato. Helpers de vaza recebem quatro cartas distintas
 *   de uma vaza válida; a validação de jogadores e cartas inválidas também é testada.
 * - Esta suíte especifica o motor, não uma aparência ou um framework de navegador.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { baralho,forca,vencedorVaza,vencedorMao,Truco } = await import(process.env.MODULO_TRUCO_PAULISTA
  ? pathToFileURL(resolve(process.env.MODULO_TRUCO_PAULISTA)).href
  : new URL('./truco_paulista.js',import.meta.url).href);
const VALORES=['4','5','6','7','Q','J','K','A','2','3'];
const NAIPES=['ouros','espadas','copas','paus'];
// Tabela explícita de sucessão: oráculo independente de como o programa a calcula.
const SUCESSORA={'4':'5','5':'6','6':'7','7':'Q',Q:'J',J:'K',K:'A',A:'2','2':'3','3':'4'};
const c=(valor,naipe='ouros')=>({valor,naipe});
const DECK=VALORES.flatMap(valor=>NAIPES.map(naipe=>c(valor,naipe)));
const key=card=>`${card.valor}/${card.naipe}`;
function esperadoForca(card,vira){return card.valor===SUCESSORA[vira.valor]?10+NAIPES.indexOf(card.naipe):VALORES.indexOf(card.valor);}
function foto(j){return structuredClone(Object.fromEntries(Object.entries(j)));}
function rejeita(j,acao){const antes=foto(j);assert.throws(acao,Error);assert.deepEqual(foto(j),antes);}
const novo=(opcoes={})=>{const j=new Truco();j.iniciar(opcoes);return j;};
function embaralhar(seed){let n=seed>>>0;const d=DECK.map(card=>({...card}));for(let i=d.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const k=n%(i+1);[d[i],d[k]]=[d[k],d[i]];}return d;}
function vaza(cartas,ordem=[0,1,2,3]){return cartas.map((carta,i)=>({jogador:ordem[i],carta}));}
function cartasOrdenadas(maos,vira){const d=maos.flat().map(card=>({...card}));d.push({...vira});assert.equal(new Set(d.map(key)).size,13,'fixture deve conter 13 cartas físicas distintas');return d;}

test('exporta a API exigida',()=>{for(const fn of [baralho,forca,vencedorVaza,vencedorMao,Truco])assert.equal(typeof fn,'function');});
test('baralho tem as 40 cartas exatas, na ordem valor→naipe, sem 8,9 ou 10',()=>{const d=baralho();assert.deepEqual(d,DECK);assert.equal(new Set(d.map(key)).size,40);});
test('baralho não compartilha cartas entre chamadas',()=>{const a=baralho(),b=baralho();a[0].valor='X';assert.deepEqual(b,DECK);});
for(const viraValor of VALORES) test(`forças de todas as 40 cartas e suas 1600 comparações com vira ${viraValor}`,()=>{
  const vira=c(viraValor,'copas');for(const a of DECK)assert.equal(forca(a,vira),esperadoForca(a,vira),key(a));
  for(const a of DECK)for(const b of DECK)assert.equal(Math.sign(forca(a,vira)-forca(b,vira)),Math.sign(esperadoForca(a,vira)-esperadoForca(b,vira)),`${key(a)} vs ${key(b)}`);
});
test('naipe do vira não altera a manilha; carta normal empatada não usa naipe',()=>{
  for(const valor of VALORES)for(const naipe of NAIPES)for(const carta of DECK)assert.equal(forca(carta,c(valor,naipe)),forca(carta,c(valor,'ouros')));
  assert.equal(forca(c('3','ouros'),c('Q')),forca(c('3','paus'),c('Q')));
});
test('cálculo de força não altera a carta nem o vira',()=>{const a=Object.freeze(c('5','paus')),v=Object.freeze(c('4','copas'));assert.equal(forca(a,v),13);});
for(const carta of [null,{},c('8'),c('9'),c('10'),c('a'),c(3),c('4','inexistente')]) test(`carta ou vira inválido ${JSON.stringify(carta)} é rejeitado`,()=>{
  assert.throws(()=>forca(carta,c('4')),Error);assert.throws(()=>forca(c('4'),carta),Error);
});
test('manilha de paus supera todas as outras, independente de quem joga',()=>{
  const cartas=[c('5','ouros'),c('5','espadas'),c('5','copas'),c('5','paus')];assert.equal(vencedorVaza(vaza(cartas),c('4')),3);
});
for(const vencedor of [0,1,2,3]) test(`carta normal máxima única pode dar vitória ao jogador ${vencedor}`,()=>{
  const cartas=[c('4'),c('5'),c('6'),c('7')];cartas[vencedor]=c('3','copas');assert.equal(vencedorVaza(vaza(cartas),c('Q')),vencedor);
});
test('empate de maior força entre adversários empata a vaza, mesmo com naipes diferentes',()=>{
  assert.equal(vencedorVaza(vaza([c('3'),c('3','paus'),c('2'),c('A')]),c('Q')),null);
});
test('empates de cartas fracas não anulam uma maior isolada',()=>{
  assert.equal(vencedorVaza(vaza([c('2'),c('2','paus'),c('3'),c('A')]),c('Q')),2);
});
test('parceiros empatados vencem e o primeiro que jogou é o líder, não o menor índice',()=>{
  assert.equal(vencedorVaza(vaza([c('3'),c('A'),c('3','paus'),c('2')],[2,3,0,1]),c('Q')),2);
});
test('quatro cartas normais de mesma força empatam a vaza',()=>{assert.equal(vencedorVaza(vaza(NAIPES.map(n=>c('3',n))),c('Q')),null);});
for(const invalido of [[],vaza(DECK.slice(0,3)),vaza(DECK.slice(0,4),[0,0,2,3]),vaza(DECK.slice(0,4),[-1,1,2,3]),vaza(DECK.slice(0,4),[0,1,2,4]),vaza(DECK.slice(0,4),['0',1,2,3])]) test(`vaza inválida ${JSON.stringify(invalido)} é rejeitada`,()=>assert.throws(()=>vencedorVaza(invalido,c('Q')),Error));
const DECISOES=[
  [[],undefined],[ [0],undefined ],[ [1],undefined ],[ [null],undefined ],
  [[0,0],0],[[1,1],1],[[0,null],0],[[1,null],1],[[null,0],0],[[null,1],1],
  [[0,1],undefined],[[1,0],undefined],[[null,null],undefined],
  [[0,1,0],0],[[0,1,1],1],[[0,1,null],0],[[1,0,0],0],[[1,0,1],1],[[1,0,null],1],
  [[null,null,0],0],[[null,null,1],1]
];
for(const [resultados,esperado] of DECISOES) test(`mão ${JSON.stringify(resultados)} resulta ${String(esperado)}`,()=>{
  const entrada=[...resultados];assert.equal(vencedorMao(entrada),esperado);assert.deepEqual(entrada,resultados);
});
for(const mao of [0,1]) test(`três empates favorecem equipe de mão ${mao}`,()=>assert.equal(vencedorMao([null,null,null],mao),mao));
for(const mao of [-1,2,'0',null]) test(`equipe de mão inválida ${String(mao)} é rejeitada pelo avaliador`,()=>assert.throws(()=>vencedorMao([null,null,null],mao),Error));
for(const resultados of [[2],[-1],['0'],[0,1,0,1],null]) test(`resultados inválidos de mão ${JSON.stringify(resultados)} são rejeitados`,()=>assert.throws(()=>vencedorMao(resultados),Error));
test('partida começa zerada e ainda sem mão ativa',()=>{const j=new Truco();assert.deepEqual(j.pontos,[0,0]);assert.equal(j.vencedor,null);assert.equal(j.ativa,false);assert.equal(j.mao,0);});
test('sem iniciar mão, jogar/pedir/responder/correr são erros sem efeito',()=>{const j=new Truco();for(const acao of [()=>j.jogar(0,0),()=>j.pedir(0),()=>j.responder(1,true),()=>j.correr(1)])rejeita(j,acao);});
for(const mao of [0,1,2,3]) test(`distribuição de 3 cartas por jogador, vira na 13ª posição, abertura por ${mao}`,()=>{
  const cartas=embaralhar(11),antes=structuredClone(cartas),j=novo({cartas,mao});
  assert.deepEqual(j.maos,[cartas.slice(0,3),cartas.slice(3,6),cartas.slice(6,9),cartas.slice(9,12)]);assert.deepEqual(j.vira,cartas[12]);assert.equal(j.turno,mao);assert.equal(j.mao,mao);assert.equal(j.valor,1);assert.equal(j.pendente,null);assert.deepEqual(j.mesa,[]);assert.deepEqual(j.vazas,[]);assert.equal(j.ativa,true);assert.deepEqual(cartas,antes);
  cartas[0].valor='X';assert.notEqual(j.maos[0][0].valor,'X');j.vira.valor='X';assert.notEqual(cartas[12].valor,'X');
});
test('treze cartas são suficientes; sobras não participam da mão',()=>{const j=novo({cartas:DECK.slice(0,13)});assert.equal(j.maos.flat().length,12);});
for(const cartas of [[],DECK.slice(0,12),[DECK[0],...DECK.slice(0,12)],[c('8'),...DECK.slice(1,13)]]) test(`distribuição inválida de ${cartas.length} posições é rejeitada sem ativar a mão`,()=>{
  const j=new Truco();rejeita(j,()=>j.iniciar({cartas}));assert.equal(j.ativa,false);
});
for(const mao of [-1,4,0.5,'0',null]) test(`jogador de mão inválido ${String(mao)}`,()=>{const j=new Truco();rejeita(j,()=>j.iniciar({mao}));});
test('não se pode redistribuir enquanto uma mão está ativa',()=>{const j=novo();rejeita(j,()=>j.iniciar());});
test('jogada remove uma carta, registra jogador e carta e avança um turno',()=>{
  const j=novo(),esperada=structuredClone(j.maos[0][1]);j.jogar(0,1);assert.equal(j.maos[0].length,2);assert.deepEqual(j.mesa,[{jogador:0,carta:esperada}]);assert.equal(j.turno,1);assert.equal(j.ativa,true);assert.deepEqual(j.pontos,[0,0]);
});
for(const jogador of [-1,1,4,'0',null,0.5]) test(`jogada do jogador inválido/fora da vez ${String(jogador)} não muda o estado`,()=>{const j=novo();rejeita(j,()=>j.jogar(jogador,0));});
for(const indice of [-1,3,0.5,'0',null,NaN]) test(`índice de carta ${String(indice)} é inválido`,()=>{const j=novo();rejeita(j,()=>j.jogar(0,indice));});
test('a ordem dos turnos dá a volta de 3 para 0',()=>{const j=novo({mao:3});j.jogar(3,0);assert.equal(j.turno,0);j.jogar(0,0);assert.equal(j.turno,1);});
test('quem ganha uma vaza abre a seguinte; mesa é limpa e vaza registra a equipe',()=>{
  const maos=[[c('4'),c('6'),c('Q')],[c('3'),c('7'),c('J')],[c('5'),c('K'),c('A')],[c('2'),c('4','paus'),c('5','paus')]],j=novo({cartas:cartasOrdenadas(maos,c('Q','copas'))});
  for(const p of [0,1,2,3])j.jogar(p,0);assert.deepEqual(j.vazas,[1]);assert.deepEqual(j.mesa,[]);assert.equal(j.turno,1);assert.equal(j.ativa,true);
});
test('vaza empatada mantém seu líder, inclusive se ele não é jogador 0',()=>{
  const maos=[[c('3'),c('6'),c('Q')],[c('4'),c('7'),c('J')],[c('5'),c('K'),c('A')],[c('3','paus'),c('4','paus'),c('5','paus')]],j=novo({mao:3,cartas:cartasOrdenadas(maos,c('Q','copas'))});
  for(const p of [3,0,1,2])j.jogar(p,0);assert.deepEqual(j.vazas,[null]);assert.equal(j.turno,3);
});
test('pedido de truco vale 3, não consome carta/turno e bloqueia jogo até resposta',()=>{
  const j=novo(),maos=structuredClone(j.maos);assert.equal(j.pedir(0),3);assert.deepEqual(j.pendente,{equipe:0,valor:3});assert.equal(j.valor,1);assert.equal(j.turno,0);assert.deepEqual(j.maos,maos);rejeita(j,()=>j.jogar(0,0));rejeita(j,()=>j.pedir(0));rejeita(j,()=>j.correr(1));
});
test('aceitar pedido atualiza valor, não pontos; mantém vez de quem pediu',()=>{
  const j=novo();j.pedir(0);j.responder(3,true);assert.equal(j.valor,3);assert.equal(j.pendente,null);assert.equal(j.ultimaSolicitante,0);assert.equal(j.turno,0);assert.deepEqual(j.pontos,[0,0]);assert.equal(j.ativa,true);rejeita(j,()=>j.pedir(0));
});
test('pedido só pode ser feito por quem tem a vez, inclusive parceiro não pode pedir fora da ordem',()=>{const j=novo();for(const p of [1,2,3,-1,4])rejeita(j,()=>j.pedir(p));});
test('só adversário pode responder; resposta precisa ser boolean e pedido precisa existir',()=>{
  const j=novo();rejeita(j,()=>j.responder(1,true));j.pedir(0);for(const p of [0,2,-1,4,'1'])rejeita(j,()=>j.responder(p,true));for(const v of [0,1,'sim',null,undefined])rejeita(j,()=>j.responder(1,v));
});
for(const recusarNo of [3,6,9,12]) test(`recusar ${recusarNo} concede valor anterior à solicitante, não o pedido`,()=>{
  const j=novo(),niveis=[1,3,6,9,12];
  for(let i=1;i<=niveis.indexOf(recusarNo);i++) {
    const p=j.turno,equipe=p%2,anterior=j.valor;j.pedir(p);
    if(niveis[i]===recusarNo){j.responder(1-equipe,false);assert.equal(j.ativa,false);assert.equal(j.pontos[equipe],anterior);assert.equal(j.pontos[1-equipe],0);assert.equal(j.pendente,null);}
    else {j.responder(1-equipe,true);j.jogar(p,0);}
  }
});
test('escalada aceita só 3→6→9→12 alternando equipes, sem permitir acima de 12',()=>{
  const j=novo();for(const valor of [3,6,9,12]){const p=j.turno;assert.equal(j.pedir(p),valor);j.responder(1-p%2,true);assert.equal(j.valor,valor);j.jogar(p,0);}rejeita(j,()=>j.pedir(j.turno));
});
for(const jogador of [0,1,2,3]) test(`correr pelo jogador ${jogador} concede valor atual à outra equipe`,()=>{
  const j=novo();j.correr(jogador);assert.equal(j.ativa,false);assert.equal(j.pontos[1-jogador%2],1);assert.equal(j.pontos[jogador%2],0);assert.equal(j.mao,1);
});
for(const jogador of [-1,4,'0',null,NaN]) test(`desistência de jogador inválido ${String(jogador)} é rejeitada`,()=>{const j=novo();rejeita(j,()=>j.correr(jogador));});
test('correr após truco aceito concede três, não um',()=>{const j=novo();j.pedir(0);j.responder(1,true);j.correr(2);assert.deepEqual(j.pontos,[0,3]);});
for(const pontos of [[11,0],[0,11],[11,8],[8,11]]) test(`mão de onze ${pontos.join('x')} vale três e bloqueia aumento`,()=>{
  const j=new Truco();j.pontos=[...pontos];j.iniciar();assert.equal(j.especial,true);assert.equal(j.valor,3);rejeita(j,()=>j.pedir(j.turno));
});
test('ambas equipes com onze: mão vale um, sem aumento',()=>{const j=new Truco();j.pontos=[11,11];j.iniciar();assert.equal(j.valor,1);assert.equal(j.especial,true);rejeita(j,()=>j.pedir(0));});
test('dez não é onze: mão comum continua valendo um e aceita truco',()=>{const j=new Truco();j.pontos=[10,10];j.iniciar();assert.equal(j.valor,1);assert.equal(j.especial,false);assert.equal(j.pedir(j.turno),3);});
for(const equipe of [0,1]) test(`pontuação pode ultrapassar 12 e encerra para equipe ${equipe}`,()=>{
  const j=new Truco();j.pontos=equipe===0?[11,0]:[0,11];j.iniciar();j.correr(1-equipe);assert.equal(j.pontos[equipe],14);assert.equal(j.vencedor,equipe);assert.equal(j.ativa,false);rejeita(j,()=>j.iniciar());
});
test('terminar mão ativa limpa pedido e próxima mão reinicia valor, mesa e vazas',()=>{
  const j=novo();j.pedir(0);j.responder(1,true);j.correr(0);const placar=[...j.pontos];j.iniciar();assert.equal(j.mao,1);assert.equal(j.turno,1);assert.equal(j.valor,1);assert.equal(j.pendente,null);assert.equal(j.ultimaSolicitante,null);assert.deepEqual(j.mesa,[]);assert.deepEqual(j.vazas,[]);assert.deepEqual(j.pontos,placar);
});
test('jogador de mão alterna pelos quatro lugares e volta a zero',()=>{const j=new Truco();for(let i=0;i<4;i++){j.iniciar();assert.equal(j.mao,i);j.correr(i);}assert.equal(j.mao,0);});
test('mão encerrada não aceita cartas, pedidos, respostas ou novas desistências',()=>{
  const j=novo();j.correr(1);for(const acao of [()=>j.jogar(0,0),()=>j.pedir(0),()=>j.responder(1,true),()=>j.correr(1)])rejeita(j,acao);
});
for(const seed of [1,7,42,2026]) test(`mão completa semente ${seed}: usa só cartas distribuídas, no máximo três vazas e pontua uma equipe`,()=>{
  const mao=seed%4,j=novo({cartas:embaralhar(seed),mao}),distribuidas=new Set(j.maos.flat().map(key));let jogadas=0;const utilizadas=new Set(),vazasEsperadas=[];
  while(j.ativa&&jogadas++<12){
    const p=j.turno,carta=j.maos[p][0],mesa=[...j.mesa,{jogador:p,carta}],lider=mesa[0].jogador;
    assert.ok(distribuidas.has(key(carta)));assert.equal(utilizadas.has(key(carta)),false);utilizadas.add(key(carta));j.jogar(p,0);
    assert.equal(j.maos.flat().length,12-utilizadas.size);assert.equal(new Set(j.maos.flat().map(key)).size,j.maos.flat().length);
    if(mesa.length===4){
      const maior=Math.max(...mesa.map(v=>esperadoForca(v.carta,j.vira))),tops=mesa.filter(v=>esperadoForca(v.carta,j.vira)===maior);
      const vencedor=new Set(tops.map(v=>v.jogador%2)).size===1?tops[0].jogador:null;
      vazasEsperadas.push(vencedor===null?null:vencedor%2);assert.deepEqual(j.vazas,vazasEsperadas);
      const decisao=DECISOES.find(([entrada])=>JSON.stringify(entrada)===JSON.stringify(vazasEsperadas));
      const equipe=vazasEsperadas.length===3&&vazasEsperadas.every(v=>v===null)?mao%2:decisao?.[1];
      if(equipe===undefined){assert.equal(j.ativa,true);assert.equal(j.turno,vencedor===null?lider:vencedor);}
      else{assert.equal(j.ativa,false);assert.equal(j.pontos[equipe],1);assert.equal(j.pontos[1-equipe],0);}
    }
  }
  assert.equal(j.ativa,false);assert.ok(j.vazas.length>=2&&j.vazas.length<=3);assert.ok(utilizadas.size===8||utilizadas.size===12);assert.equal(j.pontos.reduce((a,b)=>a+b,0),1);assert.equal(j.vencedor,null);
});
test('partida inteira fecha 12 com quatro mãos de três, sem empate nem reset de pontuação',()=>{
  const j=new Truco();let maos=0;while(j.vencedor===null&&maos++<4){j.iniciar();const equipe=j.turno%2;j.pedir(j.turno);j.responder(1-equipe,true);j.correr(1);assert.equal(j.pontos[0],3*maos);assert.equal(j.pontos[1],0);}assert.equal(j.vencedor,0);assert.equal(j.pontos[0],12);assert.equal(j.ativa,false);
});
test('duas partidas não compartilham pontos, cartas ou turnos',()=>{const a=novo(),b=novo();a.correr(0);assert.deepEqual(b.pontos,[0,0]);assert.equal(b.ativa,true);assert.equal(b.maos.flat().length,12);});
