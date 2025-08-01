# ponto-cinema

## Como Utilizar

### Instalação

- Abra o terminal dentro da pasta do projeto e insira os seguintes comandos:
    1. npm install
    2. npm install pg
    3. npm install dotenv
    4. npm install cors
    5. npm install express

- Entre no NeonDB e siga esses passos:
  1. Entre ou crie uma conta
  2. Crie um novo projeto
  3. Na aba 'Overview' clique em 'Connect'
  4. Mude 'Connection String' para 'Parameters only'
  5. Copie tudo e cole dentro do arquivo .env
  6. Salve o arquivo
  7. Vá para a aba SQL Editor e cole o seguinte comando:

CREATE TABLE movies(
  ID SERIAL NOT NULL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  release_year INT NOT NULL,
  poster TEXT NOT NULL,
);

CREATE TABLE categories(
  ID SERIAL NOT NULL PRIMARY KEY
  name VARCHAR(50),
  description TEXT
);

CREATE TABLE movies_categories(
  movie_id INT,
  category_id INT,
  FOREIGN KEY (movie_id) REFERENCES movies(ID) ON DELETE CASCADE
  FOREIGN KEY (category_id) REFERENCES categories(ID) ON DELETE CASCADE 
);

  8. Clique em RUN.

Pronto, as rotas já estão funcionando e podem ser testadas com a extensão Thunder Client do VSCode, ou outras se desejar.

## Rotas

### GET

- /api/movies
retorna todos os filmes

- /api/movies/:id
retorna apenas os dados do filme com tal id

- /api/movies/:id/categories
retorna as categorias do filme com tal id

- /api/categories
retorna todas as categorias

- /api/categories/:id
retorna apenas os dados da categoria com tal id

- /api/categories/:id/movies
retorna os filmes que são daquela categoria

- /api/releases
retorna, sem repetições, todos os anos de lançamentos dos filmes no banco de dados

- /api/releases/:year
retorna todos os filmes que foram lançados naquele ano

- /api/busca/:string
retorna filmes que contenham a string no título

### POST

- /api/categories/add
recebe {name, description} e adiciona uma nova categoria

- /api/movies/add
recebe {title, description, release_year, poster, category_ids} e adiciona um novo filme, e também associa ele às suas categorias

### PUT

- /api/movies/:id
recebe {title, description, release_year, poster, categories} e atualiza os dados daquele filme

- /api/categories/:id
recebe {name, description} e atualiza aquela categoria

### DELETE

- /api/movies/:id
deleta o filme com aquele id

- /api/categories/:id
deleta a categoria com aquele id
