const KEY='kanban_tasks';
const COLS=['todo','doing','done'];
const PRIO={baixa:'Baixa',media:'Média',alta:'Alta'};
const $=s=>document.querySelector(s);
const root=document.documentElement;
let tasks=[],query='',editingId=null,toastTimer;

try{
  const raw=localStorage.getItem(KEY);
  tasks=raw?JSON.parse(raw):[];
  if(raw===null)tasks=[
    {id:'t1',title:'Montar layout do projeto',desc:'Estrutura base em HTML e CSS',priority:'alta',status:'done'},
    {id:'t2',title:'Estudar JavaScript',desc:'Ler o capítulo 3 do livro',priority:'media',status:'doing'},
    {id:'t3',title:'Arrastar este card',desc:'Mude de coluna com o mouse ou com os botões',priority:'baixa',status:'todo'}
  ];
}catch(e){tasks=[]}
if(!Array.isArray(tasks))tasks=[];

try{const t=localStorage.getItem('kanban_theme');if(t)root.dataset.theme=t}catch(e){}
$('#themeBtn').onclick=()=>{
  const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  const next=dark?'light':'dark';root.dataset.theme=next;
  try{localStorage.setItem('kanban_theme',next)}catch(e){}
};

function save(){try{localStorage.setItem(KEY,JSON.stringify(tasks))}catch(e){}render()}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
const match=t=>(t.title+' '+(t.desc||'')).toLowerCase().includes(query);

function render(){
  COLS.forEach(s=>{
    const list=$('#'+s+'-list');list.replaceChildren();
    const items=tasks.filter(t=>t.status===s&&match(t));
    $('#'+s+'-count').textContent=tasks.filter(t=>t.status===s).length;
    if(!items.length)list.append(el('div','empty',query?'Nenhuma tarefa encontrada':'Arraste tarefas para cá'));
    items.forEach(t=>list.append(card(t)));
  });
  const total=tasks.length,done=tasks.filter(t=>t.status==='done').length,pct=total?Math.round(done/total*100):0;
  $('#pct').textContent=pct+'%';$('#bar').style.width=pct+'%';
  $('#sum').textContent=total?`${done} de ${total} tarefas concluídas`:'Nenhuma tarefa ainda. Crie a primeira.';
}

function card(t){
  const c=el('article','card p-'+t.priority);c.draggable=true;
  c.append(el('h3',null,t.title));
  if(t.desc)c.append(el('p',null,t.desc));
  const i=COLS.indexOf(t.status);
  const btn=(label,title,fn,off)=>{const b=el('button',null,label);b.title=title;b.setAttribute('aria-label',title);b.disabled=!!off;b.onclick=fn;return b};
  const acts=el('div','acts');
  acts.append(
    btn('◀','Mover para a coluna anterior',()=>move(t.id,COLS[i-1]),i===0),
    btn('▶','Mover para a próxima coluna',()=>move(t.id,COLS[i+1]),i===2),
    btn('✎','Editar tarefa',()=>openModal(t.id)),
    btn('✕','Excluir tarefa',()=>del(t.id))
  );
  const foot=el('div','foot');foot.append(el('span','tag',PRIO[t.priority]||'Baixa'),acts);
  c.append(foot);
  c.ondragstart=e=>{e.dataTransfer.setData('text/plain',t.id);e.dataTransfer.effectAllowed='move';c.classList.add('dragging')};
  c.ondragend=()=>c.classList.remove('dragging');
  return c;
}

function move(id,status){
  const t=tasks.find(x=>x.id===id);if(!t||!status||t.status===status)return;
  t.status=status;tasks=tasks.filter(x=>x!==t);tasks.push(t);save();
}

document.querySelectorAll('.column').forEach(col=>{
  col.ondragover=e=>{e.preventDefault();col.classList.add('over')};
  col.ondragleave=e=>{if(!col.contains(e.relatedTarget))col.classList.remove('over')};
  col.ondrop=e=>{e.preventDefault();col.classList.remove('over');move(e.dataTransfer.getData('text/plain'),col.dataset.status)};
});

function toast(msg,label,fn){
  const t=$('#toast');t.replaceChildren(el('span',null,msg));
  if(fn){const b=el('button',null,label);b.onclick=()=>{fn();t.classList.remove('show')};t.append(b)}
  t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),5000);
}

function del(id){
  const idx=tasks.findIndex(t=>t.id===id);if(idx<0)return;
  const [removed]=tasks.splice(idx,1);save();
  toast('Tarefa excluída','Desfazer',()=>{tasks.splice(idx,0,removed);save()});
}

const dlg=$('#dlg');
function openModal(id){
  editingId=id||null;const t=tasks.find(x=>x.id===id);
  $('#dlgTitle').textContent=t?'Editar tarefa':'Nova tarefa';
  $('#taskTitle').value=t?t.title:'';$('#taskDesc').value=t?(t.desc||''):'';$('#taskPriority').value=t?t.priority:'media';
  dlg.showModal();$('#taskTitle').focus();
}
$('#newBtn').onclick=()=>openModal();
$('#cancelBtn').onclick=()=>dlg.close();
dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
$('#taskForm').onsubmit=e=>{
  e.preventDefault();
  const title=$('#taskTitle').value.trim();if(!title)return;
  const data={title,desc:$('#taskDesc').value.trim(),priority:$('#taskPriority').value};
  if(editingId)Object.assign(tasks.find(x=>x.id===editingId),data);
  else tasks.push({id:'task-'+Date.now(),status:'todo',...data});
  dlg.close();save();
};
$('#search').oninput=e=>{query=e.target.value.trim().toLowerCase();render()};

render();
