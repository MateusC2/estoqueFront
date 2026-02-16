import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';


export default function DeleteConfirmationModal({
    open,
    onClose,
    itemName,
    onConfirm,
    isDeleting,
}) {
    return (
        <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: "10px", overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ backgroundColor: '#A31515', color: '#fff', fontWeight: 700, px: 3 }}>
                    Confirmar Exclusão
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ color: '#222' }}>
                        Tem certeza que deseja <strong>excluir</strong> o item
                        <span style={{ fontWeight: '700' }}> "{itemName}"</span>?
                    </Typography>
                    <Typography sx={{ mt: 1, color: '#555', fontSize: '0.95rem' }}>
                        Esta ação é irreversível e removerá o registro deste item.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon sx={{ color: '#fff' }} />}
                    >
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
    );
}