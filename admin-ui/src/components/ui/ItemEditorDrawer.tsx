import React from 'react';
import { Drawer, Box, Typography, TextField, Button, IconButton, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { X, Save, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { extract_drive_id } from '../../api/utils';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

interface ItemEditorDrawerProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: any) => void;
  onDelete: (id: string) => void;
}

const ItemEditorDrawer: React.FC<ItemEditorDrawerProps> = ({ item, isOpen, onClose, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [lang, setLang] = React.useState<'es' | 'en'>('es');
  const [formData, setFormData] = React.useState(item || {});
  const [isValidating, setIsValidating] = React.useState(false);
  const [driveError, setDriveError] = React.useState(false);

  React.useEffect(() => {
    setFormData(item || {});
    setDriveError(false);
  }, [item]);

  const validateDriveAccess = async (fileId: string) => {
    if (!fileId) return;
    setIsValidating(true);
    setDriveError(false);
    try {
      await api.get(`/file/${fileId}/check`);
      setDriveError(false);
    } catch (err) {
      setDriveError(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDriveChange = (val: string) => {
    const id = extract_drive_id(val);
    setFormData({ ...formData, drive_file_id: id });
    if (id) validateDriveAccess(id);
  };

  const handleLangChange = (_: any, newLang: 'es' | 'en' | null) => {
    if (newLang) setLang(newLang);
  };

  const handleApply = () => {
    onSave(formData);
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
      <Box sx={{ width: 400, p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'var(--accent)', fontWeight: 700 }}>
            {t('editor.item_details')}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 4 }}>
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
             <label>{t('editor.drive_link')}</label>
              <TextField
                fullWidth
                variant="filled"
                placeholder={t('editor.drive_placeholder')}
                value={formData.drive_file_id || ''}
                onChange={(e) => handleDriveChange(e.target.value)}
                sx={{ input: { color: '#fff' } }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isValidating && <CircularProgress size={16} sx={{ color: 'var(--accent)' }} />}
                        {!isValidating && formData.drive_file_id && !driveError && <CheckCircle2 size={16} color="#10b981" />}
                        {!isValidating && driveError && <AlertCircle size={16} color="#ef4444" />}
                      </Box>
                    )
                  }
                }}
              />
             {driveError && (
               <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                 {t('editor.drive_error')}
               </Typography>
             )}
          </Box>

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
               rows={4}
               variant="filled"
               value={formData[`description_${lang}`] || ''}
               onChange={(e) => setFormData({ ...formData, [`description_${lang}`]: e.target.value })}
               sx={{ textarea: { color: '#fff' } }}
             />
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', gap: 2, pt: 4, borderTop: '1px solid var(--border-glass)' }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Trash2 size={16} />}
            onClick={() => onDelete(item.id)}
            sx={{ flex: 1 }}
          >
            {t('common.delete')}
          </Button>
          <Button 
            variant="contained" 
            className="btn-primary" 
            startIcon={<Save size={16} />}
            onClick={handleApply}
            disabled={isValidating || driveError}
            sx={{ 
              flex: 2, 
              color: '#000',
              '&.Mui-disabled': {
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {t('common.save')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ItemEditorDrawer;
