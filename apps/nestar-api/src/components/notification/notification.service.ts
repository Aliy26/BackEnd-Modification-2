import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Message } from "../../libs/enums/common.enum";
import {
  Notification,
  Notifications,
} from "../../libs/dto/notification/notification";
import { NotificationInput, T } from "../../libs/types/common";

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

  public async getNotifications(receiverId: ObjectId): Promise<Notifications> {
    const match: T = { receiverId: receiverId };
    const sort: T = { createdAt: -1 };
    console.log("HHHHHHHHHHHHHHHHHHHHHHH");

    const result = await this.notificationModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $lookup: {
            from: "members",
            localField: "authorId",
            foreignField: "_id",
            as: "authorData",
          },
        },
        { $unwind: "$authorData" },
        {
          $lookup: {
            from: "properties",
            localField: "propertyId",
            foreignField: "_id",
            as: "propertyData",
          },
        },
        {
          $unwind: { preserveNullAndEmptyArrays: true, path: "$propertyData" },
        },
        {
          $lookup: {
            from: "boardArticles",
            localField: "articleId",
            foreignField: "_id",
            as: "articleData",
          },
        },
        { $unwind: { preserveNullAndEmptyArrays: true, path: "$articleData" } },
      ])
      .exec();

    const notifications = new Notifications();
    notifications.list = result as Notification[];

    return notifications;
  }

  public async getUnreadNotifications(
    receiverId: ObjectId,
  ): Promise<Notification[]> {
    const match: T = { receiverId: receiverId, notificationStatus: "UNREAD" };
    const result = await this.notificationModel.find(match).exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result;
  }
}
