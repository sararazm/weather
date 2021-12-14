const express = require("express");
const cors = require("cors");
const app = express();
const https = require('https');

const bodyParser = require("body-parser");
var corsOptions = {
    origin: "http://localhost:8081/"
};
app.set('view engine', 'ejs');
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    var today = new Date();

    let options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };
    let day = today.toLocaleDateString('en-US', options);


    res.render('list', { datum: day });


});

app.post('/', function (req, res) {

    const cityName = req.body.CityName;
    const apiKey = '72a236e3c559fda70fe2e726dba99d66';
    const unit = 'metric';
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey + '&units='
        + unit;
    https.get(url, function (response) {
        console.log(response.statusCode);

        response.on('data', function (data) {
            const weatherData = JSON.parse(data)

            const temp = Math.round(weatherData.main.temp)
            const weatherDescription = weatherData.weather[0].description
            const icon = weatherData.weather[0].icon
            const imageURL = 'http://openweathermap.org/img/wn/' + icon + '@2x.png'
            // 1* insert to database
            var MongoClient = require('mongodb').MongoClient;
            var url = "mongodb://localhost:27017/";
            var city = { title: cityName, temp: temp, image: imageURL };
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("weather");

                dbo.collection("city").insertOne(city, function (err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                    // 2* redirect to weather page

                });
            });
            res.render('weather', { data: city });


        });


    });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});