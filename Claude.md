# Sant.IA.Go — AI Venture Studio
**Engenheiro Principal:** Claude  
**CTO:** Ighor Santiago  
**CEO/Growth:** Janaina Santiago  

---

## Stack Tecnológica
- **Web:** React + TypeScript + Vite + Tailwind CSS v4
- **Mobile:** React Native + Expo
- **Deploy:** Vercel
- **Linguagem:** TypeScript em tudo

## Regras de Código
- Nomes de variáveis, funções, tipos → **inglês**
- Textos visíveis ao usuário e comentários → **português**
- Commits atômicos — um componente por vez
- Sempre tipar com TypeScript
- Sistema de tema centralizado em `src/themes/index.ts`

---

## Ecossistema de Projetos

### 1. Fábrica de Sites (produto de entrada)
Três Blueprints modulares em React + TypeScript + Vite + Tailwind v4:

**Alpha** — `ploter-site` (já criado e deployado)
- Vitrine estática + link WhatsApp

**Beta** — `barbearia-site` ✅ COMPLETO
- Deploy: https://barbearia-site-pied.vercel.app
- Repositório: https://github.com/ighorsantiago/barbearia-site
- Stack: React + TS + Vite + Tailwind v4 + lucide-react + react-router-dom
- Funcionalidades:
  - Header fixo com nav mobile
  - HeroSection com imagem de fundo
  - ServicesSection
  - GallerySection (imagens Unsplash)
  - BookingSection — agendamento em 4 steps (serviço → data → horário → formulário)
    - Máscaras nos campos (nome: só letras, telefone: (XX) XXXXX-XXXX)
    - Horários passados bloqueados automaticamente
    - Confirmação abre WhatsApp com dados do agendamento
  - ContactSection com link WhatsApp e "Área do profissional"
  - WhatsAppButton flutuante
  - AdminDashboard em `/admin`
    - Login por senha (config.ts)
    - Navegação entre dias (anterior/próximo + date picker)
    - Cards com status: Pendente / Concluído / Não compareceu
    - Lucro do dia (só agendamentos Concluídos)
    - Botão excluir agendamento
  - vercel.json para roteamento client-side
- Arquitetura:
  - `src/config.ts` — única fonte de verdade (trocar cliente = trocar este arquivo)
  - `src/types/config.ts` — tipagem completa
  - `src/hooks/useBooking.ts` — localStorage com status
  - `src/components/base/` — Header, Hero, Services, Gallery, Contact, WhatsAppButton
  - `src/components/calendar/` — BookingSection
  - `src/pages/` — Home, AdminDashboard

**Gamma** — `manicure-site` ✅ COMPLETO (aguardando deploy)
- Repositório: https://github.com/ighorsantiago/manicure-site
- Tudo do Beta +
  - Tema claro (`primaryColor: '#FAF7F5'`, `accentColor: '#C084A0'`)
  - Sistema de tema centralizado em `src/themes/index.ts`
  - Módulo PIX: `src/components/pix/PixModal.tsx`
  - `src/hooks/usePix.ts` — geração de payload PIX estático (CRC16)
  - `qrcode.react` para gerar QR Code
  - Storage key separada: `bookings_manicure_v1`
  - Fluxo PIX após agendamento:
    - Step success mostra QR Code + código para copiar da taxa de marcação (R$ 30)
    - Botão "Enviar comprovante no WhatsApp" abre WhatsApp com dados do agendamento
  - `bookingFee` no `PixConfig` para taxa de marcação
- **PENDENTE:** aplicar sistema de tema (`src/themes/index.ts`) nos componentes Beta (barbearia-site) para manter padrão
- **PENDENTE:** deploy na Vercel

### Lógica de Expansão dos Blueprints
- Componentes desacoplados da regra de negócio
- `config.ts` é a única coisa que muda entre clientes
- Alpha ⊂ Beta ⊂ Gamma (cada nível herda o anterior)

---

### 2. ProspectAI 🚧 EM DESENVOLVIMENTO
**"Prospecta aí"** — Agente de prospecção de clientes para a Janaina  
- Repositório: https://github.com/ighorsantiago/prospectai
- Deploy: ainda não feito
- Stack: React + TS + Vite + Tailwind v4 + Vercel Functions

**Objetivo:** Janaina entra no site, busca uma região + nicho, recebe lista de negócios mapeados com análise de IA para ajudar na abordagem comercial.

