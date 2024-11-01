import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from "class-validator";
import {
  ProductBrand,
  ProductCategory,
  ProductStatus,
  ProductType,
} from "../../enums/product.enum";
import { ObjectId } from "mongoose";
import { availableOptions, availableProductSorts } from "../../config";
import { Direction } from "../../enums/common.enum";

@InputType()
export class ProductInput {
  @IsNotEmpty()
  @Field(() => ProductType)
  productType: ProductType;

  @IsNotEmpty()
  @Field(() => ProductCategory)
  productCategory: ProductCategory;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  productName: string;

  @IsNotEmpty()
  @Field(() => Int)
  productPrice: number;

  @IsNotEmpty()
  @Field(() => String)
  productBrand: ProductBrand;

  @IsNotEmpty()
  @Field(() => [String])
  productImages: string[];

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

  memberId?: ObjectId;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  manufacturedIn?: number;
}

@InputType()
export class PricesRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class PeriodRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@InputType()
class PISearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => [ProductCategory], { nullable: true })
  productCategory?: ProductCategory[];

  @IsOptional()
  @Field(() => [ProductType], { nullable: true })
  typeList?: ProductType[];

  @IsOptional()
  @IsIn(availableOptions, { each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodRange, { nullable: true })
  periodsRange?: PeriodRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class ProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => PISearch)
  search: PISearch;
}

@InputType()
class APISearch {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;
}

@InputType()
export class AgentProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => APISearch)
  search: APISearch;
}

@InputType()
class ALPISearch {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => [ProductCategory], { nullable: true })
  productCategoryList?: ProductCategory[];
}

@InputType()
export class AllProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ALPISearch)
  search: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}
