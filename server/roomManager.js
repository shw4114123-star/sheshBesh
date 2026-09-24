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
    if (!playerName || !playerName.trim() || playerName.trim().length > 20) throw new createError("not a good player name", 400);
    if (socketToRoom.has(socketId)) throw new createError("the player alredy has an existing game", 409);
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


export function joinRoom(socketId, roomCode, playerName) {
    if (!playerName || !playerName.trim() || playerName.trim().length > 20) throw new createError("not a good player name", 400);
    if (socketToRoom.has(socketId)) throw new createError("this socket alredy has an existing game", 409);
    if (!roomCode || typeof roomCode !== "string") throw new createError("invalid room code", 400)
    const room = rooms.get(roomCode.trim().toUpperCase())
    if (!room) throw new createError("the room is not exists", 404);
    if (room.status !== "waiting") throw new createError("the game is alredy started", 409);
    if (room.players.length >= 2) throw new createError("the room is alredy full", 409);
    room.players.push({ socketId, name: playerName.trim(), color: "black" });
    socketToRoom.set(socketId, room.id);
    return room;
}


export function leaveRoom(socketId) {
    const roomId = socketToRoom.get(socketId);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    const players = room.players;
    players.forEach((player) => socketToRoom.delete(player.socketId));
    rooms.delete(roomId);
    return room;
}


export function getRoomBySocketId(socketId) {
    const roomId = socketToRoom.get(socketId);
    return roomId ? rooms.get(roomId) : null
}