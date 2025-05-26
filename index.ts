import express, { Express, Request, Response } from "express";


const port = 8080;
const app: Express = express();

app.get("/", (req, res) => {
  res.send("express");
});

app.get("/hi", (req, res) => {
  res.send("Hi, express");
});

app.listen(port, () => {
  console.log(`now listening on http://localhost:${port}`);
});
