const { DateTime } = require("luxon");

// docs: https://www.11ty.io/docs/config/
module.exports = function(config) {
  config.addShortcode("year", dateObj => {
    return DateTime.local().toFormat('yyyy');
  });

  config.addLayoutAlias('default', 'default.njk');

  config.addWatchTarget('./src/assets');
  config.addWatchTarget('./src/assets/css/src');

  config.addPassthroughCopy('src/robots.txt');
  config.addPassthroughCopy('src/humans.txt');
  config.addPassthroughCopy('src/favicon.ico');
  config.addPassthroughCopy('src/articles');
  config.addPassthroughCopy('src/CNAME');
  config.addPassthroughCopy('src/assets/docs');
  config.addPassthroughCopy('src/assets/css');
  config.addPassthroughCopy('src/assets/images');
  config.addPassthroughCopy('src/assets/fonts');

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "layouts",
      data: "data"
    },
    templateFormats: ['njk', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};