const express = require('express')
const {open} = require('sqlite')
const app = express()
app.use(express.json())
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server is running at http://localhost:3000'),
    )
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/movies/', async (request, response) => {
  const getAllMovieNamesQuery = `
    SELECT *
    FROM movie;`
  const eachMovieName = await db.all(getAllMovieNamesQuery)
  response.send(
    eachMovieName.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

// API2
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const createNewMovieQuery = `
    INSERT INTO 
      movie
    (director_id,movie_name,lead_actor)
    VALUES(
      ${directorId},
      '${movieName}',
      '${leadActor}'
      );`
  const createNewMovie = await db.run(createNewMovieQuery)
  // console.log(createNewMovie)
  response.send('Movie Successfully Added')
})

// API3

const convertMovieDetailsToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetailsQuery = `
  SELECT *
  FROM movie
  WHERE movie_id=${movieId};`
  const getMovieDetails = await db.get(getMovieDetailsQuery)
  response.send(convertMovieDetailsToResponseObject(getMovieDetails))
})
// API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMoviedetailsQuery = `
    UPDATE movie
    SET 
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE movie_id =${movieId};
    `
  await db.run(updateMoviedetailsQuery)
  response.send('Movie Details Updated')
})

// API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletingMovieQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`
  const deleteMovie = await db.run(deletingMovieQuery)
  response.send('Movie Removed')
})

const convertDirectorDetailsToDbObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
// API 6
app.get('/directors/', async (request, response) => {
  const getDirectorDetailsQuery = `
    SELECT *
    FROM director;`
  const getDirectorDetails = await db.all(getDirectorDetailsQuery)
  response.send(
    getDirectorDetails.map(eachDirector => {
      convertDirectorDetailsToDbObject(eachDirector)
    }),
  )
})

// API 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = params
  const getMoviesDirected = `
    SELEC movie_name as movieName
    FROM Movie 
    WHERE directorId:${directorId};
  `
  const getDirectedMovieDetails = await db.all(getMoviesDirected)
  response.send(
    getDirectedMovieDetails.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})
module.exports = app
