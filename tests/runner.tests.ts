import * as assert from 'assert';
import * as sinon from 'sinon';
import * as pt from 'path';
import * as core from "@actions/core";
import * as cp from 'child_process';
import * as fs from 'fs';
import * as runner from '../src/runner';
import { messages } from '../src/messages';

suite('run-jtest-action/runner', function() {

    const sandbox = sinon.createSandbox();

    teardown(function() {
        sandbox.restore();
	});

    test('Run - working dir does not exist', async function() {
        const fsExistsSync = sandbox.fake.returns(false);
        sandbox.replace(fs, 'existsSync', fsExistsSync);

        let runnerError : string | undefined;
        const incorrectWorkindDir = '/incorrect/working/dir';
        
        try {
            const theRunner = new runner.AnalysisRunner()
            await theRunner.run({ workingDir : incorrectWorkindDir} as runner.RunOptions);
        } catch (error) {
            runnerError = error;
        }

        assert.strictEqual(runnerError, messages.wrk_dir_not_exist + incorrectWorkindDir);
    });

    test('Run - launch jtestcli', async function() {
        const fsExistsSync = sandbox.fake.returns(true);
        sandbox.replace(fs, 'existsSync', fsExistsSync);
        const coreInfo = sandbox.fake();
        sandbox.replace(core, 'info', coreInfo);
        const cpSpawn = sandbox.fake.returns( {
            stdout: undefined,
            stderr: undefined,
            on: function(_event: string, action : any) {
                action();
            }
        });
        sandbox.replace(cp, 'spawn', cpSpawn);
        let jtestcli = 'jtestcli';
        jtestcli = '"' + pt.join('/opt/parasoft/jtestcli', jtestcli) + '"';
        const expectedCommandLine = jtestcli +
            ' -config "builtin://Recommended Rules" -property report.format=xml -report "reportDir" -data "demo.data.json" -property key=value';
        const theRunner = new runner.AnalysisRunner()
        await theRunner.run(
            {
                installDir: '/opt/parasoft/jtestcli',
                testConfig: 'builtin://Recommended Rules',
                reportDir: 'reportDir',
                reportFormat: 'xml',
                input: 'demo.data.json',
                additionalParams: '-property key=value'
            } as runner.RunOptions);

        assert.strictEqual(cpSpawn.args[0][0], expectedCommandLine);
        assert.strictEqual(coreInfo.args[0][0], expectedCommandLine);
    });

});