import { Module } from "@nestjs/common";
import { NotificationResolver } from "./notification.resolver";
import { NotificationService } from "./notification.service";
import { MemberModule } from "../member/member.module";
import { MongooseModule } from "@nestjs/mongoose";
import NotificationSchema from "../../schemas/Notification.model";
import { PropertyModule } from "../property/property.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "Notification",
        schema: NotificationSchema,
      },
    ]),
    AuthModule,
    MemberModule,
    PropertyModule,
  ],
  providers: [NotificationResolver, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
