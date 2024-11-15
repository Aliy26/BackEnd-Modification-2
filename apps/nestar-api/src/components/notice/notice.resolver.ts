import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NoticeService } from "./notice.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { MemberType } from "../../libs/enums/member.enum";
import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Notice } from "../../libs/dto/notice/notice";
import { AuthMember } from "../auth/decorators/authMember.decorator";
import { ObjectId } from "mongoose";
import {
  EventNoticeInquiry,
  NoticeInput,
} from "../../libs/dto/notice/notice.input";
import { NoticeUpdate } from "../../libs/dto/notice/notice.update";
import { WithoutGuard } from "../auth/guards/without.guard";

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
}
