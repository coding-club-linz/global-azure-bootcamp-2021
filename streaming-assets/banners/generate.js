const fs = require('fs');
const { exec, execSync } = require('child_process');

const rawData = fs.readFileSync('./../../data/sessionize.json');
const template = fs.readFileSync('template.svg', { encoding: 'utf-8' });
const data = JSON.parse(rawData);


// banner-logo
execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/banners/banner-logo.png" --export-type "png" "logo.svg"`, (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
});


for (let session of data.sessions) {
    console.log(session.title);

    // title
    let words = session.title.split(' ');
    let chars = 0;
    let title1 = '';
    let title2 = '';

    for (let word of words) {
        if (chars + word.length < 90 && !title2) {
            if (title1) {
                title1 += ' ';
                chars++;
            }

            title1 += word;
            chars += word.length;
        } else {
            if (title2) {
                title2 += ' ';
                chars++;
            }

            title2 += word;
            chars += word.length;
        }
    }

    let svg = template.replace('{{title1}}', title1.replace('&', '&amp;'));
    svg = svg.replace('{{title2}}', title2.replace('&', '&amp;'));

    if (title2) {
        svg = svg.replace('{{bannerHeight}}', 210);
        svg = svg.replace('{{bannerY}}', 1080 - 210);
        svg = svg.replace('{{title1Y}}', 930);
        svg = svg.replace('{{title2Y}}', 980);
    } else {
        svg = svg.replace('{{bannerHeight}}', 160);
        svg = svg.replace('{{bannerY}}', 1080 - 160);
        svg = svg.replace('{{title1Y}}', 980);
        svg = svg.replace('{{title2Y}}', 980);
    }

    // speaker
    const answers = session.questionAnswers;
    let shortTitle = answers.find(q => q.questionId === 28454).answerValue;

    const speakers = session.speakers.map(speakerId => data.speakers.find(s => s.id === speakerId));
    let speakersText = speakers.sort((a, b) => a.lastName > b.lastName ? 1 : -1).map(s => s.firstName + ' ' + s.lastName + (s.tagLine && speakers.length === 1 ? ', ' + s.tagLine : '')).join(', ');
    if (speakers.length > 1 && shortTitle === 'dwh-porsche') {
        speakersText += ' (Porsche Holding Salzburg)';
    }
    svg = svg.replace('{{speakers}}', speakersText); 

    // save
    fs.writeFileSync('./svg/' + shortTitle + '.svg', svg, { encoding: 'utf-8' });

    // convert to png
    execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/banners/${shortTitle}.png" --export-type "png" "svg\\${shortTitle}.svg"`, (error, stdout, stderr) => {
        console.log('   ', error, stdout, stderr);
    });
}
