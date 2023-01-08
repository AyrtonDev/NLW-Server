import express from 'express';
import dotenv from 'dotenv';
const port = 3333;
dotenv.config();
const app = express();
app.get('/ads', (req, res) => {
    return res.json([
        { id: 1, message: 'Anúncio 1' },
        { id: 2, message: 'Anúncio 2' },
        { id: 3, message: 'Anúncio 3' },
    ]);
});
app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});
