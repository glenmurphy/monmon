# monmon

website monitoring and notification

# example usage

    var m = new MonMon();
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
