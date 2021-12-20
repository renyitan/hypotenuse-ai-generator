import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.json({ message: 'from index api' });
});

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
