import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class UserDocument extends AbstractDocument {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Ensure a unique index at the database level as well
UserSchema.index({ email: 1 }, { unique: true });
