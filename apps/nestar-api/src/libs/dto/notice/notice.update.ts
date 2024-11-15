import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { NoticeCategory, NoticeStatus } from "../../enums/notice.enum";
import { ObjectId } from "mongoose";

@InputType()
export class NoticeUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  noticeTitle?: string;

  @IsOptional()
  @Length(3, 300)
  @Field(() => String, { nullable: true })
  noticeContent?: string;

  @IsOptional()
  @Field(() => NoticeCategory, { nullable: true })
  noticeCategory?: NoticeCategory;

  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  @IsOptional()
  @Field(() => String)
  eventCity?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  noticeImage?: string;
}
