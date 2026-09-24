import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";
import type { DiffResult } from "../types/DiffResult";
import type { ReviewNote } from "../types/ReviewNote";
import { createReviewHistoryEntry } from "../constructors/ReviewNoteConstructor";

/**
 * 本地 mock 种子数据：首次启动时写入 localStorage，之后以本机数据为准。
 * oldDocument(v1.0, 2025) → newDocument(v2.0, 2026) 构成一组对比。
 */
const oldDocument: PolicyDocument = {
  id: 1,
  title: "XX 产品隐私政策",
  version_label: "v1.0（2025 版）",
  raw_text: "",
  normalized_sections: "1,2,3,4,5",
  imported_at: "2026-01-10T09:00:00+08:00"
};

const newDocument: PolicyDocument = {
  id: 2,
  title: "XX 产品隐私政策",
  version_label: "v2.0（2026 版）",
  raw_text: "",
  normalized_sections: "1,2,3,4,5,6",
  imported_at: "2026-06-01T09:00:00+08:00"
};

const oldSections: PolicySection[] = [
  {
    id: 1,
    document_id: 1,
    section_no: "1",
    heading: "我们如何收集和使用您的个人信息",
    content:
      "我们会在您注册账号时收集手机号码，并在您使用服务时收集设备型号、操作系统版本与日志信息，用于账号安全与服务运行。",
    category: "数据收集",
    risk_level: "MEDIUM",
    updated_at: "2026-01-10T09:00:00+08:00"
  },
  {
    id: 2,
    document_id: 1,
    section_no: "2",
    heading: "我们如何共享您的个人信息",
    content:
      "我们不会向第三方出售您的个人信息。仅在获得您同意后，向物流服务商共享收货地址，用于完成商品配送。",
    category: "第三方共享",
    risk_level: "HIGH",
    updated_at: "2026-01-10T09:00:00+08:00"
  },
  {
    id: 3,
    document_id: 1,
    section_no: "3",
    heading: "我们如何保存您的个人信息",
    content: "您的个人信息将在账号存续期间保存，账号注销后 30 日内删除或匿名化处理。",
    category: "保存期限",
    risk_level: "LOW",
    updated_at: "2026-01-10T09:00:00+08:00"
  },
  {
    id: 4,
    document_id: 1,
    section_no: "4",
    heading: "您的权利",
    content: "您可以访问、更正、删除您的个人信息，也可以联系客服注销账号。",
    category: "用户权利",
    risk_level: "LOW",
    updated_at: "2026-01-10T09:00:00+08:00"
  },
  {
    id: 5,
    document_id: 1,
    section_no: "5",
    heading: "未成年人个人信息保护",
    content: "我们非常重视未成年人信息保护，不满十四周岁的用户请在监护人陪同下使用本服务。",
    category: "未成年人",
    risk_level: "MEDIUM",
    updated_at: "2026-01-10T09:00:00+08:00"
  }
];

const newSections: PolicySection[] = [
  {
    id: 6,
    document_id: 2,
    section_no: "1",
    heading: "我们如何收集和使用您的个人信息",
    content:
      "我们会在您注册账号时收集手机号码、精确位置信息，并在您使用服务时收集设备型号、操作系统版本、剪贴板内容与日志信息，用于账号安全、服务运行与个性化推荐。",
    category: "数据收集",
    risk_level: "CRITICAL",
    updated_at: "2026-06-01T09:00:00+08:00"
  },
  {
    id: 7,
    document_id: 2,
    section_no: "2",
    heading: "我们如何共享、转让您的个人信息",
    content:
      "我们不会向第三方出售您的个人信息。我们可能向合作广告商共享设备标识符与行为画像用于精准营销；向物流服务商共享收货地址用于完成商品配送；在业务重组时可能转让您的信息。",
    category: "第三方共享",
    risk_level: "CRITICAL",
    updated_at: "2026-06-01T09:00:00+08:00"
  },
  {
    id: 8,
    document_id: 2,
    section_no: "3",
    heading: "我们如何保存您的个人信息",
    content:
      "您的个人信息将在账号存续期间保存，账号注销后 30 日内删除或匿名化处理；为满足法律法规要求，部分交易记录将保存不少于三年。",
    category: "保存期限",
    risk_level: "MEDIUM",
    updated_at: "2026-06-01T09:00:00+08:00"
  },
  {
    id: 9,
    document_id: 2,
    section_no: "4",
    heading: "您的权利",
    content:
      "您可以访问、更正、删除您的个人信息，也可以联系客服注销账号、拒绝个性化推荐，并可通过“隐私设置”撤回授权。",
    category: "用户权利",
    risk_level: "LOW",
    updated_at: "2026-06-01T09:00:00+08:00"
  },
  {
    id: 10,
    document_id: 2,
    section_no: "5",
    heading: "未成年人个人信息保护",
    content:
      "我们非常重视未成年人信息保护，不满十四周岁的用户应在监护人同意并陪同下使用本服务，我们将对未成年人信息采取加密存储等更严格的保护措施。",
    category: "未成年人",
    risk_level: "MEDIUM",
    updated_at: "2026-06-01T09:00:00+08:00"
  },
  {
    id: 11,
    document_id: 2,
    section_no: "6",
    heading: "个性化推荐与自动化决策",
    content:
      "我们会基于您的浏览与购买记录进行用户画像并展示定向广告。您可以在设置中关闭个性化推荐，关闭后不影响其他服务的正常使用。",
    category: "自动化决策",
    risk_level: "HIGH",
    updated_at: "2026-06-01T09:00:00+08:00"
  }
];

