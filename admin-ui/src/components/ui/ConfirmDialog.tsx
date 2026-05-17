import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      slotProps={{
        paper: {
          className: 'glass-card',
          style: { padding: '1rem' }
        }
      }}
    >
      <DialogTitle style={{ color: 'var(--accent)' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: 'var(--text-secondary)' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: '1.5rem' }}>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="primary"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
