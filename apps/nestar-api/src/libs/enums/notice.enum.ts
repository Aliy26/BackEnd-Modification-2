import { registerEnumType } from "@nestjs/graphql";

export enum NoticeCategory {
  FAQ = "FAQ",
  EVENT = "EVENT",
  TERMS = "TERMS",
  INQUIRY = "INQUIRY",
}
registerEnumType(NoticeCategory, {
  name: "NoticeCategory",
});

export enum FAQFeild {
  PRODUCT = "PRODUCT",
  BUYERS = "BUYERS",
  AGENT = "AGENT",
  PAYMENT = "PAYMENT",
  MEMBERSHIP = "MEMBERSHIP",
  COMMUNITY = "COMMUNITY",
  OTHER = "OTHER",
}
registerEnumType(FAQFeild, {
  name: "FAQFeild",
});

export enum NoticeStatus {
  HOLD = "HOLD",
  ACTIVE = "ACTIVE",
  DELETE = "DELETE",
}
registerEnumType(NoticeStatus, {
  name: "NoticeStatus",
});
