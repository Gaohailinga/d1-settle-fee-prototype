window.D1 = window.D1 || {};

D1.renderNav = function () {
  const nav = document.getElementById('prototype-nav');
  nav.innerHTML = D1.routes.map(group => `<section class="nav-group"><div class="nav-group-title">${group.group}<span>${group.system}</span></div>${group.items.map(item => `<button class="nav-item ${D1.state.route === item[0] ? 'active' : ''}" data-go="${item[0]}">${D1.icon(item[2])}<span class="nav-item-label">${item[1]}</span>${item[0] === 'mobile-open' || item[0] === 'csp-sign' ? '<span class="nav-item-badge">核心</span>' : ''}</button>`).join('')}</section>`).join('');
};

D1.renderReview = function () {
  if (!D1.reviewMode) return;
  const meta = D1.meta[D1.state.route];
  document.getElementById('review-title').textContent = meta.title;
  document.getElementById('review-content').innerHTML = `<section class="review-section"><h3>页面规则</h3><ul class="review-list">${meta.notes.map(n => `<li>${n}</li>`).join('')}</ul></section><section class="review-section"><h3>评审提示</h3><div class="review-callout">${meta.callout}</div></section><section class="review-section"><h3>交互演示</h3><div class="review-demo">${meta.demos.map(d => `<button class="button button-secondary" data-action="${d[1]}">${d[0]}</button>`).join('')}</div></section>`;
};

D1.render = function () {
  const route = D1.state.route;
  const renderer = D1.mobileRenderers[route] || D1.desktopRenderers[route] || D1.mobileRenderers['mobile-entry'];
  const app = document.getElementById('app');
  if (app.contains(document.activeElement) && document.activeElement !== document.body) document.activeElement.blur();
  app.innerHTML = renderer();
  D1.renderNav();
  D1.renderReview();
  document.title = `${D1.meta[route].title}｜D+1 产品开通原型`;
  if (location.hash !== `#${route}`) history.replaceState(null, '', `#${route}`);
};

D1.go = function (route) {
  if (!D1.meta[route]) return;
  if (route === 'csp-complete') D1.state.signed = true;
  D1.state.route = route;
  D1.closeModal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  D1.render();
};

