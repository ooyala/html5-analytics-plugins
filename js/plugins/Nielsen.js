require("../framework/InitAnalyticsNamespace.js");
require("../../html5-common/js/utils/utils.js");

/**
 * @class NielsenAnalyticsPlugin
 * @classdesc Nielsen SDK plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var NielsenAnalyticsPlugin = function (framework)
{
  var _framework = framework;
  var name = "Nielsen";
  var version = "v1";
  var id;
  var _active = true;

  var contentDuration = -1;
  var currentPlayhead = 0;
  var currentAdPlayhead = 0;
  var mainContentStarted = false;
  var inAdBreak = false;
  var adStarted = false;
  var embedCode = null;
  var lastPlayheadUpdate = -1;
  var contentMetadata = {};
  var contentComplete = false;
  var loadContentMetadataAfterAd = false;
  //TODO: ID3 tags

  var nSdkInstance = null;
  var nielsenMetadata = null;

  var storedEvents = [];

  var DCR_EVENT = {
    INITIAL_LOAD_METADATA: 3, //to be used for content before prerolls
    STOP: 7,
    LOAD_METADATA: 15,
    SET_PLAYHEAD_POSITION: 49,
    END: 57
  };

  var PLAYHEAD_UPDATE_INTERVAL = 1000; //milliseconds
  var SDK_LOAD_TIMEOUT = 3000;
  
  this.testMode = false;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method NielsenAnalyticsPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method NielsenAnalyticsPlugin#getVersion
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
   * @method NielsenAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method NielsenAnalyticsPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method NielsenAnalyticsPlugin#init
   */
  this.init = function()
  {
    //TODO: Test Missed events
    var missedEvents;
    if (_framework && _.isFunction(_framework.getRecordedEvents))
    {
     missedEvents = _framework.getRecordedEvents();
     _.each(missedEvents, _.bind(function (recordedEvent)
     {
       //recordedEvent.timeStamp;
       this.processEvent(recordedEvent.eventName, recordedEvent.params);
     }, this));
    }

    //If SDK is not loaded by now, load SDK
    if (!window.NOLCMB)
    {
      OO.loadScriptOnce("http://cdn-gl.imrworldwide.com/novms/js/2/ggcmb510.js", trySetupNielsen, sdkLoadError, SDK_LOAD_TIMEOUT);
    }
  };

  /**
   * Tries to setup the Nielsen SDK Instance object. The Nielsen SDK Instance object requires specific metadata and
   * window.NOLCMB to exist (created by the Nielsen SDK script).
   * @private
   * @method NielsenAnalyticsPlugin#trySetupNielsen
   * @returns {boolean} Whether or not the setup was a success
   */
  var trySetupNielsen = function()
  {
    var setup = false;

    if (nielsenMetadata && window.NOLCMB)
    {
      nSdkInstance = window.NOLCMB.getInstance(nielsenMetadata.apid);

      //nsdkv of 511 should be provided to the SDK as per Nielsen's suggestion.
      //We open the possibility to change this via page level parameters
      var nsdkv = nielsenMetadata.nsdkv ? nielsenMetadata.nsdkv : "511";

      var initMetadata = {
        apid: nielsenMetadata.apid,
        sfcode: nielsenMetadata.sfcode,
        apn: nielsenMetadata.apn,
        nsdkv: nsdkv
        // nol_sdkDebug: "DEBUG"
      };

      if (nielsenMetadata.nol_sdkDebug)
      {
        initMetadata.nol_sdkDebug = nielsenMetadata.nol_sdkDebug;
      }

      nSdkInstance.ggInitialize(initMetadata);

      handleStoredEvents();
      setup = true;
    }
    return setup;
  };

  /**
   * Handles any events that were stored due to a delayed SDK initialization.
   * @private
   * @method NielsenAnalyticsPlugin#handleStoredEvents
   */
  var handleStoredEvents = function()
  {
    var se;
    while (storedEvents.length > 0)
    {
      se = storedEvents.shift();
      notifyNielsen(se.event, se.param);
    }
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

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method NielsenAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    OO.log( "Nielsen: PluginID \'" + id + "\' received this metadata:", metadata);
    //TODO: Validate metadata
    if (metadata)
    {
      nielsenMetadata = metadata;

      //TODO: Metadata from backlot/backdoor as well
      //See https://engineeringforum.nielsen.com/sdk/developers/bsdk-product-dcr-metadata.php
      _.extend(contentMetadata, {
        "type": "content",
        "title": nielsenMetadata.title,
        "program": nielsenMetadata.program,
        "isfullepisode":nielsenMetadata.isfullepisode,
        //Setting adloadtype to 2 per Nielsen's suggestion
        "adloadtype":2
      });

      //Optional Nielsen parameters
      if (nielsenMetadata.segB)
      {
        contentMetadata["segB"] = nielsenMetadata.segB;
      }

      if (nielsenMetadata.segC)
      {
        contentMetadata["segC"] = nielsenMetadata.segC;
      }

      if (nielsenMetadata.crossId1)
      {
        contentMetadata["crossId1"] = nielsenMetadata.crossId1;
      }

      if (nielsenMetadata.crossId2)
      {
        contentMetadata["crossId2"] = nielsenMetadata.crossId2;
      }

      if (nielsenMetadata.airdate)
      {
        contentMetadata["airdate"] = nielsenMetadata.airdate;
      }
    }

    trySetupNielsen();
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method NielsenAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "Nielsen: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    switch(eventName)
    {
      case OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED:
        contentComplete = true;
        trackComplete();
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        mainContentStarted = true;
        trackPlay();
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        //TODO: Unit test and dev test
        notifyNielsen(DCR_EVENT.INITIAL_LOAD_METADATA, contentMetadata);
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        if (params && params[0] && params[0].embedCode)
        {
          if (contentMetadata)
          {
            contentMetadata["assetid"] = params[0].embedCode;
          }
        }
        resetPlaybackState();
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          var metadata = params[0];
          if (metadata && contentMetadata && metadata.duration)
          {
            contentMetadata["length"] = Math.round(metadata.duration / 1000);
            //only use Backlot metadata title if none was provided earlier
            contentMetadata["title"] = metadata.title;
            contentMetadata["assetName"] = metadata.title;
          }
          OO.log("Nielsen Tracking: initial loadMetadata from metadata updated with playhead " + currentPlayhead);
          //TODO: Dev test
          notifyNielsen(DCR_EVENT.INITIAL_LOAD_METADATA, contentMetadata);
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        //TODO: Update content metadata
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition)
        {
          var playhead = -1;
          var log = false;
          if (inAdBreak)
          {
            if (adStarted && params[0].videoId === OO.VIDEO.ADS)
            {
              currentAdPlayhead = params[0].streamPosition;
              playhead = currentAdPlayhead;
              OO.log("Nielsen Tracking: ad playhead: " + playhead);
              log = true;
            }
          }
          else
          {
            currentPlayhead = params[0].streamPosition;
            playhead = currentPlayhead;
          }
          //Playhead updates should occur every 1 second according to docs at:
          //https://engineeringforum.nielsen.com/sdk/developers/product-dcr-implementation-av-bsdk.php;
          var currentTime = new Date().getTime();
          var sufficientDelay = currentTime >= lastPlayheadUpdate + PLAYHEAD_UPDATE_INTERVAL || this.testMode;
          if (playhead >= 0 && sufficientDelay)
          {
            //TODO: receiving video_stream_position_changed immediately after ad_break_started
            lastPlayheadUpdate = currentTime;
            trackPlayhead();
          }

          if(log)
          {
            OO.log("Nielsen Tracking: lastPlayheadUpdate: " + lastPlayheadUpdate);
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        inAdBreak = true;
        //We want to report the first playhead after this event
        lastPlayheadUpdate = -1;
        if (!contentComplete && mainContentStarted)
        {
          trackAdBreakStart();
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        inAdBreak = false;
        //We want to report the first playhead after this event
        lastPlayheadUpdate = -1;
        loadContentMetadataAfterAd = true;
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        if (params && params[0])
        {
          if (params[0].adType === OO.Analytics.AD_TYPE.LINEAR_VIDEO)
          {
            adStarted = true;
            trackAdStart(params[0].adMetadata);
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        if (params && params[0])
        {
          if (params[0].adType === OO.Analytics.AD_TYPE.LINEAR_VIDEO)
          {
            adStarted = false;
            trackAdEnd();
            currentAdPlayhead = 0;
            //We want to report the first playhead after this event
            lastPlayheadUpdate = -1;
          }
        }
        break;
      default:
        break;
    }
  };

  /**
   * Resets any state variables back to their initial values.
   * @private
   * @method NielsenAnalyticsPlugin#resetPlaybackState
   */
  var resetPlaybackState = function ()
  {
    contentDuration = -1;
    currentPlayhead = 0;
    currentAdPlayhead = 0;
    mainContentStarted = false;
    inAdBreak = false;
    adStarted = false;
    lastPlayheadUpdate = -1;
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method NielsenAnalyticsPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
    resetPlaybackState();
  };

  /**
   * To be called when the main content has started playback. This will be called when the content initially starts
   * or when transitioning back to main content from an ad. Will notify the Nielsen SDK of a load metadata event
   * (event 15).
   * @private
   * @method NielsenAnalyticsPlugin#trackPlay
   */
  var trackPlay = function()
  {
    if (loadContentMetadataAfterAd)
    {
      loadContentMetadataAfterAd = false;
      OO.log("Nielsen Tracking: loadMetadata from content play with playhead " + currentPlayhead);
      notifyNielsen(DCR_EVENT.LOAD_METADATA, contentMetadata);
    }
  };

  /**
   * To be called when the main content has finished playback. This must be called before any postrolls start. Will
   * notify the Nielsen SDK of a end event (event 57).
   * @private
   * @method NielsenAnalyticsPlugin#trackComplete
   */
  var trackComplete = function()
  {
    var reportedPlayhead = Math.floor(currentPlayhead);
    OO.log("Nielsen Tracking: end with playhead " + reportedPlayhead);
    //Report a final SET_PLAYHEAD_POSITION so the SDK reports the final second (it may miss
    //the final second due to the 1 second intervals between reporting playheads)
    notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, reportedPlayhead);
    notifyNielsen(DCR_EVENT.END, reportedPlayhead);
  };

  /**
   * To be called when there is a content playhead update. Will notify the Nielsen SDK of a "set playhead position" event
   * (event 49).
   * @private
   * @method NielsenAnalyticsPlugin#trackPlayhead
   */
  var trackPlayhead = function()
  {
    //TODO: Add more checks to ensure we report the correct playhead
    if (inAdBreak)
    {
      var reportedAdPlayhead = Math.floor(currentAdPlayhead);
      OO.log("Nielsen Tracking: setPlayheadPosition with ad playhead " + reportedAdPlayhead);
      notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, reportedAdPlayhead);
    }
    else
    {
      //TODO: Handle live streams
      var reportedPlayhead = Math.floor(currentPlayhead);
      OO.log("Nielsen Tracking: setPlayheadPosition with playhead " + reportedPlayhead);
      notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, reportedPlayhead);
    }
  };

  /**
   * To be called when an ad break has started. Will notify the Nielsen SDK of a stop event (event 7).
   * @private
   * @method NielsenAnalyticsPlugin#trackAdBreakStart
   */
  var trackAdBreakStart = function()
  {
    var reportedPlayhead = Math.floor(currentPlayhead);
    OO.log("Nielsen Tracking: stop from ad break with playhead " + reportedPlayhead);
    //Report a final SET_PLAYHEAD_POSITION so the SDK reports the final second (it may miss
    //the final second due to the 1 second intervals between reporting playheads)
    notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, reportedPlayhead);
    notifyNielsen(DCR_EVENT.STOP, reportedPlayhead);
  };

  /**
   * To be called when an ad playback has started. Will notify the Nielsen SDK of a load metadata event (event 15).
   * The event type will be one of preroll, midroll, or postroll, depending on the current playhead and if the
   * content has finished.
   * @private
   * @method NielsenAnalyticsPlugin#trackAdStart
   * @param {object} metadata The metadata for the ad.
   *                        It must contain the following fields:<br/>
   *   adDuration {number} The length of the ad<br />
   *   adId {string} The id of the ad<br />
   */
  var trackAdStart = function(metadata)
  {
    var type = null;
    if (currentPlayhead <= 0)
    {
      type = "preroll";
    }
    else if (contentComplete)
    {
      type = "postroll";
    }
    else
    {
      type = "midroll";
    }

    OO.log("Nielsen Tracking: loadMetadata for ad with type: " + type + " with ad playhead " + currentAdPlayhead);
    notifyNielsen(DCR_EVENT.LOAD_METADATA, {
      "type": type,
      "length": metadata.adDuration,
      "assetid": metadata.adId
    });
  };

  /**
   * To be called when an ad playback has finished. Will notify the Nielsen SDK of a stop event (event 3).
   * @private
   * @method NielsenAnalyticsPlugin#trackAdEnd
   */
  var trackAdEnd = function()
  {
    var reportedAdPlayhead = Math.floor(currentAdPlayhead);
    OO.log("Nielsen Tracking: stop with ad playhead " + reportedAdPlayhead);
    //Report a final SET_PLAYHEAD_POSITION so the SDK reports the final second (it may miss
    //the final second due to the 1 second intervals between reporting playheads)
    notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, reportedAdPlayhead);
    notifyNielsen(DCR_EVENT.STOP, reportedAdPlayhead);
  };

  /**
   * Notifies the Nielsen SDK of an event. If the SDK instance is not ready, will store the event and its
   * parameters. These stored events will be handled when the SDK instance is ready.
   * @private
   * @method NielsenAnalyticsPlugin#notifyNielsen
   * @param {number} event The event to notify the SDK about. See
   *                       https://engineeringforum.nielsen.com/sdk/developers/bsdk-nielsen-browser-sdk-apis.php
   * @param {object|number} param The param associated with the reported event
   */
  var notifyNielsen = function(event, param)
  {
    if (nSdkInstance)
    {
      OO.log("ggPM: " + event + " with param: " + param);
      if ((event === 3 || event === 15) && _.isObject(param) && param.type)
      {
        OO.log("ggPM: loadMetadata type: " + param.type);
      }
      nSdkInstance.ggPM(event, param);
    }
    else
    {
      OO.log("ggPM: Storing event: " + event + " with param: " + param);
      var storedParam = _.isObject(param) ? _.clone(param) : param;
      storedEvents.push({
        event: event,
        param: storedParam
      });
    }
  };
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(NielsenAnalyticsPlugin);

module.exports = NielsenAnalyticsPlugin;
