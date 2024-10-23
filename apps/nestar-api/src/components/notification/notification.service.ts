import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Message } from "../../libs/enums/common.enum";
import { Notification } from "../../libs/dto/notification/notification";
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from "../../libs/enums/notification.enum";
import { NotificationInput } from "../../libs/types/common";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel("Notification")
    private readonly notificationModel: Model<Notification>,
  ) {}

  public async notifyLike(input: NotificationInput): Promise<Notification> {
    const {
      authorId,
      receiverId,
      propertyId,
      articleId,
      notificationGroup,
      notificationType,
      notificationTitle,
    } = input;
    try {
      const exist = await this.notificationModel
        .findOne({
          authorId: authorId,
          receiverId: receiverId,
          propertyId: propertyId,
          articleId: articleId,
        })
        .exec();

      if (!exist) {
        const input = {
          notificationTitle,
          notificationType,
          notificationGroup,
          authorId,
          receiverId,
          propertyId,
          articleId,
        };
        const result = await this.notificationModel.create(input);
        return result;
      } else return null;
    } catch (err) {
      console.log("notification.Service notify", err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getNotification(
    memberId: ObjectId,
    notificationId: ObjectId,
  ): Promise<Notification> {
    const notification = await this.notificationModel
      .findOne({ _id: notificationId, receiverId: memberId })
      .exec();
    if (!notification)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    else return this.updateNotification(notificationId);
  }

  private async updateNotification(
    notificationId: ObjectId,
  ): Promise<Notification> {
    return await this.notificationModel
      .findByIdAndUpdate(
        notificationId,
        { notificationStatus: NotificationStatus.READ },
        { new: true },
      )
      .exec();
  }

  public async getNotifications(memberId: ObjectId): Promise<Notification[]> {
    const result = await this.notificationModel
      .find({ receiverId: memberId })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result;
  }
}
