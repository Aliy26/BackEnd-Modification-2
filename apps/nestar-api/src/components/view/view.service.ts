import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { View } from "../../libs/dto/view/view";
import { ViewInput } from "../../libs/dto/view/view.input";
import { T } from "../../libs/types/common";
import { OrdinaryInquiry } from "../../libs/dto/product/product.input";
import { Products } from "../../libs/dto/product/product";
import { lookupVisit } from "../../libs/config";
import { ViewGroup } from "../../libs/enums/view.enum";

@Injectable()
export class ViewService {
  constructor(@InjectModel("View") private readonly viewModel: Model<View>) {}
  public async recordView(input: ViewInput): Promise<View | null> {
    const viewExist = await this.checkViewExistence(input);
    if (!viewExist) {
      console.log("-- New View Insertion --");
      return await this.viewModel.create(input);
    } else return null;
  }

  private async checkViewExistence(input: ViewInput): Promise<View | null> {
    const { memberId, viewRefId } = input;
    const search: T = { memberId: memberId, viewRefId: viewRefId };
    const result = await this.viewModel.findOne(search).exec();

    return result;
  }

  public async getVisitedProducts(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    const { page, limit } = input;
    const match: T = { viewGroup: ViewGroup.PRODUCT, memberId: memberId };

    const data: T = await this.viewModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: "products",
            let: { productId: "$viewRefId" },
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
            as: "visitedProduct",
          },
        },
        { $unwind: "$visitedProduct" },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupVisit,
              { $unwind: "$visitedProduct.memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    const result: Products = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele: T) => ele.visitedProduct);

    return result;
  }
}
