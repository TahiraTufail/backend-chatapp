import { Column, Entity, ManyToOne } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";
import { ChatRoom } from "./chatroom.entity";

@Entity()
export class Message{
    @PrimaryGeneratedColumn()
    id:string

    @ManyToOne(()=>ChatRoom, (chatRoom)=>chatRoom.messages)
    chatRoom:ChatRoom;
    
    
    

}