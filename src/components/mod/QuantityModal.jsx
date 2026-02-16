import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import api from "../../services/axios";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Delete as DeleteIcon } from '@mui/icons-material';

export default function QuantityModal({ open, onClose, item, onSuccess, onError }) {
  const [type, setType] = useState("ENTRADA");
  
  // ALTERAÇÃO 1: Inicializa com string vazia para o input ficar limpo
  const [quantity, setQuantity] = useState(""); 
  
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    const id = item?.idItem ?? item?.id ?? item?._id;
    if (!id) return;

    // ALTERAÇÃO 2: Converte para número apenas na hora de enviar
    const qty = Number(quantity);

    if (!quantity || qty <= 0) {
      onError?.("Informe uma quantidade válida (> 0).");
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        quantityChange: qty, 
        type 
      };

      // Chama a função correta no axios (updateItemQuantity)
      const response = await api.updateItemQuantity(id, payload);
      
      if (response.data?.success) {
        onSuccess?.(response.data.message || "Quantidade atualizada com sucesso.");
        resetAndClose();
      } else {
        onError?.(response.data?.error || "Erro ao atualizar quantidade.");
      }
    } catch (err) {
      onError?.(err.response?.data?.error || "Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setType("ENTRADA");
    setQuantity(""); // Limpa o input ao fechar
    onClose?.();
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!item) return;
    const id = item.idItem ?? item.id ?? item._id;
    
    setIsDeleting(true);
    try {
      const res = await api.deleteItem(id);
      const msg = res.data?.message || 'Item excluído com sucesso.';
      onSuccess?.(msg);
      closeDeleteConfirm();
      onClose?.();
    } catch (err) {
      onError?.(err.response?.data?.error || 'Erro ao excluir item.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={resetAndClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ backgroundColor: '#A31515', color: '#fff', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>Movimentação de Estoque</Box>
          <Box>
            <DeleteIcon onClick={openDeleteConfirm} sx={{ cursor: 'pointer', color: 'rgba(255,255,255,0.9)' }} />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {item ? (
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.brand || item.name}</Typography>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                 Atual: {item.currentQuantity ?? item.totalQuantity ?? 0}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: '#444' }}>{item.description || '—'}</Typography>

            <TextField
              select
              label="Tipo de Movimentação"
              value={type}
              onChange={(e) => setType(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="ENTRADA">ENTRADA (Adicionar)</MenuItem>
              <MenuItem value="SAIDA">SAÍDA (Remover)</MenuItem>
              <MenuItem value="AJUSTE">AJUSTE (Definir valor exato)</MenuItem>
            </TextField>

            <TextField
              label={type === "AJUSTE" ? "Nova Quantidade Total" : "Quantidade a alterar"}
              type="number"
              
              // ALTERAÇÃO 3: O value é a string (pode ser vazia)
              value={quantity}
              
              // ALTERAÇÃO 4: Atualiza o estado sem forçar Number() imediatamente
              // Isso permite que o usuário apague tudo e o campo fique vazio
              onChange={(e) => setQuantity(e.target.value)}
              
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              placeholder="Digite a quantidade"
              InputLabelProps={{
                shrink: true, // Garante que o label não sobreponha o placeholder
              }}
            />
          </Box>
        ) : (
          <Typography sx={{ p: 2 }}>Item inválido.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={resetAndClose} color="inherit">Cancelar</Button>
        <Button 
            onClick={handleConfirm} 
            variant="contained" 
            sx={{ backgroundColor: '#A31515', '&:hover': { backgroundColor: '#7c0f0f' } }} 
            // Desabilita se estiver vazio ou carregando
            disabled={loading || quantity === ""}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
        </Button>
      </DialogActions>
      
      <DeleteConfirmationModal
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        itemName={item?.brand || item?.name || 'Item'}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}