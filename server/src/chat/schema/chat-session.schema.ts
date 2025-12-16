import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "src/auth/schema/user.schema";

export type ChatSessionDocument = ChatSession & Document;

@Schema({ timestamps: true })
export class ChatSession {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user_id: User;

    @Prop({ required: true})
    level: string; // 'A1', 'B2'

    @Prop({ required: true })
    mode: string; // 'grammar' or 'topic'

    @Prop({ required: true})
    focus_area: string // "Passato Prossimo" (if mode=grammar) or "Ordering Coffee" (if mode=topic)
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);