D1.toast = function (message, type = 'success') {
  const region = document.getElementById('toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
};

D1.modal = function (title, body, footer = '', size = '') {
  const head = title !== null ? `<header class="modal-header"><h3>${title}</h3><button class="modal-close" data-action="close-modal" aria-label="关闭">×</button></header>` : '';
  document.getElementById('modal-root').innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal ${size}" role="dialog" aria-modal="true" aria-label="${title || '对话框'}">${head}<div class="modal-body">${body}</div>${footer ? `<footer class="modal-footer">${footer}</footer>` : ''}</section></div>`;
};
D1.closeModal = function () { document.getElementById('modal-root').innerHTML = ''; };

D1.validateFee = function (kind, opts = {}) {
  return D1.validateFeeObject(D1.state[kind], kind, { redLine: true, ...opts });
};

/* 通用费率校验：收费方式必填；仅笔笔收/节假日收校验费率类型、费率值；
   费率值不可为 0 且不可低于代理成本；保底/封顶允许 0（表示未设置），两个非零值同时填写时保底不得高于封顶 */
D1.validateFeeObject = function (fee, prefix, opts = {}) {
  let valid = true;
  if (!opts.keepErrors) document.querySelectorAll('[data-field]').forEach(el => el.classList.remove('has-error'));
  const error = (field, message) => {
    valid = false;
    const wrapper = document.querySelector(`[data-field="${prefix}-${field}"]`);
    if (wrapper) wrapper.classList.add('has-error');
    if (message) { const node = wrapper?.querySelector('.form-error'); if (node) node.textContent = message; }
  };
  const charging = ['笔笔收', '节假日收'].includes(fee.chargeType);
  if (!['不收费', '笔笔收', '节假日收'].includes(fee.chargeType)) error('charge', '请选择收费方式');
  if (charging) {
    if (!['固定值', '百分比'].includes(fee.rateType)) error('type', '请选择费率类型');
    if (['固定值', '百分比'].includes(fee.rateType)) {
      const decimals = fee.rateType === '百分比' ? 4 : 2;
      const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
      if (!fee.rate || !pattern.test(fee.rate) || Number(fee.rate) <= 0) error('rate', '');
      if (fee.rateType === '百分比' && Number(fee.rate) < 0.2) error('rate', '费率值低于成本，请核实后配置！');
    }
    const moneyPattern = /^\d+(?:\.\d{1,2})?$/;
    if (fee.min && (!moneyPattern.test(fee.min) || Number(fee.min) < 0)) error('min', '保底费率须不小于 0 且最多两位小数');
    if (fee.max && (!moneyPattern.test(fee.max) || Number(fee.max) < 0)) error('max', '封顶费率须不小于 0 且最多两位小数');
    if (Number(fee.min) > 0 && Number(fee.max) > 0 && moneyPattern.test(fee.min) && moneyPattern.test(fee.max) && Number(fee.min) > Number(fee.max)) error('min', '保底费率不能高于封顶费率');
  }
  if (!valid && !opts.silent) D1.toast('请检查标红字段后再提交', 'error');
  return valid;
};

/* 按各产品 schema 校验字段：必填、数值、小数位（% 4 位、元 2 位），允许 0 */
D1.validateSchemaProduct = function (name, opts = {}) {
  const schema = D1.PRODUCT_SCHEMA[name];
  const fee = D1.productFee(name);
  let valid = true;
  const error = (field, message) => {
    valid = false;
    const wrapper = document.querySelector(`[data-field="pf-${name}-${field}"]`);
    if (wrapper) wrapper.classList.add('has-error');
    if (message) { const node = wrapper?.querySelector('.form-error'); if (node) node.textContent = message; }
  };
  schema.groups.forEach(g => g.fields.forEach(f => {
    const value = fee[f.key];
    const decimals = f.unit === '%' ? 4 : 2;
    const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
    if (value === '' || value === undefined || !pattern.test(value)) error(f.key, `请输入${f.label}（最多 ${decimals} 位小数）`);
  }));
  if (!valid && !opts.silent) D1.toast('请检查标红字段后再提交', 'error');
  return valid;
};

/* 低费率弹层状态：redlineFor 记录产品名，redlineKind 记录来源表单（open/change） */
D1.showRedlineSheet = function (name, kind) {
  D1.state.redlineFor = name;
  D1.state.redlineKind = kind;
  D1.render();
};

D1.submitFee = function (kind) {
  if (kind === 'open') {
    if (!D1.state.products.length) return D1.toast('请勾选本次要开通的产品', 'error');
    document.querySelectorAll('[data-field]').forEach(el => el.classList.remove('has-error'));
    let valid = true;
    D1.state.products.forEach(name => {
      const ok = name === 'D+1结算'
        ? D1.validateFeeObject(D1.state.open, 'open', { redLine: false, keepErrors: true, silent: true })
        : D1.validateSchemaProduct(name, { keepErrors: true, silent: true });
      if (!ok) valid = false;
    });
    if (!valid) return D1.toast('请检查标红字段后再提交', 'error');
    /* 红线校验：任一选中产品存在低于红线的费率且未上传审批截图时，弹出审批材料弹层 */
    for (const name of D1.state.products) {
      const fee = D1.productFee(name);
      let low;
      if (name === 'D+1结算') {
        const d1 = D1.state.open;
        const charging = ['笔笔收', '节假日收'].includes(d1.chargeType);
        low = charging && d1.rate && Number(d1.rate) < 0.25 ? [{ label: D1.d1RateLabel(d1), value: D1.formatFeeNumber(d1.rate) }] : [];
      } else low = D1.lowRateFields(name);
      if (low.length && !fee.material) return D1.showRedlineSheet(name, kind);
    }
  } else if (!D1.validateFee(kind)) return;
  if (kind === 'change') {
    const fee = D1.state.change;
    const low = ['笔笔收', '节假日收'].includes(fee.chargeType) && fee.rate && Number(fee.rate) < 0.25;
    if (low && !fee.material) return D1.showRedlineSheet('D+1结算', kind);
  }
  const isOpen = kind === 'open';
  D1.state[isOpen ? 'openApproval' : 'changeApproval'] = '待负责人审批';
  D1.toast('提交成功，工单已进入负责人审批');
  setTimeout(() => D1.go(isOpen ? 'mobile-open-approval' : 'mobile-change-approval'), 250);
};

D1.showPendingOrder = function () {
  D1.modal('暂不能发起申请', `<div class="modal-message"><div class="modal-message-icon">!</div><div><strong>当前机构存在未完结的 D+1 工单</strong><p>产品开通工单正在等待负责人审批。为避免重复申请，请待当前工单完结后再发起。</p></div></div><div class="modal-detail"><div class="modal-detail-row"><span>工单类型</span><strong>产品开通</strong></div><div class="modal-detail-row"><span>当前状态</span><strong>待负责人审批</strong></div></div>`, `<button class="button button-secondary" data-action="close-modal">我知道了</button><button class="button button-primary" data-go="mobile-open-approval">查看当前工单</button>`, 'modal-sm');
};

D1.rejectApproval = function (kind) {
  D1.modal('驳回申请', `<div class="modal-message"><div class="modal-message-icon">!</div><div><strong>确认驳回本次${kind === 'open' ? '产品开通' : '费率变更'}申请？</strong><p>驳回后原生效配置不变，BD 可修改后重新提交。</p></div></div><div class="modal-field"><label class="required">驳回原因</label><textarea class="desktop-textarea" id="reject-reason" placeholder="请填写具体驳回原因">请补充低费率审批材料后重新提交。</textarea></div>`, `<button class="button button-secondary" data-action="close-modal">取消</button><button class="button button-danger" data-action="confirm-reject" data-kind="${kind}">确认驳回</button>`, 'modal-sm');
};

D1.approve = function (kind) {
  D1.state[kind === 'open' ? 'openApproval' : 'changeApproval'] = '待签约';
  D1.state.signType = kind;
  D1.toast('审批通过，工单已转入待签约');
  D1.render();
  setTimeout(() => D1.go('csp-sign'), 450);
  // 消息详情中的「点击查看」进入独立签约页
};

D1.startSign = function () {
  if (D1.state.signType === 'change') {
    D1.modal('费率变更提醒', `<div class="modal-message"><div class="modal-message-icon">!</div><div><strong>下级机构与商户费率不会自动更新</strong><p>签约完成后，系统自动更新一级机构相关产品费率，其下级机构和商户的相关产品费率不会自动更新。若需更新，请人工手动处理。</p></div></div>`, `<button class="button button-secondary" data-action="close-modal">取消</button><button class="button button-primary" data-action="continue-sign">已知晓，继续签约</button>`);
  } else D1.showSignConfirm();
};

D1.showSignConfirm = function () {
  // 测试环境：无标题栏 + 右上角关闭 X，红色圆形感叹号图标提示 + 右下蓝色实心「已完成签约」按钮
  D1.modal(null, `<button class="modal-x" data-action="close-modal" aria-label="关闭">×</button><div class="sign-confirm-tip"><span class="sign-confirm-icon">!</span>请在新打开的页面中完成签约，并确认签约结果</div>`, `<button class="button button-primary" data-action="confirm-signed">已完成签约</button>`, 'modal-sign-confirm');
};

D1.viewAgreement = function (name = 'D+1 结算产品补充协议') {
  D1.modal(name, `<article class="agreement-document"><h2>${name}</h2><p>甲方：宁乡市云溪餐饮有限公司</p><p>乙方：随行付支付有限公司</p><h4>结算服务</h4><p>双方就 D+1 结算产品的开通、服务费率及相关服务事项达成本补充协议。结算时间为次自然日结算。</p><h4>费用约定</h4><p>具体收费方式、费率类型、签约费率、保底和封顶以本协议签署页所载信息为准。产品权限与手续费配置分别生效。</p><h4>协议效力</h4><p>本协议经双方电子签署后生效，未尽事宜按双方已签署的基础合作协议执行。</p><div class="agreement-document-seal">电子签署<br>演示文件</div></article>`, `<button class="button button-secondary" data-action="close-modal">关闭</button><button class="button button-primary" data-action="download-agreement" data-name="${name}">下载协议</button>`, 'modal-lg');
};

D1.rateHistory = function () {
  const fee = D1.currentFee();
  D1.modal('D+1 历史配置记录', `<div class="desktop-table-wrap"><table class="desktop-table"><thead><tr><th>生效时间</th><th>收费方式</th><th>费率类型</th><th>签约费率</th><th>状态</th></tr></thead><tbody><tr><td>2026-11-23 11:20</td><td>${fee.chargeType}</td><td>${fee.rateType}</td><td>${D1.feeText(fee)}</td><td><span class="status-pill status-success">生效中</span></td></tr><tr><td>2026-10-18 09:30</td><td>笔笔收</td><td>百分比</td><td>0.38%</td><td><span class="status-pill status-neutral">已作废</span></td></tr></tbody></table></div><div class="table-footnote">${D1.icon('info')}历史记录仅用于查询，不允许修改或删除。</div>`, `<button class="button button-primary" data-action="close-modal">关闭</button>`, 'modal-lg');
};

D1.reviewDemo = function (action) {
  const fee = D1.state.open;
  const change = D1.state.change;
  const demos = {
    'demo-pending-order': D1.showPendingOrder,
    'demo-percent': () => { Object.assign(fee, { chargeType: '笔笔收', rateType: '百分比', rate: '0.38', min: '0.10', max: '5.00' }); D1.render(); },
    'demo-fixed': () => { Object.assign(fee, { chargeType: '笔笔收', rateType: '固定值', rate: '1.00' }); D1.render(); },
    'demo-no-charge': () => { Object.assign(fee, { chargeType: '不收费', rateType: '', rate: '0', min: '0', max: '0' }); D1.render(); },
    'demo-low-cost': () => { Object.assign(fee, { chargeType: '笔笔收', rateType: '百分比', rate: '0.10' }); D1.render(); D1.toast('已填入低于演示代理成本的费率，请点击提交查看校验', 'warning'); },
    'demo-low-redline': () => {
      Object.assign(fee, { chargeType: '笔笔收', rateType: '百分比', rate: '0.22', material: false });
      D1.state.products = [...new Set([...D1.state.products, 'D+1结算'])];
      D1.showRedlineSheet('D+1结算', 'open');
    },
    'demo-change-empty': () => { Object.assign(change, { chargeType: '不收费', rateType: '', rate: '0', min: '0', max: '0' }); D1.render(); },
    'demo-limit-error': () => { Object.assign(change, { chargeType: '笔笔收', rateType: '百分比', rate: '0.45', min: '9.00', max: '8.00', material: true }); D1.render(); D1.toast('已填入保底高于封顶的数据，请点击提交查看校验', 'warning'); },
    'demo-change-low-redline': () => {
      Object.assign(change, { chargeType: '笔笔收', rateType: '百分比', rate: '0.22', material: false });
      D1.showRedlineSheet('D+1结算', 'change');
    },
    'approve-open': () => D1.approve('open'),
    'approve-change': () => D1.approve('change'),
    'reject-open': () => D1.rejectApproval('open'),
    'reject-change': () => D1.rejectApproval('change'),
    'demo-sign-open': () => { D1.state.signType = 'open'; D1.render(); D1.toast('已切换为产品开通签约'); },
    'demo-sign-change': () => { D1.state.signType = 'change'; D1.render(); D1.toast('已切换为费率变更签约'); },
    'go-omp-order': () => D1.go('omp-order'),
    'go-csp-archive': () => D1.go('csp-archive'),
    'demo-archive-batch': () => { D1.state.archiveMode = true; D1.render(); },
    'demo-archive-collapse': () => { D1.state.archiveCollapsed['补充协议'] = !D1.state.archiveCollapsed['补充协议']; D1.render(); },
    'demo-rate-history': D1.rateHistory,
    'demo-omp-percent': () => { D1.render(); },
    'demo-config-fail': () => { D1.state.configFailed = true; D1.render(); D1.toast('已模拟机构成本配置失败', 'warning'); },
    'demo-config-retry': () => { D1.state.configFailed = false; D1.render(); D1.toast('失败配置项已重试成功'); }
  };
  if (demos[action]) demos[action]();
};

D1.handleAction = function (action, el) {
  const kind = el.dataset.kind;
  const simple = {
    'close-modal': D1.closeModal,
    'standard-product': () => D1.toast('该入口为原系统既有功能，本次仅演示 D+1 结算流程'),
    'omp-detail': D1.ompDetail,
    'omp-query': () => D1.toast('查询条件已应用'),
    'omp-reset': () => {
      const filters = document.querySelector('.omp-filter-grid');
      if (!filters) return;
      filters.querySelectorAll('input').forEach((input, index) => { input.value = index === 0 ? '2025-04-20 ~ 2026-04-20' : ''; });
      filters.querySelectorAll('select').forEach(select => { select.selectedIndex = 0; });
      D1.toast('查询条件已重置');
    },
    'omp-export': () => D1.toast(`已生成${el.dataset.name || '导出文件'}，请在下载中心查看`),
    'close-order': () => D1.toast('原系统关闭工单流程不在本次演示范围内'),
    'open-order': () => D1.go(el.dataset.orderType || 'mobile-open-approval'),
    'submit-fee': () => D1.submitFee(kind),
    'save-draft': () => D1.toast('草稿已保存'),
    'upload-material': () => { D1.state[kind].material = true; D1.render(); D1.toast('审批材料已上传'); },
    'remove-material': () => { D1.state[kind].material = false; D1.render(); },
    'upload-pfee-material': () => {
      const name = el.dataset.name;
      const fee = name === 'D+1结算' ? D1.state[D1.state.redlineKind || 'open'] : D1.productFee(name);
      fee.material = true;
      D1.render();
      D1.toast('审批邮件截图已上传');
    },
    'remove-pfee-material': () => {
      const name = el.dataset.name;
      const fee = name === 'D+1结算' ? D1.state[D1.state.redlineKind || 'open'] : D1.productFee(name);
      fee.material = false;
      D1.render();
    },
    'redline-cancel': () => { D1.state.redlineFor = ''; D1.state.redlineKind = ''; D1.render(); },
    'redline-backdrop': () => {
      if (event.target !== el) return;
      D1.state.redlineFor = ''; D1.state.redlineKind = ''; D1.render();
    },
    'redline-confirm': () => {
      const name = el.dataset.name;
      const fee = name === 'D+1结算' ? D1.state[D1.state.redlineKind || 'open'] : D1.productFee(name);
      if (!fee.material) return D1.toast('请先上传审批邮件截图', 'error');
      const kind = D1.state.redlineKind;
      D1.state.redlineFor = '';
      D1.state.redlineKind = '';
      D1.submitFee(kind);
    },
    'approve': () => D1.approve(kind),
    'reject-approval': () => D1.rejectApproval(kind),
    'confirm-reject': () => { const reason = document.getElementById('reject-reason').value.trim(); if (!reason) return D1.toast('请填写驳回原因', 'error'); D1.state.rejectReason = reason; D1.state[kind === 'open' ? 'openApproval' : 'changeApproval'] = '审批驳回'; D1.closeModal(); D1.render(); D1.toast('申请已驳回', 'warning'); },
    'resubmit': () => D1.go(kind === 'open' ? 'mobile-open' : 'mobile-change'),
    'go-sign': () => { D1.state.signType = kind; D1.go('csp-sign'); },
    'start-sign': D1.startSign,
    'continue-sign': D1.showSignConfirm,
    'confirm-signed': () => { D1.state.signed = true; D1.toast('签约结果查询成功'); D1.go('csp-complete'); },
    'simulate-signing': () => D1.toast('尚未完成签约，请在新打开的页面中完成签约！', 'error'),
    'save-sign-later': () => { D1.closeModal(); D1.toast('签约任务已保留在消息中心'); },
    'view-agreement': () => D1.viewAgreement(el.dataset.name),
    'download-agreement': () => D1.toast(`已开始下载：${el.dataset.name || 'D+1 结算产品补充协议'}`),
    'archive-batch': () => { D1.state.archiveMode = true; D1.state.archiveSelected = []; D1.render(); },
    'archive-cancel': () => { D1.state.archiveMode = false; D1.state.archiveSelected = []; D1.render(); },
    'archive-download': () => { const count = D1.state.archiveSelected.length; if (!count) return; D1.state.archiveMode = false; D1.state.archiveSelected = []; D1.render(); D1.toast(`已开始下载 ${count} 份协议`); },
    'toggle-agreement-group': () => { const group = el.dataset.group; D1.state.archiveCollapsed[group] = !D1.state.archiveCollapsed[group]; D1.render(); },
    'rate-history': D1.rateHistory,
    'refresh-config': () => D1.toast('配置结果已刷新'),
    'retry-config': () => { el.innerHTML = '<span class="loading-spinner"></span> 重试中'; el.disabled = true; setTimeout(() => { D1.state.configFailed = false; D1.render(); D1.toast('失败配置项重试成功，其余配置未重复执行'); }, 700); }
  };
  if (simple[action]) simple[action]();
  else D1.reviewDemo(action);
};

document.addEventListener('click', event => {
  const go = event.target.closest('[data-go]');
  if (go) { event.preventDefault(); D1.go(go.dataset.go); return; }
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'backdrop-close' && event.target !== el) return;
  if (action === 'backdrop-close') return D1.closeModal();
  D1.handleAction(action, el);
});

