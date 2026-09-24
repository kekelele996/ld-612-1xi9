export const mockData = {
  "policyDocument": [
    {
      "id": 1,
      "title": "隐私政策",
      "version_label": "v1.0",
      "raw_text": "一、我们收集的信息\n我们仅收集您主动提供的注册信息，包括昵称和邮箱地址。\n二、信息共享与披露\n我们不会向任何第三方共享您的个人信息。\n三、数据保存期限\n您的数据将在账号注销后 30 天内删除。\n四、未成年人保护\n我们不面向 14 周岁以下儿童提供服务。",
      "normalized_sections": "4",
      "imported_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "title": "隐私政策",
      "version_label": "v2.0",
      "raw_text": "一、我们收集的信息\n我们收集您主动提供的注册信息（昵称、邮箱地址），并在您开启定位权限后收集精确位置信息。\n二、信息共享与披露\n我们会与广告合作伙伴共享去标识化后的设备信息，用于效果衡量。\n三、数据保存期限\n您的数据将在账号注销后 30 天内删除。\n五、个性化推荐\n我们会基于您的浏览记录进行个性化内容推荐，您可以在设置中关闭。",
      "normalized_sections": "4",
      "imported_at": "2026-06-12T09:00:00Z"
    }
  ],
  "policySection": [
    {
      "id": 1,
      "document_id": 1,
      "section_no": "1",
      "heading": "我们收集的信息",
      "content": "我们仅收集您主动提供的注册信息，包括昵称和邮箱地址。",
      "category": "数据收集",
      "risk_level": "LOW"
    },
    {
      "id": 2,
      "document_id": 1,
      "section_no": "2",
      "heading": "信息共享与披露",
      "content": "我们不会向任何第三方共享您的个人信息。",
      "category": "信息共享",
      "risk_level": "MEDIUM"
    },
    {
      "id": 3,
      "document_id": 1,
      "section_no": "3",
      "heading": "数据保存期限",
      "content": "您的数据将在账号注销后 30 天内删除。",
      "category": "保存期限",
      "risk_level": "LOW"
    },
    {
      "id": 4,
      "document_id": 1,
      "section_no": "4",
      "heading": "未成年人保护",
      "content": "我们不面向 14 周岁以下儿童提供服务。",
      "category": "未成年人保护",
      "risk_level": "LOW"
    },
    {
      "id": 5,
      "document_id": 2,
      "section_no": "1",
      "heading": "我们收集的信息",
      "content": "我们收集您主动提供的注册信息（昵称、邮箱地址），并在您开启定位权限后收集精确位置信息。",
      "category": "数据收集",
      "risk_level": "HIGH"
    },
    {
      "id": 6,
      "document_id": 2,
      "section_no": "2",
      "heading": "信息共享与披露",
      "content": "我们会与广告合作伙伴共享去标识化后的设备信息，用于效果衡量。",
      "category": "信息共享",
      "risk_level": "CRITICAL"
    },
    {
      "id": 7,
      "document_id": 2,
      "section_no": "3",
      "heading": "数据保存期限",
      "content": "您的数据将在账号注销后 30 天内删除。",
      "category": "保存期限",
      "risk_level": "LOW"
    },
    {
      "id": 8,
      "document_id": 2,
      "section_no": "5",
      "heading": "个性化推荐",
      "content": "我们会基于您的浏览记录进行个性化内容推荐，您可以在设置中关闭。",
      "category": "个性化推荐",
      "risk_level": "MEDIUM"
    }
  ],
  "diffResult": [
    {
      "id": 1,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 5,
      "diff_type": "MODIFIED",
      "summary": "收集范围新增精确位置信息，风险等级由低调整为高",
      "created_at": "2026-09-20T09:00:00Z"
    },
    {
      "id": 2,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 6,
      "diff_type": "MODIFIED",
      "summary": "共享条款由不共享调整为与广告合作伙伴共享去标识化设备信息",
      "created_at": "2026-09-20T09:00:00Z"
    },
    {
      "id": 3,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 4,
      "diff_type": "REMOVED",
      "summary": "未成年人保护条款在新版中删除",
      "created_at": "2026-09-20T09:00:00Z"
    },
    {
      "id": 4,
      "old_document_id": 1,
      "new_document_id": 2,
      "section_id": 8,
      "diff_type": "ADDED",
      "summary": "新增个性化推荐条款",
      "created_at": "2026-09-20T09:00:00Z"
    }
  ],
  "reviewNote": [
    {
      "id": 1,
      "diff_result_id": 1,
      "tag": "数据收集",
      "comment": "",
      "reviewer": "",
      "status": "OPEN",
      "reason": "",
      "resolved_section_id": null,
      "resolved_section_content": "",
      "resolved_risk_level": "",
      "history": [],
      "created_at": "2026-09-20T09:00:00Z",
      "updated_at": "2026-09-20T09:00:00Z"
    },
    {
      "id": 2,
      "diff_result_id": 2,
      "tag": "信息共享",
      "comment": "已与法务确认，需补充第三方共享清单后上线",
      "reviewer": "王合规",
      "status": "CONFIRMED",
      "reason": "",
      "resolved_section_id": null,
      "resolved_section_content": "",
      "resolved_risk_level": "",
      "history": [
        {
          "status": "CONFIRMED",
          "reviewer": "王合规",
          "comment": "已与法务确认，需补充第三方共享清单后上线",
          "reason": "",
          "changed_at": "2026-09-21T02:00:00Z"
        }
      ],
      "created_at": "2026-09-20T09:00:00Z",
      "updated_at": "2026-09-21T02:00:00Z"
    },
    {
      "id": 3,
      "diff_result_id": 3,
      "tag": "条款删除",
      "comment": "删除该条款已获法务批准",
      "reviewer": "李审计",
      "status": "IGNORED",
      "reason": "业务已不面向未成年人，删除经法务批准",
      "resolved_section_id": null,
      "resolved_section_content": "",
      "resolved_risk_level": "",
      "history": [
        {
          "status": "IGNORED",
          "reviewer": "李审计",
          "comment": "删除该条款已获法务批准",
          "reason": "业务已不面向未成年人，删除经法务批准",
          "changed_at": "2026-09-21T06:00:00Z"
        }
      ],
      "created_at": "2026-09-20T09:00:00Z",
      "updated_at": "2026-09-21T06:00:00Z"
    },
    {
      "id": 4,
      "diff_result_id": 4,
      "tag": "新增条款",
      "comment": "推荐可关闭，评估通过",
      "reviewer": "王合规",
      "status": "RESOLVED",
      "reason": "",
      "resolved_section_id": 8,
      "resolved_section_content": "我们会基于您的浏览记录进行个性化内容推荐，您可以在设置中关闭。",
      "resolved_risk_level": "MEDIUM",
      "history": [
        {
          "status": "CONFIRMED",
          "reviewer": "王合规",
          "comment": "已确认推荐开关入口存在",
          "reason": "",
          "changed_at": "2026-09-22T01:00:00Z"
        },
        {
          "status": "RESOLVED",
          "reviewer": "王合规",
          "comment": "推荐可关闭，评估通过",
          "reason": "",
          "changed_at": "2026-09-22T08:00:00Z"
        }
      ],
      "created_at": "2026-09-20T09:00:00Z",
      "updated_at": "2026-09-22T08:00:00Z"
    }
  ]
} as const;
