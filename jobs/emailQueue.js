const { Queue, Worker } = require("bullmq");
const nodemailer = require("nodemailer");

// Create a queue
const emailQueue = new Queue("email", {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

// Create a worker to process the email queue
const emailWorker = new Worker(
    "email",
    async (job) => {
        try {
            const { email } = job.data;

            // Simulate sending an email
            console.log(`Sending email to ${email}`);
            // You can add real email-sending logic here using nodemailer or any other service
        } catch (error) {
            console.error("Error sending email:", error);
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    }
);

module.exports = { emailQueue, emailWorker };
