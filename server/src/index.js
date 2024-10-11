import express from "express"
import cors from 'cors'
import { Mongo } from "./database/mongo"
import { config } from "dotenv";

async function server() {
    const hostName = 'localhost'
    const port = 3000

    const app = express()

    const mongoConnection = await Mongo.connect({mongoConnectionString: process.env.MONGO_CS, mongoDbName: process.env.MONGO_DB_NAME})

    app.use(express.json())
    app.use(cors())
    
    app.get('/', (req, res) => {
        res.send({
            success: true,
            statusCode: 200,
            body: 'Welcome to Vendly'
        })
    })
    
    app.listen(port, () => {
        console.log(`Server running on: http://${hostName}:${port}`)
    })
}

server()