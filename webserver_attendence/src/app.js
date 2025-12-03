import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/courses.routes.js';
import sessionRoutes from './routes/sessions.routes.js';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 공통 미들웨어
app.use(cors());
app.use(express.json());

// Swagger 문서 로드
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/swagger.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 라우팅
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/sessions', sessionRoutes);

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server running on port', port);
});
