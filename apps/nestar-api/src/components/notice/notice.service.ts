import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Notice, Notices } from "../../libs/dto/notice/notice";
import { Message } from "../../libs/enums/common.enum";
import {
  AllNoticesInquiry,
  EventNoticeInquiry,
  NoticeInput,
} from "../../libs/dto/notice/notice.input";
import { NoticeUpdate } from "../../libs/dto/notice/notice.update";
import { T } from "../../libs/types/common";
import { FAQFeild, NoticeStatus } from "../../libs/enums/notice.enum";
import { group } from "console";
import { internalExecuteOperation } from "@apollo/server/dist/esm/ApolloServer";

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel("Notice")
    private readonly noticeModel: Model<Notice>,
  ) {}

  public async getNotices(input: EventNoticeInquiry): Promise<Notice[]> {
    const result = await this.noticeModel.find(input);

    if (!result) return null;
    return result;
  }

  public async createNotice(
    memberId: ObjectId,
    input: NoticeInput,
  ): Promise<Notice> {
    try {
      input.memberId = memberId;
      const result = await this.noticeModel.create(input);

      return result;
    } catch (err) {
      console.log("Error, NoticeService createNotice");
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async updateNotice(input: NoticeUpdate): Promise<Notice> {
    const result = await this.noticeModel
      .findByIdAndUpdate(input._id, input, { new: true })
      .exec();
    return result;
  }

  public async getNoticeFields(input: boolean): Promise<FAQFeild[]> {
    const result = await this.noticeModel.aggregate([
      {
        $match: {
          noticeStatus: NoticeStatus.ACTIVE,
          field: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$field",
        },
      },
      {
        $project: {
          _id: 0,
          field: "$_id",
        },
      },
    ]);
    return result.map((item) => item.field).sort();
  }

  public async deleteNotice(noticeId: ObjectId): Promise<Notice> {
    const match = { _id: noticeId, noticeStatus: NoticeStatus.DELETE };
    const result = await this.noticeModel.findOneAndDelete(match);
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  public async getAllPNoticesByAdmin(
    input: AllNoticesInquiry,
  ): Promise<Notices> {
    const { noticeStatus, field } = input.search;
    const match: T = {};

    if (noticeStatus) match.noticeStatus = noticeStatus;
    if (field) match.field = { $in: field };

    const result = await this.noticeModel
      .aggregate([
        { $match: match },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }
}