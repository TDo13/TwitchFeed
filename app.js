'use strict';

window.onload = function() {
  var _env = {
    limit: 10,
    searchType: 'streams',
    options: '',
    page: 0,
    url: 'https://api.twitch.tv/kraken/',
    prev: null,
    selfURI: null,
    next: null,
    player: null,
  };

  document.getElementById('body_box').addEventListener('click', OnChannelClick);
  document.getElementById('header_box').addEventListener('click', OnHeaderClick);

  document.getElementById('query_box').onsubmit = function() {
    var target = document.getElementById('query_text').value;
    var formValid = document.getElementById('form_valid');
    formValid.className = '';
    formValid.className = 'searching';
    if (target.length < 1) {
      // formValid.className = 'error';
      formValid.innerHTML = 'Displaying top streams...';
      SetSearchType(document.querySelector('#default_search_type'));
      SearchAPI(_env.url + 'streams/?');
    } else {
      formValid.innerHTML = 'Searching for ' + target + '...';
      SearchAPI(_env.url + 'search/' + _env.searchType + '?limit=' + _env.limit + '&q=' + target + _env.options);
    }
    return false;
  };

  function OpenOptions() {
    var options = document.querySelector('#additional_options');
    if (options.className === '') {
      options.className = 'hidden';
    } else {
      options.className = '';
    }
  }

  function jsonp(url, success, fail, timeout) {
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
  }

  function SearchAPI(query) {
    jsonp(query, 
      function(data) {
        FillBodyBox(data);
      },
      function() {
        console.log('Error retrieving data');
      });
  }

  function FillBodyBox(data) {
    _env.selfURI = data._links.self;
    var htmlString;
    var streamList, oldList;
    var $bodyBox = document.getElementById('body_box');

    UpdateBodyBoxHeaders(data, $bodyBox);
    
    htmlString = '';
    data[_env.searchType].forEach(function(entry) {
      if (_env.searchType === 'streams') {
        htmlString += CreateStreamEntry(entry);
      } else if (_env.searchType === 'channels') {
        htmlString += CreateChannelEntry(entry);
      } else if (_env.searchType === 'games') {
        htmlString += CreateGameEntry(entry);
      }
    });

    //create a new list of streams
    streamList = document.createElement('div');
    streamList.className = 'streams_list';
    streamList.id = 'page_' + _env.page;
    streamList.innerHTML = htmlString;
    oldList = $bodyBox.querySelector('.streams_list');

    //hide the old list of streams (remove if one already exists) 
    $bodyBox.insertBefore(streamList, oldList);    
    $bodyBox.removeChild(oldList);
  }

  function UpdateBodyBoxHeaders(data, bodyBox) {
    var total = data._total || data[_env.searchType].length;
    var offset = parseURI('offset',_env.selfURI) || 0;
    var limit = parseURI('limit',_env.selfURI) || total;
    var lastPage = Math.ceil(total/limit);

    //Set the new page number value based on offset and total videos
    _env.page = offset/limit + 1;

    //Set new html links for previous and next page if exists
    _env.prev = (_env.page <= 1) ? null : data._links.prev;
    _env.next = (_env.page >= lastPage) ? null : data._links.next;
    bodyBox.querySelector('#total_results').textContent = 'Total results: ' + total;
    bodyBox.querySelector('#body_box_header').className = 'visible';
    bodyBox.querySelector('#curr_page').textContent = _env.page + '/' + lastPage;
  }

  function CreateStreamEntry(entry) {
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
  }

  function CreateChannelEntry(entry) {
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
  }

  function CreateGameEntry(entry) {
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
  }

  function CreateTwitchPlayer(channelName) {
    var options = {
      width: 854,
      height: 480,
      channel: channelName,
    };
    var stream = document.querySelector('#stream_view');
    if (stream.querySelector('iframe')) {
      // console.log('iframe exists');
      _env.player.setChannel(channelName);
      _env.player.play();
    } else {
      _env.player = new Twitch.Player("stream_view", options);
      _env.player.setVolume(0.5);
    }
    if (stream.className !== 'show') {
      stream.className = 'show';
    }
  }

  function ToggleTwitchPlayer() {
    var stream = document.querySelector('#stream_view');
    if (stream.className !== 'show') {
      stream.className = 'show';
      if (_env.player) {
        _env.player.play();
      }
    }
    else {
      stream.className = 'hide';
      if (_env.player) {
        _env.player.pause();
      }
    }
  }

  function NextPage() {
    // console.log('Next!');
    if (_env.next) {
      SearchAPI(_env.next);
    } else {
      console.log('No next page!');
    }
  }

  function PrevPage() {
    // console.log('Prev!');
    if (_env.prev) {
      SearchAPI(_env.prev);
    } else {
      console.log('No prev page!');
    }
  }

  function SetSearchType(node) {
    if (node.textContent === 'games') {
      _env.searchType = node.textContent;
      _env.options = '&type=suggest';
    } else {
      _env.searchType = node.textContent;
      _env.options = '';
    }
    document.getElementsByClassName('selected')[0].className = '';
    node.className = 'selected';
  }

  function SetResultsVal(node) {
    _env.limit = parseInt(node.textContent);
    document.getElementsByClassName('selected')[1].className = '';
    node.className = 'selected';
  }

  function OnChannelClick(event) {
    var name;
    if (event.target.className === "stream_entry") {
      name = event.target.children[1].children[0].textContent;
      // console.log('Channel Selected : ', name);
      CreateTwitchPlayer(name);
    } else if (event.target.className === "channel_entry") {
      name = event.target.children[1].children[0].textContent;
      // console.log('Channel Selected : ', name);
      // window.open(name);
    } else if (event.target.id === 'prev_page') {
      PrevPage();
    } else if (event.target.id === 'next_page') {
      NextPage();
    } else if (event.target.className === 'close_stream') {
      ToggleTwitchPlayer();
    }
  }

  function OnHeaderClick(event) {
    if (event.target.id === 'toggle_options') {
      OpenOptions();
    } else if (event.target.parentNode.id === 'search_type') {
      SetSearchType(event.target);
    } else if (event.target.parentNode.id === 'results_per_page') {
      SetResultsVal(event.target);
    }
  }

  function parseURI(name, url) {
    if (!url) {
      return 1;
    }
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    return !results ? null : (!results[2] ? '' : decodeURIComponent(results[2].replace(/\+/g, " ")));
  }
};