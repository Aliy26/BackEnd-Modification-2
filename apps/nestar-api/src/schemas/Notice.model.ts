import mongoose, { Schema } from "mongoose";
import { NoticeCategory, NoticeStatus } from "../libs/enums/notice.enum";

const NoticeSchema = new Schema(
  {
    noticeCategory: {
      type: String,
      enum: NoticeCategory,
      required: true,
    },

    field: {
      type: String,
    },

    noticeStatus: {
      type: String,
      enum: NoticeStatus,
      default: NoticeStatus.ACTIVE,
    },

    noticeTitle: {
      type: String,
      required: true,
    },

    noticeContent: {
      type: String,
      required: true,
    },

    noticeImage: {
      type: String,
      default: "",
    },

    eventCity: {
      type: String,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
  },

  { timestamps: true, collection: "notices" },
);

NoticeSchema.index({
  noticeTitle: 1,
});

export default NoticeSchema;
