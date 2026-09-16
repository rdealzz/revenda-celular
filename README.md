# Revenda · Painel

Painel pessoal para gestão de compra e venda de celulares: investimento, gastos,
lucro real, tempo de venda e estatísticas — tudo salvo apenas no seu navegador.

## Rodando

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # gera a versão de produção em dist/
npm run preview  # serve a versão de produção
```

Abra o endereço mostrado no terminal. Não há login, servidor ou banco de dados:
os dados ficam no **IndexedDB** deste navegador (com fallback automático para
LocalStorage em janelas privadas) e continuam lá ao fechar e reabrir.

> Faça backups em JSON pela tela de **Ajustes**. Limpar os dados de navegação
> apaga o banco local.

## Publicar na web

O repositório já traz o workflow `.github/workflows/deploy.yml`. Para ligar:
**Settings → Pages → Source: GitHub Actions**. A partir daí, todo push na `main`
publica o site em `https://rdealzz.github.io/revenda-celular/`.

O build usa caminhos relativos (`base: './'`), então a pasta `dist/` também
funciona aberta direto do disco ou em qualquer outra hospedagem estática.

## O que o sistema faz

- **Painel** — 13 indicadores (investido em estoque, valor potencial, lucro
  potencial, lucro realizado, lucro líquido, ticket médio, tempo médio de venda,
  ROI e margem médios, gastos com deslocamento e manutenção…) e gráficos de
  evolução do lucro, lucro por mês, compras × vendas, investido × retorno,
  tempo médio de venda e distribuição por marcas.
- **Aparelhos** — cadastro completo (ficha técnica, compra, gastos avulsos e
  venda), busca instantânea, filtros por situação e favoritos, ordenação,
  duplicar, editar, excluir e exportação.
- **Detalhe** — linha do tempo (compra → gastos → venda → lucro), resumo
  financeiro, ficha técnica e observações.
- **Estatísticas** — marca mais lucrativa, aparelho que vendeu mais rápido e o
  que demorou mais, lucro médio, maior lucro, maior prejuízo, maior
  investimento, melhor ROI, desempenho por marca e resumo mensal.
- **Alertas** — aparelhos há mais de 30 dias em estoque, anunciados sem preço,
  lucro abaixo da média e cadastros incompletos.
- **Ajustes** — modo claro/escuro, exportação para Excel (CSV) e PDF, backup e
  importação em JSON.

## Cálculos

| Indicador | Fórmula |
| --- | --- |
| Investimento total | valor da compra + todos os gastos |
| Lucro bruto | valor vendido − valor da compra |
| Lucro líquido | valor vendido − (valor da compra + gastos) |
| Margem | lucro líquido ÷ valor vendido |
| ROI | lucro líquido ÷ investimento total |
| Dias para vender | data da venda − data da compra |
| Lucro potencial | valor anunciado − investimento total |

Tudo é recalculado em tempo real enquanto você digita.

## Arquitetura

```
src/
├── data/          persistência (contrato + IndexedDB + LocalStorage)
├── types/         modelo de domínio
├── lib/           cálculos, métricas, alertas, formatação e exportações
├── store/         providers de tema, notificações e dados
├── hooks/         roteamento por hash
├── components/    design system (ui), layout e gráficos
└── features/      telas: dashboard, devices, stats, alerts, settings
```

A UI conversa **apenas** com a interface `Repository<T>` (`src/data/repository.ts`).
Para migrar no futuro para um banco de dados remoto, basta criar uma nova
implementação (ex.: `HttpRepository`) e trocá-la em `src/data/index.ts` — nenhuma
tela precisa mudar.

Stack: React + TypeScript + Vite, Tailwind CSS, Framer Motion, Recharts e
Lucide Icons.
