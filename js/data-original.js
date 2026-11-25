window.D1 = window.D1 || {};

D1.reviewMode = document.body.classList.contains('review-mode');
/* 结算时间为枚举字段，枚举值「次自然日结算」置灰不可选，下拉框置灰展示 */
D1.SETTLE_TIME_OPTIONS = ['次自然日结算'];
D1.state = {
  route: 'mobile-entry',
  products: ['D+1结算'],
  productFees: {},
  open: { settleTime: '次自然日结算', chargeType: '不收费', rateType: '', rate: '0', min: '0', max: '0', material: false },
  change: { settleTime: '次自然日结算', chargeType: '笔笔收', rateType: '', rate: '0', min: '0', max: '0', material: false },
  openApproval: '待负责人审批',
  changeApproval: '待负责人审批',
  signType: 'open',
  signed: false,
  archiveMode: false,
  archiveSelected: [],
  archiveCollapsed: {},
  configFailed: false,
  rejectReason: ''
};

D1.routes = [
  { group: '掌中宝', system: 'BD 与负责人', items: [
    ['mobile-entry', '功能开通入口', 'entry'],
    ['mobile-open', '产品开通填写', 'form'],
    ['mobile-open-approval', '产品开通审批', 'approval'],
    ['mobile-change', '费率信息变更', 'form'],
    ['mobile-change-approval', '费率变更审批', 'approval'],
    ['mobile-workorders', '我的工单', 'order']
  ]},
  { group: 'CSP 机构管理平台', system: '机构管理员', items: [
    ['csp-sign', '消息详情', 'sign'],
    ['csp-agreement', '协议签约确认', 'sign'],
    ['csp-complete', '签约完成', 'success'],
    ['csp-archive', '已签协议归档', 'archive']
  ]},
  { group: 'OMP 运营管理平台', system: '运营与运维', items: [
    ['omp-list', '机构签约管理', 'order'],
    ['omp-rate', '机构权限与费率', 'rate'],
    ['omp-order', '工单配置结果', 'order']
  ]}
];

