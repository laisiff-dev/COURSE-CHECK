/* 輔英科技大學「課程結構外審」自動檢核系統 - 核心自動檢核與對比報表引擎 */

class CourseAuditor {
  constructor(dataset) {
    this.dataset = dataset || {};
    this.sysType = dataset.systemType || "日四技";
    this.att1 = dataset.attachment1 || {};
    this.att2 = dataset.attachment2 || [];
    this.att3 = dataset.attachment3 || [];
    this.att4 = dataset.attachment4 || {};
    this.att7 = dataset.attachment7 || [];
    this.att8 = dataset.attachment8 || {};
    this.att10 = dataset.attachment10 || {};
  }

  // 執行全套檢核作業
  runFullAudit() {
    const ruleResults = this.auditAttachment5Rules();
    const crossResults = this.auditCrossDocumentConsistency();
    const outlineResults = this.auditCourseOutlines();
    const comparisonReport = this.generateComparisonReport(ruleResults, crossResults, outlineResults);

    const totalChecks = ruleResults.length + crossResults.length + outlineResults.length;
    const passCount = [...ruleResults, ...crossResults, ...outlineResults].filter(r => r.status === "PASS").length;
    const failCount = [...ruleResults, ...crossResults, ...outlineResults].filter(r => r.status === "FAIL").length;
    const passRate = totalChecks > 0 ? Math.round((passCount / totalChecks) * 100) : 100;

    return {
      passRate,
      totalChecks,
      passCount,
      failCount,
      ruleResults,
      crossResults,
      outlineResults,
      comparisonReport
    };
  }

  // 自動生成「各系自動檢核問題及委員再審查回應對比資料報表」
  generateComparisonReport(ruleResults, crossResults, outlineResults) {
    const reportItems = [];
    let count = 1;

    // 1. 納入系統條文自動檢核發現之問題 (不符合項目)
    ruleResults.forEach(r => {
      if (r.status === "FAIL") {
        reportItems.push({
          no: count++,
          category: "條文自動檢核異常",
          itemTarget: r.ruleId + " " + r.title,
          auditIssue: `【條文不合規】${r.courseHits}。${r.remark}`,
          reviewerComment: "系統自動檢核揪出不符合條文，需系所說明或修正。",
          deptResponse: "已納入系課程委員會提案討修訂學分與開課規劃。"
        });
      }
    });

    // 2. 納入跨文件比對不一致之問題
    crossResults.forEach(c => {
      if (c.status === "FAIL") {
        reportItems.push({
          no: count++,
          category: "跨表比對不一致",
          itemTarget: c.checkGroup,
          auditIssue: `【跨表異常】${c.title}。${c.details}`,
          reviewerComment: "請系所核對附件2科目表與附件3/4資料之一致性。",
          deptResponse: "已更正對應表格數據，確保五大文件欄位一致。"
        });
      }
    });

    // 3. 納入大綱單元數與英文名稱 Inspections 問題
    outlineResults.forEach(o => {
      if (o.status === "FAIL") {
        reportItems.push({
          no: count++,
          category: "大綱與英文名稱規格",
          itemTarget: o.courseName,
          auditIssue: `【大綱品質異常】${o.remark}`,
          reviewerComment: "大綱單元需符合≥6項原則，英文名稱應符合大小寫規範。",
          deptResponse: "已重新補齊授課大綱單元並修正英文名稱格式。"
        });
      }
    });

    // 4. 納入外審委員審查意見與系所回應對照 (附件8 vs 附件10)
    const tracking = this.att10.improvementTracking || [];
    tracking.forEach(t => {
      reportItems.push({
        no: count++,
        category: "外審委員意見與改善",
        itemTarget: t.courseName || "外審意見",
        auditIssue: `【委員意見】${t.comment}`,
        reviewerComment: t.comment,
        deptResponse: t.response || "已納入改善因應措施並執行。"
      });
    });

    // 若均無異常與意見，填入標準達標證明
    if (reportItems.length === 0) {
      reportItems.push({
        no: 1,
        category: "全套自動檢核通過",
        itemTarget: "全科目表與大綱",
        auditIssue: "系統自動檢核 100% 通過，無異常問題。",
        reviewerComment: "委員審查高度肯定，無補充修訂意見。",
        deptResponse: "繼續保持優質課程規劃結構。"
      });
    }

    return reportItems;
  }

