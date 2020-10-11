const { DateTime } = require("luxon");

// @docs https://www.11ty.io/docs/config
module.exports = function(config) {
  config.addShortcode("year", dateObj => {
    return DateTime.local().toFormat('yyyy');
	});
	
	config.addShortcode("timestamp", dateObj => {
    return DateTime.local().toFormat('MMddyyyyHHmmSSS');
  });

  config.addLayoutAlias('default', 'default.njk');

  config.addWatchTarget('./src/assets');

  config.addPassthroughCopy('src/robots.txt');
  config.addPassthroughCopy('src/humans.txt');
  config.addPassthroughCopy('src/favicon.ico');
  config.addPassthroughCopy('src/articles');
  config.addPassthroughCopy('src/CNAME');
  config.addPassthroughCopy('src/assets/docs');
	config.addPassthroughCopy('src/assets/css/print.css');
	config.addPassthroughCopy('src/assets/css/site.css');
	config.addPassthroughCopy('src/assets/css/site.css.map');
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
