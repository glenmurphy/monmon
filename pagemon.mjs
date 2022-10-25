// uncomment if you're using node
// import fetch from 'node-fetch';

export default class PageMon {
  // url, frequency, type, match, matchListener, logListener
  constructor(options) {
    this.validate(options);

    this.id = this.hash(options.url) + '-' + new Date().getTime();

    this.url = options.url;
    this.frequency = options.frequency || 1000 * 60 * 10;
    this.type = options.type || PageMon.TYPE_HASH;
    this.ignorenewlines = options.ignorenewlines || false;
    this.match = options.match;
    if (this.ignorenewlines) {
      this.match = this.match.replace(/\r?\n|\r/g, '');
    }

    this.matchListener = options.matchListener;
    this.logListener = options.logListener;

    // record this so an owner can add its own metadata (e.g. email addresses)
    this.options = options; 

    this.init = false;
    this.lastData = null;

    setTimeout(this.fetch.bind(this), 1000);
    this.interval = setInterval(this.fetch.bind(this), this.frequency);
  }

  validate(options) {
    if (!options.url || !options.matchListener)
      throw new Error("Needs URL and matchListener");

    if (options.type == PageMon.TYPE_STRING && !options.match)
      throw new Error("Attempting to monitor a string with no string specified");
  }

  static TYPE_HASH = 1; // default
  static TYPE_STRING = 2;

  // Helper functions to make initializtion easier
  static MonitorHash(url, frequency, callback) {
    return new PageMon({
      url : url,
      frequency : frequency,
      type : PageMon.TYPE_HASH,
      matchListener : callback
    });
  }

  static MonitorString(url, frequency, string, callback) {
    return new PageMon({
      url : url,
      frequency : frequency,
      type : PageMon.TYPE_STRING,
      match : string,
      matchListener : callback
    });
  }

  end() {
    this.log("Stopped");
    this.matchListener = null;
    this.logListener = null;
    clearInterval(this.interval);
  }

  setmatchListener = function(callback) {
    this.matchListener = callback;
  }

  setLogListener = function(callback) {
    this.logListener = callback;
  }

  log(text) {
    if (this.logListener)
      this.logListener(this, text);
  }

  fetch() {
    this.log("Fetching " + this.url);
    
    fetch(this.url, {
      headers : {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
        'connection': 'keep-alive', // needed for node to connect to bestbuy
      },
    }).then(async res => {
      var body = await res.text();
      if (this.ignorenewlines) {
        body = body.replace(/\r?\n|\r/g, '');
      }
      this.checkResult(res.status, body);
    }).catch((error) => {
      this.log("FETCH ERROR:");
      this.log(error.message);
    });
  }

  checkResult(code, body) {
    if (code != 200) {
      this.log("Server error " + code);
      return;
    }

    if (this.type == PageMon.TYPE_HASH)
      this.checkHash(body);
    else if (this.type == PageMon.TYPE_SIZE)
      this.checkSize(body);
    else if (this.type == PageMon.TYPE_STRING)
      this.checkString(body);
  }

  hash(str) {
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    hash += '-' + str.length;
    return hash;
  }

  checkHash(body) {
    // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    var hash = this.hash(body);

    if (this.init == false) {
      this.init = true;
      this.lastData = hash;
      this.log("First hash: " + hash);
      return;  
    }

    this.log("Checking for hash change");
    if (this.lastData != hash) {
      this.matched("Hash changed");
      this.lastData = hash;
    }
  }

  checkSize(body) {
    if (this.init == false) {
      this.init = true;
      this.lastData = body.length;
      this.log("First Size: " + body.length);
      return;
    }

    this.log("Checking for size change");
    if (this.lastData != body.length) {
      this.matched("Size changed");
      this.lastData = body.length;
    }
  }

  checkString(body) {
    var stringFound = Boolean(body.indexOf(this.match) != -1);

    if (this.init == false) {
      this.init = true;
      this.lastData = stringFound;
      this.log("First String Match: " + stringFound);
      return;
    }

    this.log("Checking for string change");
    if (this.lastData != stringFound) {
      this.matched(stringFound ? "String appeared" : "String disappeared");
      this.log(body);
      this.lastData = stringFound;
    }
  }

  matched(message) {
    message = "Match: " + message;
    this.log(message);
    if (this.matchListener)
      this.matchListener(this, message);
  }
}