// uncomment if you're using node
// import fetch from 'node-fetch';
import { encode, decode } from "https://deno.land/std/encoding/base64.ts"

export default class Notifier {
  constructor() {}

  enableSendGrid(apiKey, from) {
    this.sendGridApiKey = apiKey;
    this.sendGridFrom = from;
  }

  enableTwilio(sid, authKey, from) {
    this.twilioSID = sid;
    this.twilioAuthKey = authKey;
    this.twilioFrom = from;
    this.twilioBasicAuth = encode(this.twilioSID + ":" + this.twilioAuthKey);
  }

  enableIFTTT(apiKey) {
    this.ifttt = apiKey;
  }

  sendEmail(to, subject, body) {
    if (!this.sendGridApiKey) {
      throw(new Error("SendGrid Not Configured"));
    }

    // Rather than introduce deps on the sendgrid node module,
    // this uses the cURL API
    // https://app.sendgrid.com/guide/integrate/langs/curl
    fetch('https://api.sendgrid.com/v3/mail/send', {
      method : 'POST',
      headers : {
        'Authorization' : "Bearer " + this.sendGridApiKey,
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        'personalizations' : [{'to' : [{"email": to}]}],
        'from' : {"email" : this.sendGridFrom},
        'subject' : subject,
        "content": [{"type": "text/plain", "value": body}]
      })
    }).then(() => {
      console.log("Email sent: " + body);
    }, error => {
      console.error(error);
  
      if (error.response)
        console.error(error.response.body)
    });
  }

  async sendSMS(to, body) {
    if (!this.twilioSID || !this.twilioAuthKey) {
      throw new Error("Twilio Not Configured");
    }

    // As with sendgrid, we prefer URL APIs over node packages
    fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.twilioSID + '/Messages.json', {
      method : 'POST',
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization' : 'Basic ' + this.twilioBasicAuth
      },
      body : [encodeURI("Body=" + body), encodeURI("From=" + this.twilioFrom), encodeURI("To=" + to)].join("&")
    }).then(async (res) => {
      console.log("SMS Dispatched:");
      console.log(await res.text());
    });
  }

  sendIFTTT(message) {
    if (!this.ifttt) {
      throw(new Error("IFTTT Not Configured"));
    }
    var api_key = this.ifttt;
    var postBody = JSON.stringify({
      "value1" : message
    });
    fetch("https://maker.ifttt.com/trigger/pagemon/with/key/" + api_key, { method: 'POST', body: postBody, headers: { 'Content-Type': 'application/json' }});
    console.log("IFTTT sent: " + message);
  }
}