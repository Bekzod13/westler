<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Westler Admin</title>
<link rel="stylesheet" href="/css/admin.css">
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
</head>
<body x-data="adminApp()" x-init="init()">
<div class="layout">
<!-- Sidebar -->
<aside class="sidebar">
<nav>
<a href="#" class="nav-item" :class="{active:page==='dashboard'}" @click.prevent="go('dashboard')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
Dashboards
</a>
<a href="#" class="nav-item" :class="{active:page==='banners'}" @click.prevent="go('banners')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
Баннеры
</a>
<a href="#" class="nav-item" :class="{active:page==='companies'}" @click.prevent="go('companies')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
Компании
</a>
<a href="#" class="nav-item" :class="{active:page==='services'}" @click.prevent="go('services')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
Услуги
</a>
<a href="#" class="nav-item" :class="{active:page==='partners'}" @click.prevent="go('partners')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
Партнёры
</a>
<a href="#" class="nav-item" :class="{active:page==='groups'}" @click.prevent="go('groups')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
Группы
</a>

<div class="sep">
<p class="sep-label">Настройки сайта</p>
<a href="#" class="nav-item" :class="{active:page==='languages'}" @click.prevent="go('languages')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
Языки
</a>
<a href="#" class="nav-item" :class="{active:page==='translations'}" @click.prevent="go('translations')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
Переводы
</a>
<a href="#" class="nav-item" :class="{active:page==='users'}" @click.prevent="go('users')">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
Пользователи
</a>
</div>
</nav>

<div class="logout-area">
<button class="nav-item" @click="logout()">
<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
Выйти
</button>
</div>
</aside>

<!-- Main -->
<main class="main">
<div x-show="toast" x-text="toast" class="toast" x-cloak x-transition></div>

<!-- DASHBOARD -->
<template x-if="page==='dashboard'">
<div>
<h1 style="font-size:1.5rem;font-weight:600;color:#111827;margin-bottom:24px">Dashboard</h1>
<p style="margin:-20px 0 24px;font-size:.875rem;color:#6b7280">Заявки с сайта (форма «Обсудить проект»)</p>
<div class="stat-grid">
<div class="stat-card"><div class="value" x-text="stats.orders">0</div><div class="label">Orders</div></div>
<div class="stat-card"><div class="value" x-text="stats.heroes">0</div><div class="label">Banners</div></div>
<div class="stat-card"><div class="value" x-text="stats.services">0</div><div class="label">Services</div></div>
<div class="stat-card"><div class="value" x-text="stats.partners">0</div><div class="label">Partners</div></div>
<div class="stat-card"><div class="value" x-text="stats.languages">0</div><div class="label">Languages</div></div>
<div class="stat-card"><div class="value" x-text="stats.users">0</div><div class="label">Users</div></div>
</div>
<div class="card">
<div style="padding:16px 16px 0;font-weight:600;color:#111827">Recent Orders</div>
<div style="overflow-x:auto">
<table style="min-width:640px">
<thead><tr><th>#</th><th>Имя</th><th>Компания</th><th>Телефон</th><th>Email</th><th style="min-width:200px">Сообщение</th><th>Дата</th><th></th></tr></thead>
<tbody><template x-for="(o,i) in recentOrders" :key="o.id"><tr>
<td style="color:#6b7280" x-text="i+1"></td>
<td x-text="o.full_name||'—'"></td>
<td style="color:#374151" x-text="(o.company_name||'').trim()||'—'"></td>
<td style="white-space:nowrap;color:#374151" x-text="o.phone"></td>
<td style="max-width:200px;color:#374151" x-text="o.email||''"></td>
<td style="max-width:280px;color:#4b5563" x-text="truncMsg(o.message)"></td>
<td style="white-space:nowrap;color:#6b7280" x-text="fmtDate(o.created_at)"></td>
<td style="white-space:nowrap;text-align:right">
<button class="btn-red" style="border:none;border-radius:6px;padding:8px;cursor:pointer" @click="deleteOrder(o.id)" aria-label="Удалить">
<svg style="width:16px;height:16px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
</button>
</td>
</tr></template></tbody>
</table>
</div>
<p x-show="recentOrders.length===0" class="empty-msg">Нет заявок</p>
</div>
</div>
</template>

