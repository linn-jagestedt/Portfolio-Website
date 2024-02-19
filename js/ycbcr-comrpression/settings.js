const nearest_checkbox = document.querySelector('#nearest');
const linear_checkbox = document.querySelector('#linear');

const sliders = document.querySelectorAll('#sliders input');
const sliderLabels = document.querySelectorAll('#sliders label span');

const file_size = document.querySelector('#file_size');
const reduced_file_size = document.querySelector('#reduced_file_size');

file_size.innerText = calculateSize([1, 1, 1]);

function calculateSize(values) {
	return Math.round(512 * 512 * (values[0] + values[1] + values[2]) / 1000);
}    

export { nearest_checkbox, linear_checkbox, sliders, sliderLabels, reduced_file_size }