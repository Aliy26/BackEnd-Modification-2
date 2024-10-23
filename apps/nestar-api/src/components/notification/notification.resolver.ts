import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NotificationService } from "./notification.service";
import { Notification } from "../../libs/dto/notification/notification";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthMember } from "../auth/decorators/authMember.decorator";
import { ObjectId } from "mongoose";
import { shapeIntoMongoObjectId } from "../../libs/config";

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Query(() => [Notification])
  public async getNotifications(
    @AuthMember("_id") memberId: ObjectId,
  ): Promise<Notification[]> {
    console.log("getNotifications");
    return await this.notificationService.getNotifications(memberId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Notification)
  public async updateNotification(
    @Args("_id") input: string,
    @AuthMember("_id") recieverId: ObjectId,
  ): Promise<Notification> {
    console.log("updateNotification");
    const notificationId = shapeIntoMongoObjectId(input);

    return await this.notificationService.updateNotification(
      recieverId,
      notificationId,
    );
  }
}