**Fluxo em 3 fases (atual design):**
1. **Lista rápida** — Google Places busca negócios, mostra cards com nome, endereço, telefone, se tem site. Sem IA.
2. **Perfil + Probabilidade** — Ao clicar "Analisar", Claude analisa aquele negócio específico e retorna: probabilidade de aceite (0-100%), canal de abordagem recomendado (visita/whatsapp/telefone/email) e motivo.
3. **Script completo** — Ao clicar "Gerar script", Claude retorna: script de vendas completo, possíveis objeções e argumentos de venda.

**Arquitetura:**
```
prospectai/
├── api/
│   └── places.ts          # Vercel Function — proxy Google Places
├── src/
│   ├── themes/index.ts    # Sistema de tema (roxo Sant.IA.Go)
│   ├── types/index.ts     # Business, BusinessProfile, BusinessScript, SearchFilters
│   ├── hooks/
│   │   └── useProspect.ts # fetchBusinesses, fetchProfile, fetchScript
│   ├── components/
│   │   ├── SearchForm.tsx  # Região + Nicho + Raio de busca
│   │   └── BusinessCard.tsx # Card expansível com as 3 fases
│   └── pages/
│       └── Home.tsx
├── vite.config.ts         # Proxy para Google Places e Anthropic API
└── vercel.json
```

**Variáveis de ambiente (.env):**
```
GOOGLE_PLACES_KEY=AIzaSyD8IULkiOc4QcdK060Cjm9KHeFO3-C9RNE
ANTHROPIC_KEY=sk-ant-...
```

**APIs:**
- Google Places → via proxy Vite em dev (`/api/places`) e Vercel Function em prod (`api/places.ts`)
- Anthropic → via proxy Vite em dev (`/api/claude`)

**⚠️ PROBLEMA ATUAL — Chamada Anthropic retornando 404**

O proxy do Vite para `/api/claude` está configurado corretamente:
- Path chegando correto: `/v1/messages`
- API Key presente: sim
- Método: POST

Configuração atual do proxy no `vite.config.ts`:
```typescript
'/api/claude': {
  target: 'https://api.anthropic.com',
  changeOrigin: true,
  rewrite: () => '/v1/messages',
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('x-api-key', env.ANTHROPIC_KEY ?? '')
      proxyReq.setHeader('anthropic-version', '2023-06-01')
      proxyReq.removeHeader('origin')
    })
  },
},
```

O modelo sendo usado é `claude-haiku-4-5`. O 404 vem da Anthropic, não do Vite.

**Solução recomendada:**
Criar `api/claude.ts` como Vercel Function (mesmo padrão do `api/places.ts`) e usar `vercel dev` em vez do proxy Vite para a Anthropic.

```typescript
// api/claude.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(req.body),
  })

  const data = await response.json()
  return res.status(response.status).json(data)
}
```

**O que falta no ProspectAI:**
- [ ] Criar `api/claude.ts` e testar via `vercel dev`
- [ ] Remover proxy `/api/claude` do `vite.config.ts`
- [ ] Testar fluxo completo das 3 fases
- [ ] Botão exportar PDF no BusinessCard expandido
- [ ] Deploy na Vercel com variáveis de ambiente configuradas
- [ ] Restringir chave Google Places ao domínio da Vercel após deploy

---

### 3. Arena Games ✅ Em produção
- XO Arena, Sudoku Arena, Block Blast Arena
- React Native + Expo SDK 52 + AdMob
- Publisher ID: `ca-app-pub-3386298011801498`
- Design: bg `#0D0F1A`, gold `#C9A84C`, purple `#7B5EA7`

### 4. Media House 📋 Planejado
- Automação de vídeos virais TikTok/Instagram
- Mercado brasileiro

### 5. Scout Bot 📋 Planejado
- Dashboard esportivo em tempo real
- Integração Telegram

---

## Pendências Gerais
- [ ] Aplicar `src/themes/index.ts` no `barbearia-site` (Beta)
- [ ] Deploy `manicure-site` na Vercel
- [ ] Resolver Anthropic 404 no `prospectai` (criar api/claude.ts)
- [ ] Deploy `prospectai` na Vercel
- [ ] Adicionar link Sant.IA.Go no footer dos sites quando tivermos o site do estúdio
- [ ] Site do Sant.IA.Go (ainda não iniciado)
