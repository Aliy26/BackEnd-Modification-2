import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Message } from "../../libs/enums/common.enum";
import { Notification } from "../../libs/dto/notification/notification";
import { NotificationInput } from "../../libs/types/common";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel("Notification")
    private readonly notificationModel: Model<Notification>,
  ) {}

  public async notifyMember(input: NotificationInput): Promise<Notification> {
    try {
      {
        const result = await this.notificationModel.create(input);
        if (!result) return null;
        return result;
      }
    } catch (err) {
      console.log("notification.Service notify", err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async deleteNotification(input: NotificationInput): Promise<void> {
    await this.notificationModel.findOneAndDelete(input);
  }

  public async updateNotification(
    receiverId: ObjectId,
    notificationId: ObjectId,
  ): Promise<Notification> {
    const result = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, receiverId: receiverId },
        { notificationStatus: "READ" },
        { new: true },
      )
      .exec();
    return result;
  }

  public async getNotifications(memberId: ObjectId): Promise<Notification[]> {
    const result = await this.notificationModel
      .find({ receiverId: memberId })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result;
  }
}
