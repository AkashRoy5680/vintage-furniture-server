const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');

//middleware

app.use(cors());
app.use(express.json());

function verifyJwt(req,res,next){
  const authHeader=req.headers.authorization;
  console.log(authHeader);
  if(!authHeader){
    return res.status(401).send({message:"unauthorized access"})
  };
  const token=authHeader.split(" ")[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(403).send({message:"forbidden access"});
    }
    console.log("decoded",decoded);
    req.decoded=decoded;
    next();
  })
  
}

//Database Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qgkfq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("appliance").collection("furniture");
    console.log("DB Connected");

    //AUTH

    app.post("/login",(req,res)=>{
      const user=req.body;
      const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"60d"
      });
      res.send({accessToken});
    })

   //Load specific items filtering email
    app.get("/items",verifyJwt, async (req, res) => {
      const decodedEmail=req.decoded.email;
      const email=req.query.email;
      console.log(email);
      if(email===decodedEmail){
      const query = {email};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
      }
      else{
        res.status(403).send({message:"forbidden access"});
      }
    });
//Load All Products
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });


    //Load Single Product

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });


    //POST method to add new user and send it to server

    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      const result = await productCollection.insertOne(newItem);
      res.send(result);
    });

     //update product quantity
/*
     app.put("/inventory/:id",async(req,res)=>{
      const id=req.params.id;
      const updatedQuantity=req.body;
      const filter={_id:ObjectId(id)}
      const options={upsert:true}
      const updatedDoc={
          $set:{
              //quantity:updatedQuantity.product
              updatedQuantity
          }
      };
      const result=await productCollection.updateOne(filter,updatedDoc,options);
      res.send(result);
  })*/

  //update Quantity

  app.put("/restock/:id",async(req,res)=>{
    const id=req.params.id;
    const updatedQuantity=req.body;
    console.log(updatedQuantity)
    const filter={_id:ObjectId(id)}
    const options={upsert:true}
    const updatedDoc={
        $set:{
            quantity:updatedQuantity.quantity
        }
    };
    const result=await productCollection.updateOne(filter,updatedDoc,options);
    res.send(result);
})

// delivered decrease update 

app.put("/deliver",async(req,res)=>{
  const id=req.params.id;
  const updatedQuantity=req.body;
  console.log(updatedQuantity)
  const filter={_id:ObjectId(id)}
  const options={upsert:true}
  const updatedDoc={
      $set:{
          quantity:updatedQuantity.quantity
      }
  };
  const result=await productCollection.updateOne(filter,updatedDoc,options);
  res.send(result);
})



    //DELETE a data from server

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      console.log(req.params);
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

//Delete from myitems
  app.delete("/myitems/:id", async (req, res) => {
  const id = req.params.id;
  console.log(req.params);
  const query = { _id: ObjectId(id) };
  const result = await productCollection.deleteOne(query);
  res.send(result);
});


  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

//Connection Checking
app.get("/", (req, res) => {
  res.send("Furniture Management Server Running");
});

app.listen(port, () => {
  console.log("Listening from port", port);
});
