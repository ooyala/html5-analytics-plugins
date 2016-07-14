Conviva = {
  currentPlayerStateManager : null, //unit test helper
  SystemInterface: function(){},
  SystemFactory: function()
  {
    this.release = function(){};
  },
  Client: function()
  {
    this.sessionId = 0;
    this.getPlayerStateManager = function()
    {
      return new Conviva.PlayerStateManager();
    };
    this.detachPlayer = function(){};
    this.releasePlayerStateManager = function(){};
    this.createSession = function(){
      return this.sessionId++;
    };
    this.attachPlayer = function(){};
    this.release = function()
    {
      this.sessionId = 0;
    };
    this.adStart = function(){};
    this.adEnd = function(){};
  },
  SystemSettings: function(){},
  ClientSettings: function(){},
  ContentMetadata: function(){},
  PlayerStateManager: function()
  {
    Conviva.currentPlayerStateManager = this;

    this.currentPlayerState = Conviva.PlayerStateManager.PlayerState.UNKONWN; //unit test helper

    this.setPlayerState = function(state)
    {
      this.currentPlayerState = state;
    };
  }
};

Conviva.PlayerStateManager.PlayerState = {
  PLAYING: "playing",
  PAUSED: "paused",
  STOPPED: "stopped",
  BUFFERING: "buffering",
  UNKONWN: "unknown",
  NOT_MONITORED: "notMonitored"
};

Conviva.SystemSettings.LogLevel = {
  DEBUG: 0,
  ERROR: 3,
  INFO: 1,
  NONE: 4,
  WARNING: 2
};

Conviva.ContentMetadata.StreamType = {
  UNKNOWN: "unknown",
  LIVE: "live",
  VOD: "vod"
};

Conviva.Client.NO_SESSION_KEY = -2;

Conviva.Client.AdPosition = {
  PREROLL: "preroll",
  MIDROLL: "midroll",
  POSTROLL: "postroll"
};

Conviva.Client.AdStream = {
  CONTENT: "content",
  SEPARATE: "separate"
};

Conviva.Client.AdPlayer = {
  CONTENT: "content",
  SEPARATE: "separate"
};