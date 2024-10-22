import { Args, Query, Resolver } from "@nestjs/graphql";
import { NotificationService } from "./notification.service";
import { Notification } from "../../libs/dto/notification/notification";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthMember } from "../auth/decorators/authMember.decorator";
import { ObjectId } from "mongoose";
import { NotificationInput } from "../../libs/dto/notification/notification.input";
import { shapeIntoMongoObjectId } from "../../libs/config";

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Query(() => Notification)
  public async getNotification(
    @Args("_id") id: String,
    @AuthMember("_id") memberId: ObjectId,
  ): Promise<Notification> {
    console.log("getNotifications");
    const notificationId = shapeIntoMongoObjectId(id);
    return await this.notificationService.getNotification(
      memberId,
      notificationId,
    );
  }

  @UseGuards(AuthGuard)
  @Query(() => [Notification])
  public async getNotifications(
    @AuthMember("_id") memberId: ObjectId,
  ): Promise<Notification[]> {
    console.log("getNotifications");
    return await this.notificationService.getNotifications(memberId);
  }
}
