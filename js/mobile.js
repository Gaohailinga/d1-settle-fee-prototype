window.D1 = window.D1 || {};

/* 与原掌中宝一致：状态栏 + 机构名导航 + 内容 + 底部通栏按钮 */
D1.phone = function (title, body, footer = '', backRoute = 'mobile-entry') {
  return `<div class="mobile-canvas"><section class="phone ${footer ? '' : 'no-footer'}" aria-label="掌中宝 ${title}">
    <div class="phone-status"><span>2:06</span><div class="phone-status-icons"><span class="signal"><i></i><i></i><i></i><i></i></span><span>5G</span><span class="battery"></span></div></div>
    <header class="phone-nav"><button class="phone-back" data-go="${backRoute}" aria-label="返回">‹</button><h2>${title}</h2></header>
    <div class="phone-body">${body}</div>
    ${footer ? `<footer class="phone-footer">${footer}</footer>` : ''}
  </section></div>`;
};

D1.ORG = '生产测试代理商111';

/* 测试环境步骤条：BD提交 ——> 负责人审核 ——> 机构签约（CSP），当前节点青色加粗 */
D1.mobileSteps = function (active = 0) {
  const steps = ['BD提交', '负责人审核', '机构签约（CSP）'];
  const items = steps.map((t, i) => {
    const cls = i < active ? 'done' : i === active ? 'active' : '';
    const arr = i < steps.length - 1 ? `<i class="std-step-arr ${i < active ? 'done' : ''}"></i>` : '';
    return `<span class="std-step ${cls}">${t}</span>${arr}`;
  });
  return `<div class="std-steps">${items.join('')}</div>`;
};

/* 半角括号标签：测试环境为「订单支付费率 (%)」版式 */
D1.hw = label => label.replace(/（([^）]*)）/g, ' ($1)');

D1.band = function (title, extra = '') {
  return `<div class="std-band"><span class="t">${title}</span>${extra ? `<span class="extra">${extra}</span>` : ''}</div>`;
};

D1.row = function (label, control, opts = {}) {
  const errorHtml = opts.error === undefined ? '' : `<div class="form-error">${opts.error || ''}</div>`;
  return `<div class="std-row ${opts.cls || ''}" ${opts.field ? `data-field="${opts.field}"` : ''}><span class="lab ${opts.req ? 'req' : ''}">${label}</span><div class="ctl">${control}</div>${errorHtml}</div>`;
};

/* ============ 功能开通入口（原 004 页 + 新增 D+1 行） ============ */
D1.renderMobileEntry = function () {
  const body = `<div class="std-entry-group">
      <button class="std-entry-row" data-go="mobile-open"><span class="t">产品开通</span><span class="d">外卡、翼支付、白条分期、订单支付、智慧营销、分账、银行账户（仅天阙非个代）</span><i class="arrow">›</i></button>
      <button class="std-entry-row" data-action="standard-product"><span class="t">D0产品开通</span><span class="d">D0提现-快速到账、D0自动-定时到账</span><i class="arrow">›</i></button>
      <button class="std-entry-row" data-action="standard-product"><span class="t">推荐权限开通</span><i class="arrow">›</i></button>
    </div>`;
  return D1.phone(D1.ORG, body, '', 'mobile-entry');
};

/* ============ D+1 结算费率表单 ============
   结算时间为枚举字段（下拉选项由 D1.SETTLE_TIME_OPTIONS 驱动），枚举值「次自然日结算」置灰不可选，下拉框置灰展示；
   收费方式默认不收费，含不收费/笔笔收/节假日收；
   收费方式与费率类型常显；D+1结算费、保底值、封顶值在选择完费率类型后展示，默认填充 0。 */
