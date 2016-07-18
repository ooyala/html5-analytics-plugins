require("../framework/InitAnalyticsNamespace.js");
require("../../html5-common/js/utils/utils.js");

/**
 * @class ConvivaAnalyticsPlugin
 * @classdesc Conviva SDK plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var ConvivaAnalyticsPlugin = function (framework)
{
  var _framework = framework;
  var name = "conviva";
  var version = "v1";
  var id;
  var _active = true;

  var storedEvents = [];

  var currentConvivaSessionKey = null;
  var streamType = null;
  var embedCode = null;
  var videoContentMetadata = null;
  var convivaMetadata = null;
  var systemFactory = null;
  var convivaClient = null;
  var playerStateManager = null;

  var currentPlayhead = -1;
  var inAdBreak = false;
  var contentComplete = false;

  var OOYALA_TOUCHSTONE_SERVICE_URL = "https://ooyala-test.testonly.conviva.com";
  // Mainly used for reference
  var CURRENT_CONVIVA_JS_SDK_VERSION = "Conviva_SDK_JavaScript_2.91.0.24548";

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#getVersion
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
   * @method ConvivaAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method ConvivaAnalyticsPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method ConvivaAnalyticsPlugin#init
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
   *
   */
  var trySetupConviva = function()
  {
    if (convivaMetadata && sdkLoaded()){
      if (!systemFactory)
      {
        var systemInterface = new Conviva.SystemInterface(
          new Html5Time(),
          new Html5Timer(),
          new Html5Http(),
          new Html5Storage(),
          new Html5Metadata(),
          new Html5Logging()
        );

        var systemSettings = getSystemSettings();
        systemFactory = new Conviva.SystemFactory(systemInterface, systemSettings);
      }

      var clientSettings = getClientSettings();
      convivaClient = new Conviva.Client(clientSettings, systemFactory);

      tryBuildConvivaContentMetadata();
    }
  };

  // Provides SystemSettings to configure Conviva SystemFactory in production mode.
  /**
   *
   * @returns {*}
   */
  var getSystemSettings = function()
  {
    var systemSettings = new Conviva.SystemSettings();
    // systemSettings.logLevel = Conviva.SystemSettings.LogLevel.ERROR; // default
    // systemSettings.allowUncaughtExceptions = false; // default
    systemSettings.logLevel = Conviva.SystemSettings.LogLevel.DEBUG;
    return systemSettings;
  };

  // Provides ClientSettings to configure Conviva Client in production mode.
  /**
   *
   * @returns {*}
   */
  var getClientSettings = function()
  {
    var clientSettings = new Conviva.ClientSettings(convivaMetadata.customerKey);
    // clientSettings.heartbeatInterval = 20; // default
    // clientSettings.gatewayUrl = credentials.gatewayUrl; // default
    clientSettings.gatewayUrl = convivaMetadata.gatewayUrl;
    return clientSettings;
  };

  /**
   *
   */
  var clearLastSession = function()
  {
    if (validSession())
    {
      convivaClient.detachPlayer(currentConvivaSessionKey);
    }

    if (playerStateManager)
    {
      convivaClient.releasePlayerStateManager(playerStateManager);
    }
  };

  // Gathers all relevant application information for a particular video playback
  // inside a Conviva ContentMetadata object.
  /**
   *
   */
  var tryBuildConvivaContentMetadata = function ()
  {
    if (videoContentMetadata && embedCode && convivaClient)
    {
      // Detach previous session if necessary
      clearLastSession();

      playerStateManager = convivaClient.getPlayerStateManager();
      var contentMetadata = new Conviva.ContentMetadata();

      // Recommended format for the assetName, using both the ID of the video content and its title
      contentMetadata.assetName = "[" + embedCode + "] " + videoContentMetadata.title;

      // The stream url for this video content.
      // For manifest-based streaming protocols, it should point to the top-level manifest.
      // contentMetadata.streamUrl = videoData.url;

      // The type of stream for this content. Usually either live or VOD.
      // Sometimes the application may not know right away, in which case you have the option to set it to Unknown
      // and possibly fill the gap later on.
      contentMetadata.streamType = streamType === OO.Analytics.STREAM_TYPE.LIVE_STREAM ? Conviva.ContentMetadata.StreamType.LIVE : Conviva.ContentMetadata.StreamType.VOD;

      // Duration of this particular video stream.
      // If this information is available to your application from your Content Management System,
      // you can supply it here.
      // Otherwise, the PlayerInterface will have to extract it from the video player.
      contentMetadata.duration = Math.round(videoContentMetadata.duration/1000); // in seconds

      // Frame rate this particular video stream was encoded at.
      // If this information is available to your application from your Content Management System,
      // you can supply it here.
      // Otherwise, the PlayerInterface will have to extract it from the video player.
      // contentMetadata.encodedFrameRate = videoData.metadata.frameRate;

      // Here we are playing progressive download content with a static bitrate,
      // and the HTML5 video element does not expose bitrate information.
      // We set the default bitrate to report for this content based on metadata
      // since the PlayerInterface cannot retrieve it from the HTML5 video player.
      // contentMetadata.defaultBitrateKbps = Math.floor(videoData.metadata.bitrateBps / 1000); // in Kbps

      // The Conviva Platform will be setup to parse the stream urls for your video assets
      // and infer the resource it is served from (CDN-level, possibly bucket-level/server-level).
      // In cases where the video application does not have access to a meaningful stream url
      // (local video proxy / some DRM wrappers), the Conviva Platform can be configured to
      // infer the resource from the defaultResource field instead.
      // contentMetadata.defaultResource = "LEVEL3";

      // A human-readable identifier for your application.
      // Very helpful to filter traffic and compare performance for different builds of
      // the video application.
      // contentMetadata.applicationName = "JS SDK Sample Application 1.2.3";

      // An identifier for the current user. Can be obfuscated to ensure privacy.
      // Can be used to isolate video traffic for a particular and help with
      // video quality assessements/troubleshooting for that particular user.
      // contentMetadata.viewerId = userData.id;

      // Custom metadata, usually defined in a metadata spreadsheet.
      // Based on the type of video application and the expectations in terms of
      // Conviva metrics and filtering capabilities.
      // contentMetadata.custom = {
      //   userSubscriptionType: userData.subscriptionType,
      //   userAccountType: userData.accountType,
      //   genres: videoData.metadata.genres.join(','), // string
      // };
      currentConvivaSessionKey = convivaClient.createSession(contentMetadata);
      convivaClient.attachPlayer(currentConvivaSessionKey, playerStateManager);
      trackStop();
    }
  };

  /**
   *
   * @returns {boolean}
   */
  var sdkLoaded = function()
  {
    return !!window.Conviva;
  };

  var validateConvivaMetadata = function(metadata)
  {
    var valid = true;
    var requiredKeys = ["gatewayUrl", "customerKey"];

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
      OO.log("Error: Missing Conviva Metadata!");
      missingKeys = requiredKeys;
      valid = false;
    }


    if(!_.isEmpty(missingKeys))
    {
      _.each(missingKeys, function(key)
      {
        OO.log("Error: Missing Conviva Metadata Key: " + key);
      });
    }

    return valid;
  };

  /**
   * Handles any events that were stored due to a delayed SDK initialization.
   * @private
   * @method ConvivaAnalyticsPlugin#handleStoredEvents
   */
  var handleStoredEvents = function()
  {
  };

  /**
   * Called when the SDK fails to load.
   * @private
   * @method ConvivaAnalyticsPlugin#sdkLoadError
   */
  var sdkLoadError = function()
  {
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    if (validateConvivaMetadata(metadata)) {
      convivaMetadata = metadata;
      trySetupConviva();
    }
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method ConvivaAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "Conviva: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    switch(eventName)
    {
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        if (params && params[0])
        {
          streamType = params[0].streamType;
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_ELEMENT_CREATED:
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
        break;
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED:
        contentComplete = true;
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        trackStop();
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        trackPlay();
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        trackPause();
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED:
        trackPause();
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        tryBuildConvivaContentMetadata();
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        resetPlaybackState();
        if (params && params[0] && params[0].embedCode)
        {
          embedCode = params[0].embedCode;
          tryBuildConvivaContentMetadata();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          videoContentMetadata = params[0];
          tryBuildConvivaContentMetadata();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition)
        {
          if (!inAdBreak)
          {
            currentPlayhead = params[0].streamPosition;
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        inAdBreak = true;
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        inAdBreak = false;
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        trackAdStart();
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        trackAdEnd();
        break;
      case OO.Analytics.EVENTS.STREAM_TYPE_UPDATED:
        var streamType = params[0].streamType;
        break;
      default:
        break;
    }
  };

  /**
   * Resets any state variables back to their initial values.
   * @private
   * @method ConvivaAnalyticsPlugin#resetPlaybackState
   */
  var resetPlaybackState = function ()
  {
    // currentConvivaSessionKey = null;
    // streamType = null;
    // embedCode = null;
    // videoContentMetadata = null;
    // convivaMetadata = null;
    // convivaClient = null;
    // playerStateManager = null;
    currentPlayhead = -1;
    inAdBreak = false;
    contentComplete = false;
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method ConvivaAnalyticsPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
    clearLastSession();
    if (convivaClient)
    {
      convivaClient.release();
      convivaClient = null;
    }

    if (systemFactory)
    {
      systemFactory.release();
      systemFactory = null;
    }
    resetPlaybackState();
  };

  var validSession = function()
  {
    return currentConvivaSessionKey !== Conviva.Client.NO_SESSION_KEY && currentConvivaSessionKey !== null;
  };

  /**
   *
   */
  var canTrack = function()
  {
    return playerStateManager && convivaClient && validSession();
  };

  /**
   *
   * @param state
   */
  var updatePlayerState = function(state)
  {
    if (canTrack())
    {
      playerStateManager.setPlayerState(state);
    }
    else
    {
      OO.log("Conviva Plugin Error: trying to set player state when unable to with state " + state);
    }
  };

  /**
   * To be called when the main content has started playback.
   * @private
   * @method ConvivaAnalyticsPlugin#trackPlay
   */
  var trackPlay = function()
  {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.PLAYING);
  };

  /**
   *
   */
  var trackPause = function()
  {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.PAUSED);
  };

  /**
   *
   */
  var trackStop = function()
  {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.STOPPED);
  };

  /**
   *
   */
  var trackAdStart = function()
  {
    if (canTrack())
    {
      var adPosition = null;
      if (currentPlayhead <= 0)
      {
        OO.log("[Conviva-Ooyala] Playing preroll");
        adPosition = Conviva.Client.AdPosition.PREROLL;
      }
      else if (contentComplete)
      {
        OO.log("[Conviva-Ooyala] Playing postroll");
        adPosition = Conviva.Client.AdPosition.POSTROLL;
      }
      else
      {
        OO.log("[Conviva-Ooyala] Playing midroll");
        adPosition = Conviva.Client.AdPosition.MIDROLL;
      }

      //TODO: If SSAI, use CONTENT instead of SEPARATE for adStream
      var adStream = Conviva.Client.AdStream.SEPARATE;
      //TODO: Determine when to use CONTENT instead of SEPARATE for adPlayer (iOS probably uses CONTENT because of singleElement)
      var adPlayer = Conviva.Client.AdPlayer.SEPARATE;
      convivaClient.adStart(currentConvivaSessionKey, adStream, adPlayer, adPosition);
    }
  };

  /**
   *
   */
  var trackAdEnd = function()
  {
    if (canTrack())
    {
      convivaClient.adEnd(currentConvivaSessionKey);
    }
  };
};

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// Implements Conviva.HttpInterface for Chrome.

