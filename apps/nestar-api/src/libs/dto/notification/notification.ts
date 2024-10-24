import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  NotificationGroup,
  NotificationStatus,
  NotificationTitle,
  NotificationType,
} from "../../enums/notification.enum";
import { ObjectId } from "mongoose";
import { Member } from "../member/member";
import { Property } from "../property/property";
import { BoardArticle } from "../board-article/board-article";

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

  // Retrieve from the aggregation

  @Field(() => Member, { nullable: true })
  authorData?: Member;

  @Field(() => Property, { nullable: true })
  propertyData?: Property;

  @Field(() => BoardArticle, { nullable: true })
  articleData?: BoardArticle;
}

@ObjectType()
export class Notifications {
  @Field(() => [Notification])
  list: Notification[];
}
