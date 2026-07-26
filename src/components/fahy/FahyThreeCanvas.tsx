import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FahyEvolution, EVOLUTION_IMAGES } from "./PixelFahy";
import { EVOLUTION_SPECS } from "./fahyEvolutionConfig";

interface FahyThreeCanvasProps {
  evolution: FahyEvolution;
  size?: number;
  rotY?: number;
  rotX?: number;
  isDragging?: boolean;
  equipped?: {
    head?: string;
    face?: string;
    body?: string;
    hand?: string;
    companion?: string;
  };
  className?: string;
}

export function FahyThreeCanvas({
  evolution,
  size = 220,
  rotY = 0,
  rotX = -10,
  isDragging = false,
  className = "",
}: FahyThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stageGroupRef = useRef<THREE.Group | null>(null);
  const characterMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);

  const spec = EVOLUTION_SPECS[evolution] || EVOLUTION_SPECS.sprout;

  // Setup WebGL Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = size * 1.4;
    const height = size * 1.5;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 0.8);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    const spotlight = new THREE.SpotLight(0xa7f3d0, 1.5, 10, Math.PI / 4, 0.5);
    spotlight.position.set(0, 4, 2);
    spotlight.target.position.set(0, 0, 0);
    scene.add(spotlight);
    scene.add(spotlight.target);

    // 5. Stage Platform Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);
    stageGroupRef.current = stageGroup;

    // Pedestal Cylinder Base
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.25, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.3,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.85;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    // Pedestal Ring Trim (Gold / Jade)
    const ringGeo = new THREE.TorusGeometry(1.22, 0.035, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.73;
    stageGroup.add(ring);

    // Dynamic Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(2.2, 2.2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.72;
    shadowPlane.receiveShadow = true;
    stageGroup.add(shadowPlane);

    // 6. Floating 3D Particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 3.5;
      posArray[i + 1] = Math.random() * 2.5 - 0.5;
      posArray[i + 2] = (Math.random() - 0.5) * 3.5;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    stageGroup.add(particles);
    particlesMeshRef.current = particles;

    // 7. Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating bobbing motion
      if (characterMeshRef.current) {
        characterMeshRef.current.position.y =
          Math.sin(elapsedTime * 2) * 0.08 + 0.15;
      }

      // Rotate particles
      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.y = elapsedTime * 0.15;
      }

      renderer.render(scene, camera);
    };
    animate();

    const currentContainer = containerRef.current;

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && currentContainer) {
        currentContainer.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  // Update Character Texture on Evolution Change
  useEffect(() => {
    if (!stageGroupRef.current) return;

    const imgSrc = EVOLUTION_IMAGES[evolution];
    const loader = new THREE.TextureLoader();

    loader.load(imgSrc, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      if (characterMeshRef.current) {
        stageGroupRef.current?.remove(characterMeshRef.current);
      }

      const planeWidth = 2.2 * spec.baseScale;
      const planeHeight = 2.2 * spec.baseScale;
      const geo = new THREE.PlaneGeometry(planeWidth, planeHeight);

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0.15, 0);
      mesh.castShadow = true;
      characterMeshRef.current = mesh;

      stageGroupRef.current?.add(mesh);
    });
  }, [evolution, spec.baseScale]);

  // Apply Orbit Rotation (RotX / RotY) from Dragging
  useEffect(() => {
    if (stageGroupRef.current) {
      stageGroupRef.current.rotation.y = THREE.MathUtils.degToRad(rotY);
      stageGroupRef.current.rotation.x = THREE.MathUtils.degToRad(rotX * 0.5);
    }
  }, [rotY, rotX]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size * 1.4,
        height: size * 1.5,
      }}
    />
  );
}
