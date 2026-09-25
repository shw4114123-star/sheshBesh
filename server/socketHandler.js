import { createRoom, joinRoom, leaveRoom } from "./roomManager.js"


function handleCreateRoom(socket, { name }, callback) {
    try {
        const room = createRoom(socket.id, name);
        socket.join(room.id);
        if (callback) {
            callback({ success: true, room: room, yourColor: "white" });
        };
    } catch (error) {
        if (callback) {
            callback({ success: false, error: { message: error.message } });
        };
    }
}

function handleJoinRoom(io, socket, { roomCode, name }, callback) {
    try {
        const room = joinRoom(socket.id, roomCode, name)
        socket.join(room.id)
        if (callback) {
            callback({ success: true, room: room, yourColor: "black" });
        }
        io.to(room.id).emit("room:state", room)
    } catch (error) {
        if (callback) {
            callback({ success: false, error: { message: error.message } });
        };
    }
}

export function handleLeaveRoom(io, socket, reason, callback = null) {
    try {
        const room = leaveRoom(socket.id)
        if (room) {
            io.to(room.id).emit("room:closed", { reason });
            io.socketsLeave(room.id)
        }
        if (callback) {
            callback({ success: true })
        }
    } catch (error) {
        callback({ success: false, error: { message: error.message } })
    }
}

export function handelSocketEvent(io, socket) {
    socket.on("room:create", (data, callback) => handleCreateRoom(socket, data, callback));
    socket.on("room:join", (data, callback) => handleJoinRoom(io, socket, data, callback));
    socket.on("room:leave", (callback) => handleLeaveRoom(io, socket, "player_left", callback))
    socket.on("disconnect", () => handleLeaveRoom(io, socket, "player_disconnected"))
}