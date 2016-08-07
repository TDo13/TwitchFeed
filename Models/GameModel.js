'use strict';

function ChannelModel(entry) {
  this._url = 'https://www.twitch.tv/directory/game/' + encodeURIComponent(entry.name);
  this._img = entry.box.medium;
  this._name = entry.name;
  this._game = entry.game;
  this._viewers = entry.popularity;
}