# 生产 API 契约草案

所有接口仅接受 HTTPS，请求和响应使用 JSON；出生资料、微信身份和支付资料不得出现在 URL 查询参数或应用日志中。

## 核心对象

```ts
type BirthInput = {
  solarDate: string;       // YYYY-MM-DD
  birthTime: string;       // HH:mm
  lunarInput?: string;     // 仅用于交叉核对
  placeId: string;
  longitude: number;
  latitude: number;
  timezone: string;        // IANA timezone
  sex: 'female' | 'male' | 'unspecified';
  consentVersion: string;
};

type ChartSnapshot = {
  calculationVersion: string;
  civilTime: string;
  trueSolarTime: string;
  pillarsPrimary: Pillars;
  pillarsAlternate?: Pillars;
  dayBoundary: '23:00';
  solarTerms: SolarTermEvidence[];
  luckCycles: LuckCycle[];
};

type Evidence = {
  ruleId: string;
  sourceId: string;
  sourceLocation: string;
  strength: 'high' | 'medium';
  trigger: string;
  falsifiableExpression: string;
};

type ReportV1 = {
  id: string;
  reportNo: string;
  mode: 'culture-study' | 'approved-personalized';
  chart: ChartSnapshot;
  preview: ReportItem[];
  sections: ReportSection[];
  tenYearTimeline?: YearItem[];
  audit: AuditResult;
  aiLabel: true;
  modelName: string;
  modelFiling: string;
};
```

## 使用者流程

- `POST /v1/leads`：建立 24 小時匿名资料，回传 `leadId`。
- `POST /v1/leads/{leadId}/handoff`：建立 30 分钟一次性凭证；服务端换取微信小程序 URL Link，URL 中只带随机短码。
- `POST /v1/wechat/session`：以小程序 `code` 建立会话，并消费一次性交接凭证。
- `GET /v1/previews/{leadId}`：返回命盘与三项试读。
- `POST /v1/orders`：建立 ¥9.90 订单；要求 `Idempotency-Key`。
- `POST /v1/webhooks/wechat-pay`：验证微信支付 API v3 签名和平台证书；重复回调只更新同一订单一次。
- `POST /v1/orders/{id}/generation`：付款成功后创建背景任务。
- `GET /v1/jobs/{id}`：返回排队、生成、审核、完成或退款状态。
- `GET /v1/reports/{id}`：只允许报告所属微信帐号访问。
- `POST /v1/reports/{id}/images`：生成带显式 AI 标识与元数据的分页 PNG。
- `DELETE /v1/reports/{id}`：删除出生资料与报告；依法需保存的订单记录去标识化后分离保留。
- `POST /v1/qimen`：消费一次额度；仅在合规开关开启时接受城市、目的及 30 日内区间。

## 背景任务与退款

任务最多重试三次，使用指数退避。付款后 30 分钟仍无可发布报告时调用微信退款 API，全额退回 990 分，并以订单号作为退款幂等键。报告生成、证据审核和图片生成分别记录耗时与错误码，不记录出生原文。

## 合规开关

服务端是唯一可信来源。前端开关不具授权作用：

- `payment_enabled`
- `personalized_sections_enabled`
- `qimen_enabled`
- `model_generation_enabled`
- `platform_handoff_enabled`

任一开关关闭时必须返回明确的业务错误，不得以隐藏路由绕过。
