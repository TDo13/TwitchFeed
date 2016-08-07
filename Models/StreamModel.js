'use strict';

function StreamModel(entry) {
  this._img = entry.preview.medium;
  this._name = entry.channel.display_name;
  this._game = entry.channel.game;
  this._viewers = entry.viewers;
  this._description = entry.channel.status;
}