window.D1 = window.D1 || {};

/* OMP 统一门户壳（原026） */
D1.ompShell = function (activeMenu, content) {
  const navItems = ['用户管理', '机构管理', '风控系统', '资金管理', '交易管理', '分润管理', '产品管理', '机具管理', '银行合作', '档案系统', '增值产品管理'];
  const tabs = [['首页', 'standard-product'], ['机构签约管理', 'omp-list'], ['合作机构管理', 'omp-rate'], ['渠道号申请管理', 'standard-product']];
  const menus = ['合作机构管理', '机构账号管理', '销售渠道管理', '业务人员管理', '接口联调情况查询', '科技公司代理商参数', '科技公司服务商参数', '科技公司代理商运营中心参数', '随行付代理商参数', '随行付服务商参数', '随行付代理商运营中心参数', '科技公司个人代理商参数模板', '入网鉴权模板管理', '机构签约管理', '机构换签管理', '渠道号申请管理'];
  return `<section class="desktop-frame omp-frame" aria-label="运营管理平台">
    <header class="system-topbar omp-topbar"><div class="system-logo omp-logo"><span>统一门户系统</span><small>当前内网</small></div><nav class="system-nav omp-nav">${navItems.map(n => `<span class="${n === '机构管理' ? 'active' : ''}">${n}</span>`).join('')}</nav><div class="system-user omp-user"><span class="user-avatar">P</span><span>P102623</span></div></header>
    <div class="system-tabs omp-tabs"><span class="common-menu">常用菜单</span>${tabs.map(([t, go]) => `<button class="system-tab ${activeMenu === t ? 'active' : ''}" ${go === 'standard-product' ? 'data-action="standard-product"' : `data-go="${go}"`}>${t}<b>×</b></button>`).join('')}</div>
    <div class="system-workspace"><aside class="system-sidebar omp-sidebar"><div class="system-menu-title">机构管理 <span>⌃</span></div>${menus.map(m => `<div class="system-submenu ${activeMenu === m ? 'active' : ''}" ${m === '机构签约管理' ? 'data-go="omp-list"' : m === '合作机构管理' ? 'data-go="omp-rate"' : 'data-action="standard-product"'}>${m}</div>`).join('')}</aside><main class="system-content">${content}</main></div>
  </section>`;
};

/* CSP 壳（测试环境：深色顶栏 + 页面小标签 + 内容区，签约页无窗口栏/侧边栏） */
D1.cspShell = function (mode, content) {
  const cspTop = `<header class="system-topbar csp-topbar"><div class="system-logo csp-logo"><img class="csp-logo-mark" src="assets/csp-logo-mark.png" alt=""><span>机构管理平台</span></div><nav class="system-nav csp-nav">${['首页', '商户管理', '交易数据', '分润管理', '风控管理', '产品中心', '账号管理', '营销平台'].map(n => `<span class="${n === '首页' ? 'active' : ''}">${n}</span>`).join('')}</nav><div class="system-user csp-user"><span class="csp-user-ico csp-mail-ico">✉</span><span class="csp-user-ico csp-download-ico">⭳</span><span class="csp-help">帮助中心</span><img class="user-avatar csp-user-avatar" src="assets/csp-user-avatar.png" alt=""><span class="csp-username">${mode === 'system' ? '曹县億柯凯瑞箱包店' : '生产测试代理商111'}</span></div></header>`;
  if (mode === 'system') {
    const tabs = ['首页', '本机构管理', '消息中心'];
    return `<section class="desktop-frame csp-frame" aria-label="机构管理平台">${cspTop}
      <div class="system-tabs csp-tabs">${tabs.map(t => `<button class="system-tab ${t === '消息中心' ? 'active' : ''}" data-go="csp-sign">${t}<b>×</b></button>`).join('')}</div>
      <div class="system-workspace"><aside class="system-sidebar csp-sidebar">
        <div class="system-menu-title">机构管理 <span>⌃</span></div>
        <div class="system-submenu active">本机构管理</div><div class="system-submenu">下级机构管理</div><div class="system-submenu">办公员管理</div><div class="system-submenu">业务员管理</div>
        <div class="system-menu-title">营销账户管理 <span>⌃</span></div>
        <div class="system-submenu">账户资金查询</div><div class="system-submenu">营销转账明细</div>
      </aside><main class="system-content">${content}</main></div></section>`;
  }
  if (mode === 'archive') return `<section class="desktop-frame csp-standalone csp-plain" aria-label="CSP 服务协议"><main class="system-content">${content}</main></section>`;
  return `<section class="desktop-frame csp-standalone" aria-label="CSP 独立页">${cspTop}<div class="csp-page"><div class="csp-page-tag">产品开通</div><main class="system-content">${content}</main></div><button class="csp-float-btn" aria-label="收起侧边栏">«</button></section>`;
};

