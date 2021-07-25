const helper = require('./helper.js');

const core = require('@actions/core');
const github = require('@actions/github');
const Redmine = require('node-redmine');

async function run() {
  try {
    const context = github.context;
    const octokit = github.getOctokit(core.getInput('token'));

    const hostname = core.getInput('redmine_host');
    const config = {
      apiKey: core.getInput('redmine_apikey')
    };
    const redmine = new Redmine(hostname, config);
    const pr = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number
    });

    const redmine_issue_numbers = await helper.parse_redmine_issues(pr.data.body, hostname);

    redmine_issue_numbers.forEach(id => {
      redmine.get_issue_by_id(id, null, function(err, data) {
        if (err) throw err;

        console.log("describe issue: " + JSON.stringify(data.issue));
      });
    });
  } catch (error) {
    console.error("error: " + error);
    process.exit(1);
  }
}

run();
