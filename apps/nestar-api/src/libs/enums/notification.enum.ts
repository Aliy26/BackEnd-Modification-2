import { registerEnumType } from "@nestjs/graphql";

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
}
registerEnumType(NotificationType, {
  name: "NotificationType",
});

export enum NotificationTitle {
  LIKE = "NEW LIKE",
  COMMENT = "NEW COMMENT",
  FOLLOW = "NEW FOLLOW",
}
registerEnumType(NotificationTitle, {
  name: "NotificationTitle",
});

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}
registerEnumType(NotificationStatus, {
  name: "NotificationStatus",
});

export enum NotificationGroup {
  MEMBER = "MEMBER",
  ARTICLE = "ARTICLE",
  PRODUCT = "PRODUCT",
}
registerEnumType(NotificationGroup, {
  name: "NotificationGroup",
});
