const express = require("express");
const cors = require('cors');
const app = express();
const errormiddleware  = require("./middleware/error") ;


// handling uncaught exception

process.on("uncaughtException",(err)=>{
    console.log(`error: ${err.message}`);
    console.log(`shutting down the server due to unhandled promise rejection`);
    process.exit(1);
})

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const cookieParser = require("cookie-parser");
// app.use(cors());
app.use(cookieParser());
app.use (errormiddleware);


const dbconnect = require("./config/database");
dbconnect();




// this is kind of a middleware which is used in the place of body-parsar, which is used to fetch data ..
app.use(express.json());



// --------------------------------------------------------------------------------------------------------------


// space for writting the router and also the middlewares
const info = require("./routers/product");
const userinfo = require("./routers/user");

const userorder = require("./routers/orderRoute")

app.use("/api/v1",info);
app.use("/api/v1",userinfo);
app.use("/api/v1" ,userorder )


app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Yeah baby ,this is port no ->  3000");
});

// unhandled promises rejection -> just like we had some kind a mistake in  the mongodb server
process.on("unhandledRejection", (err)=>{
    console.log(`error :${err.message}`);
    console.log(`shutting down the server due to unhandled  promise rejection`);
    
    server.close(()=>{
        Promise.exit(1);
    });
});
