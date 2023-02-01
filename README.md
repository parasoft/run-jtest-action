# Run Parasoft Jtest

[![Build](https://github.com/parasoft/run-jtest-action/actions/workflows/build.yml/badge.svg)](https://github.com/parasoft/run-jtest-action/actions/workflows/build.yml)
[![CodeQL](https://github.com/parasoft/run-jtest-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/parasoft/run-jtest-action/actions/workflows/codeql-analysis.yml)
[![Test](https://github.com/parasoft/run-jtest-action/actions/workflows/test.yml/badge.svg)](https://github.com/parasoft/run-jtest-action/actions/workflows/test.yml)

This action enables you to run code analysis with Parasoft Jtest and review analysis results directly on GitHub. 

Parasoft Jtest is a testing tool that automates software quality practices for Java applications. It uses a comprehensive set of analysis techniques, including pattern-based static analysis, dataflow analysis, metrics, code coverage, and unit testing to help you verify code quality and ensure compliance with industry standards, such as CWE, OWASP, and CERT.
 - Request [a free trial](https://www.parasoft.com/products/parasoft-jtest/jtest-request-a-demo/) to receive access to Parasoft Jtest's features and capabilities.
 - See the [user guide](https://docs.parasoft.com/display/JTEST20202) for information about Parasoft Jtest's capabilities and usage.

Please visit the [official Parasoft website](http://www.parasoft.com) for more information about Parasoft Jtest and other Parasoft products.

## Quick start

To analyze your code with Parasoft Jtest and review analysis results on GitHub, you need to customize your GitHub workflow to include:
 - Integration with your build to determine the scope of analysis. 
 - The action to run Jtest.
 - The action to upload the Jtest analysis report in the SARIF format to GitHub.
 - The action to upload the Jtest analysis reports in other formats (XML, HTML, etc.) to GitHub as workflow artifacts.

### Prerequisites
This action requires Parasoft Jtest with a valid Parasoft license.

We recommend that you run Parasoft Jtest on a self-hosted rather than GitHub-hosted runner.

### Adding the Jtest Action to a GitHub Workflow
Add the `Run Jtest` action to your workflow to launch code analysis with Parasoft Jtest.

At a minimum, the action requires the `input` parameter to be configured to specify the path to a JSON input file that determines the scope of analysis. In typical scenarios, the input file `jtest.data.json` is generated by the build system you are using. See [Generating a JSON Input File](#generating-a-json-input-file).

#### Generating a JSON Input File
To perform code analysis, Jtest requires a JSON input file that determines the scope of analysis. To generate the input file as part of your GitHub workflow, add a Gradle or Maven command line as a step that precedes running the `Run Jtest` action. The command line must include the `-Djtest.skip=true` option to generate a `jtest.data.json` file without performing code analysis.

Gradle command line:
```yaml
- name: Generate JSON input file with Gradle
  run: ./gradlew clean build jtest -I /path/to/jtest/integration/gradle/init.gradle "-Djtest.skip=true"
```
Maven command line:
```yaml
- name: Generate JSON input file with Maven
  run: ./mvnw clean install jtest:jtest "-Djtest.skip=true"
```
See [Parasoft Jtest User Guide](https://docs.parasoft.com/display/JTEST20202/Running+Static+Analysis+1) for details.


### Uploading Analysis Results to GitHub
By default, the Run Jtest action generates analysis reports in the SARIF, XML, and HTML format  (if you are using a Jtest version earlier than 2021.1, see [Generating SARIF Reports with Jtest 2020.2 or Earlier](#generating-sarif-reports-with-jtest-20202-or-earlier)).

When you upload the SARIF report to GitHub, the results will be presented as GitHub code scanning alerts. This allows you to review the results of code analysis with Parasoft Jtest directly on GitHub as part of your project. To upload the SARIF report to GitHub, modify your workflow by adding the `upload-sarif` action.

To upload reports in other formats, modify your workflow by adding the `upload-artifact` action.


### Examples
The following examples show simple workflows made up of one job for projects built with Gradle and Maven. The examples assume that Jtest is run on a self-hosted runner and the path to the `jtestcli` executable is available on `PATH`.

#### Run Jtest with Gradle project

```yaml

# This is a basic workflow to help you get started with the Run Jtest action.
name: Jtest with Gradle

on:
  # Trigger the workflow on push or pull request events but only for the main branch.
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

  # Allows you to run this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  build:
    name: Analyze project with Jtest
    
    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:
    
    # Checks out your repository under $GITHUB_WORKSPACE, so that your job can access it.
    - name: Checkout repository
      uses: actions/checkout@v3
      
    # Generates the jtest.data.json input file.
    - name: Create input for Jtest
      run: ./gradlew clean build jtest -I /path/to/jtest/integration/gradle/init.gradle "-Djtest.skip=true"

    # Runs code analysis with Jtest.
    - name: Run Jtest
      id: jtest
      uses: parasoft/run-jtest-action@2.0.0
      with:
        #Uses the jtest.data.json generated with the Gradle command in the previous step
        input: build/jtest/jtest.data.json

    # Uploads analysis results in the SARIF format, so that they are displayed as GitHub code scanning alerts.
    - name: Upload results (SARIF)
      if: always()
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: reports/report.sarif # reports is a default location for reports directory

    # Uploads an archive that includes all report files (.xml, .html, .sarif).
    - name: Archive reports
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: Static analysis reports
        path: reports/*.*

```

#### Run Jtest with Maven project

```yaml

# This is a basic workflow to help you get started with the Run Jtest action.
name: Jtest with Maven

on:
  # Trigger the workflow on push or pull request events but only for the main branch.
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

  # Allows you to run this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  build:
    name: Analyze project with Jtest
    
    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:
    
    # Checks out your repository under $GITHUB_WORKSPACE, so that your job can access it.
    - name: Checkout repository
      uses: actions/checkout@v3
    
    # Generates the jtest.data.json input file.
    - name: Create input for Jtest
      run: ./mvnw clean install jtest:jtest "-Djtest.skip=true" 

    # Runs code analysis with Jtest
    - name: Run Jtest
      id: jtest
      uses: parasoft/run-jtest-action@2.0.0
      with:
        #Uses the jtest.data.json generated with the Maven command in the previous step
        input: target/jtest/jtest.data.json

    # Uploads analysis results in the SARIF format, so that they are displayed as GitHub code scanning alerts.
    - name: Upload results (SARIF)
      if: always()
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: reports/report.sarif # reports is a default location for reports directory

    # Uploads an archive that includes all report files (.xml, .html, .sarif).
    - name: Archive reports
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: Static analysis reports
        path: reports/*.*

```

## Configuring Analysis with Jtest
You can configure analysis with Parasoft Jtest in the following ways:
 - By customizing the `Run Jtest` action directly in your GitHub workflow. See [Action Parameters](#action-parameters) for a complete list of available parameters.
 - By configuring options directly in Parasoft Jtest tool. We recommend creating a jtestcli.properties file that includes all the configuration options and adding the file to Jtest's working directory - typically, the root directory of your repository. This allows Jtest to automatically read all the configuration options from that file. See [Parasoft Jtest User Guide](https://docs.parasoft.com/display/JTEST20202/Configuration+1) for details.

### Examples
This section includes practical examples of how the `Run Jtest` action can be customized directly in the YAML file of your workflow. 

#### Configuring the Path to the Jtest Installation Directory
If `jtestcli` executable is not on `PATH`, you can configure the path to the installation directory of Parasoft Jtest, by configuring the `installDir` parameter:

```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@2.0.0
  with:
    installDir: '/opt/parasoft/jtest'
```

#### Defining the Scope for Analysis
You can configure the `input` parameter to provide the path to a JSON file that defines the scope of analysis. [Parasoft Jtest User Guide](https://docs.parasoft.com/display/JTEST20202/Running+Static+Analysis+1) for details.

```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@2.0.0
  with:
    input: 'build/demo.data.json'
```

#### Configuring a Jtest Test Configuration
Code analysis with Jtest is performed by using a test configuration - a set of static analysis rules that enforce best coding practices or compliance guidelines. Parasoft Jtest ships with a wide range of [built-in test configurations](https://docs.parasoft.com/display/JTEST20202/Built-in+Test+Configurations).
To specify a test configuration directly in your workflow, add the `testConfig` parameter to the `Run Jtest` action and specify the URL of the test configuration you want to use:
```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@2.0.0
  with:
    testConfig: 'builtin://Recommended Rules'
```

#### Generating SARIF Reports with Jtest 2020.2 or Earlier
Generating reports in the SARIF format is available in Jtest since version 2021.1. If you are using an earlier Jtest version, you need to customize the `Run Jtest` action to enable generating SARIF reports:
```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@2.0.0
  with:
    reportFormat: xml,html,custom
    additionalParams: '-property report.custom.extension=sarif -property report.custom.xsl.file=${PARASOFT_SARIF_XSL}'
```

#### Baselining Static Analysis Results in Pull Requests
In GitHub, when a pull request is created, static analysis results generated for the branch to be merged are compared with the results generated for the integration branch. As a result, only new violations are presented, allowing developers to focus on the relevant problems for their code changes.
For this baselining to succeed, make sure your static analysis workflow triggers for pull requests. For example:
```yaml
on:
  # Triggers the workflow on push or pull request events but only for the main branch.
  pull_request:
    branches: [ main ]
```

##### Defining the Branch Protection Rule
You can define a branch protection rule for your integration branch that will block pull requests due to new violations or errors. To configure this:
1. In the GitHub repository GUI, go to **Settings>Branches**.
1. Make sure your default integration branch is configured. If needed, select the appropriate branch in the **Default branch** section.
1. Define the branch protection rule. In the **Branch protection rule** section click **Add rule**. Enable the **Require status checks to pass before merging** option and specify which steps in the pipeline should block the merge. Type the status check name in the search field to select it (only the status checks run during the last week are listed).
- You can specify that the merge will be blocked if any violations are found as a result of the analysis by selecting the appropriate GitHub Code Scanning tool. If the GitHub Code Scanning tool is not available, you need to run a pull request for the integration branch first.
- You can specify that the merge will be blocked if any defined job is not completed because of errors in its configuration by selecting the job build name. If no jobs are available, you need to run a workflow from the integration branch first. For example, when you execute the default Jtest pipeline, the 'Run Jtest' job will be available and can be used as a status check.

If a pull request is blocked due to failed checks, the administrator can still manually perform the merge using the **Merge without waiting for requirements to be met** option.

## Action Parameters
The following inputs are available for this action:
| Input | Description |
| --- | --- |
| `installDir` | Installation folder of Parasoft Jtest. If not specified, the jtestcli` executable must be added to $PATH. |
| `workingDir` | Working directory for running Jtest. If not specified, `${{ github.workspace }}` will be used.|
| `testConfig` | Test configuration to be used for code analysis. The default is `builtin://Recommended Rules`.|
| `reportDir` | Output folder for reports from code analysis. If not specified, report files will be created in the `reports` folder.|
| `reportFormat`| Format of reports from code analysis. The default is `xml,html,sarif`.|
| `input` | Input scope for analysis, typically `jtest.data.json`.|
| `additionalParams` | Additional parameters for the `jtestcli` executable.|
