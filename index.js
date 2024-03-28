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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.len0asq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
// mongodb+srv://mdbinshahed5:<password>@cluster0.len0asq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

async function run () {
  try {
    await client.connect()
    const database = client.db('drone-fleet')
    const productCollection = database.collection('product-collection')
    const orderCollection = database.collection('order-collection')
    const reviewCollection = database.collection('review-collection')
    const usersCollection = database.collection('users-collection')

    // --------------------------
    // Product section
    // --------------------------

    //Add Product From Admin
    app.post('/products', async (req, res) => {
      const product = req.body
      const result = await productCollection.insertOne(product)
      res.json(result)
    })

    //// get Product from db
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({})
      const drones = await cursor.toArray()
      res.send(drones)
    })

    // delete product

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await productCollection.deleteOne(query)
      res.json(result)
    })

    // --------------------------
    // Review section
    // --------------------------

    //Review from customer
    app.post('/review', async (req, res) => {
      const review = req.body
      const result = await reviewCollection.insertOne(review)
      res.json(result)
    })
    // get Review form db
    app.get('/review', async (req, res) => {
      const cursor = reviewCollection.find({})
      const review = await cursor.toArray()
      res.send(review)
    })

    // --------------------------
    // Order section
    // --------------------------

    //order from customer
    app.post('/orders', async (req, res) => {
      const orders = req.body
      const result = await orderCollection.insertOne(orders)
      res.json(result)
    })

    // get all orders for admin panel
    app.get('/orders', async (req, res) => {
      let query = {}
      const email = req.query.email
      if (email) {
        query = { email: email }
      }
      const cursor = orderCollection.find(query)
      const orders = await cursor.toArray()
      res.send(orders)
    })

    // change order status
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id
      const updatedStatus = req.body
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          status: updatedStatus.status
        }
      }
      const result = await orderCollection.updateOne(filter, updateDoc, options)

      res.json(result)
    })

    // delete order

    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.json(result)
    })

    // --------------------------
    // User/Admin section
    // --------------------------

    //Create User
    app.post('/users', async (req, res) => {
      const user = req.body
      const result = await usersCollection.insertOne(user)
      console.log('users', result)
      res.json(result)
    })
    // update User
    app.put('/users', async (req, res) => {
      const user = req.body
      const filter = { email: user.email }
      const options = { upsert: true }
      const updateDoc = { $set: user }
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })
    // admin role set
    app.put('/users/admin', async (req, res) => {
      const user = req.body
      const filter = { email: user.email }
      const updateDoc = { $set: { role: user.role } }
      const result = await usersCollection.updateOne(filter, updateDoc)

      res.json(result)
    })

    // get all user
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({})
      const users = await cursor.toArray()
      res.send(users)
    })

    // admin get
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      let isAdmin = false
      if (user?.role === 'admin') {
        isAdmin = true
      }
      res.send({ admin: isAdmin })
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
