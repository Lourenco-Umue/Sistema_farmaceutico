
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  AlertTriangle, 
  Truck, 
  Users as UsersIcon,
  LogOut, 
  Search,
  Activity,
  FileText
} from 'lucide-react';
import Dashboard from './components/Dashboard/Dashboard';
import Stock from './components/Stock/Stock';
import Movimentos from './components/Movimentos/Movimentos';
import Alerts from './components/Alerts/Alerts';
import Login from './components/Login/Login';
import Fornecedores from './components/Fornecedores/Fornecedores';
import UsersList from './components/Users/Users';
import Relatorios from './components/Relatorios/Relatorios';
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'movimentos' | 'alerts' | 'fornecedores' | 'users' | 'relatorios'>('dashboard');
  const [user, setUser] = useState<{ id: number; name: string; role: 'ADMIN' | 'OPERADOR' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = (id: number, username: string, role: string) => {
    setIsAuthenticated(true);
    const userRole = (role.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'OPERADOR') as 'ADMIN' | 'OPERADOR';
    setUser({ id, name: username, role: userRole });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
    setSearchTerm('');
  };

  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user.role === 'ADMIN';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard userRole={user.role} setActiveTab={setActiveTab} globalSearch={searchTerm} />;
      case 'stock': return <Stock userRole={user.role} globalSearch={searchTerm} />;
      case 'movimentos': return <Movimentos userRole={user.role} userId={user.id} globalSearch={searchTerm} />;
      case 'alerts': return <Alerts />;
      case 'fornecedores': return isAdmin ? <Fornecedores globalSearch={searchTerm} /> : <Dashboard userRole={user.role} setActiveTab={setActiveTab} globalSearch={searchTerm} />;
      case 'users': return isAdmin ? <UsersList globalSearch={searchTerm} /> : <Dashboard userRole={user.role} setActiveTab={setActiveTab} globalSearch={searchTerm} />;
      case 'relatorios': return <Relatorios userRole={user.role} globalSearch={searchTerm} />;
      default: return <Dashboard userRole={user.role} setActiveTab={setActiveTab} globalSearch={searchTerm} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Painel de Controle';
      case 'stock': return 'Gestão de Inventário';
      case 'movimentos': return 'Fluxo de Movimentações';
      case 'alerts': return 'Alertas de Sistema';
      case 'fornecedores': return 'Registo de Fornecedores';
      case 'users': return 'Gestão de Utilizadores';
      case 'relatorios': return 'Emissão de Relatórios (PDF)';
      default: return 'Sistema';
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar" role="navigation">
        <div className="sidebar-header">
          <div className="logo-wrapper">
             <Activity size={18} />
          </div>
          <h1>Vida Saudável</h1>
        </div>

        <nav className="sidebar-nav">
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); }} icon={<LayoutDashboard size={18}/>} label="Início" />
          <NavItem active={activeTab === 'stock'} onClick={() => { setActiveTab('stock'); }} icon={<Package size={18}/>} label="Stock" />
          {isAdmin && <NavItem active={activeTab === 'fornecedores'} onClick={() => { setActiveTab('fornecedores'); }} icon={<Truck size={18}/>} label="Fornecedores" />}
          {isAdmin && <NavItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); }} icon={<UsersIcon size={18}/>} label="Utilizadores" />}
          <NavItem active={activeTab === 'movimentos'} onClick={() => { setActiveTab('movimentos'); }} icon={<ArrowLeftRight size={18}/>} label="Movimentações" />
          <NavItem active={activeTab === 'alerts'} onClick={() => { setActiveTab('alerts'); }} icon={<AlertTriangle size={18}/>} label="Alertas" />
          <NavItem active={activeTab === 'relatorios'} onClick={() => { setActiveTab('relatorios'); }} icon={<FileText size={18}/>} label="Relatórios (PDF)" />
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{isAdmin ? 'Administrador' : 'Operador'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={14} /> <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h2>{getTitle()}</h2>
          <div className="header-actions">
            <div className="search-wrapper">
              <Search className="search-icon" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisa rápida..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="server-status">
               <div className="status-dot"></div>
               <span className="status-text">Servidor Ativo</span>
            </div>
          </div>
        </header>

        <section className="content-area">
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
