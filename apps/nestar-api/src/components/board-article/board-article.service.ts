import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import {
  BoardArticle,
  BoardArticles,
} from "../../libs/dto/board-article/board-article";
import {
  AllBoardArticlesInquiry,
  BoardArticleInput,
  BoardArticlesInquiry,
} from "../../libs/dto/board-article/board-article.input";
import { MemberService } from "../member/member.service";
import { Direction, Message } from "../../libs/enums/common.enum";
import { ViewGroup } from "../../libs/enums/view.enum";
import { ViewService } from "../view/view.service";
import { BoardArticleStatus } from "../../libs/enums/board-article.enum";
import {
  NotificationInput,
  StatisticModifier,
  T,
} from "../../libs/types/common";
import { BoardArticleUpdate } from "../../libs/dto/board-article/board-article.update";
import {
  lookupAuthMemberLiked,
  lookupMember,
  shapeIntoMongoObjectId,
} from "../../libs/config";
import { LikeService } from "../like/like.service";
import { LikeGroup } from "../../libs/enums/like.enum";
import { LikeInput } from "../../libs/dto/like/like.input";
import { NotificationService } from "../notification/notification.service";
import {
  NotificationGroup,
  NotificationTitle,
  NotificationType,
} from "../../libs/enums/notification.enum";
import { Follower, Following } from "../../libs/dto/follow/follow";

@Injectable()
export class BoardArticleService {
  constructor(
    @InjectModel("BoardArticle")
    private readonly boardArticleModel: Model<BoardArticle>,
    @InjectModel("Follow")
    private readonly followModel: Model<Follower | Following>,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
    private readonly notificationService: NotificationService,
  ) {}

  public async createBoardArticle(
    memberId: ObjectId,
    input: BoardArticleInput,
  ): Promise<BoardArticle> {
    input.memberId = memberId;
    try {
      const result = await this.boardArticleModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: "memberArticles",
        modifier: 1,
      });

      const agent = await this.memberService.getMember(null, result.memberId);

      if (agent.memberFollowers === 0) return result;

      const followers = await this.followModel
        .find({ followingId: agent._id })
        .exec();

      const notifications = followers.map((followers) => ({
        authorId: agent._id,
        receiverId: followers.followerId,
        articleId: result._id,
        notificationGroup: NotificationGroup.ARTICLE,
        notificationType: NotificationType.NEW_ARTICLE,
      }));

      await this.notificationService.notifyFollowers(notifications);

      return result;
    } catch (err) {
      console.log("Error, Service.model", err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getBoardArticle(
    memberId: ObjectId,
    articleId: ObjectId,
  ): Promise<BoardArticle> {
    const search: T = {
      _id: articleId,
      articleStatus: BoardArticleStatus.ACTIVE,
    };

    const targetBoardArticle: BoardArticle = await this.boardArticleModel
      .findOne(search)
      .lean()
      .exec();
    if (!targetBoardArticle)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = {
        memberId: memberId,
        viewRefId: articleId,
        viewGroup: ViewGroup.ARTICLE,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.boardArticleStatsEditor({
          _id: articleId,
          targetKey: "articleViews",
          modifier: 1,
        });
        targetBoardArticle.articleViews++;
      }

      const likeInput = {
        memberId: memberId,
        likeRefId: articleId,
        likeGroup: LikeGroup.ARTICLE,
      };

      targetBoardArticle.meLiked =
        await this.likeService.checkLikeExistence(likeInput);
    }
    targetBoardArticle.memberData = await this.memberService.getMember(
      null,
      targetBoardArticle.memberId,
    );
    return targetBoardArticle;
  }

  public async updateBoardArticle(
    memberId: ObjectId,
    input: BoardArticleUpdate,
  ): Promise<BoardArticle> {
    const { _id, articleStatus } = input;

    const result = await this.boardArticleModel
      .findOneAndUpdate(
        {
          _id: _id,
          memberId: memberId,
          articleStatus: BoardArticleStatus.ACTIVE,
        },
        input,
        {
          new: true,
        },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (articleStatus === BoardArticleStatus.DELETE) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: "memberArticles",
        modifier: -1,
      });
    }
    return result;
  }
  public async getBoardArticles(
    memberId: ObjectId,
    input: BoardArticlesInquiry,
  ): Promise<BoardArticles> {
    const { articleCategory, text } = input.search;
    const match: T = { articleStatus: BoardArticleStatus.ACTIVE };
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    if (articleCategory) match.articleCategory = articleCategory;
    if (text) match.articleTitle = { $regex: new RegExp(text, "i") };
    if (input.search?.memberId) {
      match.memberId = shapeIntoMongoObjectId(input.search.memberId);
    }
    console.log("match", match);

    const result = await this.boardArticleModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
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

  public async likeTargetBoardArticle(
    memberId: ObjectId,
    likeRefId: ObjectId,
  ): Promise<BoardArticle> {
    const target: BoardArticle = await this.boardArticleModel
      .findOne({
        _id: likeRefId,
        articleStatus: BoardArticleStatus.ACTIVE,
      })
      .exec();

    const member = await this.memberService.getMember(null, target.memberId);

    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.ARTICLE,
    };

    const notificationInput: NotificationInput = {
      authorId: memberId,
      receiverId: member._id,
      articleId: likeRefId,
      notificationGroup: NotificationGroup.ARTICLE,
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

    const result = await this.boardArticleStatsEditor({
      _id: likeRefId,
      targetKey: "articleLikes",
      modifier,
    });

    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result;
  }

  public async getAllBoardArticlesByAdmin(
    input: AllBoardArticlesInquiry,
  ): Promise<BoardArticles> {
    const { articleStatus, articleCategory } = input.search;
    const match: T = {};
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    if (articleStatus) match.articleStatus = articleStatus;
    if (articleCategory) match.articleCategory = articleCategory;

    const result = await this.boardArticleModel
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

  public async updateBoardArticleByAdmin(
    input: BoardArticleUpdate,
  ): Promise<BoardArticle> {
    const { _id, articleStatus } = input;
    const result = await this.boardArticleModel
      .findOneAndUpdate(
        { _id: _id, articleStatus: BoardArticleStatus.ACTIVE },
        input,
        {
          new: true,
        },
      )
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (articleStatus === BoardArticleStatus.DELETE) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: "memberArticles",
        modifier: -1,
      });
    }
    return result;
  }

  public async removeBoardArticleByAdmin(
    articleId: ObjectId,
  ): Promise<BoardArticle> {
    const search: T = {
      _id: articleId,
      articleStatus: BoardArticleStatus.DELETE,
    };
    const result = await this.boardArticleModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }

  public async boardArticleStatsEditor(
    input: StatisticModifier,
  ): Promise<BoardArticle> {
    const { _id, targetKey, modifier } = input;
    return await this.boardArticleModel.findByIdAndUpdate(
      _id,
      { $inc: { [targetKey]: modifier } },
      {
        new: true,
      },
    );
  }
}
