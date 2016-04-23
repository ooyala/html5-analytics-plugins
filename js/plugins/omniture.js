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
  var vpPlugin = new FakeVideoPlugin();

  var currentPlayhead = -1;

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
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method OmnitureAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    OO.log( "Analytics Template: PluginID \'" + id + "\' received this metadata:", metadata);
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
    OO.log( "Analytics Template: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    switch(eventName)
    {
      case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
        break;
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        trackComplete();
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED:
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED:
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        trackPlay();
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        trackPause();
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params[0])
        {
          playerDelegate.initialize(params[0]);
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED:
        trackSeekStart();
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        trackSeekEnd();
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_DOWNLOADING:
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED:
        trackBufferStart();
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED:
        trackBufferEnd();
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params[0] && params[0].streamPosition)
        {
          currentPlayhead = params[0].streamPosition;
          playerDelegate.updatePlayhead(currentPlayhead);
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        trackAdStart();
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        trackAdEnd();
        break;
      case OO.Analytics.EVENTS.DESTROY:
        break;
    }
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method OmnitureAnalyticsPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
  };

  //Main Content
  var trackPlay = function()
  {
    if (currentPlayhead === 0)
    {
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
};

var OoyalaPlayerDelegate = function()
{
  var id = null;
  var name = null;
  var length = -1;
  var streamType = null;
  var playerName = "Ooyala";
  var streamPlayhead = -1;

  this.initialize = function(metadata)
  {
    name = metadata.title;
    length = metadata.duration;
  };

  this.updatePlayhead = function(playhead)
  {
    streamPlayhead = playhead;
  };

  //Omniture required functions below
  this.getVideoInfo = function()
  {
    //TODO: Use Omniture VideoInfo object once we can integrate with their SDK
    var videoInfo = {};
    //TODO: Provide Metadata Title for both name and id?
    videoInfo.id = name;
    videoInfo.name = name;
    videoInfo.length = length;
    //TODO: StreamType
    //videoInfo.streamType = AssetType.ASSET_TYPE_VOD;
    videoInfo.playerName = playerName;
    videoInfo.playhead = streamPlayhead;
    return videoInfo;
  };

  this.getAdBreakInfo = function()
  {
    return null;
  };

  this.getAdInfo = function()
  {
    return null;
  };

  this.getChapterInfo = function()
  {
    return null;
  };

  this.getQoSInfo = function()
  {
    return null;
  };
};

//TODO: Remove this when integrating with Omniture SDK, can be used for unit testing
var FakeVideoPlugin = function()
{
  this.trackVideoLoad = function()
  {
    OO.log("OMNITURE: Track Video Load");
  };
  this.trackVideoUnload = function()
  {
    OO.log("OMNITURE: Track Video Unload");
  };
  this.trackSessionStart = function()
  {
    OO.log("OMNITURE: Track Session Start");
  };
  this.trackPlay = function()
  {
    OO.log("OMNITURE: Track Play");
  };
  this.trackPause = function()
  {
    OO.log("OMNITURE: Track Pause");
  };
  this.trackComplete = function()
  {
    OO.log("OMNITURE: Track Complete");
  };
  this.trackSeekStart = function()
  {
    OO.log("OMNITURE: Track Seek Start");
  };
  this.trackSeekComplete = function()
  {
    OO.log("OMNITURE: Track Seek Complete");
  };
  this.trackBufferStart = function()
  {
    OO.log("OMNITURE: Track Buffer Start");
  };
  this.trackBufferComplete = function()
  {
    OO.log("OMNITURE: Track Buffer Complete");
  };

  this.trackAdStart = function()
  {
    OO.log("OMNITURE: Track Ad Start");
  };
  this.trackAdComplete = function()
  {
    OO.log("OMNITURE: Track Ad Complete");
  };

  this.trackChapterStart = function(){};
  this.trackChapterComplete = function(){};

  this.trackBitrateChange = function(){};

  this.trackVideoPlayerError = function(){};
  this.trackApplicationError = function(){};
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(OmnitureAnalyticsPlugin);

module.exports = OmnitureAnalyticsPlugin;