document.addEventListener('change', event => {
  const el = event.target;
  if (el.matches('[data-product]')) {
    const name = el.dataset.product;
    D1.state.products = el.checked ? [...new Set([...D1.state.products, name])] : D1.state.products.filter(n => n !== name);
    D1.render();
    return;
  }
  if (el.matches('[data-fee-kind][data-fee-key]')) {
    const fee = D1.state[el.dataset.feeKind];
    fee[el.dataset.feeKey] = el.value;
    if (el.dataset.feeKey === 'rateType') {
      /* 切换费率类型时恢复默认值，避免遗留旧单位数据 */
      fee.rate = '0'; fee.min = '0'; fee.max = '0'; fee.material = false;
    }
    if (el.tagName === 'SELECT') D1.render();
  }
  if (el.matches('[data-pfee-name][data-pfee-key]')) {
    D1.productFee(el.dataset.pfeeName)[el.dataset.pfeeKey] = el.value;
    if (el.tagName === 'SELECT') D1.render();
  }
  if (el.matches('[data-agreement-check]')) {
    const name = el.dataset.agreementCheck;
    D1.state.archiveSelected = el.checked ? [...new Set([...D1.state.archiveSelected, name])] : D1.state.archiveSelected.filter(n => n !== name);
    D1.render();
  }
  if (el.matches('[data-action="archive-select-all"]')) {
    const checks = [...document.querySelectorAll('[data-agreement-check]')].map(n => n.dataset.agreementCheck);
    D1.state.archiveSelected = el.checked ? [...new Set([...D1.state.archiveSelected, ...checks])] : D1.state.archiveSelected.filter(n => !checks.includes(n));
    D1.render();
  }
});

