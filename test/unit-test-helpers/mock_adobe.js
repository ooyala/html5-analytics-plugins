ADB = {
  va: {
    plugins: {
      videoplayer: {
        VideoPlayerPlugin: function()
        {
          ADB.OO.VideoPlayerPlugin = this;
          this.configure = function(){};
          this.trackVideoLoad = function()
          {
          };

          this.trackVideoUnload = function()
          {
          };
          this.trackSessionStart = function()
          {
          };
          this.trackPlay = function()
          {
          };
          this.trackPause = function()
          {
          };
          this.trackComplete = function()
          {
          };
          this.trackSeekStart = function()
          {
          };
          this.trackSeekComplete = function()
          {
          };
          this.trackBufferStart = function()
          {
          };
          this.trackBufferComplete = function()
          {
          };

          this.trackAdStart = function()
          {
          };
          this.trackAdComplete = function()
          {
          };

          this.trackChapterStart = function(){};
          this.trackChapterComplete = function(){};

          this.trackBitrateChange = function(){};

          this.trackVideoPlayerError = function(){};
          this.trackApplicationError = function(){};
        },
        VideoPlayerPluginConfig: function()
        {
          ADB.OO.VideoPlayerPluginConfig = this;
        },
        AssetType: {
          
        },
        VideoInfo: function()
        {

        },
        AdBreakInfo: function()
        {

        },
        AdInfo: function()
        {

        },
        ChapterInfo: function()
        {

        },
        QoSInfo: function()
        {

        }
      },
      aa: {
        AdobeAnalyticsPlugin: function()
        {
          ADB.OO.AdobeAnalyticsPlugin = this;
          this.configure = function(){};
        },
        AdobeAnalyticsPluginConfig: function()
        {
          ADB.OO.AdobeAnalyticsPluginConfig = this;
        },
        AdobeAnalyticsPluginDelegate: function()
        {
          ADB.OO.AdobeAnalyticsPluginDelegate = this;
        }
      },
      ah: {
        AdobeHeartbeatPlugin: function()
        {
          ADB.OO.AdobeHeartbeatPlugin = this;
          this.configure = function(){};
        },
        AdobeHeartbeatPluginConfig: function(heartbeatTrackingServer, publisherId)
        {
          this.heartbeatTrackingServer = heartbeatTrackingServer;
          this.publisherId = publisherId;
          ADB.OO.AdobeHeartbeatPluginConfig = this;
        },
        AdobeHeartbeatPluginDelegate: function()
        {
          ADB.OO.AdobeHeartbeatPluginDelegate = this;
        }
      }
    },
    Heartbeat: function()
    {
      this.configure = function(){};
      this.destroy = function(){};
    },
    HeartbeatConfig: function()
    {
      ADB.OO.HeartbeatConfig = this;
    },
    HeartbeatDelegate: function(){}
  }
};

//used to store global instances of Adobe Plugins
ADB.OO = {

};

Visitor = function()
{
  ADB.OO.Visitor = this;
};

AppMeasurement = function()
{
  ADB.OO.AppMeasurement = this;
};

resetGlobalInstances = function()
{
  ADB.OO = {};
};

