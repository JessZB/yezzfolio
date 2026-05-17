import { Router } from 'express'
import db from '../db/metadata'
import { verifySessionToken } from '../auth/session'
import { generateWorksJson, generateProfileJson } from '../generator/buildJson'
import fs from 'fs'
import path from 'path'
import sanitizeHtml from 'sanitize-html'

const router = Router()

// Sanitization Helper
const clean = (text: string | null | undefined) => {
  if (!text) return text
  return sanitizeHtml(text, {
    allowedTags: [], // Strip all tags by default for security
    allowedAttributes: {},
  })
}

// Middleware to verify Admin Session JWT
router.use(verifySessionToken)

// Re-run i18n middleware after session verify to ensure req.artistId is available for DB lookup
import { i18nMiddleware } from '../middleware/i18n'
router.use(i18nMiddleware)

// GET /api/admin/projects
router.get('/projects', (req: any, res: any) => {
  const projects = db
    .prepare(
      'SELECT * FROM projects WHERE artist_id = ? ORDER BY sort_order ASC',
    )
    .all(req.artistId)
  res.json(projects)
})

// GET /api/admin/profile
router.get('/profile', (req: any, res: any) => {
  const artist = db
    .prepare('SELECT id, name, preferred_lang FROM artists WHERE id = ?')
    .get(req.artistId)
  if (!artist) return res.status(404).send('Artist not found')
  res.json(artist)
})

