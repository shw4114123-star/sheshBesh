import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import "dotenv/config"
import helmet from "helmet"
import { handelSocketEvent } from "./socketHandler.js"


const PORT = process.env.PORT
const app = express()
app.use(helmet())
app.use(express.json())
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})


io.on("connect", (client) => {
    handelSocketEvent(io, client)
    console.log("client connected:", client.id);
})


server.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT} / ws://localhost:${PORT}`);
})