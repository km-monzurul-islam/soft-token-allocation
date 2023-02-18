const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'appmailrelay.bns',
    port: 587,
    secure: false,
    tls: {
        rejectUnauthorized: false,
    },
});

async function sendmail(userInfo) {
    const teamEmails = [
        'Amira.Sheikh@scotiabank.com',
        'ceasar.biswas_zoluxiones@scotiabank.com.pe',
        'Camilo.RomeroCuentas@scotiabank.com',
        'dayanne.zegarra_zoluxiones@scotiabank.com.pe',
        'Gabriela.velazquez@scotiabank.com',
        'juan.carrasco_zoluxiones@scotiabank.com.pe',
        'luis.pinillasanchez@scotiabank.com',
        'monzurul.islam_zoluxiones@scotiabank.com.pe',
        'Perry.Lam@scotiabank.com',
        'Sanchit.Avasti@scotiabank.com',
        'wilmer.viana_zoluxiones@scotiabank.com.pe',
        'Yohiner.DelgadoParedes@scotiabank.com',
    ];

    const bankTemplate = `<!DOCTYPE html>
<html lang="en">

<body>

</body>
<div>
    <h5 style="font-family:Segoe UI">Hello ${userInfo.name},</h5>
    <p style="font-family:Segoe UI; font-size:14px">A VPN soft token has been assigned to you. Please register it if you
        already have owned corporate/BYOD mobile device or when received.</p>
    <p style="font-family:Segoe UI; font-size:14px">Please find below your OTRC required to register your soft token.
        The one-time OTRC registration code is <strong>case sensitive</strong>.</p>
    <p style="font-family:Segoe UI; font-size:14px">Please follow the Setup Instructions attached.</p>
    <h4 style="font-family:Segoe UI">OTRC code - <span style="color:red">${userInfo.otrc}</span></h4>
    <p style="font-family:Segoe UI; font-size:14px">For any technical issue please contact your local helpdesk for
        assistance.</p>
    <p style="font-family:Segoe UI; font-size:15px;"><span style="color: #5648D9">VPN Administration</span><br>
    <span style="font-family:Segoe UI; font-size:12px;"><span style="color:red">Scotiabank</span> | Global Identity and Access
    Management<br/>RAC 1 - 2201 Eglinton Ave E, Scarborough, Ontario, Canada M1L 4S2</span><br>
    <span style="font-family:Segoe UI; font-size: 12px; color:red;">Cyber Incident Reporting Hotline (24/7): <u>1-416-288-3568</u></span>
    or <a href="mailto:Cyber.Security@ScotiaBank.com" style="font-family:Segoe UI; font-size: 12px;">Cyber.Security@ScotiaBank.com</a>
</p>
</div>

    </html>`;
    const personalTemplate = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
    </head>
    
    <body>
    <div>
        <h5 style="font-family:Segoe UI">Hello ${userInfo.name},</h5>
        <p style="font-family:Segoe UI; font-size:14px">A VPN soft token has been assigned to you. Please register it
            if you already installed the BNS Authenticator app on your device.</p>
        <p style="font-family:Segoe UI; font-size:14px">Please find below your OTRC required to register your soft token.
            The one-time OTRC registration code is <strong>case sensitive</strong>.</p>
        <p style="font-family:Segoe UI; font-size:14px"> Please follow the Setup Instructions attached.</p>
        <h4 style="font-family:Segoe UI">OTRC code - <span style="color:red; font-family:Segoe UI">${userInfo.otrc}</span></h4>
        <p style="font-family:Segoe UI; font-size:14px"><strong>Note:</strong> QR Code will be emailed separately by the
            GTS(WorkspaceOne) team if requested. Please do not contact VPN team for QR code.</p>
        <p style="font-family:Segoe UI; font-size:14px">For any technical issue please contact your local helpdesk for
            assistance.</p>
        <p style="font-family:Segoe UI; font-size:15px;"><span style="color: #5648D9">VPN Administration</span><br>
        <span style="font-family:Segoe UI; font-size:12px;"><span style="color:red">Scotiabank</span> | Global Identity and Access
        Management<br/>RAC 1 - 2201 Eglinton Ave E, Scarborough, Ontario, Canada M1L 4S2</span><br>
        <span style="font-family:Segoe UI; font-size: 12px; color:red;">Cyber Incident Reporting Hotline (24/7): <u>1-416-288-3568</u></span>
        or <a href="mailto:Cyber.Security@ScotiaBank.com" style="font-family:Segoe UI; font-size: 12px;">Cyber.Security@ScotiaBank.com</a>
    </p>
    </div>
    </body>
    
    </html>`;
    const confirmationTemplate = `<!DOCTYPE html>
    <html lang="en">
    
    <body>
    
    </body>
    <div>
        <h5 style="font-family:Segoe UI">Hello ${userInfo.name},</h5>
        <p style="font-family:Segoe UI; font-size:14px">A hard or soft token was recently activated by you within the last
            48 hours. Please confirm if you require a reallocation or a new OTRC.</p>
        <p style="font-family:Segoe UI; font-size:14px">If no response is received within 24 hours, your request
            <strong>${userInfo.reqNumber}</strong> will be cancelled.
        </p>
        <p style="font-family:Segoe UI; font-size:14px">For any technical issue please contact your local helpdesk for
            assistance.</p>
        <p style="font-family:Segoe UI; font-size:15px;"><span style="color: #5648D9">VPN Administration</span><br>
        <span style="font-family:Segoe UI; font-size:12px;"><span style="color:red">Scotiabank</span> | Global Identity and Access
        Management<br/>RAC 1 - 2201 Eglinton Ave E, Scarborough, Ontario, Canada M1L 4S2</span><br>
        <span style="font-family:Segoe UI; font-size: 12px; color:red;">Cyber Incident Reporting Hotline (24/7): <u>1-416-288-3568</u></span>
        or <a href="mailto:Cyber.Security@ScotiaBank.com" style="font-family:Segoe UI; font-size: 12px;">Cyber.Security@ScotiaBank.com</a>
    </p>
    </div>
    
    </html>`;

    const vpnMailbox = 'vpn.administration@scotiabank.com';
    let selectedTemplate;
    let subject;
    let attachments;
    let cc;
    if (!userInfo.template) {
        selectedTemplate = confirmationTemplate;
        subject = `Soft Token Allocation Confirmation For ${userInfo.name} - ${userInfo.scotiaID} - ${userInfo.reqNumber}`;
        cc = [userInfo.managerEmail, ...teamEmails];
    } else {
        selectedTemplate =
            userInfo.template === 'BANK\\BYOD'
                ? bankTemplate
                : personalTemplate;
        subject = `Soft Token Activation Code Request - ${userInfo.name}(${userInfo.scotiaID}) - ${userInfo.reqNumber}`;
        cc = [userInfo.managerEmail, 'vpn.administration@scotiabank.com'];
        attachments = userInfo.template === 'BANK\\BYOD'
            ? [
                { path: `${__dirname}/assets/attachments/Bank Phone Setup.pdf` },
            ]
            : [
                { path: `${__dirname}/assets/attachments/Personal Phone Setup.pdf` },
            ];
    }
    await transporter.sendMail({
        from: vpnMailbox,
        to: userInfo.email,
        cc,
        subject,
        attachments,
        html: selectedTemplate,
        priority: 'high',

    });
}

module.exports = sendmail;
