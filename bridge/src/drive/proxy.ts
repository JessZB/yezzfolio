import { Router } from 'express'
import { getDriveClient } from '../auth/oauth'
import db from '../db/metadata'
import { decrypt } from '../auth/encrypt'
import { verifySessionToken } from '../auth/session'

const router = Router()

// /api/file/:fileId/check
router.get('/:fileId/check', verifySessionToken, async (req: any, res: any) => {
  const { fileId } = req.params
  const artistId = req.artistId // Securely from JWT

  try {
    const artist = db
      .prepare('SELECT refresh_token, google_user_id FROM artists WHERE id = ?')
      .get(artistId) as any
    if (!artist) return res.status(404).send('Artist not found')

    const drive = getDriveClient({
      refresh_token: decrypt(artist.refresh_token),
    })

    // 1. Fetch metadata with ownership
    const fileRes = await drive.files.get({
      fileId,
      fields: 'id, name, owners, capabilities, permissions',
      supportsAllDrives: true,
    })
    const file = fileRes.data

    // 2. Strict Ownership Check
    const isOwner = file.owners?.some(
      (o) => o.permissionId === artist.google_user_id,
    )

    if (!isOwner) {
      // check for direct permission (not 'anyone')
      const hasDirectAccess = file.permissions?.some(
        (p) => p.type === 'user' && p.role !== 'anyone',
      )
      if (!hasDirectAccess) {
        return res
          .status(403)
          .json({ error: 'Not owners: File belongs to another account.' })
      }
    }

    // 3. functional check
    if (!file.capabilities?.canDownload) {
      return res
        .status(403)
        .json({ error: 'File cannot be downloaded/proxied' })
    }

    res.json({
      ok: true,
      name: file.name,
      owner: file.owners?.[0]?.displayName,
    })
  } catch (error) {
    res.status(404).json({ error: 'File not found or no access' })
  }
})

// /api/file/:fileId?artistId=temp_artist_id
router.get('/:fileId', async (req: any, res: any) => {
  const { fileId } = req.params
  const { artistId } = req.query

  if (!artistId) return res.status(400).send('Missing artistId in query')

  try {
    // 1. Fetch artist's refresh token from DB
    const stmt = db.prepare('SELECT refresh_token FROM artists WHERE id = ?')
    const artist = stmt.get(artistId) as { refresh_token: string } | undefined

    if (!artist || !artist.refresh_token) {
      return res.status(404).send('Artist not found or unauthenticated')
    }

    const refreshToken = decrypt(artist.refresh_token)
    // Note: getDriveClient needs a populated tokens object. We construct it minimizing to refresh_token.
    const drive = getDriveClient({ refresh_token: refreshToken })

    // 2. Fetch file metadata for Content-Type
    const metaRes = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name',
      supportsAllDrives: true,
    })

    const mimeType = metaRes.data.mimeType || 'application/octet-stream'
    res.setHeader('Content-Type', mimeType)

    // Add aggressive caching since portfolio assets rarely change ID
    res.setHeader('Cache-Control', 'public, max-age=31536000')

    // 3. Stream the file
    const fileRes = await drive.files.get(
      { fileId: fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' },
    )

    fileRes.data
      .on('end', () => {})
      .on('error', (err: any) => {
        console.error('Drive stream error:', err)
        if (!res.headersSent)
          res.status(500).send('Error reading file from Drive')
      })
      .pipe(res)
  } catch (error: any) {
    console.error('Proxy Error:', error.message)
    if (!res.headersSent) res.status(500).send('Proxy error')
  }
})

export default router
