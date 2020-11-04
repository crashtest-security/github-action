# Crashtest Security Action

A Github Action for running a [Crashtest Security](https://crashtest-security.com) scan to perform Dynamic Application Security Testing (DAST).

The Crashtest Security Suite will run a security scan against the scan target that belongs to the given webhook. You can optionally wait for the security scan to finish and download the report as JUnit XML file for further processing or simply start the security scan.

**WARNING** This action will perform attacks on the scan target. You must only run this security scan on targets where you have the permission to run such an attack.

## Inputs

### `crashtest-webhook`

**Required** Webhook Secret of the Crashtest Security Scan Target.

### `pull-report`

Flag whether the report should be downloaded as JUnit XML file. Default `"false"`.

## Example usage

```
    - name: Crashtest Security Action Step
      id: crashtest-security
      uses: crashtest-security/crashtest-security-action@v1
      with:
        crashtest-webhook: '${{ secrets.CRASHTEST_WEBHOOK }}'
        pull-report: 'true'
```

### Display Results

In order to display the test results as annotations, use any action that parses the JUnit XML file. You may use e.g. [https://github.com/marketplace/actions/junit-report](https://github.com/marketplace/actions/junit-report).

```
- name: Publish Test Report
  uses: mikepenz/action-junit-report@v1
  with:
    report_paths: 'report.xml'
    github_token: ${{ secrets.GITHUB_TOKEN }}
```