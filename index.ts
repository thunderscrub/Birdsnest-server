import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PilotList, getPilots, checkPilotPersistence } from './pilots';
import cors from 'cors';
import path from 'path';
dotenv.config();

let pilotsList: PilotList = {};

setInterval(async () => {
  pilotsList = { ...pilotsList, ...(await getPilots(pilotsList)) };
  pilotsList = checkPilotPersistence(pilotsList);
}, 2000);

const app: Express = express();
const port = process.env.PORT;
app.use(cors());
app.get('/', (req, res) => {
  res.sendFile;
});
app.get('/getData', (req: Request, res: Response) => {
  res.send(pilotsList);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
