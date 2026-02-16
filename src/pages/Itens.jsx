import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Checkbox,
  Chip,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import HeaderPrincipal from "../components/layout/HeaderPrincipal";
import Footer from "../components/layout/Footer";
import api from "../services/axios";
import { formatDateTimeBR } from "../utils/dateUtils";
import ModalDescription from "../components/mod/ModalDescription";
import AddItemModal from "../components/mod/AddItemModal";
import CustomModal from "../components/mod/CustomModal";
import QuantityModal from "../components/mod/QuantityModal";
import EditItemModal from "../components/mod/EditItemModal";

function Itens() {
  const [search, setSearch] = useState("");
  const [itens, setItens] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para Edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);

  // Estados para Descrição/Filtros
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");

  // Modal para ações de quantidade
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedForQuantity, setSelectedForQuantity] = useState(null);

  // --- Funções de Abertura ---
  const openEditModal = (item) => {
    setSelectedForEdit(item);
    setEditModalOpen(true);
  };

  const openQuantityModal = (item) => {
    setSelectedForQuantity(item);
    setQuantityModalOpen(true);
  };

  const fetchBrands = async () => {
    try {
      const res = await api.getBrands();
      const data = res.data?.data || res.data?.brands || res.data || [];
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar marcas", err);
      setBrands([]);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const searchTerm = search?.trim();
      const hasBrandFilter = selectedBrands && selectedBrands.length > 0;

      let response;
      if (searchTerm || hasBrandFilter) {
        const brandsPayload = hasBrandFilter
          ? selectedBrands.map((b) => b.brand || b.name || b.value || b.brandValue)
          : undefined;

        const payload = {};
        if (brandsPayload) payload.brand = brandsPayload;
        if (searchTerm) payload.description = searchTerm;

        response = await (api.filterItems ? api.filterItems(payload) : api.filterItens(payload));
      } else {
        response = await api.getItems();
      }

      const itensList = response.data?.data || response.data?.items || response.data || [];
      setItens(Array.isArray(itensList) ? itensList : []);
      setErrorMessage(itensList.length === 0 ? "Nenhum item encontrado." : "");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Erro ao carregar os itens.");
      setItens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Itens";
    handleFilter();
    fetchBrands();
  }, [search, selectedBrands]);

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      const key = brand.brand || brand.name || brand.value || brand.brandValue;
      const exists = prev.some((b) => (b.brand || b.name || b.value || b.brandValue) === key);
      return exists 
        ? prev.filter((b) => (b.brand || b.name || b.value || b.brandValue) !== key)
        : [...prev, brand];
    });
  };

  return (
    <Box sx={styles.pageContainer}>
      <HeaderPrincipal />
      <Box sx={{ ...styles.content, overflowY: "auto", maxHeight: "calc(100vh - 150px)" }}>
        <Typography variant="h4" gutterBottom sx={styles.headerTitle}>Itens</Typography>
        
        {/* Filtro Principal */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 1000, mx: "auto", p: 1 }}>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#a31515" }}>
            <MenuIcon />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Filtro de descrição ex: civic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ borderRadius: 20, backgroundColor: "#fff", "& fieldset": { border: "none" } }}
          />
        </Box>

        {/* Listagem */}
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
              <CircularProgress color="error" />
            </Box>
          ) : (
            <List>
              {itens.map((item, idx) => (
                <ListItem key={item.idItem ?? idx} divider>
                  <ListItemText
                    primary={`${item.brand || item.name || "Item"} — ${item.description || ""}`}
                    secondary={`Quantidade: ${item.currentQuantity ?? "—"} • Atualizado: ${item.lastUpdated ? formatDateTimeBR(item.lastUpdated) : "—"}`}
                  />
                  <ListItemSecondaryAction sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {/* Botão Editar */}
                    <IconButton size="small" onClick={() => openEditModal(item)} sx={{ color: "#A31515" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {/* Botão Ação */}
                    <Button variant="contained" size="small" color="error" onClick={() => openQuantityModal(item)}>
                      Ação
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
      <Footer />

      {/* --- RENDERIZAÇÃO DOS MODAIS (IMPORTANTE) --- */}
      
      <EditItemModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={selectedForEdit}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          handleFilter();
        }}
        onError={(msg) => setErrorModalMessage(msg)}
      />

      <QuantityModal
        open={quantityModalOpen}
        onClose={() => setQuantityModalOpen(false)}
        item={selectedForQuantity}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          handleFilter();
        }}
        onError={(msg) => setErrorModalMessage(msg)}
      />

      <ModalDescription
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        itemId={selectedItem}
        onSuccess={(msg) => setSuccessMessage(msg)}
        onError={(msg) => setErrorModalMessage(msg)}
        onItemDeleteSuccess={() => handleFilter()}
      />

      <AddItemModal
        open={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        onSuccess={() => {
          handleFilter();
          fetchBrands();
        }}
      />

      {/* Mensagens de Feedback */}
      {successMessage && (
        <CustomModal open={!!successMessage} onClose={() => setSuccessMessage("")} title="Sucesso" message={successMessage} type="success" />
      )}
      {errorModalMessage && (
        <CustomModal open={!!errorModalMessage} onClose={() => setErrorModalMessage("")} title="Erro" message={errorModalMessage} type="error" />
      )}

      {/* Drawer Lateral */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { backgroundColor: "#a31515", color: "#fff", width: 260, p: 2 } }}>
        <Typography sx={{ p: 2, fontWeight: "bold" }}>Marcas</Typography>
        <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
          {brands.map((b, i) => (
            <ListItem key={i} button onClick={() => handleToggleBrand(b)}>
              <ListItemText primary={b.brand || b.name || "—"} sx={{ color: "#fff" }} />
              <Checkbox
                checked={selectedBrands.some((sb) => (sb.brand || sb.name) === (b.brand || b.name))}
                sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" } }}
              />
            </ListItem>
          ))}
          <ListItem button onClick={() => { setDrawerOpen(false); setModalAddOpen(true); }}>
            <ListItemText primary="+ Adicionar Item" sx={{ fontWeight: "bold", color: "#fff" }} />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}

export default Itens;

const styles = {
  senaiRed: "#A31515",
  pageContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#E4E4E4" },
  content: { flex: 1, p: { xs: 2, md: 3 } },
  headerTitle: { textAlign: "center", mb: 4 },
};