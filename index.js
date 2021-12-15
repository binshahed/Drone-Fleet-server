const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId

const cors = require('cors')

require('dotenv').config()

const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hoqfp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


async function run () {
  try {
    await client.connect()
    const database = client.db('drone-fleet')
    const productCollection = database.collection('product-collection')


    //// get package from db
    app.get('/products', async (req, res) => {
        const cursor = productCollection.find({})
        const drones = await cursor.toArray()
        res.send(drones)
      })

  } finally {
    // client.close()
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
