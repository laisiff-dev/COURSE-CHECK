/* 輔英科技大學「課程結構外審」自動檢核系統 - UI 主控與三階段人工考點管理 */

document.addEventListener("DOMContentLoaded", () => {
  let currentDataset = window.SampleDataPresets["4nursing"];
  let auditor = new CourseAuditor(currentDataset);

  // 三階段考點決策狀態 (Decision Trail State)
  let workflowState = {
    gate1: { status: "PASSED", reviewer: "課務註冊組", date: "115年09月20日", notes: "附件1~4完整，系統自動檢核通過。" },
    gate2: { status: "PASSED", reviewer: "張美珍 專家", date: "115年10月15日", notes: "量化評定皆高，質性建議已記錄於附件8。" },
    gate3: { status: "PASSED", reviewer: "教務處 (教務長)", date: "115年11月05日", notes: "成果報告附件10與改善對照表核章完備，予以結案。" },
    logs: [
      { step: "考點1：系統初審", action: "🟢 初審通過送出", user: "課務組承辦人", time: "115-09-20 10:15", comment: "附件1~4上傳齊全，自動檢核合規率 100%。" },
      { step: "考點2：外審專家審查", action: "🟢 專家審查通過", user: "張美珍 教授", time: "115-10-15 14:30", comment: "同意課程結構規劃，建議增加 AI 應用單元。" },
      { step: "考點3：最終簽核", action: "🟢 最終結案核可", user: "教務長", time: "115-11-05 16:00", comment: "系所已完成修正對照，准予結案。" }
    ]
  };

  // DOM 元素引用
  const tabItems = document.querySelectorAll(".tab-item");
  const tabContents = document.querySelectorAll(".tab-content");
  const presetSelect = document.getElementById("preset-select");
  const btnLoadPreset = document.getElementById("btn-load-preset");
  const btnRunAudit = document.getElementById("btn-run-audit");
  const btnPrintAtt5 = document.getElementById("btn-print-att5");

  // 初始化載入
  loadPresetData("4nursing");

  // 分頁切換
  tabItems.forEach(tab => {
    tab.addEventListener("click", () => {
      tabItems.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // 一鍵載入預設資料組
  if (btnLoadPreset) {
    btnLoadPreset.addEventListener("click", () => {
      const key = presetSelect ? presetSelect.value : "4nursing";
      loadPresetData(key);
    });
  }

  // 重新執行全套檢核
  if (btnRunAudit) {
    btnRunAudit.addEventListener("click", () => {
      runAuditAndUpdateUI();
    });
  }

  // 列印按鈕
  if (btnPrintAtt5) {
    btnPrintAtt5.addEventListener("click", () => {
      window.print();
    });
  }

  // 載入預設資料
  function loadPresetData(key) {
    const preset = window.SampleDataPresets[key];
    if (!preset) return;

    currentDataset = JSON.parse(JSON.stringify(preset));
    auditor = new CourseAuditor(currentDataset);

    // 根據範例調整考點初始狀態 (例如：高齡照護系預設為違規且需修正)
    if (key === "2elderly") {
      workflowState.gate1 = { status: "REJECTED", reviewer: "課務註冊組", date: "115年09月21日", notes: "必選修比例(3.0倍)爆表，倫理開在1年級，已退回系所修正。" };
      workflowState.gate2 = { status: "PENDING", reviewer: "王國華 專家", date: "-", notes: "待第一階段退回修正完成後審查。" };
      workflowState.gate3 = { status: "PENDING", reviewer: "教務處", date: "-", notes: "待修正完成後核章。" };
      workflowState.logs.unshift({
        step: "考點1：系統初審",
        action: "🔴 考點退回系所修正",
        user: "課務組承辦人",
        time: "115-09-21 11:00",
        comment: "發現 4 項不符合條文（必選修比過高、倫理年級不符、大綱不足6項），予以退回。"
      });
    } else {
      workflowState.gate1 = { status: "PASSED", reviewer: "課務註冊組", date: "115年09月20日", notes: "附件1~4完整，系統自動檢核通過。" };
      workflowState.gate2 = { status: "PASSED", reviewer: "張美珍 專家", date: "115年10月15日", notes: "量化評定皆高，質性建議已記錄於附件8。" };
      workflowState.gate3 = { status: "PASSED", reviewer: "教務處 (教務長)", date: "115年11月05日", notes: "成果報告附件10與改善對照表核章完備，予以結案。" };
    }

    runAuditAndUpdateUI();
  }

  // 執行全套檢核並刷新所有 UI
  function runAuditAndUpdateUI() {
    const auditRes = auditor.runFullAudit();

    // 1. 更新頂部 3 階段進度條與狀態
    renderWorkflowStepBar();

    // 2. 更新 Dashboard 數據卡片
    const elRate = document.getElementById("stat-pass-rate");
    const elTotal = document.getElementById("stat-total-checks");
    const elPass = document.getElementById("stat-pass-count");
    const elFail = document.getElementById("stat-fail-count");

    if (elRate) elRate.innerText = `${auditRes.passRate}%`;
    if (elTotal) elTotal.innerText = auditRes.totalChecks;
    if (elPass) elPass.innerText = auditRes.passCount;
    if (elFail) elFail.innerText = auditRes.failCount;

    // 3. 渲染條文與跨表檢核視圖 (階段1)
    renderRuleAuditTable(auditRes.ruleResults);
    renderCrossAuditTable(auditRes.crossResults);
    renderOutlineAuditTable(auditRes.outlineResults);

    // 4. 渲染科目表視圖 (附件2)
    renderCourseScheduleTable(currentDataset.attachment2);

    // 5. 渲染附件5 (科目表檢核表)
    renderAttachment5Report(auditRes.ruleResults);

    // 6. 渲染附件8 (專家意見表 - 階段2)
    renderAttachment8Report(currentDataset.attachment8);

    // 7. 渲染附件9 (個資同意書 - 階段2)
    renderAttachment9Hub(currentDataset.attachment9);

    // 8. 渲染附件10 (成果報告與改善追蹤 - 階段3)
    renderAttachment10Report(currentDataset.attachment10);

    // 9. 渲染 3 大考點審核決策模組 (Gate 1, Gate 2, Gate 3)
    renderHumanCheckpointGates();

    // 10. 渲染考點決策歷史紀錄 Trail
    renderApprovalHistoryLogs();
  }

  // 頂部三階段進度條渲染
  function renderWorkflowStepBar() {
    const container = document.getElementById("workflow-steps-container");
    if (!container) return;

    const g1 = workflowState.gate1.status;
    const g2 = workflowState.gate2.status;
    const g3 = workflowState.gate3.status;

    container.innerHTML = `
      <div class="step-pill ${g1 === 'PASSED' ? 'passed' : (g1 === 'REJECTED' ? 'rejected' : 'active')}">
        <div class="step-num">1</div>
        <div class="step-info-text">
          <div class="step-info-title">第一部分：系統自動檢核</div>
          <div class="step-info-sub">附件1~4帶入與考點1初審 (${g1 === 'PASSED' ? '🟢 通過' : (g1 === 'REJECTED' ? '🔴 已退回' : '🟡 審核中')})</div>
        </div>
      </div>
      <div style="font-size: 1.2rem; color: var(--text-muted);">➔</div>
      <div class="step-pill ${g2 === 'PASSED' ? 'passed' : (g2 === 'REJECTED' ? 'rejected' : (g1 === 'PASSED' ? 'active' : ''))}">
        <div class="step-num">2</div>
        <div class="step-info-text">
          <div class="step-info-title">第二部分：專家外審審查</div>
          <div class="step-info-sub">附件7,9帶入與附件8意見表 (${g2 === 'PASSED' ? '🟢 通過' : (g2 === 'REJECTED' ? '🔴 建議修正' : '⚪ 待審查')})</div>
        </div>
      </div>
      <div style="font-size: 1.2rem; color: var(--text-muted);">➔</div>
      <div class="step-pill ${g3 === 'PASSED' ? 'passed' : (g3 === 'REJECTED' ? 'rejected' : (g2 === 'PASSED' ? 'active' : ''))}">
        <div class="step-num">3</div>
        <div class="step-info-text">
          <div class="step-info-title">第三部分：系所成果與改善</div>
          <div class="step-info-sub">附件10報告與改善追蹤簽核 (${g3 === 'PASSED' ? '🟢 結案' : '⚪ 待簽核'})</div>
        </div>
      </div>
    `;
  }

  // 人工考點審核決策模組 (Gate 1, Gate 2, Gate 3)
  function renderHumanCheckpointGates() {
    // 考點1 門檻
    const g1Box = document.getElementById("gate1-control-box");
    if (g1Box) {
      g1Box.innerHTML = `
        <div class="checkpoint-gate-card">
          <div class="gate-header">
            <div class="gate-title">📌 考點 1：第一階段 系統初審人工考點 (課務註冊組 / 系所初審門檻)</div>
            <span class="badge ${workflowState.gate1.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">
              當前考點狀態：${workflowState.gate1.status === 'PASSED' ? '🟢 初審通過送出' : '🔴 已退回系所修正'}
            </span>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            檢視系統針對附件1~4之自動檢核結果（附件5），審核人員得決定<strong>『送至校外專家審查』</strong>或<strong>『退回系所修正』</strong>：
          </p>
          <div class="gate-controls">
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">審核決策：</label>
              <select id="gate1-action-select" class="form-select" style="width: 100%;">
                <option value="APPROVE">🟢 考點合格：送至校外專家審查</option>
                <option value="REJECT">🔴 考點不合格：退回系所重新修正</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">考點審核意見 / 退回理由說明：</label>
              <input type="text" id="gate1-notes-input" class="form-input" style="width: 100%;" value="${workflowState.gate1.notes}">
            </div>
            <div style="display: flex; align-items: flex-end;">
              <button class="btn btn-primary" id="btn-submit-gate1">送出考點決策</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById("btn-submit-gate1").addEventListener("click", () => {
        const act = document.getElementById("gate1-action-select").value;
        const notes = document.getElementById("gate1-notes-input").value;
        if (act === "APPROVE") {
          workflowState.gate1 = { status: "PASSED", reviewer: "課務註冊組", date: "115年09月22日", notes: notes };
          workflowState.logs.unshift({ step: "考點1：系統初審", action: "🟢 初審通過送出", user: "課務組承辦人", time: new Date().toLocaleString(), comment: notes });
          alert("【考點1 決策成功】第一階段初審通過！已准予送至第二階段校外專家審查。");
        } else {
          workflowState.gate1 = { status: "REJECTED", reviewer: "課務註冊組", date: "115年09月22日", notes: notes };
          workflowState.logs.unshift({ step: "考點1：系統初審", action: "🔴 退回系所修正", user: "課務組承辦人", time: new Date().toLocaleString(), comment: notes });
          alert("【考點1 決策成功】已退回系所修正！系統已紀錄退回理由並通知承辦單位。");
        }
        runAuditAndUpdateUI();
      });
    }

    // 考點2 門檻 (專家審查)
    const g2Box = document.getElementById("gate2-control-box");
    if (g2Box) {
      g2Box.innerHTML = `
        <div class="checkpoint-gate-card">
          <div class="gate-header">
            <div class="gate-title">📌 考點 2：第二階段 校外專家審查考點 (專家委員依據檢核結果填寫附件8)</div>
            <span class="badge ${workflowState.gate2.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">
              當前考點狀態：${workflowState.gate2.status === 'PASSED' ? '🟢 專家審查通過' : '🔴 建議退回修正'}
            </span>
          </div>
          <div class="gate-controls">
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">外審委員整體決策：</label>
              <select id="gate2-action-select" class="form-select" style="width: 100%;">
                <option value="APPROVE">🟢 審查通過 (附件8 勾選通過)</option>
                <option value="REJECT">🔴 建議修正 (附件8 勾選建議修正)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">專家質性意見與建議：</label>
              <input type="text" id="gate2-notes-input" class="form-input" style="width: 100%;" value="${workflowState.gate2.notes}">
            </div>
            <div style="display: flex; align-items: flex-end;">
              <button class="btn btn-primary" id="btn-submit-gate2">送出外審決策</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById("btn-submit-gate2").addEventListener("click", () => {
        const act = document.getElementById("gate2-action-select").value;
        const notes = document.getElementById("gate2-notes-input").value;
        if (act === "APPROVE") {
          workflowState.gate2 = { status: "PASSED", reviewer: "張美珍 教授", date: "115年10月18日", notes: notes };
          workflowState.logs.unshift({ step: "考點2：專家審查", action: "🟢 專家審查通過", user: "校外專家委員", time: new Date().toLocaleString(), comment: notes });
          alert("【考點2 決策成功】校外專家審查通過！已核可進入第三階段系所成果報告與改善對照。");
        } else {
          workflowState.gate2 = { status: "REJECTED", reviewer: "王國華 副教授", date: "115年10月18日", notes: notes };
          workflowState.logs.unshift({ step: "考點2：專家審查", action: "🔴 建議修正退回", user: "校外專家委員", time: new Date().toLocaleString(), comment: notes });
          alert("【考點2 決策成功】專家建議修正！系所須於第三階段針對審查意見填寫因應措施。");
        }
        runAuditAndUpdateUI();
      });
    }

    // 考點3 最終核章門檻
    const g3Box = document.getElementById("gate3-control-box");
    if (g3Box) {
      g3Box.innerHTML = `
        <div class="checkpoint-gate-card">
          <div class="gate-header">
            <div class="gate-title">📌 考點 3：第三階段 教務處/院級最終簽核考點 (附件10成果報告與改善對照核章)</div>
            <span class="badge ${workflowState.gate3.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">
              當前考點狀態：${workflowState.gate3.status === 'PASSED' ? '🟢 最終審核通過結案' : '🔴 需退回重新改善'}
            </span>
          </div>
          <div class="gate-controls">
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">最終簽核決策：</label>
              <select id="gate3-action-select" class="form-select" style="width: 100%;">
                <option value="APPROVE">🟢 最終核章通過 (准予核銷結案)</option>
                <option value="REJECT">🔴 退回系所重新修正改善措施</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">最終核章簽署意見：</label>
              <input type="text" id="gate3-notes-input" class="form-input" style="width: 100%;" value="${workflowState.gate3.notes}">
            </div>
            <div style="display: flex; align-items: flex-end;">
              <button class="btn btn-success" id="btn-submit-gate3">完成最終簽核</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById("btn-submit-gate3").addEventListener("click", () => {
        const act = document.getElementById("gate3-action-select").value;
        const notes = document.getElementById("gate3-notes-input").value;
        if (act === "APPROVE") {
          workflowState.gate3 = { status: "PASSED", reviewer: "教務長", date: "115年11月08日", notes: notes };
          workflowState.logs.unshift({ step: "考點3：最終簽核", action: "🟢 最終結案核可", user: "教務長", time: new Date().toLocaleString(), comment: notes });
          alert("🎉【考點3 決策成功】全套課程結構外審流程已完成最終簽核與核銷結案！");
        } else {
          workflowState.gate3 = { status: "REJECTED", reviewer: "教務長", date: "115年11月08日", notes: notes };
          workflowState.logs.unshift({ step: "考點3：最終簽核", action: "🔴 退回改善措施", user: "教務長", time: new Date().toLocaleString(), comment: notes });
          alert("【考點3 決策成功】已退回系所要求重新編修改善措施。");
        }
        runAuditAndUpdateUI();
      });
    }
  }

  // 渲染審核履歷與考點歷史 Trace Log
  function renderApprovalHistoryLogs() {
    const tbody = document.getElementById("tbody-approval-logs");
    if (!tbody) return;

    tbody.innerHTML = workflowState.logs.map((log, idx) => `
      <tr>
        <td>#${workflowState.logs.length - idx}</td>
        <td><strong>${log.step}</strong></td>
        <td><span class="badge ${log.action.includes('🟢') ? 'badge-success' : 'badge-danger'}">${log.action}</span></td>
        <td>${log.user}</td>
        <td style="font-size: 0.85rem; color: #64748b;">${log.time}</td>
        <td>${log.comment}</td>
      </tr>
    `).join("");
  }

  // 渲染條文與跨表檢核視圖 (其餘同前)
  function renderRuleAuditTable(rules) {
    const tbody = document.getElementById("tbody-rule-audit");
    if (!tbody) return;
    tbody.innerHTML = rules.map(r => `
      <tr>
        <td><strong>${r.ruleId}</strong></td>
        <td>${r.title}</td>
        <td>${r.category}</td>
        <td>${r.courseHits}</td>
        <td><span class="badge ${r.status === 'PASS' ? 'badge-success' : 'badge-danger'}">${r.status === 'PASS' ? '🟢 符合' : '🔴 不符合'}</span></td>
        <td style="font-size: 0.85rem; color: #475569;">${r.remark}</td>
      </tr>
    `).join("");
  }

  function renderCrossAuditTable(crossItems) {
    const tbody = document.getElementById("tbody-cross-audit");
    if (!tbody) return;
    tbody.innerHTML = crossItems.map(c => `
      <tr>
        <td><strong>${c.checkGroup}</strong></td>
        <td>${c.title}</td>
        <td><span class="badge ${c.status === 'PASS' ? 'badge-success' : 'badge-danger'}">${c.status === 'PASS' ? '🟢 一致' : '🔴 不一致/異常'}</span></td>
        <td style="font-size: 0.85rem;">${c.details}</td>
      </tr>
    `).join("");
  }

  function renderOutlineAuditTable(outlines) {
    const tbody = document.getElementById("tbody-outline-audit");
    if (!tbody) return;
    tbody.innerHTML = outlines.map(o => `
      <tr>
        <td><strong>${o.courseName}</strong></td>
        <td style="font-family: monospace; font-size: 0.85rem;">${o.enName}</td>
        <td>${o.unitCount} 項 (門檻 $\\ge$ ${o.minRequired}項)</td>
        <td><span class="badge ${o.status === 'PASS' ? 'badge-success' : 'badge-danger'}">${o.status === 'PASS' ? '🟢 檢查通過' : '🔴 需修正'}</span></td>
        <td style="font-size: 0.85rem;">${o.remark}</td>
      </tr>
    `).join("");
  }

  function renderCourseScheduleTable(courses) {
    const tbody = document.getElementById("tbody-courses");
    if (!tbody) return;
    tbody.innerHTML = courses.map(c => `
      <tr>
        <td>${c.id}</td>
        <td><span class="badge badge-secondary">${c.type}</span></td>
        <td><strong>${c.name}</strong></td>
        <td style="font-family: monospace; font-size: 0.825rem; color: #64748b;">${c.enName}</td>
        <td>${c.credits}</td>
        <td>${c.hours} / ${c.labHours}</td>
        <td>第 ${c.year} 學年 第 ${c.semester} 學期</td>
        <td>${(c.attr || []).map(a => `<span class="badge badge-warning" style="margin-right: 2px;">${a}</span>`).join("")}</td>
      </tr>
    `).join("");
  }

  function renderAttachment5Report(ruleResults) {
    const container = document.getElementById("att5-report-view");
    if (!container) return;
    const dept = currentDataset.deptName || "○○";
    const sys = currentDataset.systemType || "日四技";
    const year = currentDataset.academicYear || "115";

    const resultMap = {};
    ruleResults.forEach(r => { resultMap[r.ruleId] = r; });

    const getCheckHtml = (ruleId) => {
      const item = resultMap[ruleId];
      if (!item) return `<div><span class="att5-check-box">☑ 符合</span><span class="att5-check-box">□ 不符合</span><span class="att5-check-box">□ 不適用</span></div>`;
      if (item.status === "PASS") {
        return `<div><span class="att5-check-box">☑ 符合</span><span class="att5-check-box">□ 不符合</span><span class="att5-check-box">□ 不適用</span></div>`;
      } else {
        return `<div><span class="att5-check-box">□ 符合</span><span class="att5-check-box" style="color:red; font-weight:bold;">☑ 不符合</span><span class="att5-check-box">□ 不適用</span></div>`;
      }
    };

    container.innerHTML = `
      <div class="attachment5-container">
        <div class="att5-header">
          <div class="att5-title">${dept}【${sys}】科目表（${year}入學年度）檢核表</div>
        </div>
        <table class="att5-table">
          <thead>
            <tr>
              <th style="width: 15%;">檢核項目</th>
              <th style="width: 25%;">科目表制定及課程開設要點規定</th>
              <th style="width: 20%;">開課內容</th>
              <th style="width: 8%;">學分數</th>
              <th style="width: 18%;">檢核結果</th>
              <th style="width: 14%;">備註說明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="5" style="text-align: center; font-weight: bold; background: #fafafa;">通識課程規劃</td>
              <td>六/(一)/2</td>
              <td>應參考本校各學制學生畢業前須至少修畢之「通識課程」學分數。</td>
              <td>通識總學分</td>
              <td>${getCheckHtml("六/(一)/2")}</td>
              <td>${resultMap["六/(一)/2"] ? resultMap["六/(一)/2"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(一)/3</td>
              <td>二技、四技必須規劃2學分程式設計相關之資訊學群課程。</td>
              <td>${resultMap["六/(一)/3"] ? resultMap["六/(一)/3"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(一)/3")}</td>
              <td>${resultMap["六/(一)/3"] ? resultMap["六/(一)/3"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(一)/4</td>
              <td>二技、四技必須規劃2學分職場英文相關或第二外語課程。</td>
              <td>${resultMap["六/(一)/4"] ? resultMap["六/(一)/4"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(一)/4")}</td>
              <td>${resultMap["六/(一)/4"] ? resultMap["六/(一)/4"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(一)/5</td>
              <td>日二技、日四技必須規劃服務學習課程，並列為必修。</td>
              <td>${resultMap["六/(一)/5"] ? resultMap["六/(一)/5"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(一)/5")}</td>
              <td>${resultMap["六/(一)/5"] ? resultMap["六/(一)/5"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(一)/6</td>
              <td>五專課程規劃應符合專科學校法第34條。</td>
              <td>專科前三年課程</td>
              <td>${sys.includes("五專") ? getCheckHtml("六/(一)/6") : "<div><span class='att5-check-box'>□ 符合</span><span class='att5-check-box'>□ 不符合</span><span class='att5-check-box'>☑ 不適用</span></div>"}</td>
              <td>${sys.includes("五專") ? "符合專科學校法規定" : "非五專學制，不適用此條款。"}</td>
            </tr>
            <tr>
              <td rowspan="8" style="text-align: center; font-weight: bold; background: #fafafa;">專業課程規劃</td>
              <td>六/(二)/3</td>
              <td>二技、四技以必修學分不超過選修學分2倍為原則。</td>
              <td>${resultMap["六/(二)/3"] ? resultMap["六/(二)/3"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/3")}</td>
              <td>${resultMap["六/(二)/3"] ? resultMap["六/(二)/3"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(二)/4</td>
              <td>二技、四技必須規劃10分之1之學分課程與本校健康主軸相關。</td>
              <td>${resultMap["六/(二)/4"] ? resultMap["六/(二)/4"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/4")}</td>
              <td>${resultMap["六/(二)/4"] ? resultMap["六/(二)/4"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(二)/5</td>
              <td>二技、四技必須規劃至少2學分數位科技相關課程。</td>
              <td>${resultMap["六/(二)/5"] ? resultMap["六/(二)/5"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/5")}</td>
              <td>${resultMap["六/(二)/5"] ? resultMap["六/(二)/5"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(二)/6<br>八/(二)/5</td>
              <td>二技、四技必須規劃2學分職場專業倫理必修課程且須開設於高年級。</td>
              <td>${resultMap["六/(二)/6, 八/(二)/5"] ? resultMap["六/(二)/6, 八/(二)/5"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/6, 八/(二)/5")}</td>
              <td>${resultMap["六/(二)/6, 八/(二)/5"] ? resultMap["六/(二)/6, 八/(二)/5"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(二)/7</td>
              <td>四技必須規劃2學分專業職場英文術語英文授課必修課程。</td>
              <td>${resultMap["六/(二)/7"] ? resultMap["六/(二)/7"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/7")}</td>
              <td>${resultMap["六/(二)/7"] ? resultMap["六/(二)/7"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(二)/9</td>
              <td>日四技必須規劃海外實習(見習)選修課程。</td>
              <td>${resultMap["六/(二)/9"] ? resultMap["六/(二)/9"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/9")}</td>
              <td>${resultMap["六/(二)/9"] ? resultMap["六/(二)/9"].remark : ""}</td>
            </tr>
            <tr>
              <td>六/(二)/11<br>八/(二)/6</td>
              <td>日四技必須規劃總結性必修課程且須開在高年級。</td>
              <td>${resultMap["六/(二)/11, 八/(二)/6"] ? resultMap["六/(二)/11, 八/(二)/6"].courseHits : ""}</td>
              <td>${getCheckHtml("六/(二)/11, 八/(二)/6")}</td>
              <td>${resultMap["六/(二)/11, 八/(二)/6"] ? resultMap["六/(二)/11, 八/(二)/6"].remark : ""}</td>
            </tr>
            <tr>
              <td>八/(二)/7</td>
              <td>四技最後一學年不排必修課（例外課程除外）。</td>
              <td>${resultMap["八/(二)/7"] ? resultMap["八/(二)/7"].courseHits : ""}</td>
              <td>${getCheckHtml("八/(二)/7")}</td>
              <td>${resultMap["八/(二)/7"] ? resultMap["八/(二)/7"].remark : ""}</td>
            </tr>
          </tbody>
        </table>
        <div class="att5-footer">
          <div>系科(學位學程)主任/組長簽章：______________</div>
          <div>學院院長/主任簽章：______________</div>
          <div>教務長簽章：______________</div>
        </div>
      </div>
    `;
  }

  function renderAttachment8Report(att8) {
    const container = document.getElementById("att8-report-view");
    if (!container || !att8) return;

    const scores = att8.quantitativeScores || [];
    const scoresHtml = scores.map(s => `
      <tr>
        <td>${s.itemCategory}</td>
        <td>${s.itemName}</td>
        <td style="text-align: center;">${s.score === '極高' ? '☑ 極高' : '□ 極高'}</td>
        <td style="text-align: center;">${s.score === '高' ? '☑ 高' : '□ 高'}</td>
        <td style="text-align: center;">${s.score === '尚可' ? '☑ 尚可' : '□ 尚可'}</td>
        <td style="text-align: center;">${s.score === '低' ? '☑ 低' : '□ 低'}</td>
        <td style="text-align: center;">${s.score === '極低' ? '☑ 極低' : '□ 極低'}</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="attachment5-container">
        <div class="att5-header">
          <div class="att5-title">輔英科技大學 ${att8.deptName} 課程結構審查意見表 (附件8)</div>
        </div>
        <table class="att5-table">
          <tr>
            <td style="width: 20%; font-weight: bold; background: #fafafa;">審查日期</td>
            <td style="width: 30%;">${att8.reviewDate}</td>
            <td style="width: 20%; font-weight: bold; background: #fafafa;">審查型態</td>
            <td style="width: 30%;">☑ ${att8.reviewType} (外審)</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #fafafa;">適用學制</td>
            <td colspan="3">☑ ${att8.systemDegree}</td>
          </tr>
        </table>
        <div style="font-weight: bold; margin: 1rem 0 0.5rem 0;">一、量化面向評定</div>
        <table class="att5-table">
          <thead>
            <tr>
              <th style="width: 15%;">項目類別</th>
              <th style="width: 45%;">評核細項</th>
              <th style="width: 8%;">極高</th>
              <th style="width: 8%;">高</th>
              <th style="width: 8%;">尚可</th>
              <th style="width: 8%;">低</th>
              <th style="width: 8%;">極低</th>
            </tr>
          </thead>
          <tbody>${scoresHtml}</tbody>
        </table>
        <div style="font-weight: bold; margin: 1rem 0 0.5rem 0;">二、質性面向意見與整體建議</div>
        <table class="att5-table">
          <tr>
            <td style="width: 20%; font-weight: bold; background: #fafafa;">整體審查結果</td>
            <td><span style="font-size: 1.1rem; font-weight: bold;">${att8.overallResult === '通過' ? '☑ 通過  □ 建議修正' : '□ 通過  ☑ 建議修正'}</span></td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #fafafa;">審查意見與改善建議</td>
            <td style="white-space: pre-line; line-height: 1.6;">${att8.qualitativeComments}</td>
          </tr>
        </table>
        <div class="att5-footer" style="margin-top: 2rem;">
          <div>審查人(校外專家)簽章：${att8.reviewerName} (已完成電子簽章)</div>
          <div>簽章日期：${att8.reviewDate}</div>
        </div>
      </div>
    `;
  }

  function renderAttachment9Hub(att9) {
    const container = document.getElementById("att9-hub-view");
    if (!container || !att9) return;

    container.innerHTML = `
      <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="color: var(--primary-color);">📋 附件9：個人資料告知暨同意書 (校外專家回傳區)</h3>
          <span class="badge badge-success">✓ ${att9.status} (${att9.signedDate})</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <tr>
              <td style="width: 20%; font-weight: bold; background: #fafafa;">校外專家姓名</td>
              <td style="width: 30%;">${att9.reviewerName}</td>
              <td style="width: 20%; font-weight: bold; background: #fafafa;">身分證字號</td>
              <td style="width: 30%;">${att9.idNumber}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #fafafa;">戶籍地址</td>
              <td colspan="3">${att9.address}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #fafafa;">撥款銀行與分行</td>
              <td>${att9.bankName}</td>
              <td style="font-weight: bold; background: #fafafa;">銀行帳號</td>
              <td>${att9.bankAccount}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #fafafa;">校外專家審查費</td>
              <td><strong>NT$ ${att9.feeAmount} 元/件</strong></td>
              <td style="font-weight: bold; background: #fafafa;">已上傳簽署檔</td>
              <td><span class="badge badge-warning">📄 ${att9.uploadedScanFile}</span></td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="alert('重新上傳個資同意書簽署檔：上傳成功！')">📤 重新上傳個資同意書檔</button>
        </div>
      </div>
    `;
  }

  function renderAttachment10Report(att10) {
    const container = document.getElementById("att10-report-view");
    if (!container || !att10) return;

    const items = att10.improvementTracking || [];
    const trackingHtml = items.map(i => `
      <tr>
        <td style="text-align: center;">${i.no}</td>
        <td><strong>${i.courseName}</strong></td>
        <td>${i.comment}</td>
        <td style="color: #047857; font-weight: 500;">${i.response}</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="attachment5-container">
        <div class="att5-header">
          <div class="att5-title">輔英科技大學 115學年度「課程結構外審」成果報告書 (附件10)</div>
          <div style="font-size: 0.9rem; color: #555;">執行期間：${att10.execPeriod}</div>
        </div>
        <div style="font-weight: bold; margin: 1rem 0 0.5rem 0;">一、PDCA 活動成果摘要報告</div>
        <table class="att5-table">
          <tr>
            <td style="width: 20%; font-weight: bold; background: #fafafa;">活動/計畫名稱</td>
            <td colspan="3">${att10.planName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #fafafa;">執行成果說明</td>
            <td colspan="3" style="white-space: pre-line;">${att10.executiveSummary}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #fafafa;">外審結果統計</td>
            <td colspan="3">
              共審查通過：<strong>${att10.passCount}</strong> 份；
              建議修正後通過：<strong>${att10.conditionalPassCount}</strong> 份。
              指標達成率：<span class="badge badge-success" style="font-size: 0.9rem;">${att10.targetAchievementPct}</span>
            </td>
          </tr>
        </table>
        <div style="font-weight: bold; margin: 1.5rem 0 0.5rem 0;">二、外審委員審查意見與系所改善追蹤對照表</div>
        <table class="att5-table">
          <thead>
            <tr>
              <th style="width: 8%;">項次</th>
              <th style="width: 22%;">科目名稱 / 檢核項目</th>
              <th style="width: 35%;">外審委員審查意見 (附件8)</th>
              <th style="width: 35%;">專業系所改善因應措施 (附件10)</th>
            </tr>
          </thead>
          <tbody>${trackingHtml}</tbody>
        </table>
        <div class="att5-footer" style="margin-top: 2rem;">
          <div>承辦負責人：${att10.contactPerson}</div>
          <div>單位主管簽章：______________</div>
          <div>院長簽章：______________</div>
          <div>教務長簽章：______________</div>
        </div>
      </div>
    `;
  }
});
