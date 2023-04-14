// npm install express
// npm install redis
// npm install multer
// npm install fs

const express = require('express')
const redis = require('redis');
const multer = require("multer");

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const client = redis.createClient();

const PORT = 3000

const app = express();

client.connect();

app.post("/files", upload.single('file'), async (req, res) =>
{
    const file = req.file;     
        
    console.log(file);

    await client.set(`file:${file.originalname}`, file.buffer.toString("base64"));

    res.status(200).send();
})

app.get("/files/:filename", async (req, res) => 
{
    const data = await client.get(`file:${req.params.filename}`);

    const buffer = Buffer.from(data, "base64");

    res.setHeader("Content-Type", "application/pdf");

    res.status(200).send(buffer);
})


app.listen(PORT, () => { console.log(`Server started at port ${PORT}`)})