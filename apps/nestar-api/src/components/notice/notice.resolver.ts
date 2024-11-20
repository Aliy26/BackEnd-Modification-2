import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NoticeService } from "./notice.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { MemberType } from "../../libs/enums/member.enum";
import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Notice, Notices } from "../../libs/dto/notice/notice";
import { AuthMember } from "../auth/decorators/authMember.decorator";
import { ObjectId } from "mongoose";
import {
  AllNoticesInquiry,
  EventNoticeInquiry,
  NoticeInput,
} from "../../libs/dto/notice/notice.input";
import { NoticeUpdate } from "../../libs/dto/notice/notice.update";
import { WithoutGuard } from "../auth/guards/without.guard";
import { FAQFeild } from "../../libs/enums/notice.enum";
import { shapeIntoMongoObjectId } from "../../libs/config";

@Resolver()
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @UseGuards(WithoutGuard)
  @Query(() => [Notice])
  public async getNotices(
    @Args("input") input: EventNoticeInquiry,
  ): Promise<Notice[]> {
    console.log("Query: getNotices");
    return await this.noticeService.getNotices(input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => [String])
  public async getNoticeFields(
    @Args("input") input: boolean,
  ): Promise<FAQFeild[]> {
    console.log("Query: getNoticeFields");
    return await this.noticeService.getNoticeFields(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async createNotice(
    @Args("input") input: NoticeInput,
    @AuthMember("_id") memberId: ObjectId,
  ): Promise<Notice> {
    console.log("Mutation: createNotice");
    return await this.noticeService.createNotice(memberId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async updateNotice(
    @Args("input") input: NoticeUpdate,
  ): Promise<Notice> {
    console.log("Mutation: updateNotice");
    return await this.noticeService.updateNotice(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async deleteNotice(@Args("noticeId") input: string): Promise<Notice> {
    console.log("Mutation: deleteNotice");
    const noticeId = shapeIntoMongoObjectId(input);
    return await this.noticeService.deleteNotice(noticeId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query((returns) => Notices)
  public async getAllNoticesByAdmin(
    @Args("input") input: AllNoticesInquiry,
  ): Promise<Notices> {
    console.log("getAllNoticesByAdmin");
    return await this.noticeService.getAllPNoticesByAdmin(input);
  }
}
