import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import { ObjectId } from "mongoose";
import {
  ProductCategory,
  ProductStatus,
  ProductType,
} from "../../enums/product.enum";

@InputType()
export class ProductUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => ProductCategory, { nullable: true })
  productCategory?: ProductCategory;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  productName?: string;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  productPrice?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productBrand?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productImages?: string;

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  productDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productInstallment?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productRent?: boolean;

  soldAt?: Date;

  deletedAt?: Date;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  manufacturedIn?: number;
}
