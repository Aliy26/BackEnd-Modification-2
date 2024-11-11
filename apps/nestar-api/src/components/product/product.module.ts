import { Module } from "@nestjs/common";
import { ProductResolver } from "./product.resolver";
import { ProductService } from "./product.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import ProductSchema from "../../schemas/Product.model";
import { ViewModule } from "../view/view.module";
import { MemberModule } from "../member/member.module";
import { LikeModule } from "../like/like.module";
import { NotificationModule } from "../notification/notification.module";
import FollowSchema from "../../schemas/Follow.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "Product",
        schema: ProductSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: "Follow",
        schema: FollowSchema,
      },
    ]),
    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule,
    NotificationModule,
  ],
  providers: [ProductResolver, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
