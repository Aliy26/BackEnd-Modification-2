import { Field, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";
import { NoticeCategory, NoticeStatus } from "../../enums/notice.enum";

@ObjectType()
export class Notice {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  noticeCategory: NoticeCategory;

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
}
