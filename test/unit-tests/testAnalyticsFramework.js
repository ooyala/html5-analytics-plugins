describe('analytics framework unit tests', function()
{
  jest.dontMock("../unit-test-helpers/test_env.js");
  require("../unit-test-helpers/test_env.js");

  jest.dontMock(SRC_ROOT + "framework/AnalyticsFramework.js");
  var OoyalaAnalyticsFramework = require(SRC_ROOT + "framework/AnalyticsFramework.js");

  jest.dontMock(TEST_ROOT + "unit-test-helpers/message_bus_helper.js");
  require(TEST_ROOT + "unit-test-helpers/message_bus_helper.js");

  var framework;

  var initialSetup = function()
  {
    framework = new OoyalaAnalyticsFramework();
  };

  var finalCleanup = function()
  {

  };

  var testSetup = function()
  {

  };

  var testCleanup = function()
  {

  };

  initialSetup();
  beforeEach(testSetup);
  afterEach(testCleanup);

  // TESTS
  it('Test registration', function()
  {

    expect(framework).toBeDefined();
  });

  finalCleanup();

});
