import { renderToStaticMarkup } from "react-dom/server";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import "tsx/esm";

export default function(eleventyConfig) {
    // Copy theese files/directories to output 
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("textures");
    eleventyConfig.addPassthroughCopy("shaders");

    eleventyConfig.addExtension(["11ty.jsx", "11ty.ts", "11ty.tsx"], {
        key: "11ty.js",
		compile: function () {
			return async function (data) {
				let content = await this.defaultRenderer(data);
				return renderToStaticMarkup(content);
			};
		},
    });

    eleventyConfig.addTemplateFormats("11ty.ts,11ty.tsx");

    // Allows the website to be served to a sub directory.
    // Define the option --pathprefix xxx when building and 
    // use the htmlBaseUrl filter in liquid to transform urls 
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
};