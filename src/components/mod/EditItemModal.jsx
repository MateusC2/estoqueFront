import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/axios";
import { useBrands } from "../hooks/useBrands";

export default function EditItemModal({ open, onClose, item, onSuccess, onError }) {
  const [form, setForm] = useState({ brand: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [addingNewBrand, setAddingNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  
  const [modalInfo, setModalInfo] = useState({ open: false, title: "", message: "", type: "info" });
  const { brands, loadingBrands, savingNewBrand, fetchBrands, createBrand } = useBrands(open, setModalInfo);

  useEffect(() => {
    if (item && open) {
      setForm({ 
        brand: item.brand || "", 
        description: item.description || "" 
      });
    }
  }, [item, open]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    const success = await createBrand(newBrandName);
    if (success) {
      setForm({ ...form, brand: newBrandName });
      setNewBrandName("");
      setAddingNewBrand(false);
      fetchBrands();
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!item) return;

    // Garante que o ID seja um número válido
    const id = item.idItem || item.id || item._id;
    
    if (!id) {
      onError?.("Erro: ID do item não encontrado.");
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        brand: form.brand, 
        description: form.description 
      };
      
      // Chama a rota PUT: /items/:id
      const res = await api.updateItem(id, payload); 
      
      if (res.status === 200 || res.data?.success) {
        onSuccess?.(res.data?.message || "Item atualizado com sucesso.");
        onCloseLocal();
      } else {
        onError?.(res.data?.message || "Erro ao atualizar item.");
      }
    } catch (err) {
      console.error("Erro no update:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Erro de conexão com o servidor.";
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onCloseLocal = () => {
    setForm({ brand: "", description: "" });
    setAddingNewBrand(false);
    setNewBrandName("");
    onClose?.();
  };

  return (
    <Dialog open={!!open} onClose={onCloseLocal} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: '#A31515', 
        color: '#fff', 
        fontWeight: 700,
        borderTopLeftRadius: 6, 
        borderTopRightRadius: 6 
      }}>
        Editar Item
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {item ? (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

            <FormControl fullWidth size="small">
              <InputLabel>Marca</InputLabel>
              <Select
                value={form.brand}
                label="Marca"
                name="brand"
                onChange={(e) => {
                  if (e.target.value === 'newBrand') {
                    setAddingNewBrand(true);
                  } else setForm({ ...form, brand: e.target.value });
                }}
              >
                <MenuItem value="" disabled>
                  {loadingBrands ? 'Carregando...' : 'Selecione uma marca'}
                </MenuItem>
                {brands.map((b, i) => (
                  <MenuItem key={i} value={b.brand || b.name || b.value}>
                    {b.brand || b.name || b.value}
                  </MenuItem>
                ))}
                <MenuItem value="newBrand" sx={{ fontWeight: 'bold', color: '#A31515', borderTop: '1px solid #eee' }}>
                  <AddIcon sx={{ mr: 1, fontSize: 18 }} /> Adicionar nova marca...
                </MenuItem>
              </Select>
            </FormControl>

            {addingNewBrand && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <TextField 
                  fullWidth size="small" variant="standard"
                  value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} 
                  placeholder="Nome da marca" autoFocus
                />
                <Button 
                  onClick={handleCreateBrand} variant="text" size="small"
                  disabled={savingNewBrand || !newBrandName.trim()} 
                  sx={{ color: '#A31515', fontWeight: 'bold' }}
                >
                  {savingNewBrand ? <CircularProgress size={16} /> : "CRIAR"}
                </Button>
              </Box>
            )}

            <TextField
              fullWidth label="Descrição" name="description"
              value={form.description} onChange={handleChange}
              multiline rows={3} size="small"
            />
          </Box>
        ) : (
          <Typography sx={{ textAlign: 'center', py: 2 }}>Carregando...</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCloseLocal} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button 
          onClick={handleSave} variant="contained" disabled={loading}
          sx={{ backgroundColor: '#A31515', fontWeight: 700, '&:hover': { backgroundColor: '#7c0f0f' } }} 
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}