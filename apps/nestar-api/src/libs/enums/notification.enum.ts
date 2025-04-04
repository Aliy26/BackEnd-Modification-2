import { registerEnumType } from "@nestjs/graphql";

export enum NotificationType {
  MESSAGE = "MESSAGE",
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
  NEW_PRODUCT = "NEW PRODUCT",
  NEW_ARTICLE = "NEW ARTICLE",
}
registerEnumType(NotificationType, {
  name: "NotificationType",
});

export enum NotificationTitle {
  MESSAGE = "NEW MESSAGE",
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
