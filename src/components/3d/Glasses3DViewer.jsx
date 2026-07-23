import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './Glasses3DViewer.css'

const COLOR_PRESETS = [
  { id: 'gold', name: 'Luxury Gold', hex: 0xD4AF37, css: '#D4AF37' },
  { id: 'onyx', name: 'Onyx Black', hex: 0x1C1816, css: '#1C1816' },
  { id: 'tortoise', name: 'Classic Tortoise', hex: 0x8B4513, css: '#8B4513' },
  { id: 'silver', name: 'Sterling Silver', hex: 0xE0E0E0, css: '#E0E0E0' }
]

function Glasses3DViewer({ initialColor = 'gold' }) {
  const mountRef = useRef(null)
  const [activeColor, setActiveColor] = useState(initialColor)
  const [isDragging, setIsDragging] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  const glassesGroupRef = useRef(null)
  const frameMaterialsRef = useRef([])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 360
    const height = container.clientHeight || 280

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 7)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5)
    mainLight.position.set(5, 5, 7)
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0xc5a880, 1.5)
    fillLight.position.set(-5, -2, -3)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(0xffffff, 2, 10)
    rimLight.position.set(0, 3, -4)
    scene.add(rimLight)

    // Group for 3D Glasses
    const glassesGroup = new THREE.Group()
    glassesGroupRef.current = glassesGroup
    scene.add(glassesGroup)

    // Material for Frame
    const selectedPreset = COLOR_PRESETS.find(c => c.id === activeColor) || COLOR_PRESETS[0]
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: selectedPreset.hex,
      metalness: selectedPreset.id === 'onyx' ? 0.2 : 0.85,
      roughness: selectedPreset.id === 'onyx' ? 0.3 : 0.15,
      envMapIntensity: 1.5
    })
    frameMaterialsRef.current = [frameMaterial]

    // Lens Material (Glass effect)
    const lensMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x90b8d4,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      reflectivity: 0.9
    })

    // 1. Left Rim (Torus)
    const rimRadius = 0.95
    const tubeRadius = 0.08
    const rimGeo = new THREE.TorusGeometry(rimRadius, tubeRadius, 24, 48)
    
    const leftRim = new THREE.Mesh(rimGeo, frameMaterial)
    leftRim.position.set(-1.15, 0, 0)
    leftRim.scale.set(1, 0.9, 1)
    glassesGroup.add(leftRim)

    // 2. Right Rim
    const rightRim = new THREE.Mesh(rimGeo, frameMaterial)
    rightRim.position.set(1.15, 0, 0)
    rightRim.scale.set(1, 0.9, 1)
    glassesGroup.add(rightRim)

    // 3. Lenses
    const lensGeo = new THREE.CylinderGeometry(rimRadius - 0.02, rimRadius - 0.02, 0.03, 32)
    lensGeo.rotateX(Math.PI / 2)

    const leftLens = new THREE.Mesh(lensGeo, lensMaterial)
    leftLens.position.set(-1.15, 0, 0)
    leftLens.scale.set(1, 0.88, 1)
    glassesGroup.add(leftLens)

    const rightLens = new THREE.Mesh(lensGeo, lensMaterial)
    rightLens.position.set(1.15, 0, 0)
    rightLens.scale.set(1, 0.88, 1)
    glassesGroup.add(rightLens)

    // 4. Bridge (Connecting Bar)
    const bridgeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16)
    bridgeGeo.rotateZ(Math.PI / 2)
    const bridge = new THREE.Mesh(bridgeGeo, frameMaterial)
    bridge.position.set(0, 0.25, 0)
    glassesGroup.add(bridge)

    // Secondary Bridge Bar
    const subBridge = new THREE.Mesh(bridgeGeo, frameMaterial)
    subBridge.position.set(0, 0.05, 0)
    subBridge.scale.set(0.8, 0.8, 0.8)
    glassesGroup.add(subBridge)

    // 5. Left Temple (Side Arm)
    const templeGeo = new THREE.CylinderGeometry(0.04, 0.03, 2.2, 16)
    templeGeo.rotateX(Math.PI / 2)

    const leftTemple = new THREE.Mesh(templeGeo, frameMaterial)
    leftTemple.position.set(-2.05, 0.1, -1.0)
    leftTemple.rotation.y = -0.12
    glassesGroup.add(leftTemple)

    // 6. Right Temple
    const rightTemple = new THREE.Mesh(templeGeo, frameMaterial)
    rightTemple.position.set(2.05, 0.1, -1.0)
    rightTemple.rotation.y = 0.12
    glassesGroup.add(rightTemple)

    // Initial slight rotation angle for aesthetic showcase
    glassesGroup.rotation.y = 0.35
    glassesGroup.rotation.x = 0.08

    // Drag interaction logic
    let prevMouseX = 0
    let prevMouseY = 0

    const handlePointerDown = (e) => {
      setIsDragging(true)
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0
    }

    const handlePointerMove = (e) => {
      if (!isDragging || !glassesGroupRef.current) return
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0

      const deltaX = clientX - prevMouseX
      const deltaY = clientY - prevMouseY

      glassesGroupRef.current.rotation.y += deltaX * 0.012
      glassesGroupRef.current.rotation.x += deltaY * 0.008

      prevMouseX = clientX
      prevMouseY = clientY
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    const domElement = renderer.domElement
    domElement.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    // Animation Loop
    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (autoRotate && !isDragging && glassesGroupRef.current) {
        glassesGroupRef.current.rotation.y += 0.006
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle Resize
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
      domElement.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [autoRotate, isDragging, activeColor])

  // Update material color when preset changes
  const handleColorChange = (colorId) => {
    setActiveColor(colorId)
    const preset = COLOR_PRESETS.find(c => c.id === colorId)
    if (preset && frameMaterialsRef.current.length > 0) {
      frameMaterialsRef.current.forEach(mat => {
        mat.color.setHex(preset.hex)
        mat.metalness = colorId === 'onyx' ? 0.2 : 0.85
        mat.roughness = colorId === 'onyx' ? 0.3 : 0.15
      })
    }
  }

  return (
    <div className="vto-3d-stage-container">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="vto-3d-canvas-viewport" />

      {/* Floating 3D Control Bar */}
      <div className="vto-3d-controls">
        <div className="vto-3d-badge-chip">
          <span className="live-dot" /> 3D Interactive Model
        </div>

        {/* Frame Color Selector */}
        <div className="vto-color-picker-group">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`color-swatch-btn ${activeColor === preset.id ? 'active' : ''}`}
              style={{ backgroundColor: preset.css }}
              onClick={() => handleColorChange(preset.id)}
              title={preset.name}
            />
          ))}
        </div>

        {/* Auto Rotate Toggle */}
        <button
          className={`btn-rotate-toggle ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? '🔄 Spin ON' : '⏸ Spin OFF'}
        </button>
      </div>

      <div className="vto-3d-hint">
        💡 Drag to rotate 3D frame in any direction
      </div>
    </div>
  )
}

export default Glasses3DViewer
