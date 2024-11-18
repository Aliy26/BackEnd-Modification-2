import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Notice } from "../../libs/dto/notice/notice";
import { Message } from "../../libs/enums/common.enum";
import {
  EventNoticeInquiry,
  NoticeInput,
} from "../../libs/dto/notice/notice.input";
import { NoticeUpdate } from "../../libs/dto/notice/notice.update";
import { T } from "../../libs/types/common";
import { FAQFeild, NoticeStatus } from "../../libs/enums/notice.enum";
import { group } from "console";

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
}
