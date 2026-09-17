/* 輔英科技大學「課程結構外審」自動檢核系統 - UI 主控與權限分工管理 */

document.addEventListener("DOMContentLoaded", () => {
  let currentDataset = window.SampleDataPresets["4nursing"];
  let auditor = new CourseAuditor(currentDataset);

  // 當前登入身分權限角色
  // "academic" = 教務處業務承辦人 (管考權限：考點1初審經費核定 & 考點3最後結案核銷)
  // "dept"     = 專業系所外審承辦人 (執行權限：附件1~4維護、寄送資料、彙整附件7/8/9、上傳附件10)
  // "reviewer" = 校外外審專家委員 (執行權限：填寫附件8意見表 & 簽具附件9同意書)
  let currentRole = "academic"; 

  // 三階段考點決策狀態
  let workflowState = {
    gate1: { status: "PASSED", reviewer: "教務處課務註冊組承辦人", date: "115年09月20日", notes: "教務處初審核定通過，核發經常門經費。" },
    gate2: { status: "PASSED", reviewer: "系上承辦人彙整 (張美珍 專家)", date: "115年10月15日", notes: "系上完成校外專家外審，附件8意見表已回收。" },
    gate3: { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年11月05日", notes: "教務處最後管考核可，完成附件10經費核銷結案。" },
    logs: [
      { step: "第一關：計畫管考審核", action: "🟢 教務處核定通過", user: "教務處業務承辦人", time: "115-09-20 10:15", comment: "經費核定通過，准予系上提出外審申請。" },
      { step: "第二關：專家外審審查", action: "🟢 專家審查通過", user: "張美珍 教授 / 系承辦人", time: "115-10-15 14:30", comment: "系上收回附件8審查意見，同意課程結構規劃。" },
      { step: "最後一關：成果與核銷", action: "🟢 教務處核銷結案", user: "教務處業務承辦人", time: "115-11-05 16:00", comment: "教務處最終管考無誤，完成經費核銷結案。" }
    ]
  };

  // DOM 元素引用
  const tabItems = document.querySelectorAll(".tab-item");
  const tabContents = document.querySelectorAll(".tab-content");
  const presetSelect = document.getElementById("preset-select");
  const btnLoadPreset = document.getElementById("btn-load-preset");
  const btnRunAudit = document.getElementById("btn-run-audit");
  const btnPrintAtt5 = document.getElementById("btn-print-att5");
  const rolePills = document.querySelectorAll(".role-pill");

  // 初始化載入
  loadPresetData("4nursing");

  // 身分切換事件
  rolePills.forEach(pill => {
    pill.addEventListener("click", () => {
      rolePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentRole = pill.getAttribute("data-role");

      updateRoleNoticeUI();
      renderHumanCheckpointGates();
    });
  });

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

  if (btnLoadPreset) {
    btnLoadPreset.addEventListener("click", () => {
      const key = presetSelect ? presetSelect.value : "4nursing";
      loadPresetData(key);
    });
  }

  if (btnRunAudit) {
    btnRunAudit.addEventListener("click", () => {
      runAuditAndUpdateUI();
    });
  }

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

    if (key === "2elderly") {
      workflowState.gate1 = { status: "REJECTED", reviewer: "教務處業務承辦人", date: "115年09月21日", notes: "教務處初審發現必選修比例(3.0倍)爆表，退回系上修正。" };
      workflowState.gate2 = { status: "PENDING", reviewer: "系上承辦人 (王國華 專家)", date: "-", notes: "待第一階段退回修正完成後外審。" };
      workflowState.gate3 = { status: "PENDING", reviewer: "教務處業務承辦人", date: "-", notes: "待修正完成後由教務處最後管考。" };
      workflowState.logs.unshift({
        step: "第一關：計畫管考審核",
        action: "🔴 教務處退回系上修正",
        user: "教務處業務承辦人",
        time: "115-09-21 11:00",
        comment: "發現必選修比過高與倫理年級不符，退回系上重修正。"
      });
    } else {
      workflowState.gate1 = { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年09月20日", notes: "教務處初審核定通過，核發經費。" };
      workflowState.gate2 = { status: "PASSED", reviewer: "系上承辦人 (張美珍 專家)", date: "115年10月15日", notes: "系上完成外審收回附件8意見表。" };
      workflowState.gate3 = { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年11月05日", notes: "教務處最後管考核可，完成核銷結案。" };
    }

    runAuditAndUpdateUI();
  }

  function updateRoleNoticeUI() {
    const noticeEl = document.getElementById("current-role-display");
    if (noticeEl) {
      if (currentRole === "academic") {
        noticeEl.innerHTML = `<span class="badge badge-success" style="font-size: 0.85rem;">🏢 當前身分：教務處業務承辦人（擁有第一關計畫管考與最後一關核銷管考權限）</span>`;
      } else if (currentRole === "dept") {
        noticeEl.innerHTML = `<span class="badge badge-warning" style="font-size: 0.85rem;">🏫 當前身分：專業系所外審承辦人（擁有附件1~4維護、外審聯繫與附件10成果上傳權限）</span>`;
      } else {
        noticeEl.innerHTML = `<span class="badge badge-secondary" style="font-size: 0.85rem;">🎓 當前身分：校外外審專家委員（擁有附件8意見表填寫與附件9個資同意書簽具權限）</span>`;
      }
    }
  }

  // 執行檢核與 UI 更新
  function runAuditAndUpdateUI() {
    const auditRes = auditor.runFullAudit();

    updateRoleNoticeUI();
    renderWorkflowStepBar();

    const elRate = document.getElementById("stat-pass-rate");
    const elTotal = document.getElementById("stat-total-checks");
    const elPass = document.getElementById("stat-pass-count");
    const elFail = document.getElementById("stat-fail-count");

    if (elRate) elRate.innerText = `${auditRes.passRate}%`;
    if (elTotal) elTotal.innerText = auditRes.totalChecks;
    if (elPass) elPass.innerText = auditRes.passCount;
    if (elFail) elFail.innerText = auditRes.failCount;

    renderRuleAuditTable(auditRes.ruleResults);
    renderCrossAuditTable(auditRes.crossResults);
    renderOutlineAuditTable(auditRes.outlineResults);

    renderCourseScheduleTable(currentDataset.attachment2);
    renderAttachment5Report(auditRes.ruleResults);
    renderAttachment8Report(currentDataset.attachment8);
    renderAttachment9Hub(currentDataset.attachment9);
    renderAttachment10Report(currentDataset.attachment10);

    renderHumanCheckpointGates();
    renderApprovalHistoryLogs();
  }

  // 頂部三階段進度條
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
          <div class="step-info-title">第一關：教務處計畫管考與初審</div>
          <div class="step-info-sub">【管考權限：教務處業務承辦人】(${g1 === 'PASSED' ? '🟢 核定通過' : (g1 === 'REJECTED' ? '🔴 已退回' : '🟡 審核中')})</div>
        </div>
      </div>
      <div style="font-size: 1.2rem; color: var(--text-muted);">➔</div>
      <div class="step-pill ${g2 === 'PASSED' ? 'passed' : (g2 === 'REJECTED' ? 'rejected' : (g1 === 'PASSED' ? 'active' : ''))}">
        <div class="step-num">2</div>
        <div class="step-info-text">
          <div class="step-info-title">第二關：系上執行外審與專家審查</div>
          <div class="step-info-sub">【執行權限：系上外審承辦人 & 專家】(${g2 === 'PASSED' ? '🟢 外審完成' : (g2 === 'REJECTED' ? '🔴 建議修正' : '⚪ 待外審')})</div>
        </div>
      </div>
      <div style="font-size: 1.2rem; color: var(--text-muted);">➔</div>
      <div class="step-pill ${g3 === 'PASSED' ? 'passed' : (g3 === 'REJECTED' ? 'rejected' : (g2 === 'PASSED' ? 'active' : ''))}">
        <div class="step-num">3</div>
        <div class="step-info-text">
          <div class="step-info-title">最後一關：教務處成果核銷與結案</div>
          <div class="step-info-sub">【管考權限：教務處業務承辦人】(${g3 === 'PASSED' ? '🟢 結案核銷' : '⚪ 待核銷'})</div>
        </div>
      </div>
    `;
  }

  // 考點管考權限卡片 (Gate 1, Gate 2, Gate 3)
  function renderHumanCheckpointGates() {
    // 考點 1：教務處業務承辦人
    const g1Box = document.getElementById("gate1-control-box");
    if (g1Box) {
      const isAcademic = currentRole === "academic";
      g1Box.innerHTML = `
        <div class="checkpoint-gate-card" style="border-color: #0284c7;">
          <div class="gate-header">
            <div class="gate-title">
              📌 第一關管考考點：教務處初審與經費核定
              <span class="role-authority-badge">管考權限：教務處業務承辦人</span>
            </div>
            <span class="badge ${workflowState.gate1.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">
              當前狀態：${workflowState.gate1.status === 'PASSED' ? '🟢 教務處初審通過' : '🔴 已退回系上修正'}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            由<strong>教務處業務承辦人</strong>審核系上帶入之附件1~4及附件5自動檢核結果，決定是否核定經常門經費並准予系上進行外審：
          </p>
          ${isAcademic ? `
            <div class="gate-controls">
              <div>
                <label style="font-size: 0.8rem; font-weight: bold;">教務處管考決策：</label>
                <select id="gate1-action-select" class="form-select" style="width: 100%;">
                  <option value="APPROVE">🟢 教務處初審通過 (核定經費並准予外審)</option>
                  <option value="REJECT">🔴 教務處退回 (退回系上重新修正)</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: bold;">教務處管考審核意見：</label>
                <input type="text" id="gate1-notes-input" class="form-input" style="width: 100%;" value="${workflowState.gate1.notes}">
              </div>
              <div style="display: flex; align-items: flex-end;">
                <button class="btn btn-primary" id="btn-submit-gate1">送出教務處管考決策</button>
              </div>
            </div>
          ` : `
            <div class="read-only-notice">
              🔒 <strong>管考權限提醒：</strong>您當前身分不是【教務處業務承辦人】。第一關管考權限歸屬於教務處課務註冊組，您僅能瀏覽當前管考紀錄。
            </div>
          `}
        </div>
      `;

      if (isAcademic) {
        document.getElementById("btn-submit-gate1").addEventListener("click", () => {
          const act = document.getElementById("gate1-action-select").value;
          const notes = document.getElementById("gate1-notes-input").value;
          if (act === "APPROVE") {
            workflowState.gate1 = { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年09月22日", notes: notes };
            workflowState.logs.unshift({ step: "第一關：計畫管考", action: "🟢 教務處核定通過", user: "教務處業務承辦人", time: new Date().toLocaleString(), comment: notes });
            alert("【教務處管考成功】第一關初審通過！已核定經常門經費，並准予系上執行外審。");
          } else {
            workflowState.gate1 = { status: "REJECTED", reviewer: "教務處業務承辦人", date: "115年09月22日", notes: notes };
            workflowState.logs.unshift({ step: "第一關：計畫管考", action: "🔴 教務處退回修正", user: "教務處業務承辦人", time: new Date().toLocaleString(), comment: notes });
            alert("【教務處管考成功】已退回系上修正！");
          }
          runAuditAndUpdateUI();
        });
      }
    }

    // 考點 2：系上外審承辦人 & 專家
    const g2Box = document.getElementById("gate2-control-box");
    if (g2Box) {
      const isDept = currentRole === "dept" || currentRole === "reviewer";
      g2Box.innerHTML = `
        <div class="checkpoint-gate-card" style="border-color: #00a896;">
          <div class="gate-header">
            <div class="gate-title">
              📌 第二關執行考點：系上外審執行與專家審查意見
              <span class="role-authority-badge" style="background: #00a896;">執行權限：系上外審承辦人 & 專家</span>
            </div>
            <span class="badge ${workflowState.gate2.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">
              當前狀態：${workflowState.gate2.status === 'PASSED' ? '🟢 外審彙整完成' : '🔴 專家建議修正'}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            由<strong>系上外審承辦人</strong>聯繫校外專家寄送資料，專家參照自動檢核結果填寫附件8意見表與附件9個資同意書後，系上彙整結果：
          </p>
          ${isDept ? `
            <div class="gate-controls">
              <div>
                <label style="font-size: 0.8rem; font-weight: bold;">外審審查與系上彙整決策：</label>
                <select id="gate2-action-select" class="form-select" style="width: 100%;">
                  <option value="APPROVE">🟢 外審審查通過 (彙整附件7/8/9完成)</option>
                  <option value="REJECT">🔴 外審建議修正 (專家建議修訂或系上退回調整)</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: bold;">外審專家意見 / 系上彙整說明：</label>
                <input type="text" id="gate2-notes-input" class="form-input" style="width: 100%;" value="${workflowState.gate2.notes}">
              </div>
              <div style="display: flex; align-items: flex-end;">
                <button class="btn btn-primary" id="btn-submit-gate2">送出外審彙整結果</button>
              </div>
            </div>
          ` : `
            <div class="read-only-notice">
              🔒 <strong>權限提醒：</strong>第二關為專業系所外審承辦人與校外專家委員之執行權限。
            </div>
          `}
        </div>
      `;

      if (isDept) {
        document.getElementById("btn-submit-gate2").addEventListener("click", () => {
          const act = document.getElementById("gate2-action-select").value;
          const notes = document.getElementById("gate2-notes-input").value;
          if (act === "APPROVE") {
            workflowState.gate2 = { status: "PASSED", reviewer: "系上承辦人 (張美珍 專家)", date: "115年10月18日", notes: notes };
            workflowState.logs.unshift({ step: "第二關：專家外審", action: "🟢 專家審查通過", user: "系上承辦人 / 專家", time: new Date().toLocaleString(), comment: notes });
            alert("【系上外審執行成功】已完成外審意見與個資同意書彙整！已准予進入第三階段上傳成果報告。");
          } else {
            workflowState.gate2 = { status: "REJECTED", reviewer: "系上承辦人 (王國華 專家)", date: "115年10月18日", notes: notes };
            workflowState.logs.unshift({ step: "第二關：專家外審", action: "🔴 專家建議修正", user: "系上承辦人 / 專家", time: new Date().toLocaleString(), comment: notes });
            alert("【外審意見紀錄成功】專家建議修正，已拋轉至第三階段由系上填寫改善因應措施。");
          }
          runAuditAndUpdateUI();
        });
      }
    }

    // 考點 3：教務處業務承辦人 (最後一關)
    const g3Box = document.getElementById("gate3-control-box");
    if (g3Box) {
      const isAcademic = currentRole === "academic";
      g3Box.innerHTML = `
        <div class="checkpoint-gate-card" style="border-color: #e63946;">
          <div class="gate-header">
            <div class="gate-title">
              📌 最後一關管考考點：教務處成果報告審核與經費核銷結案
              <span class="role-authority-badge" style="background: #e63946;">最後一關管考權限：教務處業務承辦人</span>
            </div>
            <span class="badge ${workflowState.gate3.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">
              當前狀態：${workflowState.gate3.status === 'PASSED' ? '🟢 教務處管考結案核銷' : '🔴 退回系上重新修正'}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            系上送交附件10成果報告書與外審改善對照表後，由<strong>最後一關教務處業務承辦人</strong>進行管考審核與經費核銷：
          </p>
          ${isAcademic ? `
            <div class="gate-controls">
              <div>
                <label style="font-size: 0.8rem; font-weight: bold;">教務處最後一關管考決策：</label>
                <select id="gate3-action-select" class="form-select" style="width: 100%;">
                  <option value="APPROVE">🟢 教務處管考通過 (完成簽核與經常門核銷結案)</option>
                  <option value="REJECT">🔴 教務處退回 (退回系上重新修正改善對照表)</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: bold;">教務處管考簽核意見：</label>
                <input type="text" id="gate3-notes-input" class="form-input" style="width: 100%;" value="${workflowState.gate3.notes}">
              </div>
              <div style="display: flex; align-items: flex-end;">
                <button class="btn btn-success" id="btn-submit-gate3">完成教務處最後一關管考結案</button>
              </div>
            </div>
          ` : `
            <div class="read-only-notice">
              🔒 <strong>管考權限提醒：</strong>最後一關成果報告核銷與結案管考權限歸屬於【教務處業務承辦人】。請切換至教務處承辦人身分進行最後一關管考簽核。
            </div>
          `}
        </div>
      `;

      if (isAcademic) {
        document.getElementById("btn-submit-gate3").addEventListener("click", () => {
          const act = document.getElementById("gate3-action-select").value;
          const notes = document.getElementById("gate3-notes-input").value;
          if (act === "APPROVE") {
            workflowState.gate3 = { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年11月08日", notes: notes };
            workflowState.logs.unshift({ step: "最後一關：成果與核銷", action: "🟢 教務處核銷結案", user: "教務處業務承辦人", time: new Date().toLocaleString(), comment: notes });
            alert("🎉【教務處最後一關管考成功】成果報告與改善對照表核章無誤，完成經費核銷與結案！");
          } else {
            workflowState.gate3 = { status: "REJECTED", reviewer: "教務處業務承辦人", date: "115年11月08日", notes: notes };
            workflowState.logs.unshift({ step: "最後一關：成果與核銷", action: "🔴 教務處退回修正", user: "教務處業務承辦人", time: new Date().toLocaleString(), comment: notes });
            alert("【教務處管考退回成功】已退回系上要求重新修訂附件10改善措施。");
          }
          runAuditAndUpdateUI();
        });
      }
    }
  }

  // 審核履歷
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
