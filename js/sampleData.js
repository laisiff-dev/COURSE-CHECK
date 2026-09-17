/* 輔英科技大學「課程結構外審」自動檢核系統 - 學院系所對照與預設資料庫 */

// 輔英科技大學現有學院與系所完整架構
window.FooyinColleges = [
  {
    collegeName: "護理學院",
    depts: [
      { id: "nursing", name: "護理系", sysDegrees: ["日四技", "日二技", "碩士班", "學士後護理系"] },
      { id: "elderly", name: "高齡照護健康管理系", sysDegrees: ["日四技", "日二技"] }
    ]
  },
  {
    collegeName: "醫學與健康學院",
    depts: [
      { id: "medlab", name: "醫學檢驗生物技術系", sysDegrees: ["日四技", "碩士班"] },
      { id: "pt", name: "物理治療系", sysDegrees: ["日四技"] },
      { id: "nutrition", name: "保健營養系", sysDegrees: ["日四技", "碩士班"] },
      { id: "rad", name: "醫學影像暨放射科學系", sysDegrees: ["日四技"] }
    ]
  },
  {
    collegeName: "環境與生命學院",
    depts: [
      { id: "osh", name: "職業安全衛生系", sysDegrees: ["日四技", "碩士班"] },
      { id: "env", name: "環境工程衛生系", sysDegrees: ["日四技"] },
      { id: "chem", name: "應用化學系", sysDegrees: ["日四技"] },
      { id: "biotech", name: "生物科技系", sysDegrees: ["日四技"] }
    ]
  },
  {
    collegeName: "人文與管理學院",
    depts: [
      { id: "child", name: "幼兒保育系", sysDegrees: ["日四技", "日二技"] },
      { id: "im", name: "資訊管理系", sysDegrees: ["日四技", "五專"] },
      { id: "hbm", name: "健康事業管理系", sysDegrees: ["日四技", "碩士班"] },
      { id: "leisure", name: "休閒與遊憩事業管理系", sysDegrees: ["日四技"] },
      { id: "fl", name: "應用外語系", sysDegrees: ["日四技"] }
    ]
  },
  {
    collegeName: "共同教育中心",
    depts: [
      { id: "ge", name: "通識教育中心", sysDegrees: ["全校各學制"] }
    ]
  }
];

