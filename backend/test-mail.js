import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "eldorabdukhalikov74@gmail.com",
        pass: "ttybwntohojjjkkb",
    },
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("Nodemailer error:", error);
        process.exit(1);
    } else {
        console.log("Nodemailer is working!");
        process.exit(0);
    }
});
