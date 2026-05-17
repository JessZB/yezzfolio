import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image, Box, Save, GripVertical, Settings } from 'lucide-react';
import api from '../api/client';
import { extract_drive_id } from '../api/utils';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ItemEditorDrawer from '../components/ui/ItemEditorDrawer';
import SectionSettingsDrawer from '../components/ui/SectionSettingsDrawer';
import '../styles/theme.css';
import './ProjectEditor.css';

const SortableSectionItem = React.memo(({ sec, index }: { sec: any, index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sec.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animationDelay: `${index * 0.05}s`,
        opacity: isDragging ? 0.3 : 1
      }}
      className="section-item animate-slide-right"
    >
      <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', color: 'var(--text-secondary)' }}>
        <GripVertical size={14} />
      </div>
      {sec.type === '3d-model' || sec.type === 'gltf-model' ? <Box size={16} /> : <Image size={16} />}
      {sec.title_es}
    </li>
  );
});

const SortableSectionBlock = React.memo(({ sec, project, index, onUpdate, onEdit, onAddItem, onEditItem, isOverlay }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sec.id, disabled: isOverlay });
  const { t } = useTranslation();
  
  const style = {
    transform: isOverlay ? undefined : CSS.Translate.toString(transform),
    transition: isOverlay ? undefined : transition,
    opacity: isDragging && !isOverlay ? 0 : 1,
    animation: isOverlay ? 'none' : undefined,
    animationDelay: isOverlay ? '0s' : `${index * 0.1}s`,
    zIndex: isOverlay ? 1000 : 1,
    width: '100%'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`section-block ${isOverlay ? 'is-overlay' : ''} ${isDragging && !isOverlay ? 'dragging' : ''}`}
    >
      <div className="section-header">
        <div {...attributes} {...listeners} className="drag-handle">
          <GripVertical size={20} />
        </div>
        <input
          className="sec-title-input"
          defaultValue={sec.title_es}
          onBlur={(e) => {
            if (e.target.value !== sec.title_es) {
              onUpdate?.(sec, { title_es: e.target.value });
            }
          }}
        />
        <div className="section-header-actions">
          <span className={`badge-type ${sec.type}`}>
            {sec.type === 'asset-group' ? <Image size={12} /> : <Box size={12} />}
            {sec.type}
          </span>
          <button
            className="btn-icon"
            onClick={() => onEdit?.(sec)}
            title={t('common.edit')}
          >
            <Settings size={18} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {sec.type === 'asset-group' && (
        <div className="gallery-grid">
          {sec.items?.map((item: any) => (
            <div key={item.id} className="item-card glass-card" onClick={() => onEditItem?.(item)}>
              {item.drive_file_id ? (
                <img src={`http://localhost:3001/api/file/${item.drive_file_id}?artistId=${project.artist_id}`} alt="" />
              ) : (
                <div className="img-placeholder"><Image size={24} /></div>
              )}
            </div>
          ))}
          <button className="add-item-card" onClick={() => onAddItem?.(sec.id)}>
            <Plus size={24} />
          </button>
        </div>
      )}

      {sec.type === 'gltf-model' && (
        <div className="input-group mt-1">
          <label>{t('editor.drive_link')}</label>
          <input
            defaultValue={sec.model_drive_id || ''}
            placeholder={t('editor.drive_placeholder')}
            onBlur={(e) => {
              if (e.target.value !== sec.model_drive_id) {
                 onUpdate?.(sec, { model_drive_id: extract_drive_id(e.target.value) });
              }
            }}
          />
        </div>
      )}
    </div>
  );
});

const ProjectEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [project, setProject] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, title: string, type: 'section' | 'item' } | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchProject = React.useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      enqueueSnackbar(t('notifications.fetch_error'), { variant: 'error' });
      navigate('/dashboard');
    }
  }, [id, navigate, enqueueSnackbar, t]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddSection = async (type: string) => {
    const secId = `sec_${Date.now()}`;
    const payload = {
      id: secId,
      project_id: id,
      type,
      title_es: t('editor.new_section_title', { lng: 'es' }),
      title_en: t('editor.new_section_title', { lng: 'en' }),
      sort_order: project.sections?.length || 0
    };

    try {
      await api.post('/sections', payload);
      fetchProject();
      enqueueSnackbar(t('notifications.section_created'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.save_error'), { variant: 'error' });
    }
  };

  const handleUpdateSection = React.useCallback(async (section: any, updates: any) => {
    setProject((prev: any) => ({
      ...prev,
      sections: prev.sections.map((s: any) => s.id === section.id ? { ...s, ...updates } : s)
    }));

    try {
      await api.post('/sections', { ...section, ...updates });
      enqueueSnackbar(t('notifications.save_success'), { variant: 'success', autoHideDuration: 1500 });
    } catch (err) {
      enqueueSnackbar(t('notifications.save_error'), { variant: 'error' });
      fetchProject();
    }
  }, [enqueueSnackbar, fetchProject]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const url = deleteTarget.type === 'section' 
        ? `/sections/${deleteTarget.id}` 
        : `/items/${deleteTarget.id}`;
        
      await api.delete(url);
      setDeleteTarget(null);
      fetchProject();
      enqueueSnackbar(t('notifications.delete_success'), { variant: 'info' });
    } catch (err) {
      enqueueSnackbar(t('notifications.delete_error'), { variant: 'error' });
    }
  };

  const handleAddItem = React.useCallback(async (sectionId: string) => {
    const id = `item_${Date.now()}`;
    try {
      await api.post('/items', { id, section_id: sectionId, drive_file_id: '', title: '' });
      fetchProject();
      enqueueSnackbar(t('notifications.item_added'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.save_error'), { variant: 'error' });
    }
  }, [fetchProject, enqueueSnackbar]);

  const handleSaveItem = async (updates: any) => {
    try {
      await api.post('/items', updates);
      fetchProject();
      enqueueSnackbar(t('notifications.save_success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.save_error'), { variant: 'error' });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await api.post('/publish');
      enqueueSnackbar(t('notifications.publish_success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('notifications.publish_error'), { variant: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent, type: 'sections' | 'items') => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (type === 'sections') {
      const oldIndex = project.sections.findIndex((s: any) => s.id === active.id);
      const newIndex = project.sections.findIndex((s: any) => s.id === over.id);
      const newSections = arrayMove(project.sections, oldIndex, newIndex);
      
      setProject((prev: any) => ({ ...prev, sections: newSections }));
      
       const orders = newSections.map((s: any, idx) => ({ id: s.id, sort_order: idx }));
       api.post('/reorder', { type: 'sections', orders }).catch(() => fetchProject());
    }
  };

  if (!project) return <div className="loading">{t('common.loading')}</div>;

  const activeSection = activeId ? project.sections?.find((s: any) => s.id === activeId) : null;

  return (
    <div className="editor-container animate-fade-in">
      <header className="editor-header">
        <button className="btn-icon header-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> {t('nav.back')}
        </button>
        <div className="title">
          <h1>{project.title_es}</h1>
          <span className="badge">{project.category}</span>
        </div>
        <button className={`btn-primary ${isPublishing ? 'loading' : ''}`} onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? <CircularProgress size={18} sx={{ color: '#000' }} /> : <Save size={18} />}
          {isPublishing ? t('common.loading') : t('common.publish')}
        </button>
      </header>

      <div className="workspace">
        <aside className="sidebar glass-card animate-slide-right">
          <h3>{t('editor.sections')}</h3>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={(e) => handleDragEnd(e, 'sections')}>
            <SortableContext items={project.sections?.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
              <ul className="section-list">
                {project.sections?.map((sec: any, idx: number) => (
                  <SortableSectionItem key={sec.id} sec={sec} index={idx} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          
          <div className="add-section-opts">
             <button onClick={() => handleAddSection('asset-group')}><Plus size={14}/> {t('editor.add_gallery')}</button>
             <button onClick={() => handleAddSection('gltf-model')}><Plus size={14}/> {t('editor.add_3d')}</button>
          </div>
        </aside>

        <main className="editor-content glass-card">
          {project.sections?.length === 0 ? (
            <div className="empty-state">
              <h2>{t('editor.empty_state')}</h2>
              <p>{t('editor.empty_desc')}</p>
            </div>
          ) : (
             <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={(e) => handleDragEnd(e, 'sections')}
             >
               <SortableContext items={project.sections?.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                 <div className="sections-view">
                   {project.sections?.map((sec: any, idx: number) => (
                     <SortableSectionBlock 
                        key={sec.id} 
                        sec={sec} 
                        project={project} 
                        index={idx} 
                        onUpdate={handleUpdateSection}
                        onEdit={setEditingSection}
                        onAddItem={handleAddItem}
                        onEditItem={setEditingItem}
                     />
                   ))}
                 </div>
               </SortableContext>

               <DragOverlay dropAnimation={{
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.5',
                      },
                    },
                  }),
                }}>
                {activeSection ? (
                  <SortableSectionBlock 
                    sec={activeSection} 
                    project={project} 
                    index={0} 
                    isOverlay 
                  />
                ) : null}
               </DragOverlay>
             </DndContext>
          )}
        </main>
      </div>

      <ConfirmDialog 
        open={!!deleteTarget}
        title={deleteTarget?.type === 'section' ? t('editor.section_settings') : t('editor.item_details')}
        message={t('common.confirm_delete', { name: deleteTarget?.title })}
        confirmText={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ItemEditorDrawer 
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItem}
        onDelete={(id) => {
          setEditingItem(null);
          setDeleteTarget({ id, title: 'Item', type: 'item' });
        }}
      />

      <SectionSettingsDrawer
        section={editingSection}
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        onSave={handleUpdateSection}
        onDelete={(id, title) => {
          setEditingSection(null);
          setDeleteTarget({ id, title, type: 'section' });
        }}
      />
    </div>
  );
};

export default ProjectEditor;
