import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { SchemaTypes, Types } from 'mongoose';
// import { Expose, Transform } from 'class-transformer';

/*
https://dev.to/techjayvee/3-building-a-common-repository-for-nestjs-microservices-phb
The @Schema() decorator comes from Nest.js Mongoose.
The ObjectId type is imported from Mongoose.
*/

@Schema()
export class BaseAbstractDocument {
  // @Expose()
  // @Transform(({ value }) => value.toString())
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;
  // @Transform(({ value }) => value.toString())
  // _id: string;
  // get idAsString(): string {
  //   return this._id.toString(); // Ensure it's returned as a string
  // }
}
@Schema()
export class BaseSubAbstractDocument {
  // @Transform(({ value }) => value.toString())
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId;

  // get idAsString(): string {
  //   return this._id.toString(); // Ensure it's returned as a string
  // }
}
@Schema()
export class BaseEntityName extends BaseAbstractDocument {
  @Prop({ type: String, required: false })
  name?: string;
}

/**
 * Mixin to add createdBy and updatedBy properties.
 * This function returns a new class that extends the given Base with the WhoDidIt fields.
 */
// helper alias for clarity
type Constructor<T = object> = new (...args: any[]) => T;

export function AuditFieldsMixin<TBase extends Constructor>(Base: TBase) {
  class WhoDidItClass extends Base {
    @Prop({ type: String, default: null })
    createdBy?: string | null;

    @Prop({ type: String, default: null })
    updatedBy?: string | null;
  }

  return WhoDidItClass;
}

/**
 * Our AbstractDocument now needs to combine BaseAbstractDocument and the WhoDidIt properties.
 * We use the mixin function to achieve multiple inheritance.
 */
@Schema()
export class AbstractDocument extends AuditFieldsMixin(BaseAbstractDocument) {
  @Prop({ type: SchemaTypes.Date, default: Date.now() })
  createdAt: Date | null;
  @Prop({ type: SchemaTypes.Date, default: Date.now() })
  updatedAt: Date | null;
}

@Schema({ _id: false })
export class CustomAttribute {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  value: string;
}
export const CustomAttributeSchema =
  SchemaFactory.createForClass(CustomAttribute);