window.SampleDataPresets = {
  "4nursing": {
    name: "115學年度 護理學院 護理系【四年制日間部】(標準符合與對比報表範例)",
    collegeName: "護理學院",
    deptName: "護理系",
    systemType: "日四技",
    academicYear: "115",
    totalGenCreditsRequired: 32,
    totalProfCreditsRequired: 96,
    
    attachment1: {
      unitName: "護理系",
      applyDate: "115年09月15日",
      purpose: "1. 提升本校課程規劃品質，強化護理系課程結構。\n2. 通盤檢討護理系教育目標、核心能力與課程之關聯性。",
      reviewersCount: 3,
      budget: 8771,
      contactPerson: "林專員",
      contactPhone: "07-7811151#2100"
    },
    
    attachment2: [
      { id: 1, type: "通識必修", code: "GE101", name: "國文與閱讀", enName: "Chinese and Reading", credits: 2, hours: 2, labHours: 0, year: 1, semester: 1, attr: ["基礎通識"] },
      { id: 2, type: "通識必修", code: "GE102", name: "實用英文", enName: "Practical English", credits: 2, hours: 2, labHours: 0, year: 1, semester: 1, attr: ["基礎通識", "職場英文"] },
      { id: 3, type: "通識必修", code: "GE103", name: "程式設計與邏輯思維", enName: "Programming and Logical Thinking", credits: 2, hours: 2, labHours: 0, year: 1, semester: 2, attr: ["基礎通識", "資訊學群", "數位科技"] },
      { id: 4, type: "通識必修", code: "GE104", name: "服務學習與實踐", enName: "Service Learning and Practice", credits: 2, hours: 2, labHours: 0, year: 1, semester: 2, attr: ["服務學習"] },
      { id: 5, type: "通識博雅", code: "GE201", name: "健康與永續生活", enName: "Health and Sustainable Life", credits: 2, hours: 2, labHours: 0, year: 2, semester: 1, attr: ["博雅通識", "健康主軸"] },
      { id: 6, type: "通識博雅", code: "GE202", name: "職場第二外語(日語)", enName: "Workplace Second Foreign Language Japanese", credits: 2, hours: 2, labHours: 0, year: 2, semester: 2, attr: ["博雅通識", "第二外語"] },
      { id: 10, type: "專業必修", code: "NU101", name: "解剖生理學", enName: "Anatomy and Physiology", credits: 4, hours: 4, labHours: 0, year: 1, semester: 1, attr: ["專業必修", "健康主軸"] },
      { id: 11, type: "專業必修", code: "NU102", name: "基本護理學與實驗", enName: "Fundamental Nursing and Laboratory", credits: 4, hours: 3, labHours: 3, year: 1, semester: 2, attr: ["專業必修", "健康主軸"] },
      { id: 12, type: "專業必修", code: "NU201", name: "內外科護理學", enName: "Medical Surgical Nursing", credits: 6, hours: 6, labHours: 0, year: 2, semester: 1, attr: ["專業必修", "健康主軸"] },
      { id: 13, type: "專業必修", code: "NU202", name: "護理倫理與職場專業規範", enName: "Nursing Ethics and Workplace Professional Standards", credits: 2, hours: 2, labHours: 0, year: 3, semester: 1, attr: ["專業必修", "職場倫理"] },
      { id: 14, type: "專業必修", code: "NU203", name: "專業職場英文術語", enName: "Professional Workplace English Terminology", credits: 2, hours: 2, labHours: 0, year: 2, semester: 2, attr: ["專業必修", "職場英文術語", "全英授課"] },
      { id: 15, type: "專業必修", code: "NU301", name: "智慧醫療與數位科技護理應用", enName: "Smart Healthcare and Digital Tech Nursing Application", credits: 2, hours: 2, labHours: 0, year: 3, semester: 1, attr: ["專業必修", "數位科技"] },
      { id: 16, type: "專業必修", code: "NU302", name: "護理實務專題製作", enName: "Nursing Practical Project", credits: 2, hours: 2, labHours: 0, year: 3, semester: 2, attr: ["專業必修", "實務專題"] },
      { id: 17, type: "專業必修", code: "NU401", name: "臨床學期護理實習", enName: "Clinical Semester Nursing Internship", credits: 9, hours: 0, labHours: 18, year: 4, semester: 1, attr: ["專業必修", "學期實習", "總結性課程"] },
      { id: 18, type: "專業必修", code: "NU402", name: "護理綜合總結性實務考照評估", enName: "Comprehensive Capstone Nursing Practice", credits: 3, hours: 3, labHours: 0, year: 4, semester: 2, attr: ["專業必修", "總結性課程"] },
      { id: 20, type: "專業選修", code: "NU-E01", name: "長期照護與社區健康護理", enName: "Long Term Care and Community Health Nursing", credits: 3, hours: 3, labHours: 0, year: 2, semester: 2, attr: ["專業選修", "健康主軸"] },
      { id: 21, type: "專業選修", code: "NU-E02", name: "海外長照實習(見習)", enName: "Overseas Long Term Care Internship", credits: 2, hours: 0, labHours: 4, year: 3, semester: 2, attr: ["專業選修", "海外實習"] },
      { id: 22, type: "專業選修", code: "NU-E03", name: "高齡與人工智慧健康輔具", enName: "Elderly Care and AI Health Assistive Devices", credits: 3, hours: 3, labHours: 0, year: 3, semester: 1, attr: ["專業選修", "數位科技", "健康主軸"] },
      { id: 23, type: "專業選修", code: "NU-E04", name: "跨系專業選修(健康保健)", enName: "Interdisciplinary Elective in Health Care", credits: 4, hours: 4, labHours: 0, year: 3, semester: 2, attr: ["專業選修", "跨系選修"] },
      { id: 24, type: "專業選修", code: "NU-E05", name: "安寧療護與心理健康", enName: "Hospice Care and Mental Health", credits: 3, hours: 3, labHours: 0, year: 2, semester: 1, attr: ["專業選修", "健康主軸"] },
      { id: 25, type: "專業選修", code: "NU-E06", name: "臨床情境模擬演練", enName: "Clinical Scenario Simulation Practice", credits: 3, hours: 2, labHours: 2, year: 3, semester: 1, attr: ["專業選修", "健康主軸"] }
    ],
    
    attachment3: [
      {
        courseName: "智慧醫療與數位科技護理應用",
        enCourseName: "Smart Healthcare and Digital Tech Nursing Application",
        category: "修訂科目",
        college: "護理學院",
        dept: "護理系",
        units: [
          "1. 智慧醫療導論與數位科技趨勢",
          "2. 臨床護理資訊系統與電子病歷實務",
          "3. 醫療物聯網(AIoT)與生理訊號監測",
          "4. 人工智慧在臨床決策支援之應用",
          "5. 遙測照護與遠距醫療實務案例",
          "6. 數位科技護理情境模擬與綜整實作"
        ]
      },
      {
        courseName: "護理倫理與職場專業規範",
        enCourseName: "Nursing Ethics and Workplace Professional Standards",
        category: "修訂科目",
        college: "護理學院",
        dept: "護理系",
        units: [
          "1. 護理倫理基本原則與歷史演進",
          "2. 醫療自主權與知情同意法律問題",
          "3. 臨床護理常見倫理困境案例解析",
          "4. 醫病溝通與職場倫理衝突處理",
          "5. 醫療事故與護理人員法律責任防護",
          "6. 專業倫理實習與模擬法庭研討"
        ]
      }
    ],
    
    attachment4: {
      competencies: ["A. 基礎生醫科學", "B. 護理技能與評估", "C. 溝通與團隊合作", "D. 批判性思考", "E. 倫理與關懷素養", "F. 終身學習與科技應用"],
      matrix: [
        { courseName: "國文與閱讀", compScores: [0, 0, 1, 0, 1, 1] },
        { courseName: "解剖生理學", compScores: [1, 1, 0, 1, 0, 0] },
        { courseName: "基本護理學與實驗", compScores: [1, 1, 1, 1, 1, 0] },
        { courseName: "護理倫理與職場專業規範", compScores: [0, 0, 1, 1, 1, 0] }
      ]
    },
    
    attachment7: [
      { name: "張美珍", title: "教授兼副院長", org: "國立成功大學醫學院護理學系", field: "臨床護理、護理教育" },
      { name: "陳建宏", title: "主任委員", org: "高雄榮民總醫院護理部", field: "醫療品質管理、護理倫理" }
    ],

    attachment8: {
      reviewDate: "115年10月15日",
      reviewType: "外審",
      systemDegree: "四年制日間部",
      deptName: "護理系",
      reviewerName: "張美珍 教授",
      quantitativeScores: [
        { itemCategory: "培育目標", itemName: "1. 培育具備關懷與專業倫理之臨床護理人才", score: "極高" },
        { itemCategory: "培育目標", itemName: "2. 強化學生數位科技與智慧醫療之應用能力", score: "極高" },
        { itemCategory: "核心能力", itemName: "A. 基礎生醫科學與護理技術能力", score: "極高" }
      ],
      overallResult: "修正後通過",
      qualitativeComments: "1. 本科目表規劃相當完整，符合健康主軸與數位科技 trend。\n2. 建議在『智慧醫療與數位科技護理應用』課程中，可再增加 AI 護理照護實例探討。\n3. 建議海外實習選修課程可與南部醫學中心國際醫療部合作深化。",
      actionProposed: "已採納委員意見，將納入系課程委員會提案討論並優化授課大綱。"
    },

    attachment9: {
      reviewerName: "張美珍",
      idNumber: "A123456789",
      address: "台南市東區大學路1號",
      bankName: "台灣銀行 成大分行",
      bankAccount: "004-012345678901",
      feeAmount: 810,
      signedDate: "115年10月16日",
      uploadedScanFile: "張美珍_個資同意書簽章檔.pdf",
      status: "已回傳上傳"
    },

    attachment10: {
      execPeriod: "115年09月01日至115年11月05日",
      contactPerson: "林專員",
      contactPhone: "07-7811151#2100",
      planName: "「課程結構外審」實施計畫成果報告",
      kpiCompleted: "完成 1 份科目表外審作業。",
      executiveSummary: "本系於115學年度順利完成課程結構外審作業，聘請2位校外專家委員進行審查。委員給予本系健康主軸與智慧醫療課程高度肯定，並提出2項優化建議，已送系課程委員會討論通過並進行改善追蹤。",
      passCount: 1,
      conditionalPassCount: 1,
      targetAchievementPct: "100%",
      improvementTracking: [
        {
          no: 1,
          courseName: "智慧醫療與數位科技護理應用",
          comment: "建議增加 AI 護理照護實例與臨床決策支援範例。",
          response: "系課程委員會已於115年10月28日修正課程大綱，新增第4單元『人工智慧在臨床決策支援之應用』實例探討。"
        },
        {
          no: 2,
          courseName: "海外長照實習(見習)",
          comment: "建議深化與國際醫療護理機構之對接與見習合作。",
          response: "已與日本與新加坡長照機構簽訂見習合作意向書，規劃於115學年度第2學期開辦。"
        }
      ]
    }
  },

  "2elderly": {
    name: "115學年度 護理學院 高齡照護健康管理系【二年制日間部】(對比報表警示範例)",
    collegeName: "護理學院",
    deptName: "高齡照護健康管理系",
    systemType: "日二技",
    academicYear: "115",
    totalGenCreditsRequired: 16,
    totalProfCreditsRequired: 56,
    
    attachment1: {
      unitName: "高齡照護健康管理系",
      applyDate: "115年09月18日",
      purpose: "提升高齡照護系課程結構，進行課程外審與條文檢核。",
      reviewersCount: 2,
      budget: 5000,
      contactPerson: "黃助教",
      contactPhone: "07-7811151#3300"
    },
    
    attachment2: [
      { id: 1, type: "通識必修", code: "GE201", name: "實用職場英文", enName: "Practical Workplace English", credits: 2, hours: 2, labHours: 0, year: 1, semester: 1, attr: ["基礎通識", "職場英文"] },
      { id: 2, type: "通識必修", code: "GE202", name: "資訊與程式邏輯", enName: "Information and Logic", credits: 2, hours: 2, labHours: 0, year: 1, semester: 1, attr: ["基礎通識", "資訊學群"] },
      { id: 3, type: "通識必修", code: "GE203", name: "服務學習", enName: "Service Learning", credits: 2, hours: 2, labHours: 0, year: 1, semester: 2, attr: ["服務學習"] },
      { id: 10, type: "專業必修", code: "ELD101", name: "高齡學導論", enName: "Introduction to Gerontology", credits: 4, hours: 4, labHours: 0, year: 1, semester: 1, attr: ["專業必修", "健康主軸"] },
      { id: 11, type: "專業必修", code: "ELD102", name: "高齡健康照護技術", enName: "Elderly Health Care Tech", credits: 4, hours: 4, labHours: 0, year: 1, semester: 1, attr: ["專業必修", "健康主軸"] },
      { id: 12, type: "專業必修", code: "ELD103", name: "長照機構管理實務", enName: "Long Term Care Management", credits: 4, hours: 4, labHours: 0, year: 1, semester: 2, attr: ["專業必修"] },
      { id: 13, type: "專業必修", code: "ELD104", name: "職場專業倫理與法規", enName: "Workplace Ethics and Regulations", credits: 2, hours: 2, labHours: 0, year: 1, semester: 1, attr: ["專業必修", "職場倫理"] },
      { id: 14, type: "專業必修", code: "ELD105", name: "高齡與數位科技照顧實作", enName: "Elderly Care and Digital Tech Practice", credits: 2, hours: 2, labHours: 0, year: 2, semester: 1, attr: ["專業必修", "數位科技"] },
      { id: 15, type: "專業必修", code: "ELD106", name: "高齡照護總結性實務專題", enName: "Elderly Care Capstone Project", credits: 4, hours: 4, labHours: 0, year: 2, semester: 2, attr: ["專業必修", "總結性課程"] },
      { id: 16, type: "專業必修", code: "ELD107", name: "長期照護高級專業實習", enName: "Advanced LTC Internship", credits: 22, hours: 0, labHours: 44, year: 2, semester: 2, attr: ["專業必修", "學期實習"] },
      { id: 20, type: "專業選修", code: "ELD-E1", name: "高齡社區活動規劃", enName: "Elderly Community Activity Planning", credits: 4, hours: 4, labHours: 0, year: 1, semester: 2, attr: ["專業選修"] },
      { id: 21, type: "專業選修", code: "ELD-E2", name: "跨系選修(輔具科技)", enName: "Interdisciplinary Elective in Assistive Tech", credits: 1, hours: 1, labHours: 0, year: 2, semester: 1, attr: ["專業選修", "跨系選修"] },
      { id: 22, type: "專業選修", code: "ELD-E3", name: "高齡營養與膳食設計", enName: "Elderly Nutrition and Diet", credits: 9, hours: 9, labHours: 0, year: 2, semester: 1, attr: ["專業選修"] }
    ],
    
    attachment3: [
      {
        courseName: "高齡照護總結性實務專題",
        enCourseName: "Elderly Care Capstone Project",
        category: "新訂科目",
        college: "護理學院",
        dept: "高齡照護健康管理系",
        units: [
          "1. 專題題目擬定與問題範疇確立",
          "2. 長照實務文獻探討與方法設計",
          "3. 實地訪查與需求評估"
        ]
      }
    ],
    
    attachment4: {
      competencies: ["A. 高齡照護知識", "B. 溝通與關懷", "C. 數位應用"],
      matrix: [
        { courseName: "高齡學導論", compScores: [1, 1, 0] },
        { courseName: "職場專業倫理與法規", compScores: [0, 1, 0] }
      ]
    },
    
    attachment7: [
      { name: "王國華", title: "副教授", org: "高雄科技大學", field: "高齡產業經營" }
    ],

    attachment8: {
      reviewDate: "115年10月20日",
      reviewType: "外審",
      systemDegree: "二年制日間部",
      deptName: "高齡照護健康管理系",
      reviewerName: "王國華 副教授",
      quantitativeScores: [
        { itemCategory: "培育目標", itemName: "1. 培育長照機構管理人才", score: "高" }
      ],
      overallResult: "建議修正",
      qualitativeComments: "1. 專業必修學分(42)占選修學分(14)高達3倍，違反要點以2倍為原則之規定，請調降必修或增加選修。\n2. 『職場專業倫理與法規』開設於1年級，依要點規定應開設於高年級(2年級)。\n3. 專題課程教學單元僅3項，未達6項門檻。",
      actionProposed: "已請系課程委員會重新調整必選修學分配置與倫理課程開設年級。"
    },

    attachment9: {
      reviewerName: "王國華",
      idNumber: "E123456789",
      address: "高雄市楠梓區高雄大學路700號",
      bankName: "合作金庫 楠梓分行",
      bankAccount: "006-987654321012",
      feeAmount: 810,
      signedDate: "115年10月21日",
      uploadedScanFile: "王國華_個資同意書簽署檔.pdf",
      status: "已回傳上傳"
    },

    attachment10: {
      execPeriod: "115年09月01日至115年11月08日",
      contactPerson: "黃助教",
      contactPhone: "07-7811151#3300",
      planName: "「課程結構外審」實施計畫成果報告",
      kpiCompleted: "完成 1 份科目表外審與改善追蹤。",
      executiveSummary: "本系完成外審意見審查，並已依據委員意見調整必選修比與職場倫理課程開課年級。",
      passCount: 0,
      conditionalPassCount: 1,
      targetAchievementPct: "100%",
      improvementTracking: [
        {
          no: 1,
          courseName: "科目表必選修學分比",
          comment: "必修(42)占選修(14)達3倍，超過2倍上限。",
          response: "將部分必修課調整為選修課，使必選修比調降至 1.8 倍。"
        },
        {
          no: 2,
          courseName: "職場專業倫理與法規",
          comment: "倫理課程開在1年級，應開在2年級。",
          response: "已調整至2年級第1學期開設。"
        }
      ]
    }
  }
};