D1.openProducts = function () {
  return D1.PRODUCTS.filter(name => D1.state.products.includes(name));
};
D1.signProducts = function () {
  return D1.state.signType === 'change' ? ['D+1结算'] : D1.openProducts();
};
D1.agreementName = function (name) {
  return { 'D+1结算': '补充协议-D+1结算', '外卡': '国际银行卡收单服务协议', '翼支付': '补充协议-翼支付', '白条分期': '补充协议-京东白条', '订单支付': '补充协议-订单支付', '智慧营销': '补充协议-智慧营销', '分账': '补充协议-分账', '银行账户': '银行账户服务协议' }[name] || `${name}服务协议`;
};
D1.rawValue = value => `${D1.escape(D1.formatFeeNumber(value))}`;
D1.pct = value => `${D1.escape(D1.formatFeeNumber(value))}%`;
D1.signTable = function (headers, rows, extraClass = '', colWidths = null) {
  const cell = c => typeof c === 'object' ? `<td rowspan="${c.rowSpan}">${c.text}</td>` : `<td>${c}</td>`;
  const headCell = h => typeof h === 'object' ? `<th colspan="${h.colSpan || 1}">${h.text}</th>` : `<th>${h}</th>`;
  const colgroup = colWidths ? `<colgroup>${colWidths.map(w => `<col style="width:${w}%">`).join('')}</colgroup>` : '';
  return `<table class="csp-sign-table ${extraClass}"${colWidths ? ' style="table-layout:fixed"' : ''}>${colgroup}<thead><tr>${headers.map(headCell).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody></table>`;
};
D1.productSignSection = function (name, kind = D1.state.signType) {
  const fee = name === 'D+1结算' ? (kind === 'change' ? D1.state.change : D1.state.open) : D1.productFee(name);
  const section = (label, tables, tags = '') => `<div class="csp-sign-block-item" data-sign-product="${name}" ${tags}><div class="csp-sign-label">${label}</div>${tables}</div>`;
  if (name === 'D+1结算') {
    const charging = ['笔笔收', '节假日收'].includes(fee.chargeType);
    const rateValue = charging ? D1.feeText(fee) : '不收费';
    const rateHeader = fee.rateType === '固定值' ? '变更后费率（元/笔）' : '变更后费率（%）';
    const table = D1.signTable(['费率类型', rateHeader], [['D+1结算手续费', rateValue]]);
    return section('D+1结算产品', table);
  }
  if (name === '外卡') {
    const schema = D1.PRODUCT_SCHEMA['外卡'];
    const rows = [];
    schema.groups.filter(g => !g.collapse).forEach(g => {
      const brand = g.sub || 'AE';
      g.fields.forEach((f, i) => {
        const row = [];
        if (i === 0) row.push({ text: brand, rowSpan: g.fields.length });
        row.push(f.label, D1.rawValue(fee[f.key]));
        rows.push(row);
      });
    });
    const standard = D1.signTable(['', '费率类型', '变更后费率 (%)'], rows);
    const specialGroup = schema.groups.find(g => g.collapse);
    const specialRows = specialGroup.fields.map(f => [f.label, D1.rawValue(fee[f.key])]);
    const special = D1.signTable(['特殊行业费率类型', '变更后费率 (%)'], specialRows, 'csp-sign-subtable');
    return section('外卡产品', standard + special);
  }
  if (name === '分账') {
    const rows = [
      ['余额分账服务费', D1.rawValue(fee.balSplit), D1.rawValue(fee.balSplitMin), D1.rawValue(fee.balSplitMgr)],
      ['订单分账服务费', D1.rawValue(fee.orderSplit), D1.rawValue(fee.orderSplitMin), D1.rawValue(fee.orderSplitMgr)]
    ];
    return section('分账产品', D1.signTable(['费率类型', '变更后服务费（%）', '变更后服务费保底值（元）', '变更后资金管理费（%）'], rows));
  }
  if (name === '银行账户') {
    const schema = D1.PRODUCT_SCHEMA['银行账户'];
    const rows = [];
    schema.groups.forEach(g => {
      const bank = g.sub === '中信' ? '中信银行' : '网商银行';
      g.fields.forEach((f, i) => {
        const row = [];
        if (i === 0) row.push({ text: bank, rowSpan: g.fields.length });
        row.push(f.label, D1.rawValue(fee[f.key]));
        rows.push(row);
      });
    });
    return section('银行账户', D1.signTable([{ text: '费率类型', colSpan: 2 }, '变更后费率（%）'], rows, '', [21.65, 41.03, 37.32]));
  }
  const schema = D1.PRODUCT_SCHEMA[name];
  const rows = schema.groups.flatMap(g => g.fields.map(f => [g.sub ? `${g.sub} ${f.label}` : f.label, D1.rawValue(fee[f.key])]));
  return section(name, D1.signTable(['费率类型', '变更后费率 (%)'], rows));
};
D1.paymentSignSection = function (names, kind = D1.state.signType) {
  const rows = [];
  if (names.includes('翼支付')) { const f = D1.productFee('翼支付'); rows.push(['翼支付', '/', D1.pct(f.debit), '/', D1.pct(f.credit)]); }
  if (names.includes('白条分期')) rows.push(['京东白条分期', '/', '', '/', D1.pct(D1.productFee('白条分期').baitiao)]);
  if (names.includes('订单支付')) rows.push(['订单支付', '', D1.pct(D1.productFee('订单支付').order), '/', '/']);
  if (names.includes('智慧营销')) { const f = D1.productFee('智慧营销'); rows.push(['智慧营销', '', D1.pct(f.marketing), '', D1.pct(f.marketing)]); }
  const table = D1.signTable(['支付类型', '费率模式', '借记卡', '借记卡封顶', '贷记卡'], rows, '', [21.2, 20.44, 16.88, 24.45, 17.03]);
  return `<div class="csp-sign-block-item" data-sign-product="支付产品" data-sign-products="${names.join(',')}"><div class="csp-sign-label">支付产品</div>${table}</div>`;
};
D1.signProductSections = function (names = D1.signProducts(), kind = D1.state.signType) {
  const blocks = [];
  if (names.includes('外卡')) blocks.push(D1.productSignSection('外卡', kind));
  const payment = D1.PRODUCTS.filter(name => ['翼支付', '白条分期', '订单支付', '智慧营销'].includes(name) && names.includes(name));
  if (payment.length) blocks.push(D1.paymentSignSection(payment, kind));
  if (names.includes('分账')) blocks.push(D1.productSignSection('分账', kind));
  if (names.includes('银行账户')) blocks.push(D1.productSignSection('银行账户', kind));
  if (names.includes('D+1结算')) blocks.push(D1.productSignSection('D+1结算', kind));
  return blocks.join('');
};
D1.openAgreementNames = function (names = D1.openProducts()) {
  return names.map(D1.agreementName);
};
D1.renderCspMessage = function () {
  const isChange = D1.state.signType === 'change';
  const names = D1.signProducts();
  const product = names.join('、');
  const content = `<div class="desktop-page-title csp-message-title"><h2>消息详情</h2><button class="button button-secondary" data-go="mobile-workorders">返回</button></div>
    <section class="csp-message-body"><h3>${isChange ? '费率信息变更待签署协议' : `${product}产品开通待签署协议`}</h3><time>2026-11-23 11:09:15</time>
      <p>您的${isChange ? 'D+1结算手续费费率信息变更' : `${product}产品开通`}申请已通过，请签署协议 <button class="link" data-go="csp-agreement">点击查看</button></p>
      <p>下级机构${product}产品费率默认与一级机构一致，如有需要，请您及时修改下级机构的${product}产品费率。</p></section>`;
  return D1.cspShell('system', content);
};

