import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  NotificationGroup,
  NotificationStatus,
  NotificationTitle,
  NotificationType,
} from "../../enums/notification.enum";
import { ObjectId } from "mongoose";
import { Member } from "../member/member";
import { Product } from "../product/product";
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

  @Field(() => String, { nullable: true })
  notificationTitle?: NotificationTitle;

  @Field(() => String, { nullable: true })
  notificationDesc?: String;

  @Field(() => String)
  authorId: ObjectId;

  @Field(() => String)
  receiverId: ObjectId;

  @Field(() => String, { nullable: true })
  productId?: ObjectId;

  @Field(() => String, { nullable: true })
  articleId?: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  // Retrieve from the aggregation

  @Field(() => Member, { nullable: true })
  authorData?: Member;

  @Field(() => Product, { nullable: true })
  productData?: Product;

  @Field(() => BoardArticle, { nullable: true })
  articleData?: BoardArticle;
}

@ObjectType()
export class Notifications {
  @Field(() => [Notification])
  list: Notification[];
}
