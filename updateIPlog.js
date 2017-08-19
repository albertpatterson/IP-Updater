const ipUpdater = require('./ipUpdater');

const fileToUpdate = './iplog.txt';

ipUpdater.updateIpOnGitHub(fileToUpdate);

// setInterval(function(){
//     console.log('Checking IP @ ' + new Date().toUTCString());
//     ipUpdater.updateIpOnGitHub(fileToUpdate);
// }, 1*60*60e3);