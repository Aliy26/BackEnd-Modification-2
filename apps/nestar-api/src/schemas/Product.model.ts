import { Schema } from "mongoose";
import {
  ProductStatus,
  ProductCategory,
  ProductType,
  ProductBrand,
} from "../libs/enums/product.enum";

const ProductSchema = new Schema(
  {
    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },

    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },

    productCategory: {
      type: String,
      enum: ProductCategory,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productStock: {
      type: Number,
      required: true,
    },

    productBrand: {
      type: String,
      enum: ProductBrand,
      required: true,
    },

    productViews: {
      type: Number,
      default: 0,
    },

    productLikes: {
      type: Number,
      default: 0,
    },

    productComments: {
      type: Number,
      default: 0,
    },

    productSoldCount: {
      type: Number,
      default: 0,
    },

    discountedPrice: {
      type: Number,
      default: 0,
    },

    productRank: {
      type: Number,
      default: 0,
    },

    productImages: {
      type: [String],
      required: true,
    },

    productDesc: {
      type: String,
    },

    productInstallment: {
      type: Boolean,
      default: false,
    },

    productRent: {
      type: Boolean,
      default: false,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    soldAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },

    manufacturedIn: {
      type: Number,
    },
  },
  { timestamps: true, collection: "products" },
);

ProductSchema.index(
  {
    productType: 1,
    productCategory: 1,
    productName: 1,
    productBrand: 1,
    productPrice: 1,
  },
  { unique: true },
);

export default ProductSchema;