D1.renderCspSign = function () {
  const isChange = D1.state.signType === 'change';
  const names = D1.signProducts();
  const agreements = isChange ? ['补充协议-D+1结算'] : D1.openAgreementNames(names);
  const agreementText = agreements.map(name => `<a class="csp-agreement-link" data-action="view-agreement" data-name="${name}">《${name}》</a>`).join('');
  const sections = D1.signProductSections(names);
  const content = `<div class="sign-page-title">签署协议——线上电子签约，完成后可下载电子协议，快速方便</div>
    <p class="csp-sign-cause">由于贵司${isChange ? '费率信息变更' : '产品开通'}申请已通过，${agreementText}需重新签署</p>
    <section class="csp-sign-block"><h3 class="csp-sign-confirm-title">请确认以下费率信息并完成签约</h3>
      ${sections}
      <div class="csp-sign-footer center"><button class="button button-primary" data-action="start-sign">立即签约</button></div></section>`;
  return D1.cspShell('standalone', content);
};

D1.renderCspComplete = function () {
  const isChange = D1.state.signType === 'change';
  const names = D1.signProducts();
  const product = names.join('、');
  const content = `<div class="sign-success"><div class="success-check">✓</div><h2>签约完成</h2><p>${product}产品${isChange ? '费率变更' : '开通'}协议已完成电子签署，系统将自动配置产品权限与签约费率</p><div class="result-strip"><span>签约主体：<strong>生产测试代理商111</strong></span><span>${isChange ? '变更产品' : '开通产品'}：<strong>${product}</strong></span><span>完成时间：<strong>2026-11-23 11:18</strong></span></div><div class="csp-sign-footer center"><button class="button button-primary" data-action="view-agreement" data-name="D+1结算产品补充协议">查看协议</button><button class="button button-primary" data-go="omp-order">查看配置结果</button></div></div>`;
  return D1.cspShell('complete', content);
};

