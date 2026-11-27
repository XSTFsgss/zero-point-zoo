/**
 * 健康型一句话日记 - 娜娜小海獭的养生手账
 * Application Logic & Interactive Effects
 */

// ===================== 基础数据与印章定义 =====================
const STAMPS = [
  { id: 'sun', emoji: '☀️', label: '活力充沛', color: '#E65100', bg: '#FFF3E0' },
  { id: 'water', emoji: '💧', label: '规律补水', color: '#0277BD', bg: '#E1F5FE' },
  { id: 'bloom', emoji: '🌸', label: '身心舒缓', color: '#C2185B', bg: '#FCE4EC' },
  { id: 'run', emoji: '🏃', label: '暴汗运动', color: '#2E7D32', bg: '#E8F5E9' },
  { id: 'sleep', emoji: '🌙', label: '安稳好眠', color: '#512DA8', bg: '#EDE7F6' },
  { id: 'relax', emoji: '🍵', label: '松弛治愈', color: '#00695C', bg: '#E0F2F1' },
  { id: 'diet', emoji: '🥗', label: '健康轻食', color: '#EF6C00', bg: '#FFF8E1' },
  { id: 'power', emoji: '🔋', label: '电量满格', color: '#D84315', bg: '#FBE9E7' }
];

const HEALTH_TAGS = [
  '💧 喝水 1500ml+',
  '🏃 散步/运动 30分',
  '🥗 低油低盐轻食',
  '🌙 11点前入睡',
  '🧘 放空深呼吸',
  '☀️ 户外晒太阳',
  '🚫 控糖戒奶茶',
  '👀 远离屏幕护眼'
];

const INSPIRATIONS = [
  '今天喝足了满满8杯温水，下午没有犯困，感觉身体格外轻盈。',
  '下班后吹着晚风散步了半小时，微微出汗，整天的疲惫都散开了。',
  '中午吃了清淡的蔬菜沙拉和鸡胸肉，胃部舒舒服服没有任何负担。',
  '晚上做了15分钟颈椎拉伸，紧绷了一整天的肩颈终于松弛下来了。',
  '晚上泡了个暖呼呼的热水澡，调暗灯光，今晚一定能一觉睡到大天亮。',
  '工作间隙每隔一小时就站起来眺望窗外，眼睛和心情都很放松。',
  '今天克制住了想吃油炸夜宵的念头，换成一杯温热的燕麦奶，好满足！'
];

const OTTER_CHEER_MESSAGES = [
  '小海獭揉揉脸：“今天也要好好照顾自己的身体哦！”',
  '小海獭挥动小拳头：“哪怕只喝了一大杯水，也是超棒的一步！”',
  '小海獭蹭蹭你：“写下一句话，把今天的小确幸和健康存起来吧~”',
  '小海獭晃晃耳朵：“深呼吸~ 慢慢来，健健康康最重要啦！”'
];

// ===================== 本地存储管理 =====================
const STORAGE_KEY = 'otter_health_diaries_v1';

function getStoredDiaries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to load diaries', e);
    return {};
  }
}

function saveStoredDiaries(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save diaries', e);
  }
}

// ===================== Web Audio 声音合成器 =====================
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // 盖章声音：沉稳的下压 thump + 清脆弹击声
  playStamp() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // 低频 thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    // 纸张摩擦咔嗒声
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(800, t);
    snapOsc.frequency.exponentialRampToValueAtTime(150, t + 0.05);

    snapGain.gain.setValueAtTime(0.3, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.07);
  }

  // 鼓掌声音：模拟连续数次轻快热烈的掌声 (clap-clap-clap!)
  playClap() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const clapsCount = 6;
    const interval = 0.13; // 掌声节奏
    const baseTime = this.ctx.currentTime;

    for (let i = 0; i < clapsCount; i++) {
      const clapTime = baseTime + i * interval + (Math.random() * 0.02 - 0.01);
      this._singleClap(clapTime);
    }
  }

  _singleClap(time) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.06; // 60ms 噪音爆发
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // 带通滤波形成手掌击打质感 (1000Hz 左右)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100 + Math.random() * 200, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  // 达成鼓励里程碑时的欢快和弦琶音
  playFanfare() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const baseT = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = baseT + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.38);
    });
  }
}

const sounds = new SoundEffects();

