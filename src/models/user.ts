import { Schema, model } from 'mongoose';

interface User {
  email: string,
  password: string
}

const schema = new Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
});

const User = model<User>('User', schema);

export default User;
