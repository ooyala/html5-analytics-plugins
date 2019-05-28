/* eslint-disable require-jsdoc */
require(`${SRC_ROOT}framework/InitAnalyticsNamespace.js`);
require(`${SRC_ROOT}framework/AnalyticsConstants.js`);
require(`${COMMON_SRC_ROOT}utils/constants.js`);


if (!OO.Analytics.Utils) {
  OO.Analytics.Utils = {};

  const { Utils } = OO.Analytics;

  Utils.createValidPluginFactory = function (name) {
    return function () {
      const myPlugin = {};
      let pluginID;
      for (let i = 0; i < OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++) {
        myPlugin[OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS[i]] = function () {};
      }

      // get name and version need to return a truthy string
      myPlugin.getName = function () {
        if (!name) {
          return 'testName';
        }

        return name;
      };

      myPlugin.getVersion = function () {
        return 'testVersion';
      };

      myPlugin.setPluginID = function (id) {
        pluginID = id;
      };

      myPlugin.getPluginID = function () {
        return pluginID;
      };

      return myPlugin;
    };
  };

  Utils.createMissingFunctionFactory = function (functionToRemove) {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const badPlugin = new ValidFactory();
      delete badPlugin[functionToRemove];
      return badPlugin;
    }, this);
  };

  Utils.createExtraFunctionFactory = function (functionToAdd) {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const extraFuncFactory = new ValidFactory();
      extraFuncFactory[functionToAdd] = function () {};
      return extraFuncFactory;
    }, this);
  };

  Utils.createWrongNameReturnTypeFactory = function () {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const wrongReturnFactory = new ValidFactory();
      wrongReturnFactory.getName = function () {
        return 5;
      };
      return wrongReturnFactory;
    }, this);
  };

  Utils.createWrongVersionReturnTypeFactory = function () {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const wrongReturnFactory = new ValidFactory();
      wrongReturnFactory.getVersion = function () {
        return 5;
      };
      return wrongReturnFactory;
    }, this);
  };

  Utils.createRecordedEventsFactory = function () {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const eventFactory = new ValidFactory();
      eventFactory.processRecordedEvents = function (events) {
        this.recordedEvents = events;
      };
      return eventFactory;
    }, this);
  };

  Utils.createFactoryWithGlobalAccessToPluginInstance = function () {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const plugin = new ValidFactory();
      plugin.msgReceivedList = [];
      plugin.active = true;

      plugin.init = function () {
        this.initWasCalled = true;
      };

      plugin.setMetadata = function (metadata) {
        this.metadata = metadata;
      };

      plugin.processEvent = function (msgName) {
        this.msgReceivedList.push(msgName);
      };

      if (!OO.Analytics.Framework.TEST) {
        OO.Analytics.Framework.TEST = [];
      }
      OO.Analytics.Framework.TEST.push(plugin);
      return plugin;
    }, this);
  };

  Utils.createFactoryThatThrowsErrorOn = function (funcName) {
    return OO._.bind(() => {
      const ValidFactory = Utils.createValidPluginFactory();
      const badPlugin = new ValidFactory();
      badPlugin[funcName] = function () {
        throw new Error('Error');
      };
      return badPlugin;
    }, this);
  };

  Utils.createFactoryToTestConstructorParams = function () {
    return OO._.bind((framework) => {
      const ValidFactory = Utils.createValidPluginFactory();
      const validPlugin = new ValidFactory();
      if (!OO.Analytics.Framework.TEST) {
        OO.Analytics.Framework.TEST = {};
        OO.Analytics.Framework.TEST.frameworkParam = framework;
      }
      return validPlugin;
    }, this);
  };

  const PlaybackSimulator = function (plugin) {
    let preSimulateCallback;

    this.addPreSimulateCallback = function (cb) {
      preSimulateCallback = cb;
    };

    this.clearPreSimulateCallback = function () {
      preSimulateCallback = null;
    };

    const preSimulate = function () {
      if (typeof preSimulateCallback === 'function') {
        preSimulateCallback();
      }
    };

    this.simulatePlayerLoad = function (metadata) {
      preSimulate();
      // TODO: Validate metadata
      if (metadata) {
        const innerMetadata = metadata.metadata;
        let autoPlay = null;
        if (innerMetadata) {
          // eslint-disable-next-line prefer-destructuring
          autoPlay = innerMetadata.autoPlay;
        }

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED, [{
          params: {
            pcode: metadata.pcode,
            playerBrandingId: metadata.playerBrandingId,
          },
          embedCode: metadata.embedCode,
          playerUrl: metadata.playerUrl,
          playerCoreVersion: 'v4',
        }]);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
          embedCode: metadata.embedCode,
          metadata: {
            autoPlay,
          },
        }]);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED, [{
          title: metadata.title,
          duration: metadata.duration,
          contentType: metadata.contentType,
        }]);
        const streamType = metadata.streamType ? metadata.streamType : OO.Analytics.STREAM_TYPE.VOD;
        plugin.processEvent(OO.Analytics.EVENTS.STREAM_TYPE_UPDATED, [{
          streamType,
        }]);
      }
    };

    this.simulateStreamMetadataUpdated = function (metadata) {
      preSimulate();
      const metadataNew = metadata || {};
      if (metadataNew) {
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED, [{
          base: metadataNew.base || {},
          modules: metadataNew.modules || {},
        }]);
      }
    };

    this.simulatePlayerStart = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED);
    };

    this.simulateContentPlayback = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYING);
    };

    this.simulateVideoPause = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED);
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
    };

    this.simulateVideoBufferingStarted = function (metadata) {
      preSimulate();
      let params = null;
      if (metadata) {
        params = [{
          position: metadata.position,
        }];
      }
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_STARTED, params);
    };

    this.simulateWillPlayFromBeginning = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.WILL_PLAY_FROM_BEGINNING);
    };


    this.simulateInitialPlayStarting = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.INITIAL_PLAY_STARTING, [metadata]);
    };

    this.simulatePlaybackReady = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_READY, [metadata]);
    };

    this.simulateApiError = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.API_ERROR, [metadata]);
    };

    this.simulateBitrateInitial = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.BITRATE_INITIAL, [metadata]);
    };

    this.simulateBitrateFiveSec = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.BITRATE_FIVE_SEC, [metadata]);
    };

    this.simulateBitrateStable = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.BITRATE_STABLE, [metadata]);
    };

    this.simulatePlaybackStartError = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_START_ERROR, [metadata]);
    };

    this.simulatePlaybackMidstreamError = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_MIDSTREAM_ERROR, [metadata]);
    };

    this.simulatePluginLoaded = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.PLUGIN_LOADED, [metadata]);
    };

    this.simulateAdRequest = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_REQUEST, [metadata]);
    };

    this.simulateAdRequestSuccess = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_REQUEST_SUCCESS, [metadata]);
    };

    this.simulateAdSdkLoaded = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_SDK_LOADED, [metadata]);
    };

    this.simulateAdSdkLoadFailure = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_SDK_LOAD_FAILURE, [metadata]);
    };

    this.simulateAdPodStarted = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_POD_STARTED, [metadata]);
    };

    this.simulateAdPodEnded = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_POD_ENDED, [metadata]);
    };

    this.simulateAdSkipped = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_SKIPPED, [metadata]);
    };

    this.simulateAdRequestEmpty = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_REQUEST_EMPTY, [metadata]);
    };

    this.simulateAdRequestError = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_REQUEST_ERROR, [metadata]);
    };

    this.simulateAdPlayBackError = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_PLAYBACK_ERROR, [metadata]);
    };

    this.simulateAdImpression = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_IMPRESSION);
    };

    this.simulateAdSdkImpression = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_SDK_IMPRESSION, [metadata]);
    };

    this.simulateAdCompleted = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_COMPLETED, [metadata]);
    };

    this.simulateAdClickthroughOpened = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_CLICKTHROUGH_OPENED, [metadata]);
    };

    this.simulateAdClicked = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_CLICKED);
    };

    this.simulateSdkAdEvent = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.SDK_AD_EVENT, [metadata]);
    };

    this.simulateDiscoveryAssetImpression = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.REPORT_DISCOVERY_IMPRESSION, [{ metadata }]);
    };

    this.simulateDiscoveryAssetClick = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.REPORT_DISCOVERY_CLICK, [{ metadata }]);
    };

    this.simulateVideoBufferingEnded = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_BUFFERING_ENDED);
    };

    this.simulateVideoProgress = function (metadata) {
      preSimulate();
      // TODO: Validate metadata
      if (metadata) {
        const { playheads } = metadata;
        const videoId = metadata.videoId ? metadata.videoId : OO.VIDEO.MAIN;
        const totalStreamDuration = metadata.totalStreamDuration ? metadata.totalStreamDuration : 60;
        _.each(playheads, (playhead) => {
          plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
            streamPosition: playhead,
            videoId,
            totalStreamDuration,
          }]);
        });
      }
    };

    this.simulateVideoSeek = function (metadata) {
      preSimulate();
      let params = null;
      if (metadata) {
        params = [{
          timeSeekedTo: metadata.timeSeekedTo,
        }];
      }
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_REQUESTED, params);
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED, params);
    };

    this.simulateContentComplete = function (metadata) {
      preSimulate();
      // TODO: Validate metadata
      if (metadata) {
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED, [{
          streamPosition: metadata.streamPosition,
        }]);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED);
      }
    };

    this.simulatePlaybackComplete = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.PLAYBACK_COMPLETED);
    };

    this.simulateAdBreakStarted = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_STARTED);
    };

    this.simulateAdPlayback = function (metadata) {
      preSimulate();
      // TODO: Validate metadata
      if (metadata) {
        plugin.processEvent(OO.Analytics.EVENTS.AD_STARTED, [{
          adType: metadata.adType,
          adMetadata: {
            adId: metadata.adMetadata.adId,
            adDuration: metadata.adMetadata.adDuration,
            adPodPosition: metadata.adMetadata.adPodPosition,
          },
        }]);
      }
    };

    this.simulateAdComplete = function (metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_ENDED, [{
        adType: metadata.adType,
        adId: metadata.adId,
      }]);
    };

    this.simulateAdBreakEnded = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_BREAK_ENDED);
    };

    this.simulateReplay = function () {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED);
    };

    this.simulateBitrateChange = function (bitrateProfile) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_STREAM_BITRATE_CHANGED, [{
        bitrate: bitrateProfile.bitrate,
        width: bitrateProfile.width,
        height: bitrateProfile.height,
        id: bitrateProfile.id,
      }]);
    };

    this.simulateVideoElementCreated = function (streamUrl) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_ELEMENT_CREATED, [{
        streamUrl,
      }]);
    };

    this.simulateAdError = function (error) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.AD_ERROR, [{
        error,
      }]);
    };

    this.simulateGeneralError = function (errorCode, errorMessage) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.ERROR.GENERAL, [{
        errorCode,
        errorMessage,
      }]);
    };

    this.simulateMetadataLoadingError = function (errorCode, errorMessage) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.ERROR.METADATA_LOADING, [{
        errorCode,
        errorMessage,
      }]);
    };

    this.simulateVideoPlaybackError = function (errorCode, errorMessage) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.ERROR.VIDEO_PLAYBACK, [{
        errorCode,
        errorMessage,
      }]);
    };

    this.simulateAuthorizationError = function (errorCode, errorMessage) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.ERROR.AUTHORIZATION, [{
        errorCode,
        errorMessage,
      }]);
    };

    this.simulateVideoSourceChanged = function (embedCode, metadata) {
      preSimulate();
      plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
        embedCode,
        metadata: metadata || {},
      }]);
    };
  };

  Utils.createPlaybackSimulator = function (plugin) {
    return new PlaybackSimulator(plugin);
  };
}