D1.renderCspArchive = function () {
  const selectable = D1.state.archiveMode;
  const baseSupplement = ['分账结算业务补充协议', 'T+0即时到账业务补充协议', '线上订单对账补充协议', 'D+1结算产品补充协议'];
  const selectedAgreements = D1.openAgreementNames(D1.signProducts()).filter(n => !baseSupplement.includes(n) && n !== '补充协议-D+1结算');
  const groups = [
    ['基础类协议', ['收单机构基础合作服务协议', '商户入网基础服务协议']],
    ['补充协议', [...baseSupplement, ...selectedAgreements]],
    ['推广合作类协议', ['营销活动增值合作协议', '渠道推广合作协议']],
    ['其它类型', ['保密信息合作协议']]
  ];
  const allNames = groups.flatMap(g => g[1]);
  const allSelected = allNames.every(n => D1.state.archiveSelected.includes(n));
  const content = `<h2 class="archive-page-title">服务协议</h2>
    <div class="archive-toolbar"><label><input type="checkbox" data-action="archive-select-all" ${allSelected ? 'checked' : ''}> 全选/取消全选</label><span class="archive-actions">${selectable && D1.state.archiveSelected.length ? '<button class="button button-primary" data-action="archive-download">确认下载</button>' : ''}${selectable ? '<button class="button button-secondary" data-action="archive-cancel">取消</button>' : '<button class="button button-secondary" data-action="archive-batch">批量下载</button>'}</span></div>
    ${groups.map(g => `<section class="agreement-group"><header class="agreement-group-header"><strong>${g[0]}（${g[1].length}份）</strong></header><div class="agreement-grid">${g[1].map(n => `<label class="agreement-cell"><input type="checkbox" data-agreement-check="${n}" ${D1.state.archiveSelected.includes(n) ? 'checked' : ''}> ${n}</label>`).join('')}</div></section>`).join('')}`;
  return D1.cspShell('archive', content);
};