  // 條文檢核邏輯
  auditAttachment5Rules() {
    const results = [];
    const sys = this.sysType;
    const courses = this.att2;

    let totalCredits = 0, genCredits = 0, profCredits = 0;
    let profReqCredits = 0, profElecCredits = 0;
    let healthCredits = 0, digitalCredits = 0, infoProgCredits = 0, englishWorkplaceCredits = 0;
    let serviceLearningFound = false, ethicsCourse = null, engProfTermCourse = null;
    let hasOverseasInternship = false, capstoneCourse = null;
    let year4RequiredCourses = [];

    courses.forEach(c => {
      const cr = Number(c.credits) || 0;
      totalCredits += cr;
      const typeStr = c.type || "";
      const attrArr = c.attr || [];
      const name = c.name || "";
      const year = Number(c.year) || 1;

      if (typeStr.includes("通識")) genCredits += cr;
      else if (typeStr.includes("專業")) {
        profCredits += cr;
        if (typeStr.includes("必修")) {
          profReqCredits += cr;
          if (sys.includes("四技") && year === 4) {
            if (!attrArr.some(a => a.includes("實習") || a.includes("專題") || a.includes("總結性"))) {
              year4RequiredCourses.push(name);
            }
          }
        } else if (typeStr.includes("選修")) profElecCredits += cr;
      }

      if (attrArr.some(a => a.includes("健康主軸")) || name.includes("健康") || name.includes("護理") || name.includes("高齡") || name.includes("照護") || name.includes("解剖")) healthCredits += cr;
      if (attrArr.some(a => a.includes("數位科技")) || name.includes("數位") || name.includes("智慧醫療") || name.includes("人工智慧")) digitalCredits += cr;
      if (attrArr.some(a => a.includes("資訊學群")) || name.includes("程式") || name.includes("資訊")) infoProgCredits += cr;
      if (attrArr.some(a => a.includes("職場英文")) || name.includes("職場英文") || name.includes("第二外語")) englishWorkplaceCredits += cr;
      if (attrArr.some(a => a.includes("服務學習")) || name.includes("服務學習")) serviceLearningFound = true;
      if (attrArr.some(a => a.includes("職場倫理")) || name.includes("倫理")) ethicsCourse = c;
      if (attrArr.some(a => a.includes("職場英文術語")) || name.includes("職場英文術語")) engProfTermCourse = c;
      if (attrArr.some(a => a.includes("海外實習")) || name.includes("海外")) hasOverseasInternship = true;
      if (attrArr.some(a => a.includes("總結性")) || name.includes("總結性")) capstoneCourse = c;
    });

    let reqGen = sys.includes("五專") ? 70 : (sys.includes("四技") ? 32 : (sys.includes("二技") ? 16 : 0));
    results.push({
      ruleId: "六/(一)/2", title: "通識課程總學分數檢核", category: "通識課程規劃", target: sys,
      status: genCredits >= reqGen ? "PASS" : "FAIL",
      courseHits: `規劃通識學分：${genCredits} 分 (應修門檻 ${reqGen} 分)`,
      remark: genCredits >= reqGen ? `符合規定。實際規劃 ${genCredits} 學分已達門檻 ${reqGen} 學分。` : `不符合。實際規劃 ${genCredits} 學分未達規定門檻 ${reqGen} 學分。`
    });

    if (sys.includes("二技") || sys.includes("四技")) {
      results.push({
        ruleId: "六/(一)/3", title: "資訊學群/程式設計2學分", category: "通識課程規劃", target: "二技/四技",
        status: infoProgCredits >= 2 ? "PASS" : "FAIL", courseHits: `資訊程式學分：${infoProgCredits} 分`,
        remark: infoProgCredits >= 2 ? `符合規定。已規劃 ${infoProgCredits} 學分程式設計/資訊學群課程。` : `不符合。資訊學群/程式設計課程未達 2 學分。`
      });

      results.push({
        ruleId: "六/(一)/4", title: "職場英文/第二外語2學分", category: "通識課程規劃", target: "二技/四技",
        status: englishWorkplaceCredits >= 2 ? "PASS" : "FAIL", courseHits: `職場英文學分：${englishWorkplaceCredits} 分`,
        remark: englishWorkplaceCredits >= 2 ? `符合規定。已規劃 ${englishWorkplaceCredits} 學分職場英文或第二外語課程。` : `不符合。職場英文或第二外語課程未達 2 學分。`
      });
    }

    if (sys.includes("日二技") || sys.includes("日四技")) {
      results.push({
        ruleId: "六/(一)/5", title: "服務學習必修課程", category: "通識課程規劃", target: "日二技/日四技",
        status: serviceLearningFound ? "PASS" : "FAIL", courseHits: serviceLearningFound ? "已規劃服務學習課程" : "未發現服務學習課程",
        remark: serviceLearningFound ? "符合規定。已規劃服務學習課程並列為必修。" : "不符合。未包含服務學習必修課程。"
      });
    }

    if (sys.includes("二技") || sys.includes("四技")) {
      const ratio = profElecCredits > 0 ? (profReqCredits / profElecCredits).toFixed(2) : 99;
      const pass = profReqCredits <= profElecCredits * 2;
      results.push({
        ruleId: "六/(二)/3", title: "專業必修不超過選修2倍", category: "專業課程規劃", target: "二技/四技",
        status: pass ? "PASS" : "FAIL", courseHits: `必修：${profReqCredits} 分 / 選修：${profElecCredits} 分 (比值 ${ratio})`,
        remark: pass ? `符合規定。專業必修(${profReqCredits})與選修(${profElecCredits})比例為 ${ratio} 倍（低於上限2.0倍）。` : `不符合。專業必修學分(${profReqCredits})已超過選修學分(${profElecCredits})之 2 倍（目前為 ${ratio} 倍）。`
      });

      const targetHealth = Math.ceil(profCredits * 0.1);
      const passHealth = healthCredits >= targetHealth;
      const ratioPct = profCredits > 0 ? Math.round((healthCredits / profCredits) * 100) : 0;
      results.push({
        ruleId: "六/(二)/4", title: "健康主軸課程1/10學分", category: "專業課程規劃", target: "二技/四技",
        status: passHealth ? "PASS" : "FAIL", courseHits: `健康主軸：${healthCredits} 分 / 專業總學分：${profCredits} 分 (${ratioPct}%)`,
        remark: passHealth ? `符合規定。健康主軸學分佔專業學分之 ${ratioPct}% (已達 10% 門檻)。` : `不符合。健康主軸學分(${healthCredits})未達專業總學分(${profCredits})之 10% (${targetHealth}分)。`
      });

      results.push({
        ruleId: "六/(二)/5", title: "數位科技相關課程至少2學分", category: "專業課程規劃", target: "二技/四技",
        status: digitalCredits >= 2 ? "PASS" : "FAIL", courseHits: `數位科技學分：${digitalCredits} 分`,
        remark: digitalCredits >= 2 ? `符合規定。已規劃 ${digitalCredits} 學分數位科技相關課程。` : `不符合。數位科技相關課程未達 2 學分。`
      });

      let passEthics = false, msgEthics = "";
      if (ethicsCourse) {
        const y = Number(ethicsCourse.year) || 1;
        const isHighYear = sys.includes("四技") ? (y >= 3) : (y >= 2);
        if (isHighYear && Number(ethicsCourse.credits) >= 2) {
          passEthics = true;
          msgEthics = `符合規定。已規劃「${ethicsCourse.name}」(${ethicsCourse.credits}學分)開設於高年級(${y}年級)。`;
        } else if (!isHighYear) msgEthics = `不符合。「${ethicsCourse.name}」開設於 ${y} 年級，未符高年級規定。`;
        else msgEthics = `不符合。「${ethicsCourse.name}」學分數不足 2 學分。`;
      } else msgEthics = "不符合。未發現職場專業倫理必修課程。";

      results.push({
        ruleId: "六/(二)/6, 八/(二)/5", title: "職場專業倫理必修且高年級開設", category: "專業課程規劃", target: "二技/四技",
        status: passEthics ? "PASS" : "FAIL", courseHits: ethicsCourse ? `${ethicsCourse.name} (${ethicsCourse.year}年級, ${ethicsCourse.credits}學分)` : "未發現倫理課程",
        remark: msgEthics
      });
    }

    if (sys.includes("四技")) {
      const passTerm = !!engProfTermCourse && Number(engProfTermCourse.credits) >= 2;
      results.push({
        ruleId: "六/(二)/7", title: "專業職場英文術語必修2學分", category: "專業課程規劃", target: "四技",
        status: passTerm ? "PASS" : "FAIL", courseHits: engProfTermCourse ? `${engProfTermCourse.name} (${engProfTermCourse.credits}學分)` : "未發現",
        remark: passTerm ? `符合規定。已規劃「${engProfTermCourse.name}」2學分必修。` : `不符合。未規劃 2 學分專業職場英文術語必修課程。`
      });
    }

    if (sys.includes("日四技")) {
      results.push({
        ruleId: "六/(二)/9", title: "海外實習(見習)選修課程", category: "專業課程規劃", target: "日四技",
        status: hasOverseasInternship ? "PASS" : "FAIL", courseHits: hasOverseasInternship ? "已規劃海外實習課程" : "未發現海外實習課程",
        remark: hasOverseasInternship ? "符合規定。已規劃海外實習/見習選修課程。" : "不符合。未規劃海外實習/見習選修課程。"
      });

      let passCap = false, msgCap = "";
      if (capstoneCourse) {
        const y = Number(capstoneCourse.year) || 1;
        if (y >= 3) { passCap = true; msgCap = `符合規定。總結性課程「${capstoneCourse.name}」開設於高年級(${y}年級)。`; }
        else msgCap = `不符合。總結性課程「${capstoneCourse.name}」開設於 ${y} 年級，未符高年級規定。`;
      } else msgCap = "不符合。未規劃總結性必修課程。";

      results.push({
        ruleId: "六/(二)/11, 八/(二)/6", title: "日四技總結性必修課程且高年級開設", category: "專業課程規劃", target: "日四技",
        status: passCap ? "PASS" : "FAIL", courseHits: capstoneCourse ? `${capstoneCourse.name} (${capstoneCourse.year}年級)` : "未發現總結性課程",
        remark: msgCap
      });
    }

    if (sys.includes("四技")) {
      const passY4 = year4RequiredCourses.length === 0;
      results.push({
        ruleId: "八/(二)/7", title: "四技第四學年不排普通必修課", category: "排課時段與年級限制", target: "四技",
        status: passY4 ? "PASS" : "FAIL", courseHits: passY4 ? "無違規排必修" : `違規必修科目：${year4RequiredCourses.join(", ")}`,
        remark: passY4 ? "符合規定。最後一學年未排定一般必修課程（例外課程除外）。" : `不符合。第4學年違規排入一般必修課：${year4RequiredCourses.join(", ")}。`
      });
    }

    return results;
  }

