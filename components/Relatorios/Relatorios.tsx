
import React, { useState, useEffect } from 'react';
import { FileText, Printer, Loader2, Calendar, Activity } from 'lucide-react';
import './Relatorios.css';

interface RelatoriosProps {
  userRole?: string;
  globalSearch?: string;
}

const Relatorios: React.FC<RelatoriosProps> = ({ userRole, globalSearch = '' }) => {
  const [reportType, setReportType] = useState<'stock' | 'movimentos'>('stock');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (type: 'stock' | 'movimentos') => {
    setLoading(true);
    try {
      const endpoint = type === 'stock' ? 'medicamentos.php' : 'movimentacoes.php';
      const res = await fetch(`http://localhost/farmacia-backend/${endpoint}`);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(reportType);
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleString('pt-PT', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const filteredData = data.filter((item: any) => {
    const search = globalSearch.toLowerCase();
    if (reportType === 'stock') {
      return (
        item.nome?.toLowerCase().includes(search) ||
        item.lote?.toLowerCase().includes(search) ||
        item.categoria?.toLowerCase().includes(search)
      );
    } else {
      return (
        item.medication_name?.toLowerCase().includes(search) ||
        item.referencia?.toLowerCase().includes(search) ||
        item.operator_name?.toLowerCase().includes(search)
      );
    }
  });

  return (
    <div className="relatorios-container">
      
      {/* Controlos (Ocultos na impressão) */}
      <div className="controls-card print-hidden">
        <div className="report-info">
          <div className="report-icon-wrapper">
            <FileText size={20} />
          </div>
          <div>
            <h3>Gerador de PDF</h3>
            <p>Selecione o tipo de documento</p>
          </div>
        </div>

        <div className="actions-wrapper">
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'stock' | 'movimentos')}
            className="report-select"
          >
            <option value="stock">Posição Geral de Stock</option>
            <option value="movimentos">Histórico de Movimentações</option>
          </select>

          <button 
            onClick={handlePrint}
            disabled={loading || data.length === 0}
            className="btn-print"
          >
            <Printer size={16} /> 
            <span>Guardar PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-report print-hidden">
          <Loader2 className="animate-spin" size={32} />
          <span>A gerar dados do relatório...</span>
        </div>
      ) : (
        /* Área do Documento para Impressão */
        <div className="document-card">
          
          {/* Cabeçalho do Documento PDF */}
          <div className="document-header">
             <div className="print-logo">
                <Activity size={24} />
                <span className="font-bold" style={{ fontSize: '1.125rem', letterSpacing: '-0.025em' }}>Vida Saudável</span>
             </div>
             
             <h2 className="document-title">Relatório Oficial</h2>
             <h3 className="document-subtitle">
               {reportType === 'stock' ? 'Posição Geral de Stock' : 'Histórico Completo de Movimentações'}
             </h3>
             <div className="document-meta">
               <Calendar size={12} /> Emitido a: {currentDate}
             </div>
          </div>

          {/* Tabelas de Dados */}
          <div className="document-body">
            {reportType === 'stock' && (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Código / Lote</th>
                    <th>Designação</th>
                    <th>Categoria</th>
                    <th className="text-center">Qtd Atual</th>
                    <th className="text-right">Validade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">{item.lote}</td>
                      <td className="font-bold">{item.nome}</td>
                      <td>{item.categoria}</td>
                      <td className="text-center font-bold">
                        {item.quantidade} <span className="unit-label">un</span>
                      </td>
                      <td className="text-right font-mono text-xs">
                        {new Date(item.data_validade).toLocaleDateString('pt-PT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'movimentos' && (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Tipo</th>
                    <th>Medicamento</th>
                    <th className="text-center">Qtd</th>
                    <th className="text-right">Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">
                        {new Date(item.data_movimento).toLocaleString('pt-PT')}
                      </td>
                      <td className="font-bold">
                        {item.tipo}
                      </td>
                      <td>{item.medication_name}</td>
                      <td className="text-center font-bold">{item.quantidade}</td>
                      <td className="text-right text-xs" style={{ textTransform: 'uppercase' }}>{item.operator_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredData.length === 0 && !loading && (
              <div className="empty-report">
                Não existem registos para apresentar.
              </div>
            )}
          </div>

          {/* Rodapé da Impressão */}
          <div className="print-footer">
            Documento gerado automaticamente pelo Sistema SGF Vida Saudável.<br/>
            Página 1 de 1
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
