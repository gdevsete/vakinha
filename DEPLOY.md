Deploy no Vercel (passo a passo)

1) Conecte o repositório ao Vercel
- Acesse https://vercel.com e faça login com sua conta (ou crie uma).
- Clique em "New Project" → "Import Git Repository" e cole https://github.com/gdevsete/vakinha
- Siga os passos para importar o projeto.

2) Configure variáveis de ambiente (Project Settings -> Environment Variables)
- PARA O CLIENTE (opcional para dev local somente):
  - VITE_PODPAY_PUBLIC = <sua chave pública de teste>
  - VITE_PODPAY_SECRET = <sua chave secreta de teste>
  (não recomendado em produção)

- PARA O SERVER (obrigatório, NÃO exponha secrets):
  - PODPAY_PUBLIC = <sua chave pública>
  - PODPAY_SECRET = <sua chave secreta>

3) Defina o build command e output
- Framework Preset: `Other` (se Vite for detectado, ok)
- Build Command: `npm run build` (ou `vite build` se preferir)
- Output Directory: `dist`

4) Deploy
- Clique em Deploy. Após o deploy, a função serverless ficará disponível em `/api/create-transaction`.

5) Teste em produção
- Abra o site publicado e clique em `Quero Ajudar` — o formulário chamará `/api/create-transaction` (server-side usa `PODPAY_SECRET`).

Segurança
- Nunca commit sua `PODPAY_SECRET` no repo.
- Para obter webhooks e confirmações, configure os endpoints no painel PodPay e verifique assinaturas.

Se quiser eu posso gerar um `README.md` mais detalhado com scripts para geração de builds, testes e verificação do endpoint.
