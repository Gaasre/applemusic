var request = require('request');
const jsdom = require('jsdom');
const fs = require('fs');
const http = require('https');

var musicList = [];

var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);
        });
    });
}




request({
        uri: 'https://music.apple.com/us/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31'
    },
    function (error, response, body) {
        const dom = new jsdom.JSDOM(body);
        var jsonobj = JSON.parse(dom.window.document.querySelector('#shoebox-ember-data-store').textContent);
        var musiclist = jsonobj.included.filter(x => x.type === 'product/playlist/song');
        var preview = jsonobj.included.filter(x => x.attributes.assets);
        var image = jsonobj.included.filter(x => x.type === 'image');
        musiclist.forEach(music => {
            var musicInfo = {
                artist: music.attributes.artistName,
                name: music.attributes.name,
                id: music.relationships.offers.data[0].id,
                imageid: music.relationships.artwork.data.id,
                preview: '',
                picture: ''
            };
            if (preview.find(x => x.id === musicInfo.id).attributes.assets[0].preview) {
                musicInfo.preview = preview.find(x => x.id === musicInfo.id).attributes.assets[0].preview.url;
            }
            musicInfo.picture = image.find(x => x.id === musicInfo.imageid).attributes.url.replace('{w}', '300').replace('{h}', '300').replace('{f}', 'jpg');
            musicList.push(musicInfo);
            console.log(musicInfo);
            /*download(musicInfo.picture, `./tmp/imgs/${musicInfo. artist} - ${musicInfo.name}.jpg`, () => {
                console.log(`${musicInfo. artist} - ${musicInfo.name}.jpg downloaded !`);
                download(musicInfo.preview, `./tmp/previews/${musicInfo. artist} - ${musicInfo.name}.m4a`, () => {
                    console.log(`${musicInfo. artist} - ${musicInfo.name}.m4a downloaded !`);
                });
            });*/
        });
        fs.writeFile("./tmp/test.json", JSON.stringify(musicList), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('done');
        });
    }
);