import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import "dotenv/config"
import helmet from "helmet"

const PORT = process.env.PORT
const app = express()
app.use(helmet())
app.use(express.json())
const server = createServer()





server.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT} / ws://localhost:${PORT}`);
    
})