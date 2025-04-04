import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Like, MeLiked } from "../../libs/dto/like/like";
import { Model, ObjectId } from "mongoose";
import { LikeInput } from "../../libs/dto/like/like.input";
import { T } from "../../libs/types/common";
import { OrdinaryInquiry } from "../../libs/dto/product/product.input";
import { LikeGroup } from "../../libs/enums/like.enum";
import { Products } from "../../libs/dto/product/product";
import { lookupFavorite } from "../../libs/config";
import { ProductStatus } from "../../libs/enums/product.enum";

@Injectable()
export class LikeService {
  constructor(@InjectModel("Like") private readonly likeModel: Model<Like>) {}
  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
      exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;

    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (err) {
        console.log("ERROR, Service.model", err.message);
      }
    }

    console.log(`-Like modifier ${modifier} -`);
    return modifier;
  }

  public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
    const { memberId, likeRefId } = input;
    const result = await this.likeModel
      .findOne({ memberId: memberId, likeRefId: likeRefId })
      .exec();
    return result
      ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }]
      : [];
  }

  public async getFavoriteProducts(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    const { page, limit } = input;
    const match: T = {
      likeGroup: LikeGroup.PRODUCT,
      memberId: memberId,
    };

    const data: T = await this.likeModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: "products",
            let: { productId: "$likeRefId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$productId"] },
                      { $eq: ["$productStatus", "ACTIVE"] },
                    ],
                  },
                },
              },
            ],
            as: "favoriteProduct",
          },
        },
        { $unwind: "$favoriteProduct" },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupFavorite,
              { $unwind: "$favoriteProduct.memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();

    const result: Products = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele: T) => ele.favoriteProduct);

    return result;
  }
}
