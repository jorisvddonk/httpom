const childProcess = require('child_process');
var process = require('process');
try {
    var giphy_results = JSON.parse(context.responseBody.toString());
    var url = giphy_results.data[0].embed_url;
    if (process.platform === 'win32') {
        childProcess.spawn('cmd.exe', ['/c', 'start', url]);
    } else {
        console.log("Sorry, this script doesn't support non-windows platforms!");
    }
} catch (e) {
    console.error("Oops, something went wrong!");
    console.error(e);
}