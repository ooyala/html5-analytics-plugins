require("../framework/InitAnalyticsNamespace.js");

/**
 * @class NielsenAnalyticsPlugin
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
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

  var SDK_LOAD_TIMEOUT = 3000;

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
    //TODO: Missed events
    // var missedEvents;
    // //if you need to process missed events, here is an example
    // if (_framework && OO._.isFunction(_framework.getRecordedEvents))
    // {
    //  missedEvents = _framework.getRecordedEvents();
    //  _.each(missedEvents, _.bind(function (recordedEvent)
    //  {
    //    //recordedEvent.timeStamp;
    //    this.processEvent(recordedEvent.eventName, recordedEvent.params);
    //  }, this));
    // }

    //If SDK is not loaded by now, load SDK
    if (!window.NOLCMB)
    {
      OO.loadScriptOnce("http://secure-dcr.imrworldwide.com/novms/js/2/ggcmb500.js", trySetupNielsen, sdkLoadError, SDK_LOAD_TIMEOUT);
    }
  };

  var trySetupNielsen = function()
  {
    //TODO: Validate metadata
    if (nielsenMetadata && window.NOLCMB)
    {
      nSdkInstance = window.NOLCMB.getInstance(nielsenMetadata.apid);

      nSdkInstance.ggInitialize({
        apid: nielsenMetadata.apid,
        sfcode: nielsenMetadata.sfcode,
        apn: nielsenMetadata.apn
        // nol_sdkDebug: "console"
      });

      //TODO: Metadata from backlot/backdoor as well
      //See https://engineeringforum.nielsen.com/sdk/developers/bsdk-product-dcr-metadata.php
      _.extend(contentMetadata, {
        "type": "content",
        //TODO: Check to see if we can put asset name
        // "assetName": nielsenMetadata.title,
        // "length": Math.round(contentDuration / 1000),
        "title": nielsenMetadata.title,
        //TODO: Program Name
        "program": nielsenMetadata.program,
        // "assetid": embedCode,
        "segB": nielsenMetadata.segB,
        "segC": nielsenMetadata.segC,
        //TODO: is full ep
        "isfullepisode":nielsenMetadata.isfullepisode,
        "crossId1": nielsenMetadata.crossId1,
        "crossId2": nielsenMetadata.crossId2,
        "airdate": nielsenMetadata.airdate,
        //TODO: Ad load type
        "adloadtype":1

        //"type": "content",
        //"length": "3600",
        //"title": "myTitle",
        //"program": "myProgram",
        //"assetid": "myAssetId",
        //"segB": "segmentB",
        //"segC": "segmentC",
        //"isfullepisode": "Y",
        //"crossId1": "Reference11",
        //"crossId2": "Reference22",
        //"airdate": "20161013 20:00:00",
        //"adloadtype": "2"
      });

      handleStoredEvents();
    }
  };

  var handleStoredEvents = function()
  {
    var se;
    while (storedEvents.length > 0)
    {
      se = storedEvents.shift();
      notifyNielsen(se.event, se.param);
    }
  };

  var sdkLoadError = function()
  {

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

    nielsenMetadata = metadata;
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
      //case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
      //  break;
      //case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
      //  trackSessionStart();
      //  break;
      case OO.Analytics.EVENTS.CONTENT_COMPLETED:
        contentComplete = true;
        trackComplete();
        break;
      //case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED:
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        mainContentStarted = true;
        trackPlay();
        break;
      //case OO.Analytics.EVENTS.VIDEO_PAUSED:
      //  trackPause();
      //  break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        if (params && params[0] && params[0].embedCode)
        {
          // embedCode = params[0].embedCode;
          if (contentMetadata)
          {
            contentMetadata["assetid"] = embedCode;
          }
        }
        resetPlaybackState();
        break;
      //case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
      //  break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          var metadata = params[0];
          if (contentMetadata && metadata.duration)
          {
            contentMetadata["length"] = Math.round(metadata.duration / 1000);
            //only use Backlot metadata title if none was provided earlier
            if (!contentMetadata["title"])
            {
              contentMetadata["title"] = metadata.title;
            }

            //TODO: Asset name?
            contentMetadata["assetName"] = metadata.title;
          }
          OO.log("Nielsen Tracking: loadMetadata from metadata updated with playhead " + currentPlayhead);
          //TODO: Publish 3 event on replay?
          notifyNielsen(DCR_EVENT.INITIAL_LOAD_METADATA, contentMetadata);
        }
        break;
      //case OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED:
      //  trackSeekStart();
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
      //  trackSeekEnd();
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_STREAM_DOWNLOADING:
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED:
      //  trackBufferStart();
      //  break;
      //case OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED:
      //  trackBufferEnd();
      //  break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition)
        {
          var playhead = -1;
          if (inAdBreak)
          {
            if (adStarted)
            {
              currentAdPlayhead = params[0].streamPosition;
              playhead = currentAdPlayhead;
            }
          }
          else
          {
            currentPlayhead = params[0].streamPosition;
            playhead = currentPlayhead;
          }
          //Playhead updates should occur every 1 second according to docs at:
          //https://engineeringforum.nielsen.com/sdk/developers/product-dcr-implementation-av-bsdk.php;
          if (playhead >= 0 && playhead >= lastPlayheadUpdate + 1)
          {
            //TODO: receiving video_stream_position_changed immediately after ad_break_started
            lastPlayheadUpdate = playhead;
            trackPlayhead();
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        inAdBreak = true;
        //We want to report the first playhead after this event
        lastPlayheadUpdate = -1;
        OO.log("Nielsen Tracking: stop from ad break with playhead " + currentPlayhead);
        if (!contentComplete && mainContentStarted)
        {
          notifyNielsen(DCR_EVENT.STOP, currentPlayhead);
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        inAdBreak = false;
        //We want to report the first playhead after this event
        lastPlayheadUpdate = -1;
        loadContentMetadataAfterAd = true;
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        adStarted = true;
        trackAdStart(params[0]);
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        adStarted = false;
        trackAdEnd();
        currentAdPlayhead = 0;
        //We want to report the first playhead after this event
        lastPlayheadUpdate = -1;
        break;
      //case OO.Analytics.EVENTS.DESTROY:
      //  break;
      default:
        break;
    }
  };

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

  //Main Content
  //var trackSessionStart = function()
  //{
  //};

  var trackPlay = function()
  {
    if (loadContentMetadataAfterAd)
    {
      loadContentMetadataAfterAd = false;
      OO.log("Nielsen Tracking: loadMetadata from content play with playhead " + currentPlayhead);
      notifyNielsen(DCR_EVENT.LOAD_METADATA, contentMetadata);
    }
  };

  //var trackPause = function()
  //{
  //};
  //
  //var trackSeekStart = function()
  //{
  //};
  //
  //var trackSeekEnd = function()
  //{
  //};

  var trackComplete = function()
  {
    OO.log("Nielsen Tracking: end with playhead " + currentPlayhead);
    notifyNielsen(DCR_EVENT.END, currentPlayhead);
  };

  //var trackBufferStart = function()
  //{
  //};
  //
  //var trackBufferEnd = function()
  //{
  //};

  var trackPlayhead = function()
  {
    if (inAdBreak)
    {
      OO.log("Nielsen Tracking: setPlayheadPosition with ad playhead " + currentAdPlayhead);
      notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, currentAdPlayhead);
    }
    else
    {
      //TODO: Handle live streams
      OO.log("Nielsen Tracking: setPlayheadPosition with playhead " + currentPlayhead);
      notifyNielsen(DCR_EVENT.SET_PLAYHEAD_POSITION, currentPlayhead);
    }
  };

  //Ads
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
      //"adModel": "2",
      //"tv": "true",
      //"dataSrc": "cms"
    });
  };

  var trackAdEnd = function()
  {
    OO.log("Nielsen Tracking: stop with ad playhead " + currentAdPlayhead);
    notifyNielsen(DCR_EVENT.STOP, currentAdPlayhead);
  };
  
  var notifyNielsen = function(event, param)
  {
    OO.log("ggPM: " + event + " with param: " + param);
    if ((event === 3 || event === 15) && typeof param === "object" && param.type)
    {
      OO.log("ggPM: loadMetadata type: " + param.type);
    }

    if (nSdkInstance)
    {
      nSdkInstance.ggPM(event, param);
    }
    else
    {
      OO.log("Nielsen: Storing event: " + event);
      var storedParam = typeof param === "object" ? _.clone(param) : param;
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
