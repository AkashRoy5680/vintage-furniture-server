const express = require('express');
const cors = require('cors');
require("dotenv").config();
const port=process.env.PORT ||5000;
const app=express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware

app.use(cors());
app.use(express.json());

//Database Connection


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qgkfq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const productCollection=client.db("appliance").collection("furniture");
      console.log("DB Connected")

      app.get("/product",async(req,res)=>{
        const query = {};
        const cursor=productCollection.find(query);
        const products=await cursor.toArray();
        res.send(products);
      });


      //POST method to add new user and send it to server

      app.post("/product",async(req,res)=>{
        const newItem=req.body;
        const result=await productCollection.insertOne(newItem);
        res.send(result); 
      });

      //DELETE a data from server

      app.delete("/product/:id",async(req,res)=>{
        const id=req.params.id;
        //console.log(req.params)
        const query={_id:ObjectId(id)};
        const result=await productCollection.deleteOne(query);
        res.send(result);
      })
      
    } finally {
      //await client.close();
    }
  }
  run().catch(console.dir);

//Connection Checking
app.get("/",(req,res)=>{
    res.send("Furniture Management Server Running");
});

app.listen(port,()=>{
    console.log("Listening from port",port);
})
