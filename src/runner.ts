import * as cp from 'child_process';
import * as fs from 'fs';
import * as pt from 'path';
import * as core from "@actions/core";

import { messages } from './messages'

export interface RunDetails
{
	exitCode : number
} 

export interface RunOptions
{
    /* Working directory for running Jtest. */
    workingDir: string;

    /* Installation folder of Parasoft Jtest. */
    installDir: string;

    /* Test configuration to be used when running code analysis. */
    testConfig: string;

    /* Output folder for analysis reports. */
    reportDir: string;

    /* Format of analysis reports. */
    reportFormat: string;

    /* Input scope for analysis - usually jtest.data.json. */
    input: string;

    /* Additional parameters for jtestcli executable. */
    additionalParams: string;
}

export class AnalysisRunner
{

    async run(runOptions : RunOptions) : Promise<RunDetails>
    {
        if (!fs.existsSync(runOptions.workingDir)) {
            return Promise.reject(messages.wrk_dir_not_exist + runOptions.workingDir);
        }
        const commandLine = this.createCommandLine(runOptions).trim();
        if (commandLine.length === 0) {
            return Promise.reject(messages.cmd_cannot_be_empty);
        }

        core.info(commandLine);

        const runPromise = new Promise<RunDetails>((resolve, reject) =>
        {
            const cliEnv = this.createEnvironment();
            const cliProcess = cp.spawn(`${commandLine}`, { cwd: runOptions.workingDir, env: cliEnv, shell: true, windowsHide: true });

            cliProcess.stdout?.on('data', (data) => { core.info(`${data}`.replace(/\s+$/g, '')); });
            cliProcess.stderr?.on('data', (data) => { core.info(`${data}`.replace(/\s+$/g, '')); });
            cliProcess.on('close', (code) => {
                const result : RunDetails = {
                    exitCode : (code != null) ? code : 150 // 150 = signal received
                };
                resolve(result);
            });
            cliProcess.on("error", (err) => { reject(err); });
        });

        return runPromise;
    }

    private createCommandLine(runOptions : RunOptions) : string
    {
        let jtestcli = 'jtestcli';
        if (runOptions.installDir) {
            jtestcli = '"' + pt.join(runOptions.installDir, jtestcli) + '"';
        }

        const commandLine = "${jtestcli} -config \"${testConfig}\" -property report.format=${reportFormat} -report \"${reportDir}\" -data \"${input}\" ${additionalParams}".
            replace('${jtestcli}', `${jtestcli}`).
            replace('${workingDir}', `${runOptions.workingDir}`).
            replace('${installDir}', `${runOptions.installDir}`).
            replace('${testConfig}', `${runOptions.testConfig}`).
            replace('${reportDir}', `${runOptions.reportDir}`).
            replace('${reportFormat}', `${runOptions.reportFormat}`).
            replace('${input}', `${runOptions.input}`).
            replace('${additionalParams}', `${runOptions.additionalParams}`);

        return commandLine;
    }

    private createEnvironment() : NodeJS.ProcessEnv
    {
        const environment: NodeJS.ProcessEnv = {};
        environment['PARASOFT_SARIF_XSL'] = pt.join(__dirname, "sarif.xsl");
        let isEncodingVariableDefined = false;
        for (const varName in process.env) {
            if (Object.prototype.hasOwnProperty.call(process.env, varName)) {
                environment[varName] = process.env[varName];
                if (varName.toLowerCase() === 'parasoft_console_encoding') {
                    isEncodingVariableDefined = true;
                }
            }
        }
        if (!isEncodingVariableDefined) {
            environment['PARASOFT_CONSOLE_ENCODING'] = 'utf-8';
        }
        return environment;
    }

}