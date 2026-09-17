/* 輔英科技大學「課程結構外審」自動檢核系統 - UI 主控與附件5線上主管簽名及時間戳記 */

document.addEventListener("DOMContentLoaded", () => {
  let currentDataset = window.SampleDataPresets["4nursing"];
  let auditor = new CourseAuditor(currentDataset);
  let currentRole = "academic"; 

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

  const tabItems = document.querySelectorAll(".tab-item");
  const tabContents = document.querySelectorAll(".tab-content");
  const presetSelect = document.getElementById("preset-select");
  const collegeSelect = document.getElementById("college-select");
  const deptSelect = document.getElementById("dept-select");
  const btnLoadPreset = document.getElementById("btn-load-preset");
  const btnRunAudit = document.getElementById("btn-run-audit");
  const btnPrintAtt5 = document.getElementById("btn-print-att5");
  const rolePills = document.querySelectorAll(".role-pill");

  initFooyinCollegeDropdowns();
  loadPresetData("4nursing");

  rolePills.forEach(pill => {
    pill.addEventListener("click", () => {
      rolePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentRole = pill.getAttribute("data-role");
      updateRoleNoticeUI();
      renderHumanCheckpointGates();
    });
  });

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

  function initFooyinCollegeDropdowns() {
    if (!collegeSelect || !deptSelect) return;
    collegeSelect.innerHTML = window.FooyinColleges.map(c => `
      <option value="${c.collegeName}">${c.collegeName}</option>
    `).join("");

    updateDeptOptions(window.FooyinColleges[0].collegeName);

    collegeSelect.addEventListener("change", (e) => {
      updateDeptOptions(e.target.value);
    });

    deptSelect.addEventListener("change", (e) => {
      const selectedDeptName = e.target.value;
      currentDataset.deptName = selectedDeptName;
      currentDataset.collegeName = collegeSelect.value;
      currentDataset.attachment1.unitName = selectedDeptName;
      runAuditAndUpdateUI();
    });
  }

  function updateDeptOptions(collegeName) {
    const col = window.FooyinColleges.find(c => c.collegeName === collegeName);
    if (!col) return;
    deptSelect.innerHTML = col.depts.map(d => `
      <option value="${d.name}">${d.name} (${d.sysDegrees.join("/")})</option>
    `).join("");
  }

  function loadPresetData(key) {
    const preset = window.SampleDataPresets[key];
    if (!preset) return;

    currentDataset = JSON.parse(JSON.stringify(preset));
    auditor = new CourseAuditor(currentDataset);

    if (key === "2elderly") {
      workflowState.gate1 = { status: "REJECTED", reviewer: "教務處業務承辦人", date: "115年09月21日", notes: "教務處初審發現必選修比例(3.0倍)爆表，退回系上修正。" };
      workflowState.gate2 = { status: "PENDING", reviewer: "系上承辦人 (王國華 專家)", date: "-", notes: "待第一階段退回修正完成後外審。" };
      workflowState.gate3 = { status: "PENDING", reviewer: "教務處業務承辦人", date: "-", notes: "待修正完成後由教務處最後管考。" };
    } else {
      workflowState.gate1 = { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年09月20日", notes: "教務處初審核定通過，核發經費。" };
      workflowState.gate2 = { status: "PASSED", reviewer: "系上承辦人 (張美珍 專家)", date: "115年10月15日", notes: "系上完成外審收回附件8意見表。" };
      workflowState.gate3 = { status: "PASSED", reviewer: "教務處業務承辦人", date: "115年11月05日", notes: "教務處最後管考核可，完成核銷結案。" };
    }

    if (collegeSelect && currentDataset.collegeName) {
      collegeSelect.value = currentDataset.collegeName;
      updateDeptOptions(currentDataset.collegeName);
    }
    if (deptSelect && currentDataset.deptName) {
      deptSelect.value = currentDataset.deptName;
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

    // 核心亮點：渲染附件5線上主管簽名控制卡片與附件5標準報表
    renderAttachment5SigningControlHub();
    renderAttachment5Report(auditRes.ruleResults);

    renderAttachment8Report(currentDataset.attachment8);
    renderAttachment9Hub(currentDataset.attachment9);
    renderAttachment10Report(currentDataset.attachment10);

    renderComparisonReportView(auditRes.comparisonReport);
    renderHumanCheckpointGates();
    renderApprovalHistoryLogs();
  }

  // 渲染附件5 主管線上簽名與押時間控制卡片
  function renderAttachment5SigningControlHub() {
    const container = document.getElementById("att5-signing-hub-container");
    if (!container) return;

    const sigs = currentDataset.attachment5Signatures || {
      deptHead: { name: "系主任", title: "系科主任", signed: false, timestamp: "-" },
      dean: { name: "院長", title: "學院院長", signed: false, timestamp: "-" },
      vpaa: { name: "教務長", title: "教務長", signed: false, timestamp: "-" }
    };

    container.innerHTML = `
      <div class="signing-hub-card no-print">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="color: var(--primary-color); font-size: 1.1rem;">✍️ 附件5 主管線上電子簽章與押時間帶入控制區</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted);">主管點擊簽名後，簽章與實時時間戳記將自動帶入下方附件5報表頁尾</span>
        </div>

        <div class="signing-supervisors-grid">
          <!-- 1. 系主任/組長簽核 -->
          <div class="supervisor-sign-box">
            <div>
              <div style="font-weight: bold; color: var(--primary-color); margin-bottom: 0.25rem;">1. 系科主任 / 通識組長</div>
              <div style="font-size: 0.85rem; color: #475569;">簽署主管：<strong>${sigs.deptHead.name || "系主任"}</strong></div>
              <div style="font-size: 0.8rem; margin-top: 0.3rem;">
                簽署狀態：${sigs.deptHead.signed ? `<span class="badge badge-success">☑ 已線上簽章</span>` : `<span class="badge badge-secondary">□ 未簽章</span>`}
              </div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                押時間：${sigs.deptHead.timestamp || "-"}
              </div>
            </div>
            <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;" id="btn-sign-dept-head">✍️ 線上簽名並押時間</button>
              ${sigs.deptHead.signed ? `<button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.5rem;" id="btn-clear-dept-head">清除</button>` : ''}
            </div>
          </div>

          <!-- 2. 院長簽核 -->
          <div class="supervisor-sign-box">
            <div>
              <div style="font-weight: bold; color: var(--primary-color); margin-bottom: 0.25rem;">2. 學院院長 / 通識主任</div>
              <div style="font-size: 0.85rem; color: #475569;">簽署主管：<strong>${sigs.dean.name || "院長"}</strong></div>
              <div style="font-size: 0.8rem; margin-top: 0.3rem;">
                簽署狀態：${sigs.dean.signed ? `<span class="badge badge-success">☑ 已線上簽章</span>` : `<span class="badge badge-secondary">□ 未簽章</span>`}
              </div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                押時間：${sigs.dean.timestamp || "-"}
              </div>
            </div>
            <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;" id="btn-sign-dean">✍️ 線上簽名並押時間</button>
              ${sigs.dean.signed ? `<button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.5rem;" id="btn-clear-dean">清除</button>` : ''}
            </div>
          </div>

          <!-- 3. 教務長簽核 -->
          <div class="supervisor-sign-box">
            <div>
              <div style="font-weight: bold; color: var(--primary-color); margin-bottom: 0.25rem;">3. 教務長 (校課程會召集人)</div>
              <div style="font-size: 0.85rem; color: #475569;">簽署主管：<strong>${sigs.vpaa.name || "教務長"}</strong></div>
              <div style="font-size: 0.8rem; margin-top: 0.3rem;">
                簽署狀態：${sigs.vpaa.signed ? `<span class="badge badge-success">☑ 已線上簽章</span>` : `<span class="badge badge-secondary">□ 未簽章</span>`}
              </div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                押時間：${sigs.vpaa.timestamp || "-"}
              </div>
            </div>
            <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-success" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;" id="btn-sign-vpaa">✍️ 線上簽名並押時間</button>
              ${sigs.vpaa.signed ? `<button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.5rem;" id="btn-clear-vpaa">清除</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // 綁定簽名事件處理
    const getFormattedNow = () => {
      const d = new Date();
      const rocYear = d.getFullYear() - 1911;
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${rocYear}年${mm}月${dd}日 ${hh}:${min}:${ss}`;
    };

    document.getElementById("btn-sign-dept-head").addEventListener("click", () => {
      currentDataset.attachment5Signatures.deptHead.signed = true;
      currentDataset.attachment5Signatures.deptHead.timestamp = getFormattedNow();
      runAuditAndUpdateUI();
    });

    document.getElementById("btn-sign-dean").addEventListener("click", () => {
      currentDataset.attachment5Signatures.dean.signed = true;
      currentDataset.attachment5Signatures.dean.timestamp = getFormattedNow();
      runAuditAndUpdateUI();
    });

    document.getElementById("btn-sign-vpaa").addEventListener("click", () => {
      currentDataset.attachment5Signatures.vpaa.signed = true;
      currentDataset.attachment5Signatures.vpaa.timestamp = getFormattedNow();
      runAuditAndUpdateUI();
    });

    const btnClearDept = document.getElementById("btn-clear-dept-head");
    if (btnClearDept) {
      btnClearDept.addEventListener("click", () => {
        currentDataset.attachment5Signatures.deptHead.signed = false;
        currentDataset.attachment5Signatures.deptHead.timestamp = "-";
        runAuditAndUpdateUI();
      });
    }

    const btnClearDean = document.getElementById("btn-clear-dean");
    if (btnClearDean) {
      btnClearDean.addEventListener("click", () => {
        currentDataset.attachment5Signatures.dean.signed = false;
        currentDataset.attachment5Signatures.dean.timestamp = "-";
        runAuditAndUpdateUI();
      });
    }

    const btnClearVpaa = document.getElementById("btn-clear-vpaa");
    if (btnClearVpaa) {
      btnClearVpaa.addEventListener("click", () => {
        currentDataset.attachment5Signatures.vpaa.signed = false;
        currentDataset.attachment5Signatures.vpaa.timestamp = "-";
        runAuditAndUpdateUI();
      });
    }
  }

  // 100% 還原附件5 並帶入主管線上簽名與時間戳記
  function renderAttachment5Report(ruleResults) {
    const container = document.getElementById("att5-report-view");
    if (!container) return;

    const dept = currentDataset.deptName || "○○系";
    const sys = currentDataset.systemType || "日四技";
    const year = currentDataset.academicYear || "115";
    const sigs = currentDataset.attachment5Signatures || {};

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

    // 格式化頁尾主管簽名與時間戳記
    const formatSigBlock = (sigObj, defaultRoleTitle) => {
      if (!sigObj || !sigObj.signed) {
        return `${defaultRoleTitle}簽章：_______________`;
      }
      return `
        <div>
          ${defaultRoleTitle}簽章：<strong>${sigObj.name}</strong> 
          <span class="digital-seal-stamp">印 ${sigObj.name} 電子印章</span>
          <span class="timestamp-tag">⏱ 簽署時間：${sigObj.timestamp}</span>
        </div>
      `;
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
            <tr>
              <th>條/款/目</th>
              <th>要點內容</th>
              <th>課程序號 / 科目名稱</th>
              <th></th>
              <th></th>
              <th></th>
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

        <!-- 附件5 動態簽名與時間戳記頁尾 -->
        <div class="att5-footer">
          <div>${formatSigBlock(sigs.deptHead, "系科主任/組長")}</div>
          <div>${formatSigBlock(sigs.dean, "學院院長/主任")}</div>
          <div>${formatSigBlock(sigs.vpaa, "教務長")}</div>
        </div>
      </div>
    `;
  }

  // 渲染對比報表與其他視圖
  function renderComparisonReportView(reportItems) {
    const container = document.getElementById("comparison-report-view");
    if (!container) return;

    const dept = currentDataset.deptName || "護理系";
    const college = currentDataset.collegeName || "護理學院";
    const sys = currentDataset.systemType || "日四技";
    const year = currentDataset.academicYear || "115";

    const rowsHtml = reportItems.map(item => `
      <tr>
        <td style="text-align: center;">${item.no}</td>
        <td><span class="badge badge-secondary">${item.category}</span></td>
        <td><strong>${item.itemTarget}</strong></td>
        <td style="color: #991b1b; font-weight: 500;">${item.auditIssue}</td>
        <td style="color: #92400e;">${item.reviewerComment}</td>
        <td style="color: #065f46; font-weight: 600;">${item.deptResponse}</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="attachment5-container">
        <div class="att5-header">
          <div class="att5-title">輔英科技大學 ${college} ${dept}【${sys}】</div>
          <div style="font-size: 1.3rem; font-weight: bold; margin-top: 0.3rem;">各系自動檢核問題及委員再審查回應對比資料報表 (${year}學年度)</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;" class="no-print">
          <div>目前對比項目數：<strong>${reportItems.length}</strong> 項</div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" id="btn-export-comparison-csv">📥 導出 CSV 報表 (Excel相容)</button>
            <button class="btn btn-outline" onclick="window.print()">🖨️ 導出 / 列印 PDF 報表</button>
          </div>
        </div>

        <table class="att5-table">
          <thead>
            <tr>
              <th style="width: 6%;">項次</th>
              <th style="width: 14%;">對比類別</th>
              <th style="width: 18%;">標的科目 / 條文</th>
              <th style="width: 24%;">自動檢核發現問題 (附件5)</th>
              <th style="width: 18%;">外審委員審查意見 (附件8)</th>
              <th style="width: 20%;">系所改善因應措施 (附件10)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="att5-footer" style="margin-top: 2rem;">
          <div>系承辦人：${currentDataset.attachment1.contactPerson || "專員"}</div>
          <div>系主任簽章：______________</div>
          <div>教務處管考簽章：______________</div>
        </div>
      </div>
    `;

    const btnExportCSV = document.getElementById("btn-export-comparison-csv");
    if (btnExportCSV) {
      btnExportCSV.addEventListener("click", () => {
        exportComparisonCSV(reportItems, college, dept, year);
      });
    }
  }

  function exportComparisonCSV(reportItems, college, dept, year) {
    let csvContent = "\uFEFF";
    csvContent += `輔英科技大學 ${college} ${dept} (${year}學年度) 各系自動檢核問題及委員再審查回應對比資料報表\n`;
    csvContent += `項次,對比類別,標的科目/條文,自動檢核發現問題,外審委員審查意見,系所改善因應措施\n`;

    reportItems.forEach(item => {
      const cleanIssue = `"${(item.auditIssue || '').replace(/"/g, '""')}"`;
      const cleanComment = `"${(item.reviewerComment || '').replace(/"/g, '""')}"`;
      const cleanResponse = `"${(item.deptResponse || '').replace(/"/g, '""')}"`;
      csvContent += `${item.no},"${item.category}","${item.itemTarget}",${cleanIssue},${cleanComment},${cleanResponse}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `輔英科大_${dept}_課程結構外審問題與回應對比報表_${year}學年度.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
