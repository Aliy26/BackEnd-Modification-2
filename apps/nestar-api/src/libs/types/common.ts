import { ObjectId } from "mongoose";
import {
  NotificationGroup,
  NotificationTitle,
  NotificationType,
} from "../enums/notification.enum";

export interface T {
  [key: string]: any;
}

export interface StatisticModifier {
  _id: ObjectId;
  targetKey: string;
  modifier: number;
}

export interface NotificationInput {
  authorId: ObjectId;
  receiverId: ObjectId;
  productId?: ObjectId;
  articleId?: ObjectId;
  notificationGroup?: NotificationGroup;
  notificationType?: NotificationType;
  notificationTitle?: NotificationTitle;
  notificationDesc?: string;
}
