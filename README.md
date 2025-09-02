# ponto-cinema
## How to Use
### Installation

- Open a terminal inside the project folder and run the following commands:

1. npm install
2. npm install pg
3. npm install dotenv
4. npm install cors
5. npm install express

- Go to NeonDB and follow these steps:

1. Sign in or create an account
2. Create a new project
3. In the Overview tab, click on Connect
4. Change Connection String to Parameters only
5. Copy everything and paste it into your .env file
6. Save the file
7. Go to the SQL Editor tab and paste the following commands:

CREATE TABLE movies(
  ID SERIAL NOT NULL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  release_year INT NOT NULL,
  poster TEXT NOT NULL
);

CREATE TABLE categories(
  ID SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
);

CREATE TABLE movies_categories(
  movie_id INT,
  category_id INT,
  FOREIGN KEY (movie_id) REFERENCES movies(ID) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(ID) ON DELETE CASCADE 
);

8. Click RUN.

That's it! The routes are now working and can be tested using the Thunder Client extension in VSCode, or any other tool of your choice.

## Routes

### GET
#### /api/movies
Returns all movies

#### /api/movies/:id
Returns data for the movie with the specified ID

####/api/movies/:id/categories
Returns the categories of the movie with the specified ID

#### /api/categories
Returns all categories

#### /api/categories/:id
Returns data for the category with the specified ID

#### /api/categories/:id/movies
Returns all movies under the specified category

#### /api/releases
Returns all unique release years of the movies in the database

####/api/releases/:year
Returns all movies released in the specified year

#### /api/busca/:string
Returns movies that contain the string in their title

### POST
#### /api/categories/add
Accepts {name, description} and adds a new category

#### /api/movies/add
Accepts {title, description, release_year, poster, category_ids} and adds a new movie, also linking it to its categories

### PUT
#### /api/movies/:id
Accepts {title, description, release_year, poster, categories} and updates the movie with the given ID

#### /api/categories/:id
Accepts {name, description} and updates the category with the given ID

### DELETE
####/api/movies/:id
Deletes the movie with the given ID

#### /api/categories/:id
Deletes the category with the given ID

