import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length, Min } from "class-validator";
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
  @Field(() => NoticeCategory)
  noticeCategory: NoticeCategory;

  @IsOptional()
  @Field(() => String, { nullable: true })
  noticeStatus?: NoticeStatus;
}

@InputType()
class ANISearch {
  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  @IsOptional()
  @Field(() => [FAQFeild])
  field?: FAQFeild[];
}

@InputType()
export class AllNoticesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsNotEmpty()
  @Field(() => ANISearch)
  search: ANISearch;
}
