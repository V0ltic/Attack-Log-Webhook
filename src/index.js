/**
 * Voltic attack logs, do whatever you want with them but don't remove credits. (and remove credits, voltic will find you SKID.)
 * Fill in your constants too.
 */

/**
 * IMAP Configration (Mails)
 * EMAIL => your email / username
 * PASSWORD => password to your email
 * HOST => outlook, gmail, custom
 * PORT => IMAP is 993 by default
 */
const IMAP = ["EMAIL", "PASSWORD", "HOST / PROVIDER", "PORT"];

/**
 * Used ethernet interface
 * By default this is eth0 but on some servers for example from ovh this can be ens3, etc.
 */
const device = "eth0";

/**
 * Configure your webhooks
 * self explanatory
 */
const WEBHOOK_URL = "";
const IMAGE = "" || "https://voltic.dev/images/favicon.png";
const COLOR = "" || "#ff4343";
const LOCATION = "" || "Seggs City, Seggsistan";

/**
 * self explanatory (lowercase only!)
 */
const startMessage = "attack detected";
const stopMessage = "attack stopped";

/**
 * Dumbs Dumbs,
 * Don't scroll beyond here.
 * :)
 */

const IMAP_CLIENT = require("node-imap");
const gradient = require("gradient-string")(["#eb3a34", "#eb6b34"]);
const { exec } = require("child_process");
const { Webhook, MessageBuilder } = require("discord-webhook-node");

const stop = new MessageBuilder()
	.setTitle("No Longer Under Attack!")
	.addField("**Location »**", LOCATION)
	.setColor(COLOR)
	.setThumbnail(IMAGE)
	.setFooter("Withdrawn server from mitigation. [BY VOLTIC]")
	.setTimestamp();

const start = new MessageBuilder()
	.setTitle("Attack Detected!")
	.addField("**Location »**", LOCATION)
	.setColor(COLOR)
	.setThumbnail(IMAGE)
	.setFooter("Attempting to mitigate attack. [BY VOLTIC]")
	.setTimestamp();
/**
 * Code Starts
 */

const webhook = new Webhook(WEBHOOK_URL);

let imap = new IMAP_CLIENT({
	user: IMAP[0],
	password: IMAP[1],
	host: IMAP[2],
	port: Number(IMAP[3]),
	tls: true,
});

let count = 0;
let errors = 0;
let attacks = [];

const log = (str) => {
	console.log(gradient(str));
};

const stats = () => {
	console.clear();
	log("[BY VOLTIC - VOLTIC.DEV]");
	log("Welcome to Voltic Attack alerts!");
	log("Logging into account to check emails!");
	log(`[REFRESHES: ${count} | ATTACKS: ${attacks.length} | ERRORS: ${errors}]`);
	attacks.forEach((attack) => log(attack));
};

const info = (cmd, callback) => {
	exec(cmd, (error, stdout, stderr) => {
		if (error) {
			log(`[-] | ERR | ${error.message}`);
			return;
		}
		if (stderr) {
			log(`[-] | ERR | ${stderr}`);
			return;
		}
		callback(stdout.split("\n")[0]);
	});
};

console.clear();
log("Starting attack logs...");

const checker = () => {
	imap.search(["UNSEEN"], (err, results) => {
		if (err) return;
		const fetch = imap.fetch(results, { bodies: "" });
		fetch.on("message", (msg) => {
			msg.on("body", (stream) => {
				let buffer = "";
				stream.on("data", (chunk) => {
					buffer += chunk.toString("utf8");
				});
				stream.once("end", () => {
					let data = IMAP_CLIENT.parseHeader(buffer);
					let subject = data["subject"];
					let date = data["date"];
					let message = subject.toString().toLocaleLowerCase();

					if (!message.includes(startMessage) || !message.includes(stopMessage)) return count++;
					imap.setFlags(results, ["\\Seen"], (err) => {
						if (!err) return errors++;
						if (!message.includes(startMessage)) return webhook.send(stop);
						const today = new Date().toString().split(" GMT")[0];
						exec(
							`tcpdump -n -s0 -c 400 -w ../dumps/${
								today.split(" ")[1] +
								"_" +
								today.split(" GMT")[0].split(" ")[2] +
								"_" +
								today.split(" GMT")[0].split(" ")[4]
							}.pcap`
						);
						info(`vnstat -i ${device} -tr | grep tx | awk '{print $2 " " $3 " | " $4 " pps" }'`, (info) => {
							attacks.push(`[ATTACK] | ${info.toUpperCase()} | [${subject}] | [${date}]`);
							webhook.send(start.addField("**Attack Info »**", info));
						});
					});
				});
			});
		});
	});
};

imap.once("ready", () => {
	imap.openBox("INBOX", false, (err, _box) => {
		if (err) return;
		setInterval(() => {
			checker();
			stats();
		}, 2000);
	});
});

imap.on("error", (err) => {
	log(`[-] | Mail | ${err}`);
});

process.on("uncaughtException", () => {
	count++;
});

process.on("unhandledRejection", () => {
	log(`[-] | Error | ${err}`);
});

imap.connect();
