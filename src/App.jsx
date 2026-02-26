
import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import QRCode from 'qrcode';

const TABS = [
  'Sobre',
  'Atualizações',
  'Quem ajudou',
  'Vakinha Premiada',
  'Selos recebidos',
];


export default function App() {
  const [tab, setTab] = useState('Sobre');
  const [showContribuir, setShowContribuir] = useState(false);

  React.useEffect(() => {
    const check = () => setShowContribuir(window.location.hash === '#/contribuir');
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  return (
    <div className="vakinha-bg">
      <Header />
      <div className="vakinha-main">
        <div className="vakinha-col-left">
          <div className="vakinha-img-box">
            <img
              src="/src/assets/imagem1.webp"
              alt="Vakinha dos Bastiões - enchente"
              className="vakinha-banner-img"
            />
          </div>
          <div className="vakinha-content-box">
            <span className="vakinha-cat">CASA / MORADIA</span>
            <h1 className="vakinha-title">Vakinha dos Bastiões</h1>
            <span className="vakinha-id">ID: 654124</span>
            <ResumoSobre onVerTudo={() => setTab('Sobre')} />
            <nav className="vakinha-tabs-inner">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={tab === t ? 'vakinha-tab-inner active' : 'vakinha-tab-inner'}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>
            <main className="tab-content vakinha-tab-content">
              {tab === 'Sobre' && <Sobre />}
              {tab === 'Atualizações' && <Atualizacoes />}
              {tab === 'Quem ajudou' && <QuemAjudou />}
              {tab === 'Vakinha Premiada' && <VakinhaPremiada />}
              {tab === 'Selos recebidos' && <SelosRecebidos />}
            </main>
          </div>
        </div>
        <div className="vakinha-col-right">
            <div className="vakinha-arrecadado-box vakinha-arrecadado-box-ref">
            <div className="vakinha-arrecadado-label vakinha-arrecadado-label-ref">Arrecadado</div>
            <div className="vakinha-arrecadado-valor vakinha-arrecadado-valor-ref">R$ 100.535,82</div>
            <div className="vakinha-arrecadado-meta vakinha-arrecadado-meta-ref">de R$ 1.000.000,00</div>
            <button className="vakinha-btn-ajudar-ref" onClick={() => { window.location.hash = '#/contribuir'; setShowContribuir(true); }}>Quero Ajudar</button>
            <button className="vakinha-btn-compartilhar-ref">Compartilhar</button>
            <div className="vakinha-protegida-ref">
              <span className="vakinha-protegida-escudo">
                <img src="/src/assets/7026241.png" alt="Escudo Protegido" className="vakinha-protegida-escudo-img" />
              </span>
              <span className="vakinha-protegida-text">DOAÇÃO PROTEGIDA</span>
            </div>
          </div>
        </div>
      </div>
      {/* Removido nav externo, agora as abas estão dentro do card branco */}
      <footer className="vakinha-footer">
        <span>© 2026 Vakinha dos Bastiões</span>
      </footer>

      {showContribuir && (
        <ContribuirModal onClose={() => { window.location.hash = ''; setShowContribuir(false); }} />
      )}
    </div>
  );
}

function ContribuirModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showThanks, setShowThanks] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const minimum = 12;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const numeric = parseFloat(String(amount).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    if (numeric < minimum) {
      setError(`Valor mínimo de R$ ${minimum},00`);
      return;
    }

    // Prepare payload for PodPay
    setLoading(true);
    try {
      // Call serverless endpoint (Vercel) which will forward to PodPay using server-side secret
      const payload = {
        amount: Math.round(numeric * 100),
        paymentMethod: 'pix',
        customer: {
          name: name || 'Doador',
          email: email || undefined,
          cpf: cpf || undefined,
        },
      };

      const resp = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || JSON.stringify(data));
      } else {
        setResult(data);
        // gerar QR Code data URL a partir do payload Pix, se disponível
        if (data && data.pix && data.pix.qrcode) {
          try {
            const url = await QRCode.toDataURL(data.pix.qrcode);
            setQrDataUrl(url);
          } catch (err) {
            console.warn('QR generation failed', err);
            setQrDataUrl(null);
          }
        } else {
          setQrDataUrl(null);
        }
        setShowThanks(true);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contribuir-overlay">
      <div className="contribuir-modal">
        <div className="contribuir-header">
          <h3>Contribuir (Pix)</h3>
          <button className="contribuir-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <form className="contribuir-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome completo</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" />
          </div>

          <div className="field">
            <label>E-mail</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@exemplo.com" />
          </div>

          <div className="field">
            <label>CPF</label>
            <input value={cpf} onChange={e=>setCpf(e.target.value)} placeholder="000.000.000-00" />
          </div>

          <div className="field">
            <label>Valor (R$) — mínimo R$12,00</label>
            <div className="valor-wrap">
              <span className={`prefix ${(amount || amountFocused) ? 'visible' : ''}`}>R$</span>
              <input
                className="input-valor"
                value={amount}
                onChange={e=>setAmount(e.target.value)}
                placeholder="12.00"
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
              />
            </div>
          </div>

          <div className="field">
            <label>Método de pagamento</label>
            <div className="only-pix">Pix</div>
          </div>

          {error && <div className="contribuir-error">{error}</div>}

          {result && showThanks && (
            <div className="thanks-modal">
              <h4>Obrigado — você está ajudando muito</h4>
              <p>Sua contribuição faz diferença agora. Com sua doação famílias afetadas pelas enchentes terão abrigo, comida e esperança.</p>

              {qrDataUrl && (
                <div className="thanks-qr">
                  <img src={qrDataUrl} alt="QR Pix" />
                </div>
              )}

              <div className="thanks-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowThanks(false); setResult(null); setQrDataUrl(null); }}>Fechar</button>
                <button type="button" className="btn btn-primary" onClick={() => { navigator.clipboard?.writeText(result?.pix?.qrcode || ''); }}>
                  Copiar código Pix
                </button>
                <button type="button" className="btn" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(result)); }}>
                  Copiar dados do pagamento
                </button>
              </div>

              <pre className="result-json">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="contribuir-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Fechar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Gerando...' : 'Gerar Pix'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


const Sobre = () => (
  <section>
    <div className="vakinha-sobre-box">
      <div className="vakinha-sobre-label"><b>Vaquinha criada em: 24/02/2026</b></div>
      <p>
        Nos últimos dias, a cidade de Ubá (MG) e outras localidades da Zona da Mata mineira foram devastadas por um temporal de proporções históricas. Chuvas intensas e persistentes provocaram enchentes, deslizamentos de terra e o transbordamento de rios, deixando um rastro de destruição por onde passaram.
      </p>
      <p>
        O volume de água foi tão extremo que casas desabaram, pontes foram destruídas, ruas ficaram tomadas pela lama e famílias inteiras perderam tudo o que tinham. Em muitos bairros, moradores ficaram ilhados e sem acesso a serviços básicos.
      </p>
      <p>
        Segundo as autoridades, o desastre deixou várias vítimas fatais, dezenas de desaparecidos e centenas de pessoas desabrigadas, que agora enfrentam um momento de sofrimento profundo.
      </p>
      <p>
        As equipes de resgate e voluntários seguem trabalhando sem parar, mas a necessidade de apoio é enorme, famílias precisam de abrigo, alimentação, roupas, água potável e apoio emocional neste momento tão difícil.
      </p>
      <p>
        Por isso, lançamos a Vakinha dos Bastiões: para que, juntos, possamos ajudar quem perdeu tudo com essa tragédia. Cada contribuição, por menor que seja, fará diferença na vida de quem agora enfrenta um futuro incerto. Seu apoio pode ser o início de reconstrução de muitas histórias.
      </p>
      <p>💛 Doe, compartilhe e ajude a levar esperança a quem mais precisa.</p>
    </div>
  </section>
);

function ResumoSobre({ onVerTudo }) {
  return (
    <div className="vakinha-resumo-sobre">
      <span>
        Nos últimos dias, a cidade de Ubá (MG) e outras localidades da Zona da Mata mineira foram devastadas por um temporal de proporções históricas. Chuvas intensas e persistentes provocaram enchentes, deslizamentos de terra e o transbordamento d{' '}
        <button className="vakinha-ver-tudo" onClick={onVerTudo}>ver tudo</button>
      </span>
    </div>
  );
}

function Atualizacoes() {
  return (
    <section style={{textAlign: 'center', color: '#888', fontSize: '16px', padding: '32px 0'}}>
      Não existem atualizações neste momento.
    </section>
  );
}

function QuemAjudou() {
  return (
    <section>
      <h2>Contribuições</h2>
      <ul className="info-list">
        <li><b>2417</b> pessoas doaram</li>
        <li><b>Promotores do Bem:</b> Compartilhe a vaquinha, traga doações e se torne Promotor do Bem</li>
        <li><b>Corações:</b> Esta vaquinha recebeu 1718 corações no total e já esteve na lista de mais amadas da semana 1 vez</li>
      </ul>
    </section>
  );
}

function VakinhaPremiada() {
  return (
    <section>
      <h2>Vakinha Premiada</h2>
      <ul className="info-list">
        <li>1727 pessoas já doaram e receberam números da sorte <button className="mini-btn">Quero doar e participar</button></li>
        <li>330 doadores turbinaram sua doação e receberam números da sorte extra</li>
        <li>344 pessoas compraram corações para destacar essa vaquinha e receberam números da sorte <button className="mini-btn">Comprar corações</button></li>
        <li>1727 doadores, além de ajudar e concorrer, garantiram números da sorte extra para quem criou a vaquinha</li>
        <li>100 pessoas doaram para essa vaquinha e ainda não resgataram seus números <button className="mini-btn">Verificar números para resgate</button></li>
        <li>0 pessoas já ganharam o prêmio com números gerados nessa vaquinha</li>
      </ul>
    </section>
  );
}

function SelosRecebidos() {
  return (
    <section>
      <h2>Selos recebidos</h2>
      <p>Agora as vaquinhas mais engajadas ganham selos especiais!</p>
      <p>Esta vaquinha ainda não desbloqueou selos, mas cada nova doação, compartilhamento ou coração pode ajudar a conquistá-los!</p>
    </section>
  );
}
