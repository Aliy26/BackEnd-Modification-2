import { Module } from "@nestjs/common";
import { NotificationResolver } from "./notification.resolver";
import { NotificationService } from "./notification.service";
import { MongooseModule } from "@nestjs/mongoose";
import NotificationSchema from "../../schemas/Notification.model";
import { AuthModule } from "../auth/auth.module";
import { ProductService } from "../product/product.service";
import ProductSchema from "../../schemas/Product.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "Notification",
        schema: NotificationSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: "Product",
        schema: ProductSchema,
      },
    ]),

    AuthModule,
  ],
  providers: [NotificationResolver, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
