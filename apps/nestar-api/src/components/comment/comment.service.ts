import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { MemberService } from "../member/member.service";
import { ProductService } from "../product/product.service";
import { BoardArticleService } from "../board-article/board-article.service";
import {
  CommentInput,
  CommentsInquiry,
} from "../../libs/dto/comment/comment.input";
import { Comments, Comment } from "../../libs/dto/comment/comment";
import { Direction, Message } from "../../libs/enums/common.enum";
import { CommentGroup, CommentStatus } from "../../libs/enums/comment.enum";
import { CommentUpdate } from "../../libs/dto/comment/comment.update";
import { NotificationInput, T } from "../../libs/types/common";
import { lookupMember } from "../../libs/config";
import { NotificationService } from "../notification/notification.service";
import {
  NotificationGroup,
  NotificationTitle,
  NotificationType,
} from "../../libs/enums/notification.enum";

@Injectable()
export class CommentService {
  constructor(
    @InjectModel("Comment") private readonly commentModel: Model<Comment>,
    private readonly memberService: MemberService,
    private readonly ProductService: ProductService,
    private readonly boardArticleService: BoardArticleService,
    private readonly notificationService: NotificationService,
  ) {}

  public async createComment(
    memberId: ObjectId,
    input: CommentInput,
  ): Promise<Comment> {
    input.memberId = memberId;

    let result = null;
    const notificationInput: NotificationInput = {
      authorId: memberId,
      receiverId: null,
      notificationType: NotificationType.COMMENT,
      notificationTitle: NotificationTitle.COMMENT,
    };
    try {
      result = await this.commentModel.create(input);
    } catch (err) {
      console.log("Error, Service.model", err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }

    switch (input.commentGroup) {
      case CommentGroup.PRODUCT:
        await this.ProductService.productStatsEditor({
          _id: input.commentRefId,
          targetKey: "productComments",
          modifier: 1,
        });
        const agentProduct = await this.ProductService.getProduct(
          null,
          input.commentRefId,
        );
        const agent = await this.memberService.getMember(
          null,
          agentProduct.memberId,
        );
        notificationInput.receiverId = agent._id;
        notificationInput.productId = input.commentRefId;
        notificationInput.notificationDesc = input.commentContent;
        notificationInput.notificationGroup = NotificationGroup.PRODUCT;

        await this.notificationService.notifyMember(notificationInput);
        break;
      case CommentGroup.ARTICLE:
        await this.boardArticleService.boardArticleStatsEditor({
          _id: input.commentRefId,
          targetKey: "articleComments",
          modifier: 1,
        });
        const article = await this.boardArticleService.getBoardArticle(
          null,
          input.commentRefId,
        );
        const writer = await this.memberService.getMember(
          null,
          article.memberId,
        );
        notificationInput.receiverId = writer._id;
        notificationInput.articleId = article._id;
        notificationInput.notificationDesc = input.commentContent;
        notificationInput.notificationGroup = NotificationGroup.ARTICLE;

        await this.notificationService.notifyMember(notificationInput);
        break;
      case CommentGroup.MEMBER:
        await this.memberService.memberStatsEditor({
          _id: input.commentRefId,
          targetKey: "memberComments",
          modifier: 1,
        });

        notificationInput.receiverId = input.commentRefId;
        notificationInput.notificationDesc = input.commentContent;
        notificationInput.notificationGroup = NotificationGroup.MEMBER;

        await this.notificationService.notifyMember(notificationInput);
        break;
    }

    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
    return result;
  }

  public async updateComment(
    memberId: ObjectId,
    input: CommentUpdate,
  ): Promise<Comment> {
    const { _id } = input;
    const result = await this.commentModel
      .findOneAndUpdate(
        {
          _id: _id,
          memberId: memberId,
          commentStatus: CommentStatus.ACTIVE,
        },
        input,
        {
          new: true,
        },
      )
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (result.commentStatus === CommentStatus.DELETE) {
      switch (result.commentGroup) {
        case CommentGroup.PRODUCT:
          await this.ProductService.productStatsEditor({
            _id: result.commentRefId,
            targetKey: "productComments",
            modifier: -1,
          });
          break;
        case CommentGroup.ARTICLE:
          await this.boardArticleService.boardArticleStatsEditor({
            _id: result.commentRefId,
            targetKey: "articleComments",
            modifier: -1,
          });
        case CommentGroup.MEMBER:
          await this.memberService.memberStatsEditor({
            _id: result.commentRefId,
            targetKey: "memberComments",
            modifier: -1,
          });

          break;
      }
    }

    return result;
  }

  public async getComments(
    memberId: ObjectId,
    input: CommentsInquiry,
  ): Promise<Comments> {
    const { commentRefId } = input.search;
    const match: T = {
      commentRefId: commentRefId,
      commentStatus: CommentStatus.ACTIVE,
    };
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };

    const result: Comments[] = await this.commentModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              // meLiked
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

  public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
    const result = await this.commentModel.findByIdAndDelete(input).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    if (result.commentStatus === CommentStatus.ACTIVE) {
      switch (result.commentGroup) {
        case CommentGroup.PRODUCT:
          await this.ProductService.productStatsEditor({
            _id: result.commentRefId,
            targetKey: "productComments",
            modifier: -1,
          });
          break;
        case CommentGroup.ARTICLE:
          await this.boardArticleService.boardArticleStatsEditor({
            _id: result.commentRefId,
            targetKey: "articleComments",
            modifier: -1,
          });
        case CommentGroup.MEMBER:
          await this.memberService.memberStatsEditor({
            _id: result.commentRefId,
            targetKey: "memberComments",
            modifier: -1,
          });
          break;
      }
    }
    return result;
  }
}
