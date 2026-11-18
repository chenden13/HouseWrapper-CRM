const https = require('https');
https.get('https://chenden13.github.io/housewrapper-price/assets/index-82d43a46.js', (res) => {
  let js = '';
  res.on('data', d => js += d);
  res.on('end', () => {
    console.log('Contains qf?', js.includes('qf=['));
    console.log('Contains g~?', js.includes('g~'));
    console.log('Contains 汽車美容?', js.includes('汽車美容'));
  });
});
