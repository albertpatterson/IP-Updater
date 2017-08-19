const ipUpdater = require('./ipUpdater');

const fileToUpdate = './iplog.txt';

ipUpdater.updateIpOnGitHub(fileToUpdate);

// setInterval(function(){
//     ipUpdater.updateIpOnGitHub(fileToUpdate);
// }, 1*60*60e3);