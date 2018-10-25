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
  var lastEmbedCode = "";
  var currentEmbedCode = null;
  var contentType = "ooyala";
  var playingInstreamAd = false;
  var iqEnabled = false;
  var allowThrift = false;
  var thriftPcode = null;
  var jsonPcode = null;

  var adFirstQuartile = false;
  var adSecondQuartile = false;
  var adThirdQuartile = false;
  var adLastQuartile = false;

  var currentPlayhead = 0;
  var lastReportedPlayhead = 0;
  var adOffset = 0;
  var adTimeline = [];

  var playingSsaiAd = false;
  var ssaiAdTransition = false;

  var geoMetadata = null;

  this.ooyalaReporter = null;
  this.videoStartSent = false;
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
   * Return the allowThrift value.
   * @public
   * @method IqPlugin@getAllowThrift
   * @return {boolean} The value of allowThrift.
   */
  this.getAllowThrift = function()
  {
    return allowThrift;
  };
  
  /**
   * Return the thriftPcode value.
   * @public
   * @method IqPlugin@thriftPcode
   * @return {boolean} The value of thriftPcode.
   */
  this.getThriftPcode = function()
  {
    return thriftPcode;
  };

  /**
   * Return the jsonPcode value.
   * @public
   * @method IqPlugin@jsonPcode
   * @return {boolean} The value of jsonPcode.
   */
  this.getJsonPcode = function()
  {
    return jsonPcode;
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
    if (metadata && metadata.metadata)
    {
      if (metadata.metadata.enabled != null)
      {
        iqEnabled = (metadata.metadata.enabled == true || metadata.metadata.enabled === "true");
      }
      // Are we possibly sending thrift events as well? If so we do not want to send
      // any duplicate events with analytics.js here, only new events not reported by
      // thrift in core with ooyala_analytics.js 
      if (metadata.metadata.allowThrift != null)
      {
        allowThrift = (metadata.metadata.allowThrift == true || metadata.metadata.allowThrift === "true");
      }
      if (metadata.metadata.thriftPcode != null) 
      {
        thriftPcode = metadata.metadata.thriftPcode;
      }
      if (metadata.metadata.jsonPcode != null) 
      {
        jsonPcode = metadata.metadata.jsonPcode; 
        pcode = jsonPcode;
      }
    }
    OO.log( "Analytics Template: PluginID \'" + id + "\' received this metadata:", metadata);
  };

 /**
   * Processes the timeline of ads received by the SSAI server metadata call.
   * Converts an array of ads to have an end time and offset, and cleans up unused values.
   * It is assumed that the timeline is ordered by ad start time
   * @private
   * @method IqPlugin#processAdTimeline
   * @param {array} timeline The raw array of ads returned by the SSAI server
   */
  this.processAdTimeline = function(timeline)
  {
    if (timeline === null || typeof(timeline) !== "array" )
    {
      return [];
    }
    var processedTimeline = [];
    var totalOffset = 0;
    for (var index = 0; index < timeline.length; index++) 
    {
      var durationMillis = Math.floor(timeline[index].duration * 1000);
      var startTimeMillis = Math.floor(timeline[index].start * 1000);
      totalOffset += durationMillis;
      var adData = { "adId":timeline[index].id,
                        "start":startTimeMillis,
                        "end":startTimeMillis + durationMillis,
                        "duration":durationMillis,
                        "offset":totalOffset };
      processedTimeline.push(adData);
    }
    return processedTimeline;
  };

  /**
    * Updates the ad offset for calculating the correct playhead for videos
    * with SSAI ads embedded after a seek has been performed.
    * @private
    * @method IqPlugin#updateAdOffset
    * @param {number} playhead The raw playhead returned by the video plugin (in seconds)
    */
  this.updateAdOffset = function(playhead) 
  {
    if (adTimeline !== null) 
    {
      adOffset = 0;
      for (var index = 0; index < adTimeline.length; index++) 
      {
        if (adTimeline[index].start <= playhead) 
        {
          adOffset += adTimeline[index].duration;
        }
      }
    }
  };

  /**
    * Checks the player is inside an SSAI ad block.
	* Checks the passed playhead against the ad timeline and returns true
	* if it is inside an SSAI ad block, false otherwise
    * @private
    * @method IqPlugin#isSSAIAdPlaying
    * @param {number} playhead the playhead time to check (in seconds)
    */
  this.isSSAIAdPlaying = function(playhead) 
  {
    for (var index = 0; index < adTimeline.length; index++) 
    {
      if (playhead >= adTimeline[index].start && playhead < adTimeline[index].end) 
      {
        return true;
      }
    }
    return false;
  };

  /**
    * Convenience function for reporting the custom ad playthrough percent event to IQ
    * @private
    * @method IqPlugin#reportAdPlaythrough
    * @param {number} playhead the playhead time to check (in seconds)
    * @param {number} duration the stream total duration (in seconds)
    */
  this.reportAdPlaythrough = function(eventName, playhead, duration)
  {
    var percentPlayed = 0;
    var reportQuartile = false;
    if (OO._.isFinite(playhead) && playhead >= 0 && OO._.isFinite(duration) && duration > 0) 
    {
      var playheadMillis = Math.floor(playhead * 1000);
      var durationMillis = Math.floor(duration * 1000);
      if (playheadMillis >= 0.25 * durationMillis && !adFirstQuartile) 
      {
        percentPlayed = 0.25;
        adFirstQuartile = true;
        reportQuartile = true;
      } 
      else if (playheadMillis >= 0.50 * durationMillis && !adSecondQuartile) 
      {
        percentPlayed = 0.50;
        adSecondQuartile = true;
        reportQuartile = true;
      } 
      else if (playheadMillis >= 0.75 * durationMillis && !adThirdQuartile) 
      {
        percentPlayed = 0.75;
        adThirdQuartile = true;
        reportQuartile = true;
      } 
      else if (playheadMillis >= 1.0 * durationMillis && !adLastQuartile) 
      {
        percentPlayed = 1.00;
        adLastQuartile = true;
        reportQuartile = true;
      }
      if (reportQuartile) 
      {
        OO.log("IQ: Reported: reportCustomEvent() for event: adPlaythrough with args:" + JSON.stringify(percentPlayed));
        this.ooyalaReporter.reportCustomEvent(eventName, {"adEventName": "adPlaythrough", "percent": percentPlayed });
      }
    }
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
    
    // This first switch is for non IQ reporting events that require changes to the internal plugin state
    switch(eventName) 
    {
      // First check the events that do not actually report to analytics
      // Need to always check this event to see if we can enable analytics.js reporting. 
      //OO.EVENTS.METADATA_FETCHED -> OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED.
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        if (params && params[0])
       	{
          var modules = params[0].modules;
          if (modules)
          {
            this.setMetadata(modules.iq);
          }
        }
        break; 
      //OO.EVENTS.EMBED_CODE_CHANGED -> OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED.
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        if (params && params[0] && params[0].metadata) {
          autoPlay = params[0].metadata.autoPlay;
          if (params[0].embedCode != currentEmbedCode) {
            lastEmbedCode = currentEmbedCode;
          } else {
            lastEmbedCode = "";
          }
          currentEmbedCode = params[0].embedCode;
        }
        break; 
      case OO.Analytics.EVENTS.SSAI_AD_TIMELINE_RECEIVED:
        if (params && params[0] && params[0].timeline) 
        {
          adTimeline = this.processAdTimeline(params[0].timeline);
        }
        this.updateAdOffset(currentPlayhead);
        break; 
      case OO.Analytics.EVENTS.SSAI_PLAY_SINGLE_AD:
        var foundAd = false;
        for (var index = 0; index < adTimeline.length; index++) 
        {
          if (adTimeline[index].adId === params[0].ad.adId) 
          {
            foundAd = true;
          }
        }
        if (!foundAd) 
        {
          var durationMillis = Math.floor(params[0].ad.duration * 1000);
          var adData =  { "adId": params[0].ad.adId,
                          "start":currentPlayhead,
                          "end":currentPlayhead + durationMillis,
                          "duration": durationMillis,
                          "offset":0 };
          adTimeline.push(adData);
        }
        playingSsaiAd = true;
        break;
      case OO.Analytics.EVENTS.SSAI_SINGLE_AD_PLAYED:
        playingSsaiAd = false;
        ssaiAdTransition = true;
        break;
    }

    //OO.EVENTS.AUTHORAZATION_FETCHED -> OO.Analytics.EVENTS.STREAM_TYPE_UPDATED
    if (eventName === OO.Analytics.EVENTS.STREAM_TYPE_UPDATED) {
      //we don't need the auth data but we do need the geo data and that is the second param
      if (params && params[1])
      {
        geoMetadata = params[1];
        //we have to change country and dma to countryCode and geoVendor because
        //analytics.js throws errors if there are incorrect params in the object.
        geoMetadata.countryCode = geoMetadata.country;
        delete geoMetadata.country;
        geoMetadata.geoVendor = geoMetadata.dma;
        delete geoMetadata.dma;
        this.ooyalaReporter.setUserInfo(null, null, null, geoMetadata);
      }
      return;
    }

    //OO.EVENTS.AUTHORAZATION_FETCHED -> OO.Analytics.EVENTS.STREAM_TYPE_UPDATED
    if (eventName === OO.Analytics.EVENTS.STREAM_TYPE_UPDATED) {
      //we don't need the auth data but we do need the geo data and that is the second param
      if (params && params[1])
      {
        geoMetadata = params[1];
        //we have to change country and dma to countryCode and geoVendor because
        //analytics.js throws errors if there are incorrect params in the object.
        geoMetadata.countryCode = geoMetadata.country;
        delete geoMetadata.country;
        geoMetadata.geoVendor = geoMetadata.dma;
        delete geoMetadata.dma;
        this.ooyalaReporter.setUserInfo(null, null, null, geoMetadata);
      }
      return;
    }

    if (!iqEnabled) return;

    // Any other event requires analytics to be loaded, return otherwise
    if (!this.ooyalaReporter) 
    {
      OO.log("Tried reporting event: " + eventName + " but ooyalaReporter is: " + this.ooyalaReporter);
      return;
    }

    // This switch is for IQ reporting events only
    switch(eventName) 
    {
      //OO.EVENTS.CONTENT_TREE_FETCHED -> OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED.
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED: 
        if (params && params[0])
        {
          ssaiAdTransition = false;
          playingSsaiAd = false;
          currentPlayhead = 0;
          lastReportedPlayhead = 0;
          adOffset = 0;
          adTimeline = [];
          var duration = params[0].duration;

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
          var eventParams = params[0];
          pcode = eventParams.params.pcode;
          if (jsonPcode != null) 
          {
            pcode = jsonPcode;
          }

          playerId = eventParams.params.playerBrandingId;
          eventMetadata = params[0];
          eventMetadata.qosEventName = eventName;
          this.ooyalaReporter._base.pcode = pcode;

          this.ooyalaReporter.reportCustomEvent(eventName, eventMetadata);
          OO.log("IQ: Reported: reportCustomEvent() for event: " + eventName + " with args:" + JSON.stringify(eventMetadata));
          if (!allowThrift || thriftPcode != null || jsonPcode != null) 
          {          
            this.ooyalaReporter.reportPlayerLoad();
            OO.log("IQ: Reported: reportPlayerLoad()");
          }
        }
        break;
      //OO.EVENTS.INITIAL_PLAY -> OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED.
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        if (!allowThrift || thriftPcode != null || jsonPcode != null) 
        {
          OO.log("IQ: Reported: reportPlayRequested() with args: " + autoPlay);
          this.ooyalaReporter.reportPlayRequested(autoPlay);
        }
        break;
      //OO.EVENTS.PLAYHEAD_TIME_CHANGED -> OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED.
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition > 0)
        {            
          if (playingInstreamAd || playingSsaiAd) 
          {
            if (playingInstreamAd) 
            {
              this.reportAdPlaythrough(eventName, params[0].streamPosition, params[0].totalStreamDuration);
            }
          } 
          else if (!allowThrift || thriftPcode != null || jsonPcode != null) 
          { 
            // When present, currentLiveTime should override currentTime for analytics purposes.
            var currentTime = params[0].streamPosition;                       
            if ( OO._.isFinite(params[0].currentLiveTime) && params[0].currentLiveTime > 0) 
            {
              currentTime = params[0].currentLiveTime;
              adOffset = 0;
            }

            var currentTimeMillis = Math.floor(currentTime * 1000);
            if (OO._.isFinite(currentTime) && currentTime > 0) 
            {
              if (ssaiAdTransition) 
              {
                if (this.isSSAIAdPlaying(currentTimeMillis)) 
                {
                  break;
                } 
                else 
                {
                  // Update the ad offset as soon as the ad break is done to ensure correct offest
                  // for playhead reporting
                  this.updateAdOffset(currentTimeMillis);
                  ssaiAdTransition = false;
                }
              }
              currentPlayhead = currentTimeMillis;
              var offsetPlayhead = currentPlayhead - adOffset;
              // Fix for PLAYER-3592. Never report a playhead smaller than the previous reported playhead unless a seek event happens
              if (offsetPlayhead >= 0 && offsetPlayhead > lastReportedPlayhead)
              {
                lastReportedPlayhead = offsetPlayhead;
                this.ooyalaReporter.reportPlayHeadUpdate(offsetPlayhead);
                OO.log("IQ: Reported: reportPlayHeadUpdate() with args: " + offsetPlayhead);
              }
            }
          }
        }
        break;
      //OO.EVENTS.PAUSED -> OO.Analytics.EVENTS.VIDEO_PAUSED.
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        this.ooyalaReporter.reportPause();
        OO.log("IQ: Reported: reportPause()");
        break;
      //OO.EVENTS.PLAYING -> OO.Analytics.EVENTS.VIDEO_PLAYING.
      case OO.Analytics.EVENTS.VIDEO_PLAYING: 
        if (!allowThrift || thriftPcode != null || jsonPcode != null) 
        {
          if (!this.videoStartSent) 
          {
            if (lastEmbedCode != currentEmbedCode) 
            {
              this.ooyalaReporter.reportPlaybackStarted();
              OO.log("IQ: Reported: reportPlaybackStarted()");
            } 
            else 
            {
              this.ooyalaReporter.reportReplay();
              OO.log("IQ: Reported: reportReplay()");
            }
            lastEmbedCode = currentEmbedCode;
            this.videoStartSent = true;
          } 
          else 
          {
            this.ooyalaReporter.reportResume();
            OO.log("IQ: Reported: reportResume()");
          }
        } 
        break;
      //OO.EVENTS.SEEKED -> OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED.
      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED: 
        lastReportedPlayhead = 0; 
        if (params && params[0]) 
        {
          var newPlayhead = Math.floor(params[0].timeSeekedTo * 1000);
          playingSsaiAd = this.isSSAIAdPlaying(newPlayhead);
          this.updateAdOffset(newPlayhead);
          this.ooyalaReporter.reportSeek(currentPlayhead, newPlayhead);
          OO.log("IQ: Reported: reportSeek() with args: " + currentPlayhead + ", " + newPlayhead);
          currentPlayhead = newPlayhead;
        }
        break;
      //OO.EVENTS.PLAYED -> OO.Analytics.EVENTS.PLAYBACK_COMPLETED.
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        this.ooyalaReporter.reportComplete();
        OO.log("IQ: Reported: reportComplete()");
        break;
      //OO.EVENTS.REPLAY -> OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED.
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        lastReportedPlayhead = 0;
        // SSAI: Check for preroll and update ad offset if present
        playingSsaiAd = this.isSSAIAdPlaying(0);
        this.updateAdOffset(0);
        break;
      case OO.EVENTS.WILL_PLAY_FROM_BEGINNING:
        this.videoStartSent = false;
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
        {
          params = [];
        }

        var eventMetadata = params[0];
        if (!eventMetadata) 
        {
          eventMetadata = {};
        }

        if (eventMetadata.adEventName) 
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
        if ((!allowThrift || thriftPcode != null || jsonPcode != null) && 
        	params && params[0] && params[0].metadata) 
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
        if ((!allowThrift || thriftPcode != null || jsonPcode != null) && 
        	params && params[0] && params[0].metadata) 
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
    if (OO._.isString(id))
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
      var doNotTrack = false;
      switch (OO.trackingLevel) {
        case OO.TRACKING_LEVEL.DISABLED:
        case OO.TRACKING_LEVEL.ANONYMOUS:
          doNotTrack = true;
          break;
        case OO.TRACKING_LEVEL.DEFAULT:
        default:
          break;
      }
      this.ooyalaReporter.setDeviceInfo(null, null, null, doNotTrack);
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
  