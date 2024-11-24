import { Field, InputType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";

@InputType()
export class MessageInput {
  @Field(() => String)
  productId: string;

  @Field(() => String)
  notificationDesc: string;

  memberId: ObjectId;
}
