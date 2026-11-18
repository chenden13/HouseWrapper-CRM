const https = require('https');
https.get('https://chenden13.github.io/housewrapper-price/', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const match = data.match(/assets\/index-[a-z0-9]+\.js/);
    if(match) {
      console.log('Found JS:', match[0]);
      https.get('https://chenden13.github.io/housewrapper-price/'+match[0], (res2) => {
        let js = '';
        res2.on('data', d => js += d);
        res2.on('end', () => {
          console.log('Contains g~?', js.includes('g~'));
          console.log('Contains 汽車美容?', js.includes('汽車美容'));
        });
      });
    } else {
      console.log('JS not found');
    }
  });
});
