
import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Loader2, X, Search } from 'lucide-react';
import { Supplier } from '../../types';
import './Stock.css';

interface StockProps {
  userRole?: string;
  globalSearch?: string;
}

const CATEGORIES = ["Antibióticos", "Analgésicos", "Vitaminas", "Anti-inflamatórios", "Outros"];

const Stock: React.FC<StockProps> = ({ userRole, globalSearch = '' }) => {
  const [meds, setMeds] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: CATEGORIES[0],
    lote: '',
    quantidade: '0',
    quantidade_minima: '5',
    preco_venda: '',
    data_validade: '',
    fornecedor_id: ''
  });

  const isAdmin = userRole === 'ADMIN';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMeds, resSupps] = await Promise.all([
        fetch('http://localhost/farmacia-backend/medicamentos.php'),
        fetch('http://localhost/farmacia-backend/fornecedores.php')
      ]);
      const dataMeds = await resMeds.json();
      const dataSupps = await resSupps.json();
      setMeds(Array.isArray(dataMeds) ? dataMeds : []);
      setSuppliers(Array.isArray(dataSupps) ? dataSupps : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost/farmacia-backend/medicamentos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowModal(false);
        setFormData({
            nome: '', categoria: CATEGORIES[0], lote: '', quantidade: '0',
            quantidade_minima: '5', preco_venda: '', data_validade: '', fornecedor_id: ''
        });
        fetchData();
      }
    } catch (err) {
      alert("Erro ao gravar medicamento");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMeds = meds.filter(m => 
    m.nome?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    m.lote?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    m.categoria?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  if (loading && meds.length === 0) return (
    <div className="loading-state">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="stock-container">
      <div className="stock-header">
        <div className="stock-title">
          <h3>Inventário de Medicamentos</h3>
          <p>Gestão de stock e validades</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-new">
            <Plus size={14} /> NOVO ITEM
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th className="text-center">Stock</th>
              <th>Preço</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredMeds.length > 0 ? filteredMeds.map(med => (
              <tr key={med.id}>
                <td className="med-name">
                  {med.nome}
                  <div className="med-lote">#{med.lote}</div>
                </td>
                <td>{med.categoria}</td>
                <td className="text-center font-bold">{med.quantidade}</td>
                <td className="price-cell">{med.preco_venda} Kz</td>
                <td>
                  <span className={`status-badge ${Number(med.quantidade) <= Number(med.quantidade_minima) ? 'critical' : 'ok'}`}>
                    {Number(med.quantidade) <= Number(med.quantidade_minima) ? 'Crítico' : 'Ok'}
                  </span>
                </td>
                <td className="text-right">
                  {isAdmin && <button className="btn-edit"><Edit2 size={12}/></button>}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="empty-state">Nenhum resultado encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Novo Medicamento</h4>
              <button onClick={() => setShowModal(false)} className="btn-close"><X size={16}/></button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome Comercial</label>
                <input required className="form-control" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Categoria</label>
                  <select className="form-control" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Preço Venda (Kz)</label>
                  <input required type="number" className="form-control" value={formData.preco_venda} onChange={e => setFormData({...formData, preco_venda: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Lote</label>
                  <input required className="form-control" value={formData.lote} onChange={e => setFormData({...formData, lote: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Validade</label>
                  <input required type="date" className="form-control" value={formData.data_validade} onChange={e => setFormData({...formData, data_validade: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Stock Inicial</label>
                  <input type="number" className="form-control" value={formData.quantidade} onChange={e => setFormData({...formData, quantidade: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fornecedor</label>
                  <select className="form-control" value={formData.fornecedor_id} onChange={e => setFormData({...formData, fornecedor_id: e.target.value})} >
                    <option value="">Nenhum...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-save" >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'GUARDAR DADOS'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