D1.renderOmpList = function () {
  const currentStatus = D1.state.signed && D1.state.signType === 'open' ? '已完成' : D1.state.openApproval;
  const statusClass = currentStatus === '已完成' ? 'status-success' : currentStatus === '审批驳回' ? 'status-danger' : 'status-warning';
  const statusText = currentStatus === '审批驳回' ? '审核驳回待处理' : currentStatus;
  const rows = [
    ['1', '2026-11-23<br>10:28:54', '2026-11-23<br>11:20:10', '若竹', D1.ORG, '99751919', '产品开通', `<span class="status-pill ${statusClass}">${statusText}</span>`, '', '<button class="link" data-action="omp-detail">详情</button>'],
    ['2', '2025-11-13<br>16:42:18', '2025-11-13<br>16:41:36', '怼怼', '曹县億柯凯瑞箱包店-066', '59373123', '产品开通', '<span class="status-pill status-success">已完成</span>', '', '<button class="link" data-action="omp-detail">详情</button>'],
    ['3', '2025-11-13<br>10:36:32', '2025-11-13<br>10:37:21', '燚燚', '曹县億柯凯瑞箱包店-y02', '86357747', '产品开通', '<span class="status-pill status-warning">待负责人审批</span>', '', '<button class="link" data-action="omp-detail">详情</button> <button class="link" data-action="close-order">关闭</button>'],
    ['4', '2025-06-26<br>15:46:27', '2025-06-26<br>15:47:03', '测试-BD1', '天津晋堃煤焦储运有限责任公司', '94660881', '产品开通', '<span class="status-pill status-warning">待签约</span>', '', '<button class="link" data-action="omp-detail">详情</button> <button class="link" data-action="close-order">关闭</button>'],
    ['5', '2025-06-20<br>11:35:39', '2025-06-20<br>11:36:10', '怼怼', '曹县億柯凯瑞箱包店dl1102', '57400750', '产品开通', '<span class="status-pill status-neutral">已关闭</span>', '', '<button class="link" data-action="omp-detail">详情</button>'],
    ['6', '2025-05-14<br>20:25:25', '2025-05-14<br>20:27:02', '测试-BD1', '曹县億柯凯瑞箱包店dl1102', '92937419', '产品开通', '<span class="status-pill status-success">已完成</span>', '', '<button class="link" data-action="omp-detail">详情</button>'],
    ['7', '2025-05-14<br>20:04:26', '2025-05-14<br>20:06:18', '测试-BD1', '曹县億柯凯瑞箱包店dl1104', '52669549', '产品开通', '<span class="status-pill status-danger">审核驳回待处理</span>', '', '<button class="link" data-action="omp-detail">详情</button> <button class="link" data-action="close-order">关闭</button>'],
    ['8', '2025-05-14<br>18:08:54', '2025-05-14<br>18:11:10', '测试-BD1', '曹县億柯凯瑞箱包店dl1104', '19495661', '产品开通', '<span class="status-pill status-danger">审核驳回待处理</span>', '', '<button class="link" data-action="omp-detail">详情</button> <button class="link" data-action="close-order">关闭</button>']
  ];
  const filters = `<div class="omp-filter-grid">
    <label>申请时间：<input class="desktop-input" value="2025-04-20 ~ 2026-04-20" readonly></label>
    <label>注册名称：<input class="desktop-input" placeholder="请输入注册名称"></label>
    <label>业务经理：<input class="desktop-input" placeholder="请选择"></label>
    <label>申请状态：<select class="desktop-select"><option>请选择</option><option>已完成</option><option>待负责人审批</option><option>待签约</option><option>审核驳回待处理</option><option>已关闭</option></select></label>
    <label>风控抽检：<select class="desktop-select"><option>请选择</option><option>是</option><option>否</option></select></label>
    <label>机构编号：<input class="desktop-input" placeholder="请输入机构编号"></label>
    <label>是否申请微信渠道号：<select class="desktop-select"><option>是</option><option>否</option></select></label>
    <label>申请类型：<select class="desktop-select"><option>请选择</option><option>产品开通</option><option>费率信息变更</option></select></label>
  </div>
  <div class="omp-filter-actions"><button class="button button-secondary" data-action="omp-export" data-name="列表导出">列表导出</button><button class="button button-secondary" data-action="omp-export" data-name="渠道号申请导出">渠道号申请导出</button><button class="button button-secondary" data-action="omp-export" data-name="批量下载协议">批量下载协议</button><span style="flex:1"></span><button class="button button-secondary" data-action="omp-reset">重置</button><button class="button button-primary" data-action="omp-query">查询</button></div>`;
  const table = `<div class="desktop-table-wrap"><table class="desktop-table"><thead><tr><th>序号</th><th>申请时间</th><th>更新时间</th><th>业务经理</th><th>注册名称</th><th>机构编号</th><th>申请类型</th><th>申请状态</th><th>风控抽检</th><th>操作</th></tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="omp-table-foot">共 8 条</div>`;
  const content = `<div class="desktop-breadcrumb">机构管理 <span>›</span> <strong>机构签约管理</strong></div>
    <section class="desktop-card">${filters}</section>
    <section class="desktop-card">${table}</section>`;
  return D1.ompShell('机构签约管理', content);
};

