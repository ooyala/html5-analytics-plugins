//This file is the shell of a plugin for the analytics framework

var AnalyticsPluginTemplate = function ()
{
  const name = "template";
  const version = "v1";
  var id;

  this.getName = function ()
  {
    return name;
  };

  this.getVersion = function ()
  {
    return version;
  };

  this.setPluginID = function(newID)
  {
    id = newID;
  }

  this.getPluginID = function()
  {
    return id;
  }

  this.init = function (metadata)
  {

  };

  this.makeActive = function ()
  {

  }

  this.makeInactive = function ()
  {

  }

  this.processEvent = function(msgName, params)
  {
    
  }

  this.processRecordedEvents = function (recordedEvents)
  {

  }

  this.destroy = function ()
  {

  }
};

module.exports = AnalyticsPluginTemplate;

if (OO && OO.AnalyticsPluginTemplate && typeof (OO.AnalyticsFramework.registerPlugin) === 'function' )
{
  OO.AnalyticsFramework.registerPlugin(AnalyticsPluginTemplate);
}
