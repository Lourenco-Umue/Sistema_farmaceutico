
import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLogin: (id: number, username: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost/farmacia-backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user.id, data.user.nome_completo, data.user.cargo);
      } else {
        setError(data.message || 'Acesso negado.');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Lock size={20} />
          </div>
          <h1 className="login-title">Vida Saudável</h1>
          <p className="login-subtitle">Controlo de Acesso</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Utilizador</label>
            <input 
              type="text" 
              required
              autoComplete="username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required
              autoComplete="current-password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <>Entrar <ArrowRight size={14} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