D1.ompDetail = function () {
  const names = D1.openProducts();
  const sections = D1.signProductSections(names, 'open');
  const agreements = D1.openAgreementNames(names).map(n => `《${n}》`).join('、');
  D1.modal('产品开通详情', `<div class="omp-detail-head"><div>机构名称：${D1.ORG}</div><div>机构ID：99751919</div><div>合作经理：若竹</div></div>
    <div class="omp-detail-sub">申请类型：产品开通 · 本次开通：${names.join('、')}</div>
    <div class="omp-sign-data">${sections}</div>
    <div class="omp-detail-sub" style="margin-top:14px">签约协议：<span class="link">${agreements}</span></div>`, `<button class="button button-primary" data-action="close-modal">确定</button>`, 'modal-lg');
};

D1.renderOmpRate = function () {
  const fee = D1.currentFee();
  const names = D1.signProducts();
  const rows = [];
  names.forEach(name => {
    if (name === 'D+1结算') {
      rows.push(`<tr><td><strong>D+1结算手续费</strong><br><small style="color:#96a1af">次自然日结算</small></td><td><div class="permission-cell"><span class="permission-icon">✓</span><span class="status-pill status-success">已开通</span></div></td><td>${fee.chargeType}</td><td>${fee.rateType || '—'}</td><td><strong style="color:#246bfe">${D1.feeText(fee)}</strong></td><td>${['笔笔收', '节假日收'].includes(fee.chargeType) ? fee.min || '未配置' : '—'}</td><td>${['笔笔收', '节假日收'].includes(fee.chargeType) ? fee.max || '未配置' : '—'}</td><td>2026-11-23 11:20</td><td><button class="link" data-action="rate-history">查看历史</button></td></tr>`);
      return;
    }
    const schema = D1.PRODUCT_SCHEMA[name];
    const productFee = D1.productFee(name);
    schema.groups.forEach(g => g.fields.forEach(f => {
      const label = g.sub ? `${g.sub} ${f.label}` : f.label;
      const value = D1.formatFeeNumber(productFee[f.key]);
      const display = value ? `${value}${f.unit === '%' ? '%' : ` ${f.unit}`}` : '—';
      rows.push(`<tr><td><strong>${name}</strong><br><small style="color:#96a1af">${label}</small></td><td><div class="permission-cell"><span class="permission-icon">✓</span><span class="status-pill status-success">已开通</span></div></td><td>—</td><td>${f.unit === '%' ? '百分比' : '固定值'}</td><td><strong style="color:#246bfe">${display}</strong></td><td>—</td><td>—</td><td>2026-11-23 11:20</td><td>—</td></tr>`);
    }));
  });
  const rateTitle = names.length > 1 || names[0] !== 'D+1结算' ? '产品签约费率' : '结算产品签约费率';
  const historyBtn = names.includes('D+1结算') ? '<button class="button button-secondary" data-action="rate-history">历史配置记录</button>' : '';
  const content = `<div class="desktop-page-title"><div><h2>机构详情</h2><p>机构编号：99751919</p></div><button class="button button-secondary" data-go="omp-order">查看工单</button></div>
    <section class="desktop-card"><nav class="inner-tabs">${['费率信息', '公共参数', '特殊费率', '秘钥管理', '接口权限', '渠道参数', '分润配置', '实名及活动', '分账配置', '进件机构默认费率'].map((t, i) => `<button class="inner-tab ${i === 0 ? 'active' : ''}">${t}</button>`).join('')}</nav><div class="desktop-card-title"><h3>${rateTitle}</h3>${historyBtn}</div><div class="desktop-table-wrap"><table class="desktop-table"><thead><tr><th>产品名称</th><th>产品权限</th><th>收费方式</th><th>费率类型</th><th>签约费率</th><th>保底（元）</th><th>封顶（元）</th><th>生效时间</th><th>操作</th></tr></thead><tbody>${rows.join('')}</tbody></table></div><div class="table-footnote">${D1.icon('info')}产品权限与是否收费分别判断；机构签约费率不等同于商户实际收费费率。</div></section>`;
  return D1.ompShell('合作机构管理', content);
};

