import { NextFunction } from 'express';
import { Schema, Types, model } from 'mongoose';
import { nanoid } from 'nanoid';

interface Node {
  title: string,
  payload: string,
  slug?: string,
  private: boolean,
  user: Types.ObjectId,
  parent?: Types.ObjectId | null,
  children?: Types.ObjectId[]
}

const schema = new Schema<Node>({
  title: {
    type: String,
    required: true
  },
  payload: String,
  slug: {
    type: String,
    default: generateSlug,
    unique: true
  },
  private: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Node",
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: "Node",
  }],
});

function generateSlug() {
  return nanoid(10);
}

function populateChildren(next: NextFunction) {
  this.populate({
    path: 'children',
    model: 'Node'
  });

  next();
};

schema
  .pre('findOne', populateChildren)
  .pre('find', populateChildren)

const Node = model<Node>('Node', schema);

export default Node;
