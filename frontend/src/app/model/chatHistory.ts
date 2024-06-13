export class ChatHistory {
    constructor(
        public id: number,
        public groupId: number,
        public msgFromUserId: number,
        public msgToUserId: number,
        public msgText: string,
    ) {
    }
}
