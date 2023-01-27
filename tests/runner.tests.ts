import * as assert from 'assert';
import * as sinon from 'sinon';
import * as pt from 'path';
import * as core from "@actions/core";
import * as cp from 'child_process';
import * as fs from 'fs';
import * as runner from '../src/runner';
import { messages } from '../src/messages';
import { resolve } from 'path';
import { Stream, Writable } from 'stream';
import { Z_UNKNOWN } from 'zlib';
import { ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio, SpawnOptionsWithStdioTuple, StdioNull, StdioPipe } from 'child_process';

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
        } catch (error: any) {
            runnerError = error;
        }

        assert.strictEqual(runnerError, messages.wrk_dir_not_exist + incorrectWorkindDir);
    });

    test('Run - launch jtestcli', async function() {
        const fsExistsSync = sandbox.fake.returns(true);
        sandbox.replace(fs, 'existsSync', fsExistsSync);
        const coreInfo = sandbox.fake();
        sandbox.replace(core, 'info', coreInfo);

       cp.spawn()


        const result = {                
            // stdin: undefi

            // stdio: undefined,
            // killed: undefined,
            // connected: undefined,
            // exitCode: undefined,
            // signalCode: undefined,
            // spawnargs: undefined,
            // spawnfile: undefined,
            // kill: undefined,
            // send: undefined,
            // disconnect: undefined,
            // unref: undefined,
            // ref: undefined,
            // addListener: undefined,
            // emit: undefined,
            // once: undefined,
            // prependListener: undefined,
            // prependOnceListener: undefined,
            // removeListener: undefined,
            // off: undefined,
            // removeAllListeners: undefined,
            // setMaxListeners: undefined,
            // getMaxListeners: undefined,
            // listeners: undefined,
            // rawListeners: undefined,
            // listenerCount: undefined,
            // eventNames: undefined,            
            // stdout: undefined,
            // stderr: undefined,            
            on: function(_event: string, action : any) {
                action();
            }

        } //as any as ChildProcessWithoutNullStreams | ChildProcessByStdio<Writable, Readable, null>;
        const cpSpawn = sandbox.fake.returns(result);

   
                
        sandbox.replace(cp, 'spawn', cpSpawn);
        let jtestcli = 'jtestcli';
        jtestcli = '"' + pt.join('jtestcli', jtestcli) + '"';
        const expectedCommandLine = jtestcli +
            ' -config "builtin://Recommended Rules" -property report.format=xml -report "reportDir" -data "demo.data.json" -property key=value';
        const theRunner = new runner.AnalysisRunner()
        await theRunner.run(
            {
                installDir: 'jtestcli',
                testConfig: 'builtin://Recommended Rules',
                reportDir: 'reportDir',
                reportFormat: 'xml',
                input: 'demo.data.json',
                additionalParams: '-property key=value'
            } as runner.RunOptions);

        assert.strictEqual(cpSpawn.args[0][0], expectedCommandLine);
        assert.strictEqual(coreInfo.arguments, expectedCommandLine);
    });

});