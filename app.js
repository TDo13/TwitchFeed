window.onload = function() {
  var page = 0;
  var url = 'https://api.twitch.tv/kraken/';
  var prev = null;
  var selfURI = null;
  var next = null;

  document.getElementById('prev_page').onclick = PrevPage;
  document.getElementById('next_page').onclick = NextPage;

  document.getElementById('query_box').onsubmit = function() {
    var target = document.getElementById('query_text').value
    var formValid = document.getElementById('form_valid')
    var formInvalid = document.getElementById('form_invalid')
    if (target.length < 1) {
      formValid.className = ''
      formValid.innerHTML = ''
      formInvalid.className = 'invalid'
      formInvalid.innerHTML = 'Please enter a query!'
      console.log('Invalid search')
    } else {
      // formInvalid.className = ''
      formInvalid.className = ''
      formInvalid.innerHTML = ''
      formValid.className = 'valid'
      // formValid.innerHTML = 'Please enter a query!'
      formValid.innerHTML = 'Searching for "' + target + '".'
      console.log('Valid search')
      SearchAPI(url + 'search/streams?q=' + target);
    }
    return false;
  }

  function SearchAPI(query) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', query)
    xhr.setRequestHeader('Client-ID', 'n3w0us084we2q25klwyasqv5dp1kmb1')
    xhr.send(null);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          document.getElementById('streams_list').innerHTML = '';
          FillBodyBox(data);
        } else {
          console.log('error : ', xhr.status);
        }
      }
      console.log('Received all entries');
    }
  }

  function FillBodyBox(data) {
    selfURI = data._links.self;

    var total = data._total;
    var offset = parseURI('offset',selfURI);
    var limit = parseURI('limit',selfURI)
    var lastPage = Math.ceil(total/9)

    page = offset/limit + 1
    prev = (page <= 1) ? null : data._links.prev;
    next = (page >= lastPage) ? null : data._links.next;
    
    document.getElementById('total_results').textContent = 'Total results: ' + total;
    document.getElementById('curr_page').textContent = page + '/' + lastPage;
    console.log(data);
    data.streams.forEach(function(entry, index) {
      // console.log(entry);
      CreateTwitchEntry(entry);
    })
  }

  function CreateTwitchEntry(entry) {
    var streamEntry = '<img src="' + entry.preview.medium + '" class="stream_image">' +
                      '<div class="stream_info">' +
                      '  <div class="stream_name">' + entry.channel.display_name + '</div>' +
                      '  <div class="stream_game">' + entry.channel.game + ' - ' + entry.channel.views + ' viewers</div>' +
                      '  <div class="stream_description">' + entry.channel.status + '</div>' +
                      '</div>'
    var htmlString = document.createElement('div')
    htmlString.className = 'stream_entry'
    htmlString.innerHTML = streamEntry;
    document.getElementById('streams_list').appendChild(htmlString);
  }

  function NextPage() {
    console.log('Next!')
    if (next) {
      SearchAPI(next);
    } else {
      console.log('No next page!');
    }
  }

  function PrevPage() {
    console.log('Prev!')
    if (prev) {
      SearchAPI(prev);
    } else {
      console.log('No prev page!');
    }
  }

  function parseURI(name, url) {
    if (!url) {
      return 1;
    }
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    return !results ? null : (!results[2] ? '' : decodeURIComponent(results[2].replace(/\+/g, " ")))
  }
}