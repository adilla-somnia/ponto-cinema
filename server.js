const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { parse } = require('dotenv');
const app = express();
require('dotenv').config(); // executa a config do .env

// ativa CORS e express
app.use(cors());
app.use(express.json());

// pega as cred do .env
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING} = process.env;

// usado para estabelecer os param de conexão com o neon DB postgre
const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// conectar server com o DB
app.get('/', async (req, res) => {

  const client = await pool.connect();

  try {
    const result = await client.query("SELECT * FROM movies")
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar os filmes.'} );
  } finally {
    client.release();
  }
});

// começoooo das rotas especificas

    //// GET GET GET GET

// todos os filmes
app.get('/api/movies', async (req, res) => {
  try {
    const movies = (await pool.query("SELECT * FROM movies ORDER BY id ASC")).rows;
    res.json(movies);
  } catch (error) {
    console.error('Erro ao buscar os filmes: ', error);
    res.status(500).json({error: 'Erro ao buscar os filmes.'})
  }
});

// // detalhes do filme
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie =(await pool.query("SELECT * FROM movies WHERE id = $1", [req.params.id])).rows[0];
    if (!movie) return res.status(404).send('Filme não encontrado.');
    res.json(movie);
  } catch (err) {
    console.error('Erro ao buscar o filme: ', err);
    res.status(500).json({error: 'Erro ao buscar o filme.'})
  }
});

// anos que têm filmes
app.get('/api/releases', async (req, res) => {
  try {
    const releases = (await pool.query("SELECT DISTINCT release_year FROM movies")).rows;
    res.json(releases)
  } catch (error) {
    console.error("Erro ao buscar os anos:", error);
    res.status(500).json({error: 'Erro ao buscar os anos.'})
  }
});

// // filmes do ano tal
app.get('/api/releases/:year', async (req, res) => {
  try {

  const movies = (await pool.query("SELECT * FROM movies WHERE release_year = $1", [req.params.year])).rows;

  if (movies.length === 0) {
      return res.status(200).json('Não há filmes para esse ano ainda.');
  }

  res.json(movies);

} catch (error) {
    console.error("Erro ao buscar filmes: ", error);
    res.status(500).json({error:'Erro ao buscar filmes.'})
}
});

// buscar filme por título
app.get('/api/busca/:string', async (req, res) => {
  try {
    const title = `%${req.params.string}%`;
    const movies = (await pool.query("SELECT * FROM movies WHERE title ILIKE $1", [title])).rows;
    
    if (movies.length === 0) {
      return res.status(200).json('Filme não encontrado.')
    }

    res.json(movies);
  } catch (error) {
    console.error("Erro ao buscar filme: ", error);
    res.status(500).json({error:'Erro ao buscar filme.'})
  }
});




// // categoria do filme
app.get('/api/movies/:id/categories', async (req, res) => {
  // const id = parseInt(req.params.id); 
  try {
  const movies_categories = (await pool.query("SELECT c.name FROM movies_categories m join categories c on m.category_id = c.id WHERE m.movie_id = $1", [req.params.id])).rows;
  res.json(movies_categories)
} catch (error) {
    console.error('Erro ao buscar o filme: ', error);
    res.status(500).json({error: 'Erro ao buscar o filme.'})
 }
});


// // todas as categorias
app.get('/api/categories', async (req, res) => {
  try {
    const categories = (await pool.query("SELECT * FROM categories ORDER BY id ASC")).rows;
    res.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias: ", error);
    res.status(500).json({error:'Erro ao buscar categorias.'})
  }
});

// // detalhes de categoria
app.get('/api/categories/:id', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    category = result.rows[0];
    if (!category) return res.status(404).send('Categoria não encontrada.');
    res.json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria: ", error);
    res.status(500).json({error:'Erro ao buscar categoria.'})
  }
});

// // filmes por categoria
app.get('/api/categories/:id/movies', async (req, res) => {
  try {
    const movies = (await pool.query("SELECT m.title, m.description, m.release_year, m.poster FROM movies m join movies_categories mc on mc.movie_id = m.id WHERE mc.category_id = $1", [req.params.id])).rows;
    if (movies.length === 0) {
      res.status(204);
      return res.json('Não há filmes nessa categoria ainda.');
    }
    res.json(movies);
  } catch (error) {
    console.error("Erro ao buscar filmes: ", error);
    res.status(500).json({error:'Erro ao buscar filmes.'})
  }
})



    //// POST POST POST POST


