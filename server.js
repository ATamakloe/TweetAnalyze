const express = require('express');
const Twit = require('twit');
const nlpWatson = require('ibm-watson/natural-language-understanding/v1.js');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = process.env.PORT || 3001;
require('dotenv').config()


const T = new Twit({
    consumer_key:'10I01p1nPw79k7tcEtfyfZrfz',
    consumer_secret:'5OoRl6shFaHv0ILABlcbWJot7Zm95F6SuiBPabsL2QS5Kxx46y',
    access_token:'385219659-xNPtPgpotKObPm8YfFWaubS56IjCbHC9Q4kUGb4U',
    access_token_secret:'USI7YCc2Sx3I66pffwAe9NT2A40sEZRfDZ2fnHn5ojTKp',
    timeout_ms:60*1000,
    strictSSL:true,
  })

const nlp = new nlpWatson({
  version: '2018-11-16',
  iam_apikey: 'abY4y2X8N8_PkbJk4AgmI-pO27mm8D2YR9rWHN_06c_r',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api',
});

server.listen(port)
app.use(express.json());
app.use(express.static(__dirname + '/views'))







async function getTermScore(term="Trump") {
  let analyzeParams = null;
  let sentimentscore = null;
  let results = {};
  let tweetList = await T.get('search/tweets', {
    q: term,
    count: 10
  }).then(data => data.data.statuses.map(status => status.text)).filter(status => status.includes(term))
  if (tweetList.length < 1) {
    results = {"sentimentScore": 0, "tweets": []}
  } else {
    analyzeParams = {
      'text': tweetList.join(". "),
      'features': {
        'sentiment': {
          'document':true,
        }
      }
    }
    sentimentscore = await nlp.analyze(analyzeParams).then(analysisResults => analysisResults.sentiment.document.score).catch(err => console.log("Error:",err));
    results = {"sentimentScore":sentimentscore, "tweets":tweetList}
  }

  return results;
}



io.on('connection', (socket) => {
  console.log(`${socket.id} has connected`)

let tweetInterval = null;
  socket.on('term', (data) => {
    let term = data.term;
    tweetInterval = setInterval(async () => {
      let data = await getTermScore(term);
      socket.volatile.emit('sentdata', data);
    }, 1000 * 5);

  })


  socket.on('disconnect', (data) => {
    clearInterval(tweetInterval);
  })
});
