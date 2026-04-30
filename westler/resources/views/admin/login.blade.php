<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Вход в админку — Westler</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px}
.login-card{width:100%;max-width:28rem;border-radius:12px;border:1px solid #e5e7eb;background:#fff;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.login-card h1{font-size:1.25rem;font-weight:600;color:#111827}
.login-card .hint{margin-top:4px;font-size:.875rem;color:#6b7280}
.login-card .hint code{border-radius:4px;background:#f3f4f6;padding:0 4px;font-size:.8rem}
form{margin-top:24px;display:flex;flex-direction:column;gap:16px}
label{display:block;font-size:.875rem;font-weight:500;color:#374151}
input{margin-top:4px;width:100%;border-radius:8px;border:1px solid #d1d5db;padding:8px 12px;font-size:.875rem;box-shadow:0 1px 2px rgba(0,0,0,.05);outline:none;color:#111827}
input:focus{border-color:#3b82f6;box-shadow:0 0 0 1px #3b82f6}
.submit-btn{width:100%;border-radius:8px;background:#2563eb;padding:10px 16px;font-size:.875rem;font-weight:500;color:#fff;border:none;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.05);transition:background .15s}
.submit-btn:hover{background:#1d4ed8}
.submit-btn:disabled{opacity:.5;cursor:not-allowed}
.error{font-size:.875rem;color:#dc2626}
[x-cloak]{display:none!important}
</style>
</head>
<body>
<div class="login-card" x-data="loginForm()">
<h1>Вход в админку</h1>
<p class="hint">Используйте учётную запись из таблицы пользователей. Первого пользователя создаёт сидер: <code>php artisan db:seed</code></p>
<form @submit.prevent="submit">
<div>
<label for="login">Логин</label>
<input id="login" type="text" x-model="login" required autocomplete="username">
</div>
<div>
<label for="password">Пароль</label>
<input id="password" type="password" x-model="password" required autocomplete="current-password">
</div>
<p class="error" x-show="error" x-text="error" x-cloak></p>
<button type="submit" class="submit-btn" :disabled="loading" x-text="loading?'Вход…':'Войти'"></button>
</form>
</div>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
<script>
function loginForm(){return{login:'',password:'',error:'',loading:false,
async submit(){this.error='';this.loading=true;try{
const r=await fetch('/api/admin/auth/login',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({login:this.login,password:this.password})});
const d=await r.json();if(!r.ok){this.error=d.message||'Неверный логин или пароль';return;}
localStorage.setItem('admin_token',d.access_token);localStorage.setItem('admin_user',JSON.stringify(d.user));window.location.href='/admin/dashboard';
}catch(e){this.error='Не удалось войти. Проверьте API и сеть.';}finally{this.loading=false;}}}}
</script>
</body>
</html>
