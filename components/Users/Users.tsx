
import React, { useState, useEffect } from 'react';
import { Shield, User as UserIcon, Loader2, X, Plus, Trash2 } from 'lucide-react';
import './Users.css';

interface SystemUser {
  id: number;
  nome_completo: string;
  username: string;
  cargo: string;
  data_criacao: string;
}

interface UsersListProps {
  globalSearch?: string;
}

const UsersList: React.FC<UsersListProps> = ({ globalSearch = '' }) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    username: '',
    senha: '',
    cargo: 'OPERADOR'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/farmacia-backend/usuarios.php');
      const data = await res.json();
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/farmacia-backend/usuarios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowModal(false);
        fetchUsers();
        setFormData({ nome_completo: '', username: '', senha: '', cargo: 'OPERADOR' });
      }
    } catch (err) { alert("Erro ao salvar"); }
  };

  const filteredUsers = users.filter(u => 
    u.nome_completo?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  if (loading) return (
    <div className="loading-users">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h3>Utilizadores</h3>
          <p>Gestão de credenciais e permissões.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-new-user"
        >
          <Plus size={16} /> NOVO UTILIZADOR
        </button>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nome do Utilizador</th>
              <th>Username</th>
              <th>Cargo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      <UserIcon size={14} />
                    </div>
                    <div className="user-fullname">{u.nome_completo}</div>
                  </div>
                </td>
                <td className="username-cell">@{u.username}</td>
                <td>
                  <span className={`role-badge ${u.cargo === 'ADMIN' ? 'admin' : 'operador'}`}>
                    <Shield size={10} /> {u.cargo === 'ADMIN' ? 'Administrador' : 'Operador'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="empty-users">Nenhum utilizador encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Registar Utilizador</h4>
              <button onClick={() => setShowModal(false)} className="btn-close"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nome Completo</label>
                <input required className="form-control" value={formData.nome_completo} onChange={e => setFormData({...formData, nome_completo: e.target.value})} />
              </div>
              <div className="grid-2">
                 <div className="form-group">
                   <label>Username</label>
                   <input required className="form-control" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                 </div>
                 <div className="form-group">
                   <label>Cargo</label>
                   <select className="form-control" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})}>
                     <option value="OPERADOR">Operador</option>
                     <option value="ADMIN">Administrador</option>
                   </select>
                 </div>
              </div>
              <div className="form-group">
                <label>Palavra-passe</label>
                <input required type="password" className="form-control" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
              </div>
              <button type="submit" className="btn-submit">Criar Conta</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