<!-- CRUD PAGES -->
<template x-for="pg in crudPages" :key="pg.key">
<template x-if="page===pg.key">
<div>
<div class="page-header">
<div>
<h1 x-text="pg.title"></h1>
<p class="breadcrumb"><span class="parent">Главное</span><span class="sep">/</span><span x-text="pg.title"></span></p>
</div>
<button class="btn btn-blue" @click="openCreate()" x-show="pg.canCreate">Добавить</button>
</div>
<div class="card">
<div class="search-bar">
<div class="search-wrap">
<span class="icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></span>
<input type="search" placeholder="Поиск…" x-model="search" @keydown.enter="loadList()">
</div>
<button class="btn btn-blue" @click="loadList()">Искать</button>
</div>
<div style="overflow-x:auto">
<table style="min-width:640px">
<thead><tr>
<template x-for="col in pg.columns"><th x-text="col.label"></th></template>
<th></th>
</tr></thead>
<tbody><template x-for="item in items" :key="item.id"><tr>
<template x-for="col in pg.columns"><td>
<template x-if="col.key==='is_default'||col.key==='is_active'">
<span class="badge" :class="item[col.key]?'badge-green':'badge-gray'" x-text="item[col.key]?'Yes':'No'"></span>
</template>
<template x-if="col.key==='image'&&item.image">
<img class="thumb" :src="item.image" alt="">
</template>
<template x-if="col.key!=='is_default'&&col.key!=='is_active'&&col.key!=='image'">
<span x-text="typeof item[col.key]==='string'&&item[col.key].length>60?item[col.key].slice(0,60)+'…':(item[col.key]??'—')"></span>
</template>
</td></template>
<td style="white-space:nowrap;text-align:right">
<button class="btn-cyan" style="border:none;border-radius:6px;cursor:pointer;margin-right:4px" @click="openEdit(item)" aria-label="Редактировать">
<svg style="width:16px;height:16px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
</button>
<button class="btn-red" style="border:none;border-radius:6px;cursor:pointer" @click="deleteItem(item.id)" x-show="pg.canDelete" aria-label="Удалить">
<svg style="width:16px;height:16px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
</button>
</td>
</tr></template></tbody>
</table>
<p x-show="items.length===0" class="empty-msg">Нет записей</p>
</div>
<div class="pagination" x-show="total>0">
<span class="info">Стр. <span x-text="currentPage"></span> из <span x-text="Math.ceil(total/perPage)||1"></span></span>
<button @click="prevPage()" :disabled="currentPage<=1">Пред.</button>
<button @click="nextPage()" :disabled="currentPage>=Math.ceil(total/perPage)">След.</button>
</div>
</div>
</div>
</template>
</template>

<!-- MODAL -->
<template x-if="showModal">
<div class="modal-backdrop" @click.self="showModal=false">
<div class="modal">
<div class="modal-header">
<h2 x-text="editingId?'Редактировать':'Создать'"></h2>
<button class="close-btn" @click="showModal=false" aria-label="Закрыть">×</button>
</div>
<div class="modal-body">
<template x-for="f in currentFields" :key="f.key">
<div class="form-group">
<label x-text="f.label"></label>
<template x-if="f.type==='textarea'"><textarea x-model="formData[f.key]"></textarea></template>
<template x-if="f.type==='checkbox'"><input type="checkbox" x-model="formData[f.key]"></template>
<template x-if="f.type!=='textarea'&&f.type!=='checkbox'"><input :type="f.type||'text'" x-model="formData[f.key]"></template>
</div>
</template>
<template x-if="currentTransFields.length>0&&langs.length>0">
<div>
<h3 style="margin:16px 0 8px;font-size:.875rem;font-weight:600;color:#6b7280">Переводы</h3>
<template x-for="lang in langs" :key="lang.code">
<div class="trans-block">
<div class="lang-name" x-text="lang.name+' ('+lang.code+')'"></div>
<template x-for="tf in currentTransFields" :key="tf">
<div class="form-group">
<label x-text="tf"></label>
<input type="text" x-model="formTranslations[lang.code][tf]">
</div>
</template>
</div>
</template>
</div>
</template>
</div>
<div class="modal-footer">
<button class="btn btn-outline" @click="showModal=false">Отмена</button>
<button class="btn btn-blue" @click="saveItem()" :disabled="saving" x-text="saving?'Сохранение…':'Сохранить'"></button>
</div>
</div>
</div>
</template>
</main>
</div>