D1.feeRows = function (kind) {
  const fee = D1.state[kind];
  const percent = fee.rateType === '百分比';
  const fixed = fee.rateType === '固定值';
  const rateLabel = D1.d1RateLabel(fee);
  const settleOptions = D1.SETTLE_TIME_OPTIONS.map(v => `<option disabled ${fee.settleTime === v ? 'selected' : ''}>${v}</option>`).join('');
  const rateArea = `${D1.row(rateLabel, `<input class="std-input" id="${kind}-rate" data-fee-kind="${kind}" data-fee-key="rate" inputmode="decimal" value="${D1.escape(fee.rate)}" placeholder="请输入">`, { req: true, field: `${kind}-rate`, error: '' })}
    ${D1.row('D+1结算手续费保底值（元）', `<input class="std-input" id="${kind}-min" data-fee-kind="${kind}" data-fee-key="min" inputmode="decimal" value="${D1.escape(fee.min)}" placeholder="请输入">`, { field: `${kind}-min`, error: '保底费率不能为负数，且不能高于非零封顶费率' })}
    ${D1.row('D+1结算手续费封顶值（元）', `<input class="std-input" id="${kind}-max" data-fee-kind="${kind}" data-fee-key="max" inputmode="decimal" value="${D1.escape(fee.max)}" placeholder="请输入">`, { field: `${kind}-max`, error: '封顶费率不能为负数' })}`;
  return `<div class="std-form" data-fee-form="${kind}">
    ${D1.row('结算时间', `<select class="std-select std-select-disabled" id="${kind}-settle-time" data-fee-kind="${kind}" data-fee-key="settleTime" aria-label="结算时间" disabled>${settleOptions}</select>`)}
    ${D1.row('收费方式', `<select class="std-select" id="${kind}-charge" data-fee-kind="${kind}" data-fee-key="chargeType"><option ${fee.chargeType === '不收费' ? 'selected' : ''}>不收费</option><option ${fee.chargeType === '笔笔收' ? 'selected' : ''}>笔笔收</option><option ${fee.chargeType === '节假日收' ? 'selected' : ''}>节假日收</option></select>`, { req: true, field: `${kind}-charge`, error: '请选择收费方式' })}
    ${D1.row('费率类型', `<select class="std-select" id="${kind}-type" data-fee-kind="${kind}" data-fee-key="rateType"><option value="">请选择</option><option ${fixed ? 'selected' : ''}>固定值</option><option ${percent ? 'selected' : ''}>百分比</option></select>`, { req: true, field: `${kind}-type`, error: '请选择费率类型' })}
    ${fee.rateType ? rateArea : ''}
  </div>`;
};

/* 按原图渲染某产品的开通费率表单：字段完全由 PRODUCT_SCHEMA 决定，单位并入标签（如 EDC（%）） */
D1.productFeeRows = function (name) {
  const fee = D1.productFee(name);
  const schema = D1.PRODUCT_SCHEMA[name];
  if (!schema) return '';
  const groupsHtml = schema.groups.map(g => {
    const rows = g.fields.map(f => D1.row(
      `${f.label}（${f.unit}）`,
      `<input class="std-input" data-pfee-name="${name}" data-pfee-key="${f.key}" inputmode="decimal" value="${D1.escape(fee[f.key] ?? '')}" placeholder="请输入">`,
      { req: true, field: `pf-${name}-${f.key}`, error: `请输入${f.label}` }
    )).join('');
    if (!g.sub) return rows;
    return `<div class="std-sub ${g.collapse ? 'std-sub-collapse' : ''}"><div class="std-sub-t">${g.sub}${g.collapse ? '<span class="std-sub-q" title="特殊行业费率说明">?</span>' : ''}</div>${rows}</div>`;
  }).join('');
  return `<div class="std-form" data-pfee-form="${name}">${groupsHtml}</div>`;
};

/* 低于红线审批邮件截图弹窗：1:1 对齐参考图的白底圆角卡片、浅灰上传框、红色说明与双按钮 */
D1.redlineSheet = function (name, lowFields) {
  const kind = D1.state.redlineKind || 'open';
  const fee = name === 'D+1结算' ? D1.state[kind] : D1.productFee(name);
  return `<div class="std-redline-mask" data-action="redline-backdrop">
    <div class="std-redline-sheet" role="alertdialog" aria-modal="true" aria-labelledby="redline-title">
      <h3 class="std-redline-title" id="redline-title">以下费率低于限制，请提供审批邮件截图</h3>
      <div class="std-redline-rates">${lowFields.map(f => `<div class="std-redline-rate"><span class="rl-lab">${f.label}</span><span class="rl-line"></span><span class="rl-val">${f.value}</span></div>`).join('')}</div>
      <div class="std-redline-upload">
        ${fee.material
          ? `<div class="std-redline-file"><div class="std-redline-file-thumb"><span>已上传</span><strong>审批邮件截图</strong></div><button class="std-redline-file-name" data-action="remove-pfee-material" data-name="${name}" title="点击移除后重新上传">审批邮件截图.png <span>×</span></button></div>`
          : `<button class="std-redline-upbtn" data-action="upload-pfee-material" data-name="${name}" aria-label="点击上传审批邮件截图"><span class="plus">+</span><span>点击上传</span></button>`}
      </div>
      <div class="std-redline-note"><strong>注:</strong>负责人审核通过后将发送系统消息至[合作机构管理平台] 请提醒机构签署协议</div>
      <div class="std-redline-foot"><button class="std-redline-btn cancel" data-action="redline-cancel" data-name="${name}">取消</button><button class="std-redline-btn confirm" data-action="redline-confirm" data-name="${name}">上传并提交</button></div>
    </div>
  </div>`;
};

