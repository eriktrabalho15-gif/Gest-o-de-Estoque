/* Resumo de leitura: nunca grava contagens, saldo ou alocações. */
function finalInventoryReport(inv){
 const reference=window.JTP_INVENTORY_REPORT_BALANCES?.[inv.unit+'|'+inv.date];
 const describe=sku=>window.jtpItemDescription?.(sku)||inv.lines.find(l=>String(l.sku)===sku)?.name||sku;
 const rows=inv.lines.filter(l=>!l.excludedFromCount&&!l.excluded_from_count).map(line=>{
  const sku=String(line.sku),quantity=finalQuantity(inv,line),balance=reference?(reference.items[sku]?.quantity??0):Number(line.balance),difference=quantity===null?null:Math.round((quantity-balance)*1e8)/1e8;
  return {sku,name:describe(sku),unit:reference?.items[sku]?.unit||line.measure||'—',address:(line.addresses||[]).join(' · ')||line.address||'—',balance,quantity,difference,status:quantity===null?'Pendente':difference===0?'Conforme':difference>0?'Sobra':'Falta'};
 });
 const snapshot=Array.isArray(inv._wmsSnapshot)?inv._wmsSnapshot:null;
 const mapped=new Set(snapshot?snapshot.filter(p=>p.sku).map(p=>String(p.sku)):inv.lines.filter(l=>l.addresses?.length||l.address).map(l=>String(l.sku)));
 const outside=reference&&snapshot?Object.entries(reference.items).filter(([sku,r])=>r.quantity!==0&&!mapped.has(sku)).map(([sku,r])=>({sku,name:describe(sku),balance:r.quantity,unit:r.unit||'—'})):null;
 const confirmed=rows.filter(r=>r.quantity!==null),divergent=confirmed.filter(r=>r.difference!==0),pending=rows.filter(r=>r.quantity===null);
 const people=new Map();
 const add=(id,name)=>{if(id||name)people.set(id||name,name||accessUsers.find(u=>u.id===id)?.name||id);};
 for(const a of inv.assignments||[])for(const id of a.members||[])add(id);
 for(const line of inv.lines)for(const c of line.counts||[])if(c)add(c.userId,c.by);
 const participants=[...people.values()].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 return {rows,confirmed,divergent,pending,outside,participants,matched:confirmed.length-divergent.length,reference,closure:inv.audit?.find(a=>a.action==='inventory_finished_with_pending')};
}
let finalReportView={id:null,tab:'divergent',page:1};
function showFinalInventoryReport(){
 if(page!==4||typeof canManageOfficial!=='function')return;
 const inv=inventories.find(i=>i.id===selectedInventory),detail=document.querySelector('.official-management-summary, .inventory-detail');
 if(!inv||inv.status!=='Concluído'||!canManageOfficial(inv.unit)||!detail||document.querySelector('.counting-screen'))return;
 if(finalReportView.id!==inv.id)finalReportView={id:inv.id,tab:'divergent',page:1};
 document.getElementById('final-inventory-report')?.remove();
 const r=finalInventoryReport(inv),view=finalReportView,selected=view.tab==='outside'?(r.outside||[]):view.tab==='pending'?r.pending:r.divergent,limit=25,pages=Math.max(1,Math.ceil(selected.length/limit));view.page=Math.min(view.page,pages);
 const number=n=>n===null?'—':Number(n).toLocaleString('pt-BR',{maximumFractionDigits:8});
 const section=document.createElement('section');section.id='final-inventory-report';section.className='panel final-inventory-report';
 section.innerHTML='<div class="final-report-print-card"><div class="panel-heading"><div><h2>Resumo final do inventário</h2><p>'+esc(inventoryDisplayName(inv))+' · '+esc(units.find(u=>u.id===inv.unit)?.name||inv.unit)+'</p></div><span class="badge">'+(r.pending.length?'Encerrado com pendências':'Concluído')+'</span></div><p class="source-note">'+(r.reference?'Comparação com '+esc(r.reference.file)+'. Ausência de código neste saldo equivale a saldo zero.':'Comparação com o saldo congelado na abertura.')+' Depósito '+esc(inv.unit)+'. '+(r.reference?.otherDepositRows?'Linhas dos demais depósitos do arquivo não integram esta comparação. ':'')+'Encerramento: '+esc(inv.finishedAt?new Date(inv.finishedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'—')+' · Responsável: '+esc(inv.finishedBy||'—')+'</p><div class="final-report-metrics">'+[['Itens apurados',r.confirmed.length],['Conformes',r.matched],['Com divergência',r.divergent.length],['Pendentes',r.pending.length],['Com saldo fora do WMS',r.outside?.length??'—']].map(([label,value])=>'<div><span>'+label+'</span><strong>'+value+'</strong></div>').join('')+'</div>'+(r.closure?'<p class="source-note">Motivo do encerramento: '+esc(r.closure.after?.reason||'—')+'</p>':'')+'<div class="final-report-people"><span>Equipe participante</span><p>'+esc(r.participants.join(' · ')||'Participantes não informados')+'</p></div></div><p class="source-note">Pendências não são faltas de estoque. Itens fora do WMS não foram inventariados. Quantidades são apresentadas na unidade do sistema.</p><div class="actions final-report-tabs">'+[['divergent','Divergências'],['pending','Itens pendentes'],['outside','Saldo fora do WMS']].map(([key,label])=>'<button type="button" class="'+(view.tab===key?'primary':'secondary')+'" data-report-tab="'+key+'">'+label+'</button>').join('')+'</div>'+(view.tab==='outside'&&r.outside===null?'<p class="source-note">Não há saldo atualizado e mapa WMS do inventário disponíveis para identificar itens fora do WMS com segurança.</p>':table(view.tab==='outside'?['Código','Descrição','Unidade','Saldo não inventariado']:['Código','Descrição','WMS','Unidade','Saldo de referência','Apurado','Diferença','Situação'],selected.slice((view.page-1)*limit,view.page*limit).map(row=>'<tr><td>'+esc(row.sku)+'</td><td>'+esc(row.name)+'</td>'+(view.tab==='outside'?'<td>'+esc(row.unit)+'</td><td>'+number(row.balance)+'</td>':'<td>'+esc(row.address)+'</td><td>'+esc(row.unit)+'</td><td>'+number(row.balance)+'</td><td>'+number(row.quantity)+'</td><td>'+number(row.difference)+'</td><td>'+esc(row.status)+'</td>')+'</tr>')))+(selected.length===0?'<p class="source-note">Nenhum item nesta categoria.</p>':'')+'<div class="actions"><button type="button" class="secondary" id="report-prev" '+(view.page===1?'disabled':'')+'>Anterior</button><span>'+view.page+' / '+pages+' · '+selected.length+' itens</span><button type="button" class="secondary" id="report-next" '+(view.page===pages?'disabled':'')+'>Próxima</button></div>';
 detail.before(section);
 section.querySelectorAll('[data-report-tab]').forEach(button=>button.onclick=()=>{view.tab=button.dataset.reportTab;view.page=1;showFinalInventoryReport();});
 section.querySelector('#report-prev').onclick=()=>{view.page--;showFinalInventoryReport();};section.querySelector('#report-next').onclick=()=>{view.page++;showFinalInventoryReport();};
}
const renderBeforeFinalReport=render;
render=function(){renderBeforeFinalReport.apply(this,arguments);showFinalInventoryReport();};
showFinalInventoryReport();
