/*
 - Voltic attack logs, do whatever you want with them but don't remove credits.
*/
const Imap = require('node-imap');
const gradient_tool = require("gradient-string");
const gradient = gradient_tool(["#eb3a34", "#eb6b34"]);
const { exec } = require("child_process");
const { Webhook, MessageBuilder } = require('discord-webhook-node');


///////////////* IMAP Settings *///////////////

// Email Username
var imap_user = "example@outlook.com";

// Email Password
var imap_password = "yourpass";

// IMAP Host
var imap_host = "outlook.office365.com";

// IMAP Port
var imap_port = 993;

///////////////////////////////////////////////


///////////////* Webhook Settings *///////////////

// Webhook URL
const webhook = new Webhook("");

// Webhook Image
const image = "https://voltic.dev/images/favicon.png";

// Webhook Color
const color = "#ff4343";

// VPN Location
const location = "London - UK";

//////////////////////////////////////////////////



///////////////* Mail Detection *///////////////

// Words that the attack started email subject contains
const start_message = "attack detected";

// Words that the attack stopped email subject contains
const stop_message = "attack stopped";

//////////////////////////////////////////////////




/* Ignore the rest */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var count = 0;
var errors = 0;

let attacks = [];

function log(str) {
    console.log(gradient(str));
}

function stats() {
    console.clear();

    log("[BY VOLTIC - VOLTIC.DEV]");
    log("Welcome to Voltic Attack alerts!");
    log("Logging into account to check emails!");
    log(`[REFRESHES: ${count} | ATTACKS: ${attacks.length} | ERRORS: ${errors}]`);
    attacks.forEach(function (attack) {
        log(attack);
    });
}

function attack_func() {
    this.attack_info = function (cmd, callback) {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                log(`[-] | ERR | ${error.message}`)
                return;
            }
            if (stderr) {
                log(`[-] | ERR | ${stderr}`)
                return;
            }

            callback(stdout.split("\n")[0]);
        });
    }
}

console.clear();
log("Starting attack logs...");

var imap = new Imap({
    user: imap_user,
    password: imap_password,
    host: imap_host,
    port: imap_port,
    tls: true,
});

imap.once('ready', function () {
    imap.openBox('INBOX', false, function (err, box) {
        if (!err) {
            setInterval(function () {
                imap.search(['UNSEEN'], function (err, results) {
                    if (err) throw err;
                    var fetch = imap.fetch(results, { bodies: '' });
                    fetch.on('message', function (msg) {
                        msg.on('body', function (stream) {
                            var buffer = '';
                            stream.on('data', function (chunk) {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', function () {
                                var data = Imap.parseHeader(buffer);
                                var subject = data["subject"];
                                var date = data["date"];
                                var subject_l = subject.toString().toLocaleLowerCase();

                                if (subject_l.includes(start_message) || subject_l.includes(stop_message)) {
                                    imap.setFlags(results, ['\\Seen'], function (err) {
                                        if (!err) {
                                            if (subject_l.includes(start_message)) {
                                                var today = (new Date()).toString().split(" GMT")[0];
                                                exec(`tcpdump -n -s0 -c 400 -w ./dumps/${today.split(" ")[1] + "_" + today.split(" GMT")[0].split(" ")[2] + "_" + today.split(" GMT")[0].split(" ")[4]}.pcap`);
                                                new attack_func().attack_info(`vnstat -i ${device} -tr | grep tx | awk '{print $2 " " $3 " | " $4 " pps" }'`, function (info) {

                                                    const start = new MessageBuilder()
                                                        .setTitle('Attack Detected!')
                                                        .addField('**Location:**', location)
                                                        .addField('**Attack Info:**', info)
                                                        .setColor(color)
                                                        .setThumbnail(image)
                                                        .setFooter('Attempting to mitigate attack. [BY VOLTIC]')
                                                        .setTimestamp();

                                                    attacks.push(`[ATTACK] | ${info.toUpperCase()} | [${subject}] | [${date}]`);
                                                    webhook.send(start);
                                                });
                                            }
                                            else {
                                                const stop = new MessageBuilder()
                                                    .setTitle('No Longer Under Attack!')
                                                    .addField('**Location:**', location)
                                                    .setColor(color)
                                                    .setThumbnail(image)
                                                    .setFooter('Withdrawn server from mitigation. [BY VOLTIC]')
                                                    .setTimestamp();

                                                webhook.send(stop);
                                            }
                                        }
                                        else {
                                            errors++;
                                        }
                                    });
                                }
                                else {
                                    count++;
                                }
                            });
                        });
                    });
                });
                stats();
            }, 2000);
        }
    });
});

imap.once('error', function (err) {
    log(`[-] | IMAP ERR | ${err}`);
});

process.on('uncaughtException', function (err) {
    log(`[-] | ERR | ${err}`);
    count++;
});

process.on('unhandledRejection', function () {
    log(`[-] | ERR | ${err}`);
});

imap.connect();