D1.renderMobileForm = function (kind) {
  const isOpen = kind === 'open';
  const products = D1.PRODUCTS;
  const productSection = `${D1.band('本次可申请开通产品', isOpen ? `已选 ${D1.state.products.length} 项` : '')}
    <div class="std-product-grid">${products.map(name => `<label class="std-product ${D1.state.products.includes(name) ? 'selected' : ''}"><input type="checkbox" data-product="${name}" ${D1.state.products.includes(name) ? 'checked' : ''}><span class="std-check"></span><span>${name}</span></label>`).join('')}</div>`;
  /* 多选兼容：按 D1.PRODUCTS 固定顺序渲染选中产品的费率区（外卡→翼支付→…→D+1） */
  const ordered = D1.PRODUCTS.filter(n => D1.state.products.includes(n));
  const feeSections = isOpen
    ? ordered.map(name => {
        if (name === 'D+1结算') {
          const fee = D1.state.open;
          const isD1Low = D1.state.redlineFor === 'D+1结算' && ['笔笔收', '节假日收'].includes(fee.chargeType) && fee.rate && Number(fee.rate) < 0.25;
          const d1Sheet = isD1Low ? D1.redlineSheet('D+1结算', [{ label: D1.d1RateLabel(fee), value: D1.formatFeeNumber(fee.rate) }]) : '';
          return `${D1.band('D+1结算')}${D1.feeRows('open')}${d1Sheet}`;
        }
        const schema = D1.PRODUCT_SCHEMA[name];
        const low = D1.state.redlineFor === name ? D1.lowRateFields(name) : [];
        const sheet = low.length ? D1.redlineSheet(name, low) : '';
        return `${D1.band(schema.band)}${D1.productFeeRows(name)}${sheet}`;
      }).join('')
    : `${D1.band('结算费率设置', '费率信息变更')}${(() => {
        const fee = D1.state.change;
        const isD1Low = D1.state.redlineFor === 'D+1结算' && ['笔笔收', '节假日收'].includes(fee.chargeType) && fee.rate && Number(fee.rate) < 0.25;
        const d1Sheet = isD1Low ? D1.redlineSheet('D+1结算', [{ label: D1.d1RateLabel(fee), value: D1.formatFeeNumber(fee.rate) }]) : '';
        return `${D1.feeRows(kind)}${d1Sheet}`;
      })()}`;
  const body = `${D1.mobileSteps(0)}
    ${isOpen ? productSection : `${D1.band('签约费率')}<div class="std-rate-tabs"><span>线下</span><span>线上</span><span>分账</span><span>外卡</span><span>翼支付</span><span>白条分期</span><span>D0结算</span><span class="active">D+1结算</span></div>`}
    ${feeSections}`;
  const footer = `<button class="std-foot-btn secondary" data-go="mobile-entry">返回</button><button class="std-foot-btn primary" data-action="submit-fee" data-kind="${kind}">提交</button>`;
  return D1.phone(D1.ORG, body, footer, 'mobile-entry');
};

/* ============ 工单管理（原 015 页版式） ============ */
D1.renderMobileWorkorders = function () {
  const tabs = ['全部', '机构入驻', '渠道号申请', '机构信息修改', '协议更新', '功能开通'];
  const st = D1.state;
  const rows = [
    { org: D1.ORG, kind: '开通', who: '若竹', status: st.openApproval, time: '2026-11-23 10:28:54', go: 'mobile-open-approval' },
    { org: D1.ORG, kind: '开通', who: '若竹', status: '待机构签约', time: '2026-11-23 11:06:32', go: 'csp-sign' },
    { org: D1.ORG, kind: '费率信息变更', who: '若竹', status: st.changeApproval, time: '2026-11-23 11:20:10', go: 'mobile-change-approval' }
  ];
  const body = `<div class="std-wo-tabs">${tabs.map((t, i) => `<button class="std-wo-tab ${i === 0 || t === '功能开通' ? '' : ''} ${t === '功能开通' ? 'active' : ''}">${t}</button>`).join('')}</div>
    ${rows.map(r => `<button class="std-wo-card" data-go="${r.go}"><div class="r1"><span class="org">${r.org}</span><span class="kind">${r.kind}</span><span>${r.who}</span></div><div class="r2"><span class="status ${r.status === '待签约' || r.status === '已完成' ? 'ok' : ''}">${r.status}</span><span class="time">${r.time}</span></div></button>`).join('')}
    <div class="std-wo-count">共3条</div>`;
  return D1.phone('工单管理', body, '', 'mobile-entry');
};

/* ============ 审批邮件截图附件展示（测试环境审核页版式） ============
   独立标签「审批邮件截图附件」+ 圆角图片缩略图，无边框卡片、无文件名行。
   未上传时不展示整个区块。 */
D1.materialBlock = function (f) {
  if (!f.material) return '';
  return `<div class="std-material"><div class="std-material-label">审批邮件截图附件</div>
    <div class="std-material-thumb" role="img" aria-label="审批邮件截图" title="审批邮件截图.png"></div></div>`;
};

