const axios = require('axios')
const core = require('@actions/core');
const fs = require('fs');

const wait = function (milliseconds) {
    return new Promise((resolve) => {
        if (typeof milliseconds !== 'number') {
            throw new Error('milliseconds not a number');
        }
        setTimeout(() => resolve("done!"), milliseconds)
    });
};

async function run() {
    try {

        // Setup general variables
        const apiEndpoint = 'https://api.crashtest.cloud/webhook';
        const pollTimeout = 60000; // Polling the scan status every 60 seconds
        let status = 100; // 100 = Queued
        let scanId = undefined;

        // Load Configuration
        const crashtestWebhook = core.getInput('crashtest-webhook');
        const pullReport = core.getInput('pull-report');

        console.log(`Sending Webhook for ${crashtestWebhook}`);

        // Start the Security Scan
        try {
            const response = await axios.post(`${apiEndpoint}/${crashtestWebhook}`);
            scanId = response.data.data.scanId;
        } catch(error) {
            errorMsg = error.response.data.message
            core.setFailed(`Could not start Scan for Webhook ${crashtestWebhook}. Reason: ${errorMsg}.`);
            return
        }

        // Check if the scan was correctly started
        if (!scanId) {
            core.setFailed(`Could not start Scan for Webhook ${crashtestWebhook}.`);
            return
        }

        console.log(`Started Scan for Webhook ${crashtestWebhook}. Scan ID is ${scanId}.`)

        // Check if the action should wait for the report and download it
        if (pullReport === 'false') {
            console.log(`Skipping the download of the scan report as pull-report='${pullReport}'.`);
            return
        }

        // Wait until the scan has finished
        while (status <= 101) {
            console.log(`Scan Status currently is ${status} (101 = Running)`);

            // Only poll every minute
            await wait(pollTimeout);

            // Refresh status
            try {
                const response = await axios.get(`${apiEndpoint}/${crashtestWebhook}/scans/${scanId}/status`);
                status = response.data.data.status.status_code;
            } catch(error) {
                errorMsg = error.response.data.message
                core.setFailed(`Retreiving Scan Status failed for Webhook ${crashtestWebhook}. Reason: ${errorMsg}.`);
                return
            }

        }

        console.log(`Scan finished with status ${status}.`)

        // Download the JUnit Report
        let junitReport = undefined;
        try {
            const response = await axios.get(`${apiEndpoint}/${crashtestWebhook}/scans/${scanId}/report/junit`)
            junitReport = response.data;
        } catch(error) {
            errorMsg = error.response.data.message
            core.setFailed(`Downloading Report failed for Webhook ${crashtestWebhook}. Reason: ${errorMsg}.`);
            return
        }

        fs.writeFile('report.xml', junitReport, function(error) {
            if (error) {
                core.setFailed(`Writing the Report failed for Webhook ${crashtestWebhook}. Reason: ${error}`);
            }
        });
        
        console.log('Downloaded Report to report.xml');

    } catch (error) {
        core.setFailed(error.message);
        return
    }
}

run();