//This file is the shell of a plugin for the analytics framework

var AnalyticsPluginTemplate = function ()
{
  const name = "template";
  const version = "v1";

  this.getName = function ()
  {
    return name;
  };

  this.getVersion = function ()
  {
    return version;
  };

  this.init = function (metadata)
  {

  };

  this.makeActive = function ()
  {

  }

  this.makeInactive = function ()
  {

  }
};

module.exports = AnalyticsPluginTemplate;

if (OO && OO.AnalyticsPluginTemplate && typeof (OO.AnalyticsFramework.registerPlugin) === 'function' )
{
  OO.AnalyticsFramework.registerPlugin(AnalyticsPluginTemplate);
}