// ===================== 庆祝烟花彩带引擎 =====================
class ConfettiManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 70) {
    if (!this.canvas || !this.ctx) return;
    this.resize();

    const colors = ['#FFD43F', '#FF6B6B', '#48C78E', '#3E8ED0', '#FFA940', '#B37FEB', '#FF85C0'];
    const originX = window.innerWidth * 0.3; // 偏向小海獭卡片所在侧
    const originY = window.innerHeight * 0.35;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() * 4 - 2),
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5,
        opacity: 1,
        life: 1
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // 重力
      p.rotation += p.rotSpeed;
      p.life -= 0.012;
      p.opacity = Math.max(0, p.life);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();

      if (p.life <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ===================== 主应用状态与逻辑 =====================
class HealthDiaryApp {
  constructor() {
    this.currentDate = new Date();
    this.viewYear = this.currentDate.getFullYear();
    this.viewMonth = this.currentDate.getMonth(); // 0 - 11
    this.diaries = getStoredDiaries();

    // 正在编辑/查看的日期
    this.activeDateKey = null; // 'YYYY-MM-DD'
    this.selectedStampId = STAMPS[0].id;
    this.selectedTags = new Set();
    this.confetti = new ConfettiManager('celebration-canvas');

    this.dom = {
      monthLabel: document.getElementById('current-month-display'),
      calendarGrid: document.getElementById('calendar-grid'),
      otterCard: document.getElementById('otter-card'),
      otterSpeech: document.getElementById('otter-speech-text'),
      progressFill: document.getElementById('progress-fill'),
      progressText: document.getElementById('progress-text'),
      monthTotalDays: document.getElementById('month-total-days'),
      monthCountBadge: document.getElementById('month-count-badge'),
      // 弹窗
      modalBackdrop: document.getElementById('diary-modal'),
      modalDateTitle: document.getElementById('modal-date-full'),
      modalWeekday: document.getElementById('modal-date-weekday'),
      stampOptionsWrap: document.getElementById('stamp-options-grid'),
      healthTagsWrap: document.getElementById('health-tags-wrap'),
      diaryInput: document.getElementById('diary-input-text'),
      charCount: document.getElementById('char-count'),
      inspireTipText: document.getElementById('inspire-tip-text'),
      btnSaveStamp: document.getElementById('btn-save-stamp'),
      btnDeleteEntry: document.getElementById('btn-delete-entry'),
      viewModeCard: document.getElementById('view-mode-card'),
      editModeForm: document.getElementById('edit-mode-form'),
      viewStampWrap: document.getElementById('view-stamp-highlight'),
      viewDiaryContent: document.getElementById('view-diary-content'),
      viewTagsWrap: document.getElementById('view-tags-wrap'),
      btnSwitchToEdit: document.getElementById('btn-switch-to-edit'),
      // 提示
      toast: document.getElementById('toast-notice')
    };

    this.init();
  }

  init() {
    this.renderStampOptions();
    this.renderHealthTagOptions();
    this.bindEvents();
    this.renderCalendar();
    this.updateOtterMilestoneStatus();
    this.showRandomInspiration();
  }

  // 绑定界面交互
  bindEvents() {
    // 月份切换
    document.getElementById('btn-prev-month').addEventListener('click', () => {
      this.viewMonth--;
      if (this.viewMonth < 0) {
        this.viewMonth = 11;
        this.viewYear--;
      }
      this.renderCalendar();
      this.updateOtterMilestoneStatus();
    });

    document.getElementById('btn-next-month').addEventListener('click', () => {
      this.viewMonth++;
      if (this.viewMonth > 11) {
        this.viewMonth = 0;
        this.viewYear++;
      }
      this.renderCalendar();
      this.updateOtterMilestoneStatus();
    });

    document.getElementById('btn-today').addEventListener('click', () => {
      const today = new Date();
      this.viewYear = today.getFullYear();
      this.viewMonth = today.getMonth();
      this.renderCalendar();
      this.updateOtterMilestoneStatus();
      this.openDiaryModal(this.formatDateKey(today));
    });

    // 快捷写日记按钮 (写今天的)
    document.getElementById('btn-quick-write').addEventListener('click', () => {
      this.openDiaryModal(this.formatDateKey(new Date()));
    });

    // 点击小海獭立绘：互动说话 + 播放鼓掌/鼓励声音
    document.getElementById('otter-visual-box').addEventListener('click', () => {
      const monthCount = this.getMonthRecordCount();
      if (monthCount >= 10) {
        sounds.playClap();
        this.confetti.burst(50);
        this.dom.otterSpeech.innerHTML = '“啪唧啪唧！太厉害啦！为你疯狂鼓掌中~ 👏👏🐾 继续保持健康生活哦！”';
      } else {
        const randMsg = OTTER_CHEER_MESSAGES[Math.floor(Math.random() * OTTER_CHEER_MESSAGES.length)];
        this.dom.otterSpeech.textContent = randMsg;
      }
    });

    // 声音静音切换
    const muteBtn = document.getElementById('btn-sound-toggle');
    muteBtn.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      muteBtn.textContent = isMuted ? '🔇' : '🔔';
      this.showToast(isMuted ? '已静音' : '音效已开启 🔔');
    });

    // 演示功能：一键体验满10天鼓掌
    document.getElementById('btn-demo-fill').addEventListener('click', () => {
      this.seedDemoMonthData();
    });

    // 清空数据
    document.getElementById('btn-demo-clear').addEventListener('click', () => {
      if (confirm('确定要清空所有已记录的日记数据吗？')) {
        this.diaries = {};
        saveStoredDiaries(this.diaries);
        this.renderCalendar();
        this.updateOtterMilestoneStatus();
        this.showToast('数据已清空');
      }
    });

    // 弹窗关闭
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      this.closeModal();
    });

    this.dom.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.dom.modalBackdrop) {
        this.closeModal();
      }
    });

    // 灵感换一换
    document.getElementById('btn-refresh-inspire').addEventListener('click', () => {
      this.showRandomInspiration();
    });

    // 填入灵感建议
    this.dom.inspireTipText.addEventListener('click', () => {
      this.dom.diaryInput.value = this.dom.inspireTipText.textContent.replace(/^“|”$/g, '');
      this.updateCharCounter();
    });

    // 字数监听
    this.dom.diaryInput.addEventListener('input', () => {
      this.updateCharCounter();
    });

    // 保存盖章
    this.dom.btnSaveStamp.addEventListener('click', () => {
      this.saveCurrentDiary();
    });

    // 删除当前日记
    this.dom.btnDeleteEntry.addEventListener('click', () => {
      if (confirm('确定要删除这天的日记与印章吗？')) {
        delete this.diaries[this.activeDateKey];
        saveStoredDiaries(this.diaries);
        this.renderCalendar();
        this.updateOtterMilestoneStatus();
        this.closeModal();
        this.showToast('已删除该日记录');
      }
    });

    // 从浏览模式切换到编辑模式
    this.dom.btnSwitchToEdit.addEventListener('click', () => {
      this.switchToEditMode();
    });
  }

  // 格式化 YYYY-MM-DD
  formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 渲染印章选项列表
  renderStampOptions() {
    this.dom.stampOptionsWrap.innerHTML = '';
    STAMPS.forEach((stamp) => {
      const opt = document.createElement('div');
      opt.className = `stamp-radio-option ${stamp.id === this.selectedStampId ? 'selected' : ''}`;
      opt.dataset.id = stamp.id;
      opt.style.color = stamp.color;
      opt.innerHTML = `
        <span class="opt-emoji">${stamp.emoji}</span>
        <span class="opt-text">${stamp.label}</span>
      `;

      opt.addEventListener('click', () => {
        this.selectedStampId = stamp.id;
        document.querySelectorAll('.stamp-radio-option').forEach(el => el.classList.remove('selected'));
        opt.classList.add('selected');
        sounds.playStamp();
      });

      this.dom.stampOptionsWrap.appendChild(opt);
    });
  }

  // 渲染健康快速标签
  renderHealthTagOptions() {
    this.dom.healthTagsWrap.innerHTML = '';
    HEALTH_TAGS.forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'health-pill-tag';
      pill.textContent = tag;
      pill.addEventListener('click', () => {
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
          pill.classList.remove('active');
        } else {
          this.selectedTags.add(tag);
          pill.classList.add('active');
        }
      });
      this.dom.healthTagsWrap.appendChild(pill);
    });
  }

  // 随机灵感语
  showRandomInspiration() {
    const quote = INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)];
    this.dom.inspireTipText.textContent = `“${quote}”`;
  }

  updateCharCounter() {
    const len = this.dom.diaryInput.value.length;
    this.dom.charCount.textContent = `${len}/100`;
  }

  // 渲染月历
  renderCalendar() {
    const year = this.viewYear;
    const month = this.viewMonth;

    // 显示标题，例如 "2026年 11月"
    this.dom.monthLabel.textContent = `${year}年 ${month + 1}月`;

    // 本月第一天与最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // 星期几对齐 (0=周日, 1=周一...) -> 转换为周一为起始 (0=周一, 6=周日)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // 上个月的最后几天填充
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    this.dom.calendarGrid.innerHTML = '';

    const todayStr = this.formatDateKey(new Date());

    // 填充前置上月日期
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const cell = document.createElement('div');
      cell.className = 'calendar-cell other-month';
      cell.innerHTML = `<span class="cell-day-num">${dayNum}</span>`;
      this.dom.calendarGrid.appendChild(cell);
    }

    // 填充本月日期
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateKey = this.formatDateKey(dateObj);
      const isToday = dateKey === todayStr;
      const entry = this.diaries[dateKey];

      const cell = document.createElement('div');
      cell.className = `calendar-cell ${isToday ? 'is-today' : ''}`;
      cell.dataset.date = dateKey;

      let cellContent = `
        <span class="cell-day-num">
          ${day}
          ${isToday ? '<span class="today-star-dot" title="今天"></span>' : ''}
        </span>
      `;

      if (entry) {
        const stampMeta = STAMPS.find(s => s.id === entry.stampId) || STAMPS[0];
        const rot = entry.rotation || ((day * 7) % 11 - 5); // 独特的自然印章微倾角

        cellContent += `
          <div class="cell-stamp-wrap">
            <div class="stamp-seal" style="color: ${stampMeta.color}; transform: rotate(${rot}deg);" title="${stampMeta.label}">
              <span class="stamp-emoji-icon">${stampMeta.emoji}</span>
              <span class="stamp-mood-label">${stampMeta.label}</span>
            </div>
          </div>
          <div class="cell-preview-text" title="${entry.text || ''}">${entry.text ? entry.text : '已打卡'}</div>
        `;
      } else {
        cellContent += `
          <div class="cell-stamp-wrap">
            <span class="cell-empty-plus">+</span>
          </div>
          <div class="cell-preview-text"></div>
        `;
      }

      cell.innerHTML = cellContent;

      // 点击日历格
      cell.addEventListener('click', () => {
        this.openDiaryModal(dateKey);
      });

      this.dom.calendarGrid.appendChild(cell);
    }

    // 计算补齐末尾几天
    const totalFilled = startDayOfWeek + totalDays;
    const remaining = (7 - (totalFilled % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell other-month';
      cell.innerHTML = `<span class="cell-day-num">${i}</span>`;
      this.dom.calendarGrid.appendChild(cell);
    }
  }

  // 获取当前查看月份的打卡天数
  getMonthRecordCount() {
    const year = this.viewYear;
    const month = String(this.viewMonth + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;

    let count = 0;
    Object.keys(this.diaries).forEach(k => {
      if (k.startsWith(prefix) && this.diaries[k]) {
        count++;
      }
    });
    return count;
  }

  // 更新小海獭鼓掌状态与进度条
  updateOtterMilestoneStatus() {
    const count = this.getMonthRecordCount();
    this.dom.progressText.textContent = `${count} / 10`;
    this.dom.monthCountBadge.textContent = `本月打卡: ${count} 天`;

    const percent = Math.min(100, Math.round((count / 10) * 100));
    this.dom.progressFill.style.width = `${percent}%`;

    const isClappingMilestone = count >= 10;

    if (isClappingMilestone) {
      // 达成满10格鼓掌！
      if (!this.dom.otterCard.classList.contains('clapping-active')) {
        this.dom.otterCard.classList.add('clapping-active');
        sounds.playFanfare();
        sounds.playClap();
        this.confetti.burst(80);
      }
      this.dom.otterSpeech.innerHTML = `
        <strong>🎉 哇塞！达成满10格里程碑！</strong><br>
        本月已坚持 <b>${count}</b> 天啦！小海獭娜娜正在为你疯狂鼓掌！👏👏 身体越来越棒啦！
      `;
    } else {
      this.dom.otterCard.classList.remove('clapping-active');
      const need = 10 - count;
      this.dom.otterSpeech.innerHTML = `
        本月已经记录 <b>${count}</b> 天健康生活啦！<br>
        再坚持 <b>${need}</b> 天，小海獭就会在日历上为你热情鼓掌哦！加油～🐾
      `;
    }
  }

  // 打开弹窗 (查看或编辑)
  openDiaryModal(dateKey) {
    this.activeDateKey = dateKey;
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    this.dom.modalDateTitle.textContent = `${y}年${m}月${d}日`;
    this.dom.modalWeekday.textContent = weekdays[dateObj.getDay()];

    const entry = this.diaries[dateKey];

    if (entry) {
      // 存在日记：先进入查看卡片模式
      this.showViewMode(entry);
    } else {
      // 未写日记：直接进入编辑盖章模式
      this.showEditMode();
    }

    this.dom.modalBackdrop.classList.add('is-open');
  }

  // 展示纯阅读卡片模式
  showViewMode(entry) {
    this.dom.viewModeCard.style.display = 'block';
    this.dom.editModeForm.style.display = 'none';
    this.dom.btnSaveStamp.style.display = 'none';
    this.dom.btnDeleteEntry.style.display = 'inline-block';

    const stampMeta = STAMPS.find(s => s.id === entry.stampId) || STAMPS[0];
    const rot = entry.rotation || 0;

    this.dom.viewStampWrap.innerHTML = `
      <div class="view-stamp-big" style="color: ${stampMeta.color}; transform: rotate(${rot}deg);">
        <span style="font-size: 26px;">${stampMeta.emoji}</span>
        <span style="font-size: 11px; font-weight: 800; margin-top: 2px;">${stampMeta.label}</span>
      </div>
      <div>
        <div style="font-size: 15px; font-weight: 800; color: ${stampMeta.color};">${stampMeta.label}</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">记录时间：${entry.updatedAt || '当日打卡'}</div>
      </div>
    `;

    this.dom.viewDiaryContent.textContent = entry.text || '（这一天没有写一句话，但收获了一个满满的印章！）';

    // 标签展示
    this.dom.viewTagsWrap.innerHTML = '';
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'health-pill-tag active';
        span.textContent = tag;
        this.dom.viewTagsWrap.appendChild(span);
      });
    } else {
      this.dom.viewTagsWrap.innerHTML = '<span style="font-size: 12px; color: var(--text-muted);">暂无特别标签</span>';
    }
  }

  // 切换到编辑表单
  switchToEditMode() {
    const entry = this.diaries[this.activeDateKey];
    this.showEditMode(entry);
  }

  // 进入编辑表单
  showEditMode(entry = null) {
    this.dom.viewModeCard.style.display = 'none';
    this.dom.editModeForm.style.display = 'block';
    this.dom.btnSaveStamp.style.display = 'flex';
    this.dom.btnDeleteEntry.style.display = entry ? 'inline-block' : 'none';

    // 设置印章
    this.selectedStampId = entry ? entry.stampId : STAMPS[0].id;
    document.querySelectorAll('.stamp-radio-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === this.selectedStampId);
    });

    // 设置标签
    this.selectedTags.clear();
    if (entry && entry.tags) {
      entry.tags.forEach(t => this.selectedTags.add(t));
    }
    document.querySelectorAll('.health-pill-tag').forEach(el => {
      el.classList.toggle('active', this.selectedTags.has(el.textContent));
    });

    // 设置文本
    this.dom.diaryInput.value = entry ? entry.text : '';
    this.updateCharCounter();
  }

  // 保存日记与盖章
  saveCurrentDiary() {
    if (!this.activeDateKey) return;

    const text = this.dom.diaryInput.value.trim();
    const isNew = !this.diaries[this.activeDateKey];

    // 盖章随机倾角 (-5deg 到 +5deg) 让印泥更逼真
    const randomRot = Math.round((Math.random() * 10 - 5) * 10) / 10;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    this.diaries[this.activeDateKey] = {
      stampId: this.selectedStampId,
      text: text,
      tags: Array.from(this.selectedTags),
      rotation: randomRot,
      updatedAt: timeStr
    };

    saveStoredDiaries(this.diaries);

    // 播放盖章声音
    sounds.playStamp();

    this.closeModal();
    this.renderCalendar();

    // 为刚刚盖章的格子添加动效
    const cell = document.querySelector(`.calendar-cell[data-date="${this.activeDateKey}"]`);
    if (cell) {
      const seal = cell.querySelector('.stamp-seal');
      if (seal) {
        seal.style.setProperty('--random-rot', `${randomRot}deg`);
        seal.classList.add('stamp-just-stamped');
      }
    }

    const prevCount = this.getMonthRecordCount();
    this.updateOtterMilestoneStatus();
    this.showToast('💮 盖章成功！健康一句话已收录');

    // 如果正好满10天，触发额外热烈鼓掌
    if (prevCount === 10 && isNew) {
      setTimeout(() => {
        sounds.playFanfare();
        sounds.playClap();
        this.confetti.burst(90);
      }, 400);
    }
  }

  closeModal() {
    this.dom.modalBackdrop.classList.remove('is-open');
    this.activeDateKey = null;
  }

  showToast(msg) {
    this.dom.toast.textContent = msg;
    this.dom.toast.classList.add('show');
    setTimeout(() => {
      this.dom.toast.classList.remove('show');
    }, 2400);
  }

  // 一键填充10天演示数据 (方便立即体验海獭鼓掌功能)
  seedDemoMonthData() {
    const year = this.viewYear;
    const month = String(this.viewMonth + 1).padStart(2, '0');

    const demoSamples = [
      { day: '01', stamp: 'water', text: '早起大口喝了一杯温开水，喉咙和胃里都特别舒服。', tags: ['💧 喝水 1500ml+'] },
      { day: '02', stamp: 'run', text: '傍晚去慢跑了3公里，出了一身透汗，多巴胺分泌超开心！', tags: ['🏃 散步/运动 30分'] },
      { day: '04', stamp: 'diet', text: '中午吃了彩椒牛肉杂粮饭，少油少盐，清爽又顶饱。', tags: ['🥗 低油低盐轻食', '🚫 控糖戒奶茶'] },
      { day: '06', stamp: 'sleep', text: '昨晚10点半就关机躺下，今天7点自然醒，精力充沛！', tags: ['🌙 11点前入睡'] },
      { day: '08', stamp: 'bloom', text: '公园长椅上坐了20分钟，晒晒背，听微风吹过树梢的声音。', tags: ['☀️ 户外晒太阳', '🧘 放空深呼吸'] },
      { day: '10', stamp: 'relax', text: '泡了一杯洋甘菊茶，听着白噪音做眼保健操，眼睛轻松了。', tags: ['🍵 松弛治愈', '👀 远离屏幕护眼'] },
      { day: '12', stamp: 'power', text: '今天完成了8000步目标，整个人走路都带风！', tags: ['🏃 散步/运动 30分'] },
      { day: '14', stamp: 'sun', text: '拉伸了下半身肌肉，紧绷感完全消失了，今晚肯定好梦。', tags: ['🧘 放空深呼吸'] },
      { day: '15', stamp: 'water', text: '随身带着保温杯，打卡了1800ml饮水，皮肤状态变好了。', tags: ['💧 喝水 1500ml+'] },
      { day: '18', stamp: 'run', text: '坚持了十天啦！跟着燃脂操跳了半小时，健康自律感觉真棒！', tags: ['🏃 散步/运动 30分'] }
    ];

    demoSamples.forEach(sample => {
      const dateKey = `${year}-${month}-${sample.day}`;
      this.diaries[dateKey] = {
        stampId: sample.stamp,
        text: sample.text,
        tags: sample.tags,
        rotation: Math.round((Math.random() * 8 - 4) * 10) / 10,
        updatedAt: '演示数据'
      };
    });

    saveStoredDiaries(this.diaries);
    this.renderCalendar();
    this.updateOtterMilestoneStatus();
    sounds.playFanfare();
    sounds.playClap();
    this.confetti.burst(100);
    this.showToast('🎉 已填入10天健康日记！海獭鼓掌庆祝中~');
  }
}

// 页面加载完成后启动
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HealthDiaryApp();
});
