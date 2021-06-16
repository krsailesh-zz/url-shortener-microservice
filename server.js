require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const app = express();


mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('database connected...');
  })
  .catch(err => console.log(err));


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint

const urlSchema = new mongoose.Schema({
  url: String
});

const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl', function(req, res) {
  const urlbody = req.body.url;
  const noHttpUrl = urlbody.replace(/https?:\/\//, "");
  dns.lookup(noHttpUrl, (err,address) => {
    if(err){
      return res.json({ error: 'invalid url' });
    }
    const newUrl = new Url({url : noHttpUrl});
    newUrl.save() 
      .then(doc => {
        console.log('successfully shortened');
        return res.json({ original_url : urlbody, short_url : doc._id});
      })
      .catch(err => console.log(err));
  })
});

app.get('/api/shorturl/:id', (req,res) => {
  const urlId = req.params.id;
  Url.findById(urlId)
    .then((data) => {
      if(!data){
        return res.json({ error: 'invalid url' });
      }
      return res.redirect('http://' + data.url);
    })
    .catch(err => console.log(err));
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
