import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function(eleventyConfig) {
    // Copy theese files/directories to output 
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("shaders");
    eleventyConfig.addPassthroughCopy("textures");  

    // Allows the website to be served to a sub directory.
    // Define the option --pathprefix xxx when building and 
    // use the htmlBaseUrl filter in liquid to transform urls 
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
};