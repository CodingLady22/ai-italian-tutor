import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatSession } from "./chat-session.schema";

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatSession', required: true })
    session_id: ChatSession;

    @Prop({ required: true, enum: ['user', 'ai'] })
    sender: string;

    @Prop({ required: true })
    content: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
