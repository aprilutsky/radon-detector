var express = require("express");
var d3 = require('d3');
var app = express();
var fs = require('fs');
var date=require('date-and-time');
var ssi = require("ssi");

var inputDirectory = "./src";
var outputDirectory = "./";
var matcher = "/**/*.html";

var includes = new ssi(inputDirectory, outputDirectory, matcher);
includes.compile();

var profiles = [
    {
        user:"admin",
        userName: "Roman Prilutsky" ,
        address:"100 Kitchell Lake Rd, West Milford, NJ 07480",
        deviceId: "01-20-00-00-00-00-00"
    },

    {
        user:"tolik",
        userName: "Anatoly Shifman" ,
        address:"122 Kitchell Lake Rd, West Milford, NJ 07480",
        deviceId: "10-00-00-00-00-00-00"
    }
        
];


/* we will define passwords here*/
var basicAuth = require('express-basic-auth')

app.use("/loadData",basicAuth({
   users: { 
       'admin': 'psycho',
       'tolik': 'psycho',
       'anna': 'psycho',
    },
   challenge: true,
   realm: 'mydata'
}))


/* serves main page */
app.get("/", function(req, res) {
   res.sendfile('_HomePage.html')
});


// responce to request upload datafile
app.get("/loadData", function(req, res) {

     var dataFile = ".\\DATA\\"+req.auth.user+".json";
     console.log("Load Data from "+ dataFile);
     if(fs.existsSync(dataFile)){
        var data = fs.readFileSync(dataFile, "utf8");
        var  obj = JSON.parse(data); 

        //res.send(getDailyValues(obj));
        res.send(obj);
        
     }
     else 
          res.send();
  });
  


var dayCount=0;

// receve data from sensors
app.get("/update", function(req, res) {

 console.log("Update"+" "+ req.query.cpm +" "+req.query.user+ " "+req.query.sensorId);
 
 let now = new Date();
 var currentTime = date.format(now, 'YYYY-MM-DD HH:mm:ss'); 
 console.log(currentTime);

console.log(currentTime);
       var obj = {
        table: []
       };
  
       var filename = req.query.user + '.json';

       if(fs.existsSync(filename)){
            console.log(filename +" exists");
            fs.readFile(filename, function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            obj = JSON.parse(data); 
            
            obj.table.push({y:req.query.cpm, x:currentTime, group:req.query.sensorId});
            
            var json = JSON.stringify(obj); 
            fs.writeFile(filename, json); 
            }});
        } else {
            console.log(filename + " does not exist")
            
            for(i=0;i<profiles.length;i++){
                if (req.auth.user==profiles[i].user){
                    obj.user="Tolik";
                    obj.address="100 Kitchell Lake, West Milford, NJ 07480";
                    obj.deviceId="3d-45-f1-dd-e0-f3";
                    obj.push({user:profiles[i].user, address:profiles[i].address,user,userName:profiles[i].userName,
                        deviceId:profiles[i].deviceId});
                } 
            };

            obj.table.push({y:req.query.cpm, x:currentTime, group:req.query.sensorId});
  
            var json = JSON.stringify(obj);
            fs.writeFile(filename, json);
            }
  
      // res.send();

});

app.get(/^(.+)$/, function(req, res){ 
    console.log('static file request : ' + req.params[0]);
   if(req.params[0]=="/update") return;
     res.sendfile( __dirname + req.params[0]);
    
});

var port = 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

function getDailyValues(obj){
    var currentDate=0;
    var avg=0;
    var samples = 0;
    var objOut = {
        table: []
       };

    for (var prop in obj.table) {
        if(!obj.table.hasOwnProperty(prop)) continue;
        var d = date.parse(obj.table[prop].x ,"YYYY-MM-DD hh:mm:ss");
        var day = d.getDate();
        if(day==currentDate){
            avg+=parseInt(obj.table[prop].y);
            samples++;
        }    else {
            if (currentDate) objOut.table.push({y: avg/samples, x: date.format(d, 'YYYY-MM-DD') , group:obj.table[prop].group});
            currentDate=day;
            avg=0;
            samples=0;
            
        }

    }
    return objOut;
}