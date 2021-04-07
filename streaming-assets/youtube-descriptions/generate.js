const fs = require('fs');
const removeMd = require('remove-markdown');

const rawData = fs.readFileSync('./../../data/sessionize.json');
const data = JSON.parse(rawData);
let result = '';

for (let session of data.sessions) {
    console.log(session.title);
    const answers = session.questionAnswers;
    const shortTitle = answers.find(q => q.questionId === 28454).answerValue;

    // title
    result += session.title + '\n';
    result += '=============================================================================\n'

    // description
    result += removeMd(session.description).replace('\r\n', '\n\n').replace('\n', '\n\n');

    // speaker
    const speakers = session.speakers.map(speakerId => data.speakers.find(s => s.id === speakerId));
    let speakersText = speakers.sort((a, b) => a.lastName > b.lastName ? 1 : -1).map(s => s.firstName + ' ' + s.lastName + (s.tagLine && speakers.length === 1 ? ', ' + s.tagLine : '')).join(', ');
    if (speakers.length > 1 && shortTitle === 'dwh-porsche') {
        speakersText += ' (Porsche Holding Salzburg)';
    }
    result += '\n\n';
    result += speakersText + '\n\n';

    result += 'Global Azure Austria 2021\n';
    result += '*****************************************************************************\n';
    result += `Event Website: https://globalazure.at\n`;
    result += `Event Schedule: https://globalazure.at/schedule\n`;
    result += `Session Details: https://globalazure.at/sessions/${shortTitle}\n`;
    result += `Join us on Discord: https://discord.gg/CVGFZFy\n`;
    result += '*****************************************************************************\n\n';

    result += '=============================================================================\n'
    result += '=============================================================================\n\n'
}

// save
fs.writeFileSync('./youtube-descriptions.txt', result, { encoding: 'utf-8' });
