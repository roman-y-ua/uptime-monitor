import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';

import { checkSites } from "./checker.js";
import { ensureLogFile, appendLogLines, getLastLines } from "./logger.js";
import { getTimeInTimezoneWithOffset } from "./time.js";
import { createIssue } from "./github.js";

async function run() {
  try {
    const sitesInput = core.getInput("sites", { required: true });
    const timezone = core.getInput("timezone") || "UTC";
    const logFile = core.getInput("log-file") || "uptime-monitor-results.log";
    const commitMessage =
      core.getInput("commit-message") || "🔍 Websites uptime check";

    const timeoutMs = parseInt(core.getInput("timeout") || "15", 10) * 1000;

    const successCodes = (core.getInput("success-codes") || "200,201,202,204")
      .split(",")
      .map((code) => parseInt(code.trim(), 10))
      .filter((code) => !isNaN(code));

    const maxConcurrent = parseInt(core.getInput("max-concurrent") || "5", 10);
    const shouldCreateIssue =
      core.getInput("create-issue").toLowerCase() !== "false";

    function isValidUrl(string) {
      try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }

    const sites = sitesInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((s) => {
        if (!isValidUrl(s)) {
          core.warning(`Invalid URL skipped: ${s}`);
          return false;
        }
        return true;
      });

    if (sites.length === 0) {
      throw new Error(
        "No valid sites were provided. Please specify at least one valid HTTP/HTTPS URL."
      );
    }

    await ensureLogFile(logFile);

    const results = await checkSites(sites, {
      timeoutMs,
      maxConcurrent,
      timezone,
    });

    const logLines = [];
    let anyFailed = false;
    let failureLines = "";

    for (const {
      url,
      status,
      responseTimeSec,
      errorMessage,
      timestamp,
    } of results) {
      if (errorMessage) {
        logLines.push(
          `[${timestamp}] ${url} → Status: ${status}, Response: ${responseTimeSec.toFixed(
            3
          )}s, Error: ${errorMessage}\n`
        );
      } else {
        logLines.push(
          `[${timestamp}] ${url} → Status: ${status}, Response: ${responseTimeSec.toFixed(
            3
          )}s\n`
        );
      }

      if (!successCodes.includes(status)) {
        anyFailed = true;
        const suffix = errorMessage ? ` (${errorMessage})` : "";
        failureLines += `* **${url}** returned status **${status}**${suffix}\n`;
      }
    }

    await appendLogLines(logFile, ["\n---\n", ...logLines]);

    if (anyFailed && shouldCreateIssue) {
      core.info("One or more sites returned non-success. Creating an issue…");

      const now = getTimeInTimezoneWithOffset(timezone);
      const issueTitle = `🚨 Uptime Alert: Site(s) down at ${now}`;
      const issueBody = `
The following site(s) returned a non-success HTTP status at **${now}**:

${failureLines}

<details>
<summary>Latest log excerpt</summary>

\`\`\`
${(await getLastLines(logFile, 20)).join("\n")}
\`\`\`
</details>
`;

      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error(
          "GITHUB_TOKEN is not defined. Please pass it in via env: in your workflow."
        );
      }

      const octokit = github.getOctokit(token);
      const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

      await createIssue(octokit, owner, repo, issueTitle, issueBody.trim());
      core.info("Issue created successfully.");
    } else {
      core.info("All sites returned success codes.");
    }

    core.info(`Staging & committing ${logFile}`);
    await exec("git", ["config", "user.name", "github-actions"]);
    await exec("git", [
      "config",
      "user.email",
      "github-actions@users.noreply.github.com",
    ]);
    await exec("git", ["add", logFile]);

    let gitStatus = "";
    await exec("git", ["status", "--porcelain"], {
      listeners: {
        stdout: (data) => {
          gitStatus += data.toString();
        },
      },
    });

    if (gitStatus.trim().length > 0) {
      await exec("git", ["commit", "-m", commitMessage]);
      await exec("git", ["push"]);
      core.info("Log file committed and pushed.");
    } else {
      core.info("No changes to commit.");
    }

    const failedCount = results.filter(
      (r) => !successCodes.includes(r.status)
    ).length;
    core.setOutput("failed-sites", failedCount.toString());
    core.setOutput("total-sites", sites.length.toString());
    core.setOutput("log-file-path", logFile);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
