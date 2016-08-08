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
    _this.Search(args.event);
  });
  this._view.NewSearch.attach(function(sender, args) {
    _this.Search(args.target, args.bool);
  });
}

AppController.prototype = {
  Search: function(event, handleEmptyQuery = false) {
    // console.log('searching!');
    var model = this._model;
    var target;
    if (handleEmptyQuery) {
      this._model.IsSearching(true, 'Displaying top streams');
      this.SearchAPI(model.GetURL() + 'streams/?limit=' + model.GetLimit());
    } else {
      target = event[0].value;
      if ((target.length < 1)) {
        this._model.IsSearching(false, 'Please enter a query');
      } else if (target.length >= 1) {
        this._model.IsSearching(true, 'Searching for ' + target + '...');
        this.SearchAPI(model.GetURL() + 'search/' + model.GetSearchType() + '?limit=' + model.GetLimit() + '&q=' + target + model.GetOptions());
      }
    }
  },

  SearchAPI: function(query) {
    var _this = this;
    jsonp(query, 
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
  },

  SetLimit: function(node) {
    this._model.SetLimit(node);
  },

  UpdateBodyBoxHeaders: function(data) {
    var searchType = this._model.GetSearchType();
    var selfURI = this._model.GetPageLinks().selfURI;
    var total = data._total || data[searchType].length;
    var offset = this.parseURI('offset',selfURI) || 0;
    var limit = this.parseURI('limit',selfURI) || total;
    var page, lastPage;
    //Set the new page number value based on offset and total videos
    this._model.SetBodyBoxHeaders({
      page: offset/limit + 1,
      lastPage: Math.ceil(total/limit),
      total: total,
    });
    page = this._model.GetBodyBoxHeaders().page;
    lastPage = this._model.GetBodyBoxHeaders().lastPage;

    //Set new html links for previous and next page if exists
    var prevPage = (page <= 1) ? null : data._links.prev;
    var nextPage =(page >= lastPage) ? null : data._links.next;
    this._model.SetPageLinks({
      prev: prevPage,
      next: nextPage,
    });
  },

  OnHeaderClick: function(event) {
    // console.log(event.target);
    if (event.target.id === 'toggle_options') {
      this._model.ToggleAdvanced();
    } else if (event.target.parentNode.id === 'search_type') {
      this.SetSearchType(event.target);
    } else if (event.target.parentNode.id === 'results_per_page') {
      this.SetLimit(event.target);
    } else if (event.target.id === "page_name") {
      this.SetSearchType(event.target);
    }
  },

  OnBodyClick: function(event) {
    var name;
    // console.log(event, event.target.className);
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
    if (this._model.GetTwitchPlayer()) {
      this._model.GetTwitchPlayer().setChannel(channelName);
    } else {
      this._model.SetTwitchPlayer(new Twitch.Player("stream_view", options));
      this._model.GetTwitchPlayer().setVolume(0.5);
    }
    this._model.TogglePlayer(true);
  },

  ToggleTwitchPlayer: function() {
    this._model.TogglePlayer();
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