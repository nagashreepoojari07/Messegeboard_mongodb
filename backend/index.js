const express = require("express");
const bodyParser=require("body-parser");
const cors = require("cors"); //allows the server to accept request from any address
// const { MongoClient } = require('mongodb');

const mongoose = require('mongoose');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017/messegeboard'
// const client = new MongoClient(url)
// const dbName = ''
// let db;
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!")
});
// app.use(bodyParser.text());
app.use(bodyParser.json())
app.use(cors());


// mongoose.connect(url);
// async function main() {
//     // Use connect method to connect to the server
//     await client.connect()
//     console.log('Connected successfully to server')
//     db = client.db(dbName)
    
  
//     // the following code examples can be pasted here...
//     return 'done.'
//   }
  
//   main()
//     .then(console.log)
//     .catch(console.error)


const MessegeSchema = new mongoose.Schema({
    userName:String,
    msg: String
  });
const Messege = mongoose.model('Messege', MessegeSchema);

const UserSchema = new mongoose.Schema({
    name:String,
    messeges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Messege' }]
  });


const User = mongoose.model('User', UserSchema);

app.get("/", (req, res) =>
    res.send("hello")
);


app.post("/api/messege",async(req,res)=>{
    // const messege=req.body
    const messege = new Messege(req.body)
    messege.save();
    // db.collection('messeges').insertOne(messege);

    let user= await User.findOne({name: messege.userName});
    if(!user){
      user = new User({name: messege.userName});
    }
    user.messeges.push(messege);
    user.save();
    res.status(200).send();
})


app.get("/api/messege", async(req,res)=>{
    const docs=await Messege.find();
    if(!docs) return res.json({error: "error getting messeges"});
    res.json(docs);
})

app.get("/api/user/:name", async(req,res)=>{
  const name=req.params.name
  const docs=await User.findOne({name}).populate('messeges');
  if(!docs) return res.json({error: "error getting messeges"});
  res.json(docs);
  // return res.json(await User.findOne({name}))
})



app.listen(port, () => console.log('app running on port', port));
