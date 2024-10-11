import express from "express"
import cors from 'cors'

async function server() {
    const hostName = 'localhost'
    const port = 3000

    const app = express()

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