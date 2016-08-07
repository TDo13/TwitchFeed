'use strict';

function ChannelModel(entry) {
  this._img = entry.logo || 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png';
  this._name = entry.display_name;
  this._game = entry.game;
  this._viewers = entry.views;
}