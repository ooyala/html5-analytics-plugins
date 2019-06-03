require('../framework/InitAnalyticsNamespace.js');
require('../../html5-common/js/utils/utils.js');

// Below implementations of system interface functions were pulled from the Conviva Sample App
/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

/**
 * Implements Conviva.HttpInterface for Chrome.
 * @param {array} args The array of arguments.
 * @constructor
 */
function Html5Http(...args) {
  // eslint-disable-next-line require-jsdoc
  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, args);

  this.makeRequest = function (httpMethod, url, data, contentType, timeoutMs, callback) {
    // XDomainRequest only exists in IE, and is IE8-IE9's way of making CORS requests.
    // It is present in IE10 but won't work right.
    // if (typeof XDomainRequest !== "undefined"
    // && navigator.userAgent.indexOf('MSIE 10') === -1) {
    // return this.makeRequestIE89.apply(this, arguments);
    // }
    return this.makeRequestStandard.apply(this, [httpMethod, url, data, contentType, timeoutMs, callback]);
  };

  this.makeRequestStandard = function (httpMethod, url, data, contentType, timeoutMs, callback) {
    const xmlHttpReq = new XMLHttpRequest();

    xmlHttpReq.open(httpMethod, url, true);

    if (contentType && xmlHttpReq.overrideMimeType) {
      xmlHttpReq.overrideMimeType = contentType;
    }
    if (contentType && xmlHttpReq.setRequestHeader) {
      xmlHttpReq.setRequestHeader('Content-Type', contentType);
    }
    if (timeoutMs > 0) {
      xmlHttpReq.timeout = timeoutMs;
      xmlHttpReq.ontimeout = function () {
        // Often this callback will be called after onreadystatechange.
        // The first callback called will cleanup the other to prevent duplicate responses.
        xmlHttpReq.ontimeout = null;
        xmlHttpReq.onreadystatechange = xmlHttpReq.ontimeout;
        if (callback) callback(false, `timeout after ${timeoutMs} ms`);
      };
    }

    xmlHttpReq.onreadystatechange = function () {
      if (xmlHttpReq.readyState === 4) {
        xmlHttpReq.ontimeout = null;
        xmlHttpReq.onreadystatechange = xmlHttpReq.ontimeout;
        if (xmlHttpReq.status === 200) {
          if (callback) callback(true, xmlHttpReq.responseText);
        } else if (callback) callback(false, `http status ${xmlHttpReq.status}`);
      }
    };

    xmlHttpReq.send(data);

    return null; // no way to cancel the request
  };

  // this.makeRequestIE89 = function (httpMethod, url, data, contentType, timeoutMs, callback) {
  //   // IE8-9 does not allow changing the contentType on CORS requests.
  //   // IE8-9 does not like mixed intranet/extranet CORS requests.
  //   // IE8-9 does not like mixed HTTPS-in-HTTP-page / HTTP-in-HTTPS-page CORS requests.
  //
  //   var xmlHttpReq = new XDomainRequest();
  //
  //   xmlHttpReq.open(httpMethod, url, true); // async=true
  //
  //   if (timeoutMs != null) {
  //     xmlHttpReq.timeout = timeoutMs;
  //     xmlHttpReq.ontimeout = function () {
  //       xmlHttpReq.onload = xmlHttpReq.onerror = null;
  //       if (callback) callback(false, 'timeout after ' + timeoutMs + ' ms');
  //     };
  //   }
  //
  //   // onreadystatechange won't trigger for XDomainRequest.
  //   xmlHttpReq.onload = function () {
  //     xmlHttpReq.ontimeout = null;
  //     if (callback) callback(true, xmlHttpReq.responseText);
  //   };
  //   xmlHttpReq.onerror = function () {
  //     xmlHttpReq.ontimeout = null;
  //     if (callback) callback(false, 'http status ' + xmlHttpReq.status);
  //   };
  //
  //   xmlHttpReq.send(data);
  //
  //   return null; // no way to cancel the request
  // };

  this.release = function () {
    // nothing to release
  };
}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

/**
 * Implements Conviva.LoggingInterface for Chrome.
 * @param {array} args The array of arguments.
 * @constructor
 */