<script>
function adminApp(){
const token=()=>localStorage.getItem('admin_token');
const api=async(path,opts={})=>{
const h={'Accept':'application/json','Authorization':'Bearer '+token()};
if(!(opts.body instanceof FormData))h['Content-Type']='application/json';
const r=await fetch('/api/admin/'+path,{...opts,headers:{...h,...(opts.headers||{})}});
if(r.status===401){localStorage.removeItem('admin_token');window.location.href='/admin/login';return}
if(r.status===204)return null;return r.json();};
return{
page:'dashboard',search:'',items:[],total:0,currentPage:1,perPage:15,
showModal:false,editingId:null,formData:{},formTranslations:{},saving:false,
toast:'',stats:{orders:0,heroes:0,services:0,partners:0,languages:0,users:0},recentOrders:[],langs:[],
crudPages:[
{key:'banners',title:'Баннеры',endpoint:'heroes',canCreate:true,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'image',label:'Изображение'},{key:'_text',label:'Текст'}],
 fields:[{key:'image',label:'Image URL'},{key:'video',label:'Video URL'}],transFields:['title','subtitle','button']},
{key:'services',title:'Услуги',endpoint:'services',canCreate:true,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'image',label:'Изображение'}],
 fields:[{key:'image',label:'Image URL'}],transFields:['title','subtitle']},
{key:'partners',title:'Партнёры',endpoint:'partners',canCreate:true,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'link',label:'Ссылка'}],
 fields:[{key:'image',label:'Image URL'},{key:'link',label:'Link'}],transFields:['title']},
{key:'languages',title:'Языки',endpoint:'languages',canCreate:true,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'name',label:'Название'},{key:'code',label:'Код'},{key:'is_default',label:'По умолч.'},{key:'is_active',label:'Активен'}],
 fields:[{key:'name',label:'Название'},{key:'code',label:'Код'},{key:'isDefault',label:'По умолчанию',type:'checkbox'},{key:'isActive',label:'Активен',type:'checkbox'}],transFields:[]},
{key:'users',title:'Пользователи',endpoint:'users',canCreate:true,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'name',label:'Имя'},{key:'login',label:'Логин'}],
 fields:[{key:'name',label:'Имя'},{key:'login',label:'Логин'},{key:'password',label:'Пароль',type:'password'}],transFields:[]},
{key:'groups',title:'Группы',endpoint:'groups',canCreate:true,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'name',label:'Название'},{key:'slug',label:'Slug'},{key:'itemCount',label:'Элементы'}],
 fields:[{key:'name',label:'Название'},{key:'slug',label:'Slug'},{key:'description',label:'Описание'}],transFields:[]},
{key:'orders',title:'Заявки',endpoint:'orders',canCreate:false,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'full_name',label:'Имя'},{key:'phone',label:'Телефон'},{key:'email',label:'Email'},{key:'created_at',label:'Дата'}],
 fields:[],transFields:[]},
{key:'translations',title:'Переводы',endpoint:'translations',canCreate:false,canDelete:true,
 columns:[{key:'id',label:'#'},{key:'model_type',label:'Модель'},{key:'model_id',label:'ID модели'},{key:'field',label:'Поле'},{key:'content',label:'Содержание'}],
 fields:[{key:'content',label:'Содержание',type:'textarea'}],transFields:[]},
],
get currentCrud(){return this.crudPages.find(p=>p.key===this.page)},
get currentFields(){return this.currentCrud?.fields||[]},
get currentTransFields(){return this.currentCrud?.transFields||[]},
truncMsg(t){const s=(t??'').trim();return s.length<=120?(s||'—'):s.slice(0,120)+'…'},
fmtDate(iso){try{const d=new Date(iso);return isNaN(d)?iso:d.toLocaleString(undefined,{dateStyle:'short',timeStyle:'short'})}catch{return iso}},
async init(){
 if(!token()){window.location.href='/admin/login';return}
 const path=window.location.pathname.replace('/admin/','').replace('/admin','');
 this.page=path||'dashboard';await this.loadLangs();
 if(this.page==='dashboard')await this.loadDashboard();else await this.loadList();
},
async loadLangs(){try{const d=await api('languages?perPage=100');this.langs=d?.data||[];}catch{this.langs=[];}},
async loadDashboard(){
 const[o,h,s,p,l,u]=await Promise.all([api('orders?perPage=1'),api('heroes?perPage=1'),api('services?perPage=1'),api('partners?perPage=1'),api('languages?perPage=1'),api('users?perPage=1')]);
 this.stats={orders:o?.total||0,heroes:h?.total||0,services:s?.total||0,partners:p?.total||0,languages:l?.total||0,users:u?.total||0};
 const ord=await api('orders?perPage=10');this.recentOrders=ord?.data||[];
},
go(p){this.page=p;this.search='';this.currentPage=1;history.pushState(null,'','/admin/'+p);
 if(p==='dashboard')this.loadDashboard();else this.loadList();},
