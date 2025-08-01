import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database';

@Schema({ timestamps: true })
export class FileDocument extends AbstractDocument {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  owner: string; // user id

  @Prop({ required: true })
  recipientEmail: string;

  @Prop({ required: true })
  encryptedPath: string;

  @Prop({ required: true })
  expirationDate: Date;
  
  @Prop({ required: true })
  passwordHash: string;

}

export const FileSchema = SchemaFactory.createForClass(FileDocument);
