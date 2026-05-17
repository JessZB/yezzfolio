import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { initDb } from './db/metadata'
import db from './db/metadata'
import { getAuthUrl, getTokens, getDriveClient } from './auth/oauth'
import * as encrypt from './auth/encrypt'
import { createSessionToken } from './auth/session'
import { rateLimit } from 'express-rate-limit'
import proxyRouter from './drive/proxy'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Adjusted for typical CMS usage
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
})
app.use('/api/', limiter)

// Security & CORS Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
)

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:4321', 'http://localhost:5173']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)
app.use(express.json())

// i18n Middleware (Must be after verifySessionToken in routes that need DB lookup,
// but we'll put it here and it will handle headers if req.artistId isn't set yet)
import { i18nMiddleware } from './middleware/i18n'
app.use(i18nMiddleware)

// Init DB
initDb()

// Routes
import adminRouter from './routes/admin'
app.use('/api/admin', adminRouter)
app.use('/api/file', proxyRouter)

app.get('/api/test-drive', async (req: any, res: any) => {
  const { artistId } = req.query
  if (!artistId) return res.status(400).send('Missing artistId in query')
  try {
    const artist = db
      .prepare('SELECT refresh_token FROM artists WHERE id = ?')
      .get(artistId) as any
    if (!artist) return res.status(404).send('Artist not found')
    const token = encrypt.decrypt(artist.refresh_token)
    const drive = getDriveClient({ refresh_token: token })
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
    })

    let html = '<h2>Archivos que el Bridge puede ver:</h2><ul>'
    for (const f of response.data.files || []) {
      const safeName = (f.name || '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      html += `<li><b>${safeName}</b> (ID: <code>${f.id}</code>) <br/> <a href="/api/file/${f.id}?artistId=${artistId}" target="_blank">Probar Proxy con este archivo</a></li>`
    }
    html += '</ul>'
    res.send(html)
  } catch (err: any) {
    console.error('Test Drive Error:', err)
    res.status(500).send('Error Drive API. Ver logs del servidor.')
  }
})

app.get('/', (req: any, res: any) => {
  res.send('Transer OS Bridge API is running.')
})

// Auth Routes
app.get('/api/auth/login', (req: any, res: any) => {
  res.redirect(getAuthUrl())
})

app.get('/api/auth/callback', async (req: any, res: any) => {
  const { code, error } = req.query
  const adminUiUrl = process.env.ADMIN_UI_URL || 'http://localhost:5173/login'

  // 1. Handle user cancellation or Google errors
  if (error) {
    console.warn('Google OAuth Error:', error)
    return res.redirect(`${adminUiUrl}?error=${error}`)
  }

  // 2. Missing authorization code
  if (!code) {
    return res.redirect(`${adminUiUrl}?error=no_code_provided`)
  }

  try {
    const tokens = await getTokens(code as string)

    // 3. Essential for CMS: We need a refresh token to manage files later
    if (!tokens.refresh_token) {
      console.error('No refresh token returned')
      return res.redirect(`${adminUiUrl}?error=missing_refresh_token`)
    }

    // Attempt to get user info from Google OAuth
    const driveClient = getDriveClient(tokens)
    const userInfo = await driveClient.about.get({ fields: 'user' })

    const email = userInfo.data.user?.emailAddress || 'unknown'
    const name = userInfo.data.user?.displayName || 'Unknown Artist'
    const googleUserId = userInfo.data.user?.permissionId || email

    const artistId = googleUserId
    const encryptedRefresh = encrypt.encrypt(tokens.refresh_token)

    const checkStmt = db.prepare(
      'SELECT id FROM artists WHERE google_user_id = ?',
    )
    const existing = checkStmt.get(googleUserId)

    if (existing) {
      db.prepare(
        'UPDATE artists SET refresh_token = ? WHERE google_user_id = ?',
      ).run(encryptedRefresh, googleUserId)
    } else {
      db.prepare(
        'INSERT INTO artists (id, name, google_user_id, refresh_token) VALUES (?, ?, ?, ?)',
      ).run(artistId, name, googleUserId, encryptedRefresh)
    }

    const sessionToken = createSessionToken(artistId)

    // 4. Success: Send token and ID to frontend
    res.redirect(`${adminUiUrl}?token=${sessionToken}&artistId=${artistId}`)
  } catch (err: any) {
    console.error('OAuth token exchange error:', err)
    res.redirect(`${adminUiUrl}?error=auth_failed`)
  }
})

// Start server
app.listen(port, () => {
  console.log(`Bridge listening at http://localhost:${port}`)
})

// Trigger nodemon restart
