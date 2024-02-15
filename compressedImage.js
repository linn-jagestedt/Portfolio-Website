import * as THREE from 'three';

export default async function loadCompressedImage(texture, resolution, scene) 
{
    const geometry = new THREE.PlaneGeometry(2 * (resolution.x / resolution.y), 2);

    const fShader = await (await fetch('shaders/color_compression.frag')).text();
    const vShader = await (await fetch('shaders/color_compression.vert')).text();

    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    const uniforms = THREE.UniformsUtils.merge([{
        colorTexture : { value : texture },
        texSize : { value : resolution },
        rgbScale : { value : new THREE.Vector3(1, 1, 1) }
    }]);

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vShader.trim(),
        fragmentShader: fShader.trim(),
        glslVersion: THREE.GLSL3
    });

    const image = new THREE.Mesh(geometry, material);
    image.position.x = resolution.x / resolution.y;
    scene.add(image);

    const r_scale = document.getElementById('r_scale');
    const g_scale = document.getElementById('g_scale');
    const b_scale = document.getElementById('b_scale');

    const r_label = document.getElementById('r_label');
    const g_label = document.getElementById('g_label');
    const b_label = document.getElementById('b_label');
    
    const reduced_file_size = document.getElementById('reduced_file_size');

    document.getElementById('file_size').innerText = Math.round(resolution.x * resolution.y * 3) / 1000;
    updateSliders();

    r_scale.oninput = updateSliders;
    g_scale.oninput = updateSliders;
    b_scale.oninput = updateSliders;

    function updateSliders() {
        image.material.uniforms.rgbScale.value.set(r_scale.value / 100, g_scale.value / 100, b_scale.value / 100.0);
        reduced_file_size.innerText = calculateSize();
        
        r_label.innerText = r_scale.value / 100;
        g_label.innerText = g_scale.value / 100;
        b_label.innerText = b_scale.value / 100;
    }

    function calculateSize() {
        return Math.round(resolution.x * resolution.y * (r_scale.value / 100 + g_scale.value / 100 + b_scale.value / 100)) / 1000;
    }    
}