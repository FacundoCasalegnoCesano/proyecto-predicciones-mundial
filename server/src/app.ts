import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import router from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { swaggerSpec, swaggerUi } from './config/swagger.js'
import { env } from './config/env.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.FRONTEND_URLS, credentials: true }))
app.use(express.json())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none }' }))

app.use('/api', router)

app.use(errorHandler)

export default app
