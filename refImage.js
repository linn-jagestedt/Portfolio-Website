import * as THREE from 'three';

export default async function loadRefImage(texture, resolution, scene) 
{
    const geometry = new THREE.PlaneGeometry(2 * (resolution.x / resolution.y), 2);

    const fShader = await (await fetch('shaders/simple.frag')).text();
    const vShader = await (await fetch('shaders/simple.vert')).text();

    const uniforms = THREE.UniformsUtils.merge([{
        colorTexture : { value : texture },
    }]);

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vShader.trim(),
        fragmentShader: fShader.trim()
    });

    const image = new THREE.Mesh(geometry, material);
    image.position.x = -resolution.x / resolution.y;
    scene.add(image);
}