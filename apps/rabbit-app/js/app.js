const {
  CHARACTER_IMAGES,
  EXPRESSIONS,
  SCENES,
  PERSONALITIES,
  EXCLUSIVE_ITEMS,
  HITBOX_REACTIONS,
  GREETINGS,
  RANDOM_DIALOGUES,
  ALERT_SCENARIOS,
  SKETCH_PRESETS,
  DEFAULT_DIARIES,
  generateAnyueReply,
} = window.AnYueData;
const soundFX = window.AnYueAudio;

const STORAGE_DIARY_KEY = 'anyue_diaries_v1';
const STORAGE_TRUST_KEY = 'anyue_trust_v1';

const state = {
  tab: 'home',
  sceneId: 'starlight_camp',
  expression: 'default',
  dialogue: '「等、等一下！前面好像有什么……先别动，让我看清楚。」',
  dialogueTag: '经典台词',
  activeAnim: '',
  radioActive: false,
  showHotspots: false,
  selectedTrait: 'observant',
  showcaseExpr: 'default',
  alertLevel: 0, // 0: standby, 1: caution, 2: critical
  alertScenarioId: 'footprint',
  radioStep: 0,
  diaryFormOpen: false,
  draftImage: null,
  draftSketch: 'star_fragment',
  trust: Number(localStorage.getItem(STORAGE_TRUST_KEY) || 38),
  diaries: loadDiaries(),
};

