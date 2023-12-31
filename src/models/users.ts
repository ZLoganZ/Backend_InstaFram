import { Schema, model, Types } from 'mongoose';

import { IUser } from '../types';
import { getSelectData } from '../libs/utils';
import { selectUserPopulateArr } from '../libs/constants';

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema(
  {
    name: { type: String, index: true, required: true },
    email: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true, select: false },
    posts: {
      type: [ObjectId],
      ref: 'Post',
      default: []
    },
    followers: {
      type: [ObjectId],
      ref: 'User',
      default: []
    },
    following: {
      type: [ObjectId],
      ref: 'User',
      default: []
    },
    bio: {
      type: String,
      default: null
    },
    alias: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true
    },
    image: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    methods: {
      async getFollowers() {
        return await model(DOCUMENT_NAME)
          .find({ _id: { $in: this.followers } })
          .lean();
      },
      async getFollowing() {
        return await model(DOCUMENT_NAME)
          .find({ _id: { $in: this.following } })
          .lean();
      }
    },
    statics: {
      async getUsers() {
        return this.find().lean();
      },
      async getUserByEmail(email: string) {
        return await this.findOne({ email }).select('+password').lean();
      },
      async getUserByAlias(alias: string) {
        return await this.findOne({ alias }).lean();
      },
      async getUserByID(id: string | Types.ObjectId) {
        return await this.findById(id).lean();
      },
      async createUser(values: Record<string, any>) {
        return await this.create(values);
      },
      async deleteUser(id: string | Types.ObjectId) {
        return await this.findByIdAndDelete(id).lean();
      },
      async updateUser(id: string | Types.ObjectId, values: Record<string, any>) {
        return await this.findByIdAndUpdate(id, values, { new: true }).lean();
      },
      async getTopCreators(page: string) {
        const limit = 12;
        const skip = parseInt(page) * limit;

        return await this.aggregate<IUser>([
          { $addFields: { postCount: { $size: '$posts' } } },
          { $sort: { postCount: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: 12 },
          { $project: { ...getSelectData(selectUserPopulateArr) } }
        ]);
      },
      async searchUsers(query: string, page: string) {
        const limit = 12;
        const skip = parseInt(page) * limit;

        return await this.aggregate<IUser>([
          { $match: { $text: { $search: `\"${query}\"` } } },
          { $sort: { score: { $meta: 'textScore' }, createdAt: -1 } },
          { $skip: skip },
          { $limit: 12 },
          { $project: { ...getSelectData(selectUserPopulateArr) } }
        ]);
      },
      async getFollowingsByUserID(userID: string) {
        const user = await this.findById(userID).lean();
        if (!user) return [];

        return await this.find({ _id: { $in: user.following } }).lean();
      },
      async getFollowersByUserID(userID: string) {
        const user = await this.findById(userID).lean();
        if (!user) return [];

        return await this.find({ _id: { $in: user.followers } }).lean();
      }
    }
  }
);

UserSchema.index({ name: 'text', alias: 'text' });

export const UserModel = model(DOCUMENT_NAME, UserSchema);