D1.meta = {
  'omp-list': { title: '机构签约管理', context: 'OMP · 机构管理 · 机构签约管理', notes: ['沿用原机构签约管理列表，新增 D+1 结算手续费相关工单。', '申请类型支持产品开通与费率信息变更，操作列提供详情与关闭。', '详情弹窗按原系统表格展示 D+1 收费方式、费率类型、费率值与保底封顶。'], callout: '列表仅展示工单与费率快照，权限与正式费率以机构详情为准。', demos: [['查看 D+1 工单配置结果', 'go-omp-order']] },
  'mobile-entry': { title: '功能开通入口', context: '掌中宝 · 机构详情 · 功能开通', notes: ['在现有功能开通入口展示 D+1 结算产品。', '产品开通与费率信息变更分别进入对应工单，不在入口页直接修改生效配置。', '已开通产品的费率入口展示当前收费方式、费率类型与费率摘要。'], callout: '入口只负责导航；是否允许提交仍需在工单内校验未完结申请。', demos: [['模拟未完结工单', 'demo-pending-order']] },
  'mobile-open': { title: '产品开通填写', context: '掌中宝 · 功能开通 · 产品开通 · D+1 结算', notes: ['D+1 区块按需求文档 3.1.4 进件/修改链接 API 实现【结算费率】模块，其余产品字段与顺序完全复原标准产品开通。', '结算时间为枚举字段（下拉选项由枚举驱动），枚举值「次自然日结算」置灰不可选，下拉框保留置灰箭头、置灰展示；收费方式必填、默认不收费，下拉含不收费/笔笔收/节假日收。', '收费方式与费率类型常显，费率类型默认请选择；收费方式为不收费时费率类型非必填、不显示必填星号，笔笔收/节假日收时必填并显示星号；D+1结算费、保底值、封顶值在选择完费率类型后再展示，默认填充 0；费率字段名按类型调整为 D+1结算费（%）/ D+1结算费（元/笔）。', '值只填数值，不重复展示单位。', '提交校验：收费方式为笔笔收/节假日收时费率类型与费率值必传、费率值不可为 0、保底不高于封顶，不收费时费率类型非必填、可直接提交；费率低于代理成本提示「费率值低于成本，请核实后配置！」。', '费率低于红线时，点击提交弹出审批邮件截图上传弹窗；弹窗按完整费率字段名展示，右侧仅显示数值。'], callout: '触发方式：收费方式选「笔笔收」，费率类型选「百分比」，费率值填 0.22 后点击提交；也可点击下方演示按钮直接打开弹窗。0.10 会先触发低于代理成本校验。', demos: [['填入百分比费率', 'demo-percent'], ['切换为固定值', 'demo-fixed'], ['默认不收费', 'demo-no-charge'], ['模拟低于代理成本', 'demo-low-cost'], ['直接打开审批截图弹窗', 'demo-low-redline']] },
  'mobile-open-approval': { title: '产品开通审批', context: '掌中宝 · 工单中心 · 产品开通审核', notes: ['负责人可查看机构信息、D+1 权限申请和完整费率组；BD 提交时已上传审批材料的才展示审批材料，未提交则不展示该项。', '审批邮件截图按标准产品开通审核页原样展示：独立标签「审批邮件截图」+ 带边框方形文件卡片，卡片上部为截图缩略预览、下部为文件名（超长省略），不再以右侧文字行展示。', '审批通过后进入待签约，审批驳回后保留修改并重新提交入口。', '审批页只读，不允许直接修改 BD 已提交的费率。'], callout: '审批通过只代表进入签约流程，不提前写入产品权限或正式费率。', demos: [['审批通过并进入签约', 'approve-open'], ['驳回并填写原因', 'reject-open']] },
  'mobile-change': { title: '费率信息变更', context: '掌中宝 · 机构详情 · 费率信息变更 · D+1 结算', notes: ['按需求文档 3.1.4 获取修改链接 API，新增【结算费率设置】模块。', '进入页面展示当前收费方式；收费方式含不收费/笔笔收/节假日收，收费方式与费率类型常显，费率类型默认请选择；不收费时费率类型非必填、不显示必填星号，笔笔收/节假日收时必填并显示星号；D+1结算费、保底值、封顶值在选择完费率类型后再展示，默认填充 0。', '校验同进件：费率值不可为 0、保底不高于封顶、费率不可低于代理成本。', '收费方式或费率类型变化时，新旧记录分别保留，历史费率快照不可覆盖。'], callout: '产品已开通状态不随费率变更重置。', demos: [['切换为不收费', 'demo-change-empty'], ['模拟保底高于封顶', 'demo-limit-error'], ['模拟低于红线并补传材料', 'demo-change-low-redline']] },
  'mobile-change-approval': { title: '费率变更审批', context: '掌中宝 · 工单中心 · 费率信息变更审核', notes: ['审批页对比展示变更前后费率，并展示本次完整新费率组；BD 提交时已上传审批材料的才展示审批材料，未提交则不展示该项。', '审批邮件截图按标准产品开通审核页原样展示：独立标签「审批邮件截图」+ 带边框方形文件卡片，卡片上部为截图缩略预览、下部为文件名（超长省略）。', '通过后进入重新签约；驳回后可返回修改，原生效费率不受影响。', '审批与签约未完成前，不得提前变更 OMP 正式展示值。'], callout: '费率变更签约前需提醒：下级机构与商户费率不会自动更新。', demos: [['审批通过并进入签约', 'approve-change'], ['驳回并填写原因', 'reject-change']] },
  'mobile-workorders': { title: '工单管理', context: '掌中宝 · 工单管理 · 功能开通', notes: ['沿用原工单管理的分类筛选与卡片列表。', '展示产品开通、协议签约与费率信息变更工单。', '点击工单进入对应审批或签约页面。'], callout: '工单状态与原系统一致：待负责人审批、待机构签约等。', demos: [] },
  'csp-sign': { title: '消息详情', context: 'CSP · 消息中心 · 产品开通待签署协议', notes: ['沿用原消息详情版式，D+1 申请通过后进入待签署协议消息。', '消息中提供「点击查看」，进入原独立电子签约页。', '下级机构费率默认与一级机构一致，需单独修改。'], callout: '签约前不得提前展示 OMP 正式费率。', demos: [['按产品开通流程签约', 'demo-sign-open'], ['按费率变更流程签约', 'demo-sign-change']] },
  'csp-agreement': { title: '协议签约确认', context: 'CSP · 消息中心 · 独立电子签约页', notes: ['沿用原独立签约页版式，展示本次 D+1 待签协议和变更后费率。', '费率信息变更签约前提示下级机构与商户费率不会自动更新。', '点击立即签约弹出确认弹窗，签约成功后进入完成页。'], callout: '签约成功才允许进入自动配置环节。', demos: [['按产品开通流程签约', 'demo-sign-open'], ['按费率变更流程签约', 'demo-sign-change']] },
  'csp-complete': { title: '签约完成', context: 'CSP · 协议签约 · 签约完成结果页', notes: ['明确展示签约完成、D+1 产品费率摘要和已签协议。', '支持查看、下载本次协议，并可继续查看自动配置结果。', '签约完成与配置成功分开表达，配置失败不得回写为签约失败。'], callout: '完成页产品权限与费率分开展示，费率类型不含不收费。', demos: [['查看工单配置结果', 'go-omp-order'], ['进入已签协议归档', 'go-csp-archive']] },
  'csp-archive': { title: '已签协议归档', context: 'CSP · 我的信息 · 服务协议', notes: ['D+1 结算产品补充协议归入补充协议分组。', '保留分组折叠、单份查看下载、批量选择与批量下载交互。', '全选仅选择当前已展开且可见的协议；取消后退出批量选择状态。'], callout: '协议文件与签署时间为演示数据，正式内容以签约系统返回为准。', demos: [['进入批量下载', 'demo-archive-batch'], ['折叠补充协议分组', 'demo-archive-collapse']] },
  'omp-rate': { title: '机构权限与费率', context: 'OMP · 合作机构管理 · 机构详情 · 费率信息', notes: ['在机构费率信息中展示 D+1 产品权限、签约主体、收费方式和完整签约费率。', '产品权限状态与是否收费分列展示，不得通过费率字段推导产品是否开通。', '历史记录保留每次生效配置，切换收费方式或费率类型时新增记录并作废旧记录。'], callout: '机构签约费率、机构成本、商户实际费率分别存储；此页不直接修改商户费率。', demos: [['查看历史配置记录', 'demo-rate-history'], ['恢复百分比收费展示', 'demo-omp-percent']] },
  'omp-order': { title: '工单配置结果', context: 'OMP · 签约管理 · 工单详情', notes: ['工单主状态与自动配置子状态分开显示，签约完成后主状态为已完成。', '产品权限、签约费率、机构成本和协议归档分别保存配置结果。', '部分失败时保留成功项，失败项展示原因并提供幂等重试入口。'], callout: '机构成本入口尚未确认，原型仅展示自动配置结果，不新增成本维护入口。', demos: [['模拟机构成本配置失败', 'demo-config-fail'], ['重试失败配置项', 'demo-config-retry']] }
};

