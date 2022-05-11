const express = require('express');
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion
} = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//Connect with database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yvgfw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try{
        await client.connect();
        console.log('db connected')
    }
    finally{

    }
}

run().catch(console.dir);



//Root API
app.get('/', (req, res) => {
    res.send('Server is running')
})

//Dynamic route
app.listen(port, () => {
    console.log(`Listening to port ${port}`)
});