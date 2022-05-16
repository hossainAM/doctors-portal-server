const express = require('express');
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
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
        // console.log('db connected')
        const serviceCollection = client.db('doctors_portal').collection('treatment');
        const bookingCollection = client.db('doctors_portal').collection('bookings');
        /**
         * API naming convention
         * app.get('/booking) // get all bookings or more than one or by filter
         * app.get('/booking/:id) // get a specific booking
         * app.post('/booking) // add a new booking
         * app.patch('/booking/:id) // update a specific booking
         * app.put('/booking/:id) // update and insert a specific booking
         * app.delete('/booking/:id) // delete a specific booking
         */

        //get all Services API
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            // console.log(services)
            res.send(services);
        });

        //get all available services API (this is not proper way. learn aggregate => lookup => pipeline => match => group from mongoDB)
        app.get('/available', async (req, res) => {
            const date = req.query.date;

            //1st step- get all services
            const services = await serviceCollection.find().toArray();

            //2nd step- get all the bookings on that day
            const query = {date: date};
            const bookings = await bookingCollection.find(query).toArray();

            //3d step- for each services 
            services.forEach(service => {
                //step-4- find bookings for that service
                const serviceBookings = bookings.filter(book => book.treatment === service.name);
                //step-5- select slots for the booked services
                const bookedSlots = serviceBookings.map(book => book.slot);
                //step-6- select those slots that are not in bookedSlots
                const available = service.slots.filter(slot => !bookedSlots.includes(slot));
                //step-7- set available to slot of service
                service.slots = available;
            })
            res.send(services);
        })

         //post a new booking API
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = {treatment: booking.treatment, date:booking.date, patient: booking.patientName}// limit one booking/user/treatment/day
            const exists = await bookingCollection.findOne(query);
            if(exists) {
                return res.send({success: false, booking: exists})
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({success: true, result})
        })
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