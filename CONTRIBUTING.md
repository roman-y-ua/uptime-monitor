# Contributing Guidelines

Thank you for your interest in improving this project! To streamline collaboration and ensure every change is well‑tracked, please follow these steps:

## 1. Open an Issue

### Describe the problem or proposal: 
Clearly state the bug, enhancement request, or support needed.

### Include details: 
Provide reproduction steps, expected vs. actual behavior, screenshots or logs if applicable.

### Label appropriately: 
Use existing labels (bug, enhancement, help wanted, etc.) where possible.

### Please note
Pull requests without a corresponding issue will not be considered.

## 2. Get Assigned

After creating an issue, await assignment by a maintainer or ask in the issue for someone to assign it to you.

This helps avoid duplicate work and keeps contributions coordinated.

## 3. Work on Your Changes

Here is a detailed breakdown on how to setup the project locally:

1. Fork the repository 

2. Clone the project to run on your local machine using `git clone` command

    ```sh
    git clone https://github.com/cd-roman/uptime-monitor.git
    ```

3. Navigate to the root directory using `cd` command

    ```sh
    cd uptime-monitor
    ```

4. Install all dependencies

   ```sh
   npm install
   ```
   
5. Create a branch:

   ```sh
   git checkout -b <your-branch-name>
   ```
   
6. Implement your fix or feature.

7. Write tests for new functionality or to reproduce bugs if applicable.

8. Ensure your changes pass existing tests as well:

   ```sh
   npm test
   ```

10. Update documentation if behavior or usage changes.

11. Stage your changes by running

    ```sh
    git add <filename>
    ```

    or

    ```sh
    git add .
    ```

11. Commit your changes

    ```sh
    git commit -m "<your-commit-message>"
    ```

12. Push your changes to your branch

    ```sh
    git push origin "<your_branch_name>"
    ```

If you make changes to the action logic, you can test them by running the local version using uses: "./" in a workflow within the same repository. See an example [here](https://github.com/cd-roman/uptime-monitor/blob/main/.github/workflows/smoke-test.yml) Otherwise, skip this step.

## 4. Create a Pull Request

Title: Include the issue number (e.g., Fix typo in README (#123)).

Description: Summarize what changes were made and why, and reference the issue (Closes #123).

A maintainer will review and provide feedback or merge your PR.

## Code of Conduct

All contributors are expected to be respectful and collaborative.
