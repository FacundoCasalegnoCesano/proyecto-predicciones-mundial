import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { swaggerSpec, swaggerUi } from './config/swagger.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none }' }))

app.use('/api', router)

app.use(errorHandler)

export default app
