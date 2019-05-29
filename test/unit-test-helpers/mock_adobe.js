/* eslint-disable require-jsdoc */
global.ADB = {
  va: {
    plugins: {
      videoplayer: {
        VideoPlayerPlugin() {
          ADB.OO.VideoPlayerPlugin = this;
          this.configure = function () {
          };
          this.trackVideoLoad = function () {
          };

          this.trackVideoUnload = function () {
          };
          this.trackSessionStart = function () {
          };
          this.trackPlay = function () {
          };
          this.trackPause = function () {
          };
          this.trackComplete = function () {
          };
          this.trackSeekStart = function () {
          };
          this.trackSeekComplete = function () {
          };
          this.trackBufferStart = function () {
          };
          this.trackBufferComplete = function () {
          };

          this.trackAdStart = function () {
          };
          this.trackAdComplete = function () {
          };

          this.trackChapterStart = function () {
          };
          this.trackChapterComplete = function () {
          };

          this.trackBitrateChange = function () {
          };

          this.trackVideoPlayerError = function () {
          };
          this.trackApplicationError = function () {
          };
        },
        VideoPlayerPluginConfig() {
          ADB.OO.VideoPlayerPluginConfig = this;
        },
        AssetType: {},
        VideoInfo() {

        },
        AdBreakInfo() {

        },
        AdInfo() {

        },
        ChapterInfo() {

        },
        QoSInfo() {

        },
      },
      aa: {
        AdobeAnalyticsPlugin() {
          ADB.OO.AdobeAnalyticsPlugin = this;
          this.configure = function () {
          };
        },
        AdobeAnalyticsPluginConfig() {
          ADB.OO.AdobeAnalyticsPluginConfig = this;
        },
        AdobeAnalyticsPluginDelegate() {
          ADB.OO.AdobeAnalyticsPluginDelegate = this;
        },
      },
      ah: {
        AdobeHeartbeatPlugin() {
          ADB.OO.AdobeHeartbeatPlugin = this;
          this.configure = function () {
          };
        },
        AdobeHeartbeatPluginConfig(heartbeatTrackingServer, publisherId) {
          this.heartbeatTrackingServer = heartbeatTrackingServer;
          this.publisherId = publisherId;
          ADB.OO.AdobeHeartbeatPluginConfig = this;
        },
        AdobeHeartbeatPluginDelegate() {
          ADB.OO.AdobeHeartbeatPluginDelegate = this;
        },
      },
    },
    Heartbeat() {
      this.configure = function () {
      };
      this.destroy = function () {
      };
    },
    HeartbeatConfig() {
      ADB.OO.HeartbeatConfig = this;
    },
    HeartbeatDelegate() {
    },
  },
};

// used to store global instances of Adobe Plugins
ADB.OO = {};

global.Visitor = function () {
  ADB.OO.Visitor = this;
};

global.AppMeasurement = function () {
  ADB.OO.AppMeasurement = this;
};

AppMeasurement.prototype.clearVars = function () {
  Object.keys(this).forEach((key) => {
    // clearVars deletes the values listed at:
    // https://marketing.adobe.com/resources/help/en_US/sc/implement/function_clearVars.html
    // In this mock, we're only going to delete the eVars and props since we do not make use of the other properties
    if (typeof key === 'string' && this.hasOwnProperty(key)
      && (key.indexOf('eVar') === 0 || key.indexOf('prop') === 0)) {
      delete this[key];
    }
  });
};

global.resetGlobalInstances = function () {
  ADB.OO = {};
};
