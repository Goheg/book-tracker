import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "Oh1remen",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({extended: true}))

// let bookRead = []

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.post("/getBook", async (req, res) => {
    console.log(req.body)
    const bookName = req.body.title
    const book = bookName.toLowerCase().split(" ").join("+")
    console.log(book)
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${book}`)

        const coverNtitle = response.data.docs.map(book => ({
            bookCover: book.cover_i,
            booktitle: book.title
          }));

          

          res.render("index.ejs", {
            coverNtitle: coverNtitle
          })

        console.log(coverNtitle)
    } catch (error) {
        res.status(404).send(error.message);
    }

})

app.get("/add/:id/:title", async (req, res) => {
    console.log(req.params)
    const cover_id = parseInt(req.params.id)
    const title = req.params.title

    await db.query("INSERT INTO coverntitle(coverid, booktitle) VALUES($1, $2)", [parseInt(cover_id), title])

    // bookRead.push(req.params)
    // 

    const result = await db.query("SELECT * FROM coverntitle")
    
    const bookRead = result.rows
    console.log(bookRead)
    res.render("catalog.ejs", {coverNtitle: bookRead})
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})