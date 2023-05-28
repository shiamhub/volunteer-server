const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.np7fjqr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    const volunteerCollection = client.db('volunterDB').collection('volunter');
    const volunteerAddCollection = client.db('volunterDB').collection('volunterAdd');

    const indexKeys = { title: 1 }; 
    const indexOptions = { name: "title" };

    // const result = await volunteerCollection.createIndex(indexKeys, indexOptions);

    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.DB_AUCCESS_TOKEN, { expiresIn: "1h" });
      // console.log(token);
      res.send({token});
    })


    app.get('/volunteers', async (req, res) => {
        const result = await volunteerCollection.find({}).toArray();
        res.send(result);
    })
    app.get('/volunteers/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await volunteerCollection.findOne(query);
        res.send(result);
    })

    app.post('/volunteersAdd', async (req, res) => {
      const add = req.body;
      const result = await volunteerAddCollection.insertOne(add);
      res.send(result);
    })

    app.get('/volunteersAdd', async (req, res) => {
      const result = await volunteerAddCollection.find({}).toArray();
      res.send(result);
    })

    app.get("/volunteer/:text", async (req, res) => {
      const text = req.params.text;
      console.log(text, 'hello');
      const result = await volunteerCollection
        .find({
          $or: [
            { title: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });
    
    app.delete('/volunteersAdd/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerAddCollection.deleteOne(query);
      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})