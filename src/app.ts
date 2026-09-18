import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { requestLogger } from './middleware/requestLogger.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  // Security & core middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Static file access for locally-stored uploads (dev only; Cloudinary in prod)
  app.use('/uploads', express.static('uploads'));

  // API Documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Versioned API routes
  app.use(env.API_PREFIX, routes);

  // Root
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Campus Connect API is running',
      docs: '/docs',
      apiPrefix: env.API_PREFIX,
      timestamp: new Date().toISOString(),
    });
  });

  // 404 + global error handling (must be last)
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
