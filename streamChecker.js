var http = require('http');
const Logger = require('./logger');
const sha256 = require('sha256');
var fs = require("fs");
const NodeRSA = require('node-rsa');
var path = require("path");

var rtmp;
var pubKey;
var frames;

class streamChecker{    
    constructor(rtmp){
        this.rtmp = rtmp;
        var path = path.resolve('../Cert/public.perm');
        this.pubKey = fs.readFileSync(path, "utf8");
    }
    newFrame(streamid, timestamp, data){
        var newFrame = {
            frame:{
                streamid: streamid,
                timestamp: timestamp,
                data: data
            }
        }
        this.frames.push(newFrame);
        this.checkFrames();
    }
    checkFrames(){
        for(var i =0; i < frames.length; i++){
            this.getJsonData(frame[i]);
        }
    }
    getJsonData(frame){
        try{
            http.get({
                hostname: 'bigbrotter.herokuapp.com',
                port: 80,
                path: '/api/integrity/'+frame.streamid+"."+frame.timestamp,
                agent: false  
            }, (res) => {
                this.hashCheckFrame(frame, res);
            });
        }
        catch(Exception){
            Logger.log("JSON data ophalen mislukt");
            Logger.log(Exception);
        }
    }

    hashCheckFrame(frame, frameCheck){
        if(frameCheck != null){
            try{
                var frameHash = sha256(frame.data);
                //decrypten
                var decrypter = new NodeRSA(this.pubKey);
                var frameFileHash = decrypter.decrypt(frameCheck.data,'base64');
                
                //hashcheck
                if(frameHash == frameFileHash){
                    Logger.log("hash goed");
                    return;
                }
            }
            catch(Exception){
                Logger.log(Exception);
                return;
            }
        }
        Logger.log("hash is fout, stream stoppen");
        rtmp.stop();

    }
}

module.exports = streamChecker;