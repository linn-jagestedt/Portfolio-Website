module.exports = function(eleventyConfig) {
    // Copy theese files/directories to output 
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("textures");
    eleventyConfig.addPassthroughCopy("shaders");
};