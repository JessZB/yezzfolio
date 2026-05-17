import React, { useEffect, useState } from 'react';
import api from '../api/client';
import '../styles/theme.css';
import './Dashboard.css';
import { LayoutGrid, Plus, Send, ExternalLink, Trash2, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectModal from '../components/ui/ProjectModal';
import { Skeleton, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { CSS } from '@dnd-kit/utilities';

const SortableProject: React.FC<{
  p: any, 
  navigate: any, 
  onDelete: (e: React.MouseEvent, id: string, title: string) => void,
  onEdit: (e: React.MouseEvent, p: any) => void
}> = ({p, navigate, onDelete, onEdit}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id: p.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'pointer',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{
        ...style,
        animationDelay: `${p.index * 0.1}s`
      }}
      {...attributes} 
      {...listeners}
      className="glass-card project-card animate-slide-up" 
      onClick={() => !isDragging && navigate(`/project/${p.id}`)}
    >
      <div className="card-thumb">
          {p.thumbnail_drive_id && (
            <img src={`http://localhost:3001/api/file/${p.thumbnail_drive_id}?artistId=${p.artist_id}`} alt={p.title_es} draggable={false} />
          )}
      </div>
      <div className="card-info">
        <h3>{p.title_es}</h3>
        <div className="card-footer">
          <span className="badge">{p.category}</span>
          <div className="card-actions">
            <IconButton 
              size="small" 
              onClick={(e) => onEdit(e, p)}
              sx={{color: 'var(--text-secondary)', '&:hover': { color: 'var(--accent)', bgcolor: 'rgba(91, 212, 232, 0.1)' }}}
            >
               <Settings size={16} />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => onDelete(e, p.id, p.title_es)}
              sx={{color: 'rgba(239, 68, 68, 0.6)', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }}}
            >
               <Trash2 size={16} />
            </IconButton>
            <IconButton size="small" sx={{color: 'var(--text-secondary)'}}>
               <ExternalLink size={16} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, title: string} | null>(null);

  const handleLangChange = (_: any, newLang: string | null) => {
    if (newLang) {
      i18n.changeLanguage(newLang);
      api.post('/profile/lang', { lang: newLang }).then(() => {
        enqueueSnackbar(t('notifications.lang_updated'), { variant: 'success' });
      }).catch(err => {
        console.error('Error saving language preference:', err);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/full');
      if (res.data.preferred_lang && res.data.preferred_lang !== i18n.language) {
        i18n.changeLanguage(res.data.preferred_lang);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      enqueueSnackbar(t('notifications.fetch_error'), { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchProjects();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (data: any) => {
    try {
      await api.post('/projects', data);
      handleCloseModal();
      fetchProjects();
      enqueueSnackbar(t('notifications.save_success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.save_error'), { variant: 'error' });
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProjects();
      enqueueSnackbar(t('notifications.delete_success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.delete_error'), { variant: 'error' });
    }
  };

  const handlePublish = async () => {
    try {
      await api.post('/publish');
      enqueueSnackbar(t('notifications.publish_success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.publish_error'), { variant: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    navigate('/login');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArr = arrayMove(items, oldIndex, newIndex);
        
        // Persist to DB
        const orders = newArr.map((p, idx) => ({ id: p.id, sort_order: idx }));
        api.post('/reorder', { type: 'projects', orders }).catch(() => {
           enqueueSnackbar(t('notifications.reorder_error'), { variant: 'error' });
        });
        
        return newArr;
      });
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <LayoutGrid size={20} color="var(--accent)" />
          <h1>{t('nav.dashboard')}</h1>
        </div>
        <div className="header-actions">
          <ToggleButtonGroup
            value={i18n.language}
            exclusive
            onChange={handleLangChange}
            size="small"
            sx={{ mr: 2, '& .MuiToggleButton-root': { color: 'var(--text-secondary)', borderColor: 'var(--border-glass)' } }}
          >
            <ToggleButton value="es">ES</ToggleButton>
            <ToggleButton value="en">EN</ToggleButton>
          </ToggleButtonGroup>
          <button className="btn-secondary" onClick={() => navigate('/profile')} style={{ marginRight: '1rem' }}>
             <User size={18} /> {t('nav.profile')}
          </button>
          <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
             <Plus size={18} /> {t('project.new')}
          </button>
          <button onClick={handlePublish} className="btn-primary">
             <Send size={18} /> {t('common.publish')}
          </button>
          <IconButton 
            onClick={handleLogout} 
            title={t('nav.logout')}
            sx={{ ml: 1, color: 'var(--text-secondary)', '&:hover': { color: 'rgba(239, 68, 68, 0.8)' } }}
          >
            <LogOut size={20} />
          </IconButton>
        </div>
      </header>

      <main className="project-grid">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card project-card">
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '0.5rem 0.5rem 0 0' }} />
              <div className="card-info" style={{ padding: '1rem' }}>
                <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={20} />
              </div>
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty">{t('project.empty')}</p>
            <p className="empty-sub">{t('project.empty_cta')}</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={projects.map(p => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              {projects.map((p, idx) => (
                <SortableProject 
                  key={p.id} 
                  p={{ ...p, index: idx }} 
                  navigate={navigate} 
                  onDelete={(e, id, title) => {
                    e.stopPropagation();
                    setDeleteTarget({id, title});
                  }} 
                  onEdit={(e, project) => {
                    e.stopPropagation();
                    setEditingProject(project);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </main>

      <ConfirmDialog 
        open={!!deleteTarget}
        title={t('common.delete')}
        message={t('common.confirm_delete', { name: deleteTarget?.title })}
        confirmText={t('common.delete')}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteTarget(null)}
      />

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveProject} 
        project={editingProject}
      />
    </div>
  );
};

export default Dashboard;
