require("../framework/InitAnalyticsNamespace.js");

/**
 * @class OmnitureAnalyticsPlugin
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var OmnitureAnalyticsPlugin = function (framework)
{
  var _framework = framework;
  var name = "Omniture";
  var version = "v1";
  var id;
  var _active = true;

  var playerDelegate = new OoyalaPlayerDelegate();
  //TODO: Remove this when integrating with Omniture SDK
  var vpPlugin = new FakeVideoPlugin(playerDelegate);
  //TODO: Find out how to expose the vpPlugin for unit tests
  this.omnitureVideoPlayerPlugin = vpPlugin;

  var currentPlayhead = 0;
  var videoPlaying = false;
  var inAdBreak = false;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method OmnitureAnalyticsPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method OmnitureAnalyticsPlugin#getVersion
   * @return {string} The version of the plugin.
   */
  this.getVersion = function ()
  {
    return version;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method OmnitureAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method OmnitureAnalyticsPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method OmnitureAnalyticsPlugin#init
   */
  this.init = function()
  {
    var missedEvents;
    //if you need to process missed events, here is an example
    if (_framework && OO._.isFunction(_framework.getRecordedEvents))
    {
      missedEvents = _framework.getRecordedEvents();
      _.each(missedEvents, _.bind(function (recordedEvent)
        {
          //recordedEvent.timeStamp;
          this.processEvent(recordedEvent.eventName, recordedEvent.params);
        }, this));
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method OmnitureAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    OO.log( "Omniture: PluginID \'" + id + "\' received this metadata:", metadata);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method OmnitureAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "Omniture: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    switch(eventName)
    {
      //case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
      //  break;
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        trackSessionStart();
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        trackComplete();
        break;
      //case OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED:
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        trackPlay();
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        //TODO: According to https://marketing.adobe.com/resources/help/en_US/sc/appmeasurement/hbvideo/video_events.html
        //we should not be tracking pauses when switching from main content to an ad
        trackPause();
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        playerDelegate.onReplay();
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        if (params && params[0] && params[0].embedCode)
        {
          playerDelegate.onEmbedCodeChanged(params[0].embedCode);
        }
        resetPlaybackState();
        break;
      //case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          playerDelegate.initializeContent(params[0]);
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED:
        trackSeekStart();
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        trackSeekEnd();
        break;
      //case OO.Analytics.EVENTS.VIDEO_STREAM_DOWNLOADING:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED:
        trackBufferStart();
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED:
        trackBufferEnd();
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition)
        {
          if (!inAdBreak)
          {
            currentPlayhead = params[0].streamPosition;
            playerDelegate.onPlayheadChanged(currentPlayhead);
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        inAdBreak = true;
        playerDelegate.onAdBreak();
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        inAdBreak = false;
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        if (params && params[0])
        {
          playerDelegate.onAdPlayback(params[0]);
        }
        trackAdStart();
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        trackAdEnd();
        break;
      //case OO.Analytics.EVENTS.DESTROY:
      //  break;
      default:
        break;
    }
  };

  var resetPlaybackState = function ()
  {
    videoPlaying = false;
    currentPlayhead = 0;
    inAdBreak = false;
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method OmnitureAnalyticsPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
    resetPlaybackState();
  };

  //Main Content
  var trackSessionStart = function(e)
  {
    vpPlugin.trackSessionStart();
  };

  var trackPlay = function()
  {
    if (!videoPlaying)
    {
      videoPlaying = true;
      vpPlugin.trackVideoLoad();
      vpPlugin.trackPlay();
    }
    else
    {
      vpPlugin.trackPlay();
    }
  };

  var trackPause = function(e)
  {
    vpPlugin.trackPause();
  };

  var trackSeekStart = function(e)
  {
    vpPlugin.trackSeekStart();
  };

  var trackSeekEnd = function(e)
  {
    vpPlugin.trackSeekComplete();
  };

  var trackComplete = function()
  {
    videoPlaying = false;
    vpPlugin.trackComplete();
    vpPlugin.trackVideoUnload();
  };

  var trackBufferStart = function(e)
  {
    vpPlugin.trackBufferStart();
  };

  var trackBufferEnd = function(e)
  {
    vpPlugin.trackBufferComplete();
  };

  //Ads
  var trackAdStart = function(e)
  {
    vpPlugin.trackAdStart();
  };

  var trackAdEnd = function(e)
  {
    vpPlugin.trackAdComplete();
  };

  //TODO: Find out how to expose the player delegate for unit tests
  //convenience functions for unit testing
  this.getPlayerDelegate = function()
  {
    return playerDelegate;
  };
};

var OoyalaPlayerDelegate = function()
{
  //video
  var id = null;
  var name = null;
  var length = -1;
  var streamType = null;
  var playerName = "Ooyala V4";
  var streamPlayhead = 0;

  //ad
  var adId = null;
  var adLength = -1;
  var adPosition = 1;
  var adName = null;

  this.initializeContent = function(metadata)
  {
    name = metadata.title;
    length = metadata.duration;
  };
  
  this.onEmbedCodeChanged = function(embedCode)
  {
    id = embedCode;
  };

  this.onPlayheadChanged = function(playhead)
  {
    streamPlayhead = playhead;
  };

  this.onAdBreak = function()
  {
    adBreakPosition = 1;
  };

  this.onAdPlayback = function(metadata)
  {
    adId = metadata.adId;
    adLength = metadata.adDuration;
    adPosition = metadata.adPodPosition;
    //TODO: Maybe add ad name (optional)
    //adName = metadata.name;
  };

  this.onReplay = function()
  {
    streamPlayhead = 0;
    adId = null;
    adLength = -1;
    adPosition = 1;
    adName = null;
  };

  //Omniture required functions below
  this.getVideoInfo = function()
  {
    //TODO: Use Omniture VideoInfo object once we can integrate with their SDK
    var videoInfo = {};
    videoInfo.id = id;
    videoInfo.name = name;
    videoInfo.length = length;
    //TODO: StreamType and update unit test
    //The type of the video asset, one of the following: AssetType.ASSET_TYPE_LIVE,
    //AssetType.ASSET_TYPE_LINEAR, AssetType.ASSET_TYPE_VOD
    //videoInfo.streamType = AssetType.ASSET_TYPE_VOD;
    videoInfo.playerName = playerName;
    videoInfo.playhead = streamPlayhead;
    return videoInfo;
  };

  this.getAdBreakInfo = function()
  {
    //TODO: Is there an Omniture AdBreak object?
    var adBreakInfo = {};
    adBreakInfo.playerName = playerName;
    //TODO: Ad break position?
    adBreakInfo.position = adBreakPosition;
    adBreakInfo.startTime = streamPlayhead;
    return adBreakInfo;
  };

  this.getAdInfo = function()
  {
    //TODO: Is there an Omniture AdInfo object?
    var adInfo = {};
    adInfo.id = adId;
    adInfo.length = adLength;
    adInfo.position = adPosition;
    //TODO: Maybe add ad name (optional)
    //adInfo.name = adName;
    return adInfo;
  };

  //this.getChapterInfo = function()
  //{
  //  return null;
  //};
  //
  //this.getQoSInfo = function()
  //{
  //  return null;
  //};
};

//TODO: Remove this when integrating with Omniture SDK, can be used for unit testing
var FakeVideoPlugin = function(playerDelegate)
{
  var delegate = playerDelegate;

  this.trackVideoLoad = function()
  {
    var videoInfo = delegate.getVideoInfo();
    OO.log("Omniture Video Plugin: Track Video Load of video: " + videoInfo.name + " with id: " + videoInfo.id +
      " with duration: " + videoInfo.length + " at playhead: " + videoInfo.playhead + " with player: " + videoInfo.playerName);
  };

  this.trackVideoUnload = function()
  {
    OO.log("Omniture Video Plugin: Track Video Unload at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackSessionStart = function()
  {
    OO.log("Omniture Video Plugin: Track Session Start at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackPlay = function()
  {
    OO.log("Omniture Video Plugin: Track Play at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackPause = function()
  {
    OO.log("Omniture Video Plugin: Track Pause at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackComplete = function()
  {
    OO.log("Omniture Video Plugin: Track Complete at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackSeekStart = function()
  {
    OO.log("Omniture Video Plugin: Track Seek Start at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackSeekComplete = function()
  {
    OO.log("Omniture Video Plugin: Track Seek Complete at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackBufferStart = function()
  {
    OO.log("Omniture Video Plugin: Track Buffer Start at playhead: " + delegate.getVideoInfo().playhead);
  };
  this.trackBufferComplete = function()
  {
    OO.log("Omniture Video Plugin: Track Buffer Complete at playhead: " + delegate.getVideoInfo().playhead);
  };

  this.trackAdStart = function()
  {
    var adBreakInfo = delegate.getAdBreakInfo();
    var adInfo = delegate.getAdInfo();
    OO.log("Omniture Video Plugin: Track Ad Start at playhead: " + adBreakInfo.startTime + " with ad: " + adInfo.id +
      " with duration: " + adInfo.length + " and pod position: " + adInfo.position);
  };
  this.trackAdComplete = function()
  {
    var adBreakInfo = delegate.getAdBreakInfo();
    OO.log("Omniture Video Plugin: Track Ad Complete at playhead: " + adBreakInfo.startTime);
  };

  //this.trackChapterStart = function(){};
  //this.trackChapterComplete = function(){};
  //
  //this.trackBitrateChange = function(){};
  //
  //this.trackVideoPlayerError = function(){};
  //this.trackApplicationError = function(){};
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(OmnitureAnalyticsPlugin);

module.exports = OmnitureAnalyticsPlugin;
