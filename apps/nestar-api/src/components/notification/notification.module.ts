import { Module } from "@nestjs/common";
import { NotificationResolver } from "./notification.resolver";
import { NotificationService } from "./notification.service";
import { MemberModule } from "../member/member.module";

@Module({
  imports: [MemberModule],
  providers: [NotificationResolver, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
