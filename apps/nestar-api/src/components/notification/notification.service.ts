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
import { MessageInput } from "../../libs/dto/notification/notification.input";
import { shapeIntoMongoObjectId } from "../../libs/config";
import {
  NotificationGroup,
  NotificationType,
} from "../../libs/enums/notification.enum";
import { Product } from "../../libs/dto/product/product";
import { ProductStatus } from "../../libs/enums/product.enum";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel("Notification")
    private readonly notificationModel: Model<Notification>,
    @InjectModel("Product") private readonly productModel: Model<Product>,
  ) {}

  public async notifyMember(input: NotificationInput): Promise<Notification> {
    try {
      {
        if (input.receiverId.toString() === String(input.authorId)) return;
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
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result;
  }

  public async notifyFollowers(input: NotificationInput[]): Promise<void> {
    await this.notificationModel.insertMany(input);
  }

  public async getNotifications(receiverId: ObjectId): Promise<Notifications> {
    const match: T = { receiverId: receiverId };
    const sort: T = { createdAt: -1 };

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
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $unwind: { preserveNullAndEmptyArrays: true, path: "$productData" },
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

  public async sendMessage(input: MessageInput): Promise<Notification> {
    try {
      const product = await this.productModel.findById(input.productId);

      if (!product || product.productStatus !== ProductStatus.ACTIVE)
        throw new InternalServerErrorException(Message.NO_DATA_FOUND);

      if (String(product.memberId) === String(input.memberId))
        throw new InternalServerErrorException(Message.BAD_REQUEST);

      const notificationInput: NotificationInput = {
        authorId: input.memberId,
        receiverId: product.memberId,
        productId: product._id,
        notificationType: NotificationType.MESSAGE,
        notificationGroup: NotificationGroup.PRODUCT,
        notificationDesc: input.notificationDesc,
      };

      const result = await this.notificationModel.create(notificationInput);
      return result;
    } catch (err) {
      console.log("Error, sendMessage Notification Service");
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }
}
