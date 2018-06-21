const NodeMediaServer = require('node-media-server');
const chokidar = require('chokidar');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const fs = require('fs');

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 200000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 8000,
        mediaroot: './media',
        allow_origin: '*'
    },
    trans: {
        ffmpeg: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
        tasks: [
            {
                app: 'live',
                ac: 'aac',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3]',
            }
        ]
    }
};

var watcher = chokidar.watch('./media/live', {ignored: /(.+\.m3u8)|(.+\.ehash)/, persistent: true, depth: 3});

watcher
    .on('add', (path) => {
        // console.log('File', path, 'has been added');
    })
    .on('change', (path) => {
        console.log('File', path, 'has been changed');
        const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(path);
        input.on('readable', () => {
            const data = input.read();
            if (data)
                hash.update(data);
            else {
                let stringhash = hash.digest('hex');
                console.log(`${stringhash} ${path}`);
                privateKey = fs.readFileSync(`./certificate/private.pem`, {encoding: 'utf-8'});
                const objectPrivatePem = new NodeRSA(privateKey);
                const encrypted = objectPrivatePem.encryptPrivate(hash, 'base64');
                console.log(`${encrypted} ${path}`);
                fs.writeFile(path + ".ehash", encrypted, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log(`The hashfile was saved! ${path + '.ehash'}`);
                });
            }
        });
    })
    .on('unlink', (path) => {
        // console.log('File', path, 'has been removed');
    })
    .on('error', (error) => {console.error('Error happened', error);});

var nms = new NodeMediaServer(config);
nms.run();