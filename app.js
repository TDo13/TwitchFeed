'use strict';

window.onload = function() {
  var _env = {
    page: 0,
    url: 'https://api.twitch.tv/kraken/',
    prev: null,
    selfURI: null,
    next: null,
    player: null,
  };

  document.getElementById('prev_page').addEventListener('click', PrevPage);
  document.getElementById('next_page').addEventListener('click', NextPage);
  document.getElementById('body_box').addEventListener('click', OnChannelClick);
  document.querySelector('button').onclick=ToggleTwitchPlayer;

  document.getElementById('query_box').onsubmit = function() {
    var target = document.getElementById('query_text').value;
    var formValid = document.getElementById('form_valid');
    var formInvalid = document.getElementById('form_invalid');
    if (target.length < 1) {
      formValid.className = '';
      formValid.innerHTML = '';
      formInvalid.className = 'invalid';
      formInvalid.innerHTML = 'Please enter a query!';
      // console.log('Invalid search');
    } else {
      formInvalid.className = '';
      formInvalid.innerHTML = '';
      formValid.className = 'valid';
      formValid.innerHTML = 'Searching for "' + target + '".';
      // console.log('Valid search');
      SearchAPI(_env.url + 'search/streams?q=' + target);
    }
    return false;
  };

  function SearchAPI(query) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', query);
    xhr.setRequestHeader('Client-ID', 'n3w0us084we2q25klwyasqv5dp1kmb1'); //Twitch API Key
    xhr.send(null);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          // document.getElementById('streams_list').innerHTML = '';
          FillBodyBox(data);
          console.log(data);
        } else {
          // console.log('error : ', xhr.status);
        }
      }
      // console.log('Received all entries');
    };
  }

  function FillBodyBox(data) {
    _env.selfURI = data._links.self;

    var total = data._total;
    var offset = parseURI('offset',_env.selfURI);
    var limit = parseURI('limit',_env.selfURI);
    var lastPage = Math.ceil(total/9);
    var htmlString;
    var streamList, oldList;
    var $bodyBox = document.getElementById('body_box');

    //Set the new page number value based on offset and total videos
    _env.page = offset/limit + 1;

    //Set new html links for previous and next page if exists
    _env.prev = (_env.page <= 1) ? null : data._links.prev;
    _env.next = (_env.page >= lastPage) ? null : data._links.next;
    document.getElementById('total_results').textContent = 'Total results: ' + total;
    document.getElementById('curr_page').textContent = _env.page + '/' + lastPage;
    
    htmlString = '';
    data.streams.forEach(function(entry) {
      htmlString += CreateTwitchEntry(entry);
    });

    //create a new list of streams
    streamList = document.createElement('div');
    streamList.className = 'streams_list';
    streamList.id = 'page_' + _env.page;
    streamList.innerHTML = htmlString;
    oldList = $bodyBox.querySelector('.streams_list');
    // var oldNode = document.querySelector('div.streams_list')

    //hide the old list of streams (remove if one already exists) 

    $bodyBox.insertBefore(streamList, oldList);    
    $bodyBox.removeChild(oldList);
    // console.log(streamList, oldList);
    // document.getElementById('body_box').replaceChild(streamList,oldNode);
  }

  function CreateTwitchEntry(entry) {
    var twitchEntry ='<div class="stream_entry">' +
                     '  <img src="' + entry.preview.medium + '" class="stream_image">' +
                     '  <div class="stream_info">' +
                     '    <div class="stream_name">' + entry.channel.display_name + '</div>' +
                     '    <div class="stream_game">' + entry.channel.game + ' - ' + entry.channel.views + ' viewers</div>' +
                     '    <div class="stream_description">' + entry.channel.status + '</div>' +
                     '  </div>' +
                     '</div>';
    return twitchEntry;
  }

  function CreateTwitchPlayer(channelName) {
    var options = {
      width: 854,
      height: 480,
      channel: channelName,
    };
    if (document.querySelector('iframe')) {
      console.log('iframe exists');
      _env.player.setChannel(channelName);
      return;
    } else {
      _env.player = new Twitch.Player("stream_view", options);
      _env.player.setVolume(0.5);
    }
  }

  function ToggleTwitchPlayer() {
    console.log('test');
    var div = document.getElementById('stream_view');
    if (div.className !== 'show') {
      div.className = 'show';
      if (_env.player) {
        _env.player.play();
      }
    }
    else {
      div.className = 'hide';
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
      // console.log('No next page!');
    }
  }

  function PrevPage() {
    // console.log('Prev!');
    if (_env.prev) {
      SearchAPI(_env.prev);
    } else {
      // console.log('No prev page!');
    }
  }

  function OnChannelClick(event) {
    var name = event.target.children[1].children[0].textContent;
    console.log('OCC', name);
    //Want to show a box that either creates iFrame or link to twitch.tv

    CreateTwitchPlayer(name);
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