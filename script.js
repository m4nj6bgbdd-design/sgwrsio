import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/*
  1) Create a Supabase project.
  2) Put your Project URL and anon/publishable key below.
  3) Run supabase-schema.sql in Supabase SQL Editor.
  4) Upload these files to GitHub Pages.
*/
const SUPABASE_URL = "https://kfxzmmgjijqmvbdfamgk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_................................";

const configured = !SUPABASE_URL.startsWith("PASTE_") && !SUPABASE_ANON_KEY.startsWith("PASTE_");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const content = document.getElementById("content");
const sectionNav = document.getElementById("sectionNav");
const bottomNav = document.querySelector(".bottom-nav");
const headerAvatar = document.getElementById("headerAvatar");
const authButton = document.getElementById("authButton");
const toast = document.getElementById("toast");
const modalRoot = document.getElementById("modalRoot");

let state = { user:null, profile:null, page:"home", activeChat:null, channel:null };

function esc(v=""){ return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function initials(name="U"){ return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "U"; }
function showToast(message){ toast.textContent=message; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),2600); }
function requireAuth(){ if(!state.user){ renderAuth(); return false; } return true; }

function renderAuth(){
  state.page="auth";
  content.innerHTML=`<h1>Mewngofnodi i sgwrsio</h1>
  <div class="card auth-card">
    <div id="authMessage" class="notice">Defnyddiwch eich cyfrif i bostio, pleidleisio a negeseuon.</div>
    <div class="stack">
      <input id="authName" placeholder="Enw llawn" autocomplete="name">
      <input id="authEmail" type="email" placeholder="E-bost" autocomplete="email">
      <input id="authPassword" type="password" placeholder="Cyfrinair" autocomplete="current-password">
      <button class="primary" id="loginBtn">Mewngofnodi</button>
      <button class="secondary" id="signupBtn">Creu cyfrif</button>
    </div>
    <p class="help">Bydd angen cadarnhau eich e-bost os yw Email Confirmation wedi'i droi ymlaen yn Supabase.</p>
  </div>`;
  document.getElementById("loginBtn").onclick=login;
  document.getElementById("signupBtn").onclick=signup;
  bottomNav.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
}

async function login(){
  if(!configured) return setupNotice();
  const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
  if(!email||!password) return authError("Llenwch yr e-bost a'r cyfrinair.");
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error) authError(error.message); else showToast("Mewngofnodi'n llwyddiannus.");
}
async function signup(){
  if(!configured) return setupNotice();
  const name=document.getElementById("authName").value.trim(), email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
  if(!name||!email||password.length<6) return authError("Rhowch enw, e-bost a chyfrinair o leiaf 6 nod.");
  const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
  if(error) return authError(error.message);
  if(data.session) showToast("Cyfrif wedi'i greu."); else authError("Cyfrif wedi'i greu. Gwiriwch eich e-bost i gadarnhau'r cyfrif.", true);
}
function authError(msg, good=false){ const el=document.getElementById("authMessage"); if(el){el.className=good?"notice":"error";el.textContent=msg;} }
function setupNotice(){ authError("Cysylltwch Supabase yn script.js cyn defnyddio cyfrifon go iawn."); }

async function loadProfile(){
  if(!state.user) return;
  const {data}=await supabase.from("profiles").select("*").eq("id",state.user.id).maybeSingle();
  state.profile=data;
  headerAvatar.textContent=initials(data?.full_name || state.user.email);
}

async function boot(){
  if(!configured){
    headerAvatar.textContent="?";
    renderSetup();
    return;
  }
  const {data:{session}}=await supabase.auth.getSession();
  state.user=session?.user || null;
  await loadProfile();
  supabase.auth.onAuthStateChange(async (_event,session)=>{ state.user=session?.user||null; await loadProfile(); if(state.user) render(state.page==="auth"?"home":state.page); else renderAuth(); });
  if(state.user) render("home"); else renderAuth();
}
function renderSetup(){
  content.innerHTML=`<h1>Cysylltu sgwrsio</h1><div class="card auth-card"><div class="notice"><strong>Mae'r fersiwn hon yn barod ar gyfer cyfrifon go iawn.</strong><br><br>Mae angen cysylltu prosiect Supabase cyn y gall pobl gofrestru, postio, pleidleisio neu anfon negeseuon.</div><ol class="help"><li>Creu prosiect Supabase.</li><li>Rhedeg <code>supabase-schema.sql</code>.</li><li>Rhowch Project URL a'r anon/publishable key yn <code>script.js</code>.</li><li>Upload i GitHub Pages.</li></ol></div>`;
}

