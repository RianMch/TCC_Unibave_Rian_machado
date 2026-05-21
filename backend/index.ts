import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");
import bodyParser = require("body-parser");
import dotenv = require("dotenv");
dotenv.config();


const app =express();
const port=process.env.PORT||3000;

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));

app.use(express.json());
app.use(cookieParser());
app.get('/api/status',(req,res)=>{
    res.json({
        status:'ok',
        mensagem:'servidor rodando'
    });
});

app.listen(port,()=>{
    console.log(`servidor rodando na porta ${port}`);
});