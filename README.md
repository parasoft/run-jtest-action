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
Adding the `Run Jtest` action to your workflow allows you to launch code analysis with Parasoft Jtest.

You need to adjust the workflow to collect the required input data for Jtest - depending on the build system you are using (Gradle,Maven, or Ant). See [Parasoft Jtest User Guide](https://docs.parasoft.com/display/JTEST20202/Running+Static+Analysis+1) for details.

The following examples show simple workflows made up of one job "Analyze project with Jtest" for projects built with Gradle and Maven. The example assumes that Jtest is run on a self-hosted runner and the path to the `jtestcli` executable is available on `PATH`.

### Uploading Analysis Results to GitHub
By default, the Run Jtest action generates analysis reports in the SARIF, XML, and HTML format  (if you are using a Jtest version earlier than 2021.1, see [Generating SARIF Reports with Jtest 2020.2 or Earlier](#generating-sarif-reports-with-cctest-20202-or-earlier)).

When you upload the SARIF report to GitHub, the results will be presented as GitHub code scanning alerts. This allows you to review the results of code analysis with Parasoft Jtest directly on GitHub as part of your project. To upload the SARIF report to GitHub, modify your workflow by adding the `upload-sarif` action.

To upload reports in other formats, modify your workflow by adding the `upload-artifact` action.


### Examples
#### Run Jtest with Gradle project

```yaml

# This is a basic workflow to help you get started with the Run Jtest action.
name: Jtest with Gradle

on:
  # Trigger the workflow on push or pull request events but only for the master branch.
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allow running this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  build:
    runs-on: self-hosted

    # prepare environment
    steps:
      ##### Prepare input for jtestcli
      - name: Prepare input for Jtest
        run: ./gradlew clean build jtest -I /path/to/jtest/integration/gradle/init.gradle "-Djtest.skip=true"

      - name: Run Jtest
        id: jtest
        uses: parasoft/run-jtest-action@1.0.0
          with:
            input: build/jtest/jtest.data.json  #required (build system dependent)

    - name: Upload results (SARIF)
        uses: github/codeql-action/upload-sarif@v1
        with:
            sarif_file: reports/report.sarif # reports is a default location for reports directory

      # Upload archive with all report files (.xml, .html, .sarif).
    - name: Archive reports
        uses: actions/upload-artifact@v2
        with:
          name: Static analysis reports
          path: reports/*.*

```
#### Run Jtest with Maven project

```yaml

# This is a basic workflow to help you get started with the Run Jtest action.
name: Jtest with Maven

on:
  # Trigger the workflow on push or pull request events but only for the master branch.
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allow running this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  build:
    runs-on: self-hosted

    # prepare environment
    steps:
      ##### Prepare input for jtestcli
      - name: Prepare input for Jtest
       run: ./mvnw clean install jtest:jtest "-Djtest.skip=true" 

      - name: Run Jtest
        id: jtest
        uses: parasoft/run-jtest-action@1.0.0
          with:
           input: target/jtest/jtest.data.json  

    - name: Upload results (SARIF)
        uses: github/codeql-action/upload-sarif@v1
        with:
            sarif_file: reports/report.sarif # reports is a default location for reports directory

      # Upload archive with all report files (.xml, .html, .sarif).
    - name: Archive reports
        uses: actions/upload-artifact@v2
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
  uses: parasoft/run-jtest-action@1.0.0
  with:
    installDir: '/opt/parasoft/jtest'
```

#### Defining the Scope for Analysis
You can configure the `input` parameter to provide the path to a JSON file that defines the scope of analysis. [Parasoft Jtest User Guide](https://docs.parasoft.com/display/JTEST20202/Running+Static+Analysis+1) for details.

```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@1.0.0
  with:
    input: 'build/demo.data.json'
```

#### Configuring a Jtest Test Configuration
Code analysis with Jtest is performed by using a test configuration - a set of static analysis rules that enforce best coding practices or compliance guidelines. Parasoft Jtest ships with a wide range of [built-in test configurations](https://docs.parasoft.com/display/JTEST20202/Built-in+Test+Configurations).
To specify a test configuration directly in your workflow, add the `testConfig` parameter to the `Run Jtest` action and specify the URL of the test configuration you want to use:
```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@1.0.0
  with:
    testConfig: 'builtin://Recommended Rules'
```

#### Generating SARIF Reports Jtest 2020.2 or Earlier
Generating reports in the SARIF format is available in Jtest since version 2021.1. If you are using an earlier Jtest version, you need to customize the `Run Jtest` action to enable generating SARIF reports:
```yaml
- name: Run Jtest
  uses: parasoft/run-jtest-action@1.0.0
  with:
    reportFormat: xml,html,custom
    additionalParams: '-property report.custom.extension=sarif -property report.custom.xsl.file=${PARASOFT_SARIF_XSL}'
```

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