D1.renderOmpOrder = function () {
  const failed = D1.state.configFailed;
  const isChange = D1.state.signType === 'change';
  const fee = D1.currentFee();
  const names = D1.signProducts();
  const sections = D1.signProductSections(names);
  const configs = names.flatMap(name => {
    const label = name === 'D+1结算' ? 'D+1' : name;
    const summary = name === 'D+1结算' ? `${fee.chargeType} · ${fee.rateType || '—'} · ${D1.feeText(fee)}` : '已按本次签约费率配置';
    return [[`${label} 产品权限`, '已开通', false], [`${label} 签约费率`, summary, false]];
  });
  configs.push(['机构成本', failed ? '配置服务暂不可用，请重试' : '按已确认成本配置完成', failed]);
  configs.push(['协议归档', isChange ? 'D+1结算产品补充协议' : D1.openAgreementNames(names).join('、'), false]);
  const content = `<div class="desktop-breadcrumb">机构签约管理 <span>›</span> <strong>产品开通详情</strong></div><section class="desktop-card"><div class="omp-detail-head"><div>机构名称：${D1.ORG}</div><div>机构ID：99751919</div><div>合作经理：若竹</div></div><div class="omp-detail-sub">申请类型：${isChange ? '费率信息变更' : '产品开通'} · 本次${isChange ? '变更' : '开通'}：${names.join('、')} · <span class="${failed ? 'text-danger' : 'text-success'}">${failed ? '部分配置失败' : '工单已完成'}</span></div><div class="omp-sign-data">${sections}</div></section>
    <section class="desktop-card"><div class="desktop-card-title"><h3>自动配置明细</h3><button class="button button-secondary" data-action="refresh-config">重新查询</button></div><div class="config-list">${configs.map(c => `<div class="config-row ${c[2] ? 'failed' : ''}"><span class="config-status-icon">${c[2] ? '!' : '✓'}</span><div class="config-row-content"><strong>${c[0]}</strong><p>${c[1]}</p></div>${c[2] ? '<button class="button button-primary" data-action="retry-config">重试</button>' : '<span class="status-pill status-success">配置成功</span>'}<time class="config-time">2026-11-23 11:20</time></div>`).join('')}</div><div class="table-footnote">${D1.icon('info')}配置失败不改变签约事实；重试仅处理失败项，已成功配置不重复覆盖。</div></section>`;
  return D1.ompShell('机构签约管理', content);
};

D1.desktopRenderers = {
  'csp-sign': D1.renderCspMessage,
  'csp-agreement': D1.renderCspSign,
  'csp-complete': D1.renderCspComplete,
  'csp-archive': D1.renderCspArchive,
  'omp-list': D1.renderOmpList,
  'omp-rate': D1.renderOmpRate,
  'omp-order': D1.renderOmpOrder
};
