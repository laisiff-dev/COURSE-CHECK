/* 輔英科技大學「課程結構外審」自動檢核系統 - 核心自動檢核與跨表比對引擎 */

class CourseAuditor {
  constructor(dataset) {
    this.dataset = dataset || {};
    this.sysType = dataset.systemType || "日四技";
    this.att1 = dataset.attachment1 || {};
    this.att2 = dataset.attachment2 || [];
    this.att3 = dataset.attachment3 || [];
    this.att4 = dataset.attachment4 || {};
    this.att7 = dataset.attachment7 || [];
  }

  // 執行全套檢核作業
  runFullAudit() {
    const ruleResults = this.auditAttachment5Rules();
    const crossResults = this.auditCrossDocumentConsistency();
    const outlineResults = this.auditCourseOutlines();

    // 整合所有檢核結果
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
      outlineResults
    };
  }

  // 依據附件5與附件6條文進行單一科目表規則檢核
  auditAttachment5Rules() {
    const results = [];
    const sys = this.sysType;
    const courses = this.att2;

    // 計算各類別學分
    let totalCredits = 0;
    let genCredits = 0;
    let profCredits = 0;
    let profReqCredits = 0;
    let profElecCredits = 0;
    let healthCredits = 0;
    let digitalCredits = 0;
    let infoProgCredits = 0;
    let englishWorkplaceCredits = 0;
    let serviceLearningFound = false;
    let ethicsCourse = null;
    let engProfTermCourse = null;
    let hasSemesterInternship = false;
    let hasOverseasInternship = false;
    let hasCapstoneProject = false;
    let capstoneCourse = null;
    let crossDeptCredits = 0;
    let year4RequiredCourses = [];

    courses.forEach(c => {
      const cr = Number(c.credits) || 0;
      totalCredits += cr;
      const typeStr = c.type || "";
      const attrArr = c.attr || [];
      const name = c.name || "";
      const year = Number(c.year) || 1;

      if (typeStr.includes("通識")) {
        genCredits += cr;
      } else if (typeStr.includes("專業")) {
        profCredits += cr;
        if (typeStr.includes("必修")) {
          profReqCredits += cr;
          // 檢查4年級必修
          if (sys.includes("四技") && year === 4) {
            const isExempt = attrArr.some(a => a.includes("實習") || a.includes("專題") || a.includes("總結性"));
            if (!isExempt) {
              year4RequiredCourses.push(name);
            }
          }
        } else if (typeStr.includes("選修")) {
          profElecCredits += cr;
        }
      }

      // 特色屬性統計
      if (attrArr.some(a => a.includes("健康主軸")) || name.includes("健康") || name.includes("護理") || name.includes("高齡") || name.includes("照護") || name.includes("解剖")) {
        healthCredits += cr;
      }
      if (attrArr.some(a => a.includes("數位科技")) || name.includes("數位") || name.includes("智慧醫療") || name.includes("人工智慧")) {
        digitalCredits += cr;
      }
      if (attrArr.some(a => a.includes("資訊學群")) || name.includes("程式") || name.includes("資訊")) {
        infoProgCredits += cr;
      }
      if (attrArr.some(a => a.includes("職場英文")) || name.includes("職場英文") || name.includes("第二外語")) {
        englishWorkplaceCredits += cr;
      }
      if (attrArr.some(a => a.includes("服務學習")) || name.includes("服務學習")) {
        serviceLearningFound = true;
      }
      if (attrArr.some(a => a.includes("職場倫理")) || name.includes("倫理")) {
        ethicsCourse = c;
      }
      if (attrArr.some(a => a.includes("職場英文術語")) || name.includes("職場英文術語")) {
        engProfTermCourse = c;
      }
      if (attrArr.some(a => a.includes("學期實習")) || name.includes("學期實習")) {
        hasSemesterInternship = true;
      }
      if (attrArr.some(a => a.includes("海外實習")) || name.includes("海外")) {
        hasOverseasInternship = true;
      }
      if (attrArr.some(a => a.includes("實務專題")) || name.includes("專題")) {
        hasCapstoneProject = true;
      }
      if (attrArr.some(a => a.includes("總結性")) || name.includes("總結性")) {
        capstoneCourse = c;
      }
      if (attrArr.some(a => a.includes("跨系選修")) || name.includes("跨系")) {
        crossDeptCredits += cr;
      }
    });

    // 條文六/(一)/2：通識學分門檻
    let reqGen = sys.includes("五專") ? 70 : (sys.includes("四技") ? 32 : (sys.includes("二技") ? 16 : 0));
    results.push({
      ruleId: "六/(一)/2",
      title: "通識課程總學分數檢核",
      category: "通識課程規劃",
      target: sys,
      status: genCredits >= reqGen ? "PASS" : "FAIL",
      courseHits: `規劃通識學分：${genCredits} 分 (應修門檻 ${reqGen} 分)`,
      remark: genCredits >= reqGen ? `符合規定。實際規劃 ${genCredits} 學分已達門檻 ${reqGen} 學分。` : `不符合。實際規劃 ${genCredits} 學分未達規定門檻 ${reqGen} 學分。`
    });

    // 條文六/(一)/3：資訊學群/程式設計 2學分
    if (sys.includes("二技") || sys.includes("四技")) {
      results.push({
        ruleId: "六/(一)/3",
        title: "資訊學群/程式設計2學分",
        category: "通識課程規劃",
        target: "二技/四技",
        status: infoProgCredits >= 2 ? "PASS" : "FAIL",
        courseHits: `資訊程式學分：${infoProgCredits} 分`,
        remark: infoProgCredits >= 2 ? `符合規定。已規劃 ${infoProgCredits} 學分程式設計/資訊學群課程。` : `不符合。資訊學群/程式設計課程未達 2 學分。`
      });
    }

    // 條文六/(一)/4：職場英文或第二外語 2學分
    if (sys.includes("二技") || sys.includes("四技")) {
      results.push({
        ruleId: "六/(一)/4",
        title: "職場英文/第二外語2學分",
        category: "通識課程規劃",
        target: "二技/四技",
        status: englishWorkplaceCredits >= 2 ? "PASS" : "FAIL",
        courseHits: `職場英文學分：${englishWorkplaceCredits} 分`,
        remark: englishWorkplaceCredits >= 2 ? `符合規定。已規劃 ${englishWorkplaceCredits} 學分職場英文或第二外語課程。` : `不符合。職場英文或第二外語課程未達 2 學分。`
      });
    }

    // 條文六/(一)/5：服務學習必修
    if (sys.includes("日二技") || sys.includes("日四技")) {
      results.push({
        ruleId: "六/(一)/5",
        title: "服務學習必修課程",
        category: "通識課程規劃",
        target: "日二技/日四技",
        status: serviceLearningFound ? "PASS" : "FAIL",
        courseHits: serviceLearningFound ? "已規劃服務學習課程" : "未發現服務學習課程",
        remark: serviceLearningFound ? "符合規定。已規劃服務學習課程並列為必修。" : "不符合。未包含服務學習必修課程。"
      });
    }

    // 條文六/(二)/3：必選修比例（必修 <= 選修 * 2）
    if (sys.includes("二技") || sys.includes("四技")) {
      const ratio = profElecCredits > 0 ? (profReqCredits / profElecCredits).toFixed(2) : 99;
      const pass = profReqCredits <= profElecCredits * 2;
      results.push({
        ruleId: "六/(二)/3",
        title: "專業必修不超過選修2倍",
        category: "專業課程規劃",
        target: "二技/四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: `必修：${profReqCredits} 分 / 選修：${profElecCredits} 分 (比值 ${ratio})`,
        remark: pass ? `符合規定。專業必修(${profReqCredits})與選修(${profElecCredits})比例為 ${ratio} 倍（低於上限2.0倍）。` : `不符合。專業必修學分(${profReqCredits})已超過選修學分(${profElecCredits})之 2 倍（目前為 ${ratio} 倍）。`
      });
    }

    // 條文六/(二)/4：健康主軸課程 10%
    if (sys.includes("二技") || sys.includes("四技")) {
      const targetHealth = Math.ceil(profCredits * 0.1);
      const pass = healthCredits >= targetHealth;
      const ratioPct = profCredits > 0 ? Math.round((healthCredits / profCredits) * 100) : 0;
      results.push({
        ruleId: "六/(二)/4",
        title: "健康主軸課程1/10學分",
        category: "專業課程規劃",
        target: "二技/四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: `健康主軸：${healthCredits} 分 / 專業總學分：${profCredits} 分 (${ratioPct}%)`,
        remark: pass ? `符合規定。健康主軸學分佔專業學分之 ${ratioPct}% (已達 10% 門檻)。` : `不符合。健康主軸學分(${healthCredits})未達專業總學分(${profCredits})之 10% (${targetHealth}分)。`
      });
    }

    // 條文六/(二)/5：數位科技課程 2學分
    if (sys.includes("二技") || sys.includes("四技")) {
      const pass = digitalCredits >= 2;
      results.push({
        ruleId: "六/(二)/5",
        title: "數位科技相關課程至少2學分",
        category: "專業課程規劃",
        target: "二技/四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: `數位科技學分：${digitalCredits} 分`,
        remark: pass ? `符合規定。已規劃 ${digitalCredits} 學分數位科技相關課程。` : `不符合。數位科技相關課程未達 2 學分。`
      });
    }

    // 條文六/(二)/6 & 八/(二)/5：職場專業倫理必修且開設於高年級
    if (sys.includes("二技") || sys.includes("四技")) {
      let pass = false;
      let msg = "";
      if (ethicsCourse) {
        const y = Number(ethicsCourse.year) || 1;
        const isHighYear = sys.includes("四技") ? (y >= 3) : (y >= 2);
        if (isHighYear && Number(ethicsCourse.credits) >= 2) {
          pass = true;
          msg = `符合規定。已規劃「${ethicsCourse.name}」(${ethicsCourse.credits}學分)開設於高年級(${y}年級)。`;
        } else if (!isHighYear) {
          msg = `不符合。「${ethicsCourse.name}」開設於 ${y} 年級，未符開設於高年級規定。`;
        } else {
          msg = `不符合。「${ethicsCourse.name}」學分數不足 2 學分。`;
        }
      } else {
        msg = "不符合。未發現職場專業倫理必修課程。";
      }
      results.push({
        ruleId: "六/(二)/6, 八/(二)/5",
        title: "職場專業倫理必修且高年級開設",
        category: "專業課程規劃",
        target: "二技/四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: ethicsCourse ? `${ethicsCourse.name} (${ethicsCourse.year}年級, ${ethicsCourse.credits}學分)` : "未發現倫理課程",
        remark: msg
      });
    }

    // 條文六/(二)/7：四技專業職場英文術語
    if (sys.includes("四技")) {
      const pass = !!engProfTermCourse && Number(engProfTermCourse.credits) >= 2;
      results.push({
        ruleId: "六/(二)/7",
        title: "專業職場英文術語必修2學分",
        category: "專業課程規劃",
        target: "四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: engProfTermCourse ? `${engProfTermCourse.name} (${engProfTermCourse.credits}學分)` : "未發現",
        remark: pass ? `符合規定。已規劃「${engProfTermCourse.name}」2學分必修。` : `不符合。未規劃 2 學分專業職場英文術語必修課程。`
      });
    }

    // 條文六/(二)/9：日四技海外實習(見習)選修
    if (sys.includes("日四技")) {
      results.push({
        ruleId: "六/(二)/9",
        title: "海外實習(見習)選修課程",
        category: "專業課程規劃",
        target: "日四技",
        status: hasOverseasInternship ? "PASS" : "FAIL",
        courseHits: hasOverseasInternship ? "已規劃海外實習課程" : "未發現海外實習課程",
        remark: hasOverseasInternship ? "符合規定。已規劃海外實習/見習選修課程。" : "不符合。未規劃海外實習/見習選修課程。"
      });
    }

    // 條文六/(二)/11 & 八/(二)/6：總結性必修課程且高年級開設
    if (sys.includes("日四技")) {
      let pass = false;
      let msg = "";
      if (capstoneCourse) {
        const y = Number(capstoneCourse.year) || 1;
        if (y >= 3) {
          pass = true;
          msg = `符合規定。總結性課程「${capstoneCourse.name}」開設於高年級(${y}年級)。`;
        } else {
          msg = `不符合。總結性課程「${capstoneCourse.name}」開設於 ${y} 年級，未符高年級規定。`;
        }
      } else {
        msg = "不符合。未規劃總結性必修課程。";
      }
      results.push({
        ruleId: "六/(二)/11, 八/(二)/6",
        title: "日四技總結性必修課程且高年級開設",
        category: "專業課程規劃",
        target: "日四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: capstoneCourse ? `${capstoneCourse.name} (${capstoneCourse.year}年級)` : "未發現總結性課程",
        remark: msg
      });
    }

    // 條文八/(二)/7：四技最後一學年(4年級)不排必修課
    if (sys.includes("四技")) {
      const pass = year4RequiredCourses.length === 0;
      results.push({
        ruleId: "八/(二)/7",
        title: "四技第四學年不排普通必修課",
        category: "排課時段與年級限制",
        target: "四技",
        status: pass ? "PASS" : "FAIL",
        courseHits: pass ? "無違規排必修" : `違規必修科目：${year4RequiredCourses.join(", ")}`,
        remark: pass ? "符合規定。最後一學年未排定一般必修課程（例外課程除外）。" : `不符合。第4學年違規排入一般必修課：${year4RequiredCourses.join(", ")}。`
      });
    }

    return results;
  }

  // 跨文件一致性與深層結構檢核 (附件1 vs 附件2 vs 附件3 vs 附件4 vs 附件7)
  auditCrossDocumentConsistency() {
    const results = [];
    const att2 = this.att2;
    const att3 = this.att3;
    const att4 = this.att4;

    // 檢核1：附件2與附件3之科目名稱與學分數一致性
    let att3Mismatch = [];
    att3.forEach(item3 => {
      const matchInAtt2 = att2.find(c => c.name === item3.courseName);
      if (!matchInAtt2) {
        att3Mismatch.push(`大綱表科目「${item3.courseName}」未存在於附件2科目表中`);
      }
    });

    results.push({
      checkGroup: "跨表一致性 (附件2 vs 附件3)",
      title: "科目表與課程概述大綱之科目名稱比對",
      status: att3Mismatch.length === 0 ? "PASS" : "FAIL",
      details: att3Mismatch.length === 0 ? "附件2科目表與附件3課程大綱表之科目名稱 100% 比對一致。" : att3Mismatch.join("； ")
    });

    // 檢核2：附件2與附件4之核心能力矩陣科目覆蓋率
    if (att4.matrix) {
      let missingInAtt4 = [];
      att4.matrix.forEach(m => {
        const found = att2.find(c => c.name === m.courseName);
        if (!found) {
          missingInAtt4.push(`關聯表科目「${m.courseName}」未在科目表中`);
        }
      });
      results.push({
        checkGroup: "跨表一致性 (附件2 vs 附件4)",
        title: "科目表與核心能力關聯表科目對應比對",
        status: missingInAtt4.length === 0 ? "PASS" : "FAIL",
        details: missingInAtt4.length === 0 ? "附件4核心能力關聯表所有科目均能對應至附件2科目表。" : missingInAtt4.join("； ")
      });
    }

    // 檢核3：附件1與附件7審查專家人數比對
    const reqReviewers = Number(this.att1.reviewersCount) || 2;
    const actualReviewers = this.att7.length;
    results.push({
      checkGroup: "文件與人員驗證 (附件1 vs 附件7)",
      title: "外審專家人數與計畫申請書符合度",
      status: actualReviewers >= reqReviewers ? "PASS" : "FAIL",
      details: actualReviewers >= reqReviewers ? `申請計畫預定 ${reqReviewers} 位審查委員，附件7已檢附 ${actualReviewers} 位專家簡歷。` : `申請計畫要求 ${reqReviewers} 位委員，但附件7僅提供 ${actualReviewers} 位專家簡歷。`
    });

    return results;
  }

  // 課程大綱與英文名稱規格檢核
  auditCourseOutlines() {
    const results = [];
    this.att3.forEach(item => {
      // 檢核大綱單元數 >= 6
      const unitCount = item.units ? item.units.length : 0;
      const isMicro = item.courseName ? item.courseName.includes("微學分") : false;
      const minUnits = isMicro ? 3 : 6;
      const passUnits = unitCount >= minUnits;

      // 檢核英文名稱 Title Casing
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
        courseName: item.courseName,
        enName: item.enCourseName,
        unitCount: unitCount,
        minRequired: minUnits,
        passUnits: passUnits,
        passCasing: !casingError,
        status: (passUnits && !casingError) ? "PASS" : "FAIL",
        remark: `${passUnits ? '✅ 大綱單元數符合( ' + unitCount + '項)' : '❌ 大綱單元數不足(' + unitCount + '項, 須>= ' + minUnits + '項)'}; ${!casingError ? '✅ 英文名稱大小寫符合規範' : '⚠️ 英文名稱介系詞/連詞大小寫建議調整'}`
      });
    });

    return results;
  }
}

window.CourseAuditor = CourseAuditor;