function loadDiaries() {
  try {
    const raw = localStorage.getItem(STORAGE_DIARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore storage errors
  }
  return [...DEFAULT_DIARIES];
}

function saveDiaries() {
  try {
    localStorage.setItem(STORAGE_DIARY_KEY, JSON.stringify(state.diaries));
  } catch (e) {
    showToast('本地存储空间不足，已保留当前会话记录');
  }
}

function bumpTrust(delta = 3) {
  state.trust = Math.min(100, state.trust + delta);
  localStorage.setItem(STORAGE_TRUST_KEY, String(state.trust));
}

// DOM Refs
const appMain = document.getElementById('appMain');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const quickAlertBtn = document.getElementById('quickAlertBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const toastBanner = document.getElementById('toastBanner');

let toastTimer = null;
function showToast(msg) {
  toastBanner.textContent = msg;
  toastBanner.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastBanner.classList.add('hidden'), 2400);
}

function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSkyDecor(sceneId) {
  const extra =
    sceneId === 'luminous_forest'
      ? `<circle cx="52" cy="240" r="3" fill="#9AF0D8" class="twinkle"/>
         <circle cx="315" cy="215" r="2.5" fill="#F6DC80" class="twinkle-delay"/>
         <path d="M0 320 Q70 250 130 320 T260 310 T380 325 L380 390 L0 390 Z" fill="rgba(22,34,48,0.5)"/>`
      : sceneId === 'observatory_ruins'
      ? `<circle cx="190" cy="180" r="78" fill="none" stroke="rgba(246,220,128,0.16)" stroke-dasharray="4 5"/>
         <path d="M25 340 L60 270 L95 340 M290 340 L315 260 L345 340" stroke="rgba(250,246,238,0.14)" stroke-width="2" fill="none"/>`
      : sceneId === 'dawn_outpost'
      ? `<ellipse cx="195" cy="360" rx="190" ry="65" fill="rgba(252,234,168,0.16)"/>`
      : `<path d="M40 72 L95 52 L148 84 L212 46" stroke="rgba(184,199,217,0.22)" stroke-dasharray="3 4" fill="none"/>`;

  return `
    <div class="scene-sky-decor" aria-hidden="true">
      <svg viewBox="0 0 360 390" preserveAspectRatio="none">
        <path d="M298 34 A22 22 0 1 0 326 68 A18 18 0 1 1 298 34 Z" fill="#F6DC80" opacity="0.88"/>
        <path d="M62 42 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5-6 -6-2.5 6-2.5z" fill="#FCEAA8" class="twinkle"/>
        <path d="M242 74 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2-4.5 -4.5-2 4.5-2z" fill="#FAF6EE" class="twinkle-delay"/>
        <circle cx="118" cy="34" r="1.8" fill="#FAF6EE" opacity="0.7"/>
        <circle cx="176" cy="58" r="1.5" fill="#F6DC80" opacity="0.8"/>
        <circle cx="38" cy="128" r="2" fill="#B8C7D9" opacity="0.6"/>
        <circle cx="322" cy="138" r="1.8" fill="#FAF6EE" opacity="0.7"/>
        ${extra}
      </svg>
    </div>
  `;
}

function renderSketchSVG(sketchId) {
  if (sketchId === 'glow_print') {
    return `<svg viewBox="0 0 220 92" width="100%" height="92" style="background:#1F183B;border-radius:12px;">
      <path d="M20 72 Q110 22 200 60" stroke="#8FA4BC" stroke-dasharray="4 4" fill="none" stroke-width="1.5"/>
      <ellipse cx="64" cy="52" rx="9" ry="13" fill="#B8C7D9" opacity="0.85" transform="rotate(14 64 52)"/>
      <ellipse cx="114" cy="40" rx="9" ry="13" fill="#F6DC80" opacity="0.9" transform="rotate(8 114 40)"/>
      <ellipse cx="164" cy="48" rx="9" ry="13" fill="#B8C7D9" opacity="0.85" transform="rotate(16 164 48)"/>
      <text x="14" y="20" fill="#FCEAA8" font-size="10">手绘草图 · 荧光足迹间距 42cm</text>
    </svg>`;
  }
  if (sketchId === 'moon_moss') {
    return `<svg viewBox="0 0 220 92" width="100%" height="92" style="background:#1D2E44;border-radius:12px;">
      <path d="M40 76 C45 48, 75 40, 82 76" stroke="#9AF0D8" fill="rgba(154,240,216,0.2)" stroke-width="2"/>
      <path d="M95 76 C105 32, 138 30, 146 76" stroke="#F6DC80" fill="rgba(246,220,128,0.2)" stroke-width="2"/>
      <circle cx="118" cy="28" r="4" fill="#FCEAA8"/>
      <text x="14" y="20" fill="#FAF6EE" font-size="10">手绘草图 · 夜光苔藓叶脉样本</text>
    </svg>`;
  }
  if (sketchId === 'radio_wave') {
    return `<svg viewBox="0 0 220 92" width="100%" height="92" style="background:#231B42;border-radius:12px;">
      <path d="M16 54 L48 54 L58 26 L70 74 L84 36 L98 66 L112 46 L128 54 L204 54" stroke="#F6DC80" stroke-width="2.2" fill="none"/>
      <text x="14" y="20" fill="#FCEAA8" font-size="10">手绘草图 · 38.4MHz 脉冲波形</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 220 92" width="100%" height="92" style="background:#221942;border-radius:12px;">
    <path d="M110 20 L116 38 L134 44 L116 50 L110 68 L104 50 L86 44 L104 38 Z" fill="#F6DC80"/>
    <circle cx="62" cy="48" r="2.5" fill="#FAF6EE"/>
    <circle cx="164" cy="36" r="2" fill="#F2B4BA"/>
    <circle cx="158" cy="64" r="3" fill="#B8C7D9"/>
    <text x="14" y="20" fill="#FCEAA8" font-size="10">手绘草图 · 星尘余晖方位角</text>
  </svg>`;
}

function renderCharacterRig({ expr = state.expression, large = false } = {}) {
  const imgSrc = CHARACTER_IMAGES[expr] || CHARACTER_IMAGES.default;
  return `
    <div class="character-rig ${large ? 'large' : ''} ${state.showHotspots ? 'show-hotspots' : ''}" id="characterRig">
      <div class="character-shadow"></div>
      <div class="radio-waves ${state.radioActive ? 'active' : ''}" id="radioWaves"></div>
      <div class="character-sprite-wrap ${state.activeAnim}" id="charSpriteWrap">
        <img class="character-img" src="${imgSrc}" alt="安月 An Yue" />
        <button class="hitbox hitbox-left-ear" data-part="leftEar" aria-label="轻触左耳"><span class="hitbox-dot">左耳</span></button>
        <button class="hitbox hitbox-right-ear" data-part="rightEar" aria-label="轻触右耳"><span class="hitbox-dot">右耳</span></button>
        <button class="hitbox hitbox-head" data-part="head" aria-label="轻拍头部"><span class="hitbox-dot">头部</span></button>
        <button class="hitbox hitbox-walkie" data-part="walkie" aria-label="点击黄色对讲机"><span class="hitbox-dot">对讲机</span></button>
        <button class="hitbox hitbox-notebook" data-part="notebook" aria-label="打开观察笔记本"><span class="hitbox-dot">笔记本</span></button>
      </div>
      <div class="fx-layer" id="fxLayer"></div>
    </div>
  `;
}

function spawnParticles(symbols = ['✦', '♡']) {
  const layer = document.getElementById('fxLayer');
  if (!layer) return;
  symbols.forEach((sym, i) => {
    const el = document.createElement('span');
    el.className = 'fx-float';
    el.textContent = sym;
    el.style.left = `${34 + i * 18 + Math.random() * 14}%`;
    el.style.top = `${22 + Math.random() * 24}%`;
    el.style.color = sym === '♡' ? '#F2B4BA' : '#F6DC80';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1050);
  });
}

function triggerHitbox(part) {
  if (part === 'notebook') {
    soundFX.notebookFlip();
    state.expression = 'happy';
    state.activeAnim = 'anim-bounce';
    state.dialogue = HITBOX_REACTIONS.notebook[0].line;
    state.dialogueTag = HITBOX_REACTIONS.notebook[0].badge;
    bumpTrust(2);
    openQuickNotebookModal();
    return;
  }

  const list = HITBOX_REACTIONS[part] || HITBOX_REACTIONS.head;
  const pick = list[Math.floor(Math.random() * list.length)];
  state.expression = pick.expr;
  state.dialogue = pick.line;
  state.dialogueTag = pick.badge;
  bumpTrust(3);

  if (part === 'walkie') {
    soundFX.walkieBeep();
    state.radioActive = true;
    state.activeAnim = 'anim-bounce';
    setTimeout(() => {
      state.radioActive = false;
      const w = document.getElementById('radioWaves');
      if (w) w.classList.remove('active');
    }, 2200);
  } else if (part === 'leftEar' || part === 'rightEar') {
    soundFX.earTap();
    state.activeAnim = 'anim-wiggle';
  } else {
    soundFX.chime();
    state.activeAnim = 'anim-bounce';
  }

  render();
  spawnParticles(part === 'walkie' ? ['📡', '✦'] : pick.expr === 'shy' ? ['♡', '✦'] : ['✦', '！']);
  setTimeout(() => {
    state.activeAnim = '';
  }, 500);
}

/* ===========================
   VIEW 1: HOME
   =========================== */
function renderHome() {
  const scene = SCENES.find((s) => s.id === state.sceneId) || SCENES[0];
  return `
    <div class="page-pad">
      <div class="scene-pills" role="tablist" aria-label="切换探索场景">
        ${SCENES.map(
          (s) => `
          <button class="scene-pill ${s.id === scene.id ? 'active' : ''}" data-scene="${s.id}">
            <span>${s.badgeIcon}</span><span>${s.name}</span>
          </button>`
        ).join('')}
      </div>

      <section class="scene-stage ${scene.bgClass}">
        ${renderSkyDecor(scene.id)}
        <div class="stage-top-meta">
          <div class="mood-pill">
            <span>今日心情</span>
            <strong>${scene.mood}</strong>
            <span>${scene.moodStars}</span>
          </div>
          <button class="scene-chip-btn" id="cycleSceneBtn">${scene.weather} ↻</button>
        </div>

        ${renderCharacterRig({ expr: state.expression })}

        <div class="dialogue-bubble" id="homeDialogueBubble" title="点击切换对话">
          <div class="dialogue-meta-row">
            <span class="dialogue-tag">${escapeHTML(state.dialogueTag)}</span>
            <span>点击角色部位互动 · 点击气泡换一句</span>
          </div>
          <div>${escapeHTML(state.dialogue)}</div>
        </div>
      </section>

      <div class="quick-action-grid">
        <button class="action-tile" data-action="patHead">
          <span class="action-emoji">🐰</span>
          <span>轻拍安月</span>
        </button>
        <button class="action-tile" data-action="useWalkie">
          <span class="action-emoji">📻</span>
          <span>对讲呼叫</span>
        </button>
        <button class="action-tile" data-action="openDiary">
          <span class="action-emoji">📓</span>
          <span>探索日记</span>
        </button>
        <button class="action-tile highlight-alert" data-action="triggerAnomaly">
          <span class="action-emoji">🚨</span>
          <span>发现异常!</span>
        </button>
      </div>

      <div class="card">
        <div class="section-heading">
          <h3>☾ 今日探索状态</h3>
          <span class="section-sub">默契度 ${state.trust}%</span>
        </div>
        <div class="trust-meter">
          <span style="font-size:12px;color:var(--yellow);font-weight:700;">羁绊</span>
          <div class="trust-bar-track"><div class="trust-bar-fill" style="width:${state.trust}%"></div></div>
          <span style="font-size:11.5px;color:var(--slate-light);">已记录 ${state.diaries.length} 篇</span>
        </div>
      </div>
    </div>
  `;
}

/* ===========================
   VIEW 2: CHARACTER DOSSIER
   =========================== */
function renderCharacter() {
  const trait = PERSONALITIES.find((t) => t.id === state.selectedTrait) || PERSONALITIES[0];
  const exprObj = EXPRESSIONS.find((e) => e.id === state.showcaseExpr) || EXPRESSIONS[0];

  return `
    <div class="page-pad">
      <section class="card char-hero-card">
        <div class="char-avatar-box">
          <img src="${CHARACTER_IMAGES.default}" alt="安月立绘" />
        </div>
        <div class="char-info">
          <div class="char-en">AN YUE · ORIGINAL IP</div>
          <h2>安月</h2>
          <div class="char-role-tags">
            <span class="role-tag">探索者</span>
            <span class="role-tag">观察记录员</span>
            <span class="role-tag">异常线索记录者</span>
          </div>
          <div class="classic-quote">「等、等一下！前面好像有什么……」</div>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <h3>✦ 性格关键词</h3>
          <span class="section-sub">点击查看性格侧面</span>
        </div>
        <div class="trait-grid">
          ${PERSONALITIES.map(
            (p) => `
            <button class="trait-btn ${p.id === trait.id ? 'active' : ''}" data-trait="${p.id}">
              <strong>${p.keyword}</strong>
              <span>${p.en}</span>
            </button>`
          ).join('')}
        </div>
        <div class="trait-detail-box">
          <div><strong style="color:${trait.color}">${trait.keyword}</strong> — ${trait.summary}</div>
          <div style="margin-top:4px;opacity:0.9;">${trait.detail}</div>
          <div class="quote">${trait.quote}</div>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <h3>☾ 角色表情展示区</h3>
          <span class="section-sub">${exprObj.badge}</span>
        </div>
        <div class="expr-selector">
          ${EXPRESSIONS.map(
            (e) => `
            <button class="expr-chip ${e.id === exprObj.id ? 'active' : ''}" data-expr="${e.id}">${e.label}</button>`
          ).join('')}
        </div>
        <div class="expr-stage">
          <img src="${CHARACTER_IMAGES[exprObj.id]}" alt="${exprObj.label}" />
          <div class="expr-info">
            <h4>${exprObj.label}</h4>
            <p>${exprObj.note}</p>
            <div style="font-size:12px;color:var(--yellow-soft);font-weight:600;">${exprObj.quote}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <h3>🎒 角色专属物品</h3>
          <span class="section-sub">EXPLORER GEAR</span>
        </div>
        <div class="item-list">
          ${EXCLUSIVE_ITEMS.map(
            (item) => `
            <div class="item-card">
              <div class="item-card-head">
                <strong>${item.name}</strong>
                <span class="item-tag">${item.tag}</span>
              </div>
              <p>${item.desc}</p>
              <button class="mini-link-btn" data-gear-action="${item.actionType}">${item.actionLabel} →</button>
            </div>`
          ).join('')}
        </div>
      </section>

      <section class="card-cream">
        <div class="section-heading">
          <h3>📖 角色背景故事</h3>
          <span style="font-size:11px;color:var(--cream-muted);font-weight:700;">ARCHIVE #01</span>
        </div>
        <p style="margin:0;font-size:12.5px;line-height:1.7;color:#41385A;">
          安月是一只喜欢在暮色与星夜交界处巡查的白兔观察员。她有着格外敏感的长耳朵，常常还没看见影子就已经听见风里的微小异响。虽然很容易紧张、甚至一边发抖一边握紧黄色对讲机，但她比任何人都更重视“被遗忘的细微线索”。只要确认身边还有同伴，她就会翻开斜挎包里的观察笔记本，把今晚的异常与温柔星光一起认真画下来。
        </p>
      </section>
    </div>
  `;
}

/* ===========================
   VIEW 3: EXPLORATION DIARY
   =========================== */
function renderDiary() {
  const today = new Date().toISOString().slice(0, 10);
  return `
    <div class="page-pad">
      <section class="notebook-paper">
        <div class="notebook-spiral" aria-hidden="true">
          ${Array.from({ length: 12 }).map(() => '<span class="spiral-ring"></span>').join('')}
        </div>

        <div class="notebook-header">
          <div>
            <h2>📓 安月的观察笔记本</h2>
            <div style="font-size:11px;color:var(--cream-muted);margin-top:2px;">共收录 ${state.diaries.length} 份探索档案卡</div>
          </div>
          <button class="primary-btn" id="toggleDiaryFormBtn">
            ${state.diaryFormOpen ? '收起' : '+ 写新记录'}
          </button>
        </div>

        ${
          state.diaryFormOpen
            ? `
          <form class="diary-form" id="diaryForm">
            <div class="form-row">
              <input class="input-field" type="date" id="diaryDate" value="${today}" required style="flex:1.1;" />
              <select class="select-field" id="diaryTag" style="flex:1;">
                <option value="星象异常">星象异常</option>
                <option value="足迹线索">足迹线索</option>
                <option value="植物微光">植物微光</option>
                <option value="日常碎片">日常碎片</option>
              </select>
            </div>
            <input class="input-field" type="text" id="diaryTitle" placeholder="今天发现了什么？（如：林间微光小径）" required maxlength="36" />
            <textarea class="textarea-field" id="diaryContent" placeholder="记录时间、细节与感受，安月会认真回应你……" required maxlength="300"></textarea>

            <div>
              <div style="font-size:11.5px;color:var(--cream-muted);margin-bottom:6px;">配图方式：上传照片 或 选择手绘贴图</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                <label class="upload-label">
                  📷 上传图片
                  <input type="file" id="diaryImageInput" accept="image/*" hidden />
                </label>
                ${
                  state.draftImage
                    ? '<span style="font-size:11.5px;color:#3E6B48;font-weight:700;">已选择图片 ✓</span> <button type="button" id="clearDraftImgBtn" style="border:none;background:none;color:#B24950;font-size:11.5px;cursor:pointer;">清除</button>'
                    : ''
                }
              </div>
              <div class="sketch-picker">
                ${SKETCH_PRESETS.map(
                  (sk) => `
                  <button type="button" class="sketch-option ${state.draftSketch === sk.id ? 'active' : ''}" data-sketch="${sk.id}">
                    ✎ ${sk.label}
                  </button>`
                ).join('')}
              </div>
            </div>

            <button type="submit" class="primary-btn" style="justify-content:center;padding:11px;">
              保存并生成专属探索记录卡 ✦
            </button>
          </form>
        `
            : ''
        }

        <div class="diary-list">
          ${state.diaries
            .map(
              (entry) => `
            <article class="diary-entry-card" data-entry-id="${entry.id}">
              <div class="entry-top">
                <span class="entry-badge">${escapeHTML(entry.code)} · ${escapeHTML(entry.tag)}</span>
                <span>${escapeHTML(entry.date)}</span>
              </div>
              <h3 class="entry-title">${escapeHTML(entry.title)}</h3>
              <p class="entry-body">${escapeHTML(entry.content)}</p>
              ${
                entry.imageData
                  ? `<img class="entry-thumb" src="${entry.imageData}" alt="${escapeHTML(entry.title)}" />`
                  : `<div style="margin-bottom:8px;">${renderSketchSVG(entry.sketchId)}</div>`
              }
              <div class="anyue-mini-reply">
                <img src="${CHARACTER_IMAGES.happy}" alt="安月" />
                <div>
                  <strong style="color:var(--purple-soft);">安月的回应：</strong>
                  ${escapeHTML(entry.anyueReply)}
                  <div style="margin-top:4px;color:var(--orange-trim);font-weight:700;">点击查看专属探索记录卡 →</div>
                </div>
              </div>
            </article>`
            )
            .join('')}
        </div>
      </section>
    </div>
  `;
}

/* ===========================
   VIEW 4: ANOMALY ALERT
   =========================== */
function renderAlert() {
  const scenario = ALERT_SCENARIOS.find((s) => s.id === state.alertScenarioId) || ALERT_SCENARIOS[0];
  const levelNames = ['待机巡查中', '一级预警 · 发现异响', '二级警报 · 紧急呼叫同伴'];
  const exprForLevel = state.alertLevel === 0 ? 'default' : state.alertLevel === 1 ? 'surprised' : 'alert';
  const alertLine =
    state.alertLevel === 0
      ? '「周围暂时安静，黄色对讲机处于待机监听状态。」'
      : state.alertLevel === 1
      ? '「等、等一下！前面好像有什么……先记下位置再确认！」'
      : scenario.radioLog[state.radioStep % scenario.radioLog.length];

  return `
    <div class="page-pad">
      <section class="alert-stage level-${state.alertLevel}">
        <div class="radar-ring"></div>
        <div class="alert-status-bar">
          <span class="status-chip">${levelNames[state.alertLevel]}</span>
          <span style="font-size:11px;color:var(--yellow-soft);font-weight:700;">${scenario.code}</span>
        </div>

        ${renderCharacterRig({ expr: exprForLevel })}

        <div class="dialogue-bubble" style="border-color:${state.alertLevel === 2 ? '#F27D83' : '#F6DC80'};">
          <div class="dialogue-meta-row">
            <span class="dialogue-tag">${state.alertLevel === 2 ? '📡 对讲机播报中' : '观察员状态'}</span>
            <span>${scenario.location}</span>
          </div>
          <div>${escapeHTML(alertLine)}</div>
        </div>
      </section>

      <button class="alert-trigger-btn" id="anomalyActionBtn">
        <span>🚨</span>
        <span>${state.alertLevel < 2 ? '点击触发：发现异常！举起对讲机呼叫' : '切换下一条对讲机播报 / 解除警报'}</span>
      </button>

      <div class="alert-level-tabs">
        <button class="level-tab ${state.alertLevel === 0 ? 'active' : ''}" data-level="0">01 待机巡查</button>
        <button class="level-tab ${state.alertLevel === 1 ? 'active' : ''}" data-level="1">02 一级预警</button>
        <button class="level-tab ${state.alertLevel === 2 ? 'active' : ''}" data-level="2">03 警戒呼叫</button>
      </div>

      <section class="card">
        <div class="section-heading">
          <h3>📡 异常线索档案与同伴提醒</h3>
          <span class="section-sub">切换线索案例</span>
        </div>
        <div class="scene-pills" style="margin-bottom:10px;">
          ${ALERT_SCENARIOS.map(
            (sc) => `
            <button class="scene-pill ${sc.id === scenario.id ? 'active' : ''}" data-scenario="${sc.id}">${sc.name}</button>`
          ).join('')}
        </div>

        <div class="radio-log-box">
          <div class="radio-msg">
            <strong style="color:var(--yellow);">线索摘要：</strong>${escapeHTML(scenario.clue)}
          </div>
          ${scenario.radioLog
            .map(
              (line, idx) => `
            <div class="radio-msg" style="border-left-color:${idx === state.radioStep && state.alertLevel === 2 ? '#F27D83' : '#8FA4BC'};">
              <strong style="color:var(--slate-light);">呼叫步骤 ${idx + 1}：</strong>${escapeHTML(line)}
            </div>`
            )
            .join('')}
        </div>

        <button class="primary-btn yellow-btn" id="logAnomalyToDiaryBtn" style="width:100%;justify-content:center;margin-top:12px;">
          📓 将此异常线索记入探索日记
        </button>
      </section>
    </div>
  `;
}

/* ===========================
   VIEW 5: INTERACTION STUDIO
   =========================== */
function renderInteraction() {
  return `
    <div class="page-pad">
      <section class="scene-stage scene-ruins" style="min-height:430px;">
        ${renderSkyDecor('observatory_ruins')}
        <div class="stage-top-meta">
          <div class="mood-pill">
            <span>探索默契度</span>
            <strong>${state.trust}%</strong>
          </div>
          <button class="scene-chip-btn" id="toggleHotspotsBtn">
            ${state.showHotspots ? '隐藏热区 ◎' : '显示互动热区 ◉'}
          </button>
        </div>

        ${renderCharacterRig({ expr: state.expression, large: true })}

        <div class="dialogue-bubble" id="interactionBubble">
          <div class="dialogue-meta-row">
            <span class="dialogue-tag">${escapeHTML(state.dialogueTag)}</span>
            <span>点击耳朵 / 头部 / 对讲机 / 笔记本</span>
          </div>
          <div>${escapeHTML(state.dialogue)}</div>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <h3>✨ 快捷部位互动</h3>
          <span class="section-sub">也可直接点击角色身上</span>
        </div>
        <div class="interaction-btn-grid">
          <button class="interact-pill-btn" data-part-btn="head">🐰 轻拍头部 (害羞/惊讶)</button>
          <button class="interact-pill-btn" data-part-btn="leftEar">👂 轻触长耳朵</button>
          <button class="interact-pill-btn" data-part-btn="walkie">📻 点击黄色对讲机</button>
          <button class="interact-pill-btn" data-part-btn="notebook">📓 翻看观察笔记本</button>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <h3>🌙 日常问候与随机对话</h3>
          <span class="section-sub">DAILY TALK</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          ${Object.entries(GREETINGS)
            .map(
              ([key, g]) => `
            <button class="scene-pill" data-greeting="${key}">${g.label}</button>`
            )
            .join('')}
        </div>
        <button class="primary-btn yellow-btn" id="randomDialogueBtn" style="width:100%;justify-content:center;">
          💬 听听安月现在在想什么（随机对话）
        </button>
      </section>
    </div>
  `;
}

/* ===========================
   MODALS: RECORD CARD & QUICK NOTEBOOK
   =========================== */
function openRecordCardModal(entryId) {
  const entry = state.diaries.find((d) => d.id === entryId);
  if (!entry) return;

  modalContent.innerHTML = `
    <div class="record-card-frame">
      <div class="record-stamp">AN YUE VERIFIED</div>
      <div style="font-size:11px;color:var(--cream-muted);font-weight:700;letter-spacing:0.06em;">
        EXPLORATION RECORD · ${escapeHTML(entry.code)}
      </div>
      <h3 style="margin:6px 0 4px;font-size:17px;color:var(--cream-ink);">${escapeHTML(entry.title)}</h3>
      <div style="font-size:11.5px;color:var(--purple-soft);font-weight:700;margin-bottom:10px;">
        📅 ${escapeHTML(entry.date)} · 🏷 ${escapeHTML(entry.tag)}
      </div>

      ${
        entry.imageData
          ? `<img src="${entry.imageData}" alt="探索记录照片" style="width:100%;max-height:180px;object-fit:cover;border-radius:12px;margin-bottom:10px;border:1.5px solid #D8CEBC;" />`
          : `<div style="margin-bottom:10px;">${renderSketchSVG(entry.sketchId)}</div>`
      }

      <p style="margin:0 0 12px;font-size:13px;line-height:1.65;color:#3F3757;">
        ${escapeHTML(entry.content)}
      </p>

      <div class="anyue-mini-reply" style="margin-bottom:12px;">
        <img src="${CHARACTER_IMAGES.happy}" alt="安月" />
        <div>
          <strong>安月的批注：</strong>${escapeHTML(entry.anyueReply)}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <span style="font-size:11px;color:var(--cream-muted);">观察员：安月 An Yue ☾</span>
        <button class="primary-btn" id="closeModalBtn">收起记录卡</button>
      </div>
    </div>
  `;
  modalOverlay.classList.remove('hidden');
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
}

function openQuickNotebookModal() {
  const latest = state.diaries[0];
  modalContent.innerHTML = `
    <div class="record-card-frame">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <strong style="font-size:15px;">📓 随身观察笔记本</strong>
        <span style="font-size:11px;color:var(--cream-muted);">共 ${state.diaries.length} 篇</span>
      </div>
      ${
        latest
          ? `
        <div style="background:#FFF;border-radius:12px;padding:10px;border:1px solid #DFD5C3;margin-bottom:10px;">
          <div style="font-size:11px;color:var(--purple-soft);font-weight:700;">最新记录 · ${escapeHTML(latest.code)} (${escapeHTML(latest.date)})</div>
          <div style="font-size:14px;font-weight:700;margin:4px 0;">${escapeHTML(latest.title)}</div>
          <div style="font-size:12px;color:#4D4663;line-height:1.55;">${escapeHTML(latest.content)}</div>
        </div>`
          : ''
      }
      <div style="display:flex;gap:8px;">
        <button class="primary-btn" id="goFullDiaryBtn" style="flex:1;justify-content:center;">打开完整日记本 →</button>
        <button class="primary-btn yellow-btn" id="closeModalBtn">关闭</button>
      </div>
    </div>
  `;
  modalOverlay.classList.remove('hidden');
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('goFullDiaryBtn').addEventListener('click', () => {
    closeModal();
    switchTab('diary');
  });
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* ===========================
   MAIN RENDER & EVENT WIRING
   =========================== */
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.quick-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.jump === tab);
  });
  appMain.scrollTop = 0;
  render();
}

