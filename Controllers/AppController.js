'use strict';

/*
  Actions user can take:
  Perform Search
  Change Search Type
  Change Results Per Page
  Click on Stream to open player
  Click on Stream to go to link (done through <a/>)
  Change Page (done through <a/>) but need to update view
  Click to open advanced (done though button listener)
*/

function AppController(model, view) {
  this._model = model;
  this._view = view;

  var _this = this;

  this._view.OnBodyClick.attach(function(sender, args) {
    _this.OnBodyClick(args.event);
  });
  this._view.OnHeaderClick.attach(function(sender, args) {
    _this.OnHeaderClick(args.event);
  });
  this._view.OnQuerySubmit.attach(function(sender, args) {
    _this.Search(args.event, true);
  });
  this._view.NewSearch.attach(function(sender, args) {
    _this.Search(args.target, true);
  });
}

AppController.prototype = {
  Search: function(event, handleEmptyQuery = false) {
    var target = event[0].value;
    var formValid = document.getElementById('form_valid');
    var model = this._model;
    formValid.className = '';
    formValid.className = 'searching';
    if (handleEmptyQuery && (target.length < 1)) {
      // formValid.className = 'error';
      formValid.innerHTML = 'Displaying top streams';
      this.SearchAPI(model.GetURL() + 'streams/?limit=' + model.GetLimit());
    } else if (target.length >= 1) {
      formValid.innerHTML = 'Searching for ' + target + '...';
      this.SearchAPI(model.GetURL() + 'search/' + model.GetSearchType() + '?limit=' + model.GetLimit() + '&q=' + target + model.GetOptions());
    }
  },

  jsonp: function(url, success, fail, timeout) {
    var time = timeout || 5;
    var timeoutTrigger = window.setTimeout(function() {
      window.cbWrapper = function() {};
      fail();
    }, time*1000);
    window.cbWrapper = function(data) {
      window.clearTimeout(timeoutTrigger);
      success(data);
    };
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url+'&callback=cbWrapper';

    document.querySelector('head').appendChild(script);
  },

  SearchAPI: function(query) {
    var _this = this;
    this.jsonp(query, 
      function(data) {
        // console.log(data);
        _this._model.AddStreams(data);
        _this._model.SetPageLinks({selfURI: data._links.self});
        _this.UpdateBodyBoxHeaders(data);
      },
      function() {
        console.log('Error retrieving data');
      });
  },

  SetSearchType: function(node) {
    this._model.SetSearchType(node);
    document.getElementsByClassName('selected')[0].className = '';
    node.className = 'selected';
  },

  SetLimit: function(node) {
    this._model.SetLimit(node);
    document.getElementsByClassName('selected')[1].className = '';
    node.className = 'selected';
  },

  UpdateBodyBoxHeaders: function(data) {
    var searchType = this._model.GetSearchType();
    var selfURI = this._model.GetPageLinks().selfURI;
    var bodyBox = document.getElementById('body_box');
    var total = data._total || data[searchType].length;
    var offset = this.parseURI('offset',selfURI) || 0;
    var limit = this.parseURI('limit',selfURI) || total;
    var lastPage = Math.ceil(total/limit);
    var page;
    //Set the new page number value based on offset and total videos
    this._model.SetPageNum(offset/limit + 1);
    page = this._model.GetPageNum();
    //Set new html links for previous and next page if exists
    var prevPage = (page <= 1) ? null : data._links.prev;
    var nextPage =(page >= lastPage) ? null : data._links.next;
    this._model.SetPageLinks({
      prev: prevPage,
      next: nextPage,
    });
    bodyBox.querySelector('#total_results').textContent = 'Total results: ' + total;
    bodyBox.querySelector('#body_box_header').className = 'visible';
    bodyBox.querySelector('#curr_page').textContent = page + '/' + lastPage;
  },

  OnHeaderClick: function(event) {
    // console.log(event);
    var options = document.querySelector('#additional_options');
    if (event.target.id === 'toggle_options') {
      if (options.className === '') {
        this._model.ToggleAdvanced(true, options);
      } else {
        this._model.ToggleAdvanced(false, options);
      }
    } else if (event.target.parentNode.id === 'search_type') {
      this.SetSearchType(event.target);
    } else if (event.target.parentNode.id === 'results_per_page') {
      this.SetLimit(event.target);
    }
  },

  OnBodyClick: function(event) {
    var name;
    console.log(event, event.target.className);
    if (event.target.className === "stream_entry") {
      name = event.target.children[1].children[0].textContent;
      // console.log('Channel Selected : ', name);
      this.CreateTwitchPlayer(name);
    } else if (event.target.className === "channel_entry") {
      name = event.target.children[1].children[0].textContent;
      // console.log('Channel Selected : ', name);
      // window.open(name);
    } else if (event.target.id === 'prev_page') {
      this.PrevPage();
    } else if (event.target.id === 'next_page') {
      this.NextPage();
    } else if (event.target.className === 'close_stream') {
      this.ToggleTwitchPlayer();
    }
  },

  PrevPage: function() {
    var PageLinks = this._model.GetPageLinks();
    if (PageLinks.prev) {
      this.SearchAPI(PageLinks.prev);
    } else {
      console.log('No next page!');
    }
  },

  NextPage: function() {
    var PageLinks = this._model.GetPageLinks();
    if (PageLinks.next) {
      this.SearchAPI(PageLinks.next);
    } else {
      console.log('No next page!');
    }
  },

  CreateTwitchPlayer: function(channelName) {
    var options = {
      width: 854,
      height: 480,
      channel: channelName,
    };
    var stream = document.querySelector('#stream_view');
    if (stream.querySelector('iframe')) {
      // console.log('iframe exists');
      this._model.GetTwitchPlayer().setChannel(channelName);
    } else {
      this._model.SetTwitchPlayer(new Twitch.Player("stream_view", options), stream);
      this._model.GetTwitchPlayer().setVolume(0.5);
    }
    this._model.TogglePlayer(true, stream);
  },

  ToggleTwitchPlayer: function() {
    var stream = document.querySelector('#stream_view');
    if (stream.className !== 'show') {
      this._model.TogglePlayer(true, stream);
    }
    else {
      this._model.TogglePlayer(false, stream);
    }
  },

  parseURI: function(name, url) {
    if (!url) {
      return 1;
    }
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    return !results ? null : (!results[2] ? '' : decodeURIComponent(results[2].replace(/\+/g, " ")));
  },
};