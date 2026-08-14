(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const app = $('#app');
  const modal = $('#modal');
  const modalContent = $('#modal-content');
  const toastElement = $('#toast');

  const KEYS = {
    settings: 'calendarCulture.settings.v1',
    leads: 'calendarCulture.leads.v1',
    orders: 'calendarCulture.orders.v1',
    reports: 'calendarCulture.reports.v1',
    jobs: 'calendarCulture.jobs.v1',
    classics: 'calendarCulture.classics.v1',
    events: 'calendarCulture.events.v1',
    currentLead: 'calendarCulture.currentLead.v1'
  };

  const DEFAULT_SETTINGS = {
    demoMode: true,
    paymentEnabled: false,
    predictionEnabled: true,
    qimenEnabled: false,
    wechatConfigured: false,
    wechatUrlLink: '',
    modelName: '腾讯境内已备案模型（待配置）',
    modelFiling: '待平台审核后填写',
    complaintEmail: 'service@example.cn',
    gates: {
      legalOpinion: false,
      douyinApproval: false,
      wechatApproval: false,
      paymentApproval: false,
      icpLicense: false,
      expertValidation: false
    }
  };

  const MAINLAND_REGIONS = [
    ['11', '北京市', 116.41, ['北京市']], ['12', '天津市', 117.20, ['天津市']],
    ['13', '河北省', 114.52, ['石家庄市','唐山市','秦皇岛市','邯郸市','邢台市','保定市','张家口市','承德市','沧州市','廊坊市','衡水市']],
    ['14', '山西省', 112.55, ['太原市','大同市','阳泉市','长治市','晋城市','朔州市','晋中市','运城市','忻州市','临汾市','吕梁市']],
    ['15', '内蒙古自治区', 111.75, ['呼和浩特市','包头市','乌海市','赤峰市','通辽市','鄂尔多斯市','呼伦贝尔市','巴彦淖尔市','乌兰察布市','兴安盟','锡林郭勒盟','阿拉善盟']],
    ['21', '辽宁省', 123.43, ['沈阳市','大连市','鞍山市','抚顺市','本溪市','丹东市','锦州市','营口市','阜新市','辽阳市','盘锦市','铁岭市','朝阳市','葫芦岛市']],
    ['22', '吉林省', 125.32, ['长春市','吉林市','四平市','辽源市','通化市','白山市','松原市','白城市','延边朝鲜族自治州']],
    ['23', '黑龙江省', 126.64, ['哈尔滨市','齐齐哈尔市','鸡西市','鹤岗市','双鸭山市','大庆市','伊春市','佳木斯市','七台河市','牡丹江市','黑河市','绥化市','大兴安岭地区']],
    ['31', '上海市', 121.47, ['上海市']],
    ['32', '江苏省', 118.80, ['南京市','无锡市','徐州市','常州市','苏州市','南通市','连云港市','淮安市','盐城市','扬州市','镇江市','泰州市','宿迁市']],
    ['33', '浙江省', 120.16, ['杭州市','宁波市','温州市','嘉兴市','湖州市','绍兴市','金华市','衢州市','舟山市','台州市','丽水市']],
    ['34', '安徽省', 117.28, ['合肥市','芜湖市','蚌埠市','淮南市','马鞍山市','淮北市','铜陵市','安庆市','黄山市','滁州市','阜阳市','宿州市','六安市','亳州市','池州市','宣城市']],
    ['35', '福建省', 119.30, ['福州市','厦门市','莆田市','三明市','泉州市','漳州市','南平市','龙岩市','宁德市']],
    ['36', '江西省', 115.86, ['南昌市','景德镇市','萍乡市','九江市','新余市','鹰潭市','赣州市','吉安市','宜春市','抚州市','上饶市']],
    ['37', '山东省', 117.12, ['济南市','青岛市','淄博市','枣庄市','东营市','烟台市','潍坊市','济宁市','泰安市','威海市','日照市','临沂市','德州市','聊城市','滨州市','菏泽市']],
    ['41', '河南省', 113.63, ['郑州市','开封市','洛阳市','平顶山市','安阳市','鹤壁市','新乡市','焦作市','濮阳市','许昌市','漯河市','三门峡市','南阳市','商丘市','信阳市','周口市','驻马店市','济源市']],
    ['42', '湖北省', 114.31, ['武汉市','黄石市','十堰市','宜昌市','襄阳市','鄂州市','荆门市','孝感市','荆州市','黄冈市','咸宁市','随州市','恩施土家族苗族自治州','仙桃市','潜江市','天门市','神农架林区']],
    ['43', '湖南省', 112.98, ['长沙市','株洲市','湘潭市','衡阳市','邵阳市','岳阳市','常德市','张家界市','益阳市','郴州市','永州市','怀化市','娄底市','湘西土家族苗族自治州']],
    ['44', '广东省', 113.26, ['广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','梅州市','汕尾市','河源市','阳江市','清远市','东莞市','中山市','潮州市','揭阳市','云浮市']],
    ['45', '广西壮族自治区', 108.32, ['南宁市','柳州市','桂林市','梧州市','北海市','防城港市','钦州市','贵港市','玉林市','百色市','贺州市','河池市','来宾市','崇左市']],
    ['46', '海南省', 110.20, ['海口市','三亚市','三沙市','儋州市','五指山市','琼海市','文昌市','万宁市','东方市','定安县','屯昌县','澄迈县','临高县','白沙黎族自治县','昌江黎族自治县','乐东黎族自治县','陵水黎族自治县','保亭黎族苗族自治县','琼中黎族苗族自治县']],
    ['50', '重庆市', 106.55, ['重庆市']],
    ['51', '四川省', 104.07, ['成都市','自贡市','攀枝花市','泸州市','德阳市','绵阳市','广元市','遂宁市','内江市','乐山市','南充市','眉山市','宜宾市','广安市','达州市','雅安市','巴中市','资阳市','阿坝藏族羌族自治州','甘孜藏族自治州','凉山彝族自治州']],
    ['52', '贵州省', 106.63, ['贵阳市','六盘水市','遵义市','安顺市','毕节市','铜仁市','黔西南布依族苗族自治州','黔东南苗族侗族自治州','黔南布依族苗族自治州']],
    ['53', '云南省', 102.71, ['昆明市','曲靖市','玉溪市','保山市','昭通市','丽江市','普洱市','临沧市','楚雄彝族自治州','红河哈尼族彝族自治州','文山壮族苗族自治州','西双版纳傣族自治州','大理白族自治州','德宏傣族景颇族自治州','怒江傈僳族自治州','迪庆藏族自治州']],
    ['54', '西藏自治区', 91.13, ['拉萨市','日喀则市','昌都市','林芝市','山南市','那曲市','阿里地区']],
    ['61', '陕西省', 108.94, ['西安市','铜川市','宝鸡市','咸阳市','渭南市','延安市','汉中市','榆林市','安康市','商洛市']],
    ['62', '甘肃省', 103.83, ['兰州市','嘉峪关市','金昌市','白银市','天水市','武威市','张掖市','平凉市','酒泉市','庆阳市','定西市','陇南市','临夏回族自治州','甘南藏族自治州']],
    ['63', '青海省', 101.78, ['西宁市','海东市','海北藏族自治州','黄南藏族自治州','海南藏族自治州','果洛藏族自治州','玉树藏族自治州','海西蒙古族藏族自治州']],
    ['64', '宁夏回族自治区', 106.23, ['银川市','石嘴山市','吴忠市','固原市','中卫市']],
    ['65', '新疆维吾尔自治区', 87.62, ['乌鲁木齐市','克拉玛依市','吐鲁番市','哈密市','昌吉回族自治州','博尔塔拉蒙古自治州','巴音郭楞蒙古自治州','阿克苏地区','克孜勒苏柯尔克孜自治州','喀什地区','和田地区','伊犁哈萨克自治州','塔城地区','阿勒泰地区','石河子市','阿拉尔市','图木舒克市','五家渠市','北屯市','铁门关市','双河市','可克达拉市','昆玉市','胡杨河市','新星市','白杨市']],
    ['71', '台灣', 121.00, ['台北市','新北市','桃園市','台中市','台南市','高雄市','基隆市','新竹市','嘉義市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣','連江縣'], 'Asia/Taipei']
  ].filter(([id]) => id === '71').map(([id, name, longitude, cities, timezone = 'Asia/Shanghai']) => ({ id, name, longitude, cities, timezone }));
  const TAIWAN_CITY_LONGITUDES = {
    '台北市': 121.5654, '新北市': 121.4628, '桃園市': 121.3010, '台中市': 120.6736,
    '台南市': 120.2270, '高雄市': 120.3014, '基隆市': 121.7392, '新竹市': 120.9675,
    '嘉義市': 120.4491, '新竹縣': 121.0177, '苗栗縣': 120.8200, '彰化縣': 120.5440,
    '南投縣': 120.6850, '雲林縣': 120.4313, '嘉義縣': 120.5740, '屏東縣': 120.5488,
    '宜蘭縣': 121.7537, '花蓮縣': 121.6015, '台東縣': 121.1500, '澎湖縣': 119.5664,
    '金門縣': 118.3186, '連江縣': 119.9499
  };
  const CITIES = MAINLAND_REGIONS.flatMap(region => region.cities.map((cityName, index) => ({
    id: `cn-${region.id}-${String(index + 1).padStart(2, '0')}`,
    provinceId: region.id,
    provinceName: region.name,
    cityName,
    name: region.name === cityName ? cityName : `${region.name}${cityName}`,
    longitude: TAIWAN_CITY_LONGITUDES[cityName] ?? region.longitude,
    latitude: 0,
    utcOffset: 8,
    timezone: region.timezone,
    coordinatePrecision: 'city-reference'
  })));

  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const STEM_ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  const BRANCH_ELEMENTS = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  const ELEMENTS = ['木', '火', '土', '金', '水'];
  const BOOKS = ['滴天髓', '子平真诠', '穷通宝鉴', '三命通会', '渊海子平'];
  const CLASSIC_FRAMEWORK = [
    { book: '滴天髓', focus: '五行气势与流通', scope: '用于复核日主、五行生克、气势偏聚与通关逻辑。' },
    { book: '子平真诠', focus: '月令与格局成败', scope: '用于确认以月令为纲、十神配置及格局成立条件。' },
    { book: '穷通宝鉴', focus: '月令调候', scope: '用于观察出生节令的寒暖燥湿，不以五行数量直接代替调候。' },
    { book: '三命通会', focus: '干支与岁运体系', scope: '用于交叉复核四柱、十神、大运及流年关系的传统规则。' },
    { book: '渊海子平', focus: '十神与刑冲合会', scope: '用于复核十神落位、地支合冲及原局与岁运的触发关系。' }
  ];
  const SHENSHA_INFO = {
    天乙贵人: { meaning: '用于观察命局中较容易获得提携、协调与化解阻力的位置。是否真正形成助力，仍须结合该支的旺衰、合冲与空亡。', rule: '以日干查四柱地支：甲戊见丑未，乙己见子申，丙丁见亥酉，庚辛见午寅，壬癸见卯巳。', source: '《渊海子平》卷一〈论起玉堂天乙贵人〉' },
    文昌贵人: { meaning: '用于辅助观察学习、文书、表达、考试与知识整理倾向，不等同学历或考试结果。', rule: '以日干查支：甲巳、乙午、丙戊申、丁己酉、庚亥、辛子、壬寅、癸卯。', source: '《渊海子平》神煞法诀〈文昌贵人〉' },
    桃花: { meaning: '又称咸池，用于观察社交吸引、审美表达与关系互动的活跃位置；不可单独解释为婚姻吉凶。', rule: '以日支所属三合局查支：申子辰见酉，寅午戌见卯，巳酉丑见午，亥卯未见子。', source: '《三命通会》〈论咸池〉' },
    驿马: { meaning: '用于观察迁动、出差、跨域发展与生活节奏变化；见驿马不等于必然迁居。', rule: '以日支所属三合局查冲位：申子辰见寅，寅午戌见申，巳酉丑见亥，亥卯未见巳。', source: '《三命通会》〈论驿马〉' },
    华盖: { meaning: '用于辅助观察独立思考、审美、技艺、研究与精神兴趣；不应直接解释为孤独或宗教命。', rule: '以日支所属三合局查库位：申子辰见辰，寅午戌见戌，巳酉丑见丑，亥卯未见未。', source: '《三命通会》卷二〈论将星华盖〉' },
    空亡: { meaning: '旬空是六十甲子每旬中未能与十天干配对的两个地支，用于观察某柱之象是否出现落空、延后或形式化；不能单独断凶。', rule: '按该柱所属甲子旬计算两个旬空地支；仍须检查填实、合冲及岁运引动。', source: '《渊海子平》〈论空亡〉；《三命通会》相关空亡论述' }
  };
  const PILLAR_MEANINGS = [
    { name: '年柱', short: '祖辈 · 早年', detail: '主要观察祖辈根基、出生家庭的外部背景、童年早期环境，以及命主对外展现的第一层社会印象。', note: '年柱不能单独决定家庭条件，仍须与月柱、十神及全局生克合看。' },
    { name: '月柱', short: '父母 · 成长', detail: '月令是子平法判断旺衰与格局的重要提纲；月柱同时用于观察父母、手足、成长环境，以及进入社会后的制度与工作场域。', note: '月柱权重高，但不是只看月令就能完成全部判断。' },
    { name: '日柱', short: '自身 · 夫妻', detail: '日干代表命主自身，是十神定位的基准；日支为夫妻宫，用于观察亲密关系、共同生活与内在安全感。', note: '夫妻宫的合冲只表示关系议题被触发，不能直接断定结婚或离婚。' },
    { name: '时柱', short: '子女 · 晚景', detail: '主要观察子女、晚年生活、长期计划、事业最终落点，以及命主希望留下的成果与延续。', note: '时柱也受大运流年引动，不能单凭一柱推断子女或晚年吉凶。' }
  ];
  const HIDDEN_STEMS = {
    子: ['癸'], 丑: ['己', '癸', '辛'], 寅: ['甲', '丙', '戊'], 卯: ['乙'],
    辰: ['戊', '乙', '癸'], 巳: ['丙', '戊', '庚'], 午: ['丁', '己'], 未: ['己', '丁', '乙'],
    申: ['庚', '壬', '戊'], 酉: ['辛'], 戌: ['戊', '辛', '丁'], 亥: ['壬', '甲']
  };
  const GROWTH_STAGES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
  const GROWTH_START_BRANCH = { 甲: 11, 乙: 6, 丙: 2, 丁: 9, 戊: 2, 己: 9, 庚: 5, 辛: 0, 壬: 8, 癸: 3 };
  const NAYIN_PAIRS = [
    '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
    '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
    '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'
  ];
  const ELEMENT_CLASS = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };

  function parseJSON(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  }
  function load(key, fallback) { return parseJSON(localStorage.getItem(key), fallback); }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function nowISO() { return new Date().toISOString(); }
  function uid(prefix) {
    const random = window.crypto && crypto.randomUUID ? crypto.randomUUID().replaceAll('-', '') : Math.random().toString(36).slice(2) + Date.now().toString(36);
    return `${prefix}_${random.slice(0, 20)}`;
  }
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }
  const TRADITIONAL_PHRASES = [
    ['重复', '重複'], ['恢复', '恢復'], ['复核', '復核'], ['反馈', '反饋'], ['后台', '後臺'], ['采用', '採用'], ['象征', '象徵'],
    ['阳历', '陽曆'], ['阴历', '陰曆'], ['农历', '農曆'], ['公历', '公曆'], ['里程', '里程'], ['干支', '干支'], ['天干', '天干']
  ];
  const TRADITIONAL_PAIRS = `万萬|与與|专專|业業|东東|丝絲|两兩|严嚴|个個|临臨|为為|丽麗|举舉|义義|乌烏|乐樂|乔喬|习習|乡鄉|书書|买買|乱亂|争爭|于於|亏虧|云雲|亚亞|产產|亲親|亿億|仅僅|从從|仓倉|仪儀|们們|价價|众眾|优優|会會|伟偉|传傳|伤傷|伦倫|伪偽|体體|余餘|侠俠|侣侶|侧側|侨僑|俭儉|债債|倾傾|储儲|儿兒|兑兌|党黨|兰蘭|关關|兴興|养養|兽獸|内內|冈岡|册冊|写寫|军軍|农農|冲沖|决決|况況|冻凍|净淨|凉涼|减減|凤鳳|凭憑|凯凱|别別|删刪|则則|剑劍|剥剝|剧劇|办辦|务務|动動|励勵|劳勞|势勢|区區|医醫|华華|协協|单單|卖賣|卢盧|卫衛|却卻|厅廳|历曆|压壓|县縣|参參|双雙|发發|变變|叠疊|叶葉|号號|启啟|听聽|吴吳|响響|问問|团團|园園|围圍|国國|图圖|圆圓|圣聖|场場|坏壞|块塊|坚堅|坛壇|坝壩|壮壯|声聲|壳殼|处處|备備|复復|够夠|头頭|夹夾|夺奪|奋奮|奖獎|妇婦|妈媽|孙孫|学學|宁寧|宝寶|实實|审審|宫宮|寻尋|对對|导導|将將|尔爾|尘塵|尝嘗|层層|岁歲|岂豈|岗崗|岛島|岭嶺|峡峽|币幣|师師|带帶|帮幫|并並|庄莊|庆慶|庐廬|库庫|应應|庙廟|废廢|开開|异異|弃棄|张張|强強|归歸|当當|录錄|彻徹|征徵|径徑|忆憶|忧憂|态態|怀懷|总總|恋戀|恶惡|恳懇|恼惱|悦悅|惊驚|惧懼|惨慘|惩懲|惯慣|愿願|戏戲|战戰|户戶|扑撲|执執|扩擴|扫掃|扬揚|扰擾|抚撫|抢搶|护護|报報|担擔|拟擬|拢攏|择擇|挂掛|挚摯|损損|换換|据據|掷擲|揽攬|摆擺|摇搖|摄攝|携攜|数數|敌敵|敛斂|斗鬥|断斷|无無|旧舊|时時|显顯|晋晉|昼晝|晓曉|暂暫|术術|机機|杀殺|杂雜|权權|条條|来來|杨楊|极極|构構|标標|样樣|树樹|档檔|桥橋|检檢|楼樓|横橫|欢歡|欧歐|残殘|毕畢|气氣|汉漢|汤湯|沟溝|没沒|洁潔|浅淺|济濟|浑渾|浓濃|测測|涛濤|润潤|涩澀|渐漸|渔漁|温溫|湾灣|湿濕|滚滾|满滿|滤濾|灭滅|灯燈|灵靈|灾災|炉爐|烂爛|点點|热熱|爱愛|爷爺|牵牽|牺犧|状狀|独獨|狭狹|猎獵|猫貓|献獻|环環|现現|琼瓊|电電|画畫|畅暢|疗療|疯瘋|监監|盖蓋|盘盤|着著|睁睜|瞒瞞|矿礦|码碼|确確|碍礙|礼禮|祸禍|离離|种種|积積|称稱|稳穩|穷窮|竞競|笔筆|笼籠|签簽|简簡|类類|紧緊|纠糾|红紅|约約|级級|纪紀|纤纖|纬緯|纯純|纲綱|纳納|纵縱|纷紛|纸紙|纹紋|线線|练練|组組|细細|织織|终終|经經|结結|绕繞|给給|络絡|绝絕|统統|继繼|绩績|续續|绳繩|维維|综綜|绿綠|缘緣|编編|缓緩|缠纏|缩縮|网網|罗羅|罚罰|职職|联聯|肃肅|胜勝|胀脹|肤膚|肾腎|胆膽|脑腦|脉脈|脏臟|脸臉|腾騰|舰艦|艺藝|节節|苏蘇|范範|药藥|获獲|营營|蓝藍|虑慮|虚虛|虫蟲|虽雖|补補|装裝|袭襲|见見|观觀|规規|视視|览覽|觉覺|触觸|誉譽|计計|订訂|认認|让讓|议議|讯訊|记記|讲講|许許|论論|设設|访訪|证證|评評|识識|诉訴|诊診|词詞|译譯|试試|诗詩|诚誠|话話|诞誕|询詢|该該|详詳|语語|误誤|说說|读讀|课課|谁誰|调調|谈談|谅諒|谋謀|谓謂|谢謝|谱譜|负負|财財|贡貢|贫貧|货貨|贪貪|购購|贯貫|贵貴|贷貸|费費|贺賀|资資|赌賭|赏賞|赔賠|赖賴|赚賺|赛賽|赞讚|赠贈|赢贏|赶趕|趋趨|跃躍|车車|轨軌|转轉|轮輪|软軟|较較|载載|辅輔|辆輛|辈輩|辉輝|边邊|辽遼|达達|迁遷|过過|运運|还還|进進|远遠|违違|连連|迟遲|适適|选選|递遞|逻邏|遗遺|邮郵|邻鄰|郑鄭|酝醞|鉴鑒|钦欽|钩鉤|钝鈍|钟鐘|钢鋼|钥鑰|钱錢|钻鑽|铁鐵|铸鑄|铃鈴|铜銅|铭銘|银銀|铺鋪|链鏈|销銷|锁鎖|错錯|镇鎮|镜鏡|长長|门門|间間|闻聞|阁閣|阅閱|队隊|阶階|际際|陆陸|阳陽|阴陰|陈陳|陕陝|险險|随隨|隐隱|难難|雾霧|静靜|顶頂|项項|顺順|须須|顾顧|顿頓|预預|领領|频頻|题題|颜顏|额額|风風|飞飛|饭飯|饮飲|饱飽|饰飾|馆館|驱驅|验驗|骂罵|鱼魚|鸟鳥|鸡雞|鸣鳴|鸭鴨|鹅鵝|黄黃|齐齊|齿齒|龙龍|后後|汇匯|台臺|页頁|输輸|诺諾|吓嚇|辞辭|请請`.split('|').map(pair => [pair[0], pair.slice(1)]);
  function traditionalize(value) {
    let text = String(value ?? '');
    TRADITIONAL_PHRASES.forEach(([from, to]) => { text = text.replaceAll(from, to); });
    TRADITIONAL_PAIRS.forEach(([from, to]) => { text = text.replaceAll(from, to); });
    return text.replaceAll('臺灣', '台灣');
  }
  function localizeTraditional(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { const next = traditionalize(node.nodeValue); if (next !== node.nodeValue) node.nodeValue = next; });
    root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(element => {
      ['placeholder', 'title', 'aria-label'].forEach(attribute => {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, traditionalize(element.getAttribute(attribute)));
      });
    });
  }
  function formatDate(value, includeTime = true) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('zh-CN', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date);
  }
  function toast(message) {
    toastElement.textContent = message;
    toastElement.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toastElement.classList.remove('show'), 2200);
  }
  function track(name, properties = {}) {
    const events = load(KEYS.events, []);
    events.push({ id: uid('evt'), name, properties, at: nowISO() });
    save(KEYS.events, events.slice(-500));
  }

  function getSettings() { return { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}), gates: { ...DEFAULT_SETTINGS.gates, ...(load(KEYS.settings, {}).gates || {}) } }; }
  function setSettings(next) { save(KEYS.settings, next); renderBanner(); }
  function allGatesReady(settings = getSettings()) { return Object.values(settings.gates).every(Boolean); }
  function approvedClassics() { return load(KEYS.classics, []).filter(item => item.approved); }
  function predictionReady() { return true; }

  function purgeExpiredData() {
    const now = Date.now();
    const leads = load(KEYS.leads, []).filter(item => item.linkedAt || now - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000);
    const reports = load(KEYS.reports, []).filter(item => now - new Date(item.createdAt).getTime() < 365 * 24 * 60 * 60 * 1000);
    save(KEYS.leads, leads);
    save(KEYS.reports, reports);
  }

  function renderBanner() {
    const settings = getSettings();
    const banner = $('#compliance-banner');
    banner.className = 'compliance-banner';
    banner.textContent = settings.demoMode
      ? '传统历法分析演示 · 十年趋势与年度行动提示已开放'
      : `传统历法分析 · 模型：${settings.modelName}`;
  }

  function getRoute() {
    const raw = (location.hash || '#/home').slice(1);
    const [path, queryString = ''] = raw.split('?');
    return { path: path || '/home', query: new URLSearchParams(queryString) };
  }
  function go(path) { location.hash = path.startsWith('#') ? path.slice(1) : path; }
  function focusPage() { app.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }

  function homeView() {
    return `
      <div class="page">
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">传统历法 · 古籍证据 · 清晰可核</span>
            <h1>从出生时空，<span>读懂传统历法结构</span></h1>
            <p class="lede">输入出生日期、时间与地点，查看四柱十神、五行结构，以及未来十年婚姻、事业与财富趋势。</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#/start">免费生成试读</a>
            </div>
            <p class="hero-note">未登录资料 24 小时自动删除 · 仅限 18 岁以上</p>
          </div>
          <aside class="scroll-card" aria-label="命盘报告示意">
            <span class="eyebrow">报告示意</span>
            <h3>四柱结构，一目了然</h3>
            <div class="sample-pillars">
              ${['甲子', '丙寅', '戊午', '壬戌'].map((item, index) => `<div class="pillar"><small>${['年柱', '月柱', '日柱', '时柱'][index]}</small><b>${item}</b></div>`).join('')}
            </div>
            <p>结论必须具备计算版本、规则编号与已核验古籍来源。资料不足时明确拒绝判断。</p>
            <span class="evidence-chip">真太阳时校正</span><span class="evidence-chip">23:00 子初换日</span>
          </aside>
        </section>

        <section class="section">
          <div class="section-heading"><span class="eyebrow">产品底线</span><h2>先有证据，再有结论</h2></div>
          <div class="feature-grid">
            <article class="feature-card"><div class="feature-icon">校</div><h3>确定性排盘</h3><p>历法计算与 AI 成文分离。节气、时区、真太阳时和换日规则保留版本记录。</p></article>
            <article class="feature-card"><div class="feature-icon">据</div><h3>古籍可追溯</h3><p>只有经命理师核验书名、版本、篇章和页码的资料，才能进入正式报告。</p></article>
            <article class="feature-card"><div class="feature-icon">审</div><h3>双重审核</h3><p>报告发布前检查无来源判断、医疗越界、投资承诺、恐吓措辞与 AI 标识。</p></article>
          </div>
        </section>

        <section class="section feedback-section" id="feedback-section">
          <div class="section-heading"><span class="eyebrow">使用反馈</span><h2>留下你的真实感受</h2><p>欢迎告诉我们排盘是否清楚、哪些解读最有帮助，以及希望继续改进的地方。</p></div>
          <div class="feedback-layout">
            <form id="feedback-form" class="feedback-form">
              <div class="field"><label for="feedback-name">称呼（选填）</label><input id="feedback-name" name="name" maxlength="20" placeholder="例如：试用者"></div>
              <div class="field"><label for="feedback-message">留言内容</label><textarea id="feedback-message" name="message" rows="5" maxlength="300" required placeholder="请写下实际使用感受，最多 300 字"></textarea></div>
              <label class="checkbox"><input name="publicConsent" type="checkbox" required><span>我知道此留言会公开显示；请勿填写出生时间、电话或其他个人资料。</span></label>
              <p id="feedback-message-status" class="form-message" role="alert"></p>
              <button class="btn btn-primary" type="submit">送出留言</button>
            </form>
            <div class="feedback-wall"><div class="feedback-wall-head"><h3>最近留言</h3><span>真实意见，持续改进</span></div><div id="feedback-list" class="feedback-list"><p class="feedback-loading">正在载入留言…</p></div></div>
          </div>
        </section>
      </div>`;
  }

  function fallbackFeedback() { return load('bazi_feedback_fallback', []); }
  function feedbackItemHTML(item) {
    return `<article class="feedback-item"><header><b>${escapeHTML(item.name || '试用者')}</b><time>${escapeHTML(formatDate(item.createdAt, false))}</time></header><p>${escapeHTML(item.message)}</p></article>`;
  }
  async function loadFeedbackWall() {
    const list = $('#feedback-list');
    if (!list) return;
    try {
      const response = await fetch('/api/feedback', { cache: 'no-store' });
      if (!response.ok) throw new Error('feedback-api-unavailable');
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      list.innerHTML = items.length ? items.map(feedbackItemHTML).join('') : '<p class="feedback-empty">还没有留言，欢迎成为第一位。</p>';
    } catch (_) {
      const items = fallbackFeedback();
      list.innerHTML = items.length ? items.slice().reverse().map(feedbackItemHTML).join('') : '<p class="feedback-empty">还没有留言，欢迎成为第一位。</p>';
    }
  }
  async function submitFeedback(form) {
    const status = $('#feedback-message-status');
    const data = new FormData(form);
    const item = { name: String(data.get('name') || '').trim() || '试用者', message: String(data.get('message') || '').trim() };
    if (!item.message) { status.textContent = '请填写留言内容。'; return; }
    status.textContent = '正在送出…';
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (!response.ok) throw new Error('feedback-api-unavailable');
      form.reset(); status.textContent = '谢谢你的留言，已成功送出。'; await loadFeedbackWall();
    } catch (_) {
      const items = fallbackFeedback();
      items.push({ ...item, id: uid('feedback'), createdAt: nowISO() });
      save('bazi_feedback_fallback', items.slice(-30));
      form.reset(); status.textContent = '留言已保存在此装置。连接公开服务后会由服务器统一收集。'; await loadFeedbackWall();
    }
  }

  function startView() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const yearOptions = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index).map(year => `<option value="${year}">${year}</option>`).join('');
    const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1).map(month => `<option value="${month}">${pad(month)}</option>`).join('');
    const dayOptions = Array.from({ length: 31 }, (_, index) => index + 1).map(day => `<option value="${day}">${pad(day)}</option>`).join('');
    const hourOptions = Array.from({ length: 24 }, (_, hour) => `<option value="${hour}">${pad(hour)}</option>`).join('');
    const minuteOptions = Array.from({ length: 60 }, (_, minute) => `<option value="${minute}">${pad(minute)}</option>`).join('');
    return `
      <div class="page narrow">
        <div class="stepper" aria-label="步骤 1，共 3 步"><span class="step-dot active"></span><span class="step-dot"></span><span class="step-dot"></span></div>
        <div class="section-heading"><span class="eyebrow">第一步 · 出生资料</span><h2>建立历法结构</h2><p>出生日期可选择阳历或农历输入。可搜索全国省市并补充区县，不获取实时定位。</p></div>
        <form id="birth-form" class="form-card" novalidate>
          <div class="calendar-mode" role="tablist" aria-label="出生日期历法"><button type="button" class="active" role="tab" aria-selected="true" data-calendar-input="solar">阳历出生</button><button type="button" role="tab" aria-selected="false" data-calendar-input="lunar">农历出生</button></div>
          <div class="form-grid">
            <div class="field birth-date-field"><label id="birth-date-label">出生日期（阳历）</label><div class="wheel-picker date-wheel" aria-label="出生年月日滚轮选择"><label class="picker-part"><span>年</span><select id="birth-year" aria-label="出生年份"><option value="">----</option>${yearOptions}</select></label><label class="picker-part"><span>月</span><select id="birth-month" aria-label="出生月份"><option value="">--</option>${monthOptions}</select></label><label class="picker-part"><span>日</span><select id="birth-day" aria-label="出生日期"><option value="">--</option>${dayOptions}</select></label></div><div class="calendar-meta"><label id="lunar-leap-field" class="lunar-leap" hidden><input id="lunar-leap" type="checkbox"><span>本月为闰月</span></label><small id="calendar-help">采用阳历日期计算节气与四柱。</small></div><input id="calendar-type" name="calendarType" type="hidden" value="solar"><input id="solar-date" name="solarDate" type="hidden"><input id="lunar-input" name="lunarInput" type="hidden"></div>
            <div class="field"><label>出生时间（24 小时制）</label><div class="wheel-picker time-wheel" aria-label="24小时出生时间滚轮选择"><label class="picker-part"><span>小时</span><select id="birth-hour" aria-label="出生小时"><option value="">--</option>${hourOptions}</select></label><span class="time-colon">:</span><label class="picker-part"><span>分钟</span><select id="birth-minute" aria-label="出生分钟"><option value="">--</option>${minuteOptions}</select></label></div><input id="birth-time" name="birthTime" type="hidden"><small>00:00 至 23:59；不确定时请勿随意猜测分钟。</small></div>
            <div class="field full location-search-field"><label for="location-search">搜尋出生地</label><input id="location-search" type="search" autocomplete="off" placeholder="輸入台灣縣市，例如：台北市"><div id="location-results" class="location-results" hidden></div></div>
            <div class="field"><label for="birth-province">出生地區</label><select id="birth-province" name="provinceId" required>${MAINLAND_REGIONS.map(region => `<option value="${region.id}" selected>${region.name}</option>`).join('')}</select></div>
            <div class="field"><label for="birth-city">出生縣市</label><select id="birth-city" name="cityId" required disabled><option value="">請先選擇地區</option></select><small id="city-coordinate-note">選擇縣市後用於真太陽時校正。</small></div>
            <div class="field"><label for="birth-district">出生区县（选填）</label><input id="birth-district" name="district" type="text" maxlength="30" placeholder="例：东城区、南山区"></div>
            <div class="field"><span>性别</span><select name="sex" required><option value="">请选择</option><option value="female">女</option><option value="male">男</option><option value="unspecified">不便说明</option></select></div>
            <div class="field full chart-rule-panel"><div><small>时间校正</small><b>真太阳时</b><span>按出生地经度与均时差校正</span></div><div><small>换日规则</small><b>23:00 子初</b><span>用于日柱与时柱计算</span></div><div><small>月份边界</small><b>节气切月</b><span>不按农历初一切换月柱</span></div></div>
            <div class="field full"><label class="checkbox"><input type="checkbox" name="adult" required><span>我确认已满 18 岁。</span></label></div>
            <div class="field full"><label class="checkbox"><input type="checkbox" name="privacy" required><span>我已阅读并同意《隐私说明》，知悉出生资料用于排盘与报告生成，未完成微信承接的资料将在 24 小时内删除。</span></label></div>
            <div class="field full"><label class="checkbox"><input type="checkbox" name="culture"><span>我理解当前默认提供传统历法文化研习内容，不把结果用于医疗、投资或人生重大决定。</span></label></div>
          </div>
          <p id="form-message" class="form-message" role="alert"></p>
          <div class="button-row"><button class="btn btn-primary" type="submit">生成结果</button><button class="btn btn-soft" type="button" data-action="privacy">查看隐私说明</button></div>
        </form>
      </div>`;
  }

  function cityById(id) { return CITIES.find(city => city.id === id); }
  function pad(number) { return String(number).padStart(2, '0'); }
  function lunarPartsForDate(date) {
    const formatter = new Intl.DateTimeFormat('en-u-ca-chinese', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
    const parts = Object.fromEntries(formatter.formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    const monthText = String(parts.month || '');
    return {
      year: Number(parts.relatedYear || parts.year),
      month: Number((monthText.match(/\d+/) || [0])[0]),
      day: Number(parts.day),
      leap: /bis|leap/i.test(monthText)
    };
  }
  function lunarToSolarDate(year, month, day, leap = false) {
    try {
      const start = Date.UTC(year, 0, 1);
      const end = Date.UTC(year + 1, 2, 15);
      for (let value = start; value <= end; value += 86400000) {
        const date = new Date(value);
        const lunar = lunarPartsForDate(date);
        if (lunar.year === year && lunar.month === month && lunar.day === day && lunar.leap === leap) {
          return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
        }
      }
    } catch (error) {
      return '';
    }
    return '';
  }
  function julianDayNumber(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }
  function dayOfYear(year, month, day) {
    const start = Date.UTC(year, 0, 0);
    return Math.floor((Date.UTC(year, month - 1, day) - start) / 86400000);
  }
  function equationOfTime(year, month, day) {
    const b = 2 * Math.PI * (dayOfYear(year, month, day) - 81) / 364;
    return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  }
  function addMinutes(parts, minutes) {
    const utc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute + Math.round(minutes));
    const date = new Date(utc);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), hour: date.getUTCHours(), minute: date.getUTCMinutes() };
  }
  function normalizeDegrees(value) { return ((value % 360) + 360) % 360; }
  function julianDateUTC(year, month, day, hour = 0, minute = 0) {
    let y = year;
    let m = month;
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const dayFraction = (hour + minute / 60) / 24;
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + b - 1524.5;
  }
  function apparentSolarLongitude(year, month, day, localHour, localMinute, utcOffset) {
    const utc = new Date(Date.UTC(year, month - 1, day, localHour - utcOffset, localMinute));
    const jd = julianDateUTC(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes());
    const t = (jd - 2451545.0) / 36525;
    const meanLongitude = normalizeDegrees(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
    const meanAnomaly = normalizeDegrees(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
    const anomalyRadians = meanAnomaly * Math.PI / 180;
    const equationOfCenter =
      (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(anomalyRadians) +
      (0.019993 - 0.000101 * t) * Math.sin(2 * anomalyRadians) +
      0.000289 * Math.sin(3 * anomalyRadians);
    const omega = (125.04 - 1934.136 * t) * Math.PI / 180;
    return normalizeDegrees(meanLongitude + equationOfCenter - 0.00569 - 0.00478 * Math.sin(omega));
  }
  function solarMonthIndex(longitude) {
    // 子平月建以十二「节」切月：立春 315° 起寅月，每 30° 进入下一月。
    return Math.floor(normalizeDegrees(longitude - 315) / 30);
  }
  function ganzhi(index) {
    const normalized = ((index % 60) + 60) % 60;
    return { cycleIndex: normalized, stemIndex: normalized % 10, branchIndex: normalized % 12, text: STEMS[normalized % 10] + BRANCHES[normalized % 12] };
  }
  function calculateChart(birth) {
    const city = cityById(birth.cityId);
    if (!city) throw new Error('找不到出生地资料，请重新选择。');
    const [year, month, day] = birth.solarDate.split('-').map(Number);
    const [hour, minute] = birth.birthTime.split(':').map(Number);
    const eot = equationOfTime(year, month, day);
    const standardMeridian = city.utcOffset * 15;
    const correctionMinutes = 4 * (city.longitude - standardMeridian) + eot;
    const solar = addMinutes({ year, month, day, hour, minute }, correctionMinutes);
    const solarLongitude = apparentSolarLongitude(year, month, day, hour, minute, city.utcOffset);
    const monthIndex = solarMonthIndex(solarLongitude);
    // 一月及立春前仍属于上一干支年；立春的实际时刻由太阳黄经 315° 判定。
    const beforeLiChun = month === 1 || (month === 2 && monthIndex === 11);
    const yearForPillar = beforeLiChun ? year - 1 : year;
    const yearPillar = ganzhi(yearForPillar - 1984);
    const tigerStem = ((yearPillar.stemIndex % 5) * 2 + 2) % 10;
    const monthStemIndex = (tigerStem + monthIndex) % 10;
    const monthBranchIndex = (2 + monthIndex) % 12;
    const monthPillar = { stemIndex: monthStemIndex, branchIndex: monthBranchIndex, text: STEMS[monthStemIndex] + BRANCHES[monthBranchIndex] };
    let dayParts = { ...solar };
    if (solar.hour >= 23) dayParts = addMinutes(solar, 60);
    const dayPillar = ganzhi(julianDayNumber(dayParts.year, dayParts.month, dayParts.day) + 49);
    const hourBranchIndex = Math.floor(((solar.hour + 1) % 24) / 2);
    const hourStemIndex = ((dayPillar.stemIndex % 5) * 2 + hourBranchIndex) % 10;
    const hourPillar = { stemIndex: hourStemIndex, branchIndex: hourBranchIndex, text: STEMS[hourStemIndex] + BRANCHES[hourBranchIndex] };
    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
    const counts = Object.fromEntries(ELEMENTS.map(item => [item, 0]));
    pillars.forEach(item => { counts[STEM_ELEMENTS[item.stemIndex]]++; counts[BRANCH_ELEMENTS[item.branchIndex]]++; });
    const civilHourBranch = Math.floor(((hour + 1) % 24) / 2);
    const alternate = civilHourBranch !== hourBranchIndex ? {
      reason: '真太阳时校正造成时支变化',
      civilTime: `${pad(hour)}:${pad(minute)}`,
      civilHourPillar: STEMS[((dayPillar.stemIndex % 5) * 2 + civilHourBranch) % 10] + BRANCHES[civilHourBranch]
    } : null;
    const boundaryWarnings = [];
    if (city.coordinatePrecision === 'province-reference') boundaryWarnings.push('当前城市经度暂采用省会参考值；若出生时刻接近时辰交界，生产版须接入区县中心经度后复核。');
    const distanceFromJie = Math.min(normalizeDegrees(solarLongitude - 315) % 30, 30 - (normalizeDegrees(solarLongitude - 315) % 30));
    if (distanceFromJie < 0.35) boundaryWarnings.push('接近节气交界：月柱对出生时间敏感，建议以高精度节气历表再次复核。');
    if (Math.abs(solar.minute) < 12 && solar.hour % 2 === 1) boundaryWarnings.push('接近时辰交界：建议核对出生记录。');
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      calculationVersion: 'prototype-astronomy-v0.2',
      method: '太阳视黄经节气切月；23:00 子初换日；均时差与经度真太阳时校正',
      solarLongitude: Number(solarLongitude.toFixed(4)),
      solarMonthIndex: monthIndex,
      sex: birth.sex,
      city,
      civilTime: `${birth.solarDate} ${birth.birthTime}`,
      trueSolarTime: `${solar.year}-${pad(solar.month)}-${pad(solar.day)} ${pad(solar.hour)}:${pad(solar.minute)}`,
      correctionMinutes: Math.round(correctionMinutes),
      pillars,
      elements: Object.fromEntries(ELEMENTS.map(element => [element, { count: counts[element], percent: Math.round(counts[element] / total * 100) }])),
      dayMaster: STEMS[dayPillar.stemIndex],
      dayMasterElement: STEM_ELEMENTS[dayPillar.stemIndex],
      alternate,
      boundaryWarnings
    };
  }

  function buildPreview(chart) {
    const sorted = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count);
    const strongest = sorted[0][0];
    const weakest = sorted.at(-1)[0];
    return [
      { title: `日主为${chart.dayMaster}${chart.dayMasterElement}`, body: `日干为${chart.dayMaster}，所属五行为${chart.dayMasterElement}。完整报告将结合流年十神、日支合冲与桃花规则分析婚姻、事业和财富。`, evidence: '排盘字段 · 日干' },
      { title: `${strongest}元素在表层结构中较多`, body: `按天干与地支主气的简化统计，${strongest}为当前表层计数较高项。此统计不等同于旺衰、格局或喜忌，不能单独判断吉凶。`, evidence: '结构统计 · 非旺衰结论' },
      { title: `${weakest}元素表层计数较少`, body: `${weakest}在当前八字表层计数较少，但藏干、月令、调候与岁运尚未纳入，系统因此拒绝把“少”直接解释为缺失或不利。`, evidence: '反证规则 · 禁止以数量定吉凶' }
    ];
  }

  function bindBirthPickers(form) {
    const yearSelect = $('#birth-year', form);
    const monthSelect = $('#birth-month', form);
    const daySelect = $('#birth-day', form);
    const hourSelect = $('#birth-hour', form);
    const minuteSelect = $('#birth-minute', form);
    const solarInput = $('#solar-date', form);
    const lunarInput = $('#lunar-input', form);
    const calendarTypeInput = $('#calendar-type', form);
    const calendarButtons = $$('[data-calendar-input]', form);
    const calendarLabel = $('#birth-date-label', form);
    const calendarHelp = $('#calendar-help', form);
    const lunarLeapField = $('#lunar-leap-field', form);
    const lunarLeap = $('#lunar-leap', form);
    const timeInput = $('#birth-time', form);
    const provinceSelect = $('#birth-province', form);
    const citySelect = $('#birth-city', form);
    const coordinateNote = $('#city-coordinate-note', form);
    const locationSearch = $('#location-search', form);
    const locationResults = $('#location-results', form);

    const syncDate = () => {
      const year = Number(yearSelect.value);
      const month = Number(monthSelect.value);
      const previousDay = Number(daySelect.value);
      const lunarMode = calendarTypeInput.value === 'lunar';
      const daysInMonth = lunarMode ? 30 : year && month ? new Date(year, month, 0).getDate() : 31;
      daySelect.innerHTML = `<option value="">--</option>${Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => `<option value="${day}">${pad(day)}</option>`).join('')}`;
      if (previousDay && previousDay <= daysInMonth) daySelect.value = String(previousDay);
      const selectedDay = Number(daySelect.value);
      if (!year || !month || !selectedDay) {
        solarInput.value = '';
        lunarInput.value = '';
        calendarHelp.textContent = lunarMode ? '选择农历年月日后，系统会转换为阳历再计算节气与四柱。' : '采用阳历日期计算节气与四柱。';
        return;
      }
      if (lunarMode) {
        const converted = lunarToSolarDate(year, month, selectedDay, lunarLeap.checked);
        solarInput.value = converted;
        lunarInput.value = `${year}年${lunarLeap.checked ? '闰' : ''}${month}月${selectedDay}日`;
        calendarHelp.textContent = converted ? `已转换为阳历 ${converted}，排盘仍以节气定月。` : '该农历日期不存在，请检查月份、日期或闰月选项。';
      } else {
        solarInput.value = `${year}-${pad(month)}-${pad(selectedDay)}`;
        lunarInput.value = '';
        calendarHelp.textContent = '采用阳历日期计算节气与四柱。';
      }
    };
    const switchCalendar = mode => {
      calendarTypeInput.value = mode;
      calendarButtons.forEach(button => {
        const active = button.dataset.calendarInput === mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
      calendarLabel.textContent = mode === 'lunar' ? '出生日期（农历）' : '出生日期（阳历）';
      lunarLeapField.hidden = mode !== 'lunar';
      if (mode !== 'lunar') lunarLeap.checked = false;
      yearSelect.value = '';
      monthSelect.value = '';
      daySelect.value = '';
      syncDate();
    };
    const syncTime = () => {
      timeInput.value = hourSelect.value !== '' && minuteSelect.value !== '' ? `${pad(Number(hourSelect.value))}:${pad(Number(minuteSelect.value))}` : '';
    };
    const syncCity = () => {
      const cities = CITIES.filter(city => city.provinceId === provinceSelect.value);
      citySelect.disabled = cities.length === 0;
      citySelect.innerHTML = `<option value="">${cities.length ? '請選擇縣市' : '請先選擇地區'}</option>${cities.map(city => `<option value="${city.id}">${city.cityName}</option>`).join('')}`;
      coordinateNote.textContent = cities.length ? `已載入台灣 ${cities.length} 個縣市；將依縣市代表經度校正真太陽時。` : '選擇縣市後用於真太陽時校正。';
    };
    const selectCity = city => {
      provinceSelect.value = city.provinceId;
      syncCity();
      citySelect.value = city.id;
      locationSearch.value = city.name;
      locationResults.hidden = true;
      coordinateNote.textContent = `${city.name} · 台灣時間 UTC+8 · 將進行真太陽時校正。`;
    };
    const searchLocations = () => {
      const normalizePlace = value => String(value).replace(/臺/g, '台').replace(/[省市自治区特别行政区自治州地区盟\s]/g, '');
      const keyword = normalizePlace(locationSearch.value);
      if (!keyword) { locationResults.hidden = true; return; }
      const matches = CITIES.filter(city => normalizePlace(city.name).includes(keyword) || normalizePlace(city.provinceName).includes(keyword) || normalizePlace(city.cityName).includes(keyword)).slice(0, 18);
      locationResults.innerHTML = matches.length
        ? matches.map(city => `<button type="button" data-city-choice="${city.id}"><b>${city.cityName}</b><span>${city.provinceName}</span></button>`).join('')
        : '<p>沒有找到相符縣市，請改用地區與縣市下拉選擇。</p>';
      locationResults.hidden = false;
    };

    yearSelect.addEventListener('change', syncDate);
    monthSelect.addEventListener('change', syncDate);
    daySelect.addEventListener('change', syncDate);
    lunarLeap.addEventListener('change', syncDate);
    calendarButtons.forEach(button => button.addEventListener('click', () => switchCalendar(button.dataset.calendarInput)));
    hourSelect.addEventListener('change', syncTime);
    minuteSelect.addEventListener('change', syncTime);
    provinceSelect.addEventListener('change', syncCity);
    locationSearch.addEventListener('input', searchLocations);
    locationSearch.addEventListener('focus', searchLocations);
    locationResults.addEventListener('click', event => {
      const button = event.target.closest('[data-city-choice]');
      if (!button) return;
      const city = cityById(button.dataset.cityChoice);
      if (city) selectCity(city);
    });
    syncCity();
  }

  function handleBirthSubmit(form) {
    const data = new FormData(form);
    const message = $('#form-message');
    const required = ['solarDate', 'birthTime', 'cityId', 'sex'];
    if (required.some(key => !data.get(key)) || !data.get('adult') || !data.get('privacy') || !data.get('culture')) {
      message.textContent = '请完成所有必填项，并确认年龄、隐私与文化研习说明。';
      return;
    }
    const birth = Object.fromEntries(data.entries());
    const year = Number(birth.solarDate.slice(0, 4));
    if (year < 1900 || new Date(birth.solarDate) > new Date()) {
      message.textContent = 'MVP 仅支持 1900 年至今天的出生日期。';
      return;
    }
    const chart = calculateChart(birth);
    const lead = {
      id: uid('lead'),
      token: uid('handoff'),
      tokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      tokenUsedAt: null,
      createdAt: nowISO(),
      birth,
      chart,
      preview: buildPreview(chart),
      consent: { adult: true, privacy: true, culture: true, at: nowISO(), version: 'privacy-v1' },
      source: 'douyin-organic-h5'
    };
    const leads = load(KEYS.leads, []);
    leads.push(lead);
    save(KEYS.leads, leads);
    save(KEYS.currentLead, lead.id);
    track('form_submit', { leadId: lead.id, source: lead.source });
    go(`/handoff?token=${encodeURIComponent(lead.token)}`);
  }

  function findLeadByToken(token) { return load(KEYS.leads, []).find(item => item.token === token); }
  function currentLead() {
    const id = load(KEYS.currentLead, null);
    return load(KEYS.leads, []).find(item => item.id === id);
  }

  function handoffView(token) {
    const lead = findLeadByToken(token);
    if (!lead) return errorView('交接凭证不存在或已被清理。', '#/start', '重新填写资料');
    const expired = new Date(lead.tokenExpiresAt).getTime() < Date.now();
    if (expired) return errorView('交接凭证已超过 30 分钟，请重新填写资料。', '#/start', '重新开始');
    const settings = getSettings();
    return `
      <div class="page narrow handoff-box">
        <div class="stepper"><span class="step-dot active"></span><span class="step-dot active"></span><span class="step-dot"></span></div>
        <span class="eyebrow">第二步 · 微信承接</span><h2>资料已加密生成交接凭证</h2>
        <p>系统不会自动拉起其他应用。请由你主动点击下方按钮前往微信；正式环境会使用经过审核的小程序 URL Link。</p>
        <div class="mini-phone" aria-hidden="true"><div class="mini-phone-screen"><div class="mini-seal">历</div><h3>微信小程序承接</h3><p>登录后读取一次性凭证<br>查看命盘与三项试读</p></div></div>
        <div class="token-box"><small>一次性凭证 · ${formatDate(lead.tokenExpiresAt)} 失效</small><code>${escapeHTML(lead.token)}</code></div>
        ${!settings.wechatConfigured ? '<p class="inline-warning">尚未配置正式微信小程序 URL Link，当前按钮只演示跨端交接。</p>' : ''}
        <div class="button-row" style="justify-content:center">
          <button class="btn btn-primary" data-action="open-wechat" data-token="${escapeHTML(lead.token)}">${settings.wechatConfigured ? '打开微信查看试读' : '模拟进入微信小程序'}</button>
          <button class="btn btn-soft" data-action="copy-token" data-token="${escapeHTML(lead.token)}">复制凭证</button>
        </div>
        <p class="hero-note">若抖音显示安全提示，请确认目标为已审核的微信小程序；不要在陌生页面输入支付密码。</p>
      </div>`;
  }

  function consumeHandoff(token) {
    const leads = load(KEYS.leads, []);
    const index = leads.findIndex(item => item.token === token);
    if (index < 0) return null;
    const lead = leads[index];
    if (new Date(lead.tokenExpiresAt).getTime() < Date.now()) return null;
    if (!lead.tokenUsedAt) lead.tokenUsedAt = nowISO();
    lead.linkedAt = lead.linkedAt || nowISO();
    leads[index] = lead;
    save(KEYS.leads, leads);
    save(KEYS.currentLead, lead.id);
    track('miniapp_open', { leadId: lead.id });
    return lead;
  }

  function tenGodName(dayStemIndex, targetStemIndex) {
    if (dayStemIndex === targetStemIndex) return '比肩';
    const dayElementIndex = ELEMENTS.indexOf(STEM_ELEMENTS[dayStemIndex]);
    const targetElementIndex = ELEMENTS.indexOf(STEM_ELEMENTS[targetStemIndex]);
    const relation = (targetElementIndex - dayElementIndex + 5) % 5;
    const samePolarity = dayStemIndex % 2 === targetStemIndex % 2;
    if (relation === 0) return samePolarity ? '比肩' : '劫财';
    if (relation === 1) return samePolarity ? '食神' : '伤官';
    if (relation === 2) return samePolarity ? '偏财' : '正财';
    if (relation === 3) return samePolarity ? '七杀' : '正官';
    return samePolarity ? '偏印' : '正印';
  }
  function growthStage(dayStemIndex, branchIndex) {
    const dayStem = STEMS[dayStemIndex];
    const start = GROWTH_START_BRANCH[dayStem];
    const forward = dayStemIndex % 2 === 0;
    const stageIndex = forward ? (branchIndex - start + 12) % 12 : (start - branchIndex + 12) % 12;
    return GROWTH_STAGES[stageIndex];
  }
  function pillarCycleIndex(pillar) {
    if (Number.isInteger(pillar.cycleIndex)) return pillar.cycleIndex;
    for (let index = 0; index < 60; index++) {
      if (index % 10 === pillar.stemIndex && index % 12 === pillar.branchIndex) return index;
    }
    return 0;
  }
  function pillarVoid(pillar) {
    const groups = [['戌', '亥'], ['申', '酉'], ['午', '未'], ['辰', '巳'], ['寅', '卯'], ['子', '丑']];
    return groups[Math.floor(pillarCycleIndex(pillar) / 10)].join('');
  }
  function pillarNayin(pillar) { return NAYIN_PAIRS[Math.floor(pillarCycleIndex(pillar) / 2)]; }
  function elementClassForStem(stemIndex) { return ELEMENT_CLASS[STEM_ELEMENTS[stemIndex]]; }
  function elementClassForBranch(branchIndex) { return ELEMENT_CLASS[BRANCH_ELEMENTS[branchIndex]]; }
  function shenShaForPillar(chart, pillar) {
    const dayStem = STEMS[chart.pillars[2].stemIndex];
    const dayBranch = BRANCHES[chart.pillars[2].branchIndex];
    const target = BRANCHES[pillar.branchIndex];
    const tianYi = { 甲: ['丑', '未'], 戊: ['丑', '未'], 乙: ['子', '申'], 己: ['子', '申'], 丙: ['亥', '酉'], 丁: ['亥', '酉'], 庚: ['午', '寅'], 辛: ['午', '寅'], 壬: ['卯', '巳'], 癸: ['卯', '巳'] };
    const wenChang = { 甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' };
    const groupTarget = groups => groups.find(([members]) => members.includes(dayBranch))?.[1];
    const peach = groupTarget([['申子辰', '酉'], ['寅午戌', '卯'], ['巳酉丑', '午'], ['亥卯未', '子']]);
    const horse = groupTarget([['申子辰', '寅'], ['寅午戌', '申'], ['巳酉丑', '亥'], ['亥卯未', '巳']]);
    const canopy = groupTarget([['申子辰', '辰'], ['寅午戌', '戌'], ['巳酉丑', '丑'], ['亥卯未', '未']]);
    return [
      tianYi[dayStem]?.includes(target) ? '天乙贵人' : '',
      wenChang[dayStem] === target ? '文昌贵人' : '',
      peach === target ? '桃花' : '',
      horse === target ? '驿马' : '',
      canopy === target ? '华盖' : ''
    ].filter(Boolean);
  }
  function interactiveInfoButton(label, action, data = {}) {
    const attributes = Object.entries(data).map(([key, value]) => ` data-${key}="${escapeHTML(value)}"`).join('');
    return `<button type="button" class="info-chip" data-action="${action}"${attributes}>${escapeHTML(label)}</button>`;
  }
  function shenShaCellHTML(chart, pillar, index) {
    const names = shenShaForPillar(chart, pillar);
    const position = PILLAR_MEANINGS[index].name;
    const trigger = BRANCHES[pillar.branchIndex];
    return names.length ? `<span class="info-chip-list">${names.map(name => interactiveInfoButton(name, 'show-shensha', { shensha: name, position, trigger })).join('')}</span>` : '<span class="muted-dash">—</span>';
  }
  function detailChartHTML(chart) {
    const labels = ['年柱', '月柱', '日柱', '时柱'];
    const dayStemIndex = chart.pillars[2].stemIndex;
    const masterLabel = chart.sex === 'female' ? '元女' : chart.sex === 'male' ? '元男' : '日主';
    const cells = (renderer, extraClass = '') => chart.pillars.map((pillar, index) => `<div class="detail-cell ${extraClass}" role="cell">${renderer(pillar, index)}</div>`).join('');
    const row = (label, renderer, extraClass = '') => `<div class="detail-label" role="rowheader">${label}</div>${cells(renderer, extraClass)}`;
    return `
      <div class="detail-chart-wrap">
        <div class="detail-chart" role="table" aria-label="四柱详细排盘">
          <div class="detail-label detail-corner" role="columnheader">四柱</div>
          ${labels.map(label => `<div class="detail-cell detail-heading" role="columnheader">${label}</div>`).join('')}
          ${row('宫位', (_, index) => interactiveInfoButton(PILLAR_MEANINGS[index].short, 'show-pillar-meaning', { 'pillar-index': String(index) }))}
          ${row('十神', (pillar, index) => index === 2 ? (masterLabel === '日主' ? '日主' : `${masterLabel}／日主`) : tenGodName(dayStemIndex, pillar.stemIndex))}
          ${row('天干', pillar => `<b class="chart-symbol ${elementClassForStem(pillar.stemIndex)}">${STEMS[pillar.stemIndex]}</b>`, 'symbol-cell')}
          ${row('地支', pillar => `<b class="chart-symbol ${elementClassForBranch(pillar.branchIndex)}">${BRANCHES[pillar.branchIndex]}</b>`, 'symbol-cell')}
          ${row('藏干', pillar => `<span class="stacked-values">${(HIDDEN_STEMS[BRANCHES[pillar.branchIndex]] || []).map(stem => { const stemIndex = STEMS.indexOf(stem); return `<i class="${elementClassForStem(stemIndex)}">${stem}</i>`; }).join('')}</span>`)}
          ${row('副星', pillar => `<span class="stacked-values">${(HIDDEN_STEMS[BRANCHES[pillar.branchIndex]] || []).map(stem => `<small>${tenGodName(dayStemIndex, STEMS.indexOf(stem))}</small>`).join('')}</span>`)}
          ${row('神煞', (pillar, index) => shenShaCellHTML(chart, pillar, index))}
          ${row('十二长生', pillar => growthStage(dayStemIndex, pillar.branchIndex))}
          ${row('空亡', (pillar, index) => interactiveInfoButton(pillarVoid(pillar), 'show-shensha', { shensha: '空亡', position: PILLAR_MEANINGS[index].name, trigger: pillarVoid(pillar) }))}
          ${row('纳音', pillar => pillarNayin(pillar))}
        </div>
      </div>
      <p class="chart-proof"><b>节气定月：</b>太阳视黄经 ${Number.isFinite(Number(chart.solarLongitude)) ? Number(chart.solarLongitude).toFixed(2) + '°' : '旧版命盘未记录'} · ${BRANCHES[chart.pillars[1].branchIndex]}月（月柱 ${escapeHTML(chart.pillars[1].text)}）</p>`;
  }

  function pillarHTML(chart) {
    const dayStemIndex = chart.pillars[2].stemIndex;
    return `<div class="sample-pillars">${chart.pillars.map((pillar, index) => {
      const tenGod = index === 2 ? (chart.sex === 'female' ? '元女／日主' : chart.sex === 'male' ? '元男／日主' : '日主') : tenGodName(dayStemIndex, pillar.stemIndex);
      return `<div class="pillar"><small>${['年柱', '月柱', '日柱', '时柱'][index]}</small><b>${pillar.text}</b><span class="pillar-god"><small>十神</small><strong>${tenGod}</strong></span></div>`;
    }).join('')}</div>`;
  }
  function elementBarsHTML(chart) {
    return `<div class="element-bars">${ELEMENTS.map(element => `<div class="element-row"><span>${element}</span><div class="bar"><i style="width:${chart.elements[element].percent}%"></i></div><b>${chart.elements[element].count}</b></div>`).join('')}</div>`;
  }

  function previewView(token) {
    const lead = token ? consumeHandoff(token) : currentLead();
    if (!lead) return errorView('微信交接凭证无效或已过期。', '#/start', '重新生成');
    const settings = getSettings();
    const realPaymentReady = settings.paymentEnabled && settings.wechatConfigured;
    const buttonEnabled = settings.demoMode || realPaymentReady;
    const chart = lead.chart;
    return `
      <div class="page">
        <div class="report-head"><div><span class="eyebrow">免费试读</span><h2>你的传统历法结构</h2></div><div class="report-meta"><span class="tag green">微信身份已承接</span><span class="tag">AI 生成内容</span><span class="tag red">非医疗／投资建议</span></div></div>
        ${chart.boundaryWarnings.map(item => `<p class="inline-warning">${escapeHTML(item)}</p>`).join('')}
        <section class="panel chart-card">
          <div><h3>四柱排盘</h3>${pillarHTML(chart)}<p><b>民用时间：</b>${escapeHTML(chart.civilTime)}<br><b>真太阳时：</b>${escapeHTML(chart.trueSolarTime)}（校正 ${chart.correctionMinutes >= 0 ? '+' : ''}${chart.correctionMinutes} 分钟）</p>${chart.alternate ? `<p class="inline-warning">${escapeHTML(chart.alternate.reason)}：钟表时间盘时柱为 ${escapeHTML(chart.alternate.civilHourPillar)}，正式报告须分盘复核。</p>` : ''}</div>
          <div><h3>五行表层计数</h3>${elementBarsHTML(chart)}<p>仅统计天干与地支主气，不代表格局、旺衰或喜忌。</p></div>
        </section>
        <section class="panel detailed-panel"><div class="section-heading"><span class="eyebrow">基本排盘</span><h2>四柱细盘</h2><p>十神以日干为基准；藏干按地支本气、中气、余气排列。</p></div>${detailChartHTML(chart)}</section>
        <section class="section">
          <div class="section-heading"><span class="eyebrow">三项高依据试读</span><h2>系统现在能确定什么</h2></div>
          <div class="preview-grid">${lead.preview.map(item => `<article class="preview-item"><h3>${escapeHTML(item.title)}</h3><span class="tag green">${escapeHTML(item.evidence)}</span><p>${escapeHTML(item.body)}</p></article>`).join('')}</div>
        </section>
        <section class="panel locked-report" aria-hidden="true"><h3>完整报告目录</h3><p>命局结构与时间校正</p><p>五行结构与古籍依据</p><p>十年婚姻、事业、财富趋势与关键节点</p><p>今年生活健康提示、贵人方位与行动时间</p><p>最终反证与自我审核</p></section>
        <div class="lock-cta">
          ${settings.demoMode ? '<p class="inline-warning">演示模式不会调起真实微信支付，也不会收取费用。</p>' : ''}
          ${!buttonEnabled ? '<p class="inline-danger">微信支付或小程序接口尚未配置，真实支付功能暂不可用。</p>' : ''}
          <button class="btn btn-primary" data-action="create-order" data-lead-id="${lead.id}" ${buttonEnabled ? '' : 'disabled'}>${settings.demoMode ? '演示支付 ¥9.9 并生成报告' : '微信支付 ¥9.9 解锁完整报告'}</button>
        </div>
      </div>`;
  }

  function createOrder(leadId) {
    const lead = load(KEYS.leads, []).find(item => item.id === leadId);
    if (!lead) return toast('资料不存在，请重新填写');
    const settings = getSettings();
    if (!settings.demoMode && !(settings.paymentEnabled && settings.wechatConfigured)) return toast('微信支付或小程序接口尚未配置');
    const order = {
      id: uid('order'),
      leadId,
      amountFen: 990,
      currency: 'CNY',
      status: settings.demoMode ? 'demo_paid' : 'payment_pending',
      idempotencyKey: uid('idem'),
      createdAt: nowISO(),
      paidAt: settings.demoMode ? nowISO() : null,
      qimenCredits: predictionReady(settings) && settings.qimenEnabled ? 1 : 0
    };
    const orders = load(KEYS.orders, []);
    orders.push(order);
    save(KEYS.orders, orders);
    track('pay_success', { orderId: order.id, demo: settings.demoMode });
    startGeneration(order);
  }

  function startGeneration(order) {
    const job = { id: uid('job'), orderId: order.id, leadId: order.leadId, status: 'queued', progress: 4, retries: 0, createdAt: nowISO(), updatedAt: nowISO() };
    const jobs = load(KEYS.jobs, []);
    jobs.push(job);
    save(KEYS.jobs, jobs);
    track('generation_queued', { jobId: job.id });
    go(`/generating?job=${job.id}`);
  }

  function generationView(jobId) {
    const job = load(KEYS.jobs, []).find(item => item.id === jobId);
    if (!job) return errorView('生成任务不存在。', '#/start', '返回首页');
    if (job.status === 'ready' && job.reportId) return `<div class="page narrow"><div class="progress-shell"><h2>报告已完成</h2><p>页面即将跳转。</p><a class="btn btn-primary" href="#/report?id=${job.reportId}">查看报告</a></div></div>`;
    setTimeout(() => runGeneration(job.id), 500);
    const stages = [
      ['命盘快照', 15], ['规则匹配', 32], ['古籍检索', 49], ['结构化初稿', 66], ['证据验证', 82], ['反证审核', 94], ['发布', 100]
    ];
    return `
      <div class="page narrow"><div class="progress-shell">
        <span class="eyebrow">背景生成中</span><h2>正在整理你的完整报告</h2><p>关闭页面不会丢失任务；生产环境会由独立工作程序继续处理。</p>
        <div class="progress-ring" style="--progress:${job.progress}%"><b>${job.progress}%</b></div>
        <div class="pipeline">${stages.map(([name, threshold]) => `<div class="pipeline-item ${job.progress >= threshold ? 'done' : job.progress + 16 >= threshold ? 'active' : ''}"><span>${name}</span><span>${job.progress >= threshold ? '已完成' : job.progress + 16 >= threshold ? '处理中' : '等待'}</span></div>`).join('')}</div>
      </div></div>`;
  }

  let generationTimer = null;
  function runGeneration(jobId) {
    clearInterval(generationTimer);
    generationTimer = setInterval(() => {
      const jobs = load(KEYS.jobs, []);
      const index = jobs.findIndex(item => item.id === jobId);
      if (index < 0) return clearInterval(generationTimer);
      const job = jobs[index];
      if (job.status === 'ready') return clearInterval(generationTimer);
      job.status = 'running';
      job.progress = Math.min(100, job.progress + 13 + Math.floor(Math.random() * 7));
      job.updatedAt = nowISO();
      if (job.progress >= 100) {
        const report = buildReport(job.leadId, job.orderId);
        const reports = load(KEYS.reports, []);
        reports.push(report);
        save(KEYS.reports, reports);
        job.status = 'ready';
        job.reportId = report.id;
        job.progress = 100;
        track('report_ready', { reportId: report.id, jobId: job.id });
      }
      jobs[index] = job;
      save(KEYS.jobs, jobs);
      if (job.status === 'ready') {
        clearInterval(generationTimer);
        go(`/report?id=${job.reportId}`);
      } else render();
    }, 620);
  }

  function structureProfile(chart) {
    const dayStemIndex = chart.pillars[2].stemIndex;
    const tenGodCounts = Object.fromEntries(['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'].map(name => [name, 0]));
    const positions = { wealth: [], career: [], resource: [], output: [], peer: [] };
    const categoryFor = name => ['偏财', '正财'].includes(name) ? 'wealth' : ['七杀', '正官'].includes(name) ? 'career' : ['偏印', '正印'].includes(name) ? 'resource' : ['食神', '伤官'].includes(name) ? 'output' : 'peer';
    chart.pillars.forEach((pillar, pillarIndex) => {
      const label = ['年柱', '月柱', '日柱', '时柱'][pillarIndex];
      const visibleGod = tenGodName(dayStemIndex, pillar.stemIndex);
      tenGodCounts[visibleGod] += pillarIndex === 2 ? 1 : 2;
      if (pillarIndex !== 2) positions[categoryFor(visibleGod)].push(`${label}天干${STEMS[pillar.stemIndex]}`);
      (HIDDEN_STEMS[BRANCHES[pillar.branchIndex]] || []).forEach(stem => {
        const god = tenGodName(dayStemIndex, STEMS.indexOf(stem));
        tenGodCounts[god] += 1;
        positions[categoryFor(god)].push(`${label}${BRANCHES[pillar.branchIndex]}藏${stem}`);
      });
    });
    Object.keys(positions).forEach(key => { positions[key] = [...new Set(positions[key])]; });
    const conventional = tenGodCounts.正财 + tenGodCounts.正官 + tenGodCounts.正印 + tenGodCounts.食神 + tenGodCounts.比肩;
    const variable = tenGodCounts.偏财 + tenGodCounts.七杀 + tenGodCounts.偏印 + tenGodCounts.伤官 + tenGodCounts.劫财;
    const total = conventional + variable || 1;
    const conventionalPercent = Math.round(conventional / total * 100);
    const dayElementIndex = ELEMENTS.indexOf(chart.dayMasterElement);
    const resourceElement = ELEMENTS[(dayElementIndex + 4) % 5];
    const surfaceSupportPercent = Math.min(100, chart.elements[chart.dayMasterElement].percent + chart.elements[resourceElement].percent);
    return { tenGodCounts, positions, conventionalPercent, variablePercent: 100 - conventionalPercent, resourceElement, surfaceSupportPercent };
  }

  function branchRelations(chart) {
    const pillars = chart.pillars.map((pillar, index) => ({ branch: BRANCHES[pillar.branchIndex], label: ['年柱', '月柱', '日柱', '时柱'][index] }));
    const pairRules = [
      ['六合', ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未']],
      ['六冲', ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']]
    ];
    const results = [];
    for (let i = 0; i < pillars.length; i++) {
      for (let j = i + 1; j < pillars.length; j++) {
        for (const [type, pairs] of pairRules) {
          if (pairs.some(pair => pair.includes(pillars[i].branch) && pair.includes(pillars[j].branch))) {
            results.push({ type, members: `${pillars[i].branch}${pillars[j].branch}`, positions: `${pillars[i].label}－${pillars[j].label}` });
          }
        }
      }
    }
    const triads = [['申', '子', '辰'], ['亥', '卯', '未'], ['寅', '午', '戌'], ['巳', '酉', '丑']];
    triads.forEach(group => {
      const matches = pillars.filter(item => group.includes(item.branch));
      if (matches.length >= 2) results.push({ type: matches.length === 3 ? '三合' : '半三合', members: matches.map(item => item.branch).join(''), positions: matches.map(item => item.label).join('－') });
    });
    return results;
  }

  function coreConclusionItems(chart, forecast) {
    const profile = structureProfile(chart);
    const relations = branchRelations(chart);
    const strongest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count)[0][0];
    const weakest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count).at(-1)[0];
    const dominantGods = Object.entries(profile.tenGodCounts).sort((a, b) => b[1] - a[1]).filter(([, count]) => count > 0).slice(0, 2);
    const dominantNames = dominantGods.map(([name]) => name);
    const dayTraits = {
      甲: '重方向与原则，习惯先确定目标再向前推进。优势是担当与持续，受阻时容易过度坚持自己的节奏。',
      乙: '观察细、适应快，擅长顺着环境寻找可行路径。优势是协调与韧性，压力下容易顾虑过多。',
      丙: '表达直接，重效率与影响力，常以行动带动局面。优势是推动力，节奏失控时容易急于求成。',
      丁: '感受细腻，重品质与持续投入，对人事变化较敏感。优势是专注，压力下容易把标准藏在心里而内耗。',
      戊: '重承诺、秩序与长期积累，愿意承担稳定局面的责任。优势是可靠，遇到变化时可能反应较慢。',
      己: '务实细密，善于整理资源并照顾执行细节。优势是耐心，顾全太多时容易压缩自己的空间。',
      庚: '判断果断，重规则、效率与问题解决。优势是敢取舍，表达过直时容易给人较强压力。',
      辛: '标准明确，重精度、品质与边界，能发现别人忽略的细节。优势是审辨，压力下容易过度挑剔。',
      壬: '视野开放，信息整合与临场应变较快。优势是格局与流动性，选择过多时容易分散焦点。',
      癸: '感知敏锐，善于观察细微信号并迂回解决问题。优势是洞察，长期不表态时容易形成犹豫与内耗。'
    };
    const godAction = {
      比肩: '依靠自主判断、亲自掌握节奏', 劫财: '在合作与竞争中迅速调动资源', 食神: '用作品、专业与稳定输出累积成果', 伤官: '先质疑旧方法，再提出自己的方案',
      偏财: '捕捉机会并连接外部资源', 正财: '按流程经营、重视兑现与可量化结果', 七杀: '在压力和明确目标下快速执行', 正官: '按规则承担责任并建立可信度',
      偏印: '独立研究、从非标准路径找到解法', 正印: '先学习验证，再依靠系统与专业支持推进'
    };
    const godWork = {
      比肩: '适合拥有明确自主权、成果归属清楚的工作', 劫财: '适合资源整合、谈判、团队攻坚与竞争型场景', 食神: '适合产品、内容、服务和需要长期打磨的专业', 伤官: '适合策划、表达、创新与解决复杂问题的岗位',
      偏财: '适合市场、商务、跨界合作与机会驱动的环境', 正财: '适合运营、财务、项目管理和稳定经营型工作', 七杀: '适合目标清楚、责任重大、需要快速决断的岗位', 正官: '适合制度成熟、晋升规则明确并重视信誉的组织',
      偏印: '适合研究、顾问、技术及需要独立判断的领域', 正印: '适合教育、资质、专业支持与知识密集型工作'
    };
    const elementMode = {
      木: '容易先看成长空间与长期路线', 火: '容易先行动、表达并争取可见成果', 土: '容易先确认稳定性、责任与可持续性', 金: '容易先定标准、辨边界并处理取舍', 水: '容易先收集信息、观察局势并保留弹性'
    };
    const elementAdjustment = {
      木: '把目标拆成阶段，并为变化保留调整空间', 火: '明确表达立场，并为关键行动设置截止点', 土: '用清单、预算和固定节奏把想法落地', 金: '先建立判断标准、责任边界与取舍顺序', 水: '在决定前补足信息，并预留一个可执行的备选方案'
    };
    const relationTypes = new Set(relations.map(item => item.type));
    let relationshipText = '原局地支未触发本版收录的明显合冲，关系模式更受十神配置与现实经历影响；建立清楚边界，比追求表面一致更重要。';
    if ([...relationTypes].some(type => type.includes('合')) && relationTypes.has('六冲')) relationshipText = '原局同时见合与冲：既有寻找共识、维持关系的一面，也会在原则或节奏不合时迅速拉开距离。关系稳定的关键是把期待说清楚，不用沉默代替协商。';
    else if ([...relationTypes].some(type => type.includes('合'))) relationshipText = '原局见合，通常重视默契、合作与关系连续性；优点是能照顾整体，盲点是为了维持和谐而延后表达真实需求。';
    else if (relationTypes.has('六冲')) relationshipText = '原局见冲，对变化、距离与边界较敏感，关系中需要较大的自主空间；优点是敢面对问题，盲点是情绪升高时容易过快作出切割。';
    const primaryGod = dominantNames[0] || '比肩';
    const secondaryGod = dominantNames[1];
    const godPhrase = dominantNames.map(name => `${name}偏显`).join('、');
    const items = [
      { title: '性格底色', body: dayTraits[chart.dayMaster] || `${chart.dayMasterElement}日主重视自身节奏与现实反馈。`, evidence: `日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${BRANCHES[chart.pillars[1].branchIndex]}` },
      { title: '行事与决策', body: `命局以${godPhrase || '十神分布平均'}为主要倾向，处理问题时更常${godAction[primaryGod]}${secondaryGod ? `，同时也会${godAction[secondaryGod]}` : ''}。`, evidence: dominantGods.map(([name, count]) => `${name}权重 ${count}`).join('；') || '十神权重未形成集中项' },
      { title: '人际与关系', body: relationshipText, evidence: relations.length ? relations.map(item => `${item.members}${item.type}`).join('；') : '原局未触发已收录的六合、六冲与三合规则' },
      { title: '事业表达', body: `${godWork[primaryGod]}。在职责、授权与评价标准含糊的环境里，表现容易受牵制；把成果定义和决策权限写清楚会更有利。`, evidence: `主要十神 ${primaryGod}${secondaryGod ? `、${secondaryGod}` : ''}` },
      { title: '优势与盲点', body: `表层${strongest}较多，${elementMode[strongest]}；${weakest}相对较少时，可刻意${elementAdjustment[weakest]}。这是一项结构修正建议，不等同于喜用神结论。`, evidence: `表层五行：${strongest}较多、${weakest}较少` }
    ];
    if (forecast) items.push({ title: '未来十年主轴', body: forecast.keyYears.length ? `未来十年变化较集中的节点为 ${forecast.keyYears.join('、')}。这些年份宜提前配置时间、关系与现金流缓冲，再分别核对婚姻、事业和财富的触发依据。` : '未来十年没有形成单项特别集中的节点，主轴是稳定积累；重大决定仍应结合当年现实条件逐项验证。', evidence: forecast.method });
    return items;
  }

  function lifeSummaryItems(chart, forecast) {
    const profile = structureProfile(chart);
    const relations = branchRelations(chart);
    const current = forecast.years.find(item => item.year === new Date().getFullYear()) || forecast.years[0];
    const careerProfile = careerHealthProfile(chart, forecast);
    const rankedGods = Object.entries(profile.tenGodCounts).sort((a, b) => b[1] - a[1]).filter(([, count]) => count > 0);
    const primaryGod = rankedGods[0]?.[0] || '比肩';
    const topYears = key => [...forecast.years].sort((a, b) => b[key].score - a[key].score || a.year - b.year).slice(0, 3).map(item => `${item.year}（${item[key].label}）`);
    const wealthYears = topYears('wealth');
    const marriageYears = topYears('marriage');
    const careerYears = topYears('career');
    const wealthLocations = profile.positions.wealth;
    const careerLocations = profile.positions.career;
    const directWealthCount = profile.tenGodCounts['正财'] || 0;
    const indirectWealthCount = profile.tenGodCounts['偏财'] || 0;
    const wealthType = directWealthCount > indirectWealthCount ? '正財為主' : indirectWealthCount > directWealthCount ? '偏財為主' : directWealthCount ? '正財、偏財並見' : '原局表層財星不顯';
    const earningRouteMap = {
      比肩: '靠個人專業、主導權與成果分成累積收入', 劫财: '靠合作開發、競爭能力與資源整合創造收入', 食神: '靠作品、服務品質、內容或長期口碑變現', 伤官: '靠企劃、表達、創新與解決複雜問題變現',
      偏财: '靠市場機會、客戶開發、通路與外部資源變現', 正财: '靠固定職能、流程管理、財務紀律與穩定交付累積', 七杀: '靠承擔高責任目標、績效與急難任務取得報酬', 正官: '靠職位、資格、制度信用與管理責任提升收入',
      偏印: '靠研究、技術、特殊知識與顧問判斷變現', 正印: '靠學歷資格、教學、照護或專業支持建立穩定收入'
    };
    const earningRoute = earningRouteMap[primaryGod] || '靠可重複驗證的專業成果與長期信用累積收入';
    const familyRelations = relations.filter(item => item.positions.includes('年柱') || item.positions.includes('月柱'));
    const wealthPattern = wealthLocations.length === 0
      ? '原局表层财星不显，财富更依赖专业能力、稳定产出与长期现金流管理，不适合把单一机会当成全部重心。'
      : wealthLocations.length <= 2
        ? '财星落点较集中，财运更适合深耕熟悉领域、建立重复成交或稳定收入，再逐步扩大规模。'
        : '财星分布较多，收入来源具备多元发展的空间，但合作分配、成本与现金流边界必须先写清楚。';
    const dayRelation = relations.filter(item => item.positions.includes('日柱'));
    const marriagePattern = dayRelation.some(item => item.type === '六冲')
      ? '夫妻宫参与六冲，感情中的节奏、距离与个人空间是长期课题；重要决定不宜在冲突最高点立即定案。'
      : dayRelation.some(item => item.type.includes('合'))
        ? '夫妻宫参与合局，重视陪伴、默契与共同安排；需要留意为了维持和谐而延后表达真实需求。'
        : '夫妻宫未触发本版收录的明显合冲，感情稳定度更取决于沟通、价值观与现实生活安排。';
    const partnerIdealMap = {
      比肩: '尊重彼此自主、能並肩做決定且不過度控制的人', 劫财: '反應快、有行動力，也願意把利益與責任說清楚的人', 食神: '情緒穩定、重生活品質並願意耐心溝通的人', 伤官: '能接住直接表達、願意討論觀點且不壓抑成長的人',
      偏财: '社交成熟、有彈性並能共同開拓生活可能性的人', 正财: '可靠務實、金錢觀清楚且願意共同經營日常的人', 七杀: '有擔當、決斷力強，但懂得尊重界線的人', 正官: '重承諾、守信用、生活規劃與價值觀穩定的人',
      偏印: '能理解獨處與思考需求，不急著要求立即表態的人', 正印: '溫和有支持力、願意一起學習並建立安全感的人'
    };
    const relationshipAttitudeMap = {
      比肩: '感情中重平等與自主，不喜歡被替你作主', 劫财: '投入時熱烈直接，但對公平與付出比例很敏感', 食神: '願意照顧日常與氣氛，偏好穩定累積感情', 伤官: '重真實交流與精神互動，無法長期忍受表面和諧',
      偏财: '重互動的新鮮感與共同體驗，社交空間不可少', 正财: '以實際付出、責任與生活安排表達在意', 七杀: '面對關係問題傾向直接處理，但壓力下語氣可能過強', 正官: '重名分、承諾與規則，會觀察對方是否可靠',
      偏印: '先觀察再投入，需要足夠信任才會完整表達', 正印: '重安全感與精神支持，容易先照顧對方再談自己'
    };
    const relationshipChallenge = dayRelation.some(item => item.type === '六冲')
      ? '主要困境是衝突時容易在靠近與抽離之間擺盪，重大決定應隔一晚再談。'
      : dayRelation.some(item => item.type.includes('合'))
        ? '主要困境是為了維持關係而延後說出不滿，界線與金錢分工要提早談。'
        : '主要困境不是單一合沖，而是期待沒有說明；需要把陪伴頻率、家庭責任與未來規劃具體化。';
    const familyPattern = familyRelations.some(item => item.type === '六冲')
      ? '年柱或月柱见冲，家庭期待与个人选择之间较容易出现拉扯；提早说明界线、金钱责任与照顾分工，会比临时协调有效。'
      : familyRelations.some(item => item.type.includes('合'))
        ? '年柱或月柱见合，家庭资源与长辈支持较容易形成协力；同时要避免把家人的期待直接当成自己的决定。'
        : '年柱、月柱未见本版收录的明显合冲，家庭关系宜以稳定联系和具体分工经营，不必把沉默理解为没有意见。';
    const careerPattern = careerLocations.length
      ? `官杀落于${careerLocations.slice(0, 3).join('、')}，事业发展较重责任、评价标准与职位结构；先争取明确授权，再承担结果。`
      : '原局表层官杀不显，事业不必只依赖职位或组织授权，更适合以专业成果、作品与实际解决问题的能力建立影响力。';
    return [
      {
        title: '财运小结', summary: wealthPattern,
        highlights: [{ label: '財星類型', text: wealthType }, { label: '主要賺法', text: earningRoute }, { label: '收入重點', text: directWealthCount >= indirectWealthCount && directWealthCount ? '先穩定本業現金流，再發展第二收入' : indirectWealthCount ? '以客戶、通路或專案機會擴張，但先寫清成本與分配' : '先把專業能力做成可定價、可重複交付的成果' }],
        advice: `较值得留意的财运年份：${wealthYears.join('、')}。先建立六個月內可追蹤的收入、固定支出與專案毛利表；有利年份仍須保留風險緩衝。`,
        evidence: `${wealthType}；正財權重 ${directWealthCount}、偏財權重 ${indirectWealthCount}${wealthLocations.length ? `；${wealthLocations.join('；')}` : ''}`
      },
      {
        title: '婚姻感情', summary: marriagePattern,
        highlights: [{ label: '理想伴侶', text: partnerIdealMap[primaryGod] }, { label: '你的態度', text: relationshipAttitudeMap[primaryGod] }, { label: '主要困境', text: relationshipChallenge }],
        advice: `感情互動較集中的年份：${marriageYears.join('、')}。用三次具體對話確認生活節奏、金錢邊界與家庭責任，不只用情緒強度判斷關係。`,
        evidence: dayRelation.length ? dayRelation.map(item => `${item.members}${item.type}`).join('；') : '夫妻宫未触发已收录合冲规则'
      },
      {
        title: '事业发展', summary: careerPattern,
        highlights: [{ label: '主軸領域', text: careerProfile.directions.join('／') }, { label: '具體職位', text: careerProfile.roles.slice(0, 5).join('、') }, { label: '先做準備', text: '比對真實職缺、補齊一項核心能力，完成一份可展示的成果案例' }],
        advice: `事业推动较明显的年份：${careerYears.join('、')}。先選一個目標職位，確認學歷／證照、日常工作、薪資區間與升遷路徑，再決定進修或轉職。`,
        evidence: careerLocations.length ? careerLocations.join('；') : `主要十神：${careerProfile.dominantGods.join('、')}`
      },
      { title: '家庭关系', summary: familyPattern, highlights: [{ label: '溝通重點', text: '固定聯絡頻率、照顧分工、共同支出與個人界線' }, { label: '遇到變動', text: '先說明自己的決定，再討論家人能協助與不能承擔的部分' }], advice: '家庭議題宜設定固定討論時間並留下共識；遇到婚姻或事業變化時，先區分自己的選擇與家人的期待。', evidence: familyRelations.length ? familyRelations.map(item => `${item.positions}${item.type}`).join('；') : '年柱、月柱未触发已收录合冲规则' },
      {
        title: `${forecast.health.year} 健康关注`, summary: forecast.health.headline,
        highlights: careerProfile.bodyFocus.map(item => ({ label: `${item.element} · ${item.role}`, text: item.areas })),
        advice: `${careerProfile.bodyFocus.map(item => item.advice).join('；')}以上只作日常觀察；如已有持續不適、疼痛或異常指標，應直接就醫檢查。`,
        evidence: `年度五行关注：${forecast.health.attention}；不作疾病診斷`
      },
      { title: '综合行动建议', summary: `今年先把重点放在“${forecast.actionFocus}”。贵人方位可参考 ${forecast.nobleDirection}，行动时间可参考 ${forecast.actionWindow}。`, highlights: [{ label: '本月', text: '選定一項可驗證成果，寫下截止時間、需要資源與完成標準' }, { label: '每季', text: '檢視工作成果、現金流、關係界線與身體狀態各一次' }], advice: `本年${current ? `婚姻${current.marriage.label}、事业${current.career.label}、财富${current.wealth.label}` : '以稳健执行为主'}；优先处理最能留下可验证成果的一件事。`, evidence: current ? `${current.year}${current.pillar}；${current.keyNote}` : forecast.method }
    ];
  }

  function humanNarrative(chart, forecast) {
    const profile = structureProfile(chart);
    const dayStemIndex = chart.pillars[2].stemIndex;
    const monthGod = tenGodName(dayStemIndex, chart.pillars[1].stemIndex);
    const dominantGods = Object.entries(profile.tenGodCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([name]) => name);
    const dayTone = {
      甲: '你看重方向与原则，遇到值得投入的目标时，会比表面看起来更有韧性。', 乙: '你对环境和人情变化感受很快，习惯先观察，再找到能持续推进的路径。',
      丙: '你需要事情有进展、有回应，也愿意用行动带动周围的人。', 丁: '你对细节、氛围与人的反应较敏锐，真正认定的事会安静而持续地投入。',
      戊: '你重视承诺与稳定，很多时候不是不想改变，而是希望先确认改变能否长期成立。', 己: '你擅长照顾细节、整理资源，并把别人忽略的小事一件件完成。',
      庚: '你面对问题时倾向快速厘清标准与取舍，不喜欢长期停留在模糊状态。', 辛: '你对品质、界线与正确性有自己的尺度，外表克制，内里判断往往很清楚。',
      壬: '你习惯从更大的范围看问题，吸收信息快，也需要保留选择与移动空间。', 癸: '你善于捕捉细微信号，很多判断不是立即说出口，而是在心里反复比对后形成。'
    };
    const acquiredByGod = {
      比肩: '成长经验强化了自主性；你更相信亲自验证，也逐渐学会为自己的选择承担结果。', 劫财: '后天环境让你熟悉合作、竞争与资源协调，懂得在人群中寻找位置，但也需要练习清楚的利益边界。',
      食神: '教育或工作经验让你把兴趣变成稳定产出，耐心、作品与口碑是后天累积的重要资产。', 伤官: '后天经验强化了独立判断与表达能力；你会质疑不合理规则，也需要学会让观点更容易被组织接受。',
      偏财: '现实经验训练了你对机会、人脉与资源流动的敏感度，越到后来越懂得判断什么值得投入。', 正财: '成长过程让你重视兑现、秩序与可衡量成果，可靠和持续经营是后天形成的优势。',
      七杀: '压力、责任或竞争环境磨出了执行力；你往往是在被赋予明确目标后，反而更能集中力量。', 正官: '制度、教育与责任要求塑造了你的稳定度，你会越来越在意信誉、资格与长期位置。',
      偏印: '独立学习与非标准经验形成了你的方法感，你习惯自己找资料、重组知识，再得出不同于他人的答案。', 正印: '家庭、教育或专业系统给了你吸收知识与建立方法的能力，后天所得多来自长期学习与可信支持。'
    };
    const currentYear = new Date().getFullYear();
    const currentLuck = forecast?.luck?.cycles?.find(item => currentYear >= item.startYear && currentYear <= item.endYear);
    const currentLuckGod = currentLuck ? tenGodName(dayStemIndex, currentLuck.stemIndex) : '';
    const currentGrowth = currentLuckGod ? acquiredByGod[currentLuckGod] : '';
    return [
      { label: '先天气质', text: `${dayTone[chart.dayMaster]}命局中${dominantGods.join('与')}较显，因此你不是单纯依靠情绪行动，而会在“自己认同的节奏”与“现实要求”之间不断校准。` },
      { label: '后天所得', text: `月柱为${chart.pillars[1].text}、月干十神为${monthGod}。${acquiredByGod[monthGod]}这些能力更像是家庭、教育与工作反复训练后的结果，并非一出生就固定不变。` },
      { label: '当前阶段', text: currentLuck ? `目前行${currentLuck.pillar}大运，十神为${currentLuckGod}。${currentGrowth}这十年真正要累积的，不只是一次机会，而是能反复使用的方法、边界与可信度。` : '当前尚未进入本版排定的大运区间，宜先以原局性格与现实经历作交叉验证。' }
    ];
  }

  const FIVE_ELEMENT_BODY_FOCUS = {
    木: { areas: '眼睛疲勞、頸肩與筋腱活動度，以及壓力下的情緒緊繃', advice: '每工作 50 分鐘起身活動，安排肩頸與下肢伸展；長時間用眼時固定休息。' },
    火: { areas: '睡眠品質、心悸或胸悶等不適訊號，以及高溫與高壓後的恢復', advice: '減少連續熬夜與過量刺激性飲品；若心悸、胸痛或呼吸不適持續，應儘速就醫。' },
    土: { areas: '胃腸消化、腹部舒適度、飲食規律與久坐後的肌肉狀態', advice: '固定用餐時間，避免壓力大時暴飲暴食；每週安排漸進式核心與步行活動。' },
    金: { areas: '鼻咽與呼吸道、皮膚乾燥，以及空調或季節轉換時的適應', advice: '保持通風與適量補水；反覆喘、持續咳嗽或皮膚異常時，直接尋求專業評估。' },
    水: { areas: '腰背、泌尿狀況、耳部感受、骨骼活動與長期疲勞恢復', advice: '避免長期睡眠透支，久坐時保護腰背並漸進運動；持續疼痛或排尿異常應就醫。' }
  };

  function careerHealthProfile(chart, forecast) {
    const profile = structureProfile(chart);
    const dominantGods = Object.entries(profile.tenGodCounts).sort((a, b) => b[1] - a[1]).filter(([, count]) => count > 0).slice(0, 2).map(([name]) => name);
    const careerMap = {
      比肩: { direction: '自主專業與專案主導', roles: ['自由接案顧問', '技術主管', '專案負責人', '小型創業經營'] },
      劫财: { direction: '商務開發與資源整合', roles: ['商務開發', '招募顧問', '活動統籌', '客戶成功經理'] },
      食神: { direction: '內容、產品與服務體驗', roles: ['內容企劃', '產品經理', '服務設計', '餐旅營運'] },
      伤官: { direction: '企劃、顧問與流程創新', roles: ['產品企劃', '管理顧問', '流程改善專員', '媒體編輯'] },
      偏财: { direction: '市場、通路與商業合作', roles: ['業務開發', '品牌行銷', '通路經營', '商業營運'] },
      正财: { direction: '財務與穩定營運管理', roles: ['會計／財務分析', '營運專員', '採購／供應鏈管理', '專案管理'] },
      七杀: { direction: '工程、應變與目標管理', roles: ['工程專案管理', '營運督導', '風險應變專員', '外勤管理'] },
      正官: { direction: '行政、法遵與品質制度', roles: ['行政管理', '法遵／內控', '公職', '品質管理'] },
      偏印: { direction: '研究、科技與策略分析', roles: ['資料分析師', '軟體／研發人員', '研究員', '策略顧問'] },
      正印: { direction: '教育、醫療照護與專業支持', roles: ['教師／培訓講師', '護理／醫療行政（須具資格）', '人力資源', '知識管理'] }
    };
    const selectedCareer = dominantGods.map(name => careerMap[name]).filter(Boolean);
    const directions = [...new Set(selectedCareer.map(item => item.direction))];
    const roles = [...new Set(selectedCareer.flatMap(item => item.roles))].slice(0, 8);
    const strongest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count)[0][0];
    const weakest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count).at(-1)[0];
    const focusElements = [...new Set([strongest, weakest, forecast.years[0].annualElement])];
    const careerYears = [...forecast.years].sort((a, b) => b.career.score - a.career.score || a.year - b.year).slice(0, 3).map(item => item.year);
    return {
      roles,
      directions,
      dominantGods,
      workStyle: `较适合目标与权限清楚、能留下具体成果，并允许${dominantGods.includes('比肩') || dominantGods.includes('伤官') || dominantGods.includes('偏印') ? '独立判断与方法改进' : '长期积累信誉与专业深度'}的工作环境。`,
      development: `先從 ${roles.slice(0, 3).join('、')} 中選一個最符合現有學歷與經驗的方向，補齊資格、作品或可量化成果；${careerYears.join('、')} 是未來十年事業推動信號相對集中的年份。`,
      steps: [
        `定位：從「${directions.join('／')}」中確定一條主線，不同時追逐過多職類。`,
        `準備：比對 10 個真實職缺，把共同要求整理成三項能力與一份作品／案例。`,
        `行動：先用實習、專案、證照或小型接案驗證適配度，再決定是否轉職；涉及護理、公職等職位須先取得法定資格。`
      ],
      bodyFocus: focusElements.map(element => ({ element, ...FIVE_ELEMENT_BODY_FOCUS[element], role: element === strongest ? '表層較多' : element === weakest ? '表層較少' : '今年流年進入' }))
    };
  }

  function radarChartHTML(chart) {
    const center = 120, radius = 76;
    const point = (index, ratio) => {
      const angle = (-90 + index * 72) * Math.PI / 180;
      return `${(center + Math.cos(angle) * radius * ratio).toFixed(1)},${(center + Math.sin(angle) * radius * ratio).toFixed(1)}`;
    };
    const rings = [0.25, 0.5, 0.75, 1].map(ratio => `<polygon points="${ELEMENTS.map((_, index) => point(index, ratio)).join(' ')}"></polygon>`).join('');
    const axes = ELEMENTS.map((_, index) => `<line x1="${center}" y1="${center}" x2="${point(index, 1).split(',')[0]}" y2="${point(index, 1).split(',')[1]}"></line>`).join('');
    const values = ELEMENTS.map(element => Math.max(.12, chart.elements[element].percent / 32));
    const area = ELEMENTS.map((_, index) => point(index, Math.min(1, values[index]))).join(' ');
    const labelPoints = ELEMENTS.map((element, index) => { const [x, y] = point(index, 1.24).split(','); return `<text x="${x}" y="${Number(y) + 5}" text-anchor="middle">${element}</text>`; }).join('');
    return `<svg class="radar-chart" viewBox="0 0 240 240" role="img" aria-label="五行表层结构雷达图"><g class="radar-grid">${rings}${axes}</g><polygon class="radar-area" points="${area}"></polygon>${labelPoints}</svg>`;
  }

  function structureAnalysisHTML(chart) {
    const profile = structureProfile(chart);
    const relations = branchRelations(chart);
    const sortedElements = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count);
    const strongest = sortedElements[0][0];
    const weakest = sortedElements.at(-1)[0];
    const wealthElement = ELEMENTS[(ELEMENTS.indexOf(chart.dayMasterElement) + 2) % 5];
    const careerElement = ELEMENTS[(ELEMENTS.indexOf(chart.dayMasterElement) + 3) % 5];
    const wealthLocations = profile.positions.wealth;
    const careerLocations = profile.positions.career;
    const diversity = wealthLocations.length === 0 ? '原局表层未见财星' : wealthLocations.length <= 2 ? '财星落点集中' : '财星分布多点';
    const tendency = profile.conventionalPercent >= 60 ? '常规结构较多' : profile.variablePercent >= 60 ? '变动结构较多' : '两类结构接近';
    const relationCards = relations.length ? relations.map(item => `<div class="relation-card"><b>${item.members}</b><span>${item.type}</span><small>${item.positions}</small></div>`).join('') : '<div class="empty-state compact">四支之间未触发本版已收录的六合、六冲或三合规则。</div>';
    const locationList = (items, empty) => items.length ? `<ul class="evidence-list compact-list">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : `<p>${empty}</p>`;
    return `
      <section class="report-section analysis-section" id="structure-section">
        <div class="ornament-title">命局结构总览</div>
        <div class="analysis-overview">
          ${radarChartHTML(chart)}
          <div class="overview-facts"><h3 class="${ELEMENT_CLASS[chart.dayMasterElement]}">${chart.dayMasterElement}日主</h3><p>表层计数较多：<b>${strongest}</b><br>表层计数较少：<b>${weakest}</b></p><div class="fact-grid"><span>月令<strong>${BRANCHES[chart.pillars[1].branchIndex]}</strong></span><span>日主<strong>${chart.dayMaster}</strong></span><span>财星五行<strong>${wealthElement}</strong></span><span>官杀五行<strong>${careerElement}</strong></span></div></div>
        </div>
        <p class="method-note">此图只统计四柱天干与地支主气，不等同于完整旺衰、格局或喜用神判断。</p>
      </section>
      <section class="report-section analysis-section">
        <div class="ornament-title">十神结构倾向</div>
        <div class="ratio-labels"><span>常规结构 ${profile.conventionalPercent}%</span><span>变动结构 ${profile.variablePercent}%</span></div>
        <div class="ratio-bar" aria-label="十神结构比例"><i style="width:${profile.conventionalPercent}%"></i></div>
        <h3>${tendency}</h3><p>这里比较正财、正官、正印、食神、比肩与偏财、七杀、偏印、伤官、劫财的加权出现次数，只描述十神构成，不等同于心理测验、投资风险等级或职业建议。</p>
        <div class="ten-god-grid">${Object.entries(profile.tenGodCounts).map(([name, count]) => `<span><small>${name}</small><b>${count}</b></span>`).join('')}</div>
      </section>
      <section class="report-section analysis-section">
        <div class="ornament-title">财星落位与来源</div>
        <div class="analysis-callout"><b>${diversity}</b><span>日主${chart.dayMasterElement}所克之${wealthElement}为财星；本版只检查原局天干与藏干。</span></div>
        ${locationList(wealthLocations, `原局天干与藏干未检出${wealthElement}财星；这不代表现实中没有财富。`)}
        <p class="method-note">“落位”只表示财星出现在哪一柱及显藏位置，不直接推导收入金额、投资回报或人生阶段。</p>
      </section>
      <section class="report-section analysis-section">
        <div class="ornament-title">表层承载结构</div>
        <div class="ratio-labels"><span>同类与印星 ${profile.surfaceSupportPercent}%</span><span>其余五行 ${100 - profile.surfaceSupportPercent}%</span></div>
        <div class="ratio-bar support-bar" aria-label="表层支持结构比例"><i style="width:${profile.surfaceSupportPercent}%"></i></div>
        <p>按四柱天干与地支主气计数，${chart.dayMasterElement}同类及生助它的${profile.resourceElement}合计占 ${profile.surfaceSupportPercent}%。这只是“表层支持比例”，不能直接命名为身强身弱，也不能等同于实际担财能力。</p>
      </section>
      <section class="report-section analysis-section">
        <div class="ornament-title">事业结构与官杀落位</div>
        <div class="analysis-callout"><b>官杀五行为${careerElement}</b><span>克制日主${chart.dayMasterElement}的五行按阴阳区分正官与七杀。</span></div>
        ${locationList(careerLocations, `原局表层未检出${careerElement}官杀星。`)}
      </section>
      <section class="report-section analysis-section">
        <div class="ornament-title">环境结构观察</div>
        <div class="analysis-callout"><b>${strongest}较多 · ${weakest}较少</b><span>可用现实记录观察不同工作节奏、团队结构与城市环境是否真的影响状态。</span></div>
        <p class="method-note">本版不根据五行直接推荐某座城市或承诺事业财运；地理选择还应考虑行业、收入、家庭、气候与公共服务。</p>
      </section>
      <section class="report-section analysis-section">
        <div class="ornament-title">原局地支关系</div>
        <div class="relation-map">${relationCards}</div>
        <p class="method-note">本节只展示原局四支中可机械核对的六合、六冲、三合与半三合；大运与流年关系另列于后文，不把单一合冲直接解释为具体事件。</p>
      </section>`;
  }

  function branchPairType(first, second) {
    const key = first + second;
    const reverse = second + first;
    const rules = {
      '六合': ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'],
      '六冲': ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']
    };
    return Object.entries(rules).find(([, pairs]) => pairs.includes(key) || pairs.includes(reverse))?.[0] || '';
  }

  function peachBlossomBranch(branch) {
    if (['申', '子', '辰'].includes(branch)) return '酉';
    if (['寅', '午', '戌'].includes(branch)) return '卯';
    if (['亥', '卯', '未'].includes(branch)) return '子';
    return '午';
  }

  function trendBand(score) {
    if (score >= 5) return { label: '偏吉', className: 'good' };
    if (score >= 2) return { label: score >= 3 ? '平中有进' : '平稳', className: 'steady' };
    return { label: '需谨慎', className: 'caution' };
  }

  function buildLuckCycles(chart, sex) {
    const [datePart, timePart] = chart.civilTime.split(' ');
    const [birthYear, birthMonth, birthDay] = datePart.split('-').map(Number);
    const [birthHour, birthMinute] = timePart.split(':').map(Number);
    const yearStemYang = chart.pillars[0].stemIndex % 2 === 0;
    const direction = sex === 'female' ? (yearStemYang ? -1 : 1) : sex === 'male' ? (yearStemYang ? 1 : -1) : 1;
    const origin = Date.UTC(birthYear, birthMonth - 1, birthDay, birthHour, birthMinute);
    const originLongitude = apparentSolarLongitude(birthYear, birthMonth, birthDay, birthHour, birthMinute, chart.city.utcOffset);
    const originMonthIndex = solarMonthIndex(originLongitude);
    let boundaryHours = 0;
    for (let step = 1; step <= 160; step++) {
      const candidate = new Date(origin + direction * step * 6 * 3600000);
      const longitude = apparentSolarLongitude(candidate.getUTCFullYear(), candidate.getUTCMonth() + 1, candidate.getUTCDate(), candidate.getUTCHours(), candidate.getUTCMinutes(), chart.city.utcOffset);
      if (solarMonthIndex(longitude) !== originMonthIndex) { boundaryHours = step * 6; break; }
    }
    const startAge = Number(((boundaryHours / 24) / 3).toFixed(1));
    const monthCycleIndex = pillarCycleIndex(chart.pillars[1]);
    const cycles = Array.from({ length: 12 }, (_, index) => {
      const pillar = ganzhi(monthCycleIndex + direction * (index + 1));
      const cycleStartAge = startAge + index * 10;
      return {
        index,
        pillar: pillar.text,
        stemIndex: pillar.stemIndex,
        branchIndex: pillar.branchIndex,
        startAge: Number(cycleStartAge.toFixed(1)),
        endAge: Number((cycleStartAge + 9.9).toFixed(1)),
        startYear: Math.floor(birthYear + cycleStartAge),
        endYear: Math.floor(birthYear + cycleStartAge + 9.9),
        direction: direction > 0 ? '顺排' : '逆排'
      };
    });
    return { direction: direction > 0 ? '顺排' : '逆排', startAge, birthYear, cycles };
  }

  function buildAnnualTrend(chart, year, sex, luckCycle = null) {
    const annual = ganzhi(year - 1984);
    const annualStem = STEMS[annual.stemIndex];
    const annualBranch = BRANCHES[annual.branchIndex];
    const annualElement = STEM_ELEMENTS[annual.stemIndex];
    const god = tenGodName(chart.pillars[2].stemIndex, annual.stemIndex);
    const dayBranch = BRANCHES[chart.pillars[2].branchIndex];
    const interaction = branchPairType(dayBranch, annualBranch);
    const romanceGods = sex === 'male' ? ['正财', '偏财'] : sex === 'female' ? ['正官', '七杀'] : ['正财', '偏财', '正官', '七杀'];
    const peach = peachBlossomBranch(dayBranch) === annualBranch;
    const luckGod = luckCycle ? tenGodName(chart.pillars[2].stemIndex, luckCycle.stemIndex) : '';
    const luckBranch = luckCycle ? BRANCHES[luckCycle.branchIndex] : '';
    const luckInteraction = luckCycle ? branchPairType(dayBranch, luckBranch) : '';

    let marriageScore = 2;
    const marriageEvidence = [`流年天干为${god}`];
    if (romanceGods.includes(god)) { marriageScore += 2; marriageEvidence.push('配偶星透于流年天干'); }
    if (peach) { marriageScore += 2; marriageEvidence.push(`日支桃花${annualBranch}到位`); }
    if (interaction === '六合') { marriageScore += 2; marriageEvidence.push(`流年${annualBranch}与日支${dayBranch}六合`); }
    if (interaction === '六冲') { marriageScore -= 1; marriageEvidence.push(`流年${annualBranch}冲日支${dayBranch}`); }
    if (luckCycle && romanceGods.includes(luckGod)) { marriageScore += 1; marriageEvidence.push(`${luckCycle.pillar}大运见配偶星${luckGod}`); }
    if (luckInteraction === '六合') { marriageScore += 1; marriageEvidence.push(`大运${luckBranch}与日支${dayBranch}六合`); }
    if (luckInteraction === '六冲') { marriageScore -= 1; marriageEvidence.push(`大运${luckBranch}冲日支${dayBranch}`); }
    const marriageBand = trendBand(marriageScore);
    const marriageSummary = marriageScore >= 5
      ? '关系推进信号集中。单身者宜主动筛选价值观稳定的对象；有伴侣者适合讨论承诺、居住与长期分工。'
      : marriageScore >= 3
        ? '关系发展以稳定沟通为主，进展取决于现实安排是否一致，不宜只凭一时情绪作决定。'
        : '关系宫位受冲或配偶星不显，容易出现节奏、边界与现实分工摩擦；先处理旧问题，再谈重大推进。';

    let careerScore = 2;
    const careerEvidence = [`十神为${god}`];
    if (['正官', '七杀'].includes(god)) { careerScore += 3; careerEvidence.push('官杀主职责、考核与职位压力'); }
    if (['正印', '偏印'].includes(god)) { careerScore += 2; careerEvidence.push('印星主学习、资质与支持系统'); }
    if (['食神', '伤官'].includes(god)) { careerScore += 2; careerEvidence.push('食伤主输出、方案与表达'); }
    if (interaction === '六冲') { careerScore += 1; careerEvidence.push('日支受冲，变动信号增强'); }
    if (luckCycle && ['正官', '七杀', '正印', '偏印'].includes(luckGod)) { careerScore += 1; careerEvidence.push(`${luckCycle.pillar}大运为${luckGod}，事业主轴增强`); }
    const careerBand = trendBand(careerScore);
    const careerSummary = ['正官', '七杀'].includes(god)
      ? '职位、责任或考核议题突出，是争取授权与承担关键任务的窗口；同时要把目标、权限和交付标准写清楚。'
      : ['正印', '偏印'].includes(god)
        ? '适合进修、考证、建立方法论或借助专业平台，先补能力与信用，再争取职位跃迁。'
        : ['食神', '伤官'].includes(god)
          ? '输出与曝光增强，适合发布作品、提案、拓客或改进流程；与管理层沟通要以数据和结果为先。'
          : ['正财', '偏财'].includes(god)
            ? '商业结果、客户与资源配置成为主轴，适合把专业能力转成可衡量的项目价值。'
            : '同业竞争与协作并存，适合明确个人定位、合作边界和资源分配，避免重复投入。';

    let wealthScore = 2;
    const wealthEvidence = [`流年${annualStem}${annualBranch}，天干十神${god}`];
    if (['正财', '偏财'].includes(god)) { wealthScore += 3; wealthEvidence.push('财星透干'); }
    if (['食神', '伤官'].includes(god)) { wealthScore += 2; wealthEvidence.push('食伤生财，重在成果转化'); }
    if (['比肩', '劫财'].includes(god)) { wealthScore -= 1; wealthEvidence.push('比劫增强，合作与支出边界要清楚'); }
    if (interaction === '六冲') { wealthScore -= 1; wealthEvidence.push('日支受冲，现金流宜留缓冲'); }
    if (luckCycle && ['正财', '偏财', '食神', '伤官'].includes(luckGod)) { wealthScore += 1; wealthEvidence.push(`${luckCycle.pillar}大运为${luckGod}，财务转化主轴增强`); }
    if (luckCycle && ['比肩', '劫财'].includes(luckGod)) { wealthScore -= 1; wealthEvidence.push(`${luckCycle.pillar}大运为${luckGod}，合作分配须更谨慎`); }
    const wealthBand = trendBand(wealthScore);
    const wealthSummary = wealthScore >= 5
      ? '收入议价、客户转化或项目回款机会较集中，宜用合同、预算和分批回款锁定成果；不宜因趋势偏吉而放大风险。'
      : wealthScore >= 3
        ? '财务以稳步积累为主，适合优化固定支出、提升可复用能力，并把一次性机会转为长期现金流。'
        : '现金流波动与人情支出风险较高，宜保留备用金、减少高杠杆及口头合伙，重大投入先设退出条件。';

    const isKeyNode = marriageScore >= 5 || careerScore >= 5 || wealthScore >= 5 || interaction === '六冲';
    const strongestTheme = [
      ['婚姻', marriageScore], ['事业', careerScore], ['财富', wealthScore]
    ].sort((a, b) => b[1] - a[1])[0][0];
    const keyNote = interaction === '六冲'
      ? `${annualBranch}冲日支${dayBranch}，属于关系与生活结构调整年，重要决定宜分阶段落地。`
      : `${strongestTheme}信号在三项中最强，适合把主要资源集中在可验证的一项成果上。`;
    const actionByTheme = {
      婚姻: '安排三次深度對話，依序確認價值觀、金錢與居住／家庭分工；單身者以穩定互動至少三個月再談承諾。',
      事业: '在年初確定一個目標職位或專案，列出權限、資源、考核與截止日；年中用成果數據談升遷、轉職或加薪。',
      财富: '先完成年度現金流與風險預算，再擴大業務、接案或第二收入；每一筆合作先寫清成本、分潤與退出條件。'
    };
    const cautionByTheme = {
      婚姻: '避免在衝突最高點立即分手、結婚或承諾重大共同支出；不要用冷處理代替界線說明。',
      事业: '避免只看職稱或短期薪資，忽略實際授權、工時、組織資源與可累積能力。',
      财富: '避免因「流年偏吉」提高槓桿或追逐不熟悉標的；趨勢不能替代合約、成本與風險審查。'
    };
    const action = actionByTheme[strongestTheme];
    const caution = interaction === '六冲'
      ? `本年日支受沖，行程、關係或居住安排容易變動；${cautionByTheme[strongestTheme]}`
      : cautionByTheme[strongestTheme];

    return {
      year,
      pillar: `${annualStem}${annualBranch}`,
      luckPillar: luckCycle?.pillar || '',
      luckGod,
      annualElement,
      god,
      interaction: interaction || '无日支合冲',
      isKeyNode,
      keyNote,
      action,
      caution,
      title: `${annualStem}${annualBranch}年 · ${strongestTheme}${isKeyNode ? '关键节点' : '稳步推进'}`,
      marriage: { score: marriageScore, ...marriageBand, summary: marriageSummary, evidence: marriageEvidence.join('；') },
      career: { score: careerScore, ...careerBand, summary: careerSummary, evidence: careerEvidence.join('；') },
      wealth: { score: wealthScore, ...wealthBand, summary: wealthSummary, evidence: wealthEvidence.join('；') },
      body: `婚姻${marriageBand.label}，事业${careerBand.label}，财富${wealthBand.label}。${keyNote}`
    };
  }

  function buildForecast(chart, sex = chart.sex) {
    const startYear = new Date().getFullYear();
    const luck = buildLuckCycles(chart, sex);
    const years = Array.from({ length: 10 }, (_, index) => {
      const year = startYear + index;
      const activeLuck = luck.cycles.find(item => year >= item.startYear && year <= item.endYear) || null;
      return buildAnnualTrend(chart, year, sex, activeLuck);
    });
    const sortedElements = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count);
    const strongest = sortedElements[0][0];
    const weakest = sortedElements.at(-1)[0];
    const current = years[0];
    const directionMap = { 木: '东方、东南方', 火: '南方', 土: '东北方、西南方', 金: '西方、西北方', 水: '北方' };
    const timeMap = { 木: '寅卯时（03:00–07:00）', 火: '巳午时（09:00–13:00）', 土: '辰时或戌时（07:00–09:00／19:00–21:00）', 金: '申酉时（15:00–19:00）', 水: '亥子时（21:00–01:00）' };
    const seasonMap = { 木: '2月上旬至4月上旬', 火: '5月上旬至7月上旬', 土: '7月上旬至8月上旬', 金: '8月上旬至10月上旬', 水: '11月上旬至翌年1月上旬' };
    const actionMap = {
      木: '启动新项目、学习、拓展人脉与提出新方案',
      火: '公开表达、发布成果、谈判与提升曝光',
      土: '签订流程、整理资产、稳定团队与长期执行',
      金: '审计取舍、定价、订立规则与完成关键决策',
      水: '研究规划、复盘、休整与布局下一阶段'
    };
    const lifestyleMap = {
      木: '把重点放在规律伸展、减少久坐和稳定情绪节奏。',
      火: '留意熬夜、高温活动与连续高强度工作的恢复安排。',
      土: '把饮食规律、核心力量和长时间静坐后的活动列为重点。',
      金: '在干燥或空调环境中注意补水、通风和规律户外活动。',
      水: '避免长期透支睡眠，在寒冷季节安排保暖、休息与渐进运动。'
    };
    const attention = current.annualElement === strongest ? '偏高' : current.annualElement === weakest ? '中等' : '平稳';
    const health = {
      year: startYear,
      attention,
      headline: `今年${current.pillar}，${current.annualElement}气进入原局；生活健康关注度为${attention}。`,
      details: [
        `原局表层${strongest}较多：${lifestyleMap[strongest]}`,
        `原局表层${weakest}较少：可用循序渐进的作息、饮食与运动记录观察身体反应，不以“五行缺少”替代医学检查。`,
        current.interaction === '六冲' ? '今年日支受冲，行程与关系变化可能增加压力；连续忙碌后应预留恢复日。' : '今年日支没有直接六冲，可把重点放在长期可持续的作息，而不是短期极端调整。'
      ]
    };
    const keyYears = years.filter(item => item.isKeyNode).map(item => `${item.year}（${item.pillar}）`);
    return {
      generatedAt: nowISO(),
      method: `按年干阴阳与性别${luck.direction}大运，以出生时刻至${luck.direction === '顺排' ? '下一' : '上一'}节气折算约 ${luck.startAge} 岁起运；再叠加大运、流年十神、日支六合／六冲及桃花规则逐年判断。`,
      luck,
      years,
      keyYears,
      health,
      nobleDirection: `${directionMap[weakest]}（以补足表层较少的${weakest}为取向）`,
      actionWindow: `${seasonMap[weakest]}；每日优先 ${timeMap[weakest]}`,
      actionFocus: actionMap[weakest]
    };
  }

  function buildReport(leadId, orderId) {
    const lead = load(KEYS.leads, []).find(item => item.id === leadId);
    const settings = getSettings();
    const classics = approvedClassics();
    const chart = lead.chart;
    const strongest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count)[0][0];
    const weakest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count).at(-1)[0];
    const forecast = buildForecast(chart, lead.birth.sex);
    return {
      id: uid('report'), reportNo: `R${Date.now().toString().slice(-10)}`, orderId, leadId,
      createdAt: nowISO(), expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      mode: 'traditional-analysis',
      aiLabel: true, modelName: settings.modelName, modelFiling: settings.modelFiling,
      title: '八字真言命理分析报告', chart,
      summary: coreConclusionItems(chart, forecast).map(item => `${item.title}：${item.body}`),
      lifeSummary: lifeSummaryItems(chart, forecast),
      structure: `四柱为${chart.pillars.map(item => item.text).join('、')}。真太阳时相对民用时间校正 ${chart.correctionMinutes >= 0 ? '+' : ''}${chart.correctionMinutes} 分钟。${chart.alternate ? `校正造成时柱变化，钟表时间盘时柱为${chart.alternate.civilHourPillar}，需要分盘复核。` : '此次校正未造成时支变化。'}`,
      elements: `日干${chart.dayMaster}属${chart.dayMasterElement}。表层计数：${ELEMENTS.map(element => `${element}${chart.elements[element].count}`).join('、')}。月令、藏干、通根、透干、刑冲合害及调候尚未由正式规则库完成前，系统拒绝判断旺衰与用神。`,
      classics: classics.map(item => ({ book: item.book, location: `${item.version} · ${item.chapter} · ${item.page}`, text: item.original, rule: item.rule })),
      years: forecast.years,
      forecast,
      reflection: [
        `在现实经历中，你是否能找到与“${chart.dayMasterElement}日主”相关的长期行为模式？请记录事实，不以标签代替观察。`,
        `当${strongest}对应的活动或环境增加时，你的精力和决策是否真的发生变化？用三次具体经历验证。`,
        `哪些重要选择曾经受环境、教育与资源影响？把可改变因素与历法象征分开记录。`
      ],
      audit: {
        unsupportedQuotesRemoved: true,
        medicalClaimsRemoved: true,
        investmentPromisesRemoved: true,
        deterministicDisasterClaimsRemoved: true,
        predictionSectionsDisabled: false,
        notes: `${forecast.method}${classics.length ? ` 引用 ${classics.length} 条已核验古籍资料。` : ' 当前古籍库没有已核验原文，因此未伪造古籍引文。'}`
      }
    };
  }

  function currentGuidanceHTML(forecast) {
    const current = forecast.years[0];
    const practicalActions = [
      { label: '工作', text: `${current?.career?.summary || '先穩定既有職責。'} 接下來 30 天只設定一項可量化成果，並確認完成標準。` },
      { label: '財務', text: `${current?.wealth?.summary || '先整理現金流。'} 每月固定記錄收入、必要支出、可調整支出與專案成本。` },
      { label: '關係', text: `${current?.marriage?.summary || '以穩定溝通為主。'} 重要議題分成事實、感受、需求與可執行協議四步談。` },
      { label: '健康', text: '連續 14 天記錄睡眠、精神、運動與不適部位；若症狀持續、加重或影響生活，直接就醫。' }
    ];
    return `
      <section class="report-section forecast-section" id="current-year-section">
        <h2>${forecast.health.year} 年五行行动参考</h2>
        <div class="guidance-grid">
          <article><small>生活健康关注</small><b>${escapeHTML(forecast.health.attention)}</b><p>${escapeHTML(forecast.health.headline)}</p></article>
          <article><small>贵人方位</small><b>${escapeHTML(forecast.nobleDirection)}</b><p>用于安排会面、拓客或寻找合作资源的方位参考。</p></article>
          <article><small>最佳行动时间</small><b>${escapeHTML(forecast.actionWindow)}</b><p>${escapeHTML(forecast.actionFocus)}</p></article>
        </div>
        <div class="wellness-list">${forecast.health.details.map(item => `<p>${escapeHTML(item)}</p>`).join('')}</div>
        <h3 class="action-list-title">今年可以直接做的事</h3>
        <div class="annual-action-list">${practicalActions.map(item => `<article><b>${item.label}</b><p>${escapeHTML(item.text)}</p></article>`).join('')}</div>
        <p class="method-note">健康部分只作作息、饮食与活动节奏提示，不代替体检、诊断或治疗。</p>
      </section>`;
  }

  function careerHealthHTML(chart, forecast) {
    const profile = careerHealthProfile(chart, forecast);
    return `
      <section class="report-section career-health-section" id="career-health-section">
        <h2>职业发展与身体关注</h2>
        <div class="career-health-grid">
          <article class="career-guide"><small>职业发展</small><h3>${escapeHTML(profile.directions.join('／'))}</h3><p class="career-axis">十神主軸：${escapeHTML(profile.dominantGods.join('＋'))}</p><h4>具體職位</h4><div class="career-role-list">${profile.roles.map(role => `<span>${escapeHTML(role)}</span>`).join('')}</div><p>${escapeHTML(profile.workStyle)}</p><div class="life-advice"><b>发展建议</b>${escapeHTML(profile.development)}</div><ol class="career-step-list">${profile.steps.map(step => `<li>${escapeHTML(step)}</li>`).join('')}</ol></article>
          <article class="body-guide"><small>身体关注</small><h3>传统五行日常观察</h3><div class="body-focus-list">${profile.bodyFocus.map(item => `<div><b>${item.element} · ${escapeHTML(item.role)}</b><p>关注：${escapeHTML(item.areas)}</p><small>${escapeHTML(item.advice)}</small></div>`).join('')}</div><p class="method-note">这里的“肝、心、脾、肺、肾”指传统中医功能体系，不等同现代医学的器官诊断。若有持续不适、疼痛或异常指标，应直接就医。</p></article>
        </div>
      </section>`;
  }

  function luckCycleHTML(chart, forecast) {
    const currentYear = new Date().getFullYear();
    const cycles = forecast.luck.cycles.filter(item => item.endYear >= currentYear - 10).slice(0, 8);
    return `
      <section class="report-section luck-section" id="luck-section">
        <h2>大运排表</h2>
        <div class="luck-summary"><div><small>排运方向</small><b>${escapeHTML(forecast.luck.direction)}</b></div><div><small>起运年龄</small><strong>约 ${forecast.luck.startAge} 岁</strong></div><p>以月柱为起点，按年干阴阳与性别定顺逆。</p></div>
        <div class="luck-grid">${cycles.map(item => {
          const active = currentYear >= item.startYear && currentYear <= item.endYear;
          const god = tenGodName(chart.pillars[2].stemIndex, item.stemIndex);
          return `<article class="luck-card ${active ? 'active' : ''}"><i class="luck-node" aria-hidden="true"></i><small class="luck-age">${item.startAge}–${item.endAge} 岁</small><b>${escapeHTML(item.pillar)}</b><span>${god}</span><p>${item.startYear}–${item.endYear}</p>${active ? '<em>当前大运</em>' : ''}</article>`;
        }).join('')}</div>
        <p class="method-note">大运用于确定十年环境主轴；每年结论仍须结合对应流年干支，不以单一大运直接断具体事件。</p>
      </section>`;
  }

  function decadeForecastHTML(forecast) {
    return `
      <section class="report-section forecast-section" id="decade-section">
        <h2>未来十年婚姻、事业与财富</h2>
        <p class="method-note">${escapeHTML(forecast.method)}</p>
        <div class="key-year-strip"><b>关键节点</b><span>${escapeHTML(forecast.keyYears.length ? forecast.keyYears.join('、') : '本周期以稳定推进为主')}</span></div>
        <div class="year-timeline detailed-timeline">${forecast.years.map(item => `
          <article class="year-row ${item.isKeyNode ? 'key-node' : ''}">
            <div class="year-stamp"><strong>${item.year}</strong><span>${escapeHTML(item.pillar)}</span>${item.luckPillar ? `<small>大运 ${escapeHTML(item.luckPillar)}</small>` : ''}${item.isKeyNode ? '<em>关键</em>' : ''}</div>
            <div class="year-content">
              <h3>${escapeHTML(item.title)}</h3>
              <p class="key-note">${escapeHTML(item.keyNote)}</p>
              ${item.isKeyNode ? `<div class="key-action-panel"><div><b>這一年要做</b><span>${escapeHTML(item.action)}</span></div><div><b>需要注意</b><span>${escapeHTML(item.caution)}</span></div></div>` : ''}
              <div class="trend-grid">
                ${[['婚姻', item.marriage], ['事业', item.career], ['财富', item.wealth]].map(([label, trend]) => `<section class="trend-card ${trend.className}"><header><b>${label}</b><span>${trend.label}</span></header><p>${escapeHTML(trend.summary)}</p><small>依据：${escapeHTML(trend.evidence)}</small></section>`).join('')}
              </div>
            </div>
          </article>`).join('')}</div>
      </section>`;
  }

  function reportView(reportId) {
    const report = load(KEYS.reports, []).find(item => item.id === reportId);
    if (!report) return errorView('报告不存在或已到期删除。', '#/start', '生成新报告');
    const chart = report.chart;
    const lead = load(KEYS.leads, []).find(item => item.id === report.leadId);
    const forecast = report.forecast || buildForecast(chart, lead?.birth?.sex || chart.sex);
    const birth = lead?.birth || {};
    const sexLabel = (birth.sex || chart.sex) === 'female' ? '女命' : (birth.sex || chart.sex) === 'male' ? '男命' : '性别未标注';
    const birthPlace = `${chart.city?.name || ''}${birth.district ? ` · ${birth.district}` : ''}`;
    const strongest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count)[0][0];
    const weakest = Object.entries(chart.elements).sort((a, b) => b[1].count - a[1].count).at(-1)[0];
    const displayTitle = '八字真言命理分析报告';
    const conclusionItems = coreConclusionItems(chart, forecast);
    const lifeItems = lifeSummaryItems(chart, forecast);
    const narrativeItems = humanNarrative(chart, forecast);
    return `
      <div class="page">
        <div class="report-head"><div><span class="eyebrow">完整报告</span><h2>${displayTitle}</h2></div><div class="button-row"><button class="btn btn-primary" data-action="save-report-images" data-report-id="${report.id}">保存报告图片</button><button class="btn btn-soft" data-action="delete-report" data-report-id="${report.id}">删除报告</button></div></div>
        <nav class="report-nav" aria-label="报告章节导航">
          ${[['overview-section','命盘'],['conclusion-section','总论'],['life-summary-section','生辰小结'],['career-health-section','职业健康'],['structure-section','十神结构'],['luck-section','大运'],['current-year-section','今年'],['decade-section','十年趋势'],['classics-section','古籍依据']].map(([target, label]) => `<button type="button" data-action="scroll-report" data-target="${target}">${label}</button>`).join('')}
        </nav>
        <div class="report-document" id="report-document">
          <section class="report-cover">
            <div><div class="seal-large">真</div><span class="eyebrow">命理详析版</span><h1 style="font-size:clamp(34px,6vw,58px)">${displayTitle}</h1><p>报告编号 ${escapeHTML(report.reportNo)}<br>${formatDate(report.createdAt)}</p></div>
          </section>
          <section class="report-identity"><div><small>命造</small><b>${sexLabel}</b></div><div><small>公历出生</small><b>${escapeHTML(chart.civilTime)}</b></div><div><small>出生地点</small><b>${escapeHTML(birthPlace || '未记录')}</b></div><div><small>农历核对</small><b>${escapeHTML(birth.lunarInput || '未填写')}</b></div></section>
          <section class="report-section" id="overview-section"><h2>排盘核对</h2>${pillarHTML(chart)}<div class="time-proof"><span><small>民用时间</small><b>${escapeHTML(chart.civilTime)}</b></span><span><small>真太阳时</small><b>${escapeHTML(chart.trueSolarTime)}</b></span><span><small>时间校正</small><b>${chart.correctionMinutes >= 0 ? '+' : ''}${chart.correctionMinutes} 分钟</b></span></div>${chart.boundaryWarnings.map(item => `<p class="inline-warning">${escapeHTML(item)}</p>`).join('')}${detailChartHTML(chart)}</section>
          <section class="report-section conclusion-section" id="conclusion-section"><h2>命局性格总论</h2><p class="section-intro">以下结论由日主、月令、十神权重、表层五行与原局合冲共同生成，重点说明性格、决策、人际和事业表达，不只是重复四柱资料。</p><div class="human-narrative">${narrativeItems.map(item => `<article><small>${escapeHTML(item.label)}</small><p>${escapeHTML(item.text)}</p></article>`).join('')}</div><div class="conclusion-grid">${conclusionItems.map(item => `<article class="conclusion-card"><small>${escapeHTML(item.title)}</small><p>${escapeHTML(item.body)}</p><span>依据：${escapeHTML(item.evidence)}</span></article>`).join('')}</div></section>
          <section class="report-section life-summary-section" id="life-summary-section"><h2>生辰综合小结</h2><p class="section-intro">把命局结构与未来十年流年结果合并阅读，直接整理使用者最关心的六项主题。</p><div class="life-summary-grid">${lifeItems.map(item => `<article class="life-summary-card"><header><span>${escapeHTML(item.title)}</span></header><p>${escapeHTML(item.summary)}</p>${item.highlights?.length ? `<dl class="summary-detail-list">${item.highlights.map(detail => `<div><dt>${escapeHTML(detail.label)}</dt><dd>${escapeHTML(detail.text)}</dd></div>`).join('')}</dl>` : ''}<div class="life-advice"><b>建议</b>${escapeHTML(item.advice)}</div><small>依据：${escapeHTML(item.evidence)}</small></article>`).join('')}</div></section>
          ${careerHealthHTML(chart, forecast)}
          ${structureAnalysisHTML(chart)}
          <section class="report-section"><h2>命局结构</h2><p>${escapeHTML(report.structure)}</p><div class="chart-card"><div>${pillarHTML(chart)}</div><div>${elementBarsHTML(chart)}</div></div></section>
          <section class="report-section"><h2>五行结构</h2><p>${escapeHTML(report.elements)}</p></section>
          <section class="report-section" id="classics-section"><h2>古籍依据</h2><p class="section-intro">本报告以《滴天髓》《子平真诠》《穷通宝鉴》《三命通会》《渊海子平》为主要判读框架。下列内容说明各书实际承担的规则层次，不以书名代替证据。</p><div class="classic-framework-grid">${CLASSIC_FRAMEWORK.map(item => `<article><small>主要据典</small><h3>《${escapeHTML(item.book)}》</h3><b>${escapeHTML(item.focus)}</b><p>${escapeHTML(item.scope)}</p></article>`).join('')}</div>${report.classics.length ? `<div class="verified-classics"><h3>已核验原文</h3>${report.classics.map(item => `<article class="preview-item"><h3>《${escapeHTML(item.book)}》</h3><span class="tag">${escapeHTML(item.location)}</span><p>${escapeHTML(item.text)}</p><p><b>规则释义：</b>${escapeHTML(item.rule)}</p></article>`).join('')}</div>` : '<p class="inline-warning">当前尚未收录可逐页核验的原文，因此不展示引文或冒充页码；所有结论只使用本报告已列明、可机械复核的月令、十神、五行与合冲规则。凡古籍无据者，不妄断。</p>'}</section>
          ${luckCycleHTML(chart, forecast)}
          ${currentGuidanceHTML(forecast)}
          ${decadeForecastHTML(forecast)}
          <section class="report-section"><h2>自我观察题</h2><ol>${report.reflection.map(item => `<li><p>${escapeHTML(item)}</p></li>`).join('')}</ol></section>
          <section class="report-section final-summary-section"><h2>命主结论总览</h2><div class="final-summary-grid">${lifeItems.map(item => `<article><b>${escapeHTML(item.title)}</b><p>${escapeHTML(item.summary)}</p><span>${escapeHTML(item.advice)}</span></article>`).join('')}</div><div class="audit-box"><p><b>推演复核：</b>十年逐年列出婚姻、事业与财富结论及触发依据；健康只作生活观察，不作疾病诊断；财富不承诺收益；未使用无法核验的古籍引文。</p><p><b>推演边界：</b>${escapeHTML(forecast.method)}</p></div></section>
          <section class="report-section report-disclosure"><p class="generation-disclosure">AI 生成內容</p><p>本报告用于传统历法文化研习与自我观察，不构成医疗诊断、投资建议、法律意见或人生重大决定依据。保存期限至 ${formatDate(report.expiresAt, false)}。</p></section>
        </div>
      </div>`;
  }

  function errorView(message, href, label) {
    return `<div class="page narrow"><div class="empty-state"><h2>暂时无法继续</h2><p>${escapeHTML(message)}</p><a class="btn btn-primary" href="${href}">${escapeHTML(label)}</a></div></div>`;
  }

  function adminView(tab = 'gates') {
    const settings = getSettings();
    const leads = load(KEYS.leads, []), orders = load(KEYS.orders, []), reports = load(KEYS.reports, []), jobs = load(KEYS.jobs, []), classics = load(KEYS.classics, []), events = load(KEYS.events, []);
    const gateLabels = {
      legalOpinion: ['中国大陆律师书面意见', '确认业务、内容、隐私及许可证要求'],
      douyinApproval: ['抖音平台书面确认', '确认自然内容、主页入口与微信承接方式'],
      wechatApproval: ['微信小程序审核确认', '确认类目、页面内容与 URL Link'],
      paymentApproval: ['微信支付商户确认', '确认 ¥9.9 商品与支付能力'],
      icpLicense: ['ICP／经营许可确认', '取得主管机关要求的备案或许可证'],
      expertValidation: ['命理师专业验收', '至少 50 案例与规则库通过审核']
    };
    return `
      <div class="page">
        <div class="report-head"><div><span class="eyebrow">运营与合规后台</span><h2>发布控制中心</h2><p>本地演示后台不等同生产权限系统；上线时必须接入企业身份与审计日志。</p></div><span class="tag ${allGatesReady(settings) ? 'green' : 'red'}">${allGatesReady(settings) ? '门槛已配置通过' : '合规门槛未完成'}</span></div>
        <div class="stat-grid" style="margin-bottom:24px"><article class="stat-card"><b>${leads.length}</b><small>H5 资料</small></article><article class="stat-card"><b>${orders.length}</b><small>订单</small></article><article class="stat-card"><b>${reports.length}</b><small>报告</small></article><article class="stat-card"><b>${classics.filter(x => x.approved).length}</b><small>核验古籍</small></article></div>
        <div class="admin-layout">
          <aside class="admin-menu">${[['gates','合规开关'],['classics','古籍资料'],['jobs','订单任务'],['integration','接口配置'],['data','隐私数据']].map(([id,label]) => `<button class="${tab === id ? 'active' : ''}" data-action="admin-tab" data-tab="${id}">${label}</button>`).join('')}</aside>
          <div>
            <section class="admin-section ${tab === 'gates' ? 'active' : ''}" data-admin-section="gates">
              <div class="panel"><h3>强制合规门槛</h3><p class="inline-danger">这里只记录已取得的真实批文。不得为了演示或上线进度虚假勾选。</p><div class="gate-list">${Object.entries(gateLabels).map(([key, value]) => `<div class="gate-item"><div><b>${value[0]}</b><p>${value[1]}</p></div><label class="switch"><input type="checkbox" data-setting-gate="${key}" ${settings.gates[key] ? 'checked' : ''}><i></i><span class="sr-only">切换 ${value[0]}</span></label></div>`).join('')}</div></div>
              <div class="panel" style="margin-top:18px"><h3>功能开关</h3><div class="gate-list">
                ${settingSwitch('demoMode','开发演示模式','允许模拟支付与背景生成，不产生真实交易',settings.demoMode)}
                ${settingSwitch('paymentEnabled','真实微信支付','只有全部门槛通过并配置微信后才生效',settings.paymentEnabled)}
                ${settingSwitch('predictionEnabled','个性化预测章节','另需至少一条已核验古籍来源',settings.predictionEnabled)}
                ${settingSwitch('qimenEnabled','奇门择时','仅在平台与法律明确许可后开放',settings.qimenEnabled)}
              </div></div>
            </section>
            <section class="admin-section ${tab === 'classics' ? 'active' : ''}" data-admin-section="classics">
              <div class="panel"><h3>新增人工核验古籍</h3><form id="classic-form"><div class="form-grid"><div class="field"><label>书名</label><select name="book" required>${BOOKS.map(book => `<option>${book}</option>`).join('')}</select></div><div class="field"><label>版本</label><input name="version" required placeholder="出版社、年份或影印本"></div><div class="field"><label>卷／篇</label><input name="chapter" required></div><div class="field"><label>页码</label><input name="page" required></div><div class="field full"><label>核验原文</label><textarea name="original" rows="4" required></textarea></div><div class="field full"><label>现代规则释义</label><textarea name="rule" rows="3" required></textarea></div><div class="field"><label>审核人</label><input name="reviewer" required></div><div class="field"><label class="checkbox"><input type="checkbox" name="approved"><span>已完成原书核验并批准用于报告</span></label></div></div><button class="btn btn-primary" type="submit">保存条目</button></form></div>
              <div class="panel" style="margin-top:18px"><h3>资料库</h3>${classics.length ? `<div class="table-wrap"><table><thead><tr><th>书名</th><th>位置</th><th>审核人</th><th>状态</th><th></th></tr></thead><tbody>${classics.map(item => `<tr><td>《${escapeHTML(item.book)}》</td><td>${escapeHTML(item.chapter)} · ${escapeHTML(item.page)}</td><td>${escapeHTML(item.reviewer)}</td><td>${item.approved ? '已核验' : '草稿'}</td><td><button class="text-button" data-action="delete-classic" data-id="${item.id}">删除</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state">尚无古籍资料。系统不会用模型记忆冒充原文。</div>'}</div>
            </section>
            <section class="admin-section ${tab === 'jobs' ? 'active' : ''}" data-admin-section="jobs">
              <div class="panel"><h3>订单与生成任务</h3>${orders.length ? `<div class="table-wrap"><table><thead><tr><th>订单</th><th>金额</th><th>状态</th><th>任务</th><th>时间</th></tr></thead><tbody>${orders.map(order => { const job = jobs.find(j => j.orderId === order.id); return `<tr><td>${order.id.slice(-8)}</td><td>¥${(order.amountFen/100).toFixed(2)}</td><td>${escapeHTML(order.status)}</td><td>${job ? `${job.status} ${job.progress}%` : '—'}</td><td>${formatDate(order.createdAt)}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty-state">尚无订单。</div>'}</div>
            </section>
            <section class="admin-section ${tab === 'integration' ? 'active' : ''}" data-admin-section="integration">
              <div class="panel"><h3>境内服务配置</h3><form id="integration-form"><div class="form-grid"><div class="field full"><label>微信小程序 URL Link</label><input name="wechatUrlLink" value="${escapeHTML(settings.wechatUrlLink)}" placeholder="https://wxaurl.cn/..."></div><div class="field"><label>模型名称</label><input name="modelName" value="${escapeHTML(settings.modelName)}"></div><div class="field"><label>模型备案号</label><input name="modelFiling" value="${escapeHTML(settings.modelFiling)}"></div><div class="field full"><label>投诉邮箱</label><input name="complaintEmail" type="email" value="${escapeHTML(settings.complaintEmail)}"></div><div class="field full"><label class="checkbox"><input type="checkbox" name="wechatConfigured" ${settings.wechatConfigured ? 'checked' : ''}><span>已完成 AppID、URL Link、登录回调与支付商户配置</span></label></div></div><button class="btn btn-primary" type="submit">保存配置</button></form><p class="inline-warning">密钥、AppSecret、商户私钥与 API v3 密钥不得保存在前端或本地存储；生产环境必须使用腾讯云 KMS／密钥管理。</p></div>
            </section>
            <section class="admin-section ${tab === 'data' ? 'active' : ''}" data-admin-section="data">
              <div class="panel"><h3>隐私资料概览</h3><p>H5 资料 ${leads.length} 条、报告 ${reports.length} 份、事件 ${events.length} 条。未承接资料 24 小时清理，报告 365 日清理。</p><div class="button-row"><button class="btn btn-soft" data-action="run-purge">立即执行到期清理</button></div></div>
              <div class="panel danger-zone" style="margin-top:18px"><h3>危险操作</h3><p>清除本机全部演示资料，包括出生资料、订单、报告、古籍与配置。此操作不可恢复。</p><button class="btn btn-primary" data-action="clear-all-data">清除所有本地数据</button></div>
            </section>
          </div>
        </div>
      </div>`;
  }

  function settingSwitch(key, title, description, checked) {
    return `<div class="gate-item"><div><b>${title}</b><p>${description}</p></div><label class="switch"><input type="checkbox" data-setting="${key}" ${checked ? 'checked' : ''}><i></i><span class="sr-only">切换 ${title}</span></label></div>`;
  }

  function handleClassicSubmit(form) {
    const data = new FormData(form);
    const item = { id: uid('source'), ...Object.fromEntries(data.entries()), approved: Boolean(data.get('approved')), createdAt: nowISO() };
    const classics = load(KEYS.classics, []); classics.push(item); save(KEYS.classics, classics);
    track('classic_created', { sourceId: item.id, approved: item.approved });
    toast('古籍条目已保存'); render();
  }

  function openPrivacy() {
    modalContent.innerHTML = `<span class="eyebrow">隐私说明摘要</span><h2>只收集完成排盘所需资料</h2><p>收集阳历出生日期、分钟、出生城市、性别及可选农历，仅用于历法计算、微信承接和报告生成。不收集姓名、身份证、通讯录或实时精确定位。</p><h3>保存期限</h3><p>未完成微信承接的资料 24 小时删除；付费报告保存 365 日。订单法定留存资料与出生资料分开保存。</p><h3>你的权利</h3><p>可下载或删除报告、撤回同意、提交投诉。生产版将提供完整的个人信息处理清单、处理者联系方式和影响评估说明。</p><p class="inline-warning">本页是产品送审草案，不替代正式法律文件。</p>`;
    modal.showModal();
  }
  function openShenshaDetail(name, position, trigger) {
    const info = SHENSHA_INFO[name];
    if (!info) return toast('暂未收录这项神煞说明');
    modalContent.innerHTML = `
      <span class="eyebrow">神煞释义</span>
      <h2>${escapeHTML(name)}</h2>
      <div class="modal-fact-grid">
        <div><small>所在宫位</small><b>${escapeHTML(position || '未记录')}</b></div>
        <div><small>触发地支／旬空</small><b>${escapeHTML(trigger || '未记录')}</b></div>
      </div>
      <h3>代表意义</h3><p>${escapeHTML(info.meaning)}</p>
      <h3>判定规则</h3><p>${escapeHTML(info.rule)}</p>
      <p class="source-note"><b>古籍出处：</b>${escapeHTML(info.source)}</p>
      <p class="method-note">神煞用于补充观察，不能脱离月令、旺衰、十神与原局合冲单独定吉凶。</p>`;
    modal.showModal();
  }
  function openPillarMeaning(index) {
    const item = PILLAR_MEANINGS[Number(index)];
    if (!item) return toast('暂未收录该宫位说明');
    modalContent.innerHTML = `
      <span class="eyebrow">四柱宫位</span>
      <h2>${escapeHTML(item.name)} · ${escapeHTML(item.short)}</h2>
      <p class="modal-lead">${escapeHTML(item.detail)}</p>
      <p class="source-note"><b>阅读提醒：</b>${escapeHTML(item.note)}</p>`;
    modal.showModal();
  }
  function openComplaint() {
    const settings = getSettings();
    modalContent.innerHTML = `<span class="eyebrow">投诉与申诉</span><h2>我们会核查每一项报告问题</h2><p>可投诉错误排盘、虚构引用、健康／投资越界、隐私处理或付款退款问题。请提供报告编号，不要在邮件正文再次发送完整出生资料。</p><p><b>联系邮箱：</b>${escapeHTML(settings.complaintEmail)}</p><p><b>演示处理时限：</b>收到后 7 个工作日内反馈。</p>`;
    modal.showModal();
  }

  function saveReportImages(reportId) {
    const report = load(KEYS.reports, []).find(item => item.id === reportId);
    if (!report) return toast('报告不存在');
    const profile = structureProfile(report.chart);
    const relations = branchRelations(report.chart);
    const lead = load(KEYS.leads, []).find(item => item.id === report.leadId);
    const forecast = report.forecast || buildForecast(report.chart, lead?.birth?.sex || report.chart.sex);
    const conclusionItems = coreConclusionItems(report.chart, forecast);
    const lifeItems = lifeSummaryItems(report.chart, forecast);
    const narrativeItems = humanNarrative(report.chart, forecast);
    const careerHealth = careerHealthProfile(report.chart, forecast);
    const shenshaLines = report.chart.pillars.map((pillar, index) => {
      const names = shenShaForPillar(report.chart, pillar);
      return `${PILLAR_MEANINGS[index].name}（${PILLAR_MEANINGS[index].short}）：${names.join('、') || '未触发本版神煞'}；空亡 ${pillarVoid(pillar)}`;
    });
    const groups = [
      { title: '封面与排盘', lines: ['八字真言命理分析报告', `报告编号 ${report.reportNo}`, `生成时间 ${formatDate(report.createdAt)}`, '', `四柱：${report.chart.pillars.map(item => item.text).join('　')}`, `十神：${report.chart.pillars.map((item, index) => index === 2 ? '日主' : tenGodName(report.chart.pillars[2].stemIndex, item.stemIndex)).join('　')}`, `民用时间：${report.chart.civilTime}`, `真太阳时：${report.chart.trueSolarTime}`, `校正：${report.chart.correctionMinutes >= 0 ? '+' : ''}${report.chart.correctionMinutes} 分钟`, '', '【宫位与神煞】', ...shenshaLines] },
      { title: '命局性格总论', lines: [...narrativeItems.flatMap(item => [`【${item.label}】`, item.text, '']), ...conclusionItems.flatMap(item => [`【${item.title}】`, item.body, `依据：${item.evidence}`, ''])] },
      { title: '生辰综合小结', lines: lifeItems.flatMap(item => [`【${item.title}】`, item.summary, ...(item.highlights || []).map(detail => `${detail.label}：${detail.text}`), `建议：${item.advice}`, `依据：${item.evidence}`, '']) },
      { title: '职业发展与身体关注', lines: ['【主轴领域】', careerHealth.directions.join('／'), '【具体职位】', careerHealth.roles.join('、'), careerHealth.workStyle, careerHealth.development, ...careerHealth.steps.map(step => `行动：${step}`), '', '【身体关注】', ...careerHealth.bodyFocus.flatMap(item => [`${item.element} · ${item.role}`, `关注：${item.areas}`, `日常建议：${item.advice}`, '']), '身体部分为传统五行生活观察，不作疾病诊断。'] },
      { title: '十神与财官结构', lines: ['【十神结构】', `常规结构 ${profile.conventionalPercent}%　变动结构 ${profile.variablePercent}%`, Object.entries(profile.tenGodCounts).map(([name, count]) => `${name}${count}`).join('、'), '', '【表层承载结构】', `同类与印星 ${profile.surfaceSupportPercent}%　其余五行 ${100 - profile.surfaceSupportPercent}%`, '此比例不能直接命名为身强身弱或实际担财能力。', '', '【财星落位】', ...(profile.positions.wealth.length ? profile.positions.wealth : ['原局表层未检出财星']), '', '【官杀落位】', ...(profile.positions.career.length ? profile.positions.career : ['原局表层未检出官杀']), '', '【地支关系】', ...(relations.length ? relations.map(item => `${item.members} ${item.type}（${item.positions}）`) : ['未触发本版已收录的六合、六冲或三合规则'])] },
      { title: '结构与古籍依据', lines: ['【命局结构】', report.structure, '', '【五行结构】', report.elements, '', '【主要据典】', ...CLASSIC_FRAMEWORK.flatMap(item => [`《${item.book}》｜${item.focus}`, item.scope]), '', '【已核验原文】', ...(report.classics.length ? report.classics.flatMap(item => [`《${item.book}》 ${item.location}`, item.text, `规则：${item.rule}`, '']) : ['当前未附可逐页核验的原文，未生成伪造引文。凡古籍无据者，不妄断。'])] },
      { title: `${forecast.health.year} 年行动参考`, lines: ['【生活健康关注】', forecast.health.headline, ...forecast.health.details, '', '【贵人方位】', forecast.nobleDirection, '', '【最佳行动时间】', forecast.actionWindow, forecast.actionFocus] },
      { title: '十年婚姻、事业与财富', lines: ['【关键节点】', ...(forecast.keyYears.length ? forecast.keyYears : ['本周期以稳定推进为主']), '', ...forecast.years.flatMap(item => [`${item.year} ${item.pillar}　大运${item.luckPillar || '未起'}　${item.title}`, `婚姻：${item.marriage.label}｜${item.marriage.summary}`, `事业：${item.career.label}｜${item.career.summary}`, `财富：${item.wealth.label}｜${item.wealth.summary}`, `节点：${item.keyNote}`, ...(item.isKeyNode ? [`要做：${item.action}`, `注意：${item.caution}`] : []), '']), '', '【推演方法】', forecast.method] }
    ];
    groups.forEach((group, index) => setTimeout(() => downloadReportCanvas(report, group, index + 1, groups.length), index * 450));
    track('report_images_saved', { reportId, count: groups.length });
    toast(`正在生成 ${groups.length} 张报告图片`);
  }

  function wrapText(ctx, text, maxWidth) {
    const chars = Array.from(String(text));
    const lines = []; let line = '';
    for (const char of chars) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = char; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function downloadReportCanvas(report, group, pageNumber, totalPages) {
    const canvas = document.createElement('canvas');
    const width = 1080, padding = 90, lineHeight = 50;
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = '30px KaiTi, STKaiti, "Kaiti SC", serif';
    const wrapped = group.lines.flatMap(line => line === '' ? [''] : wrapText(measure, traditionalize(line), width - padding * 2));
    const height = Math.max(1450, 370 + wrapped.length * lineHeight + 240);
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3ead7'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#9b7a3c'; ctx.lineWidth = 3; ctx.strokeRect(34, 34, width - 68, height - 68);
    ctx.strokeStyle = 'rgba(76,62,38,.26)'; ctx.lineWidth = 1; ctx.strokeRect(50, 50, width - 100, height - 100);
    ctx.fillStyle = '#9f3429'; ctx.fillRect(padding, 88, 74, 74);
    ctx.fillStyle = '#fff8e8'; ctx.font = 'bold 42px KaiTi, STKaiti, "Kaiti SC", serif'; ctx.textAlign = 'center'; ctx.fillText('历', padding + 37, 139);
    ctx.textAlign = 'left'; ctx.fillStyle = '#26231d'; ctx.font = 'bold 48px KaiTi, STKaiti, "Kaiti SC", serif'; ctx.fillText(traditionalize(group.title), padding + 100, 140);
    ctx.fillStyle = '#766b59'; ctx.font = '24px KaiTi, STKaiti, "Kaiti SC", serif'; ctx.fillText(`${report.reportNo}　·　第 ${pageNumber}/${totalPages} 页`, padding, 205);
    let y = 285; ctx.fillStyle = '#373229'; ctx.font = '30px KaiTi, STKaiti, "Kaiti SC", serif';
    wrapped.forEach(line => { if (!line) { y += 22; return; } if (line.startsWith('【')) { ctx.fillStyle = '#9f3429'; ctx.font = 'bold 34px KaiTi, STKaiti, "Kaiti SC", serif'; y += 15; } else { ctx.fillStyle = '#373229'; ctx.font = '30px KaiTi, STKaiti, "Kaiti SC", serif'; } ctx.fillText(line, padding, y); y += lineHeight; });
    ctx.fillStyle = '#6e6557'; ctx.font = '23px KaiTi, STKaiti, "Kaiti SC", serif'; ctx.fillText(traditionalize('AI 生成内容 · 传统历法文化研习 · 非医疗、投资或人生重大决定建议'), padding, height - 115);
    ctx.fillText(traditionalize(`${report.modelName} · ${report.modelFiling}`), padding, height - 76);
    const link = document.createElement('a');
    link.download = `${report.reportNo}-${pageNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link); link.click(); link.remove();
  }

  function deleteReport(reportId) {
    if (!confirm('确定删除这份报告及其出生资料关联吗？此操作无法恢复。')) return;
    const report = load(KEYS.reports, []).find(item => item.id === reportId);
    save(KEYS.reports, load(KEYS.reports, []).filter(item => item.id !== reportId));
    if (report) save(KEYS.leads, load(KEYS.leads, []).filter(item => item.id !== report.leadId));
    track('report_deleted', { reportId });
    toast('报告与关联出生资料已删除'); go('/home');
  }

  function render() {
    purgeExpiredData();
    renderBanner();
    const route = getRoute();
    let html;
    if (route.path === '/home' || route.path === '/') html = homeView();
    else if (route.path === '/start') html = startView();
    else if (route.path === '/handoff') html = handoffView(route.query.get('token'));
    else if (route.path === '/preview') html = previewView(route.query.get('token'));
    else if (route.path === '/generating') html = generationView(route.query.get('job'));
    else if (route.path === '/report') html = reportView(route.query.get('id'));
    else if (route.path === '/admin') html = adminView(route.query.get('tab') || 'gates');
    else html = errorView('页面不存在。', '#/home', '返回首页');
    app.innerHTML = html;
    bindForms();
    loadFeedbackWall();
    focusPage();
    track('page_view', { path: route.path });
  }

  function bindForms() {
    const birthForm = $('#birth-form');
    if (birthForm) {
      bindBirthPickers(birthForm);
      birthForm.addEventListener('submit', event => { event.preventDefault(); handleBirthSubmit(birthForm); });
    }
    const classicForm = $('#classic-form');
    if (classicForm) classicForm.addEventListener('submit', event => { event.preventDefault(); handleClassicSubmit(classicForm); });
    const integrationForm = $('#integration-form');
    if (integrationForm) integrationForm.addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(integrationForm); const settings = getSettings();
      settings.wechatUrlLink = String(data.get('wechatUrlLink') || '').trim(); settings.modelName = String(data.get('modelName') || '').trim(); settings.modelFiling = String(data.get('modelFiling') || '').trim(); settings.complaintEmail = String(data.get('complaintEmail') || '').trim(); settings.wechatConfigured = Boolean(data.get('wechatConfigured'));
      setSettings(settings); toast('接口配置已保存'); render();
    });
    const feedbackForm = $('#feedback-form');
    if (feedbackForm) feedbackForm.addEventListener('submit', event => { event.preventDefault(); submitFeedback(feedbackForm); });
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'privacy') openPrivacy();
    else if (action === 'complaint') openComplaint();
    else if (action === 'close-modal') modal.close();
    else if (action === 'show-shensha') openShenshaDetail(target.dataset.shensha, target.dataset.position, target.dataset.trigger);
    else if (action === 'show-pillar-meaning') openPillarMeaning(target.dataset.pillarIndex);
    else if (action === 'copy-token') navigator.clipboard?.writeText(target.dataset.token).then(() => toast('凭证已复制'));
    else if (action === 'open-wechat') {
      const settings = getSettings(); const lead = consumeHandoff(target.dataset.token);
      if (!lead) return toast('凭证已过期');
      track('wechat_open_click', { leadId: lead.id, configured: settings.wechatConfigured });
      if (settings.wechatConfigured && settings.wechatUrlLink) window.location.href = settings.wechatUrlLink;
      else go(`/preview?token=${encodeURIComponent(target.dataset.token)}`);
    }
    else if (action === 'create-order') createOrder(target.dataset.leadId);
    else if (action === 'scroll-report') document.getElementById(target.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (action === 'save-report-images') saveReportImages(target.dataset.reportId);
    else if (action === 'delete-report') deleteReport(target.dataset.reportId);
    else if (action === 'admin-tab') go(`/admin?tab=${target.dataset.tab}`);
    else if (action === 'delete-classic') { save(KEYS.classics, load(KEYS.classics, []).filter(item => item.id !== target.dataset.id)); toast('条目已删除'); render(); }
    else if (action === 'run-purge') { purgeExpiredData(); toast('到期资料清理完成'); render(); }
    else if (action === 'clear-all-data') {
      if (confirm('确定清除所有本地演示数据？此操作不可恢复。')) { Object.values(KEYS).forEach(key => localStorage.removeItem(key)); toast('本地数据已清除'); render(); }
    }
  });

  document.addEventListener('change', event => {
    if (event.target.matches('[data-setting-gate]')) {
      const settings = getSettings(); settings.gates[event.target.dataset.settingGate] = event.target.checked; setSettings(settings); render();
    }
    if (event.target.matches('[data-setting]')) {
      const settings = getSettings(); const key = event.target.dataset.setting;
      if (['paymentEnabled', 'predictionEnabled', 'qimenEnabled'].includes(key) && event.target.checked && !allGatesReady(settings)) {
        event.target.checked = false; toast('必须先取得并记录全部合规批文'); return;
      }
      settings[key] = event.target.checked; setSettings(settings); render();
    }
  });

  if (window.__TEST_MODE__) {
    window.__MVP_TEST__ = {
      calculateChart,
      buildPreview,
      buildReport,
      julianDayNumber,
      equationOfTime,
      apparentSolarLongitude,
      solarMonthIndex,
      tenGodName,
      growthStage,
      pillarVoid,
      pillarNayin,
      detailChartHTML,
      structureProfile,
      branchRelations,
      structureAnalysisHTML,
      buildLuckCycles,
      buildAnnualTrend,
      buildForecast,
      allGatesReady,
      predictionReady
    };
  }

  window.addEventListener('hashchange', render);
  modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
  const traditionalObserver = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const next = traditionalize(node.nodeValue); if (next !== node.nodeValue) node.nodeValue = next;
    } else if (node.nodeType === Node.ELEMENT_NODE) localizeTraditional(node);
  })));
  traditionalObserver.observe(document.body, { childList: true, subtree: true });
  localizeTraditional(document.body);
  purgeExpiredData();
  render();
})();
