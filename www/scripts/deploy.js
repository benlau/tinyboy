'use strict';

// Deploy the website to S3

var AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    fs = require('fs'),
    walk = require('walk');


function travel(folder, callback) {
    var options = {
            followLinks: false,
            filters: ["*.DS_Store", "*.swp"]
        },
        walker = walk.walk(folder, options);
    
    walker.on("file", function(root, stat, next) {
        if (callback) {
            callback(root, stat, next);
        } else {
            next();
        }
    });
    
    walker.on("end", function(){
        console.log("Done");    
    });
}

function upload(bucket,file,callback) {
    console.log("Uploading " + file);
    fs.readFile(file,function(err,data) {
        var params = {
            Bucket : bucket,
            Key : file,
            Body : data
        }
        s3.putObject(params,function(err,data) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    });
    
}


(function() {
    var folder = "www/src";
    travel(folder,function(root,stat,next){
        upload("tinyboy-preview",root+ "/" +stat.name,function(err) {
            next();
        });
    });
})();