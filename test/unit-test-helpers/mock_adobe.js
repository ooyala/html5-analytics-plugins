ADB = {
  va: {
    plugins: {
      videoplayer: {
        VideoPlayerPlugin: function()
        {
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
          this.configure = function(){};
        },
        AdobeAnalyticsPluginConfig: function(){},
        AdobeAnalyticsPluginDelegate: function(){}
      },
      ah: {
        AdobeHeartbeatPlugin: function()
        {
          this.configure = function(){};
        },
        AdobeHeartbeatPluginConfig: function(){},
        AdobeHeartbeatPluginDelegate: function(){}
      }
    },
    Heartbeat: function()
    {
      this.configure = function(){};
      this.destroy = function(){};
    },
    HeartbeatConfig: function(){},
    HeartbeatDelegate: function(){}
  }
};

//used to store global instances of AppMeasurement
ADB.OO = {

};

Visitor = function()
{

};

AppMeasurement = function()
{
  ADB.OO.AppMeasurement = this;
};