document.addEventListener('input', event => {
  const el = event.target;
  if (el.matches('input[data-fee-kind][data-fee-key]')) D1.state[el.dataset.feeKind][el.dataset.feeKey] = el.value;
  if (el.matches('input[data-pfee-name][data-pfee-key]')) D1.productFee(el.dataset.pfeeName)[el.dataset.pfeeKey] = el.value;
});

document.getElementById('demo-toggle').addEventListener('click', () => {
  const panel = document.getElementById('demo-panel');
  panel.hidden = !panel.hidden;
  document.getElementById('demo-toggle').setAttribute('aria-expanded', String(!panel.hidden));
});

document.getElementById('reset-demo').addEventListener('click', () => {
  const route = D1.state.route;
  Object.assign(D1.state, {
    products: ['D+1结算'],
    productFees: {},
    open: { chargeType: '不收费', rateType: '', rate: '0', min: '0', max: '0', material: false },
    change: { chargeType: '笔笔收', rateType: '', rate: '0', min: '0', max: '0', material: false },
    openApproval: '待负责人审批', changeApproval: '待负责人审批', signType: 'open', signed: false,
    archiveMode: false, archiveSelected: [], archiveCollapsed: {}, configFailed: false, redlineFor: '', redlineKind: '', rejectReason: '', route
  });
  D1.closeModal(); D1.render(); D1.toast('演示数据已重置');
});

if (D1.reviewMode) {
  const toggleNotes = open => { document.body.classList.toggle('notes-open', open); document.getElementById('toggle-notes').setAttribute('aria-expanded', String(open)); };
  document.getElementById('toggle-notes').addEventListener('click', () => toggleNotes(!document.body.classList.contains('notes-open')));
  document.getElementById('close-notes').addEventListener('click', () => toggleNotes(false));
}

document.addEventListener('keydown', event => { if (event.key === 'Escape') D1.closeModal(); });
window.addEventListener('hashchange', () => {
  const route = location.hash.slice(1);
  if (!D1.meta[route]) { D1.go('mobile-entry'); return; }
  if (route !== D1.state.route) { D1.state.route = route; D1.closeModal(); window.scrollTo({ top: 0 }); D1.render(); }
});
const initialRoute = location.hash.slice(1);
if (D1.meta[initialRoute]) D1.state.route = initialRoute;
D1.render();
