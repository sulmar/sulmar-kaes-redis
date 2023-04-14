// npm install express
// npm install axios
// npm install redis

const express = require('express')
const axios = require('axios')
const redis = require('redis');
const client = redis.createClient();

const PORT = 3000
const USERS_API = "https://jsonplaceholder.typicode.com/users"
const ALBUMS_API = "https://jsonplaceholder.typicode.com/albums"

const app = express();

client.connect();

const myLogger = function(req, res, next)  {
    console.log(req.path);
    next();
    console.log(res.statusCode);
    console.log(res.json);
}

const cache = async function(req, res, next ) {
    const key = req.path;

    console.log(`cache ${key}`)

    const data = await client.get(key);

    if (data)
    {
        res.status(200).send(JSON.parse(data));
    }
    else {

        console.log(`before next ${key}`);
        await next();
        console.log(`after next ${key}`);

        console.log(res.data);

        await client.setEx(key, 120, res.data);         
    }
}

app.use(myLogger);
// app.use(cache);

app.get("/albums", async (req, res) => 
{
    const response = await axios.get(ALBUMS_API);
    const albums = response.data;
    res.status(200).send(albums);
})

app.get("/users", async (req, res) => 
{    
    const pingResult =  await client.ping();
    console.log(pingResult);

    // GET
     const data = await client.get("users");
     console.log(data);

    if (data) {
        console.log("Hit!")
        res.status(200).send(JSON.parse(data));
    }
    else 
    {        
        const response = await axios.get(USERS_API);
        const users = response.data;

        // SET
        // await client.set("users", JSON.stringify(users));

        // SET EX
        await client.setEx("users", 120, JSON.stringify(users));
        res.status(200).send(users);
    }
    
});

app.get("/users/:userId", async (req, res) => {

    const userId = req.params.userId;

    console.log(userId);

    const userKey = `users:${userId}`;

    console.log(userKey);

    const data = await client.get(userKey);

    if (data)
    {
        res.status(200).send(JSON.parse(data));
    }
    else 
    {
        const response = await axios.get(`${USERS_API}/${userId}`);
        const user = response.data;

        await client.setEx(userKey, 60, JSON.stringify(user));
        res.status(200).send(user);
    }

})

app.listen(PORT, () => { console.log(`Server started at port ${PORT}`)})