const createdAt = "2026-06-02T10:00:00+08:00";

const diffResults: DiffResult[] = [
  {
    id: 1,
    old_document_id: 1,
    new_document_id: 2,
    section_id: 6,
    old_section_id: 1,
    new_section_id: 6,
    diff_type: "MODIFIED",
    summary: "收集范围扩大：新增精确位置与剪贴板内容，新增个性化推荐用途，风险由中升为严重。",
    created_at: createdAt
  },
  {
    id: 2,
    old_document_id: 1,
    new_document_id: 2,
    section_id: 7,
    old_section_id: 2,
    new_section_id: 7,
    diff_type: "MODIFIED",
    summary: "新增向广告商共享设备标识符与行为画像用于精准营销，并新增业务重组转让情形。",
    created_at: createdAt
  },
  {
    id: 3,
    old_document_id: 1,
    new_document_id: 2,
    section_id: 8,
    old_section_id: 3,
    new_section_id: 8,
    diff_type: "MODIFIED",
    summary: "新增交易记录保存不少于三年的法定例外，风险由低升为中。",
    created_at: createdAt
  },
  {
    id: 4,
    old_document_id: 1,
    new_document_id: 2,
    section_id: 10,
    old_section_id: 5,
    new_section_id: 10,
    diff_type: "MODIFIED",
    summary: "强化监护人同意要求，并补充未成年人信息加密存储措施。",
    created_at: createdAt
  },
  {
    id: 5,
    old_document_id: 1,
    new_document_id: 2,
    section_id: 11,
    old_section_id: null,
    new_section_id: 11,
    diff_type: "ADDED",
    summary: "新增“个性化推荐与自动化决策”专章，披露用户画像与定向广告及退出方式。",
    created_at: createdAt
  }
];

const reviewNotes: ReviewNote[] = [
  {
    id: 1,
    diff_result_id: 1,
    tag: "收集范围扩大",
    comment: "需法务确认精确位置与剪贴板收集的单独同意弹窗方案。",
    reviewer: "李合规",
    status: "CONFIRMED",
    created_at: "2026-06-03T09:30:00+08:00",
    updated_at: "2026-06-05T14:00:00+08:00",
    history: [
      createReviewHistoryEntry("OPEN", "李合规", "先标记，等业务补充收集字段清单。", "2026-06-03T09:30:00+08:00"),
      createReviewHistoryEntry("CONFIRMED", "李合规", "确认存在合规缺口，需补充单独同意。", "2026-06-05T14:00:00+08:00")
    ],
    resolved_snapshot: null
  },
  {
    id: 2,
    diff_result_id: 2,
    tag: "第三方共享",
    comment: "广告共享必须提供拒绝渠道，已与广告法务对齐。",
    reviewer: "王审阅",
    status: "RESOLVED",
    created_at: "2026-06-03T10:00:00+08:00",
    updated_at: "2026-06-08T16:20:00+08:00",
    history: [
      createReviewHistoryEntry("CONFIRMED", "王审阅", "确认精准营销共享需补充合作方清单。", "2026-06-04T11:00:00+08:00"),
      createReviewHistoryEntry("RESOLVED", "王审阅", "v2.0 已在正文补充退出方式，本条关闭。", "2026-06-08T16:20:00+08:00")
    ],
    resolved_snapshot: {
      old_content: oldSections[1].content,
      old_risk_level: "HIGH",
      new_content: newSections[1].content,
      new_risk_level: "CRITICAL",
      resolved_at: "2026-06-08T16:20:00+08:00"
    }
  },
  {
    id: 3,
    diff_result_id: 3,
    tag: "保存期限",
    comment: "法定三年留存表述已核对无误，仅作记录。",
    reviewer: "王审阅",
    status: "IGNORED",
    created_at: "2026-06-03T10:30:00+08:00",
    updated_at: "2026-06-06T09:10:00+08:00",
    history: [
      createReviewHistoryEntry("IGNORED", "王审阅", "属法定义务要求，无需整改，忽略。", "2026-06-06T09:10:00+08:00")
    ],
    resolved_snapshot: null
  },
  {
    id: 4,
    diff_result_id: 5,
    tag: "新增章节",
    comment: "",
    reviewer: "",
    status: "OPEN",
    created_at: "2026-06-03T11:00:00+08:00",
    updated_at: "2026-06-03T11:00:00+08:00",
    history: [],
    resolved_snapshot: null
  }
];

export const seedData = {
  policyDocument: [oldDocument, newDocument],
  policySection: [...oldSections, ...newSections],
  diffResult: diffResults,
  reviewNote: reviewNotes
};

/** 兼容旧引用名 */
export const mockData = seedData;
