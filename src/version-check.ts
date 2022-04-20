const github = require('@actions/github');
const core = require('@actions/core');
const semverDiff = require('semver/functions/diff');

const getPackageJson = async (ref, octokit, path) =>
{
  const packageJSONData = (await octokit.rest.repos.getContent({...github.context.repo, path, ref})).data;
  if (packageJSONData?.type === 'file' && packageJSONData?.content)
  {
    return JSON.parse(Buffer.from(packageJSONData.content, 'base64').toString());
  }
  throw new Error(`Could not find file ${path}`);
};

export async function run()
{
  try
  {
    const token = core.getInput('repo-token', {required: true});
    if (!token)
    {
      return _err(new Error('repo-token not provided'));
    }
    const path = core.getInput('path', {required: false}) || 'package.json';

    const client = github.getOctokit(token);
    const currentPackageJSON = await getPackageJson(github.context.sha, client, path);
    core.setOutput('version', currentPackageJSON.version);

    const compare = core.getInput('compare', {required: false});
    if (compare)
    {
      core.setOutput('version-diff', semverDiff(currentPackageJSON.version, compare));
    }
  }
  catch (error: any)
  {
    return _err(error);
  }
}

function _err(error: any)
{
  core.error(error);
  core.setFailed(error.message);
}
