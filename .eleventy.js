const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
    // Copy theese files/directories to output 
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("textures");
    eleventyConfig.addPassthroughCopy("shaders");
    
    // Allows the website to be served to a sub directory.
    // Define the option --pathprefix xxx when building and 
    // use the htmlBaseUrl filter in liquid to transform urls 
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
};