import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));
app.listen(process.env.PORT || 3000, () => console.log('Control room running'));
