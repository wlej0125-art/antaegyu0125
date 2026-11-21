// Added only: investment comparison and forward/backward linkages.
// All coefficient data are calculated in model.py using the professor's validated matrices.
(()=>{
let ext=null, chosen=[],amounts=[1000,1000,1000],metric='production',linkIndex=0,linkAmount=1000;
const el=id=>document.getElementById(id);
const num=x=>Number(x).toLocaleString('ko-KR',{maximumFractionDigits:2});
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const metricName={production:'생산유발액',valueAdded:'부가가치유발액',imports:'수입유발액'};
const total=(j,key)=>ext.sectors[j][key]*amounts[chosen.indexOf(j)];
function options(){return ext.sectors.map((s,i)=>`<option value="${i}">${esc(s.code+' · '+s.name)}</option>`).join('');}
function drawBars(id,items,maxCount=12){const parent=el(id);const rows=items.slice(0,maxCount);const max=Math.max(1e-10,...rows.map(x=>Math.abs(x.value)));parent.innerHTML=rows.map(x=>`<div class="ext-chart"><div class="ext-label"><span title="${esc(x.name)}">${esc(x.name)}</span><b>${num(x.value)} ${x.unit||''}</b></div><div class="ext-track"><div class="ext-fill" style="width:${Math.min(100,Math.abs(x.value)/max*100)}%"></div></div></div>`).join('');}
function initControls(){const opts=options();el('ext-controls').innerHTML=chosen.map((j,i)=>`<div class="ext-row"><div><label for="ext-ind-${i}">비교 산업 ${i+1}</label><select id="ext-ind-${i}">${opts}</select></div><div><label for="ext-range-${i}">최종수요 증가액 (억원)</label><div class="ext-amount"><input id="ext-range-${i}" type="range" min="0" max="10000" step="50" value="${amounts[i]}"><strong id="ext-label-${i}">${num(amounts[i])} 억원</strong></div></div></div>`).join('');
chosen.forEach((j,i)=>{el('ext-ind-'+i).value=j;el('ext-ind-'+i).onchange=e=>{chosen[i]=+e.target.value;renderComparison();renderLink();};el('ext-range-'+i).oninput=e=>{amounts[i]=+e.target.value;el('ext-label-'+i).textContent=num(amounts[i])+' 억원';renderComparison();if(chosen.includes(linkIndex))renderLink();};});
el('link-industry').innerHTML=opts;el('link-industry').disabled=false;el('link-industry').value=linkIndex;el('link-industry').onchange=e=>{linkIndex=+e.target.value;renderLink();};el('link-amount').disabled=false;el('link-amount').oninput=e=>{linkAmount=+e.target.value;renderLink();};
el('ext-modes').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{metric=btn.dataset.metric;el('ext-modes').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));renderComparison();});}
function renderComparison(){const rows=chosen.map((j,i)=>({...ext.sectors[j],amount:amounts[i],value:amounts[i]*ext.sectors[j][metric],unit:'억원'}));drawBars('ext-chart',rows,3);el('ext-table').innerHTML=chosen.map((j,i)=>{const s=ext.sectors[j];return `<tr><td>${esc(s.name)}</td><td>${num(amounts[i])}</td><td>${num(s.production)}</td><td>${num(s.valueAdded)}</td><td>${num(s.imports)}</td></tr>`;}).join('');}
function renderLink(){const s=ext.sectors[linkIndex], n=ext.sectors.length;
const shock=chosen.includes(linkIndex)?amounts[chosen.indexOf(linkIndex)]:linkAmount;
el('link-amount').value=Math.min(10000,shock);el('link-amount').disabled=chosen.includes(linkIndex);el('link-amount-label').textContent=num(shock)+' 억원'+(chosen.includes(linkIndex)?' · 비교 슬라이더와 연동':'');
el('link-stats').innerHTML=[['영향력계수 (후방)',s.backward],['감응도계수 (전방)',s.forward],['생산유발배수',s.production]].map(([t,v])=>`<div class="ext-stat">${t}<b>${num(v)}</b></div>`).join('');
// Direct input links: column j = supplies required by j; row j = j supplied to users.
const backward=ext.sectors.map((q,i)=>({name:q.name,value:ext.domesticInput[i][linkIndex],unit:'투입계수'})).filter((x,i)=>i!==linkIndex).sort((a,b)=>b.value-a.value);
const forward=ext.sectors.map((q,i)=>({name:q.name,value:ext.domesticInput[linkIndex][i],unit:'투입계수'})).filter((x,i)=>i!==linkIndex).sort((a,b)=>b.value-a.value);
drawBars('link-backward',backward,10);drawBars('link-forward',forward,10);
const impact=ext.sectors.map((q,i)=>({name:q.name,value:ext.leontief[i][linkIndex]*shock,unit:'억원'})).sort((a,b)=>b.value-a.value);drawBars('link-impact',impact,12);
}
window.initExtension=async()=>{el('ext-status').textContent='산업별 계수와 연관관계 계산 중…';ext=await call('extension',null);
const find=t=>ext.sectors.findIndex(s=>s.name.includes(t));chosen=['반도체','자동차','건설'].map((t,i)=>{const j=find(t);return j>=0?j:i;});linkIndex=chosen[0];amounts=[1000,1000,1000];linkAmount=1000;
initControls();renderComparison();renderLink();el('ext-status').textContent='준비 완료 · 380개 산업 · 슬라이더 변경 즉시 반영';};
})();