function Html5Logging(...args) {
  // eslint-disable-next-line require-jsdoc
  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, args);

  this.consoleLog = function (message, logLevel) {
    if (typeof console === 'undefined') return;
    /* eslint-disable no-console */
    if ((console.log && logLevel === Conviva.SystemSettings.LogLevel.DEBUG)
      || logLevel === Conviva.SystemSettings.LogLevel.INFO) {
      console.log(message);
    } else if (console.warn && logLevel === Conviva.SystemSettings.LogLevel.WARNING) {
      console.warn(message);
    } else if (console.error && logLevel === Conviva.SystemSettings.LogLevel.ERROR) {
      console.error(message);
    }
    /* eslint-enable no-console */
  };

  this.release = function () {
    // nothing to release
  };
}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// The Conviva Platform will recognize HTTP user agent strings for major browsers,
// and use these to fill in some of the missing metadata.
// You can validate the resulting metadata through our validation tools.
// If you wish you can maintain your own user agent string parsing on the client side
// instead, and use it to supply the requested Conviva data.

/**
 * Implements Conviva.MetadataInterface for Chrome.
 * @param {array} args The array of arguments.
 * @constructor
 */
function Html5Metadata(...args) {
  // eslint-disable-next-line require-jsdoc
  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, args);

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
    return 'HTML5';
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

  this.release = function () {
    // nothing to release
  };
}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// HTML5 localStorage relies on a single key to index items,
// so we find a consistent way to combine storageSpace and storageKey.

/**
 * Implements Conviva.StorageInterface for Chrome.
 * @param {array} args The array of arguments.
 * @constructor
 */
function Html5Storage(...args) {
  // eslint-disable-next-line require-jsdoc
  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, args);

  this.saveData = function (storageSpace, storageKey, data, callback) {
    const localStorageKey = `${storageSpace}.${storageKey}`;
    try {
      localStorage.setItem(localStorageKey, data);
      callback(true, null);
    } catch (e) {
      callback(false, e.toString());
    }
  };

  this.loadData = function (storageSpace, storageKey, callback) {
    const localStorageKey = `${storageSpace}.${storageKey}`;
    try {
      const data = localStorage.getItem(localStorageKey);
      callback(true, data);
    } catch (e) {
      callback(false, e.toString());
    }
  };

  this.release = function () {
    // nothing to release
  };
}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

/**
 * Implements Conviva.TimeInterface for Chrome.
 * @param {array} args The array of arguments.
 * @constructor
 */
function Html5Time(...args) {
  // eslint-disable-next-line require-jsdoc
  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, args);

  this.getEpochTimeMs = function () {
    const d = new Date();
    return d.getTime();
  };

  this.release = function () {
    // nothing to release
  };
}

/*! (C) 2015 Conviva, Inc. All rights reserved. Confidential and proprietary. */

// setInterval does exactly what we need. We just need to return a function
// which cancels the timer when called.
// Some JavaScript implementations do not have setInterval, in which case
// you may have to write it yourself using setTimeout.

/**
 * Implements Conviva.TimerInterface for Chrome.
 * @param {array} args The array of arguments.
 * @constructor
 */
function Html5Timer(...args) {
  // eslint-disable-next-line require-jsdoc
  function _constr() {
    // nothing to initialize
  }

  _constr.apply(this, args);

  this.createTimer = function (timerAction, intervalMs) {
    let timerId = setInterval(timerAction, intervalMs);
    // eslint-disable-next-line require-jsdoc
    const cancelTimerFunc = (function () {
      if (timerId !== -1) {
        clearInterval(timerId);
        timerId = -1;
      }
    });
    return cancelTimerFunc;
  };

  this.release = function () {
    // nothing to release
  };
}

