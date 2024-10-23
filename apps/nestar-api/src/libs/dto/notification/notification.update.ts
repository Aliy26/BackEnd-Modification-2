import { Field, InputType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";
import { IsNotEmpty } from "class-validator";

@InputType()
export class Notification {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;
}
