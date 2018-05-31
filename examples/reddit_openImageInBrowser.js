const childProcess = require('child_process');
var process = require('process');
try {
    var results = JSON.parse(context.responseBody.toString());
    var childWithImage = results.data.children.find(function(child) {
        return child.data.post_hint == 'image';
    });
    var url = childWithImage.data.url;
    if (process.platform === 'win32') {
        childProcess.spawn('cmd.exe', ['/c', 'start', url]);
    } else {
        console.log("Sorry, this script doesn't support non-windows platforms!");
    }
} catch (e) {
    console.error("Oops, something went wrong!");
    console.error(e);
}