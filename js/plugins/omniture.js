require("../framework/InitAnalyticsNamespace.js");
// require("./omniture/AppMeasurement.js");
// require("./omniture/VideoHeartbeat.min.js");
// require("./omniture/VisitorAPI.js");
require("./omniture/sample.adobe.analytics.plugin.delegate");
require("./omniture/sample.adobe.heartbeat.plugin.delegate");
require("./omniture/sample.heartbeat.delegate");

/**
 * @class OmnitureAnalyticsPlugin
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var OmnitureAnalyticsPlugin = function (framework)
{
  var _framework = framework;
  var name = "omniture";
  var version = "v1";
  var id;
  var _active = true;

  var playerDelegate = new OoyalaPlayerDelegate();
  var vpPlugin = null;
  var aaPlugin = null;
  var heartbeat = null;

  var currentPlayhead = 0;
  var mainContentStarted = false;
  var inAdBreak = false;
  var trackedPlayForPreroll = false;
  var pauseRequested = false;
  var queueBufferStart = false;
  var seekStarted = false;
  var bufferStarted = false;

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
    // Set-up the Visitor and AppMeasurement instances.
    //TODO: Validate metadata
    if (validateOmnitureMetadata(metadata))
    {
      var visitor = new Visitor(metadata.marketingCloudOrgId);
      visitor.trackingServer = metadata.visitorTrackingServer;

      // Set-up the AppMeasurement component.
      var appMeasurement = new AppMeasurement();
      appMeasurement.visitor = visitor;
      appMeasurement.trackingServer = metadata.appMeasurementTrackingServer;
      appMeasurement.account = metadata.reportSuiteId;
      appMeasurement.pageName = metadata.pageName;
      appMeasurement.charSet = "UTF-8";
      appMeasurement.visitorID = metadata.visitorId;

      //TODO: Get props and evar from backdoor/backlot settings as well
      //add in props
      if (!_.isEmpty(metadata.props))
      {
        _.each(metadata.props, function(key)
        {
          //TODO: Validate keys (are of form prop#)
          appMeasurement[key] = metadata.props[key];
        });
      }

      //add in eVars
      if (!_.isEmpty(metadata.eVars))
      {
        _.each(metadata.eVars, function(key)
        {
          //TODO: Validate keys (are of form eVar#)
          appMeasurement[key] = metadata.eVars[key];
        });
      }

      // Setup the VideoPlayerPlugin, this is passed into Heartbeat()
      vpPlugin = new ADB.va.plugins.videoplayer.VideoPlayerPlugin(playerDelegate);
      //TODO: Find out how to expose the vpPlugin for unit tests
      this.omnitureVideoPlayerPlugin = vpPlugin;
      var playerPluginConfig = new ADB.va.plugins.videoplayer.VideoPlayerPluginConfig();
      playerPluginConfig.debugLogging = metadata.debug; // set this to false for production apps.
      vpPlugin.configure(playerPluginConfig);

      // Setup the AdobeAnalyticsPlugin plugin, this is passed into Heartbeat()
      aaPlugin = new ADB.va.plugins.aa.AdobeAnalyticsPlugin(appMeasurement, new SampleAdobeAnalyticsPluginDelegate());
      var aaPluginConfig = new ADB.va.plugins.aa.AdobeAnalyticsPluginConfig();
      aaPluginConfig.channel = metadata.channel; //optional
      aaPluginConfig.debugLogging = metadata.debug; // set this to false for production apps.
      aaPlugin.configure(aaPluginConfig);

      // Setup the AdobeHeartbeat plugin, this is passed into Heartbeat()
      var ahPlugin = new ADB.va.plugins.ah.AdobeHeartbeatPlugin(new SampleAdobeHeartbeatPluginDelegate());
      var ahPluginConfig = new ADB.va.plugins.ah.AdobeHeartbeatPluginConfig(
        metadata.heartbeatTrackingServer,
        metadata.publisherId);
      ahPluginConfig.ovp = "Ooyala";
      //TODO: Get Player version
      ahPluginConfig.sdk = "4.3.3";
      ahPluginConfig.debugLogging = metadata.debug; // set this to false for production apps.
      ahPlugin.configure(ahPluginConfig);

      var plugins = [vpPlugin, aaPlugin, ahPlugin];

      // Setup and configure the Heartbeat lib.
      heartbeat = new ADB.va.Heartbeat(new SampleHeartbeatDelegate(), plugins);
      var configData = new ADB.va.HeartbeatConfig();
      configData.debugLogging = metadata.debug; // set this to false for production apps.
      heartbeat.configure(configData);
    }
  };

  /**
   * Omniture metadata needs to include the following:
   * marketingCloudOrgId, visitorTrackingServer, appMeasurementTrackingServer,
   * reportSuiteId, pageName, visitorId, channel, heartbeatTrackingServer, and
   * publisherId
   *
   * It can optionally have:
   * debug, props, eVars
   * @private
   * @method OmnitureAnalyticsPlugin#validateOmnitureMetadata
   * @param  {object} metadata The Omniture metadata to validate
   * @return true if valid, false otherwise
   */
  var validateOmnitureMetadata = function(metadata)
  {
    var valid = true;
    var requiredKeys = ["marketingCloudOrgId", "visitorTrackingServer", "appMeasurementTrackingServer",
      "reportSuiteId", "pageName", "visitorId", "channel", "heartbeatTrackingServer", "publisherId"];

    var missingKeys = [];

    if (metadata)
    {
      _.each(requiredKeys, function(key)
      {
        if (!_.has(metadata, key))
        {
          missingKeys.push(key);
          valid = false;
        }
      });
    }
    else
    {
      OO.log("Error: Missing Omniture Metadata!");
      missingKeys = requiredKeys;
      valid = false;
    }


    if(!_.isEmpty(missingKeys))
    {
      _.each(missingKeys, function(key)
      {
        OO.log("Error: Missing Omniture Metadata Key: " + key);
      });
    }

    return valid;
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
        onContentStart();
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        trackComplete();
        break;
      //case OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED:
        pauseRequested = true;
       break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        trackPlay();
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        //According to https://marketing.adobe.com/resources/help/en_US/sc/appmeasurement/hbvideo/video_events.html
        //we should not be tracking pauses when switching from main content to an ad
        if (pauseRequested)
        {
          pauseRequested = false;
          trackPause();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        onContentStart();
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
        //Note that we get a seek requested upon replay before main content playback starts
        if (mainContentStarted && !inAdBreak)
        {
          trackSeekStart();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        //Only send seek completed if we sent a seek requested
        if (mainContentStarted && !inAdBreak && seekStarted)
        {
          trackSeekEnd();
        }
        break;
      //case OO.Analytics.EVENTS.VIDEO_STREAM_DOWNLOADING:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED:
        //TODO: Ask about Buffer before play start
        if (!inAdBreak)
        {
          if (mainContentStarted)
          {
            trackBufferStart();
          }
          else
          {
            queueBufferStart = true;
          }
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED:
        if (!inAdBreak && bufferStarted)
        {
          trackBufferEnd();
        }
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
        if(!mainContentStarted && !trackedPlayForPreroll)
        {
          trackedPlayForPreroll = true;
          //We need a special track play here for ads if main content has not started.
          //Don't call the trackPlay() function of this plugin because that one
          //is for the main content
          vpPlugin.trackPlay();
        }
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        trackAdEnd();
        break;
      // case OO.Analytics.EVENTS.DESTROY:
      //   break;
      default:
        break;
    }
  };

  var resetPlaybackState = function ()
  {
    currentPlayhead = 0;
    mainContentStarted = false;
    inAdBreak = false;
    trackedPlayForPreroll = false;
    pauseRequested = false;
    queueBufferStart = false;
    seekStarted = false;
    bufferStarted = false;
    playerDelegate.resetState();
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method OmnitureAnalyticsPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
    if (heartbeat)
    {
      heartbeat.destroy();
      heartbeat = null;
    }
    resetPlaybackState();
  };

  var onContentStart = function()
  {
    trackVideoLoad();
    trackSessionStart();
  };

  //Main Content
  var trackVideoLoad = function(e)
  {
    vpPlugin.trackVideoLoad();
  };

  var trackSessionStart = function(e)
  {
    vpPlugin.trackSessionStart();
  };

  var trackPlay = function()
  {
    if (!mainContentStarted)
    {
      mainContentStarted = true;
      vpPlugin.trackPlay();

      if(queueBufferStart)
      {
        queueBufferStart = false;
        trackBufferStart();
      }
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
    seekStarted = true;
    vpPlugin.trackSeekStart();
  };

  var trackSeekEnd = function(e)
  {
    seekStarted = false;
    vpPlugin.trackSeekComplete();
  };

  var trackComplete = function()
  {
    mainContentStarted = false;
    vpPlugin.trackComplete();
    vpPlugin.trackVideoUnload();
  };

  var trackBufferStart = function(e)
  {
    bufferStarted = true;
    vpPlugin.trackBufferStart();
  };

  var trackBufferEnd = function(e)
  {
    bufferStarted = false;
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

  var adBreakPosition = 0;

  this.initializeContent = function(metadata)
  {
    name = metadata.title;
    length = Math.round(metadata.duration/1000);
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
    adBreakPosition++;
  };

  this.onAdPlayback = function(metadata)
  {
    adId = metadata.adId;
    adLength = metadata.adDuration;
    adPosition = metadata.adPodPosition;
    //TODO: Maybe add ad name (optional)
    adName = metadata.adId;
  };

  this.resetState = function()
  {
    streamPlayhead = 0;
    adId = null;
    adLength = -1;
    adPosition = 1;
    adName = null;
    adBreakPosition = 0;
  };

  //Omniture required functions below
  this.getVideoInfo = function()
  {
    var videoInfo = new ADB.va.plugins.videoplayer.VideoInfo();
    videoInfo.id = id;
    videoInfo.name = name;
    videoInfo.length = length;
    //TODO: StreamType and update unit test
    //The type of the video asset, one of the following: AssetType.ASSET_TYPE_LIVE,
    //AssetType.ASSET_TYPE_LINEAR, AssetType.ASSET_TYPE_VOD
    videoInfo.streamType = ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_VOD;
    videoInfo.playerName = playerName;
    videoInfo.playhead = streamPlayhead;
    return videoInfo;
  };

  this.getAdBreakInfo = function()
  {
    var adBreakInfo = new ADB.va.plugins.videoplayer.AdBreakInfo();
    adBreakInfo.playerName = playerName;
    //TODO: Ad break position? How to ensure accuracy if an ad break is skipped via seeking
    adBreakInfo.position = adBreakPosition;
    adBreakInfo.startTime = streamPlayhead;
    return adBreakInfo;
  };

  this.getAdInfo = function()
  {
    var adInfo = new ADB.va.plugins.videoplayer.AdInfo();
    adInfo.id = adId;
    adInfo.length = adLength;
    adInfo.position = adPosition;
    //TODO: Maybe add ad name (optional)
    adInfo.name = adName;
    return adInfo;
  };

  this.getChapterInfo = function()
  {
    //TODO: Chapter info if/when available
   return null;
  };

  this.getQoSInfo = function()
  {
    //TODO: QOS info if/when available
   return null;
  };
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(OmnitureAnalyticsPlugin);

module.exports = OmnitureAnalyticsPlugin;
