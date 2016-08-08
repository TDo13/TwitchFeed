'use strict';

function AppModel() {
  this._url = 'https://api.twitch.tv/kraken/';
  this.streams = {};
  this.options = '';
  this.limit = 10;
  this.searchType = 'streams';
  this.bodyBoxHeader = {
    page: 0,
    lastPage: 0,
    total: 0,
  };
  this.pageLinks = {
    prev: null,
    selfURI: null,
    next: null,
  };
  this.player = null;

  this.newStreams = new Event(this);

  this.newSearch = new Event(this);

  this.newLimit = new Event(this);
  this.newSearchType = new Event(this);
  this.newBodyBoxHeader = new Event(this);
  this.newPlayer = new Event(this);
  this.newPlayerToggle = new Event(this);
  this.newAdvancedToggle = new Event(this);
}

AppModel.prototype = {
  GetURL: function() {
    return this._url;
  },

  //Param: (JSONObject)
  AddStreams: function(streams) {
    this.streams = streams;
    this.newStreams.notify({streams: this.streams});
  },
  GetStreams: function() {
    return this.streams;
  },

  //Param: (Boolean, String)
  IsSearching: function(bool, innerHTML) {
    this.newSearch.notify({
      isSearching: bool,
      innerHTML: innerHTML,
    });
  },

  //Param: (Int)
  SetLimit: function(node) {
    this.limit = parseInt(node.textContent);
    this.newLimit.notify({
      limit: this.limit,
      node: node,
    });
  },
  GetLimit: function() {
    return this.limit;
  },

  //Param: (String)
  SetSearchType: function(target) {
    if (target.id === 'page_name') {
      this.searchType = 'streams';
      this.options = '';
    } else if (target.textContent === 'games') {
      this.searchType = target.textContent;
      this.options = '&type=suggest';
    } else {
      this.searchType = target.textContent;
      this.options = '';
    }
    this.newSearchType.notify({
      searchType: this.searchType, 
      options: this.options,
      node: target,
    });
  },
  GetSearchType: function() {
    return this.searchType;
  },
  GetOptions: function() {
    return this.options;
  },

  /*
    Param: object {page: (Int),
                   lastPage: (Int),
                   total: (Int),
    }
  */

  SetBodyBoxHeaders: function(header) {
    for (var heading in header) {
      if (!header.hasOwnProperty(heading)) {
        continue;
      }
      this.bodyBoxHeader[heading] = header[heading];
    }
    this.newBodyBoxHeader.notify(this.bodyBoxHeader);
  },
  GetBodyBoxHeaders: function() {
    return this.bodyBoxHeader;
  },

  /*
    Param: object {prev: (URL_String),
                   selfURI: (URL_String),
                   next: (URL_String)}
  */
  SetPageLinks: function(links) {
    for (var link in links) {
      if (!links.hasOwnProperty(link)) {
        continue;
      }
      this.pageLinks[link] = links[link];
    }
  },
  GetPageLinks: function() {
    return this.pageLinks;
  },

  //Param: Reference to new Twitch.Player() object or change channel
  SetTwitchPlayer: function(newTwitchPlayer) {
    this.player = newTwitchPlayer;
  },
  GetTwitchPlayer: function() {
    return this.player;
  },

  TogglePlayer: function(setActive) {
    var active = setActive || false;
    this.newPlayerToggle.notify({
      setActive: active
    });
  },

  ToggleAdvanced: function() {
    this.newAdvancedToggle.notify();
  }
};