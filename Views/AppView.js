'use strict';

function AppView(model, elements) {
  this._model = model;
  this._elements = elements;

  this.OnBodyClick = new Event(this);
  this.OnHeaderClick = new Event(this);
  this.OnQuerySubmit = new Event(this);
  this.NewSearch = new Event(this);

  //Attaching listeners from model to view
  var _this = this;
  this._model.newStreams.attach(function(sender, args) {
    _this.FillBodyBox(args.streams);
  });
  this._model.newSearch.attach(function(sender, args) {
    _this.UpdateSearchView(args);
  });
  this._model.newLimit.attach(function(sender, args) {
    _this.UpdateAdvanced('limit', args);
  });
  this._model.newSearchType.attach(function(sender, args) {
    _this.UpdateAdvanced('searchType', args);
  });
  this._model.newBodyBoxHeader.attach(function(sender, args) {
    _this.UpdateBodyBoxHeader(args);
  });
  this._model.newPlayerToggle.attach(function(sender, args) {
    _this.TogglePlayer(args.setActive);
  });
  this._model.newAdvancedToggle.attach(function() {
    _this.ToggleAdvanced();
  });

  //Attaching listeners from view to HTML
  if (this._elements) {
    this._elements.bodyBox.addEventListener('click', function(e) {
      _this.OnBodyClick.notify({event: e});
    });
    this._elements.headerBox.addEventListener('click', function(e) {
      _this.OnHeaderClick.notify({event: e});
    });
    this._elements.queryBox.addEventListener('submit', function(e) {
      e.preventDefault();
      _this.OnQuerySubmit.notify({event: e.target});
    });
  }
}

AppView.prototype = {
  UpdateSearchView: function(args) {
    var formValid = document.getElementById('form_valid');
    if (args.isSearching) {
      formValid.className = 'searching';
      formValid.innerHTML = args.innerHTML;
    } else {
      formValid.className = 'error';
      formValid.innerHTML = args.innerHTML;
    }
  },

  FillBodyBox: function(data) {
    // this._model.SetSelfURI(data._links.self);
    // var data = this._model.GetStreams();
    var htmlString;
    var streamList, oldList;
    var $bodyBox = document.getElementById('body_box');
    var searchType = this._model.GetSearchType();
    var _this = this;
    if(data[searchType]) {
    htmlString = '';
      data[searchType].forEach(function(entry) {
        if (searchType === 'streams') {
          htmlString += _this.CreateStreamEntry(entry);
        } else if (searchType === 'channels') {
          htmlString += _this.CreateChannelEntry(entry);
        } else if (searchType === 'games') {
          htmlString += _this.CreateGameEntry(entry);
        }
      });

      //create a new list of streams
      streamList = document.createElement('div');
      streamList.className = 'streams_list';
      streamList.id = 'page_' + this._model.GetBodyBoxHeaders().page;
      streamList.innerHTML = htmlString;
      oldList = $bodyBox.querySelector('.streams_list');

      //hide the old list of streams (remove if one already exists) 
      $bodyBox.insertBefore(streamList, oldList);    
      if(oldList) {
        $bodyBox.removeChild(oldList);
      }
    }
  },

  CreateStreamEntry: function(entry) {
    var twitchEntry ='<a href="#">' +
                     '  <div class="stream_entry">' +
                     '    <img src="' + entry.preview.medium + '" class="stream_image">' +
                     '    <div class="stream_info">' +
                     '      <div class="stream_name">' + entry.channel.display_name + '</div>' +
                     '      <div class="stream_game"><span class=game>' + entry.channel.game + '</span> - ' + entry.viewers + ' viewers</div>' +
                     '      <div class="stream_description">' + entry.channel.status + '</div>' +
                     '    </div>' +
                     '  </div>' +
                     '</a>';
    return twitchEntry;
  },

  CreateChannelEntry: function(entry) {
    var img = entry.logo || 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png';
    var channelEntry ='<a href="' + entry.url + '" target="_blank">' +
                      '  <div class="channel_entry">' +
                      '    <img src="' + img + '" class="channel_image">' +
                      '    <div class="channel_info">' +
                      '      <div class="channel_name">' + entry.display_name + '</div>' +
                      '      <div class="channel_game"><span class=game>' + entry.game + '</span> - ' + entry.views + ' total views</div>' +
                      '    </div>' +
                      '  </div>' +
                      '</a>';
    return channelEntry;
  },

  CreateGameEntry: function(entry) {
    var gameEntry = '<a href="https://www.twitch.tv/directory/game/' + encodeURIComponent(entry.name) + '" target="_blank">' +
                    '  <div class="game_entry">' +
                    '    <img src="' + entry.box.medium + '" class="game_image">' +
                    '    <div class="game_info">' +
                    '      <div class="game_name">' + entry.name + '</div>' +
                    '      <div class="game_game">' + entry.popularity + ' viewers</div>' +
                    '    </div>' +
                    '  </div>' +
                    '</a>';
    return gameEntry;
  },

  TogglePlayer: function(bool) {
    var stream = document.querySelector('#stream_view');
    var player = this._model.GetTwitchPlayer();
    if (stream.className !== 'show' || bool) {
      stream.className = 'show';
      if (player) {
        player.play();
      }
    }
    else {
      stream.className = 'hide';
      if (player) {
        player.pause();
      }
    }
  },

  ToggleAdvanced: function() {
    var options = document.querySelector('#additional_options');
    if (options.className === '') {
      options.className = 'hidden';
    } else {
      options.className = '';
    }
  },

  UpdateAdvanced: function(type, args) {
    var advancedOptions = document.getElementsByClassName('selected');
    var target = document.getElementById('query_box');
    var topStreams = false;
    if (type === 'searchType') {
      advancedOptions[0].className = '';
      if (args.node.id === 'page_name') {
        topStreams = true;
        target.reset();
        document.getElementById('default_search_type').className = 'selected';
      } else {
        args.node.className = 'selected';
      }
    }
    else if (type === 'limit') {
      advancedOptions[1].className = '';
      args.node.className = 'selected';
      topStreams = target[0] ? (target[0].value ? false : true) : false;
    }
    this.NewSearch.notify({
      target: target,
      bool: topStreams,
    });
  },

  UpdateBodyBoxHeader: function(bodyBoxHeader) {
    var bodyBox = document.getElementById('body_box');
    bodyBox.querySelector('#total_results').textContent = 'Total results: ' + bodyBoxHeader.total;
    bodyBox.querySelector('#body_box_header').className = 'visible';
    bodyBox.querySelector('#curr_page').textContent = bodyBoxHeader.page + '/' + bodyBoxHeader.lastPage;
  }
};