function Html5Http () {

  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, arguments);

  this.makeRequest = function (httpMethod, url, data, contentType, timeoutMs, callback) {
    // XDomainRequest only exists in IE, and is IE8-IE9's way of making CORS requests.
    // It is present in IE10 but won't work right.
    // if (typeof XDomainRequest !== "undefined" && navigator.userAgent.indexOf('MSIE 10') === -1) {
    // 	return this.makeRequestIE89.apply(this, arguments);
    // }
    return this.makeRequestStandard.apply(this, arguments);
  };

  this.makeRequestStandard = function (httpMethod, url, data, contentType, timeoutMs, callback) {
    var xmlHttpReq = new XMLHttpRequest();

    xmlHttpReq.open(httpMethod, url, true);

    if (contentType && xmlHttpReq.overrideMimeType) {
      xmlHttpReq.overrideMimeType = contentType;
    }
    if (contentType && xmlHttpReq.setRequestHeader) {
      xmlHttpReq.setRequestHeader('Content-Type',  contentType);
    }
    if (timeoutMs > 0) {
      xmlHttpReq.timeout = timeoutMs;
      xmlHttpReq.ontimeout = function () {
        // Often this callback will be called after onreadystatechange.
        // The first callback called will cleanup the other to prevent duplicate responses.
        xmlHttpReq.ontimeout = xmlHttpReq.onreadystatechange = null;
        if (callback) callback(false, "timeout after " + timeoutMs + " ms");
      };
    }

    xmlHttpReq.onreadystatechange = function () {
      if (xmlHttpReq.readyState === 4) {
        xmlHttpReq.ontimeout = xmlHttpReq.onreadystatechange = null;
        if (xmlHttpReq.status == 200) {
          if (callback) callback(true, xmlHttpReq.responseText);
        } else {
          if (callback) callback(false, "http status " + xmlHttpReq.status);
        }
      }
    };

    xmlHttpReq.send(data);

    return null; // no way to cancel the request
  };

  //   this.makeRequestIE89 = function (httpMethod, url, data, contentType, timeoutMs, callback) {
  //    // IE8-9 does not allow changing the contentType on CORS requests.
  //    // IE8-9 does not like mixed intranet/extranet CORS requests.
  //    // IE8-9 does not like mixed HTTPS-in-HTTP-page / HTTP-in-HTTPS-page CORS requests.

  //    var xmlHttpReq = new XDomainRequest();

  //    xmlHttpReq.open(httpMethod, url, true); // async=true

  //    if (timeoutMs != null) {
  //        xmlHttpReq.timeout = timeoutMs;
  //        xmlHttpReq.ontimeout = function () {
  //            xmlHttpReq.onload = xmlHttpReq.onerror = null;
  //            if (callback) callback(false, "timeout after "+timeoutMs+" ms");
  //        };
  //    }

  // // onreadystatechange won't trigger for XDomainRequest.
  //    xmlHttpReq.onload = function () {
  //    	xmlHttpReq.ontimeout = null;
  //    	if (callback) callback(true, xmlHttpReq.responseText);
  //    };
  //    xmlHttpReq.onerror = function () {
  //    	xmlHttpReq.ontimeout = null;
  //    	if (callback) callback(false, "http status " + xmlHttpReq.status);
  //    };

  //    xmlHttpReq.send(data);

  //    return null; // no way to cancel the request
  //   };

  this.release = function() {
    // nothing to release
  };

}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// Implements Conviva.LoggingInterface for Chrome.

