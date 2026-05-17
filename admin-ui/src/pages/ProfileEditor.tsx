import React, { useState, useEffect } from 'react';
import { 
  User, Palette, BarChart3, AppWindow, Share2, 
  Mail, Save, Image as ImageIcon, Plus, Trash2,
  Globe, Languages, Eye, Send, ArrowLeft, Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { extract_drive_id } from '../api/utils';
import { enqueueSnackbar } from 'notistack';
import { 
  Tabs, Tab, Box, Button, Slider, 
  IconButton, Switch, FormControlLabel, CircularProgress,
  ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import './ProfileEditor.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      className={`tab-panel-container ${value === index ? 'active' : ''}`}
    >
      {value === index && (
        <Box className="tab-content">
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfileEditor: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayMode, setDisplayMode] = useState<'es' | 'en' | 'dual'>('es');

  // States
  const [identity, setIdentity] = useState<any>({
    class_es: '', class_en: '', level: 1, status_es: '', status_en: '', bio_es: '', bio_en: '',
    favicon_drive_id: '', avatar_drive_id: '', site_title_es: '', site_title_en: '',
    seo_desc_es: '', seo_desc_en: '', contact_title_es: '', contact_title_en: '',
    contact_desc_es: '', contact_desc_en: '', contact_email: '', theme_json: '{}'
  });
  const [socials, setSocials] = useState<any[]>([]);
  const [software, setSoftware] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [theme, setTheme] = useState<any>({
    bg_deep: '#09000c', dark_purple: '#1c0217', panel_bg: '#311c48',
    highlight: '#4c3f91', panel_border_glow: '#9145b6', panel_border: '#b958a5',
    danger: '#ff5677', accent: '#ffea00'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/profile/full');
      if (data.profile.artist_id) {
        setIdentity(data.profile);
        if (data.profile.theme_json) {
          setTheme(JSON.parse(data.profile.theme_json));
        }
      }
      setSocials(data.socials || []);
      setSoftware(data.software || []);
      setStats(data.stats || []);
    } catch (err) {
      enqueueSnackbar(t('notifications.fetch_error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: string) => {
    setSaving(true);
    try {
      if (category === 'identity') {
         await api.post('/profile/identity', { ...identity, theme_json: JSON.stringify(theme) });
      } else if (category === 'socials') {
         await api.post('/profile/socials', { socials });
      } else if (category === 'software') {
         await api.post('/profile/software', { software });
      } else if (category === 'stats') {
         await api.post('/profile/stats', { stats });
      }
      enqueueSnackbar(t('common.saved'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.save_error'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await api.post('/publish');
      enqueueSnackbar(t('notifications.publish_success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.publish_error'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isVisible = (lang: 'es' | 'en') => displayMode === 'dual' || displayMode === lang;

  if (loading) return (
    <div className="loading-screen bg-black flex items-center justify-center h-screen">
      <CircularProgress color="secondary" />
    </div>
  );

  return (
    <div className="profile-editor-container">
      <header className="editor-header">
        <div className="header-info flex items-center gap-4">
          <Tooltip title={t('nav.back')}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'var(--accent)' }}>
              <ArrowLeft size={24} />
            </IconButton>
          </Tooltip>
          <div>
            <h1>{t('profile.title')}</h1>
            <p className="text-muted">{t('profile.subtitle')}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="lang-toggle-box">
             <span className="text-xs uppercase mb-1 block text-muted">{t('profile.editor_lang.label')}</span>
             <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={(_, val) => val && setDisplayMode(val)}
              size="small"
              sx={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <ToggleButton value="es" sx={{ color: 'var(--text-muted)' }}>{t('profile.editor_lang.es')}</ToggleButton>
              <ToggleButton value="en" sx={{ color: 'var(--text-muted)' }}>{t('profile.editor_lang.en')}</ToggleButton>
              <ToggleButton value="dual" sx={{ color: 'var(--text-muted)' }}><Eye size={14} className="mr-2"/> {t('profile.editor_lang.dual')}</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Send size={18} />}
            onClick={handlePublish}
            disabled={saving}
          >
            {t('common.publish')}
          </Button>
        </div>
      </header>

      <div className="editor-layout">
        <aside className="tabs-sidebar">
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
          >
            <Tab icon={<User size={18} />} iconPosition="start" label={t('profile.tabs.identity')} />
            <Tab icon={<Palette size={18} />} iconPosition="start" label={t('profile.tabs.appearance')} />
            <Tab icon={<BarChart3 size={18} />} iconPosition="start" label={t('profile.tabs.skills')} />
            <Tab icon={<AppWindow size={18} />} iconPosition="start" label={t('profile.tabs.software')} />
            <Tab icon={<Share2 size={18} />} iconPosition="start" label={t('profile.tabs.social')} />
            <Tab icon={<Mail size={18} />} iconPosition="start" label={t('profile.tabs.contact')} />
          </Tabs>
        </aside>

        <main className="tab-panels">
          {/* Identity Tab */}
          <TabPanel value={activeTab} index={0}>
            <section className="editor-module">
              <header className="module-header">
                <h2><User size={18} /> {t('profile.tabs.identity')}</h2>
                <Button variant="outlined" color="inherit" size="small" onClick={() => handleSave('identity')} startIcon={<Save size={16} />}>
                  {t('common.save')}
                </Button>
              </header>
              <div className="grid-form">
                <div className="input-group full">
                  <label className="flex items-center gap-2">
                    {t('profile.identity.avatar')}
                    <Tooltip title={t('profile.identity.avatar_hint')}><Info size={14} className="text-muted cursor-help"/></Tooltip>
                  </label>
                  <div className="image-input-wrapper">
                    <input 
                      placeholder={t('editor.drive_link')}
                      value={identity.avatar_drive_id}
                       onChange={e => setIdentity({...identity, avatar_drive_id: extract_drive_id(e.target.value)})}
                    />
                    {identity.avatar_drive_id && (
                      <div className="avatar-preview">
                        <img src={`http://localhost:3001/api/file/${identity.avatar_drive_id}`} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>{t('profile.identity.level')} (Lv.)</label>
                    <input type="number" min="1" max="99" value={identity.level} onChange={e => setIdentity({...identity, level: parseInt(e.target.value)})}/>
                  </div>
                  {isVisible('es') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                       <label>{t('profile.identity.class')} (ES)</label>
                       <input value={identity.class_es} onChange={e => setIdentity({...identity, class_es: e.target.value})}/>
                    </div>
                  )}
                  {isVisible('en') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                       <label>{t('profile.identity.class')} (EN)</label>
                       <input value={identity.class_en} onChange={e => setIdentity({...identity, class_en: e.target.value})}/>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  {isVisible('es') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.identity.status')} (ES)</label>
                      <input value={identity.status_es} onChange={e => setIdentity({...identity, status_es: e.target.value})}/>
                    </div>
                  )}
                  {isVisible('en') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.identity.status')} (EN)</label>
                      <input value={identity.status_en} onChange={e => setIdentity({...identity, status_en: e.target.value})}/>
                    </div>
                  )}
                </div>

                {isVisible('es') && (
                  <div className={`input-group full ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                    <label>{t('profile.identity.bio')} (ES)</label>
                    <textarea value={identity.bio_es} onChange={e => setIdentity({...identity, bio_es: e.target.value})} rows={3}/>
                  </div>
                )}
                {isVisible('en') && (
                  <div className={`input-group full ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                    <label>{t('profile.identity.bio')} (EN)</label>
                    <textarea value={identity.bio_en} onChange={e => setIdentity({...identity, bio_en: e.target.value})} rows={3}/>
                  </div>
                )}
              </div>
            </section>
          </TabPanel>

          {/* Theme Tab */}
          <TabPanel value={activeTab} index={1}>
            <section className="editor-module">
              <header className="module-header">
                <h2><Palette size={18} /> {t('profile.appearance.title')}</h2>
                <Button variant="outlined" color="inherit" size="small" onClick={() => handleSave('identity')} startIcon={<Save size={16} />}>
                  {t('common.save')}
                </Button>
              </header>
              <p className="text-muted mb-4 text-xs uppercase">{t('profile.appearance.hint')}</p>
              <div className="color-grid">
                {Object.keys(theme).map(key => (
                  <div key={key} className="color-item">
                    <label className="text-[10px] sm:text-xs">{key.replace(/_/g, ' ').toUpperCase()}</label>
                    <div className="picker-wrapper flex items-center gap-2">
                       <Tooltip title={theme[key]}>
                        <input type="color" value={theme[key]} onChange={e => setTheme({...theme, [key]: e.target.value})} className="w-8 h-8 cursor-pointer bg-transparent border-none"/>
                      </Tooltip>
                      <code className="text-[10px] opacity-60">{theme[key]}</code>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="theme-preview-box mt-8" style={{ 
                background: `linear-gradient(135deg, ${theme.bg_deep}, ${theme.dark_purple})`,
                border: `2px solid ${theme.panel_border}`,
                boxShadow: `0 0 40px ${theme.panel_border_glow}33`,
                color: theme.accent
              }}>
                 {t('profile.appearance.preview')}
                 <div className="mt-4 flex justify-center">
                    <div style={{ background: theme.panel_bg, border: `1px solid ${theme.highlight}`, padding: '10px 20px', fontSize: '0.8rem', color: '#fff', borderRadius: '4px' }}>
                       UI PANEL <span style={{ color: theme.accent }}>v1.0</span>
                    </div>
                 </div>
              </div>
            </section>
          </TabPanel>

          {/* Stats Tab */}
          <TabPanel value={activeTab} index={2}>
            <section className="editor-module">
              <header className="module-header">
                <h2><BarChart3 size={18} /> {t('profile.skills.title')}</h2>
                <div className="actions flex gap-2">
                  <Button variant="text" size="small" sx={{ color: 'var(--accent)' }} onClick={() => setStats([...stats, { id: `st_${Date.now()}`, name_es: 'Nueva Skill', name_en: 'New Skill', value: 80, css_class: '' }])} startIcon={<Plus size={16} />}>
                    {t('profile.skills.add')}
                  </Button>
                  <Button variant="outlined" color="inherit" size="small" onClick={() => handleSave('stats')} startIcon={<Save size={16} />}>
                    {t('common.save')}
                  </Button>
                </div>
              </header>
              <div className="list-editor">
                {stats.length === 0 ? (
                  <p className="empty-state-text">{t('profile.empty_state')}</p>
                ) : (
                  stats.map((st, idx) => (
                  <div key={st.id} className="list-item">
                    <div className="item-main flex-1 flex flex-col gap-4">
                      <div className="form-row">
                        {isVisible('es') && (
                          <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                             <label>{t('profile.skills.name')} (ES)</label>
                             <input value={st.name_es} onChange={e => {
                                const newStats = [...stats];
                                newStats[idx].name_es = e.target.value;
                                setStats(newStats);
                              }}/>
                          </div>
                        )}
                        {isVisible('en') && (
                          <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                             <label>{t('profile.skills.name')} (EN)</label>
                             <input value={st.name_en} onChange={e => {
                                const newStats = [...stats];
                                newStats[idx].name_en = e.target.value;
                                setStats(newStats);
                              }}/>
                          </div>
                        )}
                        <div className="input-group">
                          <label>{t('profile.skills.style')}</label>
                          <select value={st.css_class} onChange={e => {
                            const newStats = [...stats];
                            newStats[idx].css_class = e.target.value;
                            setStats(newStats);
                          }}>
                            <option value="">{t('profile.skills.styles.default')}</option>
                            <option value="exp">{t('profile.skills.styles.special')}</option>
                            <option value="ui">{t('profile.skills.styles.ui')}</option>
                          </select>
                        </div>
                      </div>
                      <div className="slider-row flex items-center gap-4">
                        <label className="text-[10px] uppercase w-24">{t('profile.skills.value')}: {st.value}%</label>
                        <Slider 
                          size="small" color="secondary"
                          value={st.value} 
                          onChange={(_, val) => {
                            const newStats = [...stats];
                            newStats[idx].value = val as number;
                            setStats(newStats);
                          }}
                        />
                      </div>
                    </div>
                    <Tooltip title={t('common.delete')}>
                      <IconButton color="error" size="small" onClick={() => setStats(stats.filter((_, i) => i !== idx))}>
                        <Trash2 size={16}/>
                      </IconButton>
                    </Tooltip>
                  </div>
                  ))
                )}
              </div>
            </section>
          </TabPanel>

          {/* Software Tab */}
          <TabPanel value={activeTab} index={3}>
            <section className="editor-module">
              <header className="module-header">
                <h2><AppWindow size={18} /> {t('profile.software.title')}</h2>
                <div className="actions flex gap-2">
                  <Button variant="text" size="small" sx={{ color: 'var(--accent)' }} onClick={() => setSoftware([...software, { id: `sw_${Date.now()}`, name: 'Herramienta', icon_drive_id: '', color: '#ffffff' }])} startIcon={<Plus size={16} />}>
                    {t('profile.software.add')}
                  </Button>
                  <Button variant="outlined" color="inherit" size="small" onClick={() => handleSave('software')} startIcon={<Save size={16} />}>
                    {t('common.save')}
                  </Button>
                </div>
              </header>
              <div className="list-editor">
                {software.length === 0 ? (
                  <p className="empty-state-text">{t('profile.empty_state')}</p>
                ) : (
                  software.map((sw, idx) => (
                  <div key={sw.id} className="list-item items-center">
                    <Tooltip title="Preview">
                      <div className="item-icon-preview border border-glass p-2 bg-black/40">
                        {sw.icon_drive_id ? <img src={`http://localhost:3001/api/file/${sw.icon_drive_id}`} alt="Icon" className="w-8 h-8 object-contain" /> : <ImageIcon size={24} className="text-muted"/>}
                      </div>
                    </Tooltip>
                    <div className="item-main flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="input-group">
                        <label>{t('profile.skills.name')}</label>
                        <input value={sw.name} onChange={e => {
                          const newSw = [...software];
                          newSw[idx].name = e.target.value;
                          setSoftware(newSw);
                        }}/>
                      </div>
                      <div className="input-group">
                        <label>{t('profile.software.icon')}</label>
                        <input value={sw.icon_drive_id} onChange={e => {
                          const newSw = [...software];
                          newSw[idx].icon_drive_id = extract_drive_id(e.target.value);
                          setSoftware(newSw);
                        }} placeholder={t('editor.drive_link')}/>
                      </div>
                      <div className="input-group">
                        <label>{t('profile.software.color')}</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={sw.color} onChange={e => {
                            const newSw = [...software];
                            newSw[idx].color = e.target.value;
                            setSoftware(newSw);
                          }} className="w-10 h-10 border-none bg-transparent"/>
                          <code className="text-xs">{sw.color}</code>
                        </div>
                      </div>
                    </div>
                    <IconButton color="error" size="small" onClick={() => setSoftware(software.filter((_, i) => i !== idx))}>
                      <Trash2 size={16}/>
                    </IconButton>
                  </div>
                  ))
                )}
              </div>
            </section>
          </TabPanel>

          {/* Social Tab */}
          <TabPanel value={activeTab} index={4}>
            <section className="editor-module">
              <header className="module-header">
                <h2><Share2 size={18} /> {t('profile.social.title')}</h2>
                <div className="actions flex gap-2">
                  <Button variant="text" size="small" sx={{ color: 'var(--accent)' }} onClick={() => setSocials([...socials, { id: `soc_${Date.now()}`, name: 'Nueva Red', link: '#', icon_drive_id: '', active: 1 }])} startIcon={<Plus size={16} />}>
                    {t('profile.social.add')}
                  </Button>
                  <Button variant="outlined" color="inherit" size="small" onClick={() => handleSave('socials')} startIcon={<Save size={16} />}>
                    {t('common.save')}
                  </Button>
                </div>
              </header>
              <div className="list-editor">
                {socials.length === 0 ? (
                  <p className="empty-state-text">{t('profile.empty_state')}</p>
                ) : (
                  socials.map((soc, idx) => (
                  <div key={soc.id} className="list-item">
                    <FormControlLabel
                      control={<Switch size="small" color="secondary" checked={soc.active === 1} onChange={e => {
                        const newSoc = [...socials];
                        newSoc[idx].active = e.target.checked ? 1 : 0;
                        setSocials(newSoc);
                      }} />}
                      label={<span className="text-[10px] uppercase">{soc.active ? t('profile.social.active') : 'Off'}</span>}
                      labelPlacement="top"
                    />
                    <div className="item-main flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="input-group">
                        <label>{t('profile.skills.name')}</label>
                        <input value={soc.name} onChange={e => {
                          const newSoc = [...socials];
                          newSoc[idx].name = e.target.value;
                          setSocials(newSoc);
                        }}/>
                      </div>
                      <div className="input-group">
                        <label>{t('profile.social.link')}</label>
                        <input value={soc.link} onChange={e => {
                          const newSoc = [...socials];
                          newSoc[idx].link = e.target.value;
                          setSocials(newSoc);
                        }}/>
                      </div>
                      <div className="input-group full col-span-1 sm:col-span-2 border-t border-glass pt-2">
                        <label>{t('profile.software.icon')}</label>
                        <input value={soc.icon_drive_id} onChange={e => {
                          const newSoc = [...socials];
                          newSoc[idx].icon_drive_id = extract_drive_id(e.target.value);
                          setSocials(newSoc);
                        }} placeholder={t('editor.drive_link')}/>
                      </div>
                    </div>
                    <IconButton color="error" size="small" onClick={() => setSocials(socials.filter((_, i) => i !== idx))}>
                      <Trash2 size={16}/>
                    </IconButton>
                  </div>
                  ))
                )}
              </div>
            </section>
          </TabPanel>

          {/* Contact Tab */}
          <TabPanel value={activeTab} index={5}>
            <section className="editor-module">
              <header className="module-header">
                <h2><Mail size={18} /> {t('profile.tabs.contact')}</h2>
                <Button variant="outlined" color="inherit" size="small" onClick={() => handleSave('identity')} startIcon={<Save size={16} />}>
                  {t('common.save')}
                </Button>
              </header>
              
              <div className="section-divider flex items-center gap-4 mb-6">
                 <Globe size={16} className="text-accent" />
                 <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Global SEO & Identity</span>
                 <div className="flex-1 h-px bg-glass"></div>
              </div>

              <div className="grid-form">
                <div className="form-row">
                   <div className="input-group">
                      <label>{t('profile.contact.favicon')}</label>
                      <input value={identity.favicon_drive_id} onChange={e => setIdentity({...identity, favicon_drive_id: extract_drive_id(e.target.value)})} placeholder={t('editor.drive_link')}/>
                   </div>
                   <div className="input-group">
                      <label>{t('profile.contact.email')}</label>
                      <input value={identity.contact_email} onChange={e => setIdentity({...identity, contact_email: e.target.value})} placeholder="example@mail.com"/>
                   </div>
                </div>

                <div className="form-row">
                  {isVisible('es') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.contact.seo_title')} (ES)</label>
                      <input value={identity.site_title_es} onChange={e => setIdentity({...identity, site_title_es: e.target.value})}/>
                    </div>
                  )}
                  {isVisible('en') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.contact.seo_title')} (EN)</label>
                      <input value={identity.site_title_en} onChange={e => setIdentity({...identity, site_title_en: e.target.value})}/>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  {isVisible('es') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>SEO {t('project.desc')} (ES)</label>
                      <textarea value={identity.seo_desc_es} onChange={e => setIdentity({...identity, seo_desc_es: e.target.value})} rows={2}/>
                    </div>
                  )}
                  {isVisible('en') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>SEO {t('project.desc')} (EN)</label>
                      <textarea value={identity.seo_desc_en} onChange={e => setIdentity({...identity, seo_desc_en: e.target.value})} rows={2}/>
                    </div>
                  )}
                </div>

                <div className="section-divider flex items-center gap-4 mt-8 mb-6">
                  <Languages size={16} className="text-accent" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Communications Section Texts</span>
                  <div className="flex-1 h-px bg-glass"></div>
                </div>

                <div className="form-row">
                  {isVisible('es') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.contact.comms_title')} (ES)</label>
                      <input value={identity.contact_title_es} onChange={e => setIdentity({...identity, contact_title_es: e.target.value})}/>
                    </div>
                  )}
                  {isVisible('en') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.contact.comms_title')} (EN)</label>
                      <input value={identity.contact_title_en} onChange={e => setIdentity({...identity, contact_title_en: e.target.value})}/>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  {isVisible('es') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.contact.comms_desc')} (ES)</label>
                      <textarea value={identity.contact_desc_es} onChange={e => setIdentity({...identity, contact_desc_es: e.target.value})} rows={2}/>
                    </div>
                  )}
                  {isVisible('en') && (
                    <div className={`input-group ${displayMode === 'dual' ? 'dual-field' : ''}`}>
                      <label>{t('profile.contact.comms_desc')} (EN)</label>
                      <textarea value={identity.contact_desc_en} onChange={e => setIdentity({...identity, contact_desc_en: e.target.value})} rows={2}/>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </TabPanel>
        </main>
      </div>
    </div>
  );
};

export default ProfileEditor;
