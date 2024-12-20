import { Schema } from "mongoose";
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from "../libs/enums/notification.enum";

const NotificationSchema = new Schema(
  {
    notificationType: {
      type: String,
      enum: NotificationType,
      required: true,
    },

    notificationStatus: {
      type: String,
      enum: NotificationStatus,
      default: NotificationStatus.UNREAD,
    },

    notificationGroup: {
      type: String,
      enum: NotificationGroup,
      required: true,
    },

    notificationTitle: {
      type: String,
    },

    notificationDesc: {
      type: String,
    },

    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },

    articleId: {
      type: Schema.Types.ObjectId,
      ref: "BoardArticle",
    },
  },
  { timestamps: true, collection: "notifications" },
);

export default NotificationSchema;