async function fetchPosts(){
  const {data,error}=await supabase.from("posts").select("id,title,body,created_at,author_id,profiles(full_name)").eq("status","approved").order("created_at",{ascending:false}).limit(30);
  if(error) return [];
  return data||[];
}
function postHTML(p){
  const name=p.profiles?.full_name||"Aelod";
  return `<article class="card post"><div class="post-head"><div class="post-avatar">${esc(initials(name))}</div><div class="post-meta"><strong>${esc(name)}</strong><span>${new Date(p.created_at).toLocaleString("cy-GB")}</span></div></div>${p.title?`<h3>${esc(p.title)}</h3>`:""}<p>${esc(p.body).replace(/\n/g,"<br>")}</p><button class="like" data-like="${p.id}">♡ Hoffi</button></article>`;
}

async function renderHome(){
  if(!requireAuth()) return;
  const posts=await fetchPosts();
  content.innerHTML=`<h1>Noswaith dda, ${esc((state.profile?.full_name||"ffrind").split(" ")[0])} 👋</h1>
  <div class="card feed-card" id="quickPost"><div class="small-avatar">${esc(initials(state.profile?.full_name||"U"))}</div><div class="feed-text">Rhannwch rywbeth gyda'r ysgol...</div></div>
  <div id="feed">${posts.length?posts.map(postHTML).join(""):`<div class="card empty"><div><h2>Dim postiadau eto</h2><p>Bydd postiadau cymeradwy yn ymddangos yma.</p></div></div>`}</div>`;
  document.getElementById("quickPost").onclick=()=>render("post");
  document.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>showToast("Hoffi wedi'i gofnodi yn y fersiwn nesaf."));
}
async function renderPost(){
  if(!requireAuth()) return;
  content.innerHTML=`<h1>Creu post</h1><div class="card composer"><input id="postTitle" placeholder="Teitl y post"><textarea id="postBody" placeholder="Beth sy'n digwydd? Rhannwch newyddion, syniad neu ddiweddariad..."></textarea><p class="help">Bydd y post yn aros fel "pending" nes bod gweinyddwr yn ei gymeradwyo. Mae hyn yn helpu i gadw'r gymuned yn ddiogel.</p><button class="primary" id="submitPost">Postio i'r ysgol</button></div>`;
  document.getElementById("submitPost").onclick=async()=>{
    const title=document.getElementById("postTitle").value.trim(), body=document.getElementById("postBody").value.trim();
    if(!body) return showToast("Ysgrifennwch rywbeth yn gyntaf.");
    const {error}=await supabase.from("posts").insert({title,body,author_id:state.user.id,status:"pending"});
    if(error) showToast(error.message); else { showToast("Post wedi'i gyflwyno i'w adolygu."); render("home"); }
  };
}

async function renderMessages(){
  if(!requireAuth()) return;
  const {data:users}=await supabase.from("profiles").select("id,full_name").neq("id",state.user.id).order("full_name").limit(50);
  const list=(users||[]).map(u=>`<button class="chat-user ${state.activeChat===u.id?"active":""}" data-chat="${u.id}">${esc(u.full_name||"Aelod")}</button>`).join("");
  content.innerHTML=`<h1>Negeseuon</h1><div class="card"><div class="chat-list">${list||"<p class='muted'>Dim defnyddwyr eraill eto.</p>"}</div><div id="chatArea">${state.activeChat?await chatHTML(state.activeChat):"<p class='muted'>Dewiswch aelod i ddechrau sgwrs breifat.</p>"}</div></div>`;
  document.querySelectorAll("[data-chat]").forEach(b=>b.onclick=()=>{state.activeChat=b.dataset.chat;renderMessages();});
  document.getElementById("sendMsg")?.addEventListener("click",sendMessage);
  document.getElementById("messageInput")?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});
  subscribeMessages();
}
async function chatHTML(otherId){
  const {data:msgs}=await supabase.from("messages").select("id,sender_id,body,created_at").or(`and(sender_id.eq.${state.user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${state.user.id})`).order("created_at");
  return `<div class="messages" id="messagesBox">${(msgs||[]).map(m=>`<div class="msg ${m.sender_id===state.user.id?"mine":"theirs"}">${esc(m.body)}</div>`).join("")||"<p class='muted'>Dim negeseuon eto.</p>"}</div><div class="row" style="margin-top:12px"><input id="messageInput" placeholder="Ysgrifennwch neges..." style="margin:0"><button class="primary" id="sendMsg" style="width:auto">Anfon</button></div>`;
}
async function sendMessage(){
  const input=document.getElementById("messageInput"); if(!input||!state.activeChat) return;
  const body=input.value.trim(); if(!body) return;
  const {error}=await supabase.from("messages").insert({sender_id:state.user.id,receiver_id:state.activeChat,body});
  if(error) showToast(error.message); else {input.value="";renderMessages();}
}
function subscribeMessages(){
  if(state.channel) supabase.removeChannel(state.channel);
  if(!state.activeChat) return;
  state.channel=supabase.channel("messages-"+state.user.id+"-"+state.activeChat).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},payload=>{
    const m=payload.new;
    if((m.sender_id===state.user.id&&m.receiver_id===state.activeChat)||(m.sender_id===state.activeChat&&m.receiver_id===state.user.id)) renderMessages();
  }).subscribe();
}

async function renderClubs(){
  const {data}=await supabase.from("clubs").select("*").order("name");
  content.innerHTML=`<h1>Clybiau a Chymdeithasau</h1>${(data||[]).map(c=>`<div class="card club"><div><h3>${esc(c.name)}</h3><p class="muted">${esc(c.description||"")}</p></div><span class="badge">${c.meeting_day?esc(c.meeting_day):"Clwb"}</span></div>`).join("")||`<div class="card empty"><div><h2>Dim clybiau eto</h2><p>Gall staff ychwanegu clybiau yn Supabase.</p></div></div>`}`;
}
async function renderVotes(){
  if(!requireAuth()) return;
  const {data:votes}=await supabase.from("votes").select("id,question,ends_at,vote_options(id,label)").eq("is_open",true).order("created_at",{ascending:false});
  content.innerHTML=`<h1>Pleidleisiau Myfyrwyr</h1>${(votes||[]).map(v=>`<div class="card vote-card"><h2>${esc(v.question)}</h2><p class="muted">${v.ends_at?"Yn cau "+new Date(v.ends_at).toLocaleString("cy-GB"):"Ar agor"}</p><div>${(v.vote_options||[]).map(o=>`<div class="vote-option"><span>${esc(o.label)}</span><button class="secondary" data-vote="${o.id}" data-vote-id="${v.id}">Pleidleisio</button></div>`).join("")}</div></div>`).join("")||`<div class="card empty"><div><h2>Dim pleidleisiau ar agor</h2><p>Bydd pleidleisiau yn ymddangos yma.</p></div></div>`}`;
  document.querySelectorAll("[data-vote]").forEach(b=>b.onclick=async()=>{const {error}=await supabase.from("vote_responses").upsert({vote_id:b.dataset.voteId,option_id:b.dataset.vote,user_id:state.user.id},{onConflict:"vote_id,user_id"});if(error)showToast(error.message);else showToast("Diolch — mae eich pleidlais wedi'i chofnodi.");});
}
async function renderNews(){
  const {data}=await supabase.from("news").select("*").order("created_at",{ascending:false}).limit(20);
  content.innerHTML=`<h1>Newyddion yr Ysgol</h1>${(data||[]).map(n=>`<article class="card"><h2>${esc(n.title)}</h2><p>${esc(n.body).replace(/\n/g,"<br>")}</p><p class="muted">${new Date(n.created_at).toLocaleDateString("cy-GB")}</p></article>`).join("")||`<div class="card empty"><div><h2>Dim newyddion eto</h2><p>Bydd cyhoeddiadau'r ysgol yn ymddangos yma.</p></div></div>`}`;
}
function renderProfile(){
  if(!requireAuth()) return;
  const name=state.profile?.full_name||"Aelod";
  content.innerHTML=`<h1>Proffil</h1><div class="card profile"><div class="profile-avatar">${esc(initials(name))}</div><h2>${esc(name)}</h2><div class="email">${esc(state.user.email)}</div><span class="badge">${esc(state.profile?.role||"STUDENT").toUpperCase()}</span></div><div class="card"><h2>Diweddaru proffil</h2><input id="profileName" value="${esc(name)}" placeholder="Enw llawn"><button class="primary" id="saveProfile">Cadw</button></div><button class="logout" id="logout">⇥ &nbsp; Allgofnodi</button>`;
  document.getElementById("saveProfile").onclick=async()=>{const full_name=document.getElementById("profileName").value.trim();if(!full_name)return showToast("Rhowch enw.");const {error}=await supabase.from("profiles").update({full_name}).eq("id",state.user.id);if(error)showToast(error.message);else{await loadProfile();showToast("Proffil wedi'i gadw.");render("profile");}};
  document.getElementById("logout").onclick=async()=>{await supabase.auth.signOut();};
}

async function render(page){
  state.page=page;
  bottomNav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  sectionNav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.section===page));
  if(!configured) return renderSetup();
  if(page==="home") await renderHome();
  else if(page==="post") await renderPost();
  else if(page==="messages") await renderMessages();
  else if(page==="clubs") await renderClubs();
  else if(page==="profile") renderProfile();
  else if(page==="news") await renderNews();
  else if(page==="votes") await renderVotes();
  window.scrollTo(0,0);
}
bottomNav.addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)render(b.dataset.page);});
sectionNav.addEventListener("click",e=>{const b=e.target.closest("[data-section]");if(b)render(b.dataset.section);});
authButton.onclick=()=>state.user?render("profile"):render("auth");

boot();
