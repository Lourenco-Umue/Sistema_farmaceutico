
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Mail, Phone, Loader2, X } from 'lucide-react';
import { Supplier } from '../../types';
import './Fornecedores.css';

interface FornecedoresProps {
  globalSearch?: string;
}

const Fornecedores: React.FC<FornecedoresProps> = ({ globalSearch = '' }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nome: '', contacto: '', email: '', endereco: '' });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/farmacia-backend/fornecedores.php');
      const data = await res.json();
      setSuppliers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/farmacia-backend/fornecedores.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowModal(false);
        fetchSuppliers();
        setFormData({ nome: '', contacto: '', email: '', endereco: '' });
      }
    } catch (err) { alert("Erro ao salvar"); }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.nome?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    s.contacto?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  if (loading) return (
    <div className="loading-fornecedores">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="fornecedores-container">
      <div className="fornecedores-header">
        <div>
          <h3>Fornecedores</h3>
          <p>Entidades parceiras de abastecimento.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-new-fornecedor">
          <Plus size={16} /> NOVO FORNECEDOR
        </button>
      </div>

      <div className="fornecedores-grid">
        {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
          <div key={s.id} className="fornecedor-card">
            <div className="card-header">
              <div className="icon-wrapper"><Truck size={20} /></div>
              <h4>{s.nome}</h4>
            </div>
            <div className="card-body">
              <div className="info-item">
                <Mail size={14} className="info-icon" /> {s.email}
              </div>
              <div className="info-item">
                <Phone size={14} className="info-icon" /> {s.contacto}
              </div>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <p>Nenhum fornecedor encontrado</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Novo Fornecedor</h4>
              <button onClick={() => setShowModal(false)} className="btn-close"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nome da Empresa</label>
                <input required className="form-control" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="grid-2">
                 <div className="form-group">
                   <label>Contacto</label>
                   <input className="form-control" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} />
                 </div>
                 <div className="form-group">
                   <label>Email</label>
                   <input className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
              </div>
              <button type="submit" className="btn-submit">CONFIRMAR REGISTO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fornecedores;
