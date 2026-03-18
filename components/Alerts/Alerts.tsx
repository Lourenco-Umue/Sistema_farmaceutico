
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, Loader2 } from 'lucide-react';
import './Alerts.css';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost/farmacia-backend/alerts.php')
      .then(res => res.json())
      .then(json => {
        setAlerts(json);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="loading-alerts">
      <Loader2 className="animate-spin text-blue-600" />
    </div>
  );

  const hasAlerts = alerts.lowStock.length > 0 || alerts.expiring.length > 0;

  return (
    <div className="alerts-container">
      <div className="alerts-header">
         <ShieldAlert size={18} className="text-slate-800" />
         <h3>Painel de Monitorização</h3>
      </div>

      <div className="alerts-list">
        {alerts.lowStock.map((a: any, i: number) => (
          <AlertItem 
            key={i} 
            title={a.nome} 
            info={`Stock Crítico: Restam apenas ${a.quantidade} unidades.`} 
            severity="Medium" 
          />
        ))}

        {alerts.expiring.map((a: any, i: number) => (
          <AlertItem 
            key={i} 
            title={a.nome} 
            info={`Validade próxima: ${new Date(a.data_validade).toLocaleDateString('pt-PT')}`} 
            severity="Critical" 
          />
        ))}

        {!hasAlerts && (
          <div className="empty-alerts">
            <p>Nenhum alerta pendente</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AlertItem = ({ title, info, severity }: any) => (
  <div className={`alert-item ${severity.toLowerCase()}`}>
    <div className="alert-item-left">
      <div className={`alert-icon-wrapper ${severity.toLowerCase()}`}>
         <AlertTriangle size={16} />
      </div>
      <div className="alert-content">
        <p className="alert-title">{title}</p>
        <p className="alert-info">
          <Clock size={10} /> {info}
        </p>
      </div>
    </div>
    <span className={`severity-badge ${severity.toLowerCase()}`}>
      {severity}
    </span>
  </div>
);

export default Alerts;
