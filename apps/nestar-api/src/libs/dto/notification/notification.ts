import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  NotificationGroup,
  NotificationStatus,
  NotificationTitle,
  NotificationType,
} from "../../enums/notification.enum";
import { ObjectId } from "mongoose";

@ObjectType()
export class Notification {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  notificationType: NotificationType;

  @Field(() => String)
  notificationStatus: NotificationStatus;

  @Field(() => String)
  notificationGroup: NotificationGroup;

  @Field(() => String)
  notificationTitle: NotificationTitle;

  @Field(() => String, { nullable: true })
  notificationDesc?: String;

  @Field(() => String)
  authorId: ObjectId;

  @Field(() => String)
  receiverId: ObjectId;

  @Field(() => String, { nullable: true })
  propertyId?: ObjectId;

  @Field(() => String, { nullable: true })
  articleId?: ObjectId;
}
