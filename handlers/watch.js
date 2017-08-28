var SteamID = require("steamid")
var Dota2 = require("../index"),
    util = require("util");

// Methods
/**
* Sends a message to the Game Coordinator requesting to spectate a game.
* Listen for {@link module:Dota2.Dota2Client#event:watchGameResponse|watchGameResponse} for the
* state of the request.
* Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
*
* @alias module:Dota2.Dota2Client#watchServer
*
* @param {string} server_steam_id - 64bit ID of steam server connecting to
*
* @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgWatchGameResponse`
*/

Dota2.Dota2Client.prototype.watchServer = function(server_steam_id, callback) {
  callback = callback || null;
  var _self = this;

  this.Logger.debug("Sending watch_server CMsgWatchGame request");
  var server64ID = new SteamID(server_steam_id.replace("=", "")).getSteamID64();

  var payload = {
    "server_steamid": server64ID,
    "watch_server_steamid": 0,
    "lobby_id": 0,
    "regions": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  }

  this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCWatchGame,
                  Dota2.schema.lookupType("CMsgWatchGame").encode(payload).finish(),
                  onWatchGameResponse, callback)
}

var handlers = Dota2.Dota2Client.prototype._handlers;

var onWatchGameResponse = function onWatchGameResponse(message, callback) {
  var watchGameResponse = Dota2.schema.lookupType("CMsgWatchGameResponse").decode(message);

  this.Logger.debug("Received watch_server response " + JSON.stringify(watchGameResponse));
  this.emit("watchGameResponse", watchGameResponse.result, watchGameResponse);

  if (callback) {
    if (watchGameResponse.result === 1) {
      callback(null, watchGameResponse);
    } else {
      callback(watchGameResponse.result, watchGameResponse);
    }
  }
};
handlers[Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCWatchGameResponse] = onWatchGameResponse;