function Html5Logging () {

  function _constr () {
    // nothing to initialize
  }

  _constr.apply(this, arguments);

  this.consoleLog = function (message, logLevel) {
    if (typeof console === 'undefined') return;
    if (console.log && logLevel === Conviva.SystemSettings.LogLevel.DEBUG ||
      logLevel === Conviva.SystemSettings.LogLevel.INFO) {
      console.log(message);
    } else if (console.warn && logLevel === Conviva.SystemSettings.LogLevel.WARNING) {
      console.warn(message);
    } else if (console.error && logLevel === Conviva.SystemSettings.LogLevel.ERROR) {
      console.error(message);
    }
  };

  this.release = function () {
    // nothing to release
  };

}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// Implements Conviva.MetadataInterface for Chrome.

// The Conviva Platform will recognize HTTP user agent strings for major browsers,
// and use these to fill in some of the missing metadata.
// You can validate the resulting metadata through our validation tools.
// If you wish you can maintain your own user agent string parsing on the client side
// instead, and use it to supply the requested Conviva data.

function Html5Metadata () {

  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, arguments);

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getBrowserName = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getBrowserVersion = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getDeviceBrand = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getDeviceManufacturer = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getDeviceModel = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getDeviceType = function () {
    return null;
  };

  // There is no value we can access that qualifies as the device version.
  this.getDeviceVersion = function () {
    return null;
  };

  // HTML5 can qualify as an application framework of sorts.
  this.getFrameworkName = function () {
    return "HTML5";
  };

  // No convenient way to detect HTML5 version.
  this.getFrameworkVersion = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getOperatingSystemName = function () {
    return null;
  };

  // Relying on HTTP user agent string parsing on the Conviva Platform.
  this.getOperatingSystemVersion = function () {
    return null;
  };

  this.release = function() {
    // nothing to release
  };

}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// Implements Conviva.StorageInterface for Chrome.

