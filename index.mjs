import express from 'express';

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
//root route
app.get('/', (req, res) => {
   res.render('home.ejs', { });
});

app.listen(3000, () => {
   console.log('server started');
});
