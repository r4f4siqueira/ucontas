# UContas

Aplicativo de gerenciamento de finanças pessoais e empresariais desenvolvido com Next.js, TypeScript e Supabase.

## Funcionalidades

- [x] Autenticação com Supabase
- [x] Gerenciamento de receitas e despesas
- [ ] Categorias de receitas e despesas
- [ ] Gráficos de receitas e despesas
- [x] Histórico de transações
- [ ] Dashboard
- [ ] Multi carteiras (Gerencie contas Pessoais e Empresariais)

## Clone e execute localmente

### Pré-requisitos

- Node.js 24.21.0 ou superior
- npm 11.19.0 ou superior
- Git

### Clonando o repositório

```bash
git clone https://github.com/r4f4siqueira/ucontas.git
cd ucontas
```

### Instale as dependências

```bash
npm install
```

### Configure as variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` e adicione as seguintes informações:

```env
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

3. Substitua `<supabase_url>` e `<supabase_anon_key>` pelas suas informações do Supabase.

### Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.
