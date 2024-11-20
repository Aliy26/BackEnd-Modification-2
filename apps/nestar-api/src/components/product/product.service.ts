import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Products, Product } from "../../libs/dto/product/product";
import {
  AgentProductsInquiry,
  AllProductsInquiry,
  OrdinaryInquiry,
  ProductsInquiry,
  ProductInput,
} from "../../libs/dto/product/product.input";
import { Direction, Message } from "../../libs/enums/common.enum";
import { MemberService } from "../member/member.service";
import {
  NotificationInput,
  StatisticModifier,
  T,
} from "../../libs/types/common";
import { ProductStatus } from "../../libs/enums/product.enum";
import { ViewGroup } from "../../libs/enums/view.enum";
import { ViewService } from "../view/view.service";
import { ProductUpdate } from "../../libs/dto/product/product.update";
import * as moment from "moment";
import {
  lookupAuthMemberLiked,
  lookupMember,
  shapeIntoMongoObjectId,
} from "../../libs/config";
import { LikeInput } from "../../libs/dto/like/like.input";
import { LikeGroup } from "../../libs/enums/like.enum";
import { LikeService } from "../like/like.service";
import { NotificationService } from "../notification/notification.service";
import {
  NotificationGroup,
  NotificationTitle,
  NotificationType,
} from "../../libs/enums/notification.enum";
import { Follower, Following } from "../../libs/dto/follow/follow";
import { Member } from "../../libs/dto/member/member";
import { Notification } from "../../libs/dto/notification/notification";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel("Product") private readonly productModel: Model<Product>,
    @InjectModel("Follow")
    private readonly followModel: Model<Follower | Following>,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
    private readonly notificationService: NotificationService,
  ) {}

  public async createProduct(input: ProductInput): Promise<Product> {
    try {
      const result: Product = await this.productModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: "memberProducts",
        modifier: 1,
      });

      const agent = await this.memberService.getMember(null, result.memberId);

      if (agent.memberFollowers === 0) return result;
      const followers = await this.followModel
        .find({
          followingId: result.memberId,
        })
        .exec();

      const notifications = followers.map((follower: Follower) => ({
        authorId: result.memberId,
        receiverId: follower.followerId,
        productId: result._id,
        notificationGroup: NotificationGroup.PRODUCT,
        notificationType: NotificationType.NEW_PRODUCT,
      }));

      await this.notificationService.notifyFollowers(notifications);

      return result;
    } catch (err) {
      console.log("Error, Service.model", err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getProduct(
    memberId: ObjectId,
    productId: ObjectId,
  ): Promise<Product> {
    const search: T = {
      _id: productId,
      productStatus: ProductStatus.ACTIVE,
    };

    const targetProduct: Product = await this.productModel
      .findOne(search)
      .lean()
      .exec();

    if (!targetProduct)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.productStatsEditor({
          _id: productId,
          targetKey: "productViews",
          modifier: 1,
        });
        targetProduct.productViews++;
      }

      const likeInput = {
        memberId: memberId,
        likeRefId: productId,
        likeGroup: LikeGroup.PRODUCT,
      };

      targetProduct.meLiked =
        await this.likeService.checkLikeExistence(likeInput);
    }
    targetProduct.memberData = await this.memberService.getMember(
      null,
      targetProduct.memberId,
    );
    return targetProduct;
  }

  public async productStatsEditor(input: StatisticModifier): Promise<Product> {
    const { _id, targetKey, modifier } = input;
    return await this.productModel
      .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .exec();
  }

  public async getProducts(
    memberId: ObjectId,
    input: ProductsInquiry,
  ): Promise<Products> {
    const match: T = { productStatus: ProductStatus.ACTIVE };
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    this.shapeMatchQuery(match, input);
    console.log("match", match);

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
              // {
              //   $unwind: { preserveNullAndEmptyArrays: true, path: "$meLiked" },
              // },
              lookupMember,
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  private shapeMatchQuery(match: T, input: ProductsInquiry): void {
    const {
      memberId,
      typeList,
      categoryList,
      discountedPrice,
      productStock,
      periodsRange,
      pricesRange,
      options,
      text,
      productBrand,
    } = input.search;
    // memberEmail: { $exists: true, $ne: "" }, // queries only the agents with the truthy memberEmail dataset
    if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
    if (discountedPrice) match.discountedPrice = { $gt: 0 };
    if (productStock) match.productStock = { $lte: 30, $ne: 0 };
    if (typeList && typeList.length) match.productType = { $in: typeList };
    if (productBrand) match.productBrand = productBrand;
    if (categoryList && categoryList.length)
      match.productCategory = { $in: categoryList };
    if (pricesRange)
      match.productPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
    if (periodsRange)
      match.manufacturedIn = {
        $gte: periodsRange.start,
        $lte: periodsRange.end,
      };
    if (text) match.productName = { $regex: new RegExp(text, "i") };
    if (options && options.length) {
      match["$or"] = options.map((ele) => {
        return { [ele]: true };
      });
    }
  }

  public async updateProduct(
    memberId: ObjectId,
    input: ProductUpdate,
  ): Promise<Product> {
    let { productStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,
      memberId: memberId,
      productStatus: ProductStatus.ACTIVE,
    };

    if (productStatus === ProductStatus.SOLD) {
      soldAt = moment().toDate();
      input.soldAt = soldAt;
    } else if (productStatus === ProductStatus.DELETE) {
      deletedAt = moment().toDate();
      input.deletedAt = deletedAt;
    }

    const result = await this.productModel
      .findOneAndUpdate(search, input, {
        new: true,
      })
      .lean()
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: "memberProducts",
        modifier: -1,
      });
    }

    return result;
  }

  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.likeService.getFavoriteProducts(memberId, input);
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.viewService.getVisitedProducts(memberId, input);
  }

  public async getAgentProducts(
    memberId: ObjectId,
    input: AgentProductsInquiry,
  ): Promise<Products> {
    const { productStatus } = input.search;
    if (productStatus === ProductStatus.DELETE)
      throw new BadRequestException(Message.NO_DATA_FOUND);

    const match: T = {
      memberId: memberId,
      productStatus: productStatus ?? { $ne: ProductStatus.DELETE },
    };

    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };
    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async likeTargetProduct(
    memberId: ObjectId,
    likeRefId: ObjectId,
  ): Promise<Product> {
    const target: Product = await this.productModel
      .findOne({ _id: likeRefId, productStatus: ProductStatus.ACTIVE })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };

    const member = await this.memberService.getMember(null, target.memberId);

    const notificationInput: NotificationInput = {
      authorId: memberId,
      receiverId: member._id,
      productId: likeRefId,
      notificationGroup: NotificationGroup.PRODUCT,
      notificationType: NotificationType.LIKE,
      notificationTitle: NotificationTitle.LIKE,
    };

    // LIKE TOGGLE via Like Module

    const modifier: number = await this.likeService.toggleLike(input);

    if (modifier === 1) {
      await this.notificationService.notifyMember(notificationInput);
    } else if (modifier === -1) {
      await this.notificationService.deleteNotification(notificationInput);
    }

    const result = await this.productStatsEditor({
      _id: likeRefId,
      targetKey: "productLikes",
      modifier,
    });

    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result;
  }

  public async getAllProductsByAdmin(
    input: AllProductsInquiry,
  ): Promise<Products> {
    const { productStatus, productCategoryList } = input.search;
    const match: T = {};

    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    if (productStatus) match.productStatus = productStatus;
    if (productCategoryList)
      match.productCategory = { $in: productCategoryList };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async updateProductByAdmin(input: ProductUpdate): Promise<Product> {
    let { productStatus, soldAt, deletedAt } = input;

    const search: T = {
      _id: input._id,
      // $or: [
      //   { productStatus: ProductStatus.ACTIVE },
      //   { productStatus: ProductStatus.SOLD },
      //   { productStatus: ProductStatus.DELETE },
      // ],
    };

    if (productStatus === ProductStatus.SOLD) {
      soldAt = moment().toDate();
      input.soldAt = soldAt;
    } else if (productStatus === ProductStatus.DELETE) {
      deletedAt = moment().toDate();
      input.deletedAt = deletedAt;
    }

    const result = await this.productModel
      .findOneAndUpdate(search, input, {
        new: true,
      })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: "memberProducts",
        modifier: -1,
      });
    }

    return result;
  }

  public async removeProductsByAdmin(productId: ObjectId): Promise<Product> {
    const search: T = {
      _id: productId,
      productStatus: ProductStatus.DELETE,
    };
    const result = await this.productModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

    return result;
  }
}
