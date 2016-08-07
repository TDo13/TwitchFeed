'use strict';

function AppModel() {
  this._url = 'https://api.twitch.tv/kraken/';
  this.streams = [];
  this.options = '';
  this.limit = 10;
  this.searchType = 'streams';
  this.page = 0;
  this.pageLinks = {
    prev: null,
    selfURI: null,
    next: null,
  };
  this.player = null;
  this.playerToggle = false; //False represents hidden
  this.advancedToggle = false; //False represents hidden

  this.newStreams = new Event(this);
  this.newLimit = new Event(this);
  this.newSearchType = new Event(this);
  this.newPage = new Event(this);
  this.newPageLinks = new Event(this);
  this.newPlayer = new Event(this);
  this.newPlayerToggle = new Event(this);
  this.newAdvancedToggle = new Event(this);
}

AppModel.prototype = {
  GetURL: function() {
    return this._url;
  },

  //Param: (Data block)
  AddStreams: function(streams) {
    this.streams = streams;
    this.newStreams.notify({streams: streams});
  },
  GetStreams: function() {
    return this.streams;
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
  SetSearchType: function(node) {
    if (node.textContent === 'games') {
      this.searchType = node.textContent;
      this.options = '&type=suggest';
    } else {
      this.searchType = node.textContent;
      this.options = '';
    }
    this.newSearchType.notify({
      searchType: this.searchType, 
      options: this.options,
      node: node,
    });
  },
  GetSearchType: function() {
    return this.searchType;
  },
  GetOptions: function() {
    return this.options;
  },

  //Param: (Int)
  SetPageNum: function(page) {
    this.page = page;
    this.newPage.notify({page: page});
  },
  GetPageNum: function() {
    return this.page;
  },

  /*Param: object {prev: (URL_String),
                   selfURI: (URL_String),
                   next: (URL_String)}
  */
  SetPageLinks: function(links) {
    for (var link in links) {
      if (!links.hasOwnProperty(link)) {
        //The current property is not a direct property of p
        continue;
      }
      this.pageLinks[link] = links[link];
      //Do your logic with the property here
    }
    this.newPageLinks.notify({pageLinks: links});
  },
  GetPageLinks: function() {
    return this.pageLinks;
  },

  //Param: Reference to new Twitch.Player() object or change channel
  SetTwitchPlayer: function(newTwitchPlayer, stream) {
    this.player = newTwitchPlayer;
    this.newPlayer.notify({
      bool: true,
      stream: stream,
    });
  },
  GetTwitchPlayer: function() {
    return this.player;
  },

  TogglePlayer: function(bool, stream) {
    this.newPlayerToggle.notify({
      bool: bool,
      stream: stream,
    });
  },

  ToggleAdvanced: function(bool, advanced) {
    this.newAdvancedToggle.notify({toggle: bool, advanced: advanced});
  }
};