const content = document.getElementById("content");
const sectionNav = document.getElementById("sectionNav");
const bottomNav = document.querySelector(".bottom-nav");

const pages = {
  home: `
    <h1>Noswaith dda, Nia 👋</h1>
    <div class="card feed-card">
      <div class="small-avatar">NW</div>
      <div class="feed-text">Rhannwch rywbeth gyda'r ysgol...</div>
    </div>
    <div class="card empty" style="margin-top:24px">
      <div><h2>Dim byd yn y ffrwd eto</h2><p>Bydd postiadau wedi'u cymeradwyo o bob rhan o'r ysgol yn ymddangos yma.</p></div>
    </div>`,
  post: `
    <h1>Creu post</h1>
    <div class="card composer">
      <input placeholder="Teitl y post">
      <textarea placeholder="Beth sy'n digwydd? Rhannwch newyddion, syniad neu ddiweddariad..."></textarea>
      <p class="help">Mae postiadau'n cael eu hadolygu gan dîm yr ysgol cyn iddyn nhw fynd yn fyw.</p>
      <button class="primary" onclick="alert('Byddai'r post yn cael ei gyflwyno yma.')">Postio i'r ysgol</button>
    </div>`,
  messages: `
    <h1>Neges I Laís y Myfyrwyr</h1>
    <div class="card">
      <div class="chat-intro">Preifat · dim ond chi a'r cynrychiolydd y myfyrwyr all weld yr edefyn hwn.</div>
      <div class="bubble">Helo! Beth hoffech chi ei ddweud wrthyf?</div>
      <hr class="divider">
      <textarea placeholder="Ysgrifennwch neges..."></textarea>
      <button class="primary" style="margin-top:24px" onclick="alert('Neges wedi ei hanfon.')">➤ &nbsp; Anfon neges</button>
    </div>`,
  clubs: `
    <h1>Clybiau a Chymdeithasau</h1>
    <div class="card empty">
      <div><h2>Dim clybiau eto</h2><p>Bydd clybiau a chymdeithasau yn cael eu rhestru yma.</p></div>
    </div>`,
  profile: `
    <h1>Proffil</h1>
    <div class="card profile">
      <div class="profile-avatar">NW</div>
      <h2>Nia Wozencroft</h2>
      <div class="email">✉ &nbsp; 4vtjh9kzk5@privaterelay.appleid.com</div>
      <span class="badge">STAFF</span>
    </div>
    <div class="card profile-row"><strong>🛡 &nbsp; Offer staff</strong><span>Cymedroli a negeseuon</span></div>
    <button class="logout" onclick="alert('Allgofnodi')">⇥ &nbsp; Allgofnodi</button>`,
  news: `
    <h1>Newyddion yr Ysgol</h1>
    <div class="card empty"><div><h2>Dim newyddion eto</h2><p>Bydd cyhoeddiadau'r ysgol yn ymddangos yma.</p></div></div>`,
  noticeboard: `
    <h1>Pleidleisiau Myfyrwyr</h1>
    <div class="card empty"><div><h2>Dim pleidleisiau ar agor</h2><p>Bydd pleidleisiau Llais y Myfyrwyr yn ymddangos yma.</p></div></div>`
};

const sectionToPage = {home:"home", news:"news", clubs:"clubs", noticeboard:"noticeboard"};

function render(page){
  content.innerHTML = pages[page] || pages.home;
  bottomNav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  sectionNav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.section === page));
  window.scrollTo(0,0);
}

bottomNav.addEventListener("click", e => {
  const btn = e.target.closest("button[data-page]");
  if(btn) render(btn.dataset.page);
});
sectionNav.addEventListener("click", e => {
  const btn = e.target.closest("button[data-section]");
  if(btn) render(sectionToPage[btn.dataset.section] || btn.dataset.section);
});

render("home");
