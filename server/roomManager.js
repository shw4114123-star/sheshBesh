import { createError } from "./errorHendler.js";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rooms = new Map();
const socketToRoom = new Map();
const rendomRoomId = () => {
    let roomId;
    do {
        roomId = "";
        for (let i = 0; i < 6; i++) {
            roomId += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
        }
    } while (rooms.has(roomId));
    return roomId;
}

export function createRoom(socketId, playerName) {
    if (!playerName || !playerName.trim() || playerName.trim().length > 20) throw new createError("not a good player name", 401)
    if (socketToRoom.has(socketId)) throw new createError("the player alredy has an existing game", 401)
    const room = {
        id: rendomRoomId(),
        status: "waiting",
        ownerSocketId: socketId,
        players: [
            { socketId, name: playerName.trim(), color: "white" }
        ],
        game: null,
        rematchAcceptedBy: []
    };
    rooms.set(room.id, room);
    socketToRoom.set(socketId, room.id);
    return room;
}