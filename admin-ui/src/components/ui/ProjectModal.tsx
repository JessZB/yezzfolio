import React, { useState, useEffect } from 'react';
import { X, Save, Image, Globe } from 'lucide-react';
import { extract_drive_id } from '../../api/utils';
import { useTranslation } from 'react-i18next';
import './ProjectModal.css';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  project?: any;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: '',
    title_es: '',
    title_en: '',
    category: 'web', // Use technical keys
    thumbnail_drive_id: '',
    role_es: '',
    role_en: '',
    description_es: '',
    description_en: ''
  });

  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      setFormData({
        id: '',
        title_es: '',
        title_en: '',
        category: 'web',
        thumbnail_drive_id: '',
        role_es: '',
        role_en: '',
        description_es: '',
        description_en: ''
      });
    }
  }, [project, isOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-generate slug from title if it doesn't exist
    const slug = formData.id?.length < 20 // If it's a slug and not a UUID
      ? formData.id 
      : formData.title_es.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    onSave({ 
      ...formData, 
      slug: slug || `proj-${Date.now()}`,
      id: formData.id // Keep UUID if it's an edit
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content animate-slide-in">
        <header className="modal-header">
          <div className="title-area">
            <h2>{project ? t('project.edit_title') : t('project.new')}</h2>
            <p>{project ? t('editor.edit_desc') : t('editor.new_desc')}</p>
          </div>
          <button className="close-btn" type="button" onClick={onClose}><X size={20} /></button>
        </header>

        <form className="modal-form" onSubmit={handleFormSubmit}>
          <div className="form-section">
            <h3><Globe size={16} /> {t('project.base_info')}</h3>
            <div className="input-group">
              <label>{t('project.category')}</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="web">{t('project.cats.web')}</option>
                <option value="3d">{t('project.cats.3d')}</option>
                <option value="arch">{t('project.cats.arch')}</option>
                <option value="game">{t('project.cats.game')}</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3><Image size={16} /> {t('project.media')}</h3>
            <div className="input-group">
              <label>{t('project.thumbnail_hint')}</label>
              <input 
                placeholder={t('editor.drive_link')}
                value={formData.thumbnail_drive_id}
                 onChange={e => setFormData({...formData, thumbnail_drive_id: extract_drive_id(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="form-section grid-2">
            <div className="lang-col">
              <h4>{t('editor.langs.es')}</h4>
              <input placeholder={t('project.title')} value={formData.title_es} onChange={e => setFormData({...formData, title_es: e.target.value})} required />
              <input placeholder={t('project.role')} value={formData.role_es} onChange={e => setFormData({...formData, role_es: e.target.value})} />
              <textarea placeholder={t('project.desc')} value={formData.description_es} onChange={e => setFormData({...formData, description_es: e.target.value})} />
            </div>
            <div className="lang-col">
              <h4>{t('editor.langs.en')}</h4>
              <input placeholder={t('project.title')} value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
              <input placeholder={t('project.role')} value={formData.role_en} onChange={e => setFormData({...formData, role_en: e.target.value})} />
              <textarea placeholder={t('project.desc')} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary"><Save size={18} /> {t('project.save_btn')}</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
