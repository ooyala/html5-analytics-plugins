require("../framework/InitAnalyticsNamespace.js");
// require("./omniture/AppMeasurement.js");
// require("./omniture/VideoHeartbeat.min.js");
// require("./omniture/VisitorAPI.js");

/**
 * @class OmnitureAnalyticsPlugin
 * @classdesc Omniture Analytics/Video Heartbeat plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var OmnitureAnalyticsPlugin = function (framework)
{
  var _framework = framework;
  var name = "omniture";
  var version = "v1";
  var id;

  var OOYALA_PLAYER_NAME = "Ooyala V4";
  var OOYALA_PLAYER_VERSION = "4.18.7";

  var playerDelegate = new OoyalaPlayerDelegate();
  var vpPlugin = null;
  var aaPlugin = null;
  var heartbeat = null;

  var currentPlayhead = 0;
  var mainContentStarted = false;
  var inAdBreak = false;
  var trackedPlayForPreroll = false;
  var pauseRequested = false;
  var seekStarted = false;

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
    if (validateOmnitureMetadata(metadata))
    {
      //Doc: https://marketing.adobe.com/resources/help/en_US/sc/appmeasurement/hbvideo/video_as_configure.html

      //TODO: Get metadata, props and evar from backdoor/backlot settings as well
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

      //add in props
      if (!_.isEmpty(metadata.props))
      {
        _.each(metadata.props, function(value, key)
        {
          //TODO: Validate keys (are of form prop#)
          appMeasurement[key] = value;
        });
      }

      //add in eVars
      if (!_.isEmpty(metadata.eVars))
      {
        _.each(metadata.eVars, function(value, key)
        {
          //TODO: Validate keys (are of form eVar#)
          appMeasurement[key] = value;
        });
      }

      // Setup the VideoPlayerPlugin, this is passed into Heartbeat()
      vpPlugin = new ADB.va.plugins.videoplayer.VideoPlayerPlugin(playerDelegate);
      this.omnitureVideoPlayerPlugin = vpPlugin;
      var playerPluginConfig = new ADB.va.plugins.videoplayer.VideoPlayerPluginConfig();
      playerPluginConfig.debugLogging = metadata.debug; // set this to false for production apps.
      vpPlugin.configure(playerPluginConfig);

      // Setup the AdobeAnalyticsPlugin plugin, this is passed into Heartbeat()
      aaPlugin = new ADB.va.plugins.aa.AdobeAnalyticsPlugin(appMeasurement, new ADB.va.plugins.aa.AdobeAnalyticsPluginDelegate());
      var aaPluginConfig = new ADB.va.plugins.aa.AdobeAnalyticsPluginConfig();
      aaPluginConfig.channel = metadata.channel; //optional
      aaPluginConfig.debugLogging = metadata.debug; // set this to false for production apps.
      aaPlugin.configure(aaPluginConfig);

      // Setup the AdobeHeartbeat plugin, this is passed into Heartbeat()
      var ahPlugin = new ADB.va.plugins.ah.AdobeHeartbeatPlugin(new ADB.va.plugins.ah.AdobeHeartbeatPluginDelegate());
      var ahPluginConfig = new ADB.va.plugins.ah.AdobeHeartbeatPluginConfig(
        metadata.heartbeatTrackingServer,
        metadata.publisherId);
      ahPluginConfig.ovp = OOYALA_PLAYER_NAME;
      //TODO: Get Player version
      ahPluginConfig.sdk = OOYALA_PLAYER_VERSION;
      ahPluginConfig.debugLogging = metadata.debug; // set this to false for production apps.
      if (metadata.heartbeatSSL)
      {
        // set this to true to enable Heartbeat calls through HTTPS
        ahPluginConfig.ssl = metadata.heartbeatSSL;
      }
      ahPlugin.configure(ahPluginConfig);

      var plugins = [vpPlugin, aaPlugin, ahPlugin];

      // Setup and configure the Heartbeat lib.
      heartbeat = new ADB.va.Heartbeat(new ADB.va.HeartbeatDelegate(), plugins);
      var configData = new ADB.va.HeartbeatConfig();
      configData.debugLogging = metadata.debug; // set this to false for production apps.
      heartbeat.configure(configData);
    }
  };

  var checkSdkLoaded = function()
  {
    //TODO: Check all the ADB objects exist
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
   * @returns true if valid, false otherwise
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
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        onContentStart();
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        trackComplete();
        break;
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
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          playerDelegate.onInitializeContent(params[0]);
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
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED:
        //TODO: Ask about Buffer before play start
        //TODO: Revisit buffering logic
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED:
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
        playerDelegate.onAdBreakComplete();
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        if (params && params[0])
        {
          if (params[0].adType === OO.Analytics.AD_TYPE.LINEAR_VIDEO)
          {
            playerDelegate.onAdPlayback(params[0].adMetadata);
            trackAdStart();
            if(!mainContentStarted && !trackedPlayForPreroll)
            {
              trackedPlayForPreroll = true;
              //We need a special track play here for ads if main content has not started.
              //Don't call the trackPlay() function of this plugin because that one
              //is for the main content
              vpPlugin.trackPlay();
            }
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        if (params && params[0])
        {
          if (params[0].adType === OO.Analytics.AD_TYPE.LINEAR_VIDEO)
          {
            trackAdEnd();
            playerDelegate.onAdPlaybackComplete();
          }
        }
        break;
      default:
        break;
    }
  };

  /**
   * Resets all state variables to their initial values.
   * @private
   * @method OmnitureAnalyticsPlugin#resetPlaybackState
   */
  var resetPlaybackState = function ()
  {
    currentPlayhead = 0;
    mainContentStarted = false;
    inAdBreak = false;
    trackedPlayForPreroll = false;
    pauseRequested = false;
    seekStarted = false;
    playerDelegate.onReplay();
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

  /**
   * To be called when content has started (via user click, a replay event, etc). Will call the VideoPlayerPlugin's
   * trackVideoLoad and trackSessionStart APIs. trackVideoLoad must be called before the Omniture SDK will track any
   * future events.
   * @private
   * @method OmnitureAnalyticsPlugin#onContentStart
   */
  var onContentStart = function()
  {
    vpPlugin.trackVideoLoad();
    vpPlugin.trackSessionStart();
  };

  /**
   * To be called when the main content has started playback. This can be called for the initial playback after
   * onContentStart and also after pause events. Will notify the Omniture SDK of a play event.
   * @private
   * @method OmnitureAnalyticsPlugin#trackPlay
   */
  var trackPlay = function()
  {
    if (!mainContentStarted)
    {
      mainContentStarted = true;
      vpPlugin.trackPlay();
    }
    else
    {
      vpPlugin.trackPlay();
    }
  };

  /**
   * To be called when the main content has paused. Do not call this before transitioning to an ad playback
   * from main content or else Omniture will report incorrect analytics. Will notify the Omniture SDK of a pause
   * event.
   * @private
   * @method OmnitureAnalyticsPlugin#trackPause
   */
  var trackPause = function()
  {
    vpPlugin.trackPause();
  };

  /**
   * To be called when the user has initiated a seek. Will notify the Omniture SDK of a seek start event. Must be
   * paired with a trackSeekEnd call.
   * @private
   * @method OmnitureAnalyticsPlugin#trackSeekStart
   */
  var trackSeekStart = function()
  {
    seekStarted = true;
    vpPlugin.trackSeekStart();
  };

  /**
   * To be called when the user has finished a seek. Will notify the Omniture SDK of a seek complete event. Must be
   * paired with a trackSeekStart call.
   * @private
   * @method OmnitureAnalyticsPlugin#trackSeekEnd
   */
  var trackSeekEnd = function()
  {
    seekStarted = false;
    vpPlugin.trackSeekComplete();
  };

  /**
   * To be called when the main content and postrolls have finished playing. Will notify the Omniture SDK of a complete
   * event and a video unload event.
   * @private
   * @method OmnitureAnalyticsPlugin#trackComplete
   */
  var trackComplete = function()
  {
    mainContentStarted = false;
    vpPlugin.trackComplete();
    vpPlugin.trackVideoUnload();
  };

  /**
   * To be called when an ad has started playback. Will notify the Omniture SDK of an ad start event.
   * @private
   * @method OmnitureAnalyticsPlugin#trackAdStart
   */
  var trackAdStart = function()
  {
    vpPlugin.trackAdStart();
  };

  /**
   * To be called when an ad has finished playback. Will notify the Omniture SDK of an ad complete event.
   * @private
   * @method OmnitureAnalyticsPlugin#trackAdEnd
   */
  var trackAdEnd = function()
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

/**
 * @class OoyalaPlayerDelegate
 * @classdesc The video player delegate that the Omniture Heartbeat SDK requires. Omniture will use
 * this delegate to find out information about the currently playing video periodically.
 */
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
  var inAdBreak = false;
  var inAdPlayback = false;

  /**
   * To be called when the content has been initialized. The player delegate will store the metadata passed
   * into this function for use when the Omniture SDK calls the getVideoInfo API.
   * @public
   * @method OoyalaPlayerDelegate#onInitializeContent
   * @param {object} metadata The metadata for the content.
   *                        It must contain the following fields:<br/>
   *   title {string} The title of the content<br />
   *   length {number} The length of the content
   */
  this.onInitializeContent = function(metadata)
  {
    name = metadata.title;
    length = Math.round(metadata.duration/1000);
  };

  /**
   * To be called when the embed code has changed. The player delegate will store the embed code
   * for use when the Omniture SDK calls the getVideoInfo API.
   * @public
   * @method OoyalaPlayerDelegate#onEmbedCodeChanged
   * @param {string} embedCode the embed code of the content
   */
  this.onEmbedCodeChanged = function(embedCode)
  {
    id = embedCode;
  };

  /**
   * To be called when the playhead has changed. The player delegate will store the current playhead
   * for use when the Omniture SDK calls the getVideoInfo API.
   * @public
   * @method OoyalaPlayerDelegate#onPlayheadChanged
   * @param {number} playhead The current playhead in seconds
   */
  this.onPlayheadChanged = function(playhead)
  {
    streamPlayhead = playhead;
  };

  /**
   * To be called when transitioning to an ad break.
   * @public
   * @method OoyalaPlayerDelegate#onAdBreak
   */
  this.onAdBreak = function()
  {
    adBreakPosition++;
    inAdBreak = true;
  };

  /**
   * To be called when transitioning away from an ad break.
   * @public
   * @method OoyalaPlayerDelegate#onAdBreakComplete
   */
  this.onAdBreakComplete = function()
  {
    inAdBreak = false;
  };

  /**
   * To be called when starting an ad playback. The player delegate will store the ad metadata for use
   * when the Omniture SDK calls the getAdInfo API.
   * @public
   * @method OoyalaPlayerDelegate#onAdPlayback
   * @param {object} metadata The metadata for the ad.
   *                        It must contain the following fields:<br/>
   *   adId {string} The id of the ad<br />
   *   adDuration {number} The length of the ad<br />
   *   adPodPosition {number} The ad pod position of the ad (ex: second ad in the pod would have ad pod position 2)
   */
  this.onAdPlayback = function(metadata)
  {
    adId = metadata.adId;
    adLength = metadata.adDuration;
    adPosition = metadata.adPodPosition;
    //TODO: Maybe add ad name (optional)
    adName = metadata.adId;
    inAdPlayback = true;
  };

  /**
   * To be called when completing an ad playback.
   * @public
   * @method OoyalaPlayerDelegate#onAdPlaybackComplete
   */
  this.onAdPlaybackComplete = function()
  {
    inAdPlayback = false;
  };

  /**
   * To be called when a replay has been requested. Resets any stored ad metadata and the content playhead.
   * @public
   * @method OoyalaPlayerDelegate#onReplay
   */
  this.onReplay = function()
  {
    streamPlayhead = 0;
    adId = null;
    adLength = -1;
    adPosition = 1;
    adName = null;
    adBreakPosition = 0;
    inAdBreak = false;
    inAdPlayback = false;
  };

  //Omniture required functions below

  /**
   * Required by Omniture. The Omniture SDK will call this function to retrieve various content metadata.
   * @public
   * @method OoyalaPlayerDelegate#getVideoInfo
   * @returns {ADB.va.plugins.videoplayer.VideoInfo}
   */
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

  /**
   * Required by Omniture. The Omniture SDK will call this function to retrieve various ad break metadata.
   * @public
   * @method OoyalaPlayerDelegate#getAdBreakInfo
   * @returns {ADB.va.plugins.videoplayer.AdBreakInfo}
   */
  this.getAdBreakInfo = function()
  {
    //We do not want to provide ad break info if we are not in an ad break.
    //The Heartbeat SDK uses the existence of this return value to determine if we are in an ad break.
    if (!inAdBreak)
    {
      return null;
    }
    var adBreakInfo = new ADB.va.plugins.videoplayer.AdBreakInfo();
    adBreakInfo.playerName = playerName;
    //TODO: Ad break position? How to ensure accuracy if an ad break is skipped via seeking
    adBreakInfo.position = adBreakPosition;
    adBreakInfo.startTime = streamPlayhead;
    return adBreakInfo;
  };

  /**
   * Required by Omniture. The Omniture SDK will call this function to retrieve various ad metadata.
   * @public
   * @method OoyalaPlayerDelegate#getAdInfo
   * @returns {ADB.va.plugins.videoplayer.AdInfo}
   */
  this.getAdInfo = function()
  {
    //We do not want to provide ad info if we are not in an ad.
    //The Heartbeat SDK uses the existence of this return value to determine if we are in an ad.
    if (!inAdPlayback)
    {
      return null;
    }
    var adInfo = new ADB.va.plugins.videoplayer.AdInfo();
    adInfo.id = adId;
    adInfo.length = adLength;
    adInfo.position = adPosition;
    //TODO: Maybe add ad name (optional)
    adInfo.name = adName;
    return adInfo;
  };

  /**
   * Required by Omniture. The Omniture SDK will call this function to retrieve various chapter metadata.
   * As the Ooyala Video PLayer currently does not enforce the concept of chapters, we will return null.
   * @public
   * @method OoyalaPlayerDelegate#getChapterInfo
   * @returns {null}
   */
  this.getChapterInfo = function()
  {
    //TODO: Chapter info if/when available
   return null;
  };

  /**
   * Required by Omniture. The Omniture SDK will call this function to retrieve various QoS metadata.
   * We will update this function when more hooks are introduced in the analytics framework.
   * @public
   * @method OoyalaPlayerDelegate#getQoSInfo
   * @returns {null}
   */
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
