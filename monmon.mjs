import PageMon from './pagemon.mjs';
import Notifier from './notifier.mjs';

/**
 * Example usage:
 * var m = new MonMon();
    m.enableSendGrid("[YOUR SENDGRID API KEY]", "glen@glenmurphy.com");
    m.enableTwilio("[YOUR TWILIO SID]", "[YOUR TWILIO AUTH KEY]", '+15552221234');
    m.addMonitor({
      url : "http://localhost:8080/",
      frequency : 1000,
      type : MonMon.TYPE_STRING,
      match : 'Hello 3',
      subject : "MonMon Test",
      email : "asd@onetwothi.com",
      sms : '+16501112233',
      persist : false
    });
 */
export default class MonMon {
  constructor() {
    this.monitors = {};
    this.notifier = new Notifier();
  }

  static TYPE_HASH = PageMon.TYPE_HASH;
  static TYPE_STRING = PageMon.TYPE_STRING;
  
  enableSendGrid(key, from) {
    this.notifier.enableSendGrid(key, from);
  }

  enableTwilio(sid, auth, from) {
    this.notifier.enableTwilio(sid, auth, from);
  }

  addMonitor(options) {
    options.matchListener = this.#matchListener;
    options.logListener = this.#logListener;

    var monitor = new PageMon(options);
    this.monitors[monitor.id] = monitor;
    return monitor;
  }

  #removeMonitor(monitor) {
    monitor.end();
    delete this.monitors[monitor.id];
  }

  #logListener = (monitor, message) =>  {
    console.log(monitor.options.subject + ': ' + message);
  }

  #matchListener = (monitor, message) => {
    if (!this.monitors[monitor.id])
      throw new Error("Untracked monitor callback");

    var subject = monitor.options.subject || "MonMon: Status Update";

    if (monitor.options.email)
      this.notifier.sendEmail(monitor.options.email, subject, message + "\n" + monitor.url);

    if (monitor.options.sms) 
      this.notifier.sendSMS(monitor.options.sms, subject + "\n" + message + "\n" + monitor.url);

    if (!monitor.options.persist)
      this.#removeMonitor(monitor);
  }
}