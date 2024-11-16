import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import {
  FAQFeild,
  NoticeCategory,
  NoticeStatus,
} from "../../enums/notice.enum";
import { ObjectId } from "mongoose";

@InputType()
export class NoticeInput {
  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  noticeTitle: string;

  @IsNotEmpty()
  @Length(3, 300)
  @Field(() => String)
  noticeContent: string;

  @IsNotEmpty()
  @Field(() => NoticeCategory)
  noticeCategory: NoticeCategory;

  @IsOptional()
  @Field(() => FAQFeild, { nullable: true })
  field?: FAQFeild;

  @IsOptional()
  @Field(() => String, { nullable: true })
  eventCity?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  noticeImage?: string;

  memberId?: ObjectId;
}

@InputType()
export class EventNoticeInquiry {
  @IsOptional()
  @Field(() => NoticeCategory, { nullable: true })
  noticeCategory?: NoticeCategory.EVENT;

  @IsNotEmpty()
  @Field(() => String)
  noticeStatus: NoticeStatus;
}
