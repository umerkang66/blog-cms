import mongoose from 'mongoose';
import { Password } from '../services/password';
import type { Role } from '../common-types/role';

// interface to describe the properties that are required to create user
interface UserAttrs {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

// interface that describes the properties that user document has
export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  adminToken?: string;
  adminTokenExpires?: Date;
  changedPasswordAfter: (jwtIssuedAt: number) => boolean;
}

// interface that describes the properties that a user model has
export interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: { values: ['user', 'writer', 'admin'] },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    adminToken: String,
    adminTokenExpires: Date,
  },
  {
    timestamps: true,
    toJSON: {
      // whenever JSON.stringify() will be called on document, this object will use this configs
      transform(doc, ret) {
        // after converting into plain obj, the object that is returned is "ret", we can modify that ret, it doesn't change the document in mongodb, but rather when it is turned into JSON by express
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        // delete the password, when this document is sent to the client
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.adminToken;
        delete ret.adminTokenExpires;
      },
    },
  }
);

// pre-middlewares
userSchema.pre('save', async function (done) {
  // here "this" is current document
  if (this.isModified('password')) {
    // if password is not modified, go to next middleware, even if we creating the password first time, isModified will return true
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// pre-save middlewares
userSchema.pre('save', function (next) {
  // here "this" is document
  if (!this.isModified('password') || this.isNew) {
    // is the password is not modified
    // of if the password is modified, but the document is newly created (first time), no need to changePasswordAfter timestamp
    return next();
  }

  // Sometimes saving it to the DB is slow than issuing jwt to the client, so passwordChangedAt will become after the jwt is created and sent
  this.set('passwordChangedAt', Date.now() - 1000);
  next();
});

// static-methods
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// document-methods
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt: number) {
  // jwtIssuedAt is in seconds
  // here "this" is document
  if (this.passwordChangedAt) {
    // it means password has been changed, now we have to check, if password is changed after the jwt issued at, then passwordChangedAt will be greater than jwtTime, and return true.

    // converting milliseconds into seconds
    const changedTimestamp = parseInt(
      String(this.passwordChangedAt.getTime() / 1000),
      10
    );

    return changedTimestamp >= jwtIssuedAt;
  }
  return false;
};

// user-model
const User = mongoose.model<UserDocument, UserModel>('users', userSchema);

export { User };
