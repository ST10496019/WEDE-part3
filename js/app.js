/* app.js - static demo logic (no backend). Stores data in localStorage.
   Keys used: bwb_user, bwb_wallet, bwb_bets, bwb_contacts
*/

(function(){
  // Utilities
  function qs(sel, ctx) { return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx||document).querySelectorAll(sel)); }
  function fmtRand(n){ return 'R' + Number(n).toFixed(2); }

  // Initial demo state
  if(!localStorage.getItem('bwb_wallet')){
    localStorage.setItem('bwb_wallet', JSON.stringify({balance: 500.00})); // start with R500
  }
  if(!localStorage.getItem('bwb_bets')) localStorage.setItem('bwb_bets', JSON.stringify([]));
  if(!localStorage.getItem('bwb_contacts')) localStorage.setItem('bwb_contacts', JSON.stringify([]));

  // Fake fixtures generator (PSL, EPL, LaLiga, MLS)
  const LEAGUES = {
    PSL: ['Kaizer Chiefs','Orlando Pirates','Mamelodi Sundowns','SuperSport United','Sundowns','AmaZulu'],
    EPL: ['Manchester United','Arsenal','Liverpool','Chelsea','Manchester City','Tottenham'],
    LaLiga: ['Real Madrid','Barcelona','Atletico Madrid','Sevilla','Valencia','Real Sociedad'],
    MLS: ['LA Galaxy','LAFC','Atlanta United','Inter Miami','NYCFC','Seattle Sounders']
  };

  function randomInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  function pick(arr){ return arr[randomInt(0, arr.length-1)]; }

  function generateFixtures(){
    const fixtures = [];
    const leagues = Object.keys(LEAGUES);
    let id = Date.now() % 100000;
    leagues.forEach(league => {
      for(let i=0;i<3;i++){
        const home = pick(LEAGUES[league]);
        let away = pick(LEAGUES[league]);
        while(away === home) away = pick(LEAGUES[league]);
        const time = new Date(Date.now() + randomInt(-2,5)*3600*1000 + i*3600*1000).toISOString();
        const statusRoll = randomInt(0,100);
        const status = statusRoll > 80 ? 'LIVE' : (statusRoll>20 ? 'SCHEDULED' : 'FINISHED');
        const homeScore = status==='FINISHED' || status==='LIVE' ? randomInt(0,3) : null;
        const awayScore = status==='FINISHED' || status==='LIVE' ? randomInt(0,3) : null;
        // generate odds for home win, draw, away win
        const homeOdds = Number((1.5 + Math.random()*2.0).toFixed(2));
        const drawOdds = Number((2.5 + Math.random()*2.0).toFixed(2));
        const awayOdds = Number((1.6 + Math.random()*2.2).toFixed(2));
        fixtures.push({id: id++, league, home, away, time, status, homeScore, awayScore, odds: {home: homeOdds, draw: drawOdds, away: awayOdds}});
      }
    });
    return fixtures;
  }

  // Store generated fixtures in-memory and refresh periodically
  let fixtures = generateFixtures();
  setInterval(()=> { fixtures = generateFixtures(); renderFixtures(); renderFeatured(); }, 15000);

  // Render featured fixture on home
  function renderFeatured(){
    const el = qs('#featured-fixture');
    if(!el) return;
    const f = fixtures[Math.floor(Math.random()*fixtures.length)];
  el.innerHTML = `<div class="fixture"><div class="teams"><div class="team-logo"><img alt="${f.home} logo" src="${assetLogo(f.home)}" onerror="if(!this._triedEncoded){this._triedEncoded=true;this.src='assets/logos/${encodeURIComponent(f.home)}.png'} else if(!this._triedSVG){this._triedSVG=true;this.src='assets/logos/${slugify(f.home)}.svg'} else {this.onerror=null;this.src='${logoDataURL(f.home)}'}"/></div><div class="team-name">${f.home}</div><div class="vs">vs</div><div class="team-logo"><img alt="${f.away} logo" src="${assetLogo(f.away)}" onerror="if(!this._triedEncoded){this._triedEncoded=true;this.src='assets/logos/${encodeURIComponent(f.away)}.png'} else if(!this._triedSVG){this._triedSVG=true;this.src='assets/logos/${slugify(f.away)}.svg'} else {this.onerror=null;this.src='${logoDataURL(f.away)}'}"/></div><div class="team-name">${f.away}</div></div>
        <div class="meta">${new Date(f.time).toLocaleString()}   ${f.status}   Odds ${typeof f.odds==='object' ? f.odds.home.toFixed(2) + '/' + f.odds.draw.toFixed(2) + '/' + f.odds.away.toFixed(2) : f.odds}</div></div>`;
  }

  // Render fixtures on matches page
  function renderFixtures(){
    const el = qs('#fixtures');
    if(!el) return;
    const league = qs('#league-filter') ? qs('#league-filter').value : 'ALL';
    const search = qs('#search') ? qs('#search').value.toLowerCase() : '';
    const list = fixtures.filter(f => (league==='ALL' || f.league===league) && (f.home.toLowerCase().includes(search) || f.away.toLowerCase().includes(search)));
    if(list.length===0){ el.innerHTML = '<div class="muted">No fixtures found.</div>'; return; }
    el.innerHTML = '';
    list.forEach(f => {
      const div = document.createElement('div');
      div.className = 'fixture';
      div.innerHTML = `<div>
        <div class="teams"><div class="team-logo"><img alt="${f.home} logo" src="${assetLogo(f.home)}" onerror="if(!this._triedEncoded){this._triedEncoded=true;this.src='assets/logos/${encodeURIComponent(f.home)}.png'} else if(!this._triedSVG){this._triedSVG=true;this.src='assets/logos/${slugify(f.home)}.svg'} else {this.onerror=null;this.src='${logoDataURL(f.home)}'}"/></div><div class="team-name">${f.home}</div><div class="vs">vs</div><div class="team-logo"><img alt="${f.away} logo" src="${assetLogo(f.away)}" onerror="if(!this._triedEncoded){this._triedEncoded=true;this.src='assets/logos/${encodeURIComponent(f.away)}.png'} else if(!this._triedSVG){this._triedSVG=true;this.src='assets/logos/${slugify(f.away)}.svg'} else {this.onerror=null;this.src='${logoDataURL(f.away)}'}"/></div><div class="team-name">${f.away}</div></div>
        <div class="meta">${new Date(f.time).toLocaleString()}   ${f.status} ${f.homeScore!=null ? '   ' + f.homeScore + '-' + f.awayScore : ''}</div>
      </div>
      <div style="text-align:right">
        <div style="margin-bottom:8px;font-weight:700">Odds</div>
        <div class="choice-group" data-id="${f.id}">
          <button class="choice-btn" data-id="${f.id}" data-outcome="home" data-odds="${f.odds.home}">${f.home} <div class="choice-odd">${f.odds.home.toFixed(2)}</div></button>
          <button class="choice-btn" data-id="${f.id}" data-outcome="draw" data-odds="${f.odds.draw}">Draw <div class="choice-odd">${f.odds.draw.toFixed(2)}</div></button>
          <button class="choice-btn" data-id="${f.id}" data-outcome="away" data-odds="${f.odds.away}">${f.away} <div class="choice-odd">${f.odds.away.toFixed(2)}</div></button>
        </div>
      </div>`;
      el.appendChild(div);
    });
    // add events to choice buttons (toggle selection)
    qsa('.choice-btn').forEach(b => b.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-id');
      const outcome = e.currentTarget.getAttribute('data-outcome');
      const odds = Number(e.currentTarget.getAttribute('data-odds'));
      const sel = fixtures.find(x=>String(x.id)===String(id));
      if(!sel) return;
      const existingIndex = findSelectionIndex(id, outcome);
      if(existingIndex >= 0){
        // already selected -> remove
        removeFromSlip(existingIndex);
      } else {
        addToSlip({ id: sel.id, league: sel.league, home: sel.home, away: sel.away, outcome, odds });
      }
      updateChoiceButtonStates();
    }));
  }

  // Bet slip handling (stored in localStorage 'bwb_slip')
  function getSlip(){ return JSON.parse(localStorage.getItem('bwb_slip')||'[]'); }
  function saveSlip(s){ localStorage.setItem('bwb_slip', JSON.stringify(s)); renderSlip(); }
  function findSelectionIndex(id, outcome){ return getSlip().findIndex(x=>String(x.id)===String(id) && x.outcome===outcome); }
  function addToSlip(selection){
    const s = getSlip();
    // prevent duplicates by same fixture + same outcome
  if(s.find(x=>x.id==selection.id && x.outcome===selection.outcome)) return alert('Already in bet slip');
  // remove any other selection for the same fixture (only one outcome allowed per fixture)
  const existingIdx = s.findIndex(x=>String(x.id)===String(selection.id));
  if(existingIdx >= 0) s.splice(existingIdx, 1);
  s.push({id: selection.id, league: selection.league, home: selection.home, away: selection.away, outcome: selection.outcome, odds: Number(selection.odds)});
    saveSlip(s);
  }
  function removeFromSlip(index){ const s = getSlip(); s.splice(index,1); saveSlip(s); }
  function renderSlip(){
    const el = qs('#slip-items');
    if(!el) return;
    const s = getSlip();
    if(s.length===0){ el.innerHTML = '<div class="muted">No selections</div>'; updateChoiceButtonStates(); return; }
    el.innerHTML = s.map((x,idx)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
      <div><strong>${x.outcome.toUpperCase()}</strong> ${x.home} v ${x.away} <div class="meta">${x.league}</div></div>
      <div style="text-align:right"><div>Odds: ${x.odds.toFixed(2)}</div><button class="btn small remove" data-idx="${idx}">Remove</button></div>
    </div>`).join('');
    // wire remove buttons
    qsa('.remove').forEach(b=>b.addEventListener('click',(e)=>{ removeFromSlip(Number(e.currentTarget.getAttribute('data-idx'))); }));
    // sync choice button states after rendering slip
    updateChoiceButtonStates();
  }

  // update UI state for choice buttons based on current slip
  function updateChoiceButtonStates(){
    const slip = getSlip();
    qsa('.choice-btn').forEach(btn=>{
      const id = btn.getAttribute('data-id');
      const outcome = btn.getAttribute('data-outcome');
      const exists = slip.find(s=>String(s.id)===String(id) && s.outcome===outcome);
      if(exists) btn.classList.add('selected'); else btn.classList.remove('selected');
    });
  }

  // Place bet - moves slip into wagers (localStorage 'bwb_bets'), deducts balance
  function placeBet(){
    const slip = getSlip();
    if(slip.length===0) return alert('No selections');
    const stakeInput = qs('#stake');
    const stake = Number(stakeInput ? stakeInput.value : 10);
    if(!stake || stake <= 0) return alert('Enter a valid stake');
    const wallet = JSON.parse(localStorage.getItem('bwb_wallet'));
    if(wallet.balance < stake) return alert('Insufficient demo balance. Deposit to continue.');
    // deduct
    wallet.balance = Number((wallet.balance - stake).toFixed(2));
    localStorage.setItem('bwb_wallet', JSON.stringify(wallet));
    // create bet record (single-card parlay for simplicity)
    const bets = JSON.parse(localStorage.getItem('bwb_bets')||'[]');
    const potentialReturn = slip.reduce((acc,s)=> acc * Number(s.odds), 1) * stake;
    const bet = { id: Date.now(), created: new Date().toISOString(), selections: slip, stake, odds: slip.reduce((a,b)=> a * Number(b.odds), 1).toFixed(2), potential: Number(potentialReturn.toFixed(2)), status: 'pending' };
    bets.unshift(bet);
    localStorage.setItem('bwb_bets', JSON.stringify(bets));
    // clear slip
    saveSlip([]);
    renderWallet();
    renderMyBets();
    alert('Bet placed (demo). It will be resolved automatically by the demo engine.');
  }

  // Demo settle engine - randomly resolves pending bets after some time
  function settleEngine(){
    const bets = JSON.parse(localStorage.getItem('bwb_bets')||'[]');
    let changed = false;
    bets.forEach(b=>{
      if(b.status === 'pending'){
        // small chance to settle each iteration
        if(Math.random() < 0.35){
          const win = Math.random() < 0.45; // 45% win chance for demo
          b.status = win ? 'won' : 'lost';
          b.settled_at = new Date().toISOString();
          if(win){
            const wallet = JSON.parse(localStorage.getItem('bwb_wallet'));
            wallet.balance = Number((wallet.balance + b.potential).toFixed(2));
            localStorage.setItem('bwb_wallet', JSON.stringify(wallet));
          }
          changed = true;
        }
      }
    });
    if(changed){ localStorage.setItem('bwb_bets', JSON.stringify(bets)); renderWallet(); renderMyBets(); }
  }
  setInterval(settleEngine, 12000); // run settle every 12s

  // Render my bets
  function renderMyBets(){
    const el = qs('#mybets-list');
    if(!el) return;
    const bets = JSON.parse(localStorage.getItem('bwb_bets')||'[]');
    if(bets.length===0){ el.innerHTML = '<div class="muted">No bets yet. Place one from Matches.</div>'; return; }
    el.innerHTML = bets.map(b=> {
      const statusClass = b.status === 'won' ? 'won' : (b.status==='lost' ? 'lost' : 'pending');
      return `<div class="card" style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>Bet #${b.id}</strong><div class="meta">${new Date(b.created).toLocaleString()}</div></div>
          <div style="text-align:right"><div>Stake: ${fmtRand(b.stake)}</div><div>Odds: ${b.odds}</div><div>Potential: ${fmtRand(b.potential)}</div></div>
        </div>
        <div style="margin-top:8px">Status: <strong class="${statusClass}">${b.status.toUpperCase()}</strong></div>
      </div>`;
    }).join('');
  }
  // helpers for logos
  function slugify(name){
    return (name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  function assetLogo(name){
  // prefer PNG if available; browser will fall back via onerror handler
  return `assets/logos/${slugify(name)}.png`;
  }
  function logoDataURL(name){
    const initials = (name || '').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || 'T';
    let hash = 0; for(let i=0;i<name.length;i++) hash = name.charCodeAt(i) + ((hash<<5)-hash);
    const hue = Math.abs(hash) % 360;
    const bg = `hsl(${hue} 60% 40%)`;
    const fg = '#fff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='${bg}' rx='20'/><text x='50%' y='55%' font-family='Inter, Arial, sans-serif' font-size='48' fill='${fg}' font-weight='700' text-anchor='middle' alignment-baseline='middle'>${initials}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Wallet render and actions
  function renderWallet(){
    const w = JSON.parse(localStorage.getItem('bwb_wallet'));
    qsa('#wallet-balance, #nav-wallet').forEach(el=> { if(el) el.textContent = fmtRand(w.balance || 0); });
  }
  function demoDeposit(){ const w = JSON.parse(localStorage.getItem('bwb_wallet')); w.balance = Number((w.balance + 100).toFixed(2)); localStorage.setItem('bwb_wallet', JSON.stringify(w)); renderWallet(); alert('Deposited R100 (demo)'); }
  function demoWithdraw(){ const w = JSON.parse(localStorage.getItem('bwb_wallet')); if(w.balance < 50) return alert('Insufficient funds'); w.balance = Number((w.balance - 50).toFixed(2)); localStorage.setItem('bwb_wallet', JSON.stringify(w)); renderWallet(); alert('Withdrew R50 (demo)'); }

  // Contact form save
  function saveContact(form){
    const fd = new FormData(form);
    const obj = {}; fd.forEach((v,k)=>obj[k]=v);
    const arr = JSON.parse(localStorage.getItem('bwb_contacts')||'[]'); arr.unshift(obj); localStorage.setItem('bwb_contacts', JSON.stringify(arr));
    const msg = qs('#contact-saved'); if(msg) msg.textContent = 'Message saved (demo)  we will get back to you.';
  }

  // Standings & past fixtures (fake, but semi-realistic)
  function generateStandings(){
    const out = {};
    Object.keys(LEAGUES).forEach(league=>{
      const teams = Array.from(new Set(LEAGUES[league])).slice(0,6);
      const table = teams.map((t,i)=>({pos:i+1, team:t, played: randomInt(10,14), pts: randomInt(15,35), gd: randomInt(-5,20)}));
      out[league] = table.sort((a,b)=>b.pts - a.pts);
    });
    return out;
  }
  function renderStandings(){
    const el = qs('#standings');
    if(!el) return;
    const st = generateStandings();
    el.innerHTML = Object.keys(st).map(league=>{
      const rows = st[league].map(r=>`<tr><td>${r.pos}</td><td>${r.team}</td><td>${r.played}</td><td>${r.gd}</td><td>${r.pts}</td></tr>`).join('');
      return `<h3>${league}</h3><div class="card"><table class="standings"><thead><tr><th>#</th><th>Team</th><th>P</th><th>GD</th><th>Pts</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }).join('');
  }

  // Past fixtures
  function renderPastFixtures(){
    const el = qs('#past-fixtures');
    if(!el) return;
    const past = [];
    fixtures.forEach(f=>{
      if(f.status === 'FINISHED' || (f.homeScore!=null && f.awayScore!=null)){
        past.push({league:f.league, home:f.home, away:f.away, score: (f.homeScore!=null? f.homeScore+'-'+f.awayScore : '0-0'), time: f.time});
      }
    });
    if(past.length===0){ el.innerHTML = '<div class="muted">No past fixtures yet.</div>'; return; }
    el.innerHTML = past.map(p=>`<div class="fixture"><div><strong>${p.league}</strong>  ${p.home} ${p.score} ${p.away}</div><div class="meta">${new Date(p.time).toLocaleString()}</div></div>`).join('');
  }

  // Initialize UI and wire events
  function init(){
    // Nav hamburger: toggle .nav--open and manage aria-expanded for accessibility
    const ham = qs('#hamburger');
    const mainNav = qs('#main-nav');
    if(ham && mainNav){
      ham.addEventListener('click', (e)=>{
        const isOpen = mainNav.classList.toggle('nav--open');
        ham.setAttribute('aria-expanded', String(isOpen));
        if(isOpen){
          document.body.classList.add('lock-scroll');
          // focus first link for keyboard users
          const first = mainNav.querySelector('a'); if(first) first.focus();
        } else {
          document.body.classList.remove('lock-scroll');
        }
      });
      // close menu when clicking outside on small screens
      document.addEventListener('click', (e)=>{
        if(!mainNav.classList.contains('nav--open')) return;
        const within = e.target.closest && e.target.closest('#main-nav');
        const clickedHam = e.target.closest && e.target.closest('#hamburger');
        if(!within && !clickedHam){ mainNav.classList.remove('nav--open'); ham.setAttribute('aria-expanded','false'); document.body.classList.remove('lock-scroll'); }
      });
      // close on Escape
      document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && mainNav.classList.contains('nav--open')){ mainNav.classList.remove('nav--open'); ham.setAttribute('aria-expanded','false'); document.body.classList.remove('lock-scroll'); }
      });
    }

    // Filters
    const lf = qs('#league-filter'); if(lf) lf.addEventListener('change', renderFixtures);
    const s = qs('#search'); if(s) s.addEventListener('input', renderFixtures);

  // Slip render
  renderSlip();
  renderFixtures();
  renderFeatured();
  renderWallet();
  renderMyBets();
  renderStandings();
  renderPastFixtures();
  // sync choice button UI
  setTimeout(updateChoiceButtonStates, 50);

    // Place bet button
    const placeBtn = qs('#place-bet');
    if(placeBtn) placeBtn.addEventListener('click', placeBet);

    // Wallet buttons
    const dep = qs('#demo-deposit'); if(dep) dep.addEventListener('click', demoDeposit);
    const w = qs('#demo-withdraw'); if(w) w.addEventListener('click', demoWithdraw);

    // Auth forms
    const reg = qs('#register-form'); if(reg) reg.addEventListener('submit', (e)=>{ e.preventDefault(); registerUser(reg); });
    const login = qs('#login-form'); if(login) login.addEventListener('submit', (e)=>{ e.preventDefault(); loginUser(login); });

    // Contact form
    const cf = qs('#contact-form'); if(cf) cf.addEventListener('submit', (e)=>{ e.preventDefault(); saveContact(cf); cf.reset(); });

    // periodically refresh fixtures and settle
  setInterval(()=>{ fixtures = generateFixtures(); renderFixtures(); renderFeatured(); renderPastFixtures(); renderStandings(); setTimeout(updateChoiceButtonStates, 50); }, 15000);
  }

  // Expose for console testing
  window.bwb = { generateFixtures, placeBet, renderMyBets, renderWallet };
  document.addEventListener('DOMContentLoaded', init);
})();
