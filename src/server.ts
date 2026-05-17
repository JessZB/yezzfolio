import 'dotenv/config'
import app from './app.js'
import { env } from './config/env.js'

const PORT = env.PORT

const server = app.listen(PORT, () => {
  console.log(`🚀 Yezzfolio SaaS Backend running on http://localhost:${PORT}`)
})

export default server