/* ============ 审批详情（原 013/016 页版式，底部 驳回 / 通过） ============ */
D1.renderMobileApproval = function (kind) {
  const isOpen = kind === 'open';
  const ordered = D1.PRODUCTS.filter(n => D1.state.products.includes(n));
  const fee = D1.state[kind];
  const status = D1.state[isOpen ? 'openApproval' : 'changeApproval'];
  const rejected = status === '审批驳回';
  const passed = status === '待签约' || status === '已完成';
  const feeText = D1.feeText(fee);
  const feeDetail = (name, f) => {
    const schema = D1.PRODUCT_SCHEMA[name];
    if (!schema) return '';
    const grouped = schema.groups.some(g => g.sub);
    let rows;
    if (grouped) {
      /* 银行账户：左侧银行名（必填星号）纵向居中，右侧逐行展示该行费率 */
      rows = schema.groups.map(g => `<div class="std-group"><div class="std-group-name req">${g.sub}</div><div class="std-group-body">${g.fields.map(fld => D1.row(
        `${fld.label} (${fld.unit})`,
        `<span class="val ${f[fld.key] ? '' : 'muted'}">${f[fld.key] ?? '未配置'}</span>`
      )).join('')}</div></div>`).join('');
    } else {
      rows = schema.groups.flatMap(g => g.fields.map(fld => D1.row(
        `${fld.label} (${fld.unit})`,
        `<span class="val ${f[fld.key] ? '' : 'muted'}">${f[fld.key] ?? '未配置'}</span>`,
        { req: true }
      ))).join('');
    }
    return `${D1.band(schema.band)}
    <div class="std-form">${rows}</div>
    ${D1.materialBlock(f)}`;
  };
  const d1FeeSection = `${D1.band('D+1结算')}
    <div class="std-form">
      ${D1.row('结算时间', '<span class="val">次自然日结算</span>')}
      ${D1.row('收费方式', `<span class="val">${fee.chargeType}</span>`)}
      ${fee.rateType ? `${D1.row('费率类型', `<span class="val">${fee.rateType}</span>`)}
      ${D1.row(D1.hw(D1.d1RateLabel(fee)), `<span class="val">${D1.formatFeeNumber(fee.rate)}</span>`)}
      ${D1.row(D1.hw('D+1结算手续费保底值（元）'), `<span class="val">${fee.min || '未配置'}</span>`)}
      ${D1.row(D1.hw('D+1结算手续费封顶值（元）'), `<span class="val">${fee.max || '未配置'}</span>`)}` : ''}
    </div>
    ${D1.materialBlock(fee)}`;
  const body = `${D1.mobileSteps(passed ? 2 : 1)}
    ${rejected ? '<div class="std-tip">审批已驳回，请修改后重新提交。</div>' : passed ? '<div class="std-tip">审核通过，请通知机构在 CSP 完成签约。</div>' : ''}
    ${D1.band('机构信息')}
    <div class="std-form">
      ${D1.row('机构 ID', '<span class="val">99751919</span>')}
      ${D1.row('机构名称', `<span class="val">${D1.ORG}</span>`)}
      ${D1.row('申请类型', `<span class="val">${isOpen ? '产品开通' : '费率信息变更'}</span>`)}
      ${isOpen ? D1.row('本次开通产品', `<span class="val">${ordered.join('、')}</span>`) : ''}
    </div>
    ${isOpen ? ordered.map(name => name === 'D+1结算' ? d1FeeSection : feeDetail(name, D1.productFee(name))).join('') : d1FeeSection}`;
  let footer = '';
  if (rejected) footer = `<div class="std-approve-foot"><button class="std-foot-btn pass" style="flex:1" data-action="resubmit" data-kind="${kind}">修改并重新提交</button></div>`;
  else if (passed) footer = `<div class="std-approve-foot"><button class="std-foot-btn pass" style="flex:1" data-action="go-sign" data-kind="${kind}">前往 CSP 签约</button></div>`;
  else footer = `<div class="std-approve-foot"><button class="std-foot-btn reject" style="flex:1" data-action="reject-approval" data-kind="${kind}">驳回</button><button class="std-foot-btn pass" style="flex:1" data-action="approve" data-kind="${kind}">通过</button></div>`;
  return D1.phone(D1.ORG, body, footer, 'mobile-workorders');
};

D1.mobileRenderers = {
  'mobile-entry': D1.renderMobileEntry,
  'mobile-open': () => D1.renderMobileForm('open'),
  'mobile-open-approval': () => D1.renderMobileApproval('open'),
  'mobile-change': () => D1.renderMobileForm('change'),
  'mobile-change-approval': () => D1.renderMobileApproval('change'),
  'mobile-workorders': D1.renderMobileWorkorders
};
