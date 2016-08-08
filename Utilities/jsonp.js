'use strict';

function jsonp(url, success, fail, timeout) {
  var time = timeout || 5;
  var timeoutTrigger = window.setTimeout(function() {
    window.cbWrapper = function() {};
    fail();
  }, time*1000);
  window.cbWrapper = function(data) {
    window.clearTimeout(timeoutTrigger);
    success(data);
    delete window.cbWrapper;
  };
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = url+'&callback=cbWrapper';

  document.querySelector('head').appendChild(script);
  script.onload = function() {
    this.remove();
  }
}