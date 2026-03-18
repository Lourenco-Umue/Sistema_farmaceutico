
import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Plus, X, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { MovementType, Medication } from '../../types';
import './Movimentos.css';

interface MovimentoDB {
  id: number;
  medication_name: string;
  tipo: MovementType;
  quantidade: number;
  referencia: string;
  operator_name: string;
  data_movimento: string;
}

interface MovimentosProps {
  userRole?: string;
  userId?: number;
  globalSearch?: string;
}

const Movimentos: React.FC<MovimentosProps> = ({ userRole, userId, globalSearch = '' }) => {
  const [movimentos, setMovimentos] = useState<MovimentoDB[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    medicamento_id: '',
    tipo: 'SAÍDA',
    quantidade: '',
    referencia: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMov, resMeds] = await Promise.all([
        fetch('http://localhost/farmacia-backend/movimentacoes.php'),
        fetch('http://localhost/farmacia-backend/medicamentos.php')
      ]);
      const dataMov = await resMov.json();
      const dataMeds = await resMeds.json();
      setMovimentos(Array.isArray(dataMov) ? dataMov : []);
      setMeds(Array.isArray(dataMeds) ? dataMeds : []);
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
    setErrorMsg('');
    if (!formData.medicamento_id || !formData.quantidade) return;

    if (formData.tipo === 'SAÍDA') {
      const selectedMed = meds.find(m => m.id === Number(formData.medicamento_id));
      if (selectedMed && selectedMed.quantidade < Number(formData.quantidade)) {
        setErrorMsg('Stock insuficiente para esta saída.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost/farmacia-backend/movimentacoes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantidade: parseInt(formData.quantidade),
          operador_id: userId || 1
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowModal(false);
        setFormData({ medicamento_id: '', tipo: 'SAÍDA', quantidade: '', referencia: '' });
        fetchData();
      } else {
        setErrorMsg(result.error || 'Falha ao registar movimento no servidor.');
      }
    } catch (err) {
      setErrorMsg("Erro de comunicação com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMovimentos = movimentos.filter(m => 
    m.medication_name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    m.referencia?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    m.operator_name?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const stats = movimentos.reduce((acc, curr) => {
    if (curr.tipo === 'ENTRADA') acc.entradas += Number(curr.quantidade);
    else acc.saidas += Number(curr.quantidade);
    return acc;
  }, { entradas: 0, saidas: 0 });

  if (loading && movimentos.length === 0) {
    return (
      <div className="loading-mov">
        <Loader2 className="animate-spin" size={32} />
        <span>A carregar logs...</span>
      </div>
    );
  }

  return (
    <div className="movimentos-container">
      <div className="movimentos-header">
        <div>
          <h3>Controlo de Fluxo</h3>
          <p>Gestão de entradas e saídas de stock</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setErrorMsg(''); }}
          className="btn-new-guia"
        >
          <Plus size={14} /> Nova Guia
        </button>
      </div>

      <div className="mov-stats-grid">
        <div className="mov-stat-card">
          <div>
            <span className="mov-stat-label blue">Total Entradas</span>
            <h4 className="mov-stat-value">{stats.entradas}</h4>
          </div>
          <div className="mov-stat-icon blue"><ArrowUpCircle size={24} /></div>
        </div>
        <div className="mov-stat-card">
          <div>
            <span className="mov-stat-label slate">Total Saídas</span>
            <h4 className="mov-stat-value">{stats.saidas}</h4>
          </div>
          <div className="mov-stat-icon slate"><ArrowDownCircle size={24} /></div>
        </div>
      </div>

      <div className="mov-table-wrapper">
        <table className="mov-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Designação do Item</th>
              <th className="text-center">Qtd</th>
              <th>Referência</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovimentos.length > 0 ? filteredMovimentos.map(m => (
              <tr key={m.id}>
                <td>
                  <span className={`type-badge ${m.tipo === 'ENTRADA' ? 'entrada' : 'saida'}`}>
                    {m.tipo}
                  </span>
                </td>
                <td className="med-name-cell">{m.medication_name}</td>
                <td className="qtd-cell">{m.quantidade}</td>
                <td className="ref-cell">{m.referencia || '---'}</td>
                <td className="date-cell">
                   <Calendar size={10} /> {new Date(m.data_movimento).toLocaleString('pt-PT')}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="empty-mov">Nenhum registo encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Nova Guia de Operação</h4>
              <button onClick={() => setShowModal(false)} className="btn-close"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {errorMsg && (
                <div className="error-alert">
                  <AlertCircle size={14} /> {errorMsg}
                </div>
              )}
              <div className="form-group">
                <label>Medicamento</label>
                <select 
                  required 
                  className="form-control"
                  value={formData.medicamento_id}
                  onChange={e => setFormData({...formData, medicamento_id: e.target.value})}
                >
                  <option value="">Selecionar item em stock...</option>
                  {meds.map(med => (
                    <option key={med.id} value={med.id}>{med.nome} (Stock: {med.quantidade})</option>
                  ))}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Operação</label>
                  <select 
                    className="form-control"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="SAÍDA">Saída (Venda/Dispensa)</option>
                    <option value="ENTRADA">Entrada (Abastecimento)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantidade</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    className="form-control"
                    placeholder="0"
                    value={formData.quantidade}
                    onChange={e => setFormData({...formData, quantidade: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Referência (Guia/Fatura)</label>
                <input 
                  className="form-control"
                  placeholder="Ex: NF-2024-001"
                  value={formData.referencia}
                  onChange={e => setFormData({...formData, referencia: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-submit"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Lançamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movimentos;