function updateTopbarAlert() {
  quickAlertBtn.classList.toggle('is-alerting', state.alertLevel > 0);
  soundIcon.textContent = soundFX.enabled ? '🔊' : '🔇';
}

function render() {
  updateTopbarAlert();

  if (state.tab === 'home') {
    appMain.innerHTML = renderHome();
  } else if (state.tab === 'character') {
    appMain.innerHTML = renderCharacter();
  } else if (state.tab === 'diary') {
    appMain.innerHTML = renderDiary();
  } else if (state.tab === 'alert') {
    appMain.innerHTML = renderAlert();
  } else if (state.tab === 'interaction') {
    appMain.innerHTML = renderInteraction();
  }

  bindViewEvents();
}

function bindViewEvents() {
  // Character hitboxes (shared across Home, Alert, Interaction)
  document.querySelectorAll('.hitbox').forEach((btn) => {
    btn.addEventListener('click', () => triggerHitbox(btn.dataset.part));
  });

  // Home events
  document.querySelectorAll('[data-scene]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sceneId = btn.dataset.scene;
      const scene = SCENES.find((s) => s.id === state.sceneId);
      state.dialogue = scene.dailyLine;
      state.dialogueTag = scene.name;
      state.expression = scene.id === 'dawn_outpost' ? 'happy' : 'default';
      soundFX.chime(600, 0.1);
      render();
    });
  });

  const cycleSceneBtn = document.getElementById('cycleSceneBtn');
  if (cycleSceneBtn) {
    cycleSceneBtn.addEventListener('click', () => {
      const idx = SCENES.findIndex((s) => s.id === state.sceneId);
      const next = SCENES[(idx + 1) % SCENES.length];
      state.sceneId = next.id;
      state.dialogue = next.dailyLine;
      state.dialogueTag = next.name;
      soundFX.chime(640, 0.1);
      render();
    });
  }

  const homeDialogueBubble = document.getElementById('homeDialogueBubble');
  if (homeDialogueBubble) {
    homeDialogueBubble.addEventListener('click', () => {
      const pick = RANDOM_DIALOGUES[Math.floor(Math.random() * RANDOM_DIALOGUES.length)];
      state.expression = pick.expr;
      state.dialogue = pick.line;
      state.dialogueTag = '日常随想';
      soundFX.chime(700, 0.1);
      render();
    });
  }

  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      if (act === 'patHead') triggerHitbox('head');
      if (act === 'useWalkie') triggerHitbox('walkie');
      if (act === 'openDiary') switchTab('diary');
      if (act === 'triggerAnomaly') {
        state.alertLevel = 2;
        state.radioStep = 0;
        soundFX.alertPing(2);
        switchTab('alert');
        showToast('安月已进入警戒状态！');
      }
    });
  });

  // Character Dossier events
  document.querySelectorAll('[data-trait]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedTrait = btn.dataset.trait;
      soundFX.chime(680, 0.08);
      render();
    });
  });

  document.querySelectorAll('[data-expr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.showcaseExpr = btn.dataset.expr;
      soundFX.chime(760, 0.09);
      render();
    });
  });

  document.querySelectorAll('[data-gear-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.gearAction;
      if (action === 'walkie') {
        state.alertLevel = 2;
        soundFX.walkieBeep();
        switchTab('alert');
      } else if (action === 'diary') {
        switchTab('diary');
      } else if (action === 'expressions') {
        state.showcaseExpr = 'shy';
        render();
        showToast('已切换至表情展示区');
      }
    });
  });

  // Diary events
  const toggleDiaryFormBtn = document.getElementById('toggleDiaryFormBtn');
  if (toggleDiaryFormBtn) {
    toggleDiaryFormBtn.addEventListener('click', () => {
      state.diaryFormOpen = !state.diaryFormOpen;
      soundFX.notebookFlip();
      render();
    });
  }

  document.querySelectorAll('[data-sketch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.draftSketch = btn.dataset.sketch;
      render();
    });
  });

  const diaryImageInput = document.getElementById('diaryImageInput');
  if (diaryImageInput) {
    diaryImageInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.draftImage = reader.result;
        render();
      };
      reader.readAsDataURL(file);
    });
  }

  const clearDraftImgBtn = document.getElementById('clearDraftImgBtn');
  if (clearDraftImgBtn) {
    clearDraftImgBtn.addEventListener('click', () => {
      state.draftImage = null;
      render();
    });
  }

  const diaryForm = document.getElementById('diaryForm');
  if (diaryForm) {
    diaryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('diaryDate').value;
      const tag = document.getElementById('diaryTag').value;
      const title = document.getElementById('diaryTitle').value.trim();
      const content = document.getElementById('diaryContent').value.trim();
      if (!title || !content) return;

      const nextNum = String(state.diaries.length + 1).padStart(3, '0');
      const newEntry = {
        id: `exp-${Date.now()}`,
        code: `EXP-${nextNum}`,
        date,
        tag,
        title,
        content,
        sketchId: state.draftSketch,
        imageData: state.draftImage,
        anyueReply: generateAnyueReply(title, content, tag),
      };

      state.diaries.unshift(newEntry);
      saveDiaries();
      state.draftImage = null;
      state.diaryFormOpen = false;
      bumpTrust(5);
      soundFX.chime(820, 0.16);
      render();
      openRecordCardModal(newEntry.id);
    });
  }

  document.querySelectorAll('.diary-entry-card').forEach((card) => {
    card.addEventListener('click', () => {
      soundFX.notebookFlip();
      openRecordCardModal(card.dataset.entryId);
    });
  });

  // Alert events
  const anomalyActionBtn = document.getElementById('anomalyActionBtn');
  if (anomalyActionBtn) {
    anomalyActionBtn.addEventListener('click', () => {
      if (state.alertLevel < 2) {
        state.alertLevel = 2;
        state.radioStep = 0;
        state.activeAnim = 'anim-alert-shake';
        soundFX.alertPing(2);
      } else {
        const scenario = ALERT_SCENARIOS.find((s) => s.id === state.alertScenarioId) || ALERT_SCENARIOS[0];
        if (state.radioStep + 1 < scenario.radioLog.length) {
          state.radioStep += 1;
          soundFX.walkieBeep();
        } else {
          state.alertLevel = 0;
          state.radioStep = 0;
          soundFX.chime(660, 0.12);
          showToast('警报已解除，恢复正常巡查');
        }
      }
      render();
      setTimeout(() => {
        state.activeAnim = '';
      }, 480);
    });
  }

  document.querySelectorAll('[data-level]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.alertLevel = Number(btn.dataset.level);
      state.radioStep = 0;
      if (state.alertLevel > 0) soundFX.alertPing(state.alertLevel);
      render();
    });
  });

  document.querySelectorAll('[data-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.alertScenarioId = btn.dataset.scenario;
      state.radioStep = 0;
      soundFX.walkieBeep();
      render();
    });
  });

  const logAnomalyToDiaryBtn = document.getElementById('logAnomalyToDiaryBtn');
  if (logAnomalyToDiaryBtn) {
    logAnomalyToDiaryBtn.addEventListener('click', () => {
      const scenario = ALERT_SCENARIOS.find((s) => s.id === state.alertScenarioId) || ALERT_SCENARIOS[0];
      const nextNum = String(state.diaries.length + 1).padStart(3, '0');
      const newEntry = {
        id: `exp-${Date.now()}`,
        code: `EXP-${nextNum}`,
        date: new Date().toISOString().slice(0, 10),
        tag: '异常线索',
        title: `[${scenario.code}] ${scenario.name}`,
        content: `${scenario.location}：${scenario.clue}`,
        sketchId: scenario.id === 'frequency' ? 'radio_wave' : scenario.id === 'starshift' ? 'star_fragment' : 'glow_print',
        imageData: null,
        anyueReply: '「已紧急归档到观察笔记本！幸好及时用黄色对讲机通知了大家，接下来也要保持警惕哦。」',
      };
      state.diaries.unshift(newEntry);
      saveDiaries();
      soundFX.chime(840, 0.14);
      switchTab('diary');
      openRecordCardModal(newEntry.id);
    });
  }

  // Interaction Studio events
  const toggleHotspotsBtn = document.getElementById('toggleHotspotsBtn');
  if (toggleHotspotsBtn) {
    toggleHotspotsBtn.addEventListener('click', () => {
      state.showHotspots = !state.showHotspots;
      render();
    });
  }

  document.querySelectorAll('[data-part-btn]').forEach((btn) => {
    btn.addEventListener('click', () => triggerHitbox(btn.dataset.partBtn));
  });

  document.querySelectorAll('[data-greeting]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const g = GREETINGS[btn.dataset.greeting];
      state.expression = g.expr;
      state.dialogue = g.line;
      state.dialogueTag = g.label;
      state.activeAnim = 'anim-bounce';
      bumpTrust(2);
      soundFX.chime(720, 0.14);
      render();
      spawnParticles(['☾', '✦']);
    });
  });

  const randomDialogueBtn = document.getElementById('randomDialogueBtn');
  if (randomDialogueBtn) {
    randomDialogueBtn.addEventListener('click', () => {
      const pick = RANDOM_DIALOGUES[Math.floor(Math.random() * RANDOM_DIALOGUES.length)];
      state.expression = pick.expr;
      state.dialogue = pick.line;
      state.dialogueTag = '日常互动';
      state.activeAnim = 'anim-bounce';
      bumpTrust(2);
      soundFX.chime(750, 0.12);
      render();
      spawnParticles(['✦', '♡']);
    });
  }
}

// Global Navigation & Topbar Listeners
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.querySelectorAll('.quick-chip').forEach((chip) => {
  chip.addEventListener('click', () => switchTab(chip.dataset.jump));
});

soundToggleBtn.addEventListener('click', () => {
  const on = soundFX.toggle();
  updateTopbarAlert();
  showToast(on ? '交互音效已开启' : '交互音效已静音');
});

quickAlertBtn.addEventListener('click', () => {
  state.alertLevel = state.alertLevel === 2 ? 0 : 2;
  state.radioStep = 0;
  if (state.alertLevel === 2) {
    soundFX.alertPing(2);
    switchTab('alert');
  } else {
    soundFX.chime(660, 0.1);
    render();
  }
});

// Initial render
render();