async loadList(){
 const c=this.currentCrud;if(!c)return;
 const q=new URLSearchParams({page:this.currentPage,perPage:this.perPage});
 if(this.search)q.set('q',this.search);
 const d=await api(c.endpoint+'?'+q);this.items=d?.data||[];this.total=d?.total||0;
},
prevPage(){if(this.currentPage>1){this.currentPage--;this.loadList();}},
nextPage(){if(this.currentPage<Math.ceil(this.total/this.perPage)){this.currentPage++;this.loadList();}},
openCreate(){
 const c=this.currentCrud;if(!c)return;
 this.editingId=null;this.formData={};this.formTranslations={};
 c.fields.forEach(f=>{this.formData[f.key]=f.type==='checkbox'?false:'';});
 if(c.transFields.length>0)this.langs.forEach(l=>{this.formTranslations[l.code]={};c.transFields.forEach(tf=>{this.formTranslations[l.code][tf]='';});});
 this.showModal=true;
},
openEdit(item){
 const c=this.currentCrud;if(!c)return;
 this.editingId=item.id;this.formData={};this.formTranslations={};
 c.fields.forEach(f=>{this.formData[f.key]=item[f.key]??'';});
 if(c.transFields.length>0&&item.translations){
  this.langs.forEach(l=>{this.formTranslations[l.code]={};
   c.transFields.forEach(tf=>{this.formTranslations[l.code][tf]=item.translations?.[l.code]?.[tf]||'';});
  });
 }
 this.showModal=true;
},
async saveItem(){
 const c=this.currentCrud;if(!c)return;this.saving=true;
 const body={...this.formData};
 if(c.transFields.length>0)body.translations=this.formTranslations;
 try{
  if(this.editingId){await api(c.endpoint+'/'+this.editingId,{method:'PATCH',body:JSON.stringify(body)});}
  else{await api(c.endpoint,{method:'POST',body:JSON.stringify(body)});}
  this.showModal=false;this.showToast('Сохранено!');await this.loadList();
 }catch{alert('Ошибка сохранения');}finally{this.saving=false;}
},
async deleteItem(id){
 if(!confirm('Удалить эту запись?'))return;
 const c=this.currentCrud;if(!c)return;
 await api(c.endpoint+'/'+id,{method:'DELETE'});
 this.showToast('Удалено');await this.loadList();
},
async deleteOrder(id){
 if(!confirm('Удалить эту заявку?'))return;
 await api('orders/'+id,{method:'DELETE'});
 this.showToast('Удалено');await this.loadDashboard();
},
showToast(msg){this.toast=msg;setTimeout(()=>{this.toast='';},2500);},
logout(){localStorage.removeItem('admin_token');localStorage.removeItem('admin_user');window.location.href='/admin/login';}
};}
</script>
</body>
</html>
