import { Resend } from "resend";
import { IUserDocument } from "../interfaces/userInterface.js";

class Email {
  public to: string;

  constructor(user: IUserDocument) {
    this.to = user.email;
  }

  async send(from: string, subject: string, message: string) {
    const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
    await resend.emails.send({
      from,
      to: this.to,
      subject,
      html: message,
    });
  }

  async sendPackageEmail(
    packageName: string,
    trackingNumber: string
  ) {
    await this.send(
      "concierge@11stjoseph.com",
      "Untoldcine Package Shipment",
      `Your package "${packageName}" has been delivered.`
    );
  }
}

export default Email;