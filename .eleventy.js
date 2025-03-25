import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import { minify } from 'minify';
import * as sass from "sass";
import { spglslAngleCompile } from "spglsl";

export default function(eleventyConfig) 
{
    // Copy theese files/directories to output 
    eleventyConfig.addPassthroughCopy("textures");  
    eleventyConfig.addPassthroughCopy("images");  
    eleventyConfig.addPassthroughCopy("fonts");  

    // Allows the website to be served to a sub directory.
    // Define the option --pathprefix xxx when building and 
    // use the htmlBaseUrl filter in liquid to transform urls 
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	eleventyConfig.setTemplateFormats(["html, liquid", "md"]);
	eleventyConfig.addTemplateFormats(["scss", "js"]);

	eleventyConfig.addExtension("js", {
		outputFileExtension: "js",

		compile: async function (inputContent) {
            const result = await minify.js(inputContent, {
                "js": {
                    "type": "esbuild",
                        "minify": true,
                        "mangle": false
                }
            });     

			return async (data) => {
                return result;
			};
		},
	});
    
    // Compile SCSS (for use inside liquid files)
	eleventyConfig.addFilter("compileSCSS", function(value) { 
        const result = sass.compileString(value);
        return result.css;
    });

    // Minify css
    eleventyConfig.addFilter("minifyCSS", async function (value) {
        if(value != '') {
            return await minify.css(value);        
        }

        return '';
    });

    eleventyConfig.addFilter("minifyGLSLVERT", async function (value) {
        const result = await spglslAngleCompile({
            compileMode: "Optimize",
            language: "vert",
            beautify: false,
            minify: true,
            mangle: true, 
            mainFilePath: "",
            mainSourceCode: value.trim(), 
        }); 
    
        return result.output;
    });

    eleventyConfig.addFilter("minifyGLSLFRAG", async function (value) {
        const result = await spglslAngleCompile({
            compileMode: "Optimize",
            language: "frag",
            beautify: false,
            minify: true,
            mangle: true, 
            mainFilePath: "",
            mainSourceCode: value.trim(), 
        }); 
    
        return result.output;
    });

    // Minify html
    eleventyConfig.addTransform("minifyHTML", async function (content) {
        if ((this.page.outputPath || "").endsWith(".html")) {
            //return content;
            return await minify.html(content);        
        }
        
        return content;
    });    
};