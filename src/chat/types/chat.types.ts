type CreateChatRoom = {
  secondUserId: number;
};

type Message = {
  content: string;
  roomId: number;
  recipientId: number;
  messageId: string;
};

export type { CreateChatRoom, Message };
