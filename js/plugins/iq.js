require("../framework/InitAnalyticsNamespace.js");
require("../../html5-common/js/utils/utils.js");

/**
 * @class IqPlugin
 * @classdesc Ooyala IQ analytics.js plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var IqPlugin= function (framework)
{
  var _framework = framework;
  var name = "iq";
  var version = "v1";
  var id;

  var SDK_LOAD_TIMEOUT = 3000;

  var autoPlay = false;
  var pcode = null;
  var playerId = null;
  var currentEmbedCode = null;
  var contentType = "ooyala";
  var currentPlayheadPosition = null;
  var playingInstreamAd = false;
  var iqEnabled = false;
  var lastEmbedCode = "";

  var adFirstQuartile = false;
  var adSecondQuartile = false;
  var adThirdQuartile = false;
  var adLastQuartile = false;
  
  this.ooyalaReporter = null;
  this.testMode = false;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method IqPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method IqPlugin#getVersion
   * @return {string} The version of the plugin.
   */
  this.getVersion = function ()
  {
    return version;
  };

  /**
   * Return the autoPlay value.
   * @public
   * @method IqPlugin@getAutoPlay
   * @return {boolean} The value of autoPlay.
   */
  this.getAutoPlay = function()
  {
    return autoPlay;
  };

  /**
   * Return the iqEnabled value.
   * @public
   * @method IqPlugin@getIqEnabled
   * @return {boolean} The value of iqEnabled.
   */
  this.getIqEnabled = function()
  {
    return iqEnabled;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method IqPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method IqPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method IqPlugin#init
   */
  this.init = function()
  {
    if (this.testMode)
    {
      trySetupAnalytics();
    }
    else if (!this.ooyalaReporter)
    {
      OO.loadScriptOnce("//analytics.ooyala.com/static/v3/analytics.js", trySetupAnalytics, sdkLoadError, SDK_LOAD_TIMEOUT);
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method IqPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    if (metadata && metadata.metadata){
      if (metadata.metadata.enabled != null){
        iqEnabled = metadata.metadata.enabled;
      }
    }
    OO.log( "Analytics Template: PluginID \'" + id + "\' received this metadata:", metadata);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method IqPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "IQ: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    // First check the events that do not actually report to analytics
    // Need to always check this event to see if we can enable analytics.js reporting. 
    //OO.EVENTS.METADATA_FETCHED -> OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED.
    if (eventName === OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED)
    {
      if (params && params[0]){
        modules = params[0].modules;
        if (modules)
        {
          this.setMetadata(modules.iq);
        }
      }
      return;
    }
    //OO.EVENTS.EMBED_CODE_CHANGED -> OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED.
    if (eventName === OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED){ 
      if (params && params[0] && params[0].metadata)
      {
        autoPlay = params[0].metadata.autoPlay;
        if (params[0].embedCode != currentEmbedCode) 
        {
          lastEmbedCode = currentEmbedCode;
        } 
        else 
        {
          lastEmbedCode = "";
        }
        currentEmbedCode = params[0].embedCode;
      }
      return;
    }

    if (!iqEnabled) return;

    // Any other event requires analytics to be loaded, return otherwise
    if (!this.ooyalaReporter){
      OO.log("Tried reporting event: " + eventName + " but ooyalaReporter is: " + this.ooyalaReporter);
      return;
    }

    switch(eventName)
    {
      //OO.EVENTS.CONTENT_TREE_FETCHED -> OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED.
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          duration = params[0].duration;
          this.ooyalaReporter.initializeMedia(currentEmbedCode, contentType);
          OO.log("IQ: Reported: initializeMedia() with args: " + currentEmbedCode + ", " + contentType);
          this.ooyalaReporter.setMediaDuration(duration);
          OO.log("IQ: Reported: setMediaDuration() with args: " + duration);
        }
        break;
      //OO.EVENTS.PLAYER_CREATED -> OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED
      case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
        if (params && params[0] && params[0].params)
        {
          eventParams = params[0];
          pcode = eventParams.params.pcode;
          playerId = eventParams.params.playerBrandingId;
          eventMetadata = params[0];
          eventMetadata.qosEventName = eventName;
          this.ooyalaReporter._base.pcode = pcode;
          this.ooyalaReporter.reportCustomEvent(eventName, eventMetadata);
          OO.log("IQ: Reported: reportCustomEvent() for event: " + eventName + " with args:" + JSON.stringify(eventMetadata));
          this.ooyalaReporter.reportPlayerLoad();
          OO.log("IQ: Reported: reportPlayerLoad()");
        }
        break;
      //OO.EVENTS.INITIAL_PLAY -> OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED.
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        OO.log("IQ: Reported: reportPlayRequested() with args: " + autoPlay);
        this.ooyalaReporter.reportPlayRequested(autoPlay);
        break;
      //OO.EVENTS.PLAYHEAD_TIME_CHANGED -> OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED.
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition > 0)
        {            
          currentPlayheadPosition = params[0].streamPosition;
          if (playingInstreamAd)
          {
            var totalTime = params[0].totalStreamDuration;
            var percentPlayed = 0;
            var reportQuartile = false;
            if (totalTime != null && totalTime > 0 )
            {
              if (currentPlayheadPosition >= 0.25 * totalTime && !adFirstQuartile){
                percentPlayed = 0.25;
                adFirstQuartile = true;
                reportQuartile = true;
              } 
              else if (currentPlayheadPosition >= 0.50 * totalTime && !adSecondQuartile)
              {
                percentPlayed = 0.50;
                adSecondQuartile = true;
                reportQuartile = true;
              } 
              else if (currentPlayheadPosition >= 0.75 * totalTime && !adThirdQuartile)
              {
                percentPlayed = 0.75;
                adThirdQuartile = true;
                reportQuartile = true;
              } 
              else if (currentPlayheadPosition >= 1.0 * totalTime && !adLastQuartile)
              {
                percentPlayed = 1.00;
                adLastQuartile = true;
                reportQuartile = true;
              }

              if (reportQuartile){
                OO.log("IQ: Reported: reportCustomEvent() for event: adPlaythrough with args:" + JSON.stringify(percentPlayed));
                this.ooyalaReporter.reportCustomEvent(eventName, {"adEventName": "adPlaythrough", "percent": percentPlayed });
              }
            }
          } 
          else 
          {
            var currentPlayheadPositionMilli = currentPlayheadPosition * 1000;
            this.ooyalaReporter.reportPlayHeadUpdate(currentPlayheadPositionMilli);
            OO.log("IQ: Reported: reportPlayHeadUpdate() with args: " + Math.floor(currentPlayheadPositionMilli));
          }
        }
        break;
      //OO.EVENTS.PAUSED -> OO.Analytics.EVENTS.VIDEO_PAUSED.
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        this.ooyalaReporter.reportPause();
        OO.log("IQ: Reported: reportPause()");
        break;
      // TODO: use for resume?
      //OO.EVENTS.PLAYING -> OO.Analytics.EVENTS.VIDEO_PLAYING.
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        this.ooyalaReporter.reportResume();
        OO.log("IQ: Reported: reportResume()");
        break;
      //OO.EVENTS.SEEKED -> OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED.
      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        if (params && params[0])
        {
          var seekedPlayheadPosition = params[0].timeSeekedTo;
          var seekedPlayheadPositionMilli = seekedPlayheadPosition * 1000;
          var currentPlayheadPositionMilli = currentPlayheadPosition * 1000;
          this.ooyalaReporter.reportSeek(currentPlayheadPositionMilli, seekedPlayheadPositionMilli);
          OO.log("IQ: Reported: reportSeek() with args: " + currentPlayheadPositionMilli + ", " + seekedPlayheadPositionMilli);
        }
        break;
      //OO.EVENTS.PLAYED -> OO.Analytics.EVENTS.PLAYBACK_COMPLETED.
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        this.ooyalaReporter.reportComplete();
        OO.log("IQ: Reported: reportComplete()");
        break;
      //OO.EVENTS.REPLAY -> OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED.
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        this.ooyalaReporter.reportReplay();
        OO.log("IQ: Reported: reportReplay()");
        break;
      case OO.EVENTS.WILL_PLAY_FROM_BEGINNING:
        if (lastEmbedCode != currentEmbedCode) 
        {
          this.ooyalaReporter.reportPlaybackStarted();
          lastEmbedCode = currentEmbedCode;
        }
        break;
      //OO.EVENTS.BUFFERING -> OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED.
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED: 
      case OO.Analytics.EVENTS.INITIAL_PLAY_STARTING:
      case OO.Analytics.EVENTS.PLAYBACK_READY:
      case OO.Analytics.EVENTS.API_ERROR:
      case OO.Analytics.EVENTS.BITRATE_INITIAL:
      case OO.Analytics.EVENTS.BITRATE_FIVE_SEC:
      case OO.Analytics.EVENTS.BITRATE_STABLE:
      case OO.Analytics.EVENTS.PLAYBACK_START_ERROR:
      case OO.Analytics.EVENTS.PLAYBACK_MIDSTREAM_ERROR:
      case OO.Analytics.EVENTS.PLUGIN_LOADED:
        if (params && params[0])
        {
          eventMetadata = params[0];
          eventMetadata.qosEventName = eventName;
          OO.log("IQ: Reported: reportCustomEvent() for event: " + eventName + " with args:" + JSON.stringify(eventMetadata));
          this.ooyalaReporter.reportCustomEvent(eventName, eventMetadata);
        }
        break;
      // OO.EVENTS.WILL_PLAY_ADS -> OO.Analytics.EVENTS.AD_BREAK_STARTED
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        playingInstreamAd = true;
        this.ooyalaReporter.reportCustomEvent(eventName, {adEventName: eventName});
        break;
      // OO.EVENTS.ADS_PLAYED -> OO.Analytics.EVENTS.AD_BREAK_ENDED
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        playingInstreamAd = false;
        this.ooyalaReporter.reportCustomEvent(eventName, {adEventName: eventName});
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        adFirstQuartile = false;
        adSecondQuartile = false;
        adThirdQuartile = false;
        adLastQuartile = false;
      case OO.Analytics.EVENTS.AD_REQUEST:
      case OO.Analytics.EVENTS.AD_REQUEST_SUCCESS:
      case OO.Analytics.EVENTS.AD_SDK_LOADED:
      case OO.Analytics.EVENTS.AD_SDK_LOAD_FAILURE:
      case OO.Analytics.EVENTS.AD_POD_STARTED:
      case OO.Analytics.EVENTS.AD_POD_ENDED:
      case OO.Analytics.EVENTS.AD_ENDED:
      case OO.Analytics.EVENTS.AD_SKIPPED:
      case OO.Analytics.EVENTS.AD_ERROR:
      case OO.Analytics.EVENTS.AD_REQUEST_EMPTY:
      case OO.Analytics.EVENTS.AD_REQUEST_ERROR:
      case OO.Analytics.EVENTS.AD_PLAYBACK_ERROR:
      case OO.Analytics.EVENTS.AD_IMPRESSION:
      case OO.Analytics.EVENTS.AD_SDK_IMPRESSION:
      case OO.Analytics.EVENTS.AD_COMPLETED:
      case OO.Analytics.EVENTS.AD_CLICKTHROUGH_OPENED:
      case OO.Analytics.EVENTS.AD_CLICKED:
      case OO.Analytics.EVENTS.SDK_AD_EVENT:
        if (!params || !params[0]) 
          params = [];

        var eventMetadata = params[0];
        if (!eventMetadata)
          eventMetadata = {};

        if(eventMetadata.adEventName)
        {
          eventMetadata.adEventName = eventName + ":" + eventMetadata.adEventName;
        }
        else
        {
          eventMetadata.adEventName = eventName;
        }
        this.ooyalaReporter.reportCustomEvent(eventName, eventMetadata);
        OO.log("IQ: Reported: reportCustomEvent() for event: " + eventName + " with args:" + JSON.stringify(eventMetadata));
        break;
      case OO.Analytics.EVENTS.REPORT_DISCOVERY_IMPRESSION: 
        if (params && params[0] && params[0].metadata)
        {
          try
          {
            eventMetadata = params[0].metadata;
            OO.log("IQ: Reported: reportAssetImpression() with args: " + JSON.stringify(params[0]));
            this.ooyalaReporter.reportAssetImpression(eventMetadata.asset, eventMetadata.customData, eventMetadata.uiTag, eventMetadata.contentSource, eventMetadata.pageSize, eventMetadata.assetPosition);
          } 
          catch(e) 
          {
            OO.log("IQ: Tried reporting event: " + eventName + " but received error: " + e);
          }
        }
        break;
      case OO.Analytics.EVENTS.REPORT_DISCOVERY_CLICK: 
        if (params && params[0] && params[0].metadata)
        {
          try
          {
            eventMetadata = params[0].metadata;
            OO.log("IQ: Reported: reportAssetClick() with args: " + JSON.stringify(params[0]));
            this.ooyalaReporter.reportAssetClick(eventMetadata.asset, eventMetadata.customData, eventMetadata.uiTag, eventMetadata.contentSource, eventMetadata.pageSize, eventMetadata.assetPosition);
          } 
          catch(e) 
          {
            OO.log("IQ: Tried reporting event: " + eventName + " but received error: " + e);
          }
        }
        break;
      default:
        break;
    }
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method IqPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
  };

  /**
   * Called when the SDK fails to load.
   * @private
   * @method NielsenAnalyticsPlugin#sdkLoadError
   */
  var sdkLoadError = function()
  {
    //Destroy and unregister
    if (_.isString(id))
    {
      framework.unregisterPlugin(id);
    }
    this.destroy();
  };

  var trySetupAnalytics = OO._.bind(function()
  {
    if (window.Ooyala)
    {
      this.ooyalaReporter = new Ooyala.Analytics.Reporter();

      var missedEvents;
      //if you need to process missed events, here is an example
      if (_framework && OO._.isFunction(_framework.getRecordedEvents))
      {
        missedEvents = _framework.getRecordedEvents();
        for (var i = 0; i < missedEvents.length; i++)
        {
          recordedEvent = missedEvents[i];
          this.processEvent(recordedEvent.eventName, recordedEvent.params);
        }
      }

      // TODO: setup
      var deviceInfo = {};
      var playerName = "Ooyala Player";
      var playerVersion = OO.VERSION.core.releaseVersion;  // TODO: need a mechanism in core to get this
      this.ooyalaReporter.setDeviceInfo();
      this.ooyalaReporter.setPlayerInfo(playerId, playerName, playerVersion);
    }
    else
    {
      OO.log("IQ Plugin: Analytics SDK not loaded");
    }
  }, this);
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(IqPlugin);

module.exports = IqPlugin;
