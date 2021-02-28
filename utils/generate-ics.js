const fs = require('fs');
const path = require('path')

fs.readFile(path.join('.', 'data', 'sessionize.json'), 'utf8', function (err, sessionsContents) {
    fs.readFile(path.join('.', 'utils', 'ics-template.txt'), 'utf8', function (err, icsTemplateContents) {
        const sessions = JSON.parse(sessionsContents);

        for (const session of sessions.sessions.filter(s => !!s.description && !!s.title)) {
            session.description = session.description
                .split('\\r\\n').join('\\n')
                .split('\r').join('')
                .split('\n').join('\\n');

            let shortTitle;
            if (session.questionAnswers) {
                const shortAnswerQuestion = session.questionAnswers.filter(qa => qa.questionId == 21790);
                if (shortAnswerQuestion.length > 0) {
                    shortTitle = shortAnswerQuestion[0].answerValue;
                }
            }

            if (!shortTitle) {
                continue;
            }

            const ics = icsTemplateContents
                .split('[TITLE]').join(session.title)
                .replace('[DESCRIPTION]', session.description)
                .replace('[DTSTART]', session.startsAt.split('-').join('').split(':').join(''))
                .replace('[DTEND]', session.endsAt.split('-').join('').split(':').join(''))
                .replace('[URL]', 'https://www.globalazurebootcamp.at/sessions/' + shortTitle);

            fs.writeFileSync(path.join('.', 'static', 'ics', shortTitle + '.ics'), ics);

            const redirectMd = '---\nsessionId: "' + session.id + '"\n---';
            fs.writeFileSync(path.join('.', 'content', 'sessions', shortTitle + '.md'), redirectMd);
        }
    });
});
