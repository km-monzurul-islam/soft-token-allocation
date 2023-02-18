const os = require('os');
const { chromium } = require('playwright');
const dotenv = require('dotenv');
const prompt = require('password-prompt');
const sendMail = require('./email');
const { readExcel, writeExcel } = require('./readExcel');
const { TokenInfo, OtrcInfo, UserInfo } = require('./class/classes');

dotenv.config({ path: `${__dirname}/config.env` });

async function cmsLogin(page) {
    try {
        await page.goto('https://cms.iam.bns/cms/login.bns');
        await page.fill('input#idToken1', os.userInfo().username);
        await page.fill('input#idToken2', process.env.PASSWORD);
        await page.click('input#loginButton_0');
        try {
            await page.fill(
                'input#idToken1[type=password]',
                await prompt('Token Digits: ', { method: 'hide' })
            );
        } catch (err) {
            throw new Error('Invalid Password');
        }
        await page.click('input#idToken2_0');
        try {
            await page.click('label[title=Support]');
        } catch (err) {
            throw new Error('Invalid token digits');
        }
    } catch (err) {
        throw new Error(err.message);
    }
}

async function allocateToken(page, scotiaID) {
    try {
        await page.click(`label[title='Manage OTRC']`);
        await page.fill('input[type=text]', scotiaID);
        await page.locator('.tble-struct select').selectOption('4');
        await page.click(`input[value='Generate OTRC']`);
        try {
            await page.waitForSelector('table[class=tble]');
        } catch (err) {
            throw new Error('Unable to genetare OTRC for the user');
        }
        let otrcDetails = await page.locator('table[class=tble] tbody tr td');
        otrcDetails = await otrcDetails.allTextContents();
        return new OtrcInfo(...otrcDetails.slice(0, -1));
    } catch (err) {
        throw new Error(err.message);
    }
}

async function getTokenDetails(page, scotiaID) {
    try {
        await page.click('label[title=Support]');
        await page.locator('[tabindex="8"]').fill(scotiaID);
        await page.click('id=manageTokenForm:btnSearch');
        await page.waitForSelector(
            'table[class="tble tablesorter"][id="manageTokenForm:resultSection"]'
        );
        const tokenDetail = await page.locator(
            '[class="tble tablesorter"] tbody tr'
        );
        let [details] = await tokenDetail.allTextContents();
        await page.click('td a');
        const modifiedDate = await page
            .locator('table tbody tr td')
            .nth(0)
            .textContent();
        details = details.trim().split('\n');
        details.push(modifiedDate);
        return new TokenInfo(...details);
    } catch (err) {
        await page.waitForSelector(`h3[class='warning']`, {timeout: 5000});
        const warningMessage = await page
            .locator(`h3[class='warning']`)
            .textContent();
        if (warningMessage.trim() === 'No matching token records found.') {
            return;
        }
        throw new Error('Something went wrong');
    }
}

async function deAllocateToken(page, tokenDetails) {
    try {
        await page.click('label[title=Support]');
        await page.fill(
            `input[id='manageTokenForm:tokenSerial']`,
            tokenDetails.serialNumber
        );
        await page.click('id=manageTokenForm:btnSearch');
        await page.waitForSelector(
            `table[class='tble tablesorter'][id='manageTokenForm:resultSection'] tbody tr td`
        );
        await page.click('td a');
        if (tokenDetails.status === 'Active') {
            await page.click('input[value=Unassign]');
            await page.click('td a');
        }
        await page.click(`input[value='De-allocate Token']`);
    } catch (err) {
        throw new Error('Unable to de-allocate the token');
    }
}

async function main() {
    const rows = await readExcel(`${__dirname}/assets/data_source.xlsx`);
    const updatedRows = [];
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await cmsLogin(page);
        for (let row of rows) {
            const userInfo = new UserInfo(...row);
            const tokenDetails = await getTokenDetails(page, userInfo.scotiaID);
            if (!tokenDetails || tokenDetails.status === 'Allocated') {
                const otrcInfo = await allocateToken(page, userInfo.scotiaID);
                row.push(otrcInfo.otrc);
                userInfo.otrc = otrcInfo.otrc;
                userInfo.otrcCreatedAt = otrcInfo.generatedTime;
                console.log(userInfo);
            } else if (
                tokenDetails &&
                tokenDetails.status === 'Active' &&
                tokenDetails.calcDays() <= 2
            ) {
                row.push('activated recently');
                userInfo.template = null;
                console.log(userInfo);
            } else {
                await deAllocateToken(page, tokenDetails);
                const otrcInfo = await allocateToken(page, userInfo.scotiaID);
                row.push(otrcInfo.otrc);
                userInfo.otrc = otrcInfo.otrc;
                userInfo.otrcCreatedAt = otrcInfo.generatedTime;
                console.log(userInfo);
            }
            await sendMail(userInfo);
            updatedRows.push(row);
        }
        await writeExcel(`${__dirname}/download/otrc.xlsx`, updatedRows);
    } catch (err) {
        console.log(err.message);
    } finally {
        browser.close();
        process.exit();
    }
}

main();
