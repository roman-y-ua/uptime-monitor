export async function createIssue(octokit, owner, repo, title, body) {
  await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
  });
}
