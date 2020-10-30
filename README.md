# monmon

Website monitoring (String monitoring, page changes) and notification (Email, SMS, IFTTT). This is
a hobby/itch-scatching project for myself and my own uses, and is only updated when I have a need.

# example usage

    import MonMon from "https://raw.githubusercontent.com/glenmurphy/monmon/master/monmon.mjs";

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

# Deno vs Node

This is written in ES6 and works in Deno and Node with a preference for Deno; to make it work in
Node, you need to add fetch support by adding "import fetch from 'node-fetch';" to the headers of
some files (TODO: figure out how to do this automatically), and replace the import statement

To run with deno, use deno run --allow-net yourscript.js where yourscript.js contains code like
the above