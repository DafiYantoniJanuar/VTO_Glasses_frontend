import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './Glasses3DViewer.css'

const MODEL_CACHE = new Map()

function Glasses3DViewer({ 
  modelUrl = '/models/kacamata-1.glb',
  height = '300px',
  modelScale = 4.2,
  autoRotateSpeed = 1.0,
  transparentBg = true
}) {
  const mountRef = useRef(null)
  const [loading, setLoading] = useState(!MODEL_CACHE.has(modelUrl))
  const controlsRef = useRef(null)
  const glassesGroupRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 360
    const heightPx = container.clientHeight || 300

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 1000)
    camera.position.set(0, 0.1, 4.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.minDistance = 2.0
    controls.maxDistance = 10
    controls.autoRotate = true
    controls.autoRotateSpeed = autoRotateSpeed
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0)
    mainLight.position.set(4, 6, 6)
    scene.add(mainLight)

    const warmFillLight = new THREE.DirectionalLight(0xe8d5c4, 1.4)
    warmFillLight.position.set(-5, -2, -3)
    scene.add(warmFillLight)

    const rimLight = new THREE.PointLight(0xffffff, 2.0, 10)
    rimLight.position.set(0, 4, -4)
    scene.add(rimLight)

    const glassesGroup = new THREE.Group()
    glassesGroupRef.current = glassesGroup
    scene.add(glassesGroup)

    const applyScaling = (model) => {
      // Reset position/scale first
      model.position.set(0, 0, 0)
      model.scale.set(1, 1, 1)

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) {
        const calculatedScale = modelScale / maxDim
        model.scale.set(calculatedScale, calculatedScale, calculatedScale)
      }

      // Center the model's scaled bounding box at exactly (0, 0, 0)
      const boxScaled = new THREE.Box3().setFromObject(model)
      const centerScaled = boxScaled.getCenter(new THREE.Vector3())
      
      model.position.x = -centerScaled.x
      model.position.y = -centerScaled.y
      model.position.z = -centerScaled.z
    }

    if (MODEL_CACHE.has(modelUrl)) {
      const cachedScene = MODEL_CACHE.get(modelUrl).clone()
      applyScaling(cachedScene)
      glassesGroup.add(cachedScene)
      setLoading(false)
    } else {
      setLoading(true)
      const loader = new GLTFLoader()
      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene
          applyScaling(model)
          MODEL_CACHE.set(modelUrl, model)
          glassesGroup.add(model.clone())
          setLoading(false)
        },
        undefined,
        () => {
          createProceduralFallback(glassesGroup)
          setLoading(false)
        }
      )
    }

    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [modelUrl, modelScale, autoRotateSpeed])

  function createProceduralFallback(group) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xC5A880, metalness: 0.85, roughness: 0.2 })
    const rimGeo = new THREE.TorusGeometry(1.2, 0.08, 24, 48)
    const leftRim = new THREE.Mesh(rimGeo, frameMat)
    leftRim.position.set(-1.2, 0, 0)
    group.add(leftRim)

    const rightRim = new THREE.Mesh(rimGeo, frameMat)
    rightRim.position.set(1.2, 0, 0)
    group.add(rightRim)
  }

  return (
    <div className={`vto-3d-stage-container ${transparentBg ? 'transparent-mode' : ''}`} style={{ height }}>
      {loading && (
        <div className="vto-3d-loader">
          <div className="vto-3d-spinner" />
          <span>Loading 3D Frame...</span>
        </div>
      )}
      <div ref={mountRef} className="vto-3d-canvas-viewport" />
    </div>
  )
}

export default Glasses3DViewer
