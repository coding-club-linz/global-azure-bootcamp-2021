const fs = require('fs-extra');
const concat = require('concat');
(async function build() {

    const files = [
        './dist/battleship-coding-contest/runtime.js',
        './dist/battleship-coding-contest/polyfills.js',
        // './dist/battleship-coding-contest/scripts.js',
        './dist/battleship-coding-contest/main.js',
    ]
    try {


        await fs.ensureDir('../static/elements')
        await concat(files, '../static/elements/battleship-coding-contest.js');
        //await fs.copyFile('./dist/angular-elements/styles.css', 'elements/styles.css');
        //await fs.copy('./dist/angular-elements/assets/', 'elements/assets/')

    } catch (e) {

        console.error(e);
    }

})()