import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { env } from '../config/env.js'

// 1. Create the pool
const pool = new pg.Pool({ connectionString: env.DATABASE_URL })

// 2. Setup the adapter
const adapter = new PrismaPg(pool)

// 3. Instantiate the client with the adapter
const prisma = new PrismaClient({ adapter })

export default prisma