  auditCrossDocumentConsistency() {
    const results = [];
    let att3Mismatch = [];
    this.att3.forEach(item3 => {
      const matchInAtt2 = this.att2.find(c => c.name === item3.courseName);
      if (!matchInAtt2) att3Mismatch.push(`大綱表科目「${item3.courseName}」未存在於附件2科目表中`);
    });

    results.push({
      checkGroup: "跨表一致性 (附件2 vs 附件3)", title: "科目表與課程概述大綱之科目名稱比對",
      status: att3Mismatch.length === 0 ? "PASS" : "FAIL",
      details: att3Mismatch.length === 0 ? "附件2科目表與附件3課程大綱表之科目名稱 100% 比對一致。" : att3Mismatch.join("； ")
    });

    if (this.att4.matrix) {
      let missingInAtt4 = [];
      this.att4.matrix.forEach(m => {
        const found = this.att2.find(c => c.name === m.courseName);
        if (!found) missingInAtt4.push(`關聯表科目「${m.courseName}」未在科目表中`);
      });
      results.push({
        checkGroup: "跨表一致性 (附件2 vs 附件4)", title: "科目表與核心能力關聯表科目對應比對",
        status: missingInAtt4.length === 0 ? "PASS" : "FAIL",
        details: missingInAtt4.length === 0 ? "附件4核心能力關聯表所有科目均能對應至附件2科目表。" : missingInAtt4.join("； ")
      });
    }

    const reqReviewers = Number(this.att1.reviewersCount) || 2;
    const actualReviewers = this.att7.length;
    results.push({
      checkGroup: "文件與人員驗證 (附件1 vs 附件7)", title: "外審專家人數與計畫申請書符合度",
      status: actualReviewers >= reqReviewers ? "PASS" : "FAIL",
      details: actualReviewers >= reqReviewers ? `申請計畫預定 ${reqReviewers} 位審查委員，附件7已檢附 ${actualReviewers} 位專家簡歷。` : `申請計畫要求 ${reqReviewers} 位委員，但附件7僅提供 ${actualReviewers} 位專家簡歷。`
    });

    return results;
  }