D1.icons = {
  entry: '<path d="M4 5h16M4 12h16M4 19h10"/><path d="m17 16 3 3-3 3"/>',
  form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  approval: '<path d="M9 3h6l1 3h3v15H5V6h3l1-3Z"/><path d="m8 14 3 3 5-6"/>',
  sign: '<path d="M4 20h16M6 16 16 6l2 2L8 18l-4 1 2-3Z"/><path d="M14 4l2-2 4 4-2 2"/>',
  success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  archive: '<path d="M4 7h16v14H4zM3 3h18v4H3z"/><path d="M9 11h6"/>',
  rate: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  order: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 15v5h16v-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
};

D1.icon = function (name, className = '') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${D1.icons[name] || D1.icons.info}</svg>`;
};
D1.tag = function (text = '本次新增') { return D1.reviewMode ? `<span class="change-tag">${text}</span>` : ''; };
D1.escape = function (value) { const div = document.createElement('div'); div.textContent = String(value ?? ''); return div.innerHTML; };
/* 费率值展示格式：去掉多余尾零并至少保留两位小数（0.1000→0.10、0.0100→0.01，0.1234 保留四位精度） */
D1.formatFeeNumber = function (value) {
  if (value === '' || value == null) return '';
  const text = String(value).trim();
  if (!/^\d+(?:\.\d+)?$/.test(text)) return text;
  const [integer, fraction = ''] = text.split('.');
  const significant = fraction.replace(/0+$/, '');
  const decimals = significant.length >= 2 ? significant : significant.padEnd(2, '0');
  return `${integer}.${decimals}`;
};
D1.d1RateLabel = function (fee) {
  if (fee.rateType === '固定值') return 'D+1结算费（元/笔）';
  if (fee.rateType === '百分比') return 'D+1结算费（%）';
  return 'D+1结算费（元/笔）';
};
D1.feeText = function (fee) {
  const rate = D1.formatFeeNumber(fee.rate);
  if (fee.rateType === '固定值') return rate ? `${rate} 元/笔` : '—';
  if (fee.rateType === '百分比') return rate ? `${rate}%` : '—';
  return fee.chargeType === '不收费' ? '不收费' : '未配置';
};
D1.currentFee = function () { return D1.state.signType === 'change' ? D1.state.change : D1.state.open; };

/* 多选产品：按原 006-010 顺序展示，D+1 结算为新增项排在最后；D+1 沿用 open 状态 */
D1.PRODUCTS = ['外卡', '翼支付', '白条分期', '订单支付', '智慧营销', '分账', '银行账户', 'D+1结算'];

/* 各产品开通字段与默认值：完全复原标准产品开通原图（006-010）
   fields: [key, 标签, 类型(number/select/none), 单位, 默认值, 是否必填, 子标签分组] */
D1.PRODUCT_SCHEMA = {
  '外卡': {
    band: '外卡费率',
    groups: [
      { sub: 'VISA', fields: [ { key: 'visaEdc', label: 'EDC', unit: '%', value: '1.85', redLine: 1.85 }, { key: 'visaDcc', label: 'DCC', unit: '%', value: '1', redLine: 1 } ] },
      { sub: 'MC', fields: [ { key: 'mcEdc', label: 'EDC', unit: '%', value: '1.85', redLine: 1.85 }, { key: 'mcDcc', label: 'DCC', unit: '%', value: '1', redLine: 1 } ] },
      { sub: 'JCB', fields: [ { key: 'jcbEdc', label: 'EDC', unit: '%', value: '3', redLine: 3 } ] },
      { sub: '', fields: [ { key: 'aeOther', label: 'AE-非酒店', unit: '%', value: '1', redLine: 1 } ] },
      { sub: '特殊行业费率', collapse: true, fields: [ { key: 'spVisaEdc', label: 'VISA', unit: '%', value: '3', redLine: 3 }, { key: 'spMcEdc', label: 'MC', unit: '%', value: '3', redLine: 3 }, { key: 'spAeHotel', label: 'AE-酒店', unit: '%', value: '3', redLine: 3 } ] }
    ]
  },
  '翼支付': {
    band: '翼支付费率',
    groups: [ { sub: '翼支付', fields: [ { key: 'debit', label: '借记卡', unit: '%', value: '0.21', redLine: 0.21 }, { key: 'credit', label: '贷记卡', unit: '%', value: '0.21', redLine: 0.21 } ] } ]
  },
  '白条分期': {
    band: '白条分期开通',
    groups: [ { sub: '', fields: [ { key: 'baitiao', label: '白条分期费率', unit: '%', value: '0.54', redLine: 0.52 } ] } ]
  },
  '订单支付': {
    band: '订单支付',
    groups: [ { sub: '', fields: [ { key: 'order', label: '订单支付费率', unit: '%', value: '0.1', redLine: 0.07 } ] } ]
  },
  '智慧营销': {
    band: '智慧营销',
    groups: [ { sub: '', fields: [ { key: 'marketing', label: '智慧营销费率', unit: '%', value: '0.23', redLine: 0.23 } ] } ]
  },
  '分账': {
    band: '分账',
    groups: [ { sub: '', fields: [
      { key: 'orderSplit', label: '订单分账服务费', unit: '%', value: '0' },
      { key: 'orderSplitMin', label: '订单分账服务费保底值', unit: '元', value: '0' },
      { key: 'orderSplitMgr', label: '订单分账资金管理费', unit: '%', value: '0' },
      { key: 'balSplit', label: '余额分账服务费', unit: '%', value: '0' },
      { key: 'balSplitMin', label: '余额分账服务费保底值', unit: '元', value: '0' },
      { key: 'balSplitMgr', label: '余额分账资金管理费', unit: '%', value: '0' }
    ] } ]
  },
  '银行账户': {
    band: '银行账户',
    groups: [
      { sub: '中信', fields: [ { key: 'citicIn', label: '随行付入金服务费', unit: '%', value: '0.01', redLine: 0.01 }, { key: 'citicNonIn', label: '非随行付入金服务费', unit: '%', value: '0.05', redLine: 0.05 }, { key: 'citicWithdraw', label: '提现服务费', unit: '%', value: '0.05', redLine: 0.05 } ] },
      { sub: '网商', fields: [ { key: 'mybankWithdraw', label: '提现服务费', unit: '%', value: '0.07', redLine: 0.07 }, { key: 'mybankCashier', label: '收银台支付服务费', unit: '%', value: '0.2', redLine: 0.2 } ] }
    ]
  }
};

/* 初始化某产品的费率状态（把 schema 拍平成 key->value，另存 material） */
D1.buildProductFee = function (name) {
  const schema = D1.PRODUCT_SCHEMA[name];
  const fee = { material: false };
  if (!schema) return fee;
  schema.groups.forEach(g => g.fields.forEach(f => { fee[f.key] = f.value; }));
  return fee;
};

D1.productFee = function (name) {
  if (name === 'D+1结算') return D1.state.open;
  if (!D1.state.productFees[name]) D1.state.productFees[name] = D1.buildProductFee(name);
  return D1.state.productFees[name];
};

/* 找出某产品所有低于红线的费率字段（按配置表逐字段红线，无红线的产品如分账不触发） */
D1.lowRateFields = function (name) {
  const schema = D1.PRODUCT_SCHEMA[name];
  if (!schema) return [];
  const fee = D1.productFee(name);
  const result = [];
  schema.groups.forEach(g => g.fields.forEach(f => {
    if (f.unit === '%' && f.redLine !== undefined && fee[f.key] !== '' && fee[f.key] !== undefined && Number(fee[f.key]) < f.redLine) {
      result.push({ key: f.key, label: (g.sub ? g.sub + ' ' : '') + f.label, value: fee[f.key], unit: f.unit });
    }
  }));
  return result;
};
