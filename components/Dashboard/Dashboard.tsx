
import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Clock, ArrowLeftRight, Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './Dashboard.css';

interface DashboardProps {
  setActiveTab: (tab: 'dashboard' | 'stock' | 'movimentos' | 'alerts' | 'fornecedores' | 'users' | 'relatorios') => void;
  userRole?: string;
  globalSearch?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, userRole, globalSearch = '' }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost/farmacia-backend/dashboard.php')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return (
    <div className="loading-container">
      <Loader2 className="animate-spin" />
    </div>
  );

  const stats = data.stats;
  const chartData = data.chartData || [
    { name: 'Seg', antibioticos: 10, analgesicos: 8, vitaminicos: 12, outros: 2 },
    { name: 'Ter', antibioticos: 17, analgesicos: 14, vitaminicos: 15, outros: 3 },
    { name: 'Qua', antibioticos: 16, analgesicos: 23, vitaminicos: 22, outros: 4 },
    { name: 'Qui', antibioticos: 18, analgesicos: 9, vitaminicos: 7, outros: 5 },
    { name: 'Sex', antibioticos: 31, analgesicos: 72, vitaminicos: 30, outros: 1 },
  ];

  const donutData = [
    { name: 'Analgésicos', value: 22, color: '#2563eb' },
    { name: 'Outros', value: 6, color: '#3b82f6' },
  ];

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <StatCard title="Stock Total" value={stats.total_items} icon={<Package size={18}/>} color="blue" />
        <StatCard title="Rupturas" value={stats.rupturas} icon={<AlertCircle size={18}/>} color="amber" />
        <StatCard title="Prox. Validade" value={stats.validade_critica} icon={<Clock size={18}/>} color="red" />
        <StatCard title="Movs. Hoje" value={stats.movimentos_hoje} icon={<ArrowLeftRight size={18}/>} color="blue" />
      </div>

      <div className="dashboard-layout">
        <div className="main-chart-section">
          <div className="activity-card">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    ticks={[0, 35, 70, 105, 140]}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="antibioticos" name="Antibióticos" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} barSize={50} />
                  <Bar dataKey="analgesicos" name="Analgésicos" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="vitaminicos" name="Vitamínicos" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="outros" name="Outros" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="summary-table-container">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>DIA</th>
                    <th>ANTIBIÓTICOS</th>
                    <th>ANALGÉSICOS</th>
                    <th>VITAMÍNICOS</th>
                    <th>OUTROS</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.name}</td>
                      <td className="text-blue">{row.antibioticos}</td>
                      <td className="text-blue">{row.analgesicos}</td>
                      <td className="text-blue">{row.vitaminicos}</td>
                      <td>{row.outros}</td>
                      <td className="font-bold">{row.antibioticos + row.analgesicos + row.vitaminicos + row.outros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="side-chart-section">
          <div className="activity-card donut-card">
            <div className="donut-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="donut-legend">
              {donutData.map((item, idx) => (
                <div key={idx} className="donut-legend-item">
                  <div className="legend-label">
                    <span className="dot" style={{ backgroundColor: item.color }}></span>
                    <span className="label-text">{item.name}</span>
                  </div>
                  <span className="value-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: any, icon: React.ReactNode, color: string }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default Dashboard;
