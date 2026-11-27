'use strict';
const paths = {
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.3"/><rect x="14" y="3" width="7" height="7" rx="1.3"/><rect x="3" y="14" width="7" height="7" rx="1.3"/><rect x="14" y="14" width="7" height="7" rx="1.3"/>',
 chat:'<path d="M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.6-.8L4 20l.8-4.4A8.5 8.5 0 1 1 20.5 11.5Z"/>',
 user:'<circle cx="12" cy="8" r="3"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/>',
 down:'<path d="m5 5 14 14m-7 0h7v-7"/>',
 clip:'<path d="m8 13 6.5-6.5a2 2 0 0 1 3 3L9 18a3.5 3.5 0 0 1-5-5l9-9"/>',
 home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-7h6v7"/>',
 list:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8m-8 4h5"/>',
 chart:'<path d="M4 4v16h16M8 16v-4m5 4V8m5 8V5"/>',
 spark:'<path d="M12 2.5 14.5 9.5 21.5 12 14.5 14.5 12 21.5 9.5 14.5 2.5 12 9.5 9.5zM19 2v4m-2-2h4"/>',
 wallet:'<path d="M4 8V6l13-3v5m-13 0h14a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-2zm16 4h-5v4h5m-3-2h.01"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
 add:'<path d="M12 5v14M5 12h14"/>', right:'<path d="m9 6 6 6-6 6"/>', next:'<path d="M4 12h15m-6-6 6 6-6 6"/>', diagonal:'<path d="M6 18 18 6M8 6h10v10"/>', calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 income:'<path d="M12 19V5m-6 6 6-6 6 6"/>', balance:'<path d="M5 8h14M5 16h14"/>', budget:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 food:'<path d="M3 11h18a9 9 0 0 1-18 0Zm5 9h8M9 8c-1-1 1-2 0-4m5 4c-1-1 1-2 0-4"/>',
 travel:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M12 4v7m-4 7-2 3m10-3 2 3M8.5 14.5h.01m7 0h.01"/>',
 shop:'<path d="M5 8h14l1 12H4zm4 1V6a3 3 0 0 1 6 0v3"/>', rent:'<path d="m3 10 9-7 9 7m-2-1v11H5V9m5 11v-6h4v6"/>',
 fun:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16m10-16v16M3 9h4m10 0h4M3 15h4m10 0h4"/>',
 health:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>', study:'<path d="M12 6a8 8 0 0 0-9-2v14a9 9 0 0 1 9 2 9 9 0 0 1 9-2V4a8 8 0 0 0-9 2Zm0 0v14"/>',
 other:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm4 5h6m-6 4h6m-6 4h3"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>', edit:'<path d="m4 20 4-1 11-11-3-3L5 16zm10-13 3 3"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.4"/><path d="m4 17 5-5 4 4 3-3 5 5"/>',
 text:'<path d="M4 5h16M12 5v14m-4 0h8"/>', send:'<path d="m3 4 18 8-18 8 4-8-4-8zm4 8h14"/>'
};
const icon = (name,size=20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.other}</svg>`;
const categories = {
 food:{label:'餐饮',color:'#d3c7ef'}, travel:{label:'交通',color:'#bdd6e8'},
 shop:{label:'购物',color:'#f1cfbc'}, rent:{label:'居住',color:'#d6e7a2'},
 fun:{label:'娱乐',color:'#edc9d8'}, health:{label:'健康医疗',color:'#b9ddd1'},
 study:{label:'学习教育',color:'#caccf3'}, other:{label:'其他',color:'#e6dfcb'}
};
const navItems = {home:['总览','grid'],transactions:['流水','list'],analysis:['分析','chart'],assistant:['AI 查账','chat'],budget:['预算','budget']};
const apiCategories=Object.fromEntries(Object.entries(categories).map(([key,item])=>[item.label,key]));
function today(){
 const date=new Date();
 return String(date.getFullYear()).padStart(4,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
function thisMonth(){return today().slice(0,7);}
function validLedgerDate(value){
 if(typeof value!=='string'||!/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(value))return false;
 const date=new Date(value+'T00:00:00Z');
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function validLedgerAmount(value){return Number.isSafeInteger(value)&&value>=1&&value<=999999999;}
function validTransaction(item){
 return !!item&&validLedgerDate(item.date)&&validLedgerAmount(item.amount)
  &&Object.hasOwn(categories,item.category)&&(item.type==='expense'||item.type==='income')
  &&typeof item.merchant==='string'&&typeof item.note==='string';
}
function validBudget(item){
 return !!item&&validLedgerDate(item.month+'-01')&&Number.isSafeInteger(item.amount)&&item.amount>=0&&item.amount<=999999999
  &&(item.category==='all'||Object.hasOwn(categories,item.category));
}
const state={page:'home',month:thisMonth(),ledger:{transactions:[],budgets:[]},budgetStats:{},meta:null,ready:false,loadError:'',filters:{category:'all',type:'all',query:''},messages:[],thinking:false,justSaved:null,homeChat:{text:'',mode:'input'}};
const monthVersions=new Map();
const loadedMonths=new Set();
let monthRequest=0;
const MAX_RECEIPT_BYTES=5*1024*1024;
const receiptTypes=new Set(['image/png','image/jpeg','image/webp']);
const isFormDataBody=body=>typeof FormData!=='undefined'&&body instanceof FormData;
async function api(path,options={}){
 let response;
 const headers={Accept:'application/json',...(options.headers||{})};
 if(options.body!==undefined&&options.body!==null&&!isFormDataBody(options.body)&&!headers['Content-Type'])headers['Content-Type']='application/json';
 try{
  response=await fetch(path,{...options,cache:'no-store',headers});
 }catch{
  throw new Error('无法连接服务，请检查后端是否已启动；如刚提交过账单，请先刷新核对。');
 }
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(typeof data?.detail==='string'?data.detail:'请求失败（HTTP '+response.status+'），请联系对应接口负责人。');
 if(data===null)throw new Error('接口没有返回有效 JSON，请检查后端响应。');
 return data;
}
function categoryFromApi(category,type){
 if(type==='income'&&category===state.meta.income)return 'other';
 if(type==='income')throw new Error('收入分类与接口契约不符。');
 if(!Object.hasOwn(apiCategories,category))throw new Error('接口返回了未支持的分类。');
 return apiCategories[category];
}
function fromApi(item){
 if(!item||!Number.isSafeInteger(item.id)||item.id<1||!validLedgerDate(item.day)
  ||!Number.isSafeInteger(item.amount)||item.amount<=0||!['expense','income'].includes(item.type)
  ||typeof item.merchant!=='string'||typeof item.note!=='string')throw new Error('流水响应字段与接口契约不符。');
 return {id:String(item.id),date:item.day,amount:item.amount,type:item.type,category:categoryFromApi(item.category,item.type),merchant:item.merchant,note:item.note};
}
function toApi(item){
 if(!validTransaction(item))throw new Error('请检查金额、日期和分类。');
 return {day:item.date,amount:item.amount,type:item.type,category:item.type==='income'?state.meta.income:categories[item.category].label,merchant:item.merchant,note:item.note};
}
async function refreshMonth(month=state.month,withBudget=true){
 const version=(monthVersions.get(month)||0)+1;
 monthVersions.set(month,version);
 const requests=[api('/api/transactions?limit=100&month='+encodeURIComponent(month))];
 if(withBudget)requests.push(api('/api/budget?month='+encodeURIComponent(month)));
 const [rows,budget]=await Promise.all(requests);
 if(!Array.isArray(rows.items))throw new Error('流水列表响应缺少 items。');
 const transactions=rows.items.map(fromApi);
 let budgets,stats;
 if(withBudget){
  if(budget.month!==month||!Array.isArray(budget.items))throw new Error('预算响应字段与接口契约不符。');
  budgets=[];stats={};
  for(const item of budget.items){
   if(item.budget===null)continue;
   if(!Number.isSafeInteger(item.budget)||item.budget<0||!Number.isSafeInteger(item.used)||item.used<0
    ||!(item.ratio===null||Number.isFinite(item.ratio)))throw new Error('预算金额或进度无效。');
   const category=item.category==='all'?'all':categoryFromApi(item.category,'expense');
   budgets.push({month,category,amount:item.budget});
   stats[category]={spent:item.used,ratio:item.ratio};
  }
 }
 if(monthVersions.get(month)!==version)return;
 const combined=[...state.ledger.transactions.filter(item=>!item.date.startsWith(month)),...transactions];
 state.ledger.transactions=[...new Map(combined.map(item=>[item.id,item])).values()];
 if(withBudget){
  state.ledger.budgets=[...state.ledger.budgets.filter(item=>item.month!==month),...budgets];
  state.budgetStats[month]=stats;
 }
 loadedMonths.add(month);
}
async function boot(){
 state.ready=false;state.loadError='';render();
 try{
  const meta=await api('/api/meta');
  if(!validLedgerDate(meta.today)||typeof meta.income!=='string'||!Array.isArray(meta.categories)
   ||new Set(meta.categories.map(item=>item.key)).size!==Object.keys(categories).length
   ||meta.categories.some(item=>!Object.hasOwn(apiCategories,item.key)||item.label!==item.key))throw new Error('元信息与接口契约不符，请确认后端已更新到 V3。');
  state.meta=meta;
  for(const item of meta.categories)categories[apiCategories[item.key]].label=item.label;
  state.month=meta.today.slice(0,7);
  const months=new Set([state.month,...Array.from({length:6},(_,i)=>shiftMonth(thisMonth(),-i))]);
  for(const month of months)await refreshMonth(month,month===state.month);
  state.ready=true;
 }catch(error){state.loadError=error.message;notify(error.message);}
 render();
}
async function refreshAfterWrite(months,message){
 try{
  for(const month of new Set(months))await refreshMonth(month);
  refreshAnswers();render();notify(message);
 }catch(error){
  render();notify(message+'；刷新失败：'+error.message);
 }
}
const view=document.querySelector('#view'), dialog=document.querySelector('#dialog');
const format = new Intl.NumberFormat('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const money = (amount) => '¥'+format.format(amount/100);
function rollingAmount(key, amount, unit='¥'){
 return `<span class="rolling-amount" data-amount-key="${escape(key)}" data-amount-value="${amount}" data-amount-unit="${unit}"><span class="amount-roll-final">${unit}${format.format(amount/100)}</span><span class="amount-roll-live" aria-hidden="true"></span></span>`;
}
const escape = (value) => String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const label=(cat)=>categories[cat]?.label||'其他';
const total=(records)=>records.reduce((sum,item)=>sum+item.amount,0);
const monthLabel=(month)=>month.slice(0,4)+' 年 '+Number(month.slice(5))+' 月';
const monthShort=(month)=>Number(month.slice(5))+' 月';
const dateLabel=(date)=>Number(date.slice(5,7))+' 月 '+Number(date.slice(8))+' 日';
const keyMonth=(year,month)=>String(year)+'-'+String(month).padStart(2,'0');
function shiftMonth(month,delta){const [y,m]=month.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1+delta,1));return keyMonth(dt.getUTCFullYear(),dt.getUTCMonth()+1);}
function offsetDate(date,days){
 const dt=new Date(date+'T00:00:00Z');
 dt.setUTCDate(dt.getUTCDate()+days);
 return dt.toISOString().slice(0,10);
}
function monthEnd(month){return offsetDate(shiftMonth(month,1)+'-01',-1);}
const rangeLabel=month=>month+'-01 至 '+monthEnd(month);
const compare=(a,b)=>b.date.localeCompare(a.date);
function ledgerFor(month=state.month){return state.ledger.transactions.filter(item=>item.date.startsWith(month)).sort(compare);}
function recordsBetween(start,end){
 return state.ledger.transactions.filter(item=>item.date>=start&&item.date<=end).sort(compare);
}
function expenses(month=state.month){return ledgerFor(month).filter(item=>item.type==='expense');}
function breakdown(month=state.month){
 const sums={};
 for(const item of expenses(month))sums[item.category]=(sums[item.category]||0)+item.amount;
 return Object.entries(sums).sort((a,b)=>b[1]-a[1]);
}
function mark(name,tint='#efedf4',size=19){
 return `<span class="smallmark" style="--tint:${tint}">${icon(name,size)}</span>`;
}
const catMark=(cat)=>mark(categories[cat]?cat:'other',(categories[cat]||categories.other).color);
const empty=(symbol,title,description,actions='')=>`<div class="empty">${mark(symbol)}<strong>${title}</strong><p>${description}</p>${actions}</div>`;
function notify(text){
 const el=document.querySelector('#toast');el.textContent=text;
 clearTimeout(notify.timer);notify.timer=setTimeout(()=>{el.textContent='';},3100);
}
function navButton(key,[name,shape]){
 const selected=state.page===key;
 return `<button type="button" class="navbtn ${selected?'active':''}" data-page="${key}" aria-label="${name}" ${selected?'aria-current="page"':''}>${icon(shape,20)}<span class="nav-text">${name}</span><span class="nav-indicator"></span></button>`;
}
const pageTitle={home:'账本总览',transactions:'收支流水',analysis:'消费分析',assistant:'AI 查账',budget:'预算管理'};
const pagesDesc={transactions:'按日期查找和筛选你的账单。',analysis:'查看消费构成与支出变化。',assistant:'查询消费、预算进度和近 30 天支出。',budget:'设置月度限额，查看使用进度。'};
function monthPicker(){
 const months=new Set(Array.from({length:6},(_,i)=>shiftMonth(thisMonth(),-i)));
 months.add(state.month);
 return `<label class="select-wrap">${icon('calendar',16)}<select id="period" aria-label="选择账本月份">${[...months].sort().reverse().map(month=>`<option value="${month}" ${state.month===month?'selected':''}>${monthLabel(month)}</option>`).join('')}</select></label>`;
}
function button(action,name,symbol='add',className='primary',extra=''){
 return `<button type="button" class="${className}" data-action="${action}" ${extra}>${icon(symbol,16)}${name}</button>`;
}
function panelHeading(title,note='',action=''){
 return `<div class="card-head"><div><h2>${title}</h2>${note?`<p class="micro">${note}</p>`:''}</div>${action}</div>`;
}
function pageHeader(){
 const primaryAction=state.page==='home'?button('focus-home-chat','记一笔','add','primary solid plus-button'):
 state.page==='transactions'?button('add','记一笔','add','primary plus-button'):
 state.page==='budget'?button('budget-edit','设置预算'):'';
 const budgetButton=state.page==='analysis'?button('open-budget','查看预算','budget','secondary'):'';
 const description=pagesDesc[state.page];
 return `<div class="page-head"><div><h1>${pageTitle[state.page]}</h1>${description?`<p>${description}</p>`:''}</div><div class="page-actions">${monthPicker()}${budgetButton}${primaryAction}</div></div>`;
}
function mobileNav(){
 const link=key=>navButton(key,navItems[key]);
 const add=`<button type="button" class="primary mobile-add" data-action="${state.page==='home'?'focus-home-chat':'add'}">${icon('add',18)}<span>记一笔</span></button>`;
 return [link('home'),link('transactions'),add,link('analysis'),link('budget'),link('assistant')].join('');
}
function render(focus=false){
 document.documentElement.dataset.page=state.page;
 document.querySelector('#desktop-nav').innerHTML=Object.entries(navItems).map(([key,data])=>navButton(key,data)).join('');
 document.querySelector('#mobile-nav').innerHTML=mobileNav();
 document.querySelector('#crumb').innerHTML=`<span class="breadcrumb-root">Finora AI</span><span class="crumb-sep">${icon('right',13)}</span><b>${pageTitle[state.page]}</b>`;
 if(!state.ready){
  view.innerHTML=empty('wallet',state.loadError?'账本加载失败':'正在读取账本',state.loadError?escape(state.loadError):'正在连接服务器并读取最近六个月记录。',state.loadError?button('retry-load','重新加载','next','secondary'):'');
  return;
 }
 view.innerHTML=pageHeader()+({home:homePage,transactions:transactionsPage,analysis:analysisPage,assistant:assistantPage,budget:budgetPage}[state.page])();
 syncRollingAmounts(view);
 syncThinkingIcons(view);
 if(focus)view.focus({preventScroll:true});
}
async function setMonth(month){
 const request=++monthRequest;
 try{
  await refreshMonth(month);
  if(request!==monthRequest)return false;
  if(state.month!==month){
   state.month=month;delete state.filters.ids;delete state.filters.range;
   if(['query','thinking'].includes(state.homeChat.mode))state.homeChat={text:'',mode:'input'};
  }
  render();return true;
 }catch(error){if(request===monthRequest){render();notify(error.message);}return false;}
}
function navigate(page){
 if(!Object.hasOwn(navItems,page))return;
 state.page=page;
 if(location.hash!=='#'+page)history.replaceState(null,'','#'+page);
 render(true);window.scrollTo(0,0);
}
function stat(title,amount,shape,shade,note=''){
 return `<div class="card stat"><div class="stat-label">${mark(shape,shade,16)}${title}</div><strong class="stat-value money">${rollingAmount(state.page+'-'+shape,amount)}</strong>${note?`<span class="micro stat-note">${note}</span>`:''}</div>`;
}
function spendingChange(month=state.month){
 if(!loadedMonths.has(shiftMonth(month,-1)))return '上月数据未加载';
 const current=total(expenses(month)), previous=total(expenses(shiftMonth(month,-1)));
 if(!previous)return current?'上月无支出记录':'两月均无支出记录';
 const change=(current-previous)/previous*100;
 if(Math.abs(change)<.05)return '与上月持平';
 return '较上月'+(change>0?'增加 ':'减少 ')+Math.abs(change).toFixed(1)+'%';
}
function budgetUsage(category='all',month=state.month){
 const budget=state.ledger.budgets.find(item=>item.month===month&&item.category===category);
 if(!budget)return null;
 const stats=state.budgetStats[month]?.[category];
 if(!stats)return null;
 const {spent,ratio}=stats;
 const remaining=budget.amount-spent;
 return {budget,spent,ratio,remaining,status:remaining<0?'已超出':remaining===0?'已用完':ratio>=.8?'接近上限':'预算内'};
}
function progress(ratio){
 const fill=ratio>1?'over':ratio>=.8?'warn':'';
 return `<div class="track" aria-hidden="true"><span class="${fill}" style="width:${Math.max(0,Math.min((ratio||0)*100,100))}%"></span></div>`;
}
function percent(ratio){return ratio===null?'—':Math.round(ratio*100)+'%';}
function budgetTone(data){
 return data.remaining<0?'danger':data.ratio>=.8?'warning':'positive';
}
function statusPill(data){
 const text=data.remaining<0?'已超出 '+money(-data.remaining):data.status;
 return `<span class="budget-status ${budgetTone(data)}">${text}</span>`;
}
function budgetComparison(item,month=state.month){
 const data=budgetUsage(item.category,month);
 const all=item.category==='all';
 return `<div class="mini-budget">
  <div class="budget-top"><div class="inline">${all?mark('budget','#DFE6C1',15):catMark(item.category)}<b>${all?'总预算':label(item.category)}</b></div>${statusPill(data)}</div>
  ${progress(data.ratio)}<div class="budget-bottom micro money"><span>${money(data.spent)} / ${money(item.amount)}</span><b>${percent(data.ratio)}</b></div>
 </div>`;
}
const trendModes={home:'bar',analysis:'bar'};

function trend(mode='bar',animate=false){
 const months=Array.from({length:6},(_,i)=>shiftMonth(thisMonth(),i-5));
 const values=months.map(month=>total(expenses(month)));
 const maxValue=Math.max(1,...values);
 const step=Math.max(10000,Math.ceil(maxValue/40000)*10000);
 const max=step*4;
 const labelFormat=new Intl.NumberFormat('zh-CN',{notation:'compact',maximumFractionDigits:1});
 const labels=Array.from({length:5},(_,i)=>'¥'+labelFormat.format((max-i*step)/100));
 const heights=values.map(value=>100*value/max);
 const isLine=mode==='line';
 const points=heights.map((height,i)=>`${50+100*i},${100-height}`).join(' ');
 const line=isLine?`<svg class="trend-line-art" viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true">
  <polygon class="trend-line-fill" points="50,100 ${points} 550,100"></polygon>
  <polyline class="trend-line-stroke" points="${points}" vector-effect="non-scaling-stroke"></polyline>
 </svg>`:'';
 const bars=months.map((month,i)=>`<div class="bar-slot" style="--height:${heights[i]}%;--point-delay:${80+160*i}ms">
  <button type="button" class="bar ${month===state.month?'highlight':''}" data-action="trend-month" data-month="${month}" aria-pressed="${month===state.month}" aria-label="${monthLabel(month)}支出 ${money(values[i])}"></button>
  <span class="bar-tip" aria-hidden="true">${money(values[i])}</span><span class="bar-label ${month===state.month?'current':''}" aria-hidden="true">${monthShort(month)}</span>
 </div>`).join('');
 return `<div class="chart-area"><div class="axis" aria-hidden="true">${labels.map(label=>`<span>${label}</span>`).join('')}</div><div class="plot${isLine?' line-plot':''}${isLine&&animate?' line-reveal':''}">${line}${bars}</div></div>`;
}
function trendCard(extra='',action=''){
 const mode=trendModes[state.page];
 const controls=mode?`<div class="trend-actions"><div class="trend-switch" role="group" aria-label="趋势图类型">
  <button type="button" data-action="trend-mode" data-mode="bar" aria-pressed="${mode==='bar'}">柱形图</button>
  <button type="button" data-action="trend-mode" data-mode="line" aria-pressed="${mode==='line'}">折线图</button>
 </div>${action}</div>`:action;
 const note=mode?'近 6 个月 · 点击图中月份切换':'近 6 个月 · 选择柱形切换月份';
 return `<section class="card pad trend-card ${extra}">${panelHeading('支出趋势',note,controls)}${trend(mode)}<p class="micro">每月最多统计最近 100 笔</p></section>`;
}
function setTrendMode(control){
 const mode=control.dataset.mode;
 if(trendModes[state.page]===mode)return;
 trendModes[state.page]=mode;
 const card=control.closest('.trend-card');
 for(const button of card.querySelectorAll('[data-action="trend-mode"]')){
  button.setAttribute('aria-pressed',String(button===control));
 }
 card.querySelector('.chart-area').outerHTML=trend(mode,true);
}
function donut(){
 const rows=breakdown(), sum=total(expenses());
 if(!sum)return empty('chart','本月还没有支出','记下一笔后，这里会显示消费构成。');
 let end=0;
 const slices=rows.map(([cat,amount])=>{const start=end;end+=amount/sum*100;return `${categories[cat].color} ${start.toFixed(3)}% ${end.toFixed(3)}%`;});
 return `<div class="ring-layout"><div class="ring" style="background:conic-gradient(${slices.join(',')})" aria-label="支出合计 ${money(sum)}"><div class="ring-center"><small>支出合计</small><b class="money">${money(sum)}</b></div></div><div class="legend">${rows.map(([cat,amount])=>`<button type="button" class="legend-btn" data-action="category" data-category="${cat}" aria-label="查看${label(cat)}流水，占比${percent(amount/sum)}">${catMark(cat)}<span class="legend-name">${label(cat)}</span><b>${percent(amount/sum)}</b></button>`).join('')}</div></div>`;
}
function row(item){
 const desc=item.type==='income'?'收入':label(item.category);
 return `<button type="button" class="row ${item.id===state.justSaved?'just-saved':''}" data-action="detail" data-id="${escape(item.id)}">${item.type==='income'?mark('income','#DFE6C1'):catMark(item.category)}<span class="row-main"><span class="row-name">${escape(item.merchant||desc)}</span><span class="row-sub">${desc} · ${dateLabel(item.date)}</span></span><span class="row-amount money ${item.type==='income'?'positive':''}">${item.type==='income'?'+':'−'}${money(item.amount)}</span><span class="row-arrow">${icon('right',14)}</span></button>`;
}
function homeBudget(){
 const data=budgetUsage();
 const period=state.month===thisMonth()?'本月':'当月';
 const heading=data?.remaining<0?'总预算已超出':period+'预算剩余';
 const value=data
  ?`<div class="home-budget-value"><strong class="money" id="remaining-budget"><span class="amount-unit">¥</span>${rollingAmount('home-remaining',Math.abs(data.remaining),'')}</strong>${statusPill(data)}</div>`
  :'<div class="home-budget-value"><strong class="no-amount">还没设置预算</strong></div>';
 const meta=data
  ?`${progress(data.ratio)}<div class="home-budget-meta micro money"><span>已用 ${money(data.spent)} / ${money(data.budget.amount)}</span><b>${percent(data.ratio)}</b></div>`
  :'<p class="micro">设置月度限额后可以查看剩余预算。</p>';
 return `<section class="card home-budget-card" aria-labelledby="budget-hero-title"><div class="home-budget-head">
  <h2 id="budget-hero-title">${mark('wallet')}${heading}</h2>${button('open-budget',data?'查看预算':'设置预算','diagonal','plain')}
 </div>${value}${meta}</section>`;
}
function homePage(){
 const records=ledgerFor();
 const isCurrent=state.month===thisMonth();
 const visible=records;
 const title='最近流水';
 const note=monthLabel(state.month)+' · '+visible.length+' 笔';
 const caps=state.ledger.budgets.filter(item=>item.month===state.month&&item.category!=='all');
 const urgent=caps.sort((a,b)=>budgetUsage(b.category).ratio-budgetUsage(a.category).ratio)[0];
 const goAnalysis='<button type="button" class="plain" data-page="analysis">看分析'+icon('diagonal',15)+'</button>';
 return `<div class="home-grid">
  <section class="card home-hero" aria-labelledby="home-bill-title home-assistant-title">
   <div class="home-bill">
    <div class="home-bill-head"><h2 id="home-bill-title">${isCurrent?'本月账单':'当月账单'}</h2>${button('all-transactions','查看流水','diagonal','plain')}</div>
    <div class="home-bill-total"><strong class="money"><span class="amount-unit">¥</span>${rollingAmount('home-expenses',total(expenses()),'')}</strong><span class="micro">支出合计</span></div>
   </div>
   <div class="home-assistant">${homeAssistantHeading()}<div id="home-chat-content">${homeChatContent()}</div></div>
  </section>
  <div class="home-details">
   ${homeBudget()}
   ${stat(isCurrent?'本月收入':'当月收入',total(records.filter(item=>item.type==='income')),'income','#efedf4')}
   <section class="card pad caps-card">
    ${panelHeading('分类预算','',button('open-budget','管理','diagonal','plain'))}
    ${urgent?budgetComparison(urgent):'<p class="micro">给餐饮、交通等分类设定月度限额。</p>'}
   </section>
  </div>
  <section class="card pad today-card">
   ${panelHeading(title,note,button('all-transactions','查看全部','diagonal','plain'))}
   <div class="row-list">${visible.length?visible.slice(0,3).map(row).join(''):empty('list','这个月还没有流水','记下一笔后，预算也会一起更新。',button('add','记一笔'))}</div>
  </section>
  ${trendCard('home-trend',goAnalysis)}
 </div>`;
}
function filterOptions(values,current){
 return values.map(([key,display])=>`<option value="${key}" ${current===key?'selected':''}>${display}</option>`).join('');
}
function transactionsPage(){
 const {category,type,query,ids,range}=state.filters;
 const context=ids?'刚记入的流水':range?range.join(' 至 '):'';
 return `<section class="card pad">${context?`<div class="list-meta"><strong>${context}</strong><button type="button" class="plain" data-action="reset-filters">查看当月全部</button></div>`:''}<div class="filterbar">
 <label class="search">${icon('search',17)}<input id="search-field" type="search" placeholder="搜索商户、分类或备注" aria-label="搜索商户、分类或备注" value="${escape(query)}"></label>
 <select class="field" id="category-filter" aria-label="按分类筛选">${filterOptions([['all','全部分类'],...Object.keys(categories).map(cat=>[cat,label(cat)])],category)}</select>
 <select class="field" id="type-filter" aria-label="按收支筛选">${filterOptions([['all','全部收支'],['expense','仅支出'],['income','仅收入']],type)}</select>
 <button type="button" class="plain" data-action="reset-filters">清除筛选</button>
 </div><div id="results">${transactionResults()}</div></section>`;
}
function transactionResults(){
 const {category,type,query,ids,range}=state.filters;
 const all=ids?state.ledger.transactions.filter(item=>ids.includes(item.id)).sort(compare):range?recordsBetween(...range):ledgerFor();
 const needle=query.trim().toLowerCase();
 const matches=all.filter(item=>(category==='all'||item.category===category)&&(type==='all'||item.type===type)&&(!needle||[item.merchant,item.note,label(item.category)].join(' ').toLowerCase().includes(needle)));
 const sum=total(matches.filter(item=>item.type==='expense'));
 if(!matches.length)return all.length?empty('search','没有匹配的流水','试试更换关键词或清除筛选条件。',`<button type="button" class="secondary" data-action="reset-filters">清除筛选</button>`):empty('list','本月还没有流水','新增一笔后，可以在这里找到它。',button('add','记一笔'));
 let date='';
 const groupedRows=matches.map(item=>{
  const heading=date!==item.date
   ?`<h2 class="group-label"><time class="group-date" datetime="${escape(item.date)}">${dateLabel(item.date)}</time>${item.date===today()?'<span class="group-date-note">今天</span>':''}</h2>`
   :'';
  date=item.date;
  return heading+row(item);
 }).join('');
 return `<div class="list-meta"><span class="micro">${matches.length} 笔记录</span><span class="micro money">筛选支出 ${money(sum)}</span></div><div class="row-list">${groupedRows}</div>`;
}
async function openCategory(category='all',month=state.month,type='expense',range){
 if(!await setMonth(month))return;
 state.filters={category,type,query:'',range};navigate('transactions');
}
function analysisPage(){
 const records=ledgerFor(), outgoing=total(expenses()), incoming=total(records.filter(item=>item.type==='income'));
 const rows=breakdown();
 const caps=state.ledger.budgets.filter(item=>item.month===state.month);
 const rankings=rows.map(([cat,amount])=>`<button type="button" class="category-row" data-action="category" data-category="${cat}">${catMark(cat)}<span><b>${label(cat)}</b><span class="micro category-share">${percent(amount/outgoing)}</span><span class="track" aria-hidden="true"><span style="width:${amount/outgoing*100}%;background:${categories[cat].color}"></span></span></span><span class="money">${money(amount)}</span>${icon('right',14)}</button>`).join('');
 return `<div class="an-totals">${stat('支出合计',outgoing,'down','#eeeafa',spendingChange())}${stat('收入合计',incoming,'income','#eef5d8')}${stat('净收支',incoming-outgoing,'balance','#efedf4')}</div>
 <div class="an-grid">${trendCard()}<section class="card pad">${panelHeading('消费构成',monthLabel(state.month),button('ask','问 AI','chat','plain','data-question="所选月份哪类支出最高？"'))}${donut()}</section>
 <section class="card pad wide">${panelHeading('预算对比','已支出 / 月度限额（¥）')}${caps.length?`<div class="compare-grid">${caps.map(item=>budgetComparison(item)).join('')}</div>`:empty('budget','本月还没有预算','设定限额后可在这里比较实际支出。',button('open-budget','设置预算','budget','secondary'))}</section>
 <section class="card pad wide">${panelHeading('分类排行','点击类别查看对应流水')}${rankings||empty('chart','暂无消费分类','本月记账后可查看分类排行。',button('add','记一笔'))}</section></div>`;
}
// Each row specifies the source crop and its position in a group below the budget cards.
const budgetStickerGroups = [
 [
  {name:'poppi', crop:[175,34,200,200], position:[29,40,24,-11]},
  {name:'tag', label:'价格标签', crop:[469,70,151,136], position:[70,21,16,-12], halo:'lime'},
  {name:'small-heart', crop:[712,95,90,82], position:[9,28,8,-14], halo:'pink'},
  {name:'pouch-top', label:'绿色钱包', crop:[913,81,85,91], position:[91,46,8,10], halo:'lime'},
  {name:'set', crop:[342,264,140,141], position:[17,78,13,-5]},
  {name:'ceremonia', crop:[548,242,176,178], position:[48,76,19,8]},
  {name:'byoma', crop:[789,228,185,194], position:[73,63,17,-9]},
  {name:'ouai', crop:[1040,237,181,183], position:[91,85,13,5]},
  {name:'cat', label:'猫咪', crop:[122,255,136,160], position:[49,22,13,12]}
 ],
 [
  {name:'reward-large', label:'加 400', crop:[312,431,551,205], position:[51,47,43,-8], halo:'lime'},
  {name:'reward-top', label:'加 100', crop:[1084,73,294,123], position:[74,16,23,7], halo:'lime'},
  {name:'pouch-right', label:'绿色钱包', crop:[1326,290,75,80], position:[12,22,8,-10], halo:'lime'},
  {name:'cart', label:'购物车', crop:[124,476,132,120], position:[14,67,16,7], halo:'lime'},
  {name:'bravo', crop:[908,470,121,124], position:[88,48,13,8], halo:'lime'},
  {name:'o-mark', label:'字母 O', crop:[1093,475,119,117], position:[82,79,12,-7]},
  {name:'discount-ticket', label:'折扣券', crop:[140,657,155,163], position:[39,82,15,8], halo:'lime'},
  {name:'uo', crop:[1250,453,156,161], position:[39,15,13,-9]},
  {name:'large-heart', crop:[951,665,181,159], position:[60,78,12,12], halo:'pink'}
 ],
 [
  {name:'monogram', label:'黑白字母', crop:[387,658,172,174], position:[17,24,17,-9]},
  {name:'gradient-tile', label:'粉紫渐变', crop:[655,653,194,180], position:[40,48,27,-8], halo:'pink'},
  {name:'saie', crop:[1222,663,162,158], position:[77,16,18,9], halo:'lavender'},
  {name:'product-photo', label:'商品照片', crop:[126,847,150,162], position:[86,54,17,8]},
  {name:'pouch-bottom-left', label:'绿色钱包', crop:[339,878,87,92], position:[7,57,8,-10], halo:'lime'},
  {name:'heart-bottom', crop:[789,886,109,99], position:[15,85,11,-13], halo:'pink'},
  {name:'pouch-bottom-right', label:'绿色钱包', crop:[980,893,75,79], position:[64,46,8,11], halo:'lime'},
  {name:'reward-bottom-left', label:'加 100', crop:[466,878,263,111], position:[45,87,24,6], halo:'lime'},
  {name:'reward-bottom-right', label:'加 100', crop:[1116,875,293,117], position:[80,86,23,-9], halo:'lime'}
 ]
];

function budgetStickerArt(){
 const groups=budgetStickerGroups.map(group=>{
  const stickers=group.map(({name,label=name,crop,position,halo=''})=>{
   const [sourceX,sourceY,sourceWidth,sourceHeight]=crop;
   const [x,y,size,tilt]=position;
   const sourceStyle=`--sx:${sourceX};--sy:${sourceY};--sw:${sourceWidth};--sh:${sourceHeight}`;
   const positionStyle=`--x:${x}%;--y:${y}%;--size:${size}%;--tilt:${tilt}deg`;
   const attrs=`class="budget-sticker ${halo}" data-sticker="${name}" style="${sourceStyle};${positionStyle}"`;
   return name.includes('heart')
    ? `<span ${attrs} data-sticker-magnet aria-hidden="true"></span>`
    : `<button type="button" ${attrs} data-action="shake-sticker" aria-label="${escape(label)}贴纸"></button>`;
  }).join('');
  return `<div class="budget-sticker-group">${stickers}</div>`;
 }).join('');
 return `<div class="budget-sticker-art" role="group" aria-label="预算贴纸">${groups}</div>`;
}

const stickerShakes = new WeakMap();
function shakeSticker(sticker){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 stickerShakes.get(sticker)?.cancel();
 const shake=sticker.animate([
  {translate:'0 0',rotate:'0deg'},
  {translate:'-3px 0',rotate:'-6deg',offset:.18},
  {translate:'3px 0',rotate:'5deg',offset:.39},
  {translate:'-2px 0',rotate:'-3deg',offset:.61},
  {translate:'1px 0',rotate:'1.5deg',offset:.79},
  {translate:'0 0',rotate:'0deg'}
 ],{duration:320,easing:'ease-out'});
 stickerShakes.set(sticker,shake);
}

function budgetPage(){
 const items=state.ledger.budgets.filter(item=>item.month===state.month).sort((a,b)=>Number(b.category==='all')-Number(a.category==='all'));
 const cards=items.map(item=>{
  const data=budgetUsage(item.category);
  const tone=budgetTone(data);
  const name=item.category==='all'?'月度总预算':label(item.category);
  return `<section class="card pad budget-card"><div class="budget-top"><div class="inline">${item.category==='all'?mark('budget','#BACDED'):catMark(item.category)}<span class="budget-label">${name}</span></div>${statusPill(data)}</div>
  <p class="budget-amount-line"><span class="budget-value money">${rollingAmount('budget-'+item.category,data.spent)}</span> <span class="micro">/ ${money(item.amount)}</span></p>
  ${progress(data.ratio)}<div class="budget-bottom"><span class="micro money">${data.remaining>=0?'剩余':'超出'} ${money(Math.abs(data.remaining))}</span><b class="${tone}">${percent(data.ratio)}</b></div>
  <div class="form-actions">${button('budget-edit','调整限额','edit','secondary',`data-category="${item.category}"`)}</div></section>`;
 }).join('');
 const budgetContent=items.length?`<div class="budget-stack">${cards}</div>`:`<section class="card pad">${empty('budget','本月还没有预算','设置总预算或分类预算后即可查看进度。',button('budget-edit','设置预算'))}</section>`;
 return budgetContent+budgetStickerArt();
}

function suggestion(text,shape='chat'){
 return `<button type="button" class="suggestion" data-action="ask" data-question="${escape(text)}">${icon(shape,16)}${escape(text)}${icon('right',15)}</button>`;
}
const quickQuestions=['所选月份哪类支出最高？','所选月份哪些消费接近或超出预算？','分析最近 30 天的消费变化','所选月份可以从哪些方面调整支出？'];
function thinkingIcon(busy){
 return `<span class="thinking-mark" aria-hidden="true"${busy?' data-thinking':''}><canvas></canvas></span>`;
}
function assistantPage(){
 const messages=state.messages.map((entry,index)=>`<div class="message-turn"><div class="message-question">${escape(entry.question)}</div>${answerCard(entry,'answer-'+index)}</div>`).join('');
 return `<div class="card ai-grid"><section class="ai-chat" aria-label="查账对话">
 ${messages?`<div class="messages" aria-live="polite">${messages}</div>`:`<div class="ai-welcome"><h2>想查哪笔账？</h2><p class="micro">可以问金额、支出排行或预算使用情况。</p></div>`}
 <div class="ai-prompts">${quickQuestions.map(text=>suggestion(text)).join('')}</div>
 <div class="ai-form-wrap"><form class="chat-form" id="chat-form" aria-busy="${state.thinking}">${thinkingIcon(state.thinking)}<input name="question" aria-label="输入查账问题" placeholder="例如：这个月餐饮花了多少？" maxlength="150" required ${state.thinking?'disabled':''}><button class="primary" type="submit" ${state.thinking?'disabled':''}>${icon('send',16)} 发送</button></form></div>
 </section><aside class="ai-aside" aria-label="账本上下文">
 ${trendCard()}
 <section class="ai-context">${panelHeading('查询范围',monthLabel(state.month))}
 <p class="micro">查账结果会显示系统理解的日期范围。预算按自然月查询。</p></section>
 </aside></div>`;
}
function answerCard(entry,amountKey='home-answer-'+entry.question){
 const data=entry.result;
 if(!data)return '<section class="answer answer-loading" role="status">正在查找账本记录…</section>';
 if(data.kind==='failed')return `<section class="answer" role="alert"><p>${escape(data.text||'查账暂时失败。')}</p>${button('ask','重试','next','plain',`data-question="${escape(entry.question)}"`)}</section>`;
 if(data.kind==='chat')return `<section class="answer"><p>${escape(data.text||chatReply(entry.question))}</p></section>`;
 if(data.kind==='budget'||data.kind==='adjust'){
  const rows=data.caps.map(({budget})=>budgetComparison(budget,data.month)).join('');
  return `<section class="answer"><div class="micro inline">${icon('budget',15)} ${monthLabel(data.month)}</div><h3>${escape(data.title)}</h3>
   ${data.text?`<p>${escape(data.text)}</p>`:''}${rows?`<div class="answer-insights">${rows}</div>`:''}
   ${data.category?button('answer-detail','查看对应流水','next','plain',`data-month="${data.month}" data-category="${data.category}" data-type="expense"`):''}
   ${button('open-answer-budget','查看该月预算','diagonal','plain',`data-month="${data.month}"`)}
  </section>`;
 }
 const understood=data.understood;
 const scope=understood.from+' ~ '+understood.to+' · '+(understood.category||'全部分类')+' · '+(understood.type==='income'?'收入':'支出')+' · '+understood.metric;
 const amount=Number.isSafeInteger(data.data.amount)?`<h3 class="money">${rollingAmount(amountKey,data.data.amount)}</h3>`:'';
 const count=Number.isSafeInteger(data.data.count)?`<p class="micro">${data.data.count} 笔记录</p>`:'';
 const ranking=(understood.metric==='ranking'?data.data.items:[]).map(item=>{
  const category=categoryFromApi(item.category,understood.type);
  return `<div class="category-row">${catMark(category)}<span>${escape(item.category)}</span><span class="money">${money(item.amount)}</span></div>`;
 }).join('');
 return `<section class="answer"><p>${escape(data.answer)}</p>${amount}${count}<p class="micro">系统理解：${escape(scope)}</p>
 ${ranking?`<div class="answer-insights">${ranking}</div>`:''}${entry.stale?'<p class="micro">账本已有更新，可重新提问获取最新统计。</p>':''}</section>`;
}
const budgetKeywords={food:/餐饮|吃饭|午饭|晚饭|早饭|早餐|午餐|晚餐|饭|奶茶|咖啡|外卖|食堂|餐厅|饮料|聚餐/,travel:/交通|地铁|公交|打车|高铁|车费|网约车|出行|滴滴/,shop:/购物|超市|生活用品|网购|衣服|淘宝|京东|鞋/,rent:/居住|房租|住宿|水电|宿舍/,fun:/娱乐|电影|游戏|演唱会/,health:/医疗|医院|药|健康/,study:/学习|教育|教材|课程|书/,other:/其他/};
function matchingBudgetCategories(text){return Object.entries(budgetKeywords).filter(([,pattern])=>pattern.test(text)).map(([key])=>key);}
function queryBudget(question,month){
 const usages=state.ledger.budgets.filter(item=>item.month===month)
  .map(item=>budgetUsage(item.category,month)).sort((a,b)=>b.ratio-a.ratio);
 const flagged=usages.filter(item=>item.remaining<0||item.ratio>=.8);
 if(/调整|节省|省钱/.test(question)){
  const risk=flagged.find(item=>item.budget.category!=='all');
  const top=breakdown(month)[0];
  const category=risk?.budget.category||top?.[0];
  const text=risk?
   label(category)+'已使用 '+percent(risk.ratio)+' 的分类预算，可以先查看这类流水。':
   top?label(category)+'支出最高（'+money(top[1])+'），可以先复核该分类的大额流水。':'当前所选月份没有支出记录。';
  return {kind:'adjust',month,title:'优先复核的支出',text,caps:risk?[risk]:[],category};
 }
 const matches=matchingBudgetCategories(question);
 const relevant=matches.length?usages.filter(item=>matches.includes(item.budget.category)):usages;
 const asksRisk=/接近|超出|风险|可能/.test(question);
 const caps=asksRisk?relevant.filter(item=>item.remaining<0||item.ratio>=.8):relevant;
 const title=!relevant.length?'还没有设置预算':asksRisk?(caps.length?'需要留意的预算':'预算进度在 80% 以下'):'预算使用情况';
 return {kind:'budget',month,title,caps};
}
const isBudgetQuestion=question=>/预算|限额|超支|还剩多少|调整|节省|省钱/.test(question);
function resolveMonth(question,fallback=state.month){
 const explicit=question.match(/(?:(20\d{2})[年./-])?(1[0-2]|0?[1-9])月/);
 if(explicit)return keyMonth(explicit[1]||fallback.slice(0,4),Number(explicit[2]));
 if(/上个?月/.test(question))return shiftMonth(thisMonth(),-1);
 if(/本月|这个月|这月|最近\s*(30|三十)\s*天/.test(question))return thisMonth();
 return fallback;
}
const chatQueryPattern=/多少|几笔|哪[些类个项]|最多|排行|明细|统计|支出|收入|消费|账单|账本|流水|开支|开销|结余|余额|趋势|占比|对比|总结|情况|预算|限额|超支|分析|调整|花得|花销|花费|查/;
const chatRecordPattern=/记一笔|记帐|记账|记下|花了|买了|付了|打车|吃饭|午饭|晚饭|早饭|奶茶|咖啡|外卖|地铁|公交|房租|水电|工资|收入|红包|\d/;
function classifyChatInput(text){
 if(chatQueryPattern.test(text))return 'query';
 if(chatRecordPattern.test(text))return 'record';
 return 'chat';
}
function chatReply(text){
 const clean=text.trim();
 if(/^(你好|您好|嗨|哈喽|hi|hello)[啊呀呢吧？?！!。,\s]*$/i.test(clean))return '你好呀，我是账本助手，只负责记账和查账：说「午饭 25」记一笔，或者问「这个月餐饮花了多少？」，也可以上传小票识别。';
 if(/谢谢|感谢|辛苦/.test(clean))return '不客气～我只管账本相关的事，有记账或查账随时找我。';
 if(/你是谁|你能做什么|你会什么|怎么用/.test(clean))return '我是 Finora 的账本助手，只能帮你记账、查账和识别小票，其它话题不聊。';
 if(/在吗|在不在/.test(clean))return '在的。我只处理账本相关的问题，比如「午饭 25」或「这个月花了多少」。';
 return '我只懂记账和查账哦～你可以说「午饭 25」记一笔，或者问「这个月餐饮花了多少？」，也可以上传小票识别；其它话题我帮不上忙。';
}
async function requestAnswer(question,month){
 if(isBudgetQuestion(question)){
  const target=resolveMonth(question,month);
  await refreshMonth(target);
  const result=queryBudget(question,target);
  if(/最近\s*(30|三十)\s*天/.test(question))result.text='预算按自然月设置，以下为'+monthLabel(target)+'的预算。';
  return result;
 }
 const scoped=question.replace(/所选月份/g,month.replace('-','年')+'月');
 const result=await api('/api/query',{method:'POST',body:JSON.stringify({question:scoped})});
 if(typeof result.answer!=='string'||!result.data||!validLedgerDate(result.understood?.from)||!validLedgerDate(result.understood?.to)
  ||!['sum','count','ranking'].includes(result.understood.metric))throw new Error('查账响应字段与接口契约不符。');
 if(!['expense','income'].includes(result.understood.type))throw new Error('查账收支类型与接口契约不符。');
 if(result.understood.metric==='ranking'){
  if(!Array.isArray(result.data.items))throw new Error('排行响应缺少 items。');
  for(const item of result.data.items){
   categoryFromApi(item.category,result.understood.type);
   if(!Number.isSafeInteger(item.amount)||item.amount<0)throw new Error('排行金额与接口契约不符。');
  }
 }else if(!Number.isSafeInteger(result.data.amount)||result.data.amount<0||!Number.isSafeInteger(result.data.count)||result.data.count<0){
  throw new Error('查账金额或笔数与接口契约不符。');
 }
 return {...result,kind:'api'};
}
async function ask(question){
 const clean=question.trim();
 if(!clean||state.thinking)return;
 const entry={question:clean,month:state.month,result:null};
 state.messages.push(entry);state.thinking=true;
 if(state.page==='assistant')render();else navigate('assistant');
 try{
  const intent=classifyChatInput(clean);
  entry.result=intent==='query'
   ?await requestAnswer(clean,entry.month)
   :{kind:'chat',text:intent==='record'?'这是 AI 查账页；要记账的话，用首页的 AI 记账助手，或者点右上角「记一笔」。':chatReply(clean)};
 }catch(error){entry.result={kind:'failed',text:error.message};}
 finally{
  state.thinking=false;
  if(state.page==='assistant'){
   render();
   const answer=document.querySelector('.message-turn:last-child .answer');
   answer?.setAttribute('tabindex','-1');answer?.focus({preventScroll:true});
   answer?.scrollIntoView({block:'nearest'});
  }
 }
}
let editor=null, receiptUrl='', receiptFile=null, trigger=null;
const editorDefaults=(month=state.month)=>({amount:'',date:month===thisMonth()?today():month+'-01',type:'expense',category:'',merchant:'',note:''});
function showDialog(title,markup){
 const opening=!dialog.open;
 if(opening)trigger=document.activeElement;
 dialog.innerHTML=`<div class="dialog-body"><div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="iconbtn" data-action="close-dialog" aria-label="关闭">${icon('close',18)}</button></div>${markup}</div>`;
 if(opening)dialog.showModal();
 else dialog.querySelector('[data-action="close-dialog"]').focus({preventScroll:true});
 syncRollingAmounts(dialog);
}
function releaseReceipt(){if(receiptUrl)URL.revokeObjectURL(receiptUrl);receiptUrl='';receiptFile=null;}
function openEditor(item,mode='text'){
 releaseReceipt();
 editor={origin:state.page,mode,draft:editorDefaults(),visible:mode==='manual',busy:false,saving:false,text:'',imageName:'',imageError:'',note:''};
 drawEditor();
}
function optionsForCategories(value,firstLabel){
 return filterOptions([['',firstLabel],...Object.keys(categories).map(cat=>[cat,label(cat)])],value);
}
function captureEditorDraft(){
 const form=document.querySelector('#record-form');
 if(!editor||!form)return;
 const values=new FormData(form);
 for(const key of ['amount','date','type','category','merchant','note'])if(values.has(key))editor.draft[key]=String(values.get(key));
}
function syncReceiptInput(){
 const input=document.querySelector('#receipt-file');
 if(!input||!receiptFile||typeof DataTransfer==='undefined')return;
 try{
  const transfer=new DataTransfer();
  transfer.items.add(receiptFile);
  input.files=transfer.files;
 }catch{}
}
function drawEditor(){
 const e=editor;
 const tabData=[['text','文字录入'],['image','图片录入'],['manual','手动填写']];
 const tabs=`<div class="tabs" aria-label="录入方式">${tabData.map(([value,text])=>`<button type="button" class="tab ${e.mode===value?'active':''}" data-action="entry-tab" data-mode="${value}" aria-pressed="${e.mode===value}" ${e.busy||e.saving?'disabled':''}>${text}</button>`).join('')}</div>`;
 const textInput=e.mode==='text'?`<label class="field-label">记账内容<textarea id="entry-text" placeholder="例如：今天午饭 25 元" maxlength="250" ${e.busy?'disabled':''}>${escape(e.text)}</textarea></label><div class="form-actions"><button type="button" class="plain" data-action="sample-text" ${e.busy?'disabled':''}>填入示例</button>${button('parse-text',e.busy?'识别中…':'识别文字','spark','secondary',e.busy?'disabled':'')}</div>`:'';
 const imageInput=e.mode==='image'?`<div class="upload-area"><label class="field-label">选择小票或支付截图<input id="receipt-file" type="file" accept="image/png,image/jpeg,image/webp" ${e.busy?'disabled':''}></label><p class="micro">PNG、JPEG 或 WebP，最大 5 MB。图片会上传到本服务，并可能交由配置的识别模型处理；确认前不会写入账本。</p>${receiptUrl?`<img class="receipt-preview" src="${escape(receiptUrl)}" alt="已选择的小票预览"><p class="micro">${escape(e.imageName)}</p>`:'<p class="micro">还没有选择图片。</p>'}</div>
 <div class="form-actions">${button('parse-image',e.busy?'识别中…':receiptFile?'识别小票':'请先选择图片','spark','secondary',e.busy||!receiptFile?'disabled':'')}</div>`:'';
 const draft=e.draft;
 const form=e.visible?`<form id="record-form">
 <div class="draft-label">${e.mode==='manual'?'<strong>账单明细</strong>':'<strong>核对账单</strong> · 确认金额、日期与分类'}</div>
 <div class="field-grid">
 <label class="field-label">金额（¥）<input name="amount" type="number" min=".01" max="9999999.99" step=".01" inputmode="decimal" required value="${escape(draft.amount)}"></label>
 <label class="field-label">日期<input name="date" type="date" min="2000-01-01" max="2100-12-31" required value="${escape(draft.date)}"></label>
 <label class="field-label">收支类型<select name="type">${filterOptions([['expense','支出'],['income','收入']],draft.type)}</select></label>
 <label class="field-label">分类<select name="category" aria-label="分类" required>${optionsForCategories(draft.category,'请选择分类')}</select></label>
 <label class="field-label">商户<input name="merchant" maxlength="70" placeholder="选填" value="${escape(draft.merchant)}"></label>
 <label class="field-label">备注<input name="note" maxlength="120" placeholder="选填" value="${escape(draft.note)}"></label>
 </div><p class="form-message" id="save-error" role="alert"></p>
  <div class="form-actions"><button type="button" class="plain" data-action="close-dialog">取消</button><button type="submit" class="primary" ${e.busy||e.saving?'disabled':''}>${icon('check',16)} ${e.saving?'保存中…':'确认保存'}</button></div></form>`:'';
 showDialog('记一笔',tabs+textInput+imageInput+`<p class="form-message" role="status">${escape(e.note||e.imageError)}</p>`+form);
 if(e.mode==='image')syncReceiptInput();
}
function switchEntry(mode){
 captureEditorDraft();
 editor.mode=mode;
 editor.note='';
 if(mode==='manual')editor.visible=true;
 drawEditor();
}
function parseShapeToDraft(item,source){
 const fields={day:'日期',amount:'金额',type:'收支类型',category:'分类',merchant:'商户'};
 if(!item||typeof item!=='object'||Array.isArray(item)
  ||!validLedgerDate(item.day)||!(item.amount===null||(Number.isSafeInteger(item.amount)&&item.amount>0))
  ||!['expense','income'].includes(item.type)||typeof item.merchant!=='string'||typeof item.note!=='string'
  ||!item.understood||typeof item.understood!=='object'||Array.isArray(item.understood)
  ||Object.keys(fields).some(key=>typeof item.understood[key]!=='boolean'))throw new Error(source+'响应与 V3 接口契约不符。');
 return {date:item.day,amount:item.amount===null?'':(item.amount/100).toFixed(2),type:item.type,
  category:categoryFromApi(item.category,item.type),merchant:item.merchant,note:item.note,
  checks:Object.keys(fields).filter(key=>!item.understood[key]).map(key=>fields[key])};
}
async function parseDraft(text){
 const item=await api('/api/parse',{method:'POST',body:JSON.stringify({text})});
 return parseShapeToDraft(item,'文字解析');
}
async function receiptDraft(file){
 const body=new FormData();
 body.append('file',file,file.name||'receipt');
 const item=await api('/api/receipt',{method:'POST',body});
 return parseShapeToDraft(item,'小票识别');
}
async function parseEditor(mode){
 const e=editor;
 if(!e||e.busy||e.saving)return;
 if(mode==='text'){
  e.text=document.querySelector('#entry-text').value.trim();
  if(!e.text){e.note='请先输入一段记账内容。';drawEditor();return;}
 }else if(!receiptFile){e.note=e.imageError||'请先选择 PNG、JPEG 或 WebP 小票图片。';drawEditor();return;}
 const file=receiptFile;
 captureEditorDraft();e.busy=true;e.note=mode==='text'?'正在解析文字，请稍候…':'正在上传并识别小票，请稍候…';drawEditor();
 try{
  const draft=mode==='text'?await parseDraft(e.text):await receiptDraft(file);
  if(editor!==e||!dialog.open)return;
  e.draft=draft;
  e.note=(mode==='image'?'小票识别完成。':'草稿已生成。')+(draft.amount?'':'没认出金额，请手动补。')+(draft.checks.length?'请核对：'+draft.checks.join('、')+'。':'');
  e.visible=true;
 }catch(error){e.note=error.message;}
 finally{e.busy=false;if(editor===e&&dialog.open)drawEditor();}
}
function setReceipt(file){
 if(!editor)return;
 captureEditorDraft();releaseReceipt();
 editor.imageName='';editor.note='';editor.imageError='';editor.visible=false;editor.draft=editorDefaults();
 if(!file)return drawEditor();
 if(!receiptTypes.has(file.type)){
  editor.imageError='只支持 PNG、JPEG 或 WebP 图片。';drawEditor();return;
 }
 if(!file.size){
  editor.imageError='图片内容为空，请重新选择。';drawEditor();return;
 }
 if(file.size>MAX_RECEIPT_BYTES){
  editor.imageError='图片不能超过 5 MB，请换一张图。';drawEditor();return;
 }
 receiptFile=file;receiptUrl=URL.createObjectURL(file);editor.imageName=file.name;drawEditor();
}
async function recordSubmit(form){
 if(!editor||editor.busy||editor.saving)return;
 captureEditorDraft();
 const e=editor,d=e.draft;
 const item={amount:Math.round(Number(d.amount)*100),date:d.date,category:d.category,type:d.type,merchant:d.merchant.trim(),note:d.note.trim()};
 if(!validTransaction(item)){document.querySelector('#save-error').textContent='请检查金额、日期和分类。';return;}
 e.saving=true;drawEditor();
 try{
  const saved=fromApi(await api('/api/transactions',{method:'POST',body:JSON.stringify(toApi(item))}));
  if(editor===e)dialog.close();
  state.month=saved.date.slice(0,7);state.filters={category:'all',type:'all',query:''};state.justSaved=saved.id;
  state.page=e.origin==='home'?'home':'transactions';
  await refreshAfterWrite([state.month],'已保存 1 笔流水');
 }catch(error){
  e.saving=false;
  if(editor===e&&dialog.open){drawEditor();document.querySelector('#save-error').textContent=error.message;}
  else notify(error.message);
 }
}
function refreshAnswers(){
 const entries=[...state.messages];
 if(state.homeChat.mode==='query')entries.push(state.homeChat);
 for(const entry of entries){
  if(!entry.result||entry.result.kind==='failed'||entry.result.kind==='chat')continue;
  if(isBudgetQuestion(entry.question)){
   const month=entry.result.month||resolveMonth(entry.question,entry.month);
   entry.result=queryBudget(entry.question,month);
  }else entry.stale=true;
 }
}
function detail(id,confirming=false){
 const item=state.ledger.transactions.find(record=>record.id===id);
 if(!item)return;
 showDialog(confirming?'删除这笔流水？':'流水详情',`<div class="inline">${item.type==='income'?mark('income','#DFE6C1'):catMark(item.category)}<b>${escape(item.merchant||label(item.category))}</b></div>
 <div class="details-amount money ${item.type==='income'?'positive':''}">${item.type==='income'?'+':'−'}${rollingAmount('detail-'+item.id,item.amount)}</div>
 <div class="details-list micro"><div><span>日期</span><span>${escape(item.date)}</span></div><div><span>分类</span><span>${label(item.category)}</span></div>${item.note?`<div><span>备注</span><span>${escape(item.note)}</span></div>`:''}</div>
 ${confirming?'<p class="form-message">删除后，统计和预算进度也会更新。</p>':''}
 <div class="form-actions">${confirming?button('detail','返回','right','plain',`data-id="${escape(id)}"`):button('confirm-delete','删除','trash','secondary',`data-id="${escape(id)}"`)}
 ${confirming?button('delete','确认删除','trash','primary',`data-id="${escape(id)}"`):''}</div>`);
}
const deletingRecords=new Set();
async function deleteRecord(id){
 if(deletingRecords.has(id)||!/^\d+$/.test(id))return;
 const item=state.ledger.transactions.find(row=>row.id===id);
 if(!item)return;
 deletingRecords.add(id);
 try{
  await api('/api/transactions/'+Number(id),{method:'DELETE'});
  dialog.close();await refreshAfterWrite([item.date.slice(0,7)],'流水已删除');
 }catch(error){notify(error.message);}
 finally{deletingRecords.delete(id);}
}
function budgetEditor(category='all'){
 const existing=state.ledger.budgets.find(item=>item.month===state.month&&item.category===category);
 showDialog('设置月度预算',`<form id="budget-form"><p class="muted">${monthLabel(state.month)} · 使用达到 80% 时提示接近上限。</p><div class="field-grid">
 <label class="field-label">范围<select name="category" id="budget-category">${filterOptions([['all','月度总预算'],...Object.keys(categories).map(cat=>[cat,label(cat)])],category)}</select></label>
 <label class="field-label">限额（¥）<input type="number" min="0" max="9999999.99" step=".01" inputmode="decimal" name="amount" required value="${existing?(existing.amount/100).toFixed(2):''}"></label></div>
 <p class="form-message" id="budget-error" role="alert"></p><div class="form-actions">${button('close-dialog','取消','close','plain')}<button class="primary" type="submit">保存预算</button></div></form>`);
}
let savingBudget=false;
async function budgetSubmit(form){
 if(savingBudget)return;
 const data=new FormData(form),category=String(data.get('category'));
 const budget={month:state.month,category,amount:Math.round(Number(data.get('amount'))*100)};
 if(!validBudget(budget)){document.querySelector('#budget-error').textContent='请检查预算范围与金额。';return;}
 savingBudget=true;form.querySelector('button[type="submit"]').disabled=true;
 try{
  await api('/api/budget',{method:'PUT',body:JSON.stringify({...budget,category:category==='all'?'all':categories[category].label})});
  if(form.isConnected)dialog.close();
  await refreshAfterWrite([budget.month],'预算已保存');
 }catch(error){
  if(form.isConnected){form.querySelector('#budget-error').textContent=error.message;form.querySelector('button[type="submit"]').disabled=false;}
  else notify(error.message);
 }finally{savingBudget=false;}
}
function settings(){
 showDialog('账本设置',`<p class="muted">当前使用人民币（CNY）。流水和预算由服务器保存，刷新页面会重新读取。小票图片会上传到本服务并可能交由识别模型处理，确认前不会写入账本。</p><p class="form-message" id="settings-status" role="status"></p><div class="form-actions">${button('refresh-data','重新读取账本','next','secondary')}${button('close-dialog','关闭','close','plain')}</div>`);
}
const actions={
 add:()=>openEditor(),
 'focus-home-chat':el=>focusHomeChat(el.classList.contains('plus-button')),
 'home-example':()=>fillHomeChat('晚饭 28，地铁 4'),
 'home-ask-example':()=>fillHomeChat('这月餐饮花了多少？'),
 'home-receipt':()=>openEditor(null,'image'),
 'home-manual':()=>openEditor(null,'manual'),
 'home-edit-text':()=>{if(!state.homeChat.saving){state.homeChat.mode='input';renderHomeChat();focusHomeChat();}},
 'home-saved':()=>{const saved=state.homeChat.saved;state.month=saved.month;state.filters={category:'all',type:'all',query:'',ids:saved.ids};navigate('transactions');},
 'close-dialog':()=>dialog.close(),
 'open-budget':()=>navigate('budget'),
 'open-answer-budget':async el=>{if(await setMonth(el.dataset.month))navigate('budget');},
 'budget-edit':el=>budgetEditor(el.dataset.category),
 'shake-sticker':shakeSticker,
 settings:()=>settings(),
 'retry-load':boot,
 'refresh-data':async()=>{
  const status=document.querySelector('#settings-status');
  if(status)status.textContent='正在重新读取账本…';
  try{
   await refreshMonth(state.month);
   refreshAnswers();
   render();
   const count=ledgerFor(state.month).length;
   if(status)status.textContent='已重新读取 '+monthLabel(state.month)+'：'+count+' 笔流水。';
   notify('账本已刷新');
  }catch(error){
   if(status)status.textContent='重新读取失败：'+error.message;
   else notify('重新读取失败：'+error.message);
  }
 },
 'trend-month':async el=>{if(await setMonth(el.dataset.month))document.querySelector('.bar.highlight')?.focus({preventScroll:true});},
 'trend-mode':setTrendMode,
 'all-transactions':()=>openCategory('all',state.month,'all'),
 category:el=>openCategory(el.dataset.category),
 'answer-detail':el=>openCategory(el.dataset.category,el.dataset.month,el.dataset.type,el.dataset.start?[el.dataset.start,el.dataset.end]:undefined),
 'reset-filters':()=>{state.filters={category:'all',type:'all',query:''};render();document.querySelector('#search-field')?.focus();},
 detail:el=>detail(el.dataset.id),
 'confirm-delete':el=>detail(el.dataset.id,true),
 delete:el=>deleteRecord(el.dataset.id),
 'entry-tab':el=>switchEntry(el.dataset.mode),
 'sample-text':()=>{editor.text='今天午饭 25 元';document.querySelector('#entry-text').value=editor.text;document.querySelector('#entry-text').focus();},
 'parse-text':()=>parseEditor('text'),
 'parse-image':()=>parseEditor('image'),
 ask:el=>state.page==='home'?submitHomeChat(el.dataset.question):ask(el.dataset.question)
};
document.addEventListener('click',event=>{
 const el=event.target.closest('button[data-action],button[data-page]');
 if(!el||el.disabled)return;
 if(!state.ready&&el.dataset.action&&!['retry-load','settings','close-dialog'].includes(el.dataset.action))return;
 if(el.dataset.page)navigate(el.dataset.page);
 else actions[el.dataset.action]?.(el);
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.id==='period')setMonth(el.value).then(()=>document.querySelector('#period')?.focus());
 if(el.id==='category-filter'||el.id==='type-filter'){
  state.filters[el.id==='category-filter'?'category':'type']=el.value;
  document.querySelector('#results').innerHTML=transactionResults();
 }
 if(el.id==='receipt-file')setReceipt(el.files[0]);
 if(el.id==='budget-category'){
  const current=state.ledger.budgets.find(item=>item.month===state.month&&item.category===el.value);
  el.form.elements.amount.value=current?(current.amount/100).toFixed(2):'';
 }
});
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.id==='home-chat-text')state.homeChat.text=el.value;
 if(el.id==='entry-text'&&editor)editor.text=el.value;
 if(el.id==='search-field'){state.filters.query=el.value;document.querySelector('#results').innerHTML=transactionResults();}
});
document.addEventListener('submit',event=>{
 const form=event.target;
 if(['record-form','budget-form','chat-form','home-chat-form','home-draft-form'].includes(form.id))event.preventDefault();
 if(form.id==='home-chat-form')submitHomeChat(form.elements.message.value);
 if(form.id==='home-draft-form')saveHomeDraft(form);
 if(form.id==='record-form')recordSubmit(form);
 if(form.id==='budget-form')budgetSubmit(form);
 if(form.id==='chat-form')ask(form.elements.question.value);
});
const opensKeyboard='textarea,input:not([type="file"]):not([type="date"])';
document.addEventListener('focusin',event=>{
 if(event.target.matches(opensKeyboard))document.documentElement.dataset.composing='';
});
document.addEventListener('focusout',()=>{
 requestAnimationFrame(()=>{
  if(!document.activeElement?.matches(opensKeyboard))delete document.documentElement.dataset.composing;
 });
});
document.addEventListener('keydown', event=>{
 if(event.target.id!=='home-chat-text'||event.key!=='Enter'||event.shiftKey||event.isComposing||event.keyCode===229)return;
 event.preventDefault();
 event.target.form.requestSubmit();
});
dialog.addEventListener('close',()=>{if(!dialog.open){editor=null;releaseReceipt();if(trigger?.isConnected)trigger.focus();trigger=null;}});
window.addEventListener('hashchange',()=>{
 const page=location.hash.slice(1);
 if(Object.hasOwn(navItems,page))navigate(page);
});
document.querySelector('#brand').innerHTML='<span class="brandmark" aria-hidden="true"><canvas></canvas></span><span class="brand-word"><strong>Finora AI</strong></span>';
document.querySelector('#account-mark').innerHTML=icon('user',18);
document.querySelector('#settings-link').innerHTML=icon('settings')+'<span class="nav-text">设置</span>';
document.querySelector('#help').innerHTML=icon('user',19);

'use strict';

function homeAssistantHeading(){
 return `<div class="home-assistant-head">
  ${mark('chat')}
  <h2 id="home-assistant-title">AI 记账助手</h2>
 </div>`;
}
function homeChatContent(){
 const chat=state.homeChat;
 if(chat.mode==='draft')return homeDraftCard(chat);
 const busy=chat.mode==='thinking';
 const query=chat.mode==='query'?`<div class="home-chat-reply" tabindex="-1" aria-live="polite">
  <p class="home-chat-question">${escape(chat.question)}</p>
  ${answerCard(chat)}
 </div>`:'';
 const chatAnswer=chat.mode==='chat'?`<div class="home-chat-reply" tabindex="-1" aria-live="polite">
  <p class="home-chat-question">${escape(chat.question)}</p>
  <section class="answer"><p>${escape(chat.reply)}</p></section>
 </div>`:'';
 const saved=chat.mode==='saved'?homeSavedCard(chat.saved):'';
 return `${query}${chatAnswer}${saved}
  <form id="home-chat-form" class="home-chat-composer" aria-busy="${busy}">
   <textarea id="home-chat-text" name="message" rows="2" maxlength="240" aria-label="用一句话记账或查账，仅支持账本相关" placeholder="只支持记账/查账/小票识别，例如「午饭 25」" required ${busy?'readonly':''}>${escape(chat.text)}</textarea>
   <button class="home-chat-send" type="submit" aria-label="发送" ${busy?'disabled':''}>${icon('income',22)}</button>
   <div class="home-chat-tools">
    ${thinkingIcon(busy)}
    ${button('home-receipt','添加小票','clip','home-tool')}
    ${button('home-manual','手动记账','edit','home-tool')}
   </div>
  </form>
  ${busy?'<p class="micro chat-processing" role="status">正在处理账单…</p>':''}
  <div class="home-chat-examples">
   ${button('home-example','晚饭 28，地铁 4','add','home-example')}
   ${button('home-ask-example','这月餐饮花了多少？','search','home-example')}
  </div>`;
}

function homeDraftCard(chat){
 const drafts=chat.drafts.map((item,index)=>`<fieldset class="home-draft-row" ${chat.saving?'disabled':''}>
  <legend>第 ${(chat.completed||0)+index+1} 笔</legend>${item.checks?.length?`<p class="micro">请核对：${escape(item.checks.join('、'))}。</p>`:''}
  <label>名称<input name="merchant" maxlength="70" value="${escape(item.merchant)}" placeholder="选填"></label>
  <label>金额（¥）<input name="amount" type="number" inputmode="decimal" required step=".01" min=".01" max="9999999.99" value="${escape(item.amount)}"></label>
  <label>收支<select name="type">${filterOptions([['expense','支出'],['income','收入']],item.type)}</select></label>
  <label>分类<select name="category" required>${optionsForCategories(item.category,'请选择')}</select></label>
  <label>日期<input name="date" type="date" required min="2000-01-01" max="2100-12-31" value="${escape(item.date)}"></label>
 </fieldset>`).join('');
 return `<form id="home-draft-form" class="home-chat-draft">
  <h3 id="home-draft-title" tabindex="-1">核对 ${chat.drafts.length} 笔草稿</h3>
  <p class="home-chat-question">${escape(chat.text)}</p>
  ${chat.drafts.some(item=>!item.amount||!item.category)?'<p class="micro">请补全未识别的金额或分类。</p>':''}
  ${drafts}
  <p id="home-draft-error" class="form-message" role="alert">${escape(chat.error||'')}</p>
  <div class="home-chat-toolbar">
   <button class="plain" type="button" data-action="home-edit-text" ${chat.saving?'disabled':''}>返回修改原句</button>
   <button class="primary" type="submit" ${chat.saving?'disabled':''}>${icon('check',16)} ${chat.saving?'正在保存…':'确认记入 '+chat.drafts.length+' 笔'}</button>
  </div>
 </form>`;
}

function homeSavedCard(saved){
 const changes=saved.changes.map(({category,month,previous,current})=>{
  const name=category==='all'?'总预算':label(category)+'预算';
  const scope=month===thisMonth()?'本月':monthLabel(month);
  const impact=current.remaining<0?'已超出 '+money(-current.remaining):'还剩 '+money(current.remaining);
  const basis='已用 '+money(previous.spent)+' → '+money(current.spent)+' / '+money(current.budget.amount);
  return `<div class="home-budget-change"><strong class="${current.remaining<0?'danger':''}">${scope}${name}${impact}</strong><small>${basis}</small></div>`;
 }).join('');
 return `<section class="home-chat-saved" aria-label="保存结果">
  <h3>${icon('check',17)} 已记入 ${saved.ids.length} 笔</h3>
  ${saved.refreshError?`<p class="micro">已写入服务器，重新读取失败：${escape(saved.refreshError)}</p>${button('refresh-data','重新读取','next','plain')}`:''}
  ${changes||'<p class="micro">这次记账没有改变已设置的支出预算。</p>'}
  ${button('home-saved','查看这 '+saved.ids.length+' 笔流水','next','plain')}
 </section>`;
}

function renderHomeChat(){
 const content=document.querySelector('#home-chat-content');
 if(content){
  content.innerHTML=homeChatContent();
  syncRollingAmounts(content);
  syncThinkingIcons(content);
 }
}

let homeComposerShake;
function focusHomeChat(shake=false){
 const input=document.querySelector('#home-chat-text, #home-draft-form input[name="merchant"]');
 input?.focus({preventScroll:true});
 input?.scrollIntoView({block:'nearest'});
 if(!input||!shake||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 homeComposerShake?.cancel();
 homeComposerShake=input.form.animate([
  {translate:'0 0'},
  {translate:'-4px 0',offset:.18},
  {translate:'4px 0',offset:.36},
  {translate:'-3px 0',offset:.55},
  {translate:'2px 0',offset:.74},
  {translate:'0 0'}
 ],{duration:360,easing:'ease-out'});
}

function fillHomeChat(message){
 const input=document.querySelector('#home-chat-text');
 if(!input||state.homeChat.mode==='thinking')return;
 state.homeChat.text=message;
 input.value=message;
 focusHomeChat();
}

async function submitHomeChat(message){
 const clean=message.trim();
 if(!clean||state.homeChat.mode==='thinking'||state.homeChat.saving)return;
 const request={text:clean,mode:'thinking',month:state.month};
 state.homeChat=request;renderHomeChat();
 try{
  const result=await resolveHomeChat(request);
  if(state.homeChat===request)state.homeChat=result;
 }catch(error){
  if(state.homeChat===request)state.homeChat={...request,mode:'query',question:clean,result:{kind:'failed',text:error.message}};
 }finally{
  if(state.page==='home'){
   renderHomeChat();
   if(!dialog.open)document.querySelector('.home-chat-reply, #home-draft-title')?.focus();
  }
 }
}
async function resolveHomeChat({text:clean,month}){
 const intent=classifyChatInput(clean);
 if(intent==='query')return {text:'',mode:'query',question:clean,month,result:await requestAnswer(clean,month)};
 if(intent==='chat')return {text:clean,mode:'chat',question:clean,reply:chatReply(clean)};
 const drafts=[];
 for(const part of clean.split(/[，,、；;\n]+/).map(value=>value.trim()).filter(Boolean))drafts.push(await parseDraft(part));
 return drafts.length?{text:clean,mode:'draft',drafts,completed:0,savedIds:[]}:{text:clean,mode:'chat',question:clean,reply:chatReply(clean)};
}
async function saveHomeDraft(form){
 const chat=state.homeChat;
 if(chat.mode!=='draft'||chat.saving)return;
 const fields=Array.from(form.querySelectorAll('fieldset'));
 const items=fields.map((row,index)=>{
  const field=name=>row.querySelector('[name="'+name+'"]').value;
  return {amount:Math.round(Number(field('amount'))*100),category:field('category'),type:field('type'),date:field('date'),merchant:field('merchant').trim(),note:chat.drafts[index].note};
 });
 if(!items.length||items.some(item=>!validTransaction(item))){document.querySelector('#home-draft-error').textContent='请检查每笔的金额、日期和分类。';return;}
 chat.drafts=items.map((item,index)=>({...chat.drafts[index],...item,amount:(item.amount/100).toFixed(2)}));
 chat.saving=true;chat.error='';renderHomeChat();
 const saved=[],before=new Map();
 for(const item of items.filter(item=>item.type==='expense')){
  const month=item.date.slice(0,7);
  for(const category of ['all',item.category]){
   const previous=budgetUsage(category,month);
   if(previous)before.set(month+category,{month,category,previous});
  }
 }
 let failure='';
 for(const item of items){
  try{saved.push(fromApi(await api('/api/transactions',{method:'POST',body:JSON.stringify(toApi(item))})));}
  catch(error){failure=error.message;break;}
 }
 const failedPosition=chat.completed+saved.length+1;
 chat.completed+=saved.length;chat.savedIds.push(...saved.map(item=>item.id));
 let refreshError='';
 if(saved.length){
  try{
   for(const month of new Set(saved.map(item=>item.date.slice(0,7))))await refreshMonth(month);
   refreshAnswers();
  }catch(error){refreshError=error.message;}
 }
 chat.saving=false;
 if(failure){
  chat.drafts=chat.drafts.slice(saved.length);
  chat.error='已保存 '+chat.completed+' 笔，第 '+failedPosition+' 笔失败，剩余 '+chat.drafts.length+' 笔未保存：'+failure+(refreshError?'；重新读取失败：'+refreshError:'');
  renderHomeChat();notify(chat.error);return;
 }
 const changes=[...before.values()].map(item=>({...item,current:budgetUsage(item.category,item.month)})).filter(item=>item.current);
 state.homeChat={text:'',mode:'saved',saved:{ids:chat.savedIds,changes,month:items[0].date.slice(0,7),refreshError}};
 state.month=items[0].date.slice(0,7);state.filters={category:'all',type:'all',query:''};
 state.justSaved=chat.savedIds[0];render();
 notify('已保存 '+chat.completed+' 笔流水'+(refreshError?'；重新读取失败：'+refreshError:''));
}

const amountMotion = matchMedia('(prefers-reduced-motion: reduce)');
const displayedAmounts = new Map();
const runningAmounts = new Map();
const amountRollDuration = 3000;
const amountObserver = new IntersectionObserver(entries => {
 for (const entry of entries) {
  const roll = runningAmounts.get(entry.target);
  if (entry.isIntersecting && roll) {
   amountObserver.unobserve(entry.target);
   startAmountRoll(entry.target, roll);
  }
 }
});

function clearAmountRoll(element, roll) {
 amountObserver.unobserve(element);
 cancelAnimationFrame(roll.frame);
 roll.motion?.cancel();
 runningAmounts.delete(element);
 element.removeAttribute('data-rolling');
 element.style.removeProperty('min-inline-size');
 roll.label.textContent = '';
}

function startAmountRoll(element, roll) {
 // The underlying amount stays readable and exact while the visual copy counts.
 const { key, from, to, label, unit } = roll;
 const direction = Math.sign(to - from);
 roll.motion = label.animate([
  { transform: `translateY(${direction * .19}em)`, opacity: .7 },
  { transform: 'translateY(0)', opacity: 1 }
 ], { duration: amountRollDuration, easing: 'cubic-bezier(.22,.8,.3,1)' });
 const started = performance.now();
 function next(now) {
  const progress = Math.min(1, Math.max(0, (now - started) / amountRollDuration));
  if (progress === 1) {
   displayedAmounts.set(key, to);
   clearAmountRoll(element, roll);
   return;
  }
  const eased = 1 - (1 - progress) ** 3;
  const value = Math.round(from * (1 - eased) + to * eased);
  displayedAmounts.set(key, value);
  label.textContent = unit + format.format(value / 100);
  roll.frame = requestAnimationFrame(next);
 }
 roll.frame = requestAnimationFrame(next);
}

function syncRollingAmounts(scope) {
 for (const [element, roll] of runningAmounts) {
  if (!element.isConnected) clearAmountRoll(element, roll);
 }
 for (const element of scope.querySelectorAll('[data-amount-key]')) {
  const key = element.dataset.amountKey;
  const to = Number(element.dataset.amountValue);
  const from = displayedAmounts.get(key) ?? 0;
  if (from === to || amountMotion.matches) {
   displayedAmounts.set(key, to);
   continue;
  }
  const label = element.querySelector('.amount-roll-live');
  const unit = element.dataset.amountUnit;
  const roll = { key, from, to, label, unit, frame: 0 };
  runningAmounts.set(element, roll);
  label.textContent = unit + format.format(from / 100);
  element.toggleAttribute('data-rolling', true);
  if (label.scrollWidth > element.clientWidth) {
   element.style.minInlineSize = label.scrollWidth + 'px';
  }
  amountObserver.observe(element);
 }
}

amountMotion.addEventListener('change', () => {
 if (!amountMotion.matches) return;
 for (const [element, roll] of runningAmounts) {
  displayedAmounts.set(roll.key, roll.to);
  clearAmountRoll(element, roll);
 }
});

const syncThinkingIcons = (() => {
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const marks = new Map();
  const playing = new Set();
  let frame = 0;

  const center = [752, 564];
  const artSize = 622;
  const sides = [
    {
      angle: 0,
      polygons: [
        [[581,299],[735,299],[755,335],[601,336]],
        [[657,365],[810,365],[830,401],[676,401]],
        [[732,430],[886,430],[905,466],[752,467]],
        [[807,495],[999,496],[1018,532],[827,532]]
      ]
    },
    {
      angle: 2 * Math.PI / 3,
      polygons: [
        [[968,565],[1009,565],[932,700],[891,699]],
        [[873,598],[914,598],[837,732],[796,732]],
        [[779,630],[820,630],[743,764],[702,764]],
        [[684,663],[725,663],[630,830],[589,829]]
      ]
    },
    {
      angle: -2 * Math.PI / 3,
      polygons: [
        [[507,635],[585,769],[564,803],[486,669]],
        [[526,537],[605,670],[584,704],[505,572]],
        [[545,439],[624,572],[603,607],[524,474]],
        [[546,308],[643,474],[621,509],[525,344]]
      ]
    }
  ];

  function midpoint(points) {
    return [
      points.reduce((sum, point) => sum + point[0], 0) / points.length,
      points.reduce((sum, point) => sum + point[1], 0) / points.length
    ];
  }

  function toward(point, neighbor) {
    const dx = neighbor[0] - point[0];
    const dy = neighbor[1] - point[1];
    const ratio = Math.min(.25, 4 / Math.hypot(dx, dy));
    return [point[0] + dx * ratio, point[1] + dy * ratio];
  }

  function roundPolygon(points) {
    const path = new Path2D();
    path.moveTo(...toward(points.at(-1), points[0]));
    points.forEach((point, i) => {
      path.lineTo(...toward(point, points[(i + points.length - 1) % points.length]));
      path.quadraticCurveTo(...point, ...toward(point, points[(i + 1) % points.length]));
    });
    path.closePath();
    return path;
  }

  const geometry = sides.map(({ angle, polygons }) => {
    const stripes = polygons.map(points => ({ at: midpoint(points), path: roundPolygon(points) }));
    return {
      angle, stripes,
      at: midpoint(stripes.map(stripe => stripe.at)),
      dx: Math.cos(angle),
      dy: Math.sin(angle)
    };
  });

  const period = 2850;
  const wrap = (value, period) => (value % period + period) % period;
  const distanceOnLoop = (position, target) => wrap(position - target + 6, 12) - 6;
  const ease = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * t * (t * (6 * t - 15) + 10);
  };
  function envelope(distance, width) {
    return ease(1 - Math.abs(distance) / width);
  }
  function sideMotion(progress, sideIndex) {
    if (progress === null) {
      return { scale: 1, forward: 0, outward: 0, turn: 0, bars: Array(4).fill({ forward: 0, outward: 0, length: 1, thickness: 1, tint: 0 }) };
    }

    const front = progress * 12;
    const phase = distanceOnLoop(front, sideIndex * 4 + 1.5);
    const lift = ease((2.55 - Math.abs(phase)) / 1.10);
    const bars = Array.from({length:4}, (_, i) => {
      const distance = distanceOnLoop(front, sideIndex * 4 + i);
      const weight = envelope(distance, 1.95);
      const emphasis = envelope(distance, 1.15);
      return {
        forward: 13 * weight, outward: 3 * weight,
        length: 1 + .16 * emphasis, thickness: 1 + .30 * emphasis,
        tint: .56 * weight
      };
    });
    return { scale: 1 + .06 * lift, forward: 0, outward: 3 * lift, turn: .012 * lift, bars };
  }

  function readColor(style, property) {
    return style.getPropertyValue(property).trim().slice(1).match(/../g).map(pair => parseInt(pair, 16));
  }

  function paint(state, progress = null) {
    const { canvas, ctx, idle, accent } = state;
    const scale = canvas.width / artSize;
    ctx.setTransform(scale, 0, 0, scale, canvas.width / 2 - center[0] * scale, canvas.height / 2 - center[1] * scale);
    ctx.clearRect(center[0] - artSize / 2, center[1] - artSize / 2, artSize, artSize);
    geometry.forEach(({ angle, at, stripes, dx, dy }, sideIndex) => {
      const side = sideMotion(progress, sideIndex);
      ctx.save();
      ctx.translate(at[0] + dx * side.forward + dy * side.outward, at[1] + dy * side.forward - dx * side.outward);
      ctx.rotate(side.turn);
      ctx.scale(side.scale, side.scale);
      ctx.translate(-at[0], -at[1]);
      stripes.forEach(({ at: [x, y], path }, i) => {
        const { forward, outward, length, thickness, tint } = side.bars[i];
        ctx.save();
        ctx.translate(x + dx * forward + dy * outward, y + dy * forward - dx * outward);
        ctx.rotate(angle);
        ctx.scale(length, thickness);
        ctx.rotate(-angle);
        ctx.translate(-x, -y);
        const color = idle.map((value, index) => Math.round(value + (accent[index] - value) * tint));
        ctx.fillStyle = `rgb(${color.join(' ')})`;
        ctx.fill(path);
        ctx.restore();
      });
      ctx.restore();
    });
  }

  function requestFrame() {
    if (!frame && playing.size && !document.hidden) frame = requestAnimationFrame(animate);
  }

  function animate(now) {
    frame = 0;
    for (const state of playing) {
      state.started ??= now;
      paint(state, ((now - state.started) % period) / period);
    }
    requestFrame();
  }

  function updatePlayback(state) {
    const active = !motionPreference.matches && (state.near || state.element.hasAttribute('data-thinking'));
    if (active === playing.has(state)) return;
    state.element.toggleAttribute('data-playing', active);
    if (active) {
      playing.add(state);
      requestFrame();
    } else {
      playing.delete(state);
      state.started = null;
      paint(state);
    }
  }

  motionPreference.addEventListener('change', () => marks.forEach(updatePlayback));
  document.addEventListener('visibilitychange', requestFrame);

  return function sync(scope) {
    for (const [element, state] of marks) {
      if (element.isConnected) continue;
      playing.delete(state);
      marks.delete(element);
    }
    for (const element of scope.querySelectorAll('.thinking-mark, .brandmark')) {
      if (marks.has(element)) continue;
      const canvas = element.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      const style = getComputedStyle(element);
      const state = {
        element, canvas, ctx, near: false, started: null,
        idle: readColor(style, '--thinking-idle'),
        accent: readColor(style, '--thinking-accent')
      };
      canvas.width = canvas.height = Math.min(devicePixelRatio || 1, 3) * canvas.clientWidth;
      paint(state);
      const form = element.closest('form');
      if (!form) continue;
      marks.set(element, state);
      updatePlayback(state);
      form.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        const box = element.getBoundingClientRect();
        const dx = Math.max(box.left - event.clientX, 0, event.clientX - box.right);
        const dy = Math.max(box.top - event.clientY, 0, event.clientY - box.bottom);
        state.near = Math.hypot(dx, dy) <= 10;
        updatePlayback(state);
      }, { passive: true });
      form.addEventListener('pointerleave', () => {
        state.near = false;
        updatePlayback(state);
      });
    }
  };
})();

syncThinkingIcons(document.querySelector('#brand'));
if(Object.hasOwn(navItems,location.hash.slice(1)))state.page=location.hash.slice(1);
boot();

(() => {
 const cursor = document.getElementById('finora-pointer');
 const root = document.documentElement;
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const cursorRange = 20;
 const magneticCards = '.stat, .home-budget-card, .caps-card, .budget-card';
 const magneticStickers = '.budget-sticker[data-sticker-magnet]';
 const readTargets = () => view.querySelectorAll(`.card, ${magneticStickers}`);
 const cardMagnet = { range: 44, maxShift: 8 };
 const stickerMagnet = { range: 26, maxShift: 8 };
 let targets = readTargets();
 let point = null;
 let frame = 0;
 let activeMagnet = null;

 function setMagnet(element, offset = '') {
  if (activeMagnet !== element) {
   activeMagnet?.removeAttribute('data-magnetized');
   activeMagnet?.style.removeProperty('--magnet-offset');
   activeMagnet = element;
  }
  if (element) {
   element.style.setProperty('--magnet-offset', offset);
   element.toggleAttribute('data-magnetized', true);
  }
 }

 function hidePointer() {
  point = null;
  root.removeAttribute('data-finora-pointer');
  cursor.removeAttribute('data-near-card');
  setMagnet(null);
 }

 function drawPointer() {
  frame = 0;
  if (!point) return;
  const { x, y, buttons } = point;
  const target = document.elementFromPoint(x, y);
  if (!target) {
   hidePointer();
   return;
  }
  let nearestCardDistance = Infinity;
  let closest = null;
  let closestDistance = Infinity;
  let closestCenterDistance = Infinity;
  let pullX = 0;
  let pullY = 0;
  if (!dialog.open && !target.closest('.sidebar, .topbar, .bottom-nav')) {
   for (const element of targets) {
    const bounds = element.getBoundingClientRect();
    // Measure from the resting position, including during the return transition.
    const [shiftX = 0, shiftY = 0] = getComputedStyle(element).translate.split(' ').map(parseFloat);
    const restX = bounds.left - (shiftX || 0);
    const restY = bounds.top - (shiftY || 0);
    const dx = Math.max(restX - x, 0, x - restX - bounds.width);
    const dy = Math.max(restY - y, 0, y - restY - bounds.height);
    const distance = Math.hypot(dx, dy);
    if (element.matches('.card')) nearestCardDistance = Math.min(nearestCardDistance, distance);
    const centerX = x - restX - bounds.width / 2;
    const centerY = y - restY - bounds.height / 2;
    const centerDistance = Math.hypot(centerX, centerY);
    if (distance > closestDistance || (distance === closestDistance && centerDistance >= closestCenterDistance)) continue;
    closest = element;
    closestDistance = distance;
    closestCenterDistance = centerDistance;
    pullX = centerX;
    pullY = centerY;
   }
  }
  const magnet = closest?.matches(magneticStickers) ? stickerMagnet
   : closest?.matches(magneticCards) ? cardMagnet : null;
  if (!magnet || closestDistance >= magnet.range || reducedMotion.matches) {
   setMagnet(null);
  } else if (!buttons) {
   const { range, maxShift } = magnet;
   const strength = maxShift * (1 - closestDistance / range);
   const direction = Math.max(closestCenterDistance, range);
   const shiftX = (strength * pullX / direction).toFixed(2);
   const shiftY = (strength * pullY / direction).toFixed(2);
   setMagnet(closest, `${shiftX}px ${shiftY}px`);
  }
  cursor.style.setProperty('--pointer-x', `${x}px`);
  cursor.style.setProperty('--pointer-y', `${y}px`);
  cursor.toggleAttribute('data-near-card', nearestCardDistance <= cursorRange);
  root.toggleAttribute('data-finora-pointer', true);
 }

 function schedulePointer() {
  if (point && !frame) frame = requestAnimationFrame(drawPointer);
 }

 function trackPointer(event) {
  if (event.pointerType !== 'mouse') return;
  point = { x: event.clientX, y: event.clientY, buttons: event.buttons };
  schedulePointer();
 }

 document.addEventListener('pointermove', trackPointer, { passive: true });
 document.addEventListener('pointerup', trackPointer, { passive: true });
 document.addEventListener('pointerdown', event => {
  trackPointer(event);
  if (event.pointerType !== 'mouse') hidePointer();
 }, { passive: true });
 root.addEventListener('pointerleave', hidePointer);
 document.addEventListener('pointercancel', hidePointer);
 window.addEventListener('blur', hidePointer);
 window.addEventListener('scroll', schedulePointer, { capture: true, passive: true });
 window.addEventListener('resize', schedulePointer);
 reducedMotion.addEventListener('change', schedulePointer);

 const observer = new MutationObserver(entries => {
  if (entries.some(entry => entry.target === view)) targets = readTargets();
  schedulePointer();
 });
 observer.observe(view, { childList: true });
 observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
})();

(() => {
  const root = document.getElementById('finora-mascot-eye-glint');
  const stage = root.closest('.side-bottom');
  const mascot = root.querySelector('.finora-mascot');
  const art = root.querySelector('.finora-art');
  const eyelids = [...root.querySelectorAll('.finora-lid')];
  const glints = [...root.querySelectorAll('.finora-highlight')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const aim = { x: 0, y: 0 };
  const gaze = { x: 0, y: 0 };
  let frame = 0;
  let previousTime = 0;
  let returnTimer = 0;
  let blinkTimer = 0;
  let blinkAnimations = [];
  let bounceAnimation;
  let inView = true;

  function drawGaze() {
    art.style.setProperty('--look-x', `${gaze.x * 4.8}%`);
    art.style.setProperty('--look-y', `${gaze.y * (gaze.y > 0 ? 1.85 : 3.25)}%`);
    art.style.setProperty('--look-turn', `${gaze.x * 8}deg`);
    // The glint's percentages are relative to the dot itself, not the icon.
    art.style.setProperty('--glint-x', `${gaze.x * 38}%`);
    art.style.setProperty('--glint-y', `${gaze.y * 32}%`);
  }

  function smoothGaze(time) {
    const elapsed = previousTime ? time - previousTime : 16;
    const easing = 1 - Math.exp(-elapsed / 49);
    gaze.x += (aim.x - gaze.x) * easing;
    gaze.y += (aim.y - gaze.y) * easing;
    const settled = Math.hypot(aim.x - gaze.x, aim.y - gaze.y) < .003;
    if (settled) Object.assign(gaze, aim);
    drawGaze();
    previousTime = settled ? 0 : time;
    frame = settled ? 0 : requestAnimationFrame(smoothGaze);
  }

  function setAim(x, y) {
    if (reduceMotion.matches) return;
    const length = Math.max(1, Math.hypot(x, y));
    aim.x = x / length;
    aim.y = y / length;
    if (!frame) frame = requestAnimationFrame(smoothGaze);
  }

  function lookAtPointer(event) {
    if (event.pointerType === 'touch' && event.type === 'pointermove') return;
    clearTimeout(returnTimer);
    const box = mascot.getBoundingClientRect();
    if (!box.width) return;
    const faceX = box.left + box.width * .503;
    const faceY = box.top + box.height * .368;
    setAim((event.clientX - faceX) / (box.width * .48), (event.clientY - faceY) / (box.height * .45));
    if (event.pointerType === 'touch') returnTimer = setTimeout(returnToCenter, 550);
  }

  function returnToCenter() {
    clearTimeout(returnTimer);
    setAim(0, 0);
  }

  function blink() {
    if (reduceMotion.matches || document.hidden || !inView) return;
    blinkAnimations.forEach(animation => animation.cancel());
    const timing = { duration: 175, easing: 'ease-in-out' };
    blinkAnimations = [
      ...eyelids.map(lid => lid.animate([
        { transform: 'scaleY(1)', offset: 0 },
        { transform: 'scaleY(.075)', offset: .44, easing: 'ease-out' },
        { transform: 'scaleY(.075)', offset: .54 },
        { transform: 'scaleY(1)', offset: 1 }
      ], timing)),
      ...glints.map(glint => glint.animate([
        { opacity: 1, offset: 0 },
        { opacity: 0, offset: .38 },
        { opacity: 0, offset: .66 },
        { opacity: 1, offset: 1 }
      ], timing))
    ];
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    if (reduceMotion.matches || document.hidden || !inView) return;
    blinkTimer = setTimeout(() => {
      blink();
      scheduleBlink();
    }, 4200 + Math.random() * 2200);
  }

  stage.addEventListener('pointermove', lookAtPointer, { passive: true });
  stage.addEventListener('pointerdown', lookAtPointer, { passive: true });
  stage.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') returnToCenter();
  });
  stage.addEventListener('pointercancel', returnToCenter);

  mascot.addEventListener('click', () => {
    if (reduceMotion.matches) return;
    blink();
    scheduleBlink();
    bounceAnimation?.cancel();
    bounceAnimation = art.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(0) scale(1.025, .965)', offset: .18 },
      { transform: 'translateY(-3.5%) rotate(-2deg) scale(.99, 1.025)', offset: .5 },
      { transform: 'translateY(0) scale(1.015, .985)', offset: .77 },
      { transform: 'translateY(0) scale(1)' }
    ], { duration: 385, easing: 'cubic-bezier(.24,.6,.31,.97)' });
  });

  function updatePreferences() {
    if (reduceMotion.matches) {
      cancelAnimationFrame(frame);
      clearTimeout(returnTimer);
      frame = 0;
      previousTime = 0;
      aim.x = aim.y = gaze.x = gaze.y = 0;
      drawGaze();
      blinkAnimations.forEach(animation => animation.cancel());
      bounceAnimation?.cancel();
    }
    scheduleBlink();
  }

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    scheduleBlink();
  });
  observer.observe(mascot);
  document.addEventListener('visibilitychange', scheduleBlink);
  reduceMotion.addEventListener('change', updatePreferences);
  updatePreferences();
})();
