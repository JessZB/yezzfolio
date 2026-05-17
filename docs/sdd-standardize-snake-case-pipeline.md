# Specification: Standardize to snake_case

## Goal
Migrate the `yezzfolio` project from mixed `camelCase` to strict `snake_case` naming across DB, API, and Frontend.

## Field Mapping Table

| Model | Old Name (camelCase) | New Name (snake_case) |
| :--- | :--- | :--- |
| **User** | googleId | google_id |
| | googleUserId | google_user_id |
| | refreshToken | refresh_token |
| | preferredLang | preferred_lang |
| | driveRootFolderId | drive_root_folder_id |
| | createdAt | created_at |
| | updatedAt | updated_at |
| **Project** | userId | user_id |
| | isPublished | is_published |
| | thumbnailDriveId | thumbnail_drive_id |
| | roleEs | role_es |
| | roleEn | role_en |
| **Section** | projectId | project_id |
| | layoutType | layout_type |
| | titleEs | title_es |
| | titleEn | title_en |
| | descriptionEs | description_es |
| | descriptionEn | description_en |
| | modelDriveId | model_drive_id |
| **Asset** | sectionId | section_id |
| | driveId | drive_id |
| | titleEs | title_es |
| | titleEn | title_en |
| | descriptionEs | description_es |
| | descriptionEn | description_en |
| | config3d | config_3d |
| **Profile** | userId | user_id |
| | classEs | class_es |
| | classEn | class_en |
| | statusEs | status_es |
| | statusEn | status_en |
| | bioEs | bio_es |
| | bioEn | bio_en |
| | faviconDriveId | favicon_drive_id |
| | avatarDriveId | avatar_drive_id |
| | siteTitleEs | site_title_es |
| | siteTitleEn | site_title_en |
| | seoDescEs | seo_desc_es |
| | seoDescEn | seo_desc_en |
| | contactTitleEs | contact_title_es |
| | contactTitleEn | contact_title_en |
| | contactDescEs | contact_desc_es |
| | contactDescEn | contact_desc_en |
| | contactEmail | contact_email |
| | themeJson | theme_json |
| **Social** | userId | user_id |
| | iconDriveId | icon_drive_id |
| **Software** | userId | user_id |
| | iconDriveId | icon_drive_id |
| **Stat** | userId | user_id |
| | nameEs | name_es |
| | nameEn | name_en |
| | cssClass | css_class |

## Migration Strategy
1.  **Schema Update**: Modify `prisma/schema.prisma` to use the new `snake_case` field names.
2.  **Database Migration**: Run `npx prisma migrate dev --name rename_to_snake_case` to apply changes to the DB.
3.  **Codebase Refactor**:
    - Update all Zod schemas in `src/schemas/` to use snake_case keys.
    - Update all backend services (`src/modules/**/*.service.ts`) to use the new field names.
    - Update frontend components (`src/components/`, `src/app/`) to align with new API contract.

## Verification Checklist (Definition of Done)
1.  [ ] **DB Schema**: Verified via DB explorer that all columns match the `snake_case` convention.
2.  [ ] **Type Safety**: All TypeScript compilation errors fixed (no `camelCase` remaining in `PrismaClient` usage).
3.  **Functional Scenarios**:
    - [ ] **Project Creation**: Successfully created in `ProjectModal` and stored with snake_case.
    - [ ] **Project Update**: Successfully updated without missing field errors.
    - [ ] **Profile Update**: Identity, socials, software, and stats update work seamlessly.
    - [ ] **Data Integrity**: Verified existing records are accessible/editable post-migration.
