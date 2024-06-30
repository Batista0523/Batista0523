const fs = require('fs');
const fetch = require('node-fetch');

async function getGitHubStats(username) {
  const response = await fetch(`https://api.github.com/users/${username}/repos`);
  const repos = await response.json();

  const languages = {};
  for (const repo of repos) {
    if (!repo.fork) {
      const response = await fetch(repo.languages_url);
      const repoLanguages = await response.json();
      for (const [language, lines] of Object.entries(repoLanguages)) {
        if (languages[language]) {
          languages[language] += lines;
        } else {
          languages[language] = lines;
        }
      }
    }
  }

  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([language, lines]) => `${language}: ${lines} lines`)
    .join('\n');

  return topLanguages;
}

async function updateReadme() {
  const username = 'Batista0523'; 
  const stats = await getGitHubStats(username);

  const readmePath = './README.md';
  const readmeContent = fs.readFileSync(readmePath, 'utf8');

  const newReadmeContent = readmeContent
    .replace(/<!-- STATS:START -->([\s\S]*?)<!-- STATS:END -->/, `<!-- STATS:START -->\n${stats}\n<!-- STATS:END -->`);

  fs.writeFileSync(readmePath, newReadmeContent);
}

updateReadme();
