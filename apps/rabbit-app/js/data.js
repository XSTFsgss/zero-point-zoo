// Core IP Character Data, Scenes, Dialogues, Alert Scripts & Starter Diary Entries
(function (global) {
const CHARACTER_IMAGES = {
  default: 'assets/characters/anyue-default.png',
  happy: 'assets/characters/anyue-happy.png',
  surprised: 'assets/characters/anyue-surprised.png',
  shy: 'assets/characters/anyue-shy.png',
  alert: 'assets/characters/anyue-alert.png',
};

const EXPRESSIONS = [
  {
    id: 'default',
    label: '谨慎观察',
    badge: '默认状态',
    note: '微微蹙起眉毛，握紧黄色对讲机，时刻留意周围细微声响。',
    quote: '「等、等一下！前面好像有什么……」',
  },
  {
    id: 'shy',
    label: '害羞慌张',
    badge: '轻拍反应',
    note: '被突然夸奖或轻拍头顶时，耳尖和脸颊会立刻染上淡粉色。',
    quote: '「呜、呜哇……别突然靠近啦，笔记本都要拿不稳了……」',
  },
  {
    id: 'surprised',
    label: '惊吓发现',
    badge: '异常反应',
    note: '双耳瞬间竖直，瞳孔微微放大，对草丛或星空中的异动极其敏感。',
    quote: '「咦？！刚才那个影子……是不是动了一下？！」',
  },
  {
    id: 'happy',
    label: '安心微笑',
    badge: '信赖时刻',
    note: '确认周围安全、或记录完珍贵线索后，会露出柔和又踏实的笑容。',
    quote: '「呼——原来只是虚惊一场呀。能和你一起记录真好。」',
  },
  {
    id: 'alert',
    label: '警戒呼叫',
    badge: '警报状态',
    note: '立刻举起黄色对讲机贴近嘴边，压低声音向同伴传递精确坐标。',
    quote: '「滋滋——这里是安月！前方发现异常线索，请大家注意警戒！」',
  },
];

const SCENES = [
  {
    id: 'starlight_camp',
    name: '星夜观测营',
    weather: '晴朗 · 微风',
    mood: '谨慎观察中',
    moodStars: '★★★★☆',
    bgClass: 'scene-starlight',
    dailyLine: '「今晚的星星很亮，但东南方向好像有一闪一闪的光点……先记下来吧。」',
    badgeIcon: '✦',
  },
  {
    id: 'luminous_forest',
    name: '荧光迷雾林',
    weather: '薄雾 · 萤火',
    mood: '高度敏锐中',
    moodStars: '★★★☆☆',
    bgClass: 'scene-forest',
    dailyLine: '「等、等一下！那株蕨类叶脉在发光……我得小心靠近画进笔记里。」',
    badgeIcon: '❀',
  },
  {
    id: 'observatory_ruins',
    name: '旧天文台迹',
    weather: '静谧 · 星云',
    mood: '专注记录中',
    moodStars: '★★★★★',
    bgClass: 'scene-ruins',
    dailyLine: '「老式星图仪的指针自己转动了两毫米……虽然有点怕，但一定要查清楚。」',
    badgeIcon: '☾',
  },
  {
    id: 'dawn_outpost',
    name: '晨曦观察哨',
    weather: '微光 · 清晨',
    mood: '安心惬意中',
    moodStars: '★★★★★',
    bgClass: 'scene-dawn',
    dailyLine: '「整夜的巡查结束啦！对讲机电量还有一半，今天也整理了好多发现呢。」',
    badgeIcon: '☀',
  },
];

const PERSONALITIES = [
  {
    id: 'observant',
    keyword: '细腻',
    en: 'OBSERVANT',
    color: '#F6DC80',
    summary: '能捕捉别人忽略的微小痕迹。',
    detail: '无论是折断半厘米的树枝、地面浅浅的荧光脚印，还是风声里夹杂的微弱频率，安月总能第一时间察觉并认真画进手绘笔记。',
    quote: '「你看这片叶子的边缘，有昨晚露水没有打湿的圆环痕迹哦。」',
  },
  {
    id: 'cautious',
    keyword: '谨慎',
    en: 'CAUTIOUS',
    color: '#8FA4BC',
    summary: '先观察、再记录、最后才行动。',
    detail: '从不鲁莽冲向未知区域。每次发现异常，都会先举起对讲机确认同伴位置，拉好连帽外套、扶稳斜挎包后，再小心翼翼地靠近验证。',
    quote: '「先别急着往前走！我用笔记本对照一下昨天的地形记录。」',
  },
  {
    id: 'sensitive',
    keyword: '敏感',
    en: 'SENSITIVE',
    color: '#F2B4BA',
    summary: '容易感知环境与情绪的细微起伏。',
    detail: '长耳朵像天然雷达一样敏锐，遇到突然的声响会吓一跳，也常常因为过度担心同伴而反复确认对讲机信号；同样地，她也能温柔地察觉你的心情。',
    quote: '「你今天看起来有点累……要不要一起在星空下休息五分钟？」',
  },
  {
    id: 'brave',
    keyword: '勇敢',
    en: 'BRAVE',
    color: '#FCEAA8',
    summary: '即使双腿发抖，也要把真相记录下来。',
    detail: '胆小和勇敢在安月身上并不矛盾。哪怕黑暗里有不知名的沙沙声，只要想到“如果不记下来，线索就会消失”，她就会鼓起勇气举起对讲机继续前进。',
    quote: '「虽、虽然心跳得很快……但我是记录员，不能在这里退缩！」',
  },
];

const EXCLUSIVE_ITEMS = [
  {
    id: 'walkie',
    name: '黄色对讲机',
    tag: '核心通讯装备',
    color: '#F6DC80',
    desc: '安月右手从不离身的明黄色便携对讲机，带有黑色短天线与圆形扬声器。哪怕在迷雾森林里，也能清晰发出加密电波向同伴发出预警。',
    actionLabel: '测试对讲机呼叫',
    actionType: 'walkie',
  },
  {
    id: 'notebook',
    name: '螺旋观察笔记本',
    tag: '线索档案核心',
    color: '#FAF6EE',
    desc: '稳稳插在橙色滚边斜挎包中的手绘线圈本，里面夹着星图、脚印素描、干花样本与密密麻麻的异常时刻表。',
    actionLabel: '翻开探索日记',
    actionType: 'diary',
  },
  {
    id: 'gear',
    name: '探险风装备组',
    tag: '日常巡查服饰',
    color: '#8FA4BC',
    desc: '灰白连帽外套搭配浅灰蓝袖摆，左胸缝有黄色三角警示观察徽章，深灰短裤与卡其色系带短靴方便夜间轻装奔跑与长途跋涉。',
    actionLabel: '查看表情形态',
    actionType: 'expressions',
  },
];

const HITBOX_REACTIONS = {
  leftEar: [
    { expr: 'surprised', line: '「呀！左边的耳朵最怕痒了……风向好像也变了！」', badge: '左耳轻颤' },
    { expr: 'shy', line: '「呜……长耳朵是用来听星夜动静的啦，不可以一直捏哦。」', badge: '耳尖泛红' },
  ],
  rightEar: [
    { expr: 'shy', line: '「等、等一下！右边耳朵正在接收远处的回声呢……！」', badge: '声波捕捉' },
    { expr: 'happy', line: '「嘿嘿，被轻轻顺毛的感觉……好像没那么紧张了。」', badge: '安心竖耳' },
  ],
  head: [
    { expr: 'shy', line: '「哇啊——突然摸头的话，刘海上的那撮毛会翘起来的！」', badge: '害羞模式' },
    { expr: 'surprised', line: '「咦？！怎么了怎么了，是我头上沾到发光花粉了吗？」', badge: '惊讶抬头' },
    { expr: 'happy', line: '「嗯……有你在身边一起巡查，心里踏实多啦。」', badge: '信赖+1' },
  ],
  walkie: [
    { expr: 'alert', line: '「滋滋——这里是观察员安月，当前频道畅通，随时准备汇报！」', badge: '电波发射' },
    { expr: 'default', line: '「哔哔——对讲机指示灯是稳定的淡黄色，附近没有强磁干扰。」', badge: '信号确认' },
  ],
  notebook: [
    { expr: 'happy', line: '「要看看我的观察笔记本吗？今天又贴了新的星光贴纸进去哦！」', badge: '翻开笔记' },
  ],
};

const GREETINGS = {
  morning: {
    label: '早安问候',
    expr: 'happy',
    line: '「早安！我刚整理完昨晚的星象草图，今天也一起小心探索吧。」',
  },
  afternoon: {
    label: '午后问候',
    expr: 'default',
    line: '「午后的树影很容易藏着小线索……我检查一下斜挎包，随时出发！」',
  },
  night: {
    label: '星夜问候',
    expr: 'shy',
    line: '「夜风有点凉呢……不过别担心，黄色对讲机一直开着，我会陪着你的。」',
  },
};

const RANDOM_DIALOGUES = [
  { expr: 'default', line: '「等、等一下！前面好像有什么……先别动，让我看清楚。」' },
  { expr: 'happy', line: '「今天鞋子绑得很紧，就算突然要跑起来也完全没问题！」' },
  { expr: 'shy', line: '「其实每次遇到奇怪的声音我都会先吓一跳……但还是想搞明白真相。」' },
  { expr: 'surprised', line: '「刚才那颗流星划过去的时候，尾迹好像停顿了半秒钟！」' },
  { expr: 'default', line: '「左胸的黄色徽章提醒我：观察要细心，判断要冷静。」' },
  { expr: 'happy', line: '「如果你今天有发现有趣的小事，也写进我的探索日记里好不好？」' },
];

const ALERT_SCENARIOS = [
  {
    id: 'footprint',
    name: '荧光足迹',
    code: 'ANOMALY-04B',
    location: 'B3区 · 苔藓小径',
    clue: '地面发现三枚间隔 42cm 的淡蓝色微光足印，边缘伴随细微结晶粉末。',
    radioLog: [
      '「滋滋——各单位注意，这里是安月！」',
      '「在 B3 区发现异常荧光足迹，方向指向旧天文台。」',
      '「我已记录样本编号，请附近同伴保持安全距离，不要单独跟进！」',
    ],
  },
  {
    id: 'frequency',
    name: '不明电波',
    code: 'ANOMALY-07A',
    location: '东侧高塔 · 38.4MHz',
    clue: '黄色对讲机每隔 9 秒收到一次规律的短促滴声，疑似老式信标回应。',
    radioLog: [
      '「等、等一下！对讲机自己在响……」',
      '「滋滋——捕获到未知规律脉冲信号，频率稳定在 38.4MHz。」',
      '「正在用观察笔记本记录莫尔斯间隔，请基地确认是否友方信标！」',
    ],
  },
  {
    id: 'starshift',
    name: '星光折射',
    code: 'ANOMALY-11C',
    location: '星夜观测营 · 东北空域',
    clue: '紫夜天幕局部出现轻微波纹状星光折射，持续约 12 秒后消散。',
    radioLog: [
      '「滋滋——安月紧急呼叫！东北天区出现异常光晕折射！」',
      '「周围风声突然静止了，但我还能保持冷静观察。」',
      '「坐标与时刻已同步至档案卡，请同伴帮忙核对天空变化！」',
    ],
  },
];

const SKETCH_PRESETS = [
  { id: 'star_fragment', label: '星尘碎片', desc: '夜光微尘标本素描' },
  { id: 'glow_print', label: '微光足印', desc: '神秘步态间距测量' },
  { id: 'moon_moss', label: '月光苔藓', desc: '荧光植物叶脉记录' },
  { id: 'radio_wave', label: '电波波形', desc: '未知信号频率草图' },
];

const DEFAULT_DIARIES = [
  {
    id: 'exp-001',
    code: 'EXP-001',
    date: '2026-11-24',
    tag: '星象异常',
    title: '东北天际的金色余晖脉冲',
    content: '晚上十一点整巡查观测营时，天幕忽然闪烁了一下淡黄色的光点。我握紧对讲机等了两分钟，没有后续声响，于是在笔记本角落画下了它的方位角。',
    sketchId: 'star_fragment',
    imageData: null,
    anyueReply: '「哇，这条记录的方位角非常精准！虽然当时心跳得很快，但多亏记下来了，后面一定能派上用场！」',
  },
  {
    id: 'exp-002',
    code: 'EXP-002',
    date: '2026-11-25',
    tag: '足迹线索',
    title: '斜挎包旁发现的微光露珠',
    content: '穿过迷雾林边缘后，发现袖口和靴子边沾着不寻常的浅灰蓝色荧光粉尘。顺着草叶倒伏的方向看去，似乎通向山坡上的旧天文台。',
    sketchId: 'glow_print',
    imageData: null,
    anyueReply: '「等、等一下！浅灰蓝色的荧光粉尘……和我的袖子颜色好像，但会发光！明天我们再去确认一次吧，记得走在安全路上。」',
  },
  {
    id: 'exp-003',
    code: 'EXP-003',
    date: '2026-11-26',
    tag: '日常碎片',
    title: '整理黄色对讲机与备用贴纸',
    content: '今天没有遇到吓人的异常状况，替对讲机换了新电池，还在笔记本里夹了一张星星书签。风吹过长耳朵的时候感觉特别安心。',
    sketchId: 'moon_moss',
    imageData: null,
    anyueReply: '「呼——和平的巡查日也是最珍贵的记录！谢谢你陪我一起检查装备，今晚也要好好休息哦。」',
  },
];

function generateAnyueReply(title = '', content = '', tag = '') {
  const text = `${title} ${content} ${tag}`;
  if (/光|星|月|夜|空/.test(text)) {
    return '「是和星空有关的发现呢！我立刻用黄色荧光笔在笔记本边角标上星号，今晚再一起抬头确认一次吧。」';
  }
  if (/声|响|风|对讲|电波|叫/.test(text)) {
    return '「等、等一下！听到奇怪的声音可不能大意……我已经调高对讲机灵敏度了，下次听到请马上告诉我！」';
  }
  if (/脚印|足迹|线索|怪|异常|吓/.test(text)) {
    return '「呜哇，听起来好神秘……虽然我有点紧张，但越是这种时候越要把时间、地点都写清楚！交给我记录吧。」';
  }
  if (/开心|喜欢|温暖|茶|休息|笑/.test(text)) {
    return '「嘿嘿，看到这么温暖的记录，连绷紧的耳朵都放松下来了。能和你分享日常真的太好了！」';
  }
  return '「我仔细读完你的记录啦！每一个看似微小的细节，都可能是解开未知故事的钥匙呢。」';
}

global.AnYueData = {
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
};
})(window);
