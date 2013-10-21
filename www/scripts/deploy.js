'use strict';

// Deploy the website to S3

var AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    fs = require('fs'),
    mime = require('mime'),
    walk = require('walk');


function travel(folder, callback,done) {
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
        if (done) {
            done();    
        }
    });
}

function upload(options,file,callback) {
    var bucket = options.bucket;
    var root = options.root;
    var mimeType = mime.lookup(file);
    var target = file.replace(root,"");
    if (target.charAt(0) == "/")
        target = target.substr(1);
    console.log("Uploading " + file + " to s3://" + bucket + "/" + target);
    
    fs.readFile(file,function(err,data) {
        var params = {
            Bucket : bucket,
            Key : target,
            ACL : "public-read",
            ContentType : mimeType,
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
    var code = 0;
    var options = {
        bucket : "tinyboy-preview",
        root : folder
    }
    travel(folder,function(root,stat,next){
        upload(options,root+ "/" +stat.name,function(err) {
            if (err)
                code = 1;
            next();
        });
    },function() {
        process.exit(code);
    });
})();