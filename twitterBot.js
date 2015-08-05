// API BUSINESS

var What3Words = require('geo.what3words'),
    w3w = new What3Words('UW1Q5V37');

var Wordnik = require('wordnik');
var wn = new Wordnik({
    api_key: '53b863fca478b85d6700401173007ab4e18891dfcf17131f6'
});



// GLOBALS
var i = 0;
var a_ray = [];





//  WORD STUFF

// GET RANDOM WORD FUNCTION
    //  FROM A. SALTER POEMGENERATOR.JS 2015
function getRandomWord(fn) {
    var randomNoun = wn.randomWord({ minCorpusCount:20000, minLength:4, maxLength:7, excludePartOfSpeech:"proper-noun", hasDictionaryDef:"true"}, function(e, defs) {
        fn(defs.word);
    });
}
// SHUFFLE ARRAY FUNCTION
    // FROM CoolAJ86 2014 stackoverflow.com
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;
    
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
      
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
      
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
// PUSH RANDOM WORD TO ARRAY
function pushArray(word){
    a_ray.push(word);
    console.log(word);
    if(a_ray.length == 3)
    {
        joinRay(a_ray);   
    } else {
        getRandomWord(pushArray);   
    }
}
// JOIN RAY IN string1.string2.string3 for w3w
function joinRay(ray) {
    s = ray.join(".");
    i++;
    checkIfCoords(s);
}
// CHECK IF string1.string2.string3 works
function checkIfCoords(s) {
    w3w.wordsToPosition({
      words: s
    }).then(function(response) {
        //SEND COORDS IF NO ERROR
        console.log("\n" + s + " was a success.");
        console.log("\n" + "coordinates: " + response);
        makeMap(response);
    }).catch(function(err) {
        // IF NOT, SHUFFLE ARRAY
        console.log(s + " is not a location.");
        if(i<3){
            shuffle(a_ray);
            joinRay(a_ray);
        } else {
            console.log("done!");
            console.log("\n" + "next round in 5 seconds . . . " + "\n");
            setTimeout(function(){ 
                a_ray = [];
                i = 0;
                getRandomWord(pushArray);
            }, 5000);
        }      
    });
}
function processData () {
  getRandomWord(pushArray);
}

// -- END WORD STUFF

//  TWITTER STUFF

function tweetMap(){
    var Twitter = require('node-twitter');
 
    var twitterRestClient = new Twitter.RestClient(
        'nE2Vli8pBlEGLvM9JdxJ67rY8',
        'uCbtdEcW41AU0Q3oFCjOGI7KnuDUKPCKIDxnrTj5aViv6ZSQcP',
        '2989751763-pSLmZc1lRDR7e0sIennF06KfBcDsfMYk2L3PTbg',
        '3IHXFEB8SrXJfaClsV0d9bJMQqUp4nausFyV3aqBZTtEn'
    );

    twitterRestClient.statusesUpdateWithMedia(
        {
            'status': a_ray.join('.'),
            'media[]': 'image.png'
        },
        function(error, result) {
            if (error)
            {
                console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
            }

            if (result)
            {
                console.log("\n" + "image tweeted to https://twitter.com/s30516268");
                console.log("\n" + "Bot generates random words from Wordnik API, strings three of them together in various combinations and compares these three-word combinations against a geo-mapping API called what3words. What3words has the entire globe mapped out in 3mx3m squares, tagged as strings of text in this format: (word1.word2.word3). The coordinates associated with the location defined by (word1.word2.word3) are fed into google static maps and an image from google static maps is tweeted of those coordinates.");
                //DEBUG ONLY console.log(result);
            }
        }
    );
    
}

// -- END TWITTER STUFF

// MAP STUFF

var fs = require('fs');
var request = require('request');
var gm = require('google-static-map').set('AIzaSyCnK-RjztDVPRBBbB-OnRnwip-sJYefx5U');

function makeMap(coords, callback) {
    var stream = gm()
      .zoom( 5 )
      .resolution( '600x600' )
      .address(coords)
      .staticMap()
      .done();
    
    image = fs.createWriteStream("image.png");
    image.on('close', function() {
        console.log('image file created');
        tweetMap();
    });
    stream.pipe(image);
    
}

// -- END MAP STUFF


// MAIN PROCESS

processData();

// -- END MAIN PROCESS