  auditCourseOutlines() {
    const results = [];
    this.att3.forEach(item => {
      const unitCount = item.units ? item.units.length : 0;
      const isMicro = item.courseName ? item.courseName.includes("微學分") : false;
      const minUnits = isMicro ? 3 : 6;
      const passUnits = unitCount >= minUnits;

      const enName = item.enCourseName || "";
      const lowerWords = ["and", "or", "in", "on", "at", "to", "for", "with", "by", "of", "the", "a", "an"];
      const words = enName.split(/\s+/);
      let casingError = false;
      words.forEach((w, idx) => {
        const cleanW = w.toLowerCase().replace(/[^a-z]/g, "");
        if (cleanW) {
          if (idx !== 0 && lowerWords.includes(cleanW)) {
            if (w[0] !== w[0].toLowerCase()) casingError = true;
          } else {
            if (w[0] !== w[0].toUpperCase()) casingError = true;
          }
        }
      });

      results.push({
        courseName: item.courseName, enName: item.enCourseName, unitCount: unitCount, minRequired: minUnits,
        passUnits: passUnits, passCasing: !casingError, status: (passUnits && !casingError) ? "PASS" : "FAIL",
        remark: `${passUnits ? '✅ 大綱單元數符合(' + unitCount + '項)' : '❌ 大綱單元數不足(' + unitCount + '項, 須>=' + minUnits + '項)'}; ${!casingError ? '✅ 英文名稱大小寫符合' : '⚠️ 英文名稱大小寫需調整'}`
      });
    });

    return results;
  }
}

window.CourseAuditor = CourseAuditor;