// HTML5 localStorage relies on a single key to index items,
// so we find a consistent way to combine storageSpace and storageKey.

function Html5Storage () {

  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, arguments);

  this.saveData = function (storageSpace, storageKey, data, callback) {
    var localStorageKey = storageSpace + "." + storageKey;
    try {
      localStorage.setItem(localStorageKey, data);
      callback(true, null);
    } catch (e) {
      callback(false, e.toString());
    }
  };

  this.loadData = function (storageSpace, storageKey, callback) {
    var localStorageKey = storageSpace + "." + storageKey;
    try {
      var data = localStorage.getItem(localStorageKey);
      callback(true, data);
    } catch (e) {
      callback(false, e.toString());
    }
  };

  this.release = function() {
    // nothing to release
  };

}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// Implements Conviva.TimeInterface for Chrome.

function Html5Time () {

  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, arguments);

  this.getEpochTimeMs = function () {
    var d = new Date();
    return d.getTime();
  };

  this.release = function() {
    // nothing to release
  };
}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// Implements Conviva.TimerInterface for Chrome.

// setInterval does exactly what we need. We just need to return a function
// which cancels the timer when called.
// Some JavaScript implementations do not have setInterval, in which case
// you may have to write it yourself using setTimeout.

function Html5Timer () {

  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, arguments);

  this.createTimer = function (timerAction, intervalMs, actionName) {
    var timerId = setInterval(timerAction, intervalMs);
    var cancelTimerFunc = (function () {
      if (timerId !== -1) {
        clearInterval(timerId);
        timerId = -1;
      }
    });
    return cancelTimerFunc;
  };

  this.release = function() {
    // nothing to release
  };

}

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(ConvivaAnalyticsPlugin);

module.exports = ConvivaAnalyticsPlugin;
