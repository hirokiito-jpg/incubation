(function () {
  const C = window.COURSE;
  const S = window.SESSIONS;
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stageOf = (k) => C.stages.find((s) => s.key === k);

  /* ---------- per-viewer storage (worksheet drafts) ---------- */
  const KEY = 'a2b-worksheet-v1';
  function loadAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function saveField(id, v) {
    try { const all = loadAll(); all[id] = v; localStorage.setItem(KEY, JSON.stringify(all)); return true; } catch (e) { return false; }
  }

  /* ---------- staff / student view ---------- */
  function setMode(staff) {
    document.body.classList.toggle('staff', staff);
    document.querySelectorAll('.mode button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.mode === 'staff') === staff)));
    try { localStorage.setItem('a2b-mode', staff ? 'staff' : 'student'); } catch (e) {}
  }
  document.querySelectorAll('.mode button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode === 'staff')));
  let initialStaff = true;
  try { initialStaff = localStorage.getItem('a2b-mode') !== 'student'; } catch (e) {}
  setMode(initialStaff);

  /* ---------- nav ---------- */
  nav.innerHTML =
    `<a href="#top" data-r="top">全体像</a>` +
    S.map((s) => `<a href="#s${s.no}" data-r="s${s.no}"><span class="n">${s.no}</span>回 ${esc(s.category)}</a>`).join('');

  /* ---------- rep graph: 具体 ↔ 抽象 の往復 ---------- */
  function repGraph(activeNo) {
    const W = 700, H = 170, padL = 56, padR = 24, top = 30, bot = 112;
    const n = C.format.length;
    const x = (i) => padL + (i * (W - padL - padR)) / (n - 1);
    const y = (lvl) => (lvl ? top : bot);
    const pts = C.format.map((f, i) => `${x(i)},${y(f.level)}`).join(' ');
    const dots = C.format.map((f, i) => `
      <circle class="dot${activeNo === f.no ? ' on' : ''}" cx="${x(i)}" cy="${y(f.level)}" r="11"></circle>
      <text class="dnum" x="${x(i)}" y="${y(f.level) + 4.5}"${activeNo === f.no ? ' style="fill:var(--accent-ink)"' : ''}>${f.no}</text>
      <text class="dlabel" x="${x(i)}" y="${bot + 34}">${esc(f.zone)}</text>`).join('');
    return `<div class="rep" role="img" aria-label="7つのステップが、具体から抽象へ上がり、再び具体へ降りる流れ">
      <svg viewBox="0 0 ${W} ${H}">
        <line class="grid" x1="${padL - 10}" x2="${W - padR + 10}" y1="${top}" y2="${top}"></line>
        <line class="grid" x1="${padL - 10}" x2="${W - padR + 10}" y1="${bot}" y2="${bot}"></line>
        <text class="axis" x="4" y="${top + 4}">抽象</text>
        <text class="axis" x="4" y="${bot + 4}">具体</text>
        <polyline class="path" points="${pts}"></polyline>
        ${dots}
      </svg>
    </div>`;
  }

  /* ---------- overview ---------- */
  function overview() {
    const ex = C.ladderExample;
    return `
    <section class="hero" aria-labelledby="h-top">
      <span class="eyebrow">Athletica Incubation Program</span>
      <h1 id="h-top">Athlete <span class="to">to</span><br>Business</h1>
      <p class="sub">${esc(C.subtitle)}</p>
      <p class="lead">${esc(C.lead)}すでに競技を通じて、仕事の土台は「持っている」。この講座は、その力を社会で「使える」ところまで変換します。</p>
      <div class="opening">
        <span class="eyebrow">第1回 冒頭メッセージ</span>
        <p>${esc(C.openingMessage[0])}<br>みんながスポーツでやってきたことを、別の世界でも使えるようにする<strong>“脳の筋トレ”</strong>です。</p>
      </div>
    </section>

    <section aria-labelledby="h-stage">
      <div class="sec-head">
        <span class="eyebrow">Structure</span>
        <h2 id="h-stage">持っている → できる → 使える</h2>
        <p>成長は3段階。土台をゼロから作るのではなく、すでにある力を積み上げていきます。</p>
      </div>
      <div class="stages">
        ${C.stages.map((s) => `
          <div class="stage" data-k="${s.key}">
            <span class="verb">${esc(s.verb)}</span>
            <span class="lbl">${esc(s.label)}</span>
            <p class="body">${esc(s.body)}</p>
            <span class="sess">${s.sessions.map((n) => `第${n}回`).join(' / ')}</span>
            ${s.note ? `<span class="note">${esc(s.note)}</span>` : ''}
          </div>`).join('')}
      </div>
    </section>

    <section aria-labelledby="h-ladder">
      <div class="sec-head">
        <span class="eyebrow">Core Skill</span>
        <h2 id="h-ladder">具体と抽象を行き来する力</h2>
        <p>スポーツの力をそのまま持ち込むのではなく、本質を捉えて別の場面へ転用する。この変換能力が、競技経験をビジネスの武器に変えます。</p>
      </div>
      <div class="ladder">
        <div class="rung lo"><span class="tag">スポーツの具体</span><span class="txt">「${esc(ex.sport)}」</span></div>
        <div class="rung hi"><span class="tag">本質を抽象化</span><span class="txt">${esc(ex.essence)}</span></div>
        <div class="rung lo"><span class="tag">ビジネスの具体へ変換</span><span class="txt">「${esc(ex.business)}」</span></div>
      </div>
      <div class="ladder-axis"><span>具体</span><span>↑ 抽象 ↓</span><span>具体</span></div>
      <p class="ladder-cap">全6回の裏テーマは「具体と抽象を行き来する脳の筋トレ」。毎回この往復を繰り返し、応用が利く人になるための思考筋力を鍛えます。</p>
    </section>

    <section aria-labelledby="h-road">
      <div class="sec-head">
        <span class="eyebrow">6 Sessions</span>
        <h2 id="h-road">6回の構成</h2>
      </div>
      <div class="roadmap">
        ${S.map((s) => `
          <a class="road" href="#s${s.no}" data-k="${s.stage}">
            <span class="no">${String(s.no).padStart(2, '0')}</span>
            <span><span class="cat">${esc(s.category)}</span><br><span class="els">${s.elements.map((e) => esc(e.name)).join('・')}</span></span>
            <span class="go">${esc(stageOf(s.stage).verb)} →</span>
          </a>`).join('')}
      </div>
    </section>

    <section aria-labelledby="h-format">
      <div class="sec-head">
        <span class="eyebrow">Every Session</span>
        <h2 id="h-format">毎回の共通フォーマット</h2>
        <p>7つのステップで、具体から抽象へ上がり、また具体へ降りる。これが1回分の「思考のレップ」です。</p>
      </div>
      ${repGraph(0)}
      <ol class="steps-list">
        ${C.format.map((f) => `<li><span class="n">${f.no}</span><span>${esc(f.name)}</span></li>`).join('')}
      </ol>
    </section>

    <section aria-labelledby="h-change">
      <div class="sec-head">
        <span class="eyebrow">Outcome</span>
        <h2 id="h-change">参加者に起こしたい変化</h2>
      </div>
      <div class="ba">
        <div class="box before"><span class="eyebrow">受講前</span><p class="q">${esc(C.change.before)}</p></div>
        <div class="arrow" aria-hidden="true">→</div>
        <div class="box after">
          <span class="eyebrow">受講後</span>
          <p class="q">${esc(C.change.after)}</p>
          <ul>${C.change.beyond.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
          <p style="font-size:13px;color:var(--muted)">まで、自分で考えられる状態になる。</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="h-path">
      <div class="sec-head">
        <span class="eyebrow">Next Career</span>
        <h2 id="h-path">その先のキャリア導線</h2>
        <p>自己理解が深まると、次の一歩を自分で選べるようになります。</p>
      </div>
      <div class="paths">
        ${C.paths.map((p) => `<div class="path"><span class="need">${esc(p.need)}</span><span class="to">→ ${esc(p.to)}</span><span class="desc">${esc(p.desc)}</span></div>`).join('')}
      </div>
      <p class="launch">Athlete to Businessは単独の研修ではなく、アスレチカのキャリア支援全体の<em>“発射台”</em>です。</p>
    </section>`;
  }

  /* ---------- session page ---------- */
  function field(id, label, placeholder, rows) {
    return `<label class="fld" for="${id}">${esc(label)}
      <textarea id="${id}" data-save="${id}" rows="${rows || 3}" placeholder="${esc(placeholder || '')}"></textarea>
    </label>`;
  }

  function session(s) {
    const st = stageOf(s.stage);
    const worksheetSteps = { 1: '自分のエピソード', 6: '自分の経験に戻すと', 7: '次に試す行動' };
    const steps = C.format.map((f) => {
      const d = (s.steps && s.steps[f.no]) || {};
      const promptHtml = d.prompt
        ? `<p class="prompt">${esc(d.prompt)}${d.draft ? '<span class="draft">仮</span>' : ''}</p>`
        : `<p class="prompt empty">問い・進め方はシナリオ投入予定</p>`;
      const ws = worksheetSteps[f.no] ? field(`s${s.no}-st${f.no}`, worksheetSteps[f.no], '', f.no === 7 ? 2 : 3) : '';
      const conv = f.no === 4 ? converter(s) : '';
      return `
        <div class="step" id="s${s.no}-step${f.no}">
          <div class="head-row"><div class="sn">${f.no}</div><span class="zone">${esc(f.zone)}</span></div>
          <div class="body">
            <h3>${esc(f.name)}</h3>
            ${promptHtml}
            <div class="facil"><b>運営メモ</b><span>目安時間・ファシリテーションの注意点：${d.facil ? esc(d.facil) : '未設定'}</span></div>
            ${conv}
            ${ws}
            <span class="saved" data-saved-for="s${s.no}"></span>
          </div>
        </div>`;
    }).join('');

    const prev = S.find((x) => x.no === s.no - 1);
    const next = S.find((x) => x.no === s.no + 1);

    return `
    <section class="s-head" data-k="${s.stage}" aria-labelledby="h-s">
      <div class="s-meta">
        <span class="s-no"><b>${String(s.no).padStart(2, '0')}</b>/ 06</span>
        <span class="chip">${esc(st.verb)}｜${esc(st.label)}</span>
      </div>
      <h1 class="cat" id="h-s">${esc(s.category)}</h1>
      <p class="q">${esc(s.title)}</p>
      <div class="stage-track" aria-label="3段階の中での位置">
        ${C.stages.map((x) => `<span class="${x.key === s.stage ? 'on' : ''}">${esc(x.verb)}</span>`).join('<span style="border:0;padding:0">→</span>')}
      </div>
      ${s.opening ? `<div class="opening"><span class="eyebrow">冒頭で伝えること</span><p>${esc(C.openingMessage[0])}<br>みんながスポーツでやってきたことを、別の世界でも使えるようにする<strong>“脳の筋トレ”</strong>です。</p></div>` : ''}
      <div class="goal"><span class="eyebrow">Today's Goal</span><p>${esc(s.goal)}</p></div>
    </section>

    <section aria-labelledby="h-el">
      <div class="sec-head">
        <span class="eyebrow">${s.no === 1 ? 'GRIT' : s.no === 6 ? 'Review' : '社会人基礎力'}</span>
        <h2 id="h-el">今回扱う力</h2>
      </div>
      <div class="elements">
        ${s.elements.map((e) => `<div class="el"><span class="name">${esc(e.name)}${e.ja ? `<small>${esc(e.ja)}</small>` : ''}</span><span class="def">${esc(e.def)}</span></div>`).join('')}
      </div>
    </section>

    <section aria-labelledby="h-steps">
      <div class="sec-head">
        <span class="eyebrow">Training Menu</span>
        <h2 id="h-steps">今日のトレーニングメニュー</h2>
        <p>具体 → 抽象 → 具体 の往復を1セット。書き込んだ内容はこのブラウザにだけ保存されます。</p>
      </div>
      ${repGraph(0)}
      <div style="margin-top:12px">${steps}</div>
    </section>

    ${s.inventory ? inventory(s) : ''}

    <nav class="pager" aria-label="前後の回">
      ${prev ? `<a href="#s${prev.no}"><small>← 第${prev.no}回</small><b>${esc(prev.category)}</b></a>` : `<a href="#top"><small>←</small><b>全体像</b></a>`}
      ${next ? `<a class="next" href="#s${next.no}"><small>第${next.no}回 →</small><b>${esc(next.category)}</b></a>` : `<a class="next" href="#top"><small>→</small><b>全体像に戻る</b></a>`}
    </nav>`;
  }

  function converter(s) {
    const ex = s.example;
    return `<div>
      <div class="conv">
        <div class="cell"><span class="tag">スポーツの具体</span><textarea id="s${s.no}-c1" data-save="s${s.no}-c1" rows="3" placeholder="例）${esc(ex.sport)}"></textarea></div>
        <span class="arr" aria-hidden="true">→</span>
        <div class="cell hi"><span class="tag">本質（社会人基礎力の言葉で）</span><textarea id="s${s.no}-c2" data-save="s${s.no}-c2" rows="3" placeholder="例）${esc(ex.essence)}"></textarea></div>
        <span class="arr" aria-hidden="true">→</span>
        <div class="cell"><span class="tag">ビジネスの具体</span><textarea id="s${s.no}-c3" data-save="s${s.no}-c3" rows="3" placeholder="例）${esc(ex.business)}"></textarea></div>
      </div>
      <p class="conv-ex">変換シート：ステップ3〜5をこの3マスで行き来します。</p>
    </div>`;
  }

  function inventory(s) {
    return `
    <section aria-labelledby="h-inv">
      <div class="sec-head">
        <span class="eyebrow">Career Conversion</span>
        <h2 id="h-inv">棚卸しシート</h2>
        <p>ここまでの5回を振り返り、「自分は社会でどんな経験を積むべきか」まで落とします。</p>
      </div>
      <div class="inventory">
        ${field('s6-strong', '自分はここが強い', '例）断られても次の一手を考え続けられる（Tenacity × 実行力）', 4)}
        ${field('s6-weak', 'ここはまだ弱い', '例）数字で状況を説明すること（課題発見力）', 4)}
        ${field('s6-next', 'だから次にこの経験を積む', '例）目標数字を持つ営業の現場で、半年やりきる', 4)}
      </div>
      <div class="sec-head" style="margin-top:32px">
        <h3 style="font-size:18px">次の一歩を選ぶ</h3>
      </div>
      <div class="path-pick" role="radiogroup" aria-label="次の一歩">
        ${C.paths.map((p, i) => `<label for="s6-path-${i}"><input type="radio" name="s6-path" id="s6-path-${i}" value="${i}"><span class="need">${esc(p.need)}</span><span class="to">→ ${esc(p.to)}</span></label>`).join('')}
      </div>
    </section>`;
  }

  /* ---------- wire up worksheet inputs ---------- */
  function bindInputs() {
    const all = loadAll();
    app.querySelectorAll('[data-save]').forEach((el) => {
      const id = el.dataset.save;
      if (all[id]) el.value = all[id];
      el.addEventListener('input', () => {
        const ok = saveField(id, el.value);
        const tag = el.closest('.body, section')?.querySelector('.saved');
        if (tag) tag.textContent = ok ? 'このブラウザに保存しました' : '保存できない環境です（入力内容は画面を閉じると消えます）';
      });
    });
    app.querySelectorAll('input[name="s6-path"]').forEach((r) => {
      if (all['s6-path'] === r.value) r.checked = true;
      r.addEventListener('change', () => saveField('s6-path', r.value));
    });
  }

  /* ---------- router (#top, #s1..#s6) ---------- */
  function route() {
    const h = (location.hash || '#top').slice(1);
    const m = /^s([1-6])$/.exec(h);
    const s = m ? S.find((x) => x.no === Number(m[1])) : null;
    app.innerHTML = s ? session(s) : overview();
    document.title = s ? `第${s.no}回 ${s.category}｜Athlete to Business` : 'Athlete to Business';
    nav.querySelectorAll('a').forEach((a) => a.toggleAttribute('aria-current', a.dataset.r === (s ? `s${s.no}` : 'top')));
    nav.querySelectorAll('a[aria-current]').forEach((a) => { a.setAttribute('aria-current', 'page'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
    bindInputs();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
