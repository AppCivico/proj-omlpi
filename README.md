# Primeiros passos

Após clonar este repositório, sincronize os repositórios dos repositories individuais

    git submodule init
    git submodule update

------

# >> omlpi-api

Contém o código fonte da API e scripts para importação dos dados para o banco de dados.

A OMLPI API é uma aplicação baseada em Perl, construída usando o framework Mojolicious. Ela serve como backend para o projeto, fornecendo dados tanto em formato JSON quanto algumas saídas em PDF.

## Componentes-Chave

### 1. Aplicação Principal (lib/OMLPI.pm)

O arquivo principal da aplicação configura o app Mojolicious, define plugins e helpers.

Características principais:

- Versionamento do shema do banco de dados usando (Sqitch)[https://sqitch.org/]
- Configura conexão com banco de dados usando Mojo::Pg
- (Plugin do Mojolicious::Plugin::OpenAPI)[https://metacpan.org/pod/Mojolicious::Plugin::OpenAPI] (escrito manualmente) para definir as rotas
- Define helpers para tratamento de erros
- Usa OMLPI::Config para configuração de variáveis de ambiente pelo banco de dados
- Log com Log::Log4perl

### 2. Controllers

Controladores lidam com a lógica de negócio para diferentes endpoints da API:

- Areas (lib/OMLPI/Controller/Areas.pm)
- Cities (lib/OMLPI/Controller/Cities.pm)
- Classifications (lib/OMLPI/Controller/Classifications.pm)
- Data (lib/OMLPI/Controller/Data.pm)
- Indicators (lib/OMLPI/Controller/Indicators.pm)
- Locales (lib/OMLPI/Controller/Locales.pm)
- States (lib/OMLPI/Controller/States.pm)
- UploadPlan (lib/OMLPI/Controller/UploadPlan.pm)

### 3. Modelos

Modelos gerenciam a recuperação e manipulação de dados:

- Area (lib/OMLPI/Model/Area.pm)
- City (lib/OMLPI/Model/City.pm)
- Classification (lib/OMLPI/Model/Classification.pm)
- Compare (lib/OMLPI/Model/Compare.pm)
- Data (lib/OMLPI/Model/Data.pm)
- DateTime (lib/OMLPI/Model/DateTime.pm)
- Historical (lib/OMLPI/Model/Historical.pm)
- Indicator (lib/OMLPI/Model/Indicator.pm)
- Locale (lib/OMLPI/Model/Locale.pm)
- PlanUpload (lib/OMLPI/Model/PlanUpload.pm)
- State (lib/OMLPI/Model/State.pm)

### 4. Conexão com Banco de Dados (lib/OMLPI/DatabaseConnection.pm)

Gerencia a conexão com o banco de dados usando Mojo::Pg e carrega variáveis de ambiente do banco de dados.

É necessário a configuração das variáveis de ambiente:

    POSTGRESQL_USER
    POSTGRESQL_PASSWORD
    POSTGRESQL_HOST
    POSTGRESQL_PORT
    POSTGRESQL_DBNAME

Então as próximas são carregadas diretamente da tabela `config`.

Caso o valor não esteja na tabela de configuração, ele ainda pode ser configurado via variável de ambiente.

No momento, há estás configurações disponíveis:

    SMTP_PORT            | 587
    SMTP_SERVER          | "provedor"
    SMTP_USERNAME        | "user"
    SMTP_PASSWORD        | "pass"
    DATASET_CHECKSUM     | <<atualizado automaticamente, para controle da importação>>
    GENERATE_DATA_FILE   | 1
    PLAN_UPLOAD_EMAIL_TO | "e-mail para recebimento do formulário"


### 5. Configuração (lib/OMLPI/Config.pm)

Configura o servidor web Hypnotoad, quantos workers (threads), endereço do bind, etc

Utiliza as envs

    API_PORT      | 1234 < porta do bind >
    API_WORKERS   | 4 < número de forks da aplicação >

Estas envs precisam ser carregadas via ambiente, pois o Hypnotoad é quem sobe a aplicação, logo as variáveis não poderiam ser carregadas do banco ainda.

### 6. Jobs em Background (lib/OMLPI/Minion.pm)

Configura o Minion para processamento de tarefas em background. A única tarefa que existe é o disparo do e-mail do formulário.

> https://docs.mojolicious.org/Minion


### 7. Importação de Dados (script/import_data.pl)

Script para importar dados de arquivos CSV para o banco de dados.

Ver [importacao.md](importacao.md)

## Endpoints da API

Os endpoints da API são definidos no arquivo de especificação OpenAPI (public/openapi.yaml). Endpoints principais incluem:

- /locales: Lista todos os locais disponíveis
- /states: Lista de estados brasileiros
- /cities: Lista de cidades
- /areas: Lista de todos os eixos temáticos
- /classifications: Obter uma lista de todas as classificações de desagregação de dados
- /indicators: Lista de todos os indicadores
- /data: Recupera dados para um local específico
- /data/compare: Compara locais
- /data/historical: Obter dados históricos para um local
- /data/random_indicator: Obter um indicador aleatório
- /data/resume: Baixar um relatório em PDF para um local
- /data/download: Baixar todos os dados
- /data/download_indicator: Baixar dados de indicadores para um local específico
- /upload_plan: Submeter um plano de local

## Esquema do Banco de Dados

O esquema do banco de dados é gerenciado usando Sqitch (schema/sqitch.plan). Inclui tabelas para locais, indicadores, subindicadores e seus respectivos dados.

## Testes

O projeto inclui testes de unidade e de integração localizados no diretório `t/`.

## Implantação

A aplicação pode ser implantada usando Docker. O Dockerfile e os scripts relacionados estão disponíveis no diretório `docker/`.

O arquivo `build-container.sh` copia o arquivo de dependências e cria uma nova imagem, sem o código fonte.

O código fonte é montando para que possa ser atualizado sem necessidade de criar uma nova imagem. Arquivo `sample-run-container.sh` há um exemplo de como subir o container com o código fonte montando, e o `sample-gracefully-reload.sh` como executar um reload do código fonte da aplicação sem derrubar o serviço web.

## Scripts

Diversos scripts utilitários estão disponíveis no diretório `script/` para tarefas como iniciar o servidor, executar testes e gerenciar o banco de dados.

------

# >> omlpi-cms

Strapi é um CMS headless de código aberto que oferece uma interface administrativa personalizável e uma API flexível para gerenciar conteúdo.

## Configuração local

Para configurar e executar o Strapi CMS localmente:

Navegue até o diretório omlpi-cms:

    cd omlpi-cms

Instale as dependências:

    npm install

Inicie o servidor de desenvolvimento:

    npm run develop

Acesse o painel administrativo em http://localhost:1337/admin

### Modificações

Foram realizadas alterações na pasta `api` com as rotas para que o site consiga acessar alguns dos modelos do banco.

------

# >> omlpi-cms-search

Código fonte da busca do site, que contém regras de Full Text que não estavam disponíveis no CMS.

Podem ser movidas de volta para dentro do CMS, porém é necessário integrar com o knex/pg, e foram escritas por equipes diferentes.

### Configuração:

Copie o arquivo docker-compose.yml.example para docker-compose.yml e ajuste as variáveis de ambiente conforme necessário.

Execute o container Docker:

docker-compose up -d

### Estrutura do projeto

- `src/index.js`: Arquivo principal que configura o servidor Restify e define as rotas.
- `src/migrations/`: Contém scripts de migração para o banco de dados.

#### Funcionalidades principais

- Busca de artigos com suporte a full-text search.
- Filtragem de artigos por tags.
- Paginação de resultados.

### Endpoints

- `GET /artigos`: Busca artigos com suporte a filtragem por texto e tags.

### Desenvolvimento

Para desenvolvimento local:

Instale as dependências:

    npm install

Execute as migrações:

    npm run migrate up

Inicie o servidor de desenvolvimento:

    npm run dev

------

# >> omlpi-www

Código fonte do site.

## Tecnologias Utilizadas

- Hugo: Framework para geração de sites estáticos
- Vue.js: Framework JavaScript para construção de interfaces de usuário
- Highcharts: Biblioteca para criação de gráficos interativos
- Sass: Pré-processador CSS

## Estrutura do Projeto

- `assets/`: Contém arquivos de estilo (Sass) e scripts JavaScript
- `content/`: Arquivos de conteúdo em Markdown
- `layouts/`: Templates HTML para as páginas
- `static/`: Arquivos estáticos como imagens e favicons
- `config.yaml`: Arquivo de configuração do Hugo

## Principais Funcionalidades

1. Página Inicial
   - Banner principal
   - Seção de eixos temáticos
   - Indicadores em destaque
   - Notícias recentes
   - Seção "Sobre nós"

2. Página de Indicadores
   - Visualização de indicadores por área temática
   - Gráficos interativos

3. Página de Comparação
   - Comparação de indicadores entre diferentes localidades

4. Página de Histórico
   - Visualização da série histórica dos indicadores

5. Biblioteca
   - Repositório de materiais de referência
   - Sistema de busca e filtragem

6. Planos pela Primeira Infância
   - Mapa interativo dos planos municipais e estaduais
   - Formulário para envio de novos planos

## Configuração e Execução

1. Instale as dependências:

    npm install

2. Para desenvolvimento local:

    npm run start

3. Para build de produção:

    npm run build

Resultado do site estático em `public`, pode ser publicado usando `nginx` ou outro servidor HTML.

Hospedado atualmente utilizando o Netlify, também pode ser hospedado usando o Cloudflare Pages ou Vercel.

## Integrações

- API do CMS (Strapi): Utilizada para buscar conteúdos dinâmicos
- API de dados: Fornece os dados para os indicadores e comparações

## Observações

- O projeto utiliza o conceito de "Single-Page Application" em algumas seções, combinando Hugo para geração estática e Vue.js para interatividade.
- A responsividade é tratada através de mixins Sass e classes utilitárias.
- O sistema de busca utiliza a biblioteca Awesomplete para autocomplete.

Para mais detalhes sobre a implementação de funcionalidades específicas, consulte os arquivos JavaScript na pasta `assets/scripts/`.
