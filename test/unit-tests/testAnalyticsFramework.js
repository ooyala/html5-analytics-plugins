describe('Analytics Framework Unit Tests', function()
{
  jest.dontMock("../unit-test-helpers/test_env.js");
  require("../unit-test-helpers/test_env.js");

  jest.dontMock(SRC_ROOT + "framework/AnalyticsFramework.js");
  var OoyalaAnalyticsFramework = require(SRC_ROOT + "framework/AnalyticsFramework.js");

  jest.dontMock(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
//  require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");

  jest.dontMock(TEST_ROOT + "unit-test-helpers/message_bus_helper.js");
  require(TEST_ROOT + "unit-test-helpers/message_bus_helper.js");

  var framework;

  //setup for all tests
  var initialSetup = function()
  {
  };

  //cleanup after all tests
  var finalCleanup = function()
  {

  };

  //setup for individual tests
  var testSetup = function()
  {
    framework = new OoyalaAnalyticsFramework();
  };

  //cleanup for individual tests
  var testCleanup = function()
  {

  };

  initialSetup();
  beforeEach(testSetup);
  afterEach(testCleanup);


  describe("Test Plugin Validator", function()
  {
    var createValidPluginFactory = function()
    {
      return function ()
      {
        var myPlugin = {};
        for (i = 0; i < framework.REQUIRED_FUNCTIONS.length; i++)
        {
          myPlugin[framework.REQUIRED_FUNCTIONS[i]] = function() {};
        }

        //get name and version need to return a truthy string
        myPlugin.getName = function()
        {
          return "testName";
        };

        myPlugin.getVersion = function()
        {
          return "testVersion";
        };

        return myPlugin;
      }
    };

    var createMissingFunctionFactory = function(functionToRemove)
    {
      return OO._.bind(function()
      {
        var validFactory = createValidPluginFactory();
        var badPlugin = new validFactory();
        delete badPlugin[functionToRemove];
        return badPlugin;
      },this);
    };

    var createExtraFunctionFactory = function(functionToAdd)
    {
      return OO._.bind(function()
      {
        var validFactory = createValidPluginFactory();
        var extraFuncFactory = new validFactory();
        extraFuncFactory[functionToAdd] = function() {};
        return extraFuncFactory;
      },this);
    };

    it('Test Undefined Factory', function()
    {
      var badPluginFactory;
      expect(framework.validatePluginFactory(badPluginFactory)).toBe(false);
    });

    it('Test Null Factory', function()
    {
      var nullPluginFactory = null;
      expect(framework.validatePluginFactory(nullPluginFactory)).toBe(false);
    });

    it('Test Object as Factory', function()
    {
      var emptyObjectPluginFactory = {};
      expect(framework.validatePluginFactory(emptyObjectPluginFactory)).toBe(false);
    });

    it('Test Factory Returning Null', function()
    {
      var badEmptyPluginFactory = function() {};
      expect(framework.validatePluginFactory(badEmptyPluginFactory)).toBe(false);
    });

    it('Test Factory Returns Plugin With Missing Required Function', function()
    {
      var i;
      for (i = 0; i < framework.REQUIRED_FUNCTIONS.length; i++ )
      {
        var missingFunctionFactory = createMissingFunctionFactory(framework.REQUIRED_FUNCTIONS[i]);
        expect(framework.validatePluginFactory(missingFunctionFactory)).toBe(false);
      }
    });


    it('Test Factory Returns Plugin With More Than Just Required Function', function()
    {
      var extraFunctionFactory = createExtraFunctionFactory("something");
      var extraFunctionFactory2 = createExtraFunctionFactory("somethingMore");
      expect(framework.validatePluginFactory(extraFunctionFactory)).toBe(true);
      expect(framework.validatePluginFactory(extraFunctionFactory2)).toBe(true);
    });

    //   var badReturnValuePlugin1 = {};
    //   var badReturnValuePlugin2 = {};
    //
    //   //TODO extra functions or variables are okay
    it('Test Valid Factory', function()
    {
      var goodPluginFactory = createValidPluginFactory();
      expect(framework.validatePluginFactory(goodPluginFactory)).toBe(true);
    });
  });

  it('Test Analytics Template Validity', function()
  {
    var templatePlugin = require(SRC_ROOT + "plugins/AnalyticsPluginTemplate.js");
    expect(templatePlugin).not.toBeNull();
    var isValidPlugin = framework.validatePluginFactory(templatePlugin);
    expect(framework.validatePluginFactory(templatePlugin)).toBe(true);
  });

  it('Test Registering Factory', function()
  {

  });

  finalCleanup();

});
