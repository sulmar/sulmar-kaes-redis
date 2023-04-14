const express = require('express')
const axios = require('axios')
// const redis = require('redis')
// const redisClient = redis.createClient()

redisClient.connect()

const port = 3000
const usersApi = 'https://jsonplaceholder.typicode.com/users'

const app = express()

app.get('/users', async (req, res) => {

    // const data = await redisClient.get('users')

    // if (data) {
    //     console.log('z redisa')
    //     res.status(200).send(JSON.parse(data))
    // } else {
        const response = await axios.get(usersApi);
        const users = response.data;

       // await redisClient.set('users', JSON.stringify(users));
        res.status(200).send(users);
    // }
})

app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})