import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { ObjectId } from "mongoose";

@InputType()
export class NotificationInput {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;
}