// adicionar nova categoria
app.post('/api/categories/add', async (req, res) => {
  const client = await pool.connect();
  try {
    const {name, description} = req.body;

    await client.query('BEGIN');

    // adicionar categoria

    const addCategory = `
    INSERT INTO categories (name, description)
    VALUES ($1, $2)
    returning id
    `
    const resultCategory = await client.query(addCategory, [
      name,
      description
    ]);
    const categoryId = resultCategory.rows[0].id;

    await client.query('COMMIT');
    res.status(201).json({message: 'Categoria criada com sucesso', category_id: categoryId});
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar a categoria: ', error);
    res.status(500).json({error: 'Erro ao criar a categoria'});
  } finally {
    client.release();
  }
})

//adicionar filme e selecionar categorias
app.post('/api/movies/add', async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, description, release_year, poster, category_ids } = req.body;

    await client.query('BEGIN');

    // colocar o filme

    const addMovie = `
    INSERT INTO movies (title, description, release_year, poster)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `;
    const resultMovie = await client.query(addMovie, [
      title,
      description,
      release_year,
      poster
    ]);
    const movieId = resultMovie.rows[0].id;

    // inserir categorias
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const addCatMovie = `
      INSERT INTO movies_categories (movie_id, category_id)
      VALUES ${category_ids.map((_, i) => `($1, $${i + 2})`).join(',')}
      `;
      await client.query(addCatMovie, [movieId, ...category_ids]);
    }

    await client.query('COMMIT');
    res.status(201).json({message: 'Filme criado com sucesso', movie_id: movieId});
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar o filme: ', error);
    res.status(500).json({error: 'Erro ao criar o filme'});
  } finally {
    client.release();
  }
});



    //// PUT PUT PUT PUT


// editar filme e categoria do filme
app.put('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  const { title, description, release_year, poster, categories } = req.body;

  try {
    // atualizar dados do filme
    await pool.query(
      `UPDATE movies
      SET title = $1, description = $2, release_year = $3, poster = $4
      WHERE id = $5`, [title, description, release_year, poster, movieId]
    );

    // atualizar categorias
    if (Array.isArray(categories)) {
      // remove todas as categorias anteriores
      await pool.query(`DELETE FROM movies_categories WHERE movie_id = $1`, [movieId])

      // inserir as categorias

      for (const categoryId of categories) {
        await pool.query(
          `INSERT INTO movies_categories (movie_id, category_id) VALUES ($1, $2)`, [movieId, categoryId]
        );
      }
    }

    res.json({message: "Filme atualizado!"})

  } catch (error) {
    console.error('Erro ao atualizar filme: ', error)
    res.status(500).json({error: 'Erro ao atualizar o filme.'})
  }
});

// editar categoria
app.put('/api/categories/:id', async (req, res) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;

  // atualizar dados do filmito
  try {
    await pool.query(
      `UPDATE categories
      SET name = $1, description = $2
      WHERE id = $3`, [name, description, categoryId]
    );

    res.json({message: "Categoria atualizada!"})
  } catch (error) {
    console.error('Erro ao atualizar filme: ', error)
    res.status(500).json({error: 'Erro ao atualizar o filme.'})
  }
});



    //// DELETE DELETE DELETE DELETE


// deletar filme
app.delete('/api/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
      const result = await pool.query(`
        DELETE FROM movies WHERE id = $1`, [movieId]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({message: 'Filme não encontrado.'})
      }

      res.json({message: "Filme deletado!"});

    } catch (error) {
        console.error('Erro ao deletar filme: ', error);
        res.status(500).json({error: 'Erro ao deletar o filme.'})
    }
});

// deletar categoria
app.delete('/api/categories/:id', async (req, res) => {
  const categoryId = req.params.id;

  try {
    const result = await pool.query(`
      DELETE FROM categories WHERE id = $1`, [categoryId]);

    if (result.rowCount === 0) {
      return res.status(404).json({message: 'Categoria não encontrada.'})
    }

    res.json({message: "Categoria deletada!"})

  } catch (error) {
      console.error('Erro ao deletar categoria: ', error);
      res.status(500).json({error: 'Erro ao deletar a categoria.'})
  }
});


// // // fim das rotas // // //



// iniciar o server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});