/**
 * @class ConvivaAnalyticsPlugin
 * @classdesc Conviva SDK plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
const ConvivaAnalyticsPlugin = function (framework) {
  let _framework = framework;
  const name = 'conviva';
  const version = 'v1';
  let id;

  const OOYALA_PLAYER_VENDOR = 'Ooyala';
  const OOYALA_PLAYER_VERSION = '';

  let currentConvivaSessionKey = null;
  let streamUrl = null;
  let streamType = null;
  let embedCode = null;
  let videoContentMetadata = null;
  let convivaMetadata = null;
  let systemFactory = null;
  let convivaClient = null;
  let playerStateManager = null;

  let currentPlayhead = -1;
  let paused = false;
  let buffering = false;
  let inAdBreak = false;
  let contentComplete = false;
  let playRequested = false;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#getName
   * @returns {string} The name of the plugin.
   */
  this.getName = function () {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#getVersion
   * @returns {string} The version of the plugin.
   */
  this.getVersion = function () {
    return version;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method ConvivaAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function (newID) {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method ConvivaAnalyticsPlugin#setPluginID
   * @returns  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function () {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method ConvivaAnalyticsPlugin#init
   */
  this.init = function () {
    let missedEvents;
    if (_framework && _.isFunction(_framework.getRecordedEvents)) {
      missedEvents = _framework.getRecordedEvents();
      _.each(missedEvents, _.bind(function (recordedEvent) {
        // recordedEvent.timeStamp;
        this.processEvent(recordedEvent.eventName, recordedEvent.params);
      }, this));
    }

    // Conviva wants to know when sessions end when the page is closed
    // Adding this beforeunload event listener as a failsafe
    window.addEventListener('beforeunload', _.bind(function () {
      this.destroy();
    }, this));
  };

  /**
   * Provides SystemSettings to configure the Conviva SystemFactory
   * @private
   * @method ConvivaAnalyticsPlugin#getSystemSettings
   * @returns {object} An instance of Conviva's SystemSettings
   */
  const getSystemSettings = function () {
    const systemSettings = new Conviva.SystemSettings();
    // systemSettings.logLevel = Conviva.SystemSettings.LogLevel.ERROR; // default
    // systemSettings.logLevel = Conviva.SystemSettings.LogLevel.DEBUG;
    // systemSettings.allowUncaughtExceptions = false; // default
    return systemSettings;
  };

  /**
   * Provides ClientSettings to configure the Conviva Client
   * @private
   * @method ConvivaAnalyticsPlugin#getClientSettings
   * @returns {object} An instance of Conviva's ClientSettings
   */
  const getClientSettings = function () {
    const clientSettings = new Conviva.ClientSettings(convivaMetadata.customerKey);
    // clientSettings.heartbeatInterval = 20; // default
    // clientSettings.gatewayUrl = credentials.gatewayUrl; // default
    clientSettings.gatewayUrl = convivaMetadata.gatewayUrl;
    return clientSettings;
  };

  /**
   * Checks to see if the Conviva SDK is loaded
   * @private
   * @method ConvivaAnalyticsPlugin#sdkLoaded
   * @returns {boolean} True if the SDK is loaded, false otherwise
   */
  const sdkLoaded = function () {
    return !!window.Conviva;
  };

  /**
   * Validates the custom metadata passed in via page level settings.
   * @private
   * @method ConvivaAnalyticsPlugin#validateCustomMetadata
   * @param  {object} metadata The Conviva custom metadata to validate
   * @returns {boolean} true if valid, false otherwise
   */
  const validateCustomMetadata = function (metadata) {
    return _.isObject(metadata);
  };

  /**
   * Conviva metadata needs to include the following:
   * gatewayUrl, customerKey
   * @private
   * @method ConvivaAnalyticsPlugin#validateConvivaMetadata
   * @param {object} metadata The Conviva page level metadata to validate.
   * @returns {boolean} true if valid, false otherwise.
   */
  const validateConvivaMetadata = function (metadata) {
    let valid = true;
    const requiredKeys = ['gatewayUrl', 'customerKey'];

    let missingKeys = [];

    if (metadata) {
      _.each(requiredKeys, (key) => {
        if (!_.has(metadata, key)) {
          missingKeys.push(key);
          valid = false;
        }
      });
    } else {
      OO.log('Error: Missing Conviva Metadata!');
      missingKeys = requiredKeys;
      valid = false;
    }


    if (!_.isEmpty(missingKeys)) {
      _.each(missingKeys, (key) => {
        OO.log(`Error: Missing Conviva Metadata Key: ${key}`);
      });
    }

    return valid;
  };

  /**
   * Resets any state variables back to their initial values.
   * @private
   * @method ConvivaAnalyticsPlugin#resetPlaybackState
   */
  const resetPlaybackState = function () {
    currentPlayhead = -1;
    buffering = false;
    paused = false;
    inAdBreak = false;
    contentComplete = false;
    playRequested = false;
  };

  /**
   * Resets any content state variables back to their initial values.
   * @private
   * @method ConvivaAnalyticsPlugin#resetContentState
   */
  const resetContentState = function () {
    streamUrl = null;
    videoContentMetadata = null;
    embedCode = null;
  };

  /**
   * @private
   * @method ConvivaAnalyticsPlugin#validSession
   * @returns {boolean} function call result
   */
  const validSession = function () {
    return currentConvivaSessionKey !== Conviva.Client.NO_SESSION_KEY && currentConvivaSessionKey !== null
      && typeof currentConvivaSessionKey !== 'undefined';
  };

  /**
   * Clears the last Conviva session by detaching the player from the Conviva Client and
   * releasing the current player state manager from the Conviva Client
   * @private
   * @method ConvivaAnalyticsPlugin#clearLastSession
   */
  const clearLastSession = function () {
    if (validSession()) {
      // convivaClient.detachPlayer(currentConvivaSessionKey);
      convivaClient.cleanupSession(currentConvivaSessionKey);
      currentConvivaSessionKey = Conviva.Client.NO_SESSION_KEY;
    }

    // TODO: Find out when to release player state manager
    // if (playerStateManager)
    // {
    //   playerStateManager.release();
    //   convivaClient.releasePlayerStateManager(playerStateManager);
    //   playerStateManager = null;
    // }
  };

  /**
   * Checks to see if the Conviva SDK is ready to accept tracking events.
   * @private
   * @method ConvivaAnalyticsPlugin#canTrack
   * @returns {*} function call result or undefined.
   */
  const canTrack = function () {
    return playerStateManager && convivaClient && validSession();
  };

  /**
   * Updates the Conviva PlayerStateManager of the latest player state.
   * @private
   * @method ConvivaAnalyticsPlugin#updatePlayerState
   * @param {string} state the Conviva.PlayerStateManager.PlayerState to update
   */
  const updatePlayerState = function (state) {
    if (canTrack()) {
      playerStateManager.setPlayerState(state);
    } else {
      OO.log(`Conviva Plugin Error: trying to set player state when unable to with state ${state}`);
    }
  };

  /**
   * To be called when the main content has started playback.
   * @private
   * @method ConvivaAnalyticsPlugin#trackPlay
   */
  const trackPlay = function () {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.PLAYING);
  };

  /**
   * To be called when the main content has paused.
   * @private
   * @method ConvivaAnalyticsPlugin#trackPause
   */
  const trackPause = function () {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.PAUSED);
  };

  /**
   * To be called when the main content is not playing.
   * @private
   * @method ConvivaAnalyticsPlugin#trackStop
   */
  const trackStop = function () {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.STOPPED);
  };

  /**
   * Gathers all relevant application information for a particular video playback and stores this
   * information inside a Conviva ContentMetadata object. Clears the last session if necessary. After
   * the ContentMetadata is created, the Conviva Client will create a session for tracking.
   * @private
   * @method ConvivaAnalyticsPlugin#tryBuildConvivaContentMetadata
   * @returns {boolean} true if the Conviva Content Metadata and Session was created, false otherwise
   */
  const tryBuildConvivaContentMetadata = function () {
    let success = false;
    if (playRequested && videoContentMetadata && embedCode && convivaClient
      && streamUrl && streamType && !validSession()) {
      playerStateManager = convivaClient.getPlayerStateManager();
      const contentMetadata = new Conviva.ContentMetadata();

      // Recommended format for the assetName, using both the ID of the video content and its title
      contentMetadata.assetName = `[${embedCode}] ${videoContentMetadata.title}`;

      // The stream url for this video content.
      // For manifest-based streaming protocols, it should point to the top-level manifest.
      contentMetadata.streamUrl = streamUrl;

      // The type of stream for this content. Usually either live or VOD.
      // Sometimes the application may not know right away, in which case you have the option to set it to Unknown
      // and possibly fill the gap later on.
      contentMetadata.streamType = streamType === OO.Analytics.STREAM_TYPE.LIVE_STREAM
        ? Conviva.ContentMetadata.StreamType.LIVE
        : Conviva.ContentMetadata.StreamType.VOD;

      // Duration of this particular video stream.
      // If this information is available to your application from your Content Management System,
      // you can supply it here.
      // Otherwise, the PlayerInterface will have to extract it from the video player.
      contentMetadata.duration = Math.round(videoContentMetadata.duration / 1000); // in seconds

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
      const appName = convivaMetadata.applicationName;
      if (_.isString(appName)) {
        contentMetadata.applicationName = appName;
      }

      // An identifier for the current user. Can be obfuscated to ensure privacy.
      // Can be used to isolate video traffic for a particular and help with
      // video quality assessements/troubleshooting for that particular user.
      // contentMetadata.viewerId = userData.id;

      let customMetadata = {};
      customMetadata.playerVendor = OOYALA_PLAYER_VENDOR;
      customMetadata.playerVersion = OOYALA_PLAYER_VERSION;

      customMetadata = _.extend(customMetadata, convivaMetadata.customMetadata);
      if (validateCustomMetadata(customMetadata)) {
        contentMetadata.custom = customMetadata;
      }

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

      // Track stop initially
      trackStop();
      success = true;
    }
    return success;
  };

  /**
   * To be called when the video is paused due to buffering.
   * @private
   * @ethod ConvivaAnalyticsPlugin#trackBuffering
   */
  const trackBuffering = function () {
    updatePlayerState(Conviva.PlayerStateManager.PlayerState.BUFFERING);
  };

  /**
   * To be called when the main content changes bitrate.
   * @private
   * @ethod ConvivaAnalyticsPlugin#trackBitrateChange
   * @param {number} bitrate The new bitrate of the main content in bps
   */
  const trackBitrateChange = function (bitrate) {
    if (canTrack()) {
      const kbpsBitrate = Math.round(bitrate / 1000);
      playerStateManager.setBitrateKbps(kbpsBitrate);
    }
  };

  /**
   * To be called when an ad has started playing.
   * @private
   * @method ConvivaAnalyticsPlugin#trackAdStart
   */
  const trackAdStart = function () {
    if (canTrack()) {
      let adPosition = null;
      if (currentPlayhead <= 0) {
        OO.log('[Conviva-Ooyala] Playing preroll');
        adPosition = Conviva.Client.AdPosition.PREROLL;
      } else if (contentComplete) {
        OO.log('[Conviva-Ooyala] Playing postroll');
        adPosition = Conviva.Client.AdPosition.POSTROLL;
      } else {
        OO.log('[Conviva-Ooyala] Playing midroll');
        adPosition = Conviva.Client.AdPosition.MIDROLL;
      }

      // TODO: If SSAI, use CONTENT instead of SEPARATE for adStream
      const adStream = Conviva.Client.AdStream.SEPARATE;
      // TODO: Determine when to use CONTENT instead of SEPARATE for adPlayer (iOS probably uses CONTENT because of singleElement)
      const adPlayer = Conviva.Client.AdPlayer.SEPARATE;
      convivaClient.adStart(currentConvivaSessionKey, adStream, adPlayer, adPosition);
    }
  };

  /**
   * To be called when an ad has stopped playing.
   * @private
   * @method ConvivaAnalyticsPlugin#trackAdEnd
   */
  const trackAdEnd = function () {
    if (canTrack()) {
      convivaClient.adEnd(currentConvivaSessionKey);
    }
  };


  /**
   * If the required metadata and Conviva SDK is available, this function will
   * create the system interface and settings to create an instance of the Conviva
   * Client object. Will also try to create the Conviva Content Metadata once the
   * Client object is available.
   * @private
   * @method ConvivaAnalyticsPlugin#trySetupConviva
   */
  const trySetupConviva = function () {
    if (convivaMetadata && sdkLoaded()) {
      if (!systemFactory) {
        const systemInterface = new Conviva.SystemInterface(
          new Html5Time(),
          new Html5Timer(),
          new Html5Http(),
          new Html5Storage(),
          new Html5Metadata(),
          new Html5Logging(),
        );

        const systemSettings = getSystemSettings();
        systemFactory = new Conviva.SystemFactory(systemInterface, systemSettings);
      }

      const clientSettings = getClientSettings();
      convivaClient = new Conviva.Client(clientSettings, systemFactory);

      tryBuildConvivaContentMetadata();
    }
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method ConvivaAnalyticsPlugin#destroy
   */
  this.destroy = function () {
    _framework = null;
    resetPlaybackState();
    clearLastSession();
    if (convivaClient) {
      convivaClient.release();
      convivaClient = null;
    }

    if (systemFactory) {
      systemFactory.release();
      systemFactory = null;
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function (metadata) {
    if (validateConvivaMetadata(metadata)) {
      convivaMetadata = metadata;
      trySetupConviva();
    } else {
      this.destroy();
    }
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method ConvivaAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function (eventName, params) {
    OO.log(`Conviva: PluginID '${id}' received this event '${eventName}' with these params:`, params);
    switch (eventName) {
      case OO.Analytics.EVENTS.VIDEO_ELEMENT_CREATED:
        if (params && params[0] && params[0].streamUrl) {
          // eslint-disable-next-line prefer-destructuring
          streamUrl = params[0].streamUrl;
          tryBuildConvivaContentMetadata();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED:
        contentComplete = true;
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        trackStop();
        // Conviva docs say to end the session when the video has finished
        clearLastSession();
        break;
      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        playRequested = true;
        tryBuildConvivaContentMetadata();
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        paused = false;
        trackPlay();
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        paused = true;
        trackPause();
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED:
        buffering = true;
        trackBuffering();
        break;
      case OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED:
        if (buffering) {
          buffering = false;
          if (paused) {
            trackPause();
          } else {
            trackPlay();
          }
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED:
        trackPause();
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        clearLastSession();
        playRequested = true;
        tryBuildConvivaContentMetadata();
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        resetPlaybackState();
        clearLastSession();
        if (params && params[0] && params[0].embedCode) {
          resetContentState();
          // eslint-disable-next-line prefer-destructuring
          embedCode = params[0].embedCode;
          tryBuildConvivaContentMetadata();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0]) {
          [videoContentMetadata] = params;
          tryBuildConvivaContentMetadata();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0] && params[0].streamPosition) {
          if (!inAdBreak) {
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
        if (params && params[0]) {
          // Retrieve the stream type here.
          // Possible values include OO.Analytics.STREAM_TYPE.VOD and OO.Analytics.STREAM_TYPE.LIVE_STREAM
          // eslint-disable-next-line prefer-destructuring
          streamType = params[0].streamType;
          tryBuildConvivaContentMetadata();
        }
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_BITRATE_CHANGED:
        if (params && params[0] && _.isNumber(params[0].bitrate)) {
          if (!inAdBreak) {
            trackBitrateChange(params[0].bitrate);
          }
        }
        break;
      case OO.Analytics.EVENTS.AD_ERROR:
        if (params && params[0] && params[0].error) {
          const { error } = params[0];
          if (playerStateManager) {
            playerStateManager.sendError(error, Conviva.Client.ErrorSeverity.WARNING);
          }
        }
        break;
      case OO.Analytics.EVENTS.ERROR.GENERAL:
      case OO.Analytics.EVENTS.ERROR.METADATA_LOADING:
      case OO.Analytics.EVENTS.ERROR.VIDEO_PLAYBACK:
      case OO.Analytics.EVENTS.ERROR.AUTHORIZATION:
        if (params && params[0] && params[0].errorCode) {
          const { errorCode } = params[0];
          const { errorMessage } = params[0];

          let errorString = '';
          if (errorMessage) {
            errorString = `Error Code: ${errorCode}, Error Message: ${errorMessage}`;
          } else {
            errorString = `Error Code: ${errorCode}`;
          }

          if (playerStateManager) {
            playerStateManager.sendError(errorString, Conviva.Client.ErrorSeverity.FATAL);
          }
        }
        clearLastSession();
        break;
      default:
        break;
    }
  };
};

// Add the template to the global list of factories for all new instances of the framework
// and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(ConvivaAnalyticsPlugin);

module.exports = ConvivaAnalyticsPlugin;