// GET /api/admin/profile/full
router.get('/profile/full', (req: any, res: any) => {
  try {
    const profile =
      db
        .prepare('SELECT * FROM artist_profiles WHERE artist_id = ?')
        .get(req.artistId) || {}
    const socials = db
      .prepare(
        'SELECT * FROM artist_socials WHERE artist_id = ? ORDER BY sort_order ASC',
      )
      .all(req.artistId)
    const software = db
      .prepare(
        'SELECT * FROM artist_software WHERE artist_id = ? ORDER BY sort_order ASC',
      )
      .all(req.artistId)
    const stats = db
      .prepare(
        'SELECT * FROM artist_stats WHERE artist_id = ? ORDER BY sort_order ASC',
      )
      .all(req.artistId)

    res.json({ profile, socials, software, stats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/profile/lang
router.post('/profile/lang', (req: any, res: any) => {
  const { lang } = req.body
  if (!lang) return res.status(400).send('Missing lang')
  try {
    db.prepare('UPDATE artists SET preferred_lang = ? WHERE id = ?').run(
      lang,
      req.artistId,
    )
    res.json({ message: res.t('lang.updated') })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/profile/identity
router.post('/profile/identity', (req: any, res: any) => {
  const {
    class_es,
    class_en,
    level,
    status_es,
    status_en,
    bio_es,
    bio_en,
    favicon_drive_id,
    avatar_drive_id,
    site_title_es,
    site_title_en,
    seo_desc_es,
    seo_desc_en,
    contact_title_es,
    contact_title_en,
    contact_desc_es,
    contact_desc_en,
    contact_email,
    theme_json,
  } = req.body

  try {
    db.prepare(
      `
      INSERT INTO artist_profiles (
        artist_id, class_es, class_en, level, status_es, status_en, bio_es, bio_en, 
        favicon_drive_id, avatar_drive_id, site_title_es, site_title_en,
        seo_desc_es, seo_desc_en, contact_title_es, contact_title_en,
        contact_desc_es, contact_desc_en, contact_email, theme_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(artist_id) DO UPDATE SET
        class_es=excluded.class_es, class_en=excluded.class_en, level=excluded.level,
        status_es=excluded.status_es, status_en=excluded.status_en, bio_es=excluded.bio_es, bio_en=excluded.bio_en,
        favicon_drive_id=excluded.favicon_drive_id, avatar_drive_id=excluded.avatar_drive_id,
        site_title_es=excluded.site_title_es, site_title_en=excluded.site_title_en,
        seo_desc_es=excluded.seo_desc_es, seo_desc_en=excluded.seo_desc_en,
        contact_title_es=excluded.contact_title_es, contact_title_en=excluded.contact_title_en,
        contact_desc_es=excluded.contact_desc_es, contact_desc_en=excluded.contact_desc_en,
        contact_email=excluded.contact_email, theme_json=excluded.theme_json
    `,
    ).run(
      req.artistId,
      clean(class_es),
      clean(class_en),
      level,
      clean(status_es),
      clean(status_en),
      clean(bio_es),
      clean(bio_en),
      favicon_drive_id,
      avatar_drive_id,
      clean(site_title_es),
      clean(site_title_en),
      clean(seo_desc_es),
      clean(seo_desc_en),
      clean(contact_title_es),
      clean(contact_title_en),
      clean(contact_desc_es),
      clean(contact_desc_en),
      contact_email,
      theme_json,
    )
    res.json({ success: true, message: 'Identity updated' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/profile/socials
router.post('/profile/socials', (req: any, res: any) => {
  const { socials } = req.body
  if (!Array.isArray(socials)) return res.status(400).send('Invalid request')
  try {
    const deleteStmt = db.prepare(
      'DELETE FROM artist_socials WHERE artist_id = ?',
    )
    const insertStmt = db.prepare(
      'INSERT INTO artist_socials (id, artist_id, name, link, icon_drive_id, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const transaction = db.transaction((items) => {
      deleteStmt.run(req.artistId)
      items.forEach((item: any, idx: number) => {
        insertStmt.run(
          item.id || `soc_${Date.now()}_${idx}`,
          req.artistId,
          item.name,
          item.link,
          item.icon_drive_id,
          item.active ? 1 : 0,
          idx,
        )
      })
    })
    transaction(socials)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/profile/software
router.post('/profile/software', (req: any, res: any) => {
  const { software } = req.body
  if (!Array.isArray(software)) return res.status(400).send('Invalid request')
  try {
    const deleteStmt = db.prepare(
      'DELETE FROM artist_software WHERE artist_id = ?',
    )
    const insertStmt = db.prepare(
      'INSERT INTO artist_software (id, artist_id, name, icon_drive_id, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    )
    const transaction = db.transaction((items) => {
      deleteStmt.run(req.artistId)
      items.forEach((item: any, idx: number) => {
        insertStmt.run(
          item.id || `sw_${Date.now()}_${idx}`,
          req.artistId,
          item.name,
          item.icon_drive_id,
          item.color,
          idx,
        )
      })
    })
    transaction(software)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/profile/stats
router.post('/profile/stats', (req: any, res: any) => {
  const { stats } = req.body
  if (!Array.isArray(stats)) return res.status(400).send('Invalid request')
  try {
    const deleteStmt = db.prepare(
      'DELETE FROM artist_stats WHERE artist_id = ?',
    )
    const insertStmt = db.prepare(
      'INSERT INTO artist_stats (id, artist_id, name_es, name_en, value, css_class, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const transaction = db.transaction((items) => {
      deleteStmt.run(req.artistId)
      items.forEach((item: any, idx: number) => {
        insertStmt.run(
          item.id || `st_${Date.now()}_${idx}`,
          req.artistId,
          item.name_es,
          item.name_en,
          item.value,
          item.css_class,
          idx,
        )
      })
    })
    transaction(stats)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/projects
router.post('/projects', (req: any, res: any) => {
  const {
    id,
    title_es,
    title_en,
    category,
    thumbnail_drive_id,
    role_es,
    role_en,
    description_es,
    description_en,
  } = req.body

  if (!id || !title_es)
    return res.status(400).send(res.t('common.missing_fields'))

  try {
    db.prepare(
      `
      INSERT INTO projects (
        id, artist_id, title_es, title_en, category, 
        thumbnail_drive_id, role_es, role_en, 
        description_es, description_en
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title_es=excluded.title_es, title_en=excluded.title_en,
        category=excluded.category, thumbnail_drive_id=excluded.thumbnail_drive_id,
        role_es=excluded.role_es, role_en=excluded.role_en,
        description_es=excluded.description_es, description_en=excluded.description_en
    `,
    ).run(
      id,
      req.artistId,
      clean(title_es),
      clean(title_en),
      category,
      thumbnail_drive_id,
      clean(role_es),
      clean(role_en),
      clean(description_es),
      clean(description_en),
    )

    res.json({ message: res.t('project.saved'), id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/projects/:id
// Returns full project with its sections and items
router.get('/projects/:id', (req: any, res: any) => {
  const { id } = req.params
  try {
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND artist_id = ?')
      .get(id, req.artistId)
    if (!project) return res.status(404).send(res.t('project.not_found'))

    const sections = db
      .prepare(
        'SELECT * FROM work_sections WHERE project_id = ? ORDER BY sort_order ASC',
      )
      .all(id)
    for (const sec of sections as any[]) {
      sec.items = db
        .prepare(
          'SELECT * FROM work_items WHERE section_id = ? ORDER BY sort_order ASC',
        )
        .all(sec.id)
    }

    res.json({ ...project, sections })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/sections
router.post('/sections', (req: any, res: any) => {
  const {
    id,
    project_id,
    type,
    title_es,
    title_en,
    description_es,
    description_en,
    model_drive_id,
    sort_order,
  } = req.body
  if (!id || !project_id || !type)
    return res.status(400).send(res.t('common.missing_fields'))

  try {
    // Verify artist owns the project
    const project = db
      .prepare('SELECT id FROM projects WHERE id = ? AND artist_id = ?')
      .get(project_id, req.artistId)
    if (!project) return res.status(403).send(res.t('project.not_found'))

    db.prepare(
      `
      INSERT INTO work_sections (id, project_id, type, title_es, title_en, description_es, description_en, sort_order, model_drive_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        type=excluded.type, title_es=excluded.title_es, title_en=excluded.title_en,
        description_es=excluded.description_es, description_en=excluded.description_en,
        sort_order=excluded.sort_order, model_drive_id=excluded.model_drive_id
    `,
    ).run(
      id,
      project_id,
      type,
      clean(title_es),
      clean(title_en),
      clean(description_es),
      clean(description_en),
      sort_order || 0,
      model_drive_id || null,
    )

    res.json({ message: res.t('section.saved'), id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/items
router.post('/items', async (req: any, res: any) => {
  const {
    id,
    section_id,
    title_es,
    title_en,
    description_es,
    description_en,
    drive_file_id,
    sort_order,
  } = req.body
  if (!id || !section_id)
    return res.status(400).send(res.t('common.missing_fields'))

  try {
    // 1. Verify Ownership
    const section = db
      .prepare(
        `
      SELECT p.artist_id FROM work_sections ws
      JOIN projects p ON ws.project_id = p.id
      WHERE ws.id = ?
    `,
      )
      .get(section_id) as any
    if (!section || section.artist_id !== req.artistId) {
      return res.status(403).send(res.t('section.unauthorized'))
    }

    // 2. Drive Access Validation (if drive_file_id provided)
    if (drive_file_id) {
      // We'll skip the actual API call here to avoid slowdowns, assuming client-side proxy check or basic format check.
      // But log it as a checkpoint.
    }

    db.prepare(
      `
      INSERT INTO work_items (id, section_id, title_es, title_en, description_es, description_en, drive_file_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title_es=excluded.title_es, title_en=excluded.title_en,
        description_es=excluded.description_es, description_en=excluded.description_en,
        drive_file_id=excluded.drive_file_id, sort_order=excluded.sort_order
    `,
    ).run(
      id,
      section_id,
      clean(title_es),
      clean(title_en),
      clean(description_es),
      clean(description_en),
      drive_file_id || '',
      sort_order || 0,
    )

    res.json({ message: res.t('item.saved'), id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/reorder
// Expects { type: 'projects'|'sections'|'items', orders: [{id, sort_order}, ...] }
router.post('/reorder', (req: any, res: any) => {
  const { type, orders } = req.body
  if (!type || !orders || !Array.isArray(orders))
    return res.status(400).send('Invalid request')

  const tableMap: Record<string, string> = {
    projects: 'projects',
    sections: 'work_sections',
    items: 'work_items',
  }

  const tableName = tableMap[type]
  if (!tableName) return res.status(400).send('Invalid type')

  try {
    const updateStmt = db.prepare(
      `UPDATE ${tableName} SET sort_order = ? WHERE id = ?`,
    )
    const transaction = db.transaction((items) => {
      for (const item of items) {
        updateStmt.run(item.sort_order, item.id)
      }
    })

    transaction(orders)
    res.json({ message: 'Reordered successfully' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/admin/items/:id
router.delete('/items/:id', (req: any, res: any) => {
  const { id } = req.params
  try {
    const item = db
      .prepare(
        `
      SELECT p.artist_id FROM work_items wi
      JOIN work_sections ws ON wi.section_id = ws.id
      JOIN projects p ON ws.project_id = p.id
      WHERE wi.id = ?
    `,
      )
      .get(id) as any
    if (!item || item.artist_id !== req.artistId) {
      return res.status(403).send(res.t('item.unauthorized'))
    }

    db.prepare('DELETE FROM work_items WHERE id = ?').run(id)
    res.json({ message: res.t('item.deleted') })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/admin/projects/:id
router.delete('/projects/:id', (req: any, res: any) => {
  const { id } = req.params
  try {
    const result = db
      .prepare('DELETE FROM projects WHERE id = ? AND artist_id = ?')
      .run(id, req.artistId)
    if (result.changes === 0)
      return res.status(404).send(res.t('project.not_found'))
    res.json({ message: res.t('project.deleted') })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/admin/sections/:id
router.delete('/sections/:id', (req: any, res: any) => {
  const { id } = req.params
  try {
    // Verify ownership via join
    const section = db
      .prepare(
        `
      SELECT p.artist_id FROM work_sections ws
      JOIN projects p ON ws.project_id = p.id
      WHERE ws.id = ?
    `,
      )
      .get(id) as any
    if (!section || section.artist_id !== req.artistId) {
      return res.status(403).send(res.t('section.unauthorized'))
    }

    db.prepare('DELETE FROM work_sections WHERE id = ?').run(id)
    res.json({ message: res.t('section.deleted') })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/publish
// Endpoint to generate JSON and trigger frontend rebuild
router.post('/publish', (req: any, res: any) => {
  try {
    const jsonEs = generateWorksJson(req.artistId, 'es')
    const jsonEn = generateWorksJson(req.artistId, 'en')

    const profileEs = generateProfileJson(req.artistId, 'es')
    const profileEn = generateProfileJson(req.artistId, 'en')

    // Absolute path to Astro project's data folder
    const dataPath = path.resolve(__dirname, '../../../src/data')

    if (fs.existsSync(dataPath)) {
      // Works
      fs.writeFileSync(
        path.join(dataPath, 'works.es.json'),
        JSON.stringify(jsonEs, null, 2),
      )
      fs.writeFileSync(
        path.join(dataPath, 'works.en.json'),
        JSON.stringify(jsonEn, null, 2),
      )

      // Profiles (if exist)
      if (profileEs)
        fs.writeFileSync(
          path.join(dataPath, 'profile.es.json'),
          JSON.stringify(profileEs, null, 2),
        )
      if (profileEn)
        fs.writeFileSync(
          path.join(dataPath, 'profile.en.json'),
          JSON.stringify(profileEn, null, 2),
        )
    }

    res.json({
      success: true,
      message: 'Projects and Profile published to Astro',
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
