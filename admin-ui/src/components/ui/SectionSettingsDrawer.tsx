import React from 'react';
import { Drawer, Box, Typography, TextField, Button, IconButton, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { X, Save, Trash2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SectionSettingsDrawerProps {
  section: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionId: string, updates: any) => void;
  onDelete: (sectionId: string, title: string) => void;
}

const SectionSettingsDrawer: React.FC<SectionSettingsDrawerProps> = ({ section, isOpen, onClose, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [lang, setLang] = React.useState<'es' | 'en'>('es');
  const [formData, setFormData] = React.useState<any>(null);

  React.useEffect(() => {
    if (section) setFormData({ ...section });
  }, [section]);

  if (!formData) return null;

  const handleLangChange = (_: any, newLang: 'es' | 'en' | null) => {
    if (newLang) setLang(newLang);
  };

  const handleSave = () => {
    const { items, ...updates } = formData; // Remove items from save payload
    onSave(section.id, updates);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      slotProps={{
        backdrop: {
          style: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.4)' }
        }
      }}
    >
      <Box sx={{ width: 450, p: 4, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-dark)', color: '#fff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'var(--accent)', fontWeight: 700 }}>
            {t('editor.section_settings')}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid var(--border-glass)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Globe size={18} color="var(--accent)" />
            <Typography variant="subtitle2">{t('editor.lang_toggle')}</Typography>
          </Box>
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={handleLangChange}
            size="small"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-glass)',
                '&.Mui-selected': {
                  color: 'var(--accent)',
                  bgcolor: 'rgba(91, 212, 232, 0.1)',
                }
              }
            }}
          >
            <ToggleButton value="es">{t('editor.langs.es')}</ToggleButton>
            <ToggleButton value="en">{t('editor.langs.en')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          <Box className="input-group">
            <label>{t('project.title')} ({lang.toUpperCase()})</label>
            <TextField
              fullWidth
              variant="filled"
              value={formData[`title_${lang}`] || ''}
              onChange={(e) => setFormData({ ...formData, [`title_${lang}`]: e.target.value })}
              sx={{ input: { color: '#fff' } }}
            />
          </Box>

          <Box className="input-group">
            <label>{t('project.desc')} ({lang.toUpperCase()})</label>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="filled"
              value={formData[`description_${lang}`] || ''}
              onChange={(e) => setFormData({ ...formData, [`description_${lang}`]: e.target.value })}
              sx={{ textarea: { color: '#fff' } }}
            />
          </Box>

          {formData.type === 'gltf-model' && (
            <Box className="input-group">
               <label>{t('editor.drive_link')}</label>
               <TextField
                 fullWidth
                 variant="filled"
                 value={formData.model_drive_id || ''}
                 onChange={(e) => setFormData({ ...formData, model_drive_id: e.target.value })}
                 sx={{ input: { color: '#fff' } }}
               />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3, borderColor: 'var(--border-glass)' }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Trash2 size={16} />}
            onClick={() => onDelete(section.id, section.title_es)}
            sx={{ flex: 1 }}
          >
            {t('common.delete')}
          </Button>
          <Button 
            variant="contained" 
            className="btn-primary" 
            startIcon={<Save size={16} />}
            onClick={handleSave}
            sx={{ flex: 2, color: '#000' }}
          >
            {t('common.save')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SectionSettingsDrawer;
