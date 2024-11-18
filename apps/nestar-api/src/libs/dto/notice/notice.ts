import { Field, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";
import {
  FAQFeild,
  NoticeCategory,
  NoticeStatus,
} from "../../enums/notice.enum";

@ObjectType()
export class Notice {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  noticeCategory: NoticeCategory;

  @Field(() => FAQFeild, { nullable: true })
  field?: FAQFeild;

  @Field(() => String)
  noticeStatus: NoticeStatus;

  @Field(() => String)
  noticeTitle: string;

  @Field(() => String)
  noticeContent: string;

  @Field(() => String, { nullable: true })
  noticeImage?: string;

  @Field(() => String, { nullable: true })
  eventCity?: string;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
