// PRISM TOWER screen (FF1/HH2 Phase 7.5 — was the BONUS ZONE; internal id `bonus`; Phase 7 user design): its stages are
// presented as tower FLOORS. Entry: the pinned home slot ONLY (MMM1 — the region maps carry no Tower entry). Three sections that
// fit without scrolling: XP STAGES (Regular · Great · Ultra · Master — ball icon, level band, XP + candy per win), TREASURE
// STAGES (each stone, the Poké Ball stage, the item stage — headline drop, "1st clear: guaranteed"), and the MEGA STONE
// section shown LOCKED ("Beat Johto to unlock 🔒"). A card opens the normal pre-battle screen for that stage. Data: data/bonus.js.
window.BM = window.BM || {};
BM.BonusScreen = function (ui) {
  const { $, tap, toast } = ui;
  const prof = () => BM.Save.profile();
  const icon = (id) => ui.itemIcon(id);
  function card(st, html, cls) {
    const p = prof(), open = BM.bonusOpen(st, p), wins = p.cleared[st.id] || 0;
    const b = document.createElement('button');
    b.className = 'bz-card ' + cls + (open ? '' : ' locked'); b.dataset.stage = st.id;
    b.innerHTML = html + (open ? (wins ? `<span class="bz-wins">✓ ×${wins}</span>` : '') : '<span class="bz-lock">🔒</span>');
    tap(b, () => {
      if (!open) { BM.Audio.sfx('deny'); toast(`Beat ${BM.stageById(BM.bonusUnlockStage(st)).name} to open this stage!`); return; }
      BM.Audio.sfx('tap'); ui.openPrebattle(st.id);
    });
    return b;
  }
  function render() {
    const xp = $('bz-xp'), tr = $('bz-treasure'), mg = $('bz-mega');
    xp.innerHTML = ''; tr.innerHTML = ''; mg.innerHTML = '';
    for (const st of BM.BONUS_STAGES.filter((s) => s.bonus === 'xp')) {
      const t = BM.BONUS_TIERS.find((x) => x.id === st.tier), candy = Object.entries(st.candy).map(([id, n]) => (n > 1 ? n + '× ' : '') + icon(id)).join('');
      xp.appendChild(card(st, `<span class="bz-ball">${BM.ballHtml(t.ball)}</span><b class="bz-name">${t.name}</b><span class="bz-band">Lv ${t.minLv}+</span>` +
        `<span class="bz-pay">+${t.xp.toLocaleString()} XP · ${candy}</span><span class="bz-fl">${BM.BONUS_TIERS.indexOf(t) + 1}F</span>`, 'xp tier-' + t.id));
    }
    for (const st of BM.BONUS_STAGES.filter((s) => s.bonus === 'treasure')) {
      tr.appendChild(card(st, `<span class="bz-icon">${icon(st.headline)}</span><b class="bz-name">${st.name}</b><span class="bz-band">Lv ${st.level}</span>` +
        `<span class="bz-pay">${(prof().cleared[st.id] || 0) ? BM.ITEMS[st.headline] + ' likely' : '1st clear: ' + BM.ITEMS[st.headline] + '!'}</span>`, 'treasure'));
    }
    const m = document.createElement('button'); m.className = 'bz-card mega locked'; m.id = 'bz-mega-card';
    const ms = BM.Sprites.artSrc('icons/mega_stone');
    m.innerHTML = `<span class="bz-icon">${ms ? `<img src="${ms}" alt="">` : '💎'}</span><b class="bz-name">${BM.BONUS_MEGA.name}</b><span class="bz-pay">${BM.BONUS_MEGA.text}</span>`;
    tap(m, () => { BM.Audio.sfx('deny'); toast(BM.BONUS_MEGA.text); });
    mg.appendChild(m);
    const art = BM.Sprites.artSrc('ui/bonus_zone');
    $('scr-bonus').style.backgroundImage = art ? `linear-gradient(rgba(20,10,40,.35), rgba(20,10,40,.35)), url("${art}")` : '';
    ui.fit($('scr-bonus'));
  }
  tap($('btn-bonus-back'), () => { BM.Audio.sfx('tap'); ui.go(ui.from() || 'title'); }); // MMM1: home is the only entry, so home is the default return
  return { render };
};
