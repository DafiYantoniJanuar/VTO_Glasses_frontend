import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useAuth } from '../../context/AuthContext'
import Glasses3DViewer from '../../components/3d/Glasses3DViewer'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import './ComparePage.css'

const API_BASE_URL = 'http://localhost:8000/api'

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject()
    document.head.appendChild(script)
  })
}

const DUMMY_PRODUCTS = {
  1: { id: 1, name: 'Classic Aviator', shape: 'Aviator', color: 'Gold/Green', price: 1599000, category: 'Anti-Radiasi', rating: 4.8, reviews: 124, image: heroImg, modelUrl: '/models/kacamata-1.glb', description: 'Timeless aviator design featuring premium metal frames and polarized lenses for ultimate UV protection.', material: 'Titanium & Alloy', lens: 'UV400 Polarized', weight: '24g' },
  2: { id: 2, name: 'Retro Square', shape: 'Square', color: 'Tortoise', price: 1250000, category: 'Anti-Radiasi', rating: 4.6, reviews: 89, image: showcaseImg, modelUrl: '/models/glasses_2.glb', description: 'Bold and intellectual. Retro square frames in classic tortoise shell are perfect for everyday wear.', material: 'Italian Acetate', lens: 'Blue Light Filter', weight: '28g' },
  3: { id: 3, name: 'Minimalist Round', shape: 'Round', color: 'Matte Black', price: 1850000, category: 'Minus', rating: 4.9, reviews: 210, image: heroImg, modelUrl: '/models/eyeglasses_specs.glb', description: 'Ultra-lightweight titanium frames in a modern round silhouette. Engineered for all-day comfort.', material: 'Pure Titanium', lens: 'Prescription Ready', weight: '18g' },
  4: { id: 4, name: 'Geometric Edge', shape: 'Geometric', color: 'Rose Gold', price: 1450000, category: 'Anti-Radiasi', rating: 4.7, reviews: 156, image: showcaseImg, modelUrl: '/models/glasses_4.glb', description: 'Stand out with unique geometric frames. Crafted from durable alloy with a stunning rose gold finish.', material: 'Stainless Steel', lens: 'Photochromic', weight: '22g' },
  5: { id: 5, name: 'Vintage Browline', shape: 'Browline', color: 'Black/Silver', price: 1650000, category: 'Anti-Radiasi', rating: 4.5, reviews: 112, image: showcaseImg, modelUrl: '/models/low_poly_eyeglass.glb', description: 'A mid-century classic reborn. Features acetate upper frames and sleek metal lower rims.', material: 'Acetate + Metal', lens: 'Anti-Reflective', weight: '26g' },
  6: { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Midnight Black', price: 2450000, category: 'Minus', rating: 4.8, reviews: 178, image: heroImg, modelUrl: '/models/titanium_frame_glass.glb', description: "The ultimate in minimal elegance with ultra-thin titanium frame, available with prescription lenses.", material: 'Ultra-light Titanium', lens: 'High Index 1.67', weight: '15g' },
}

const MODEL_CONFIGS = {
  '/models/kacamata-1.glb': { rotationY: 0, scaleMultiplier: 1.20, yOffset: -0.04, zOffset: -0.01 },
  '/models/glasses_2.glb': { rotationY: 0, scaleMultiplier: 1.15, yOffset: -0.04, zOffset: -0.01 },
  '/models/eyeglasses_specs.glb': { rotationY: -Math.PI / 2, scaleMultiplier: 1.10, yOffset: -0.02, zOffset: -0.01 },
  '/models/glasses_4.glb': { rotationY: 0, scaleMultiplier: 1.15, yOffset: -0.04, zOffset: -0.01 },
  '/models/low_poly_eyeglass.glb': { rotationY: Math.PI / 2, scaleMultiplier: 1.10, yOffset: -0.04, zOffset: -0.01 },
  '/models/titanium_frame_glass.glb': { rotationY: 0, scaleMultiplier: 1.20, yOffset: -0.04, zOffset: -0.01 },
  '/models/sunglasses_free.glb': { rotationY: 0, scaleMultiplier: 1.15, yOffset: -0.04, zOffset: -0.01 },
  '/models/eyeglasses_subject_visualization.glb': { rotationY: -Math.PI / 2, scaleMultiplier: 1.10, yOffset: -0.04, zOffset: -0.01 }
}

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

const lerp = (prev, next, alpha) => prev + (next - prev) * alpha

function StarRating({ rating, total }) {
  return (
    <div className="cmp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#C5A880' : 'none'}
          stroke={i <= Math.round(rating) ? '#C5A880' : '#D2C7BC'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="cmp-rating-num">{rating} ({total || 100})</span>
    </div>
  )
}

function ComparePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const initLeft = searchParams.get('left') ? parseInt(searchParams.get('left')) : ''
  const initRight = searchParams.get('right') ? parseInt(searchParams.get('right')) : ''

  const [leftProductId, setLeftProductId] = useState(initLeft)
  const [rightProductId, setRightProductId] = useState(initRight)
  const [previewMode, setPreviewMode] = useState('camera') // 'camera' or '3d'
  const [cameraActive, setCameraActive] = useState(false)
  const [loadingARScripts, setLoadingARScripts] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [apiProducts, setApiProducts] = useState([])

  // Capture Modal State
  const [capturedImageUrl, setCapturedImageUrl] = useState(null)
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Video and Canvas Refs
  const videoRef = useRef(null)
  const leftUIVideoRef = useRef(null)
  const rightUIVideoRef = useRef(null)
  const leftCanvasRef = useRef(null)
  const rightCanvasRef = useRef(null)
  const cameraUtilsRef = useRef(null)
  const faceMeshRef = useRef(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) setApiProducts(json.data)
        }
      } catch { }
    }
    fetchProducts()
  }, [])

  const mergedProducts = { ...DUMMY_PRODUCTS }
  apiProducts.forEach(p => {
    mergedProducts[p.id] = {
      ...(DUMMY_PRODUCTS[p.id] || {}),
      ...p,
      modelUrl: p.model_3d_url || DUMMY_PRODUCTS[p.id]?.modelUrl || '/models/glasses_2.glb',
      image: p.image || DUMMY_PRODUCTS[p.id]?.image,
    }
  })

  const leftProduct = leftProductId ? mergedProducts[leftProductId] : null
  const rightProduct = rightProductId ? mergedProducts[rightProductId] : null
  const allProducts = Object.values(mergedProducts)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // ─── Camera toggle ───
  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraUtilsRef.current) {
        try { cameraUtilsRef.current.stop() } catch { }
        cameraUtilsRef.current = null
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close() } catch { }
        faceMeshRef.current = null
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      if (leftUIVideoRef.current) leftUIVideoRef.current.srcObject = null
      if (rightUIVideoRef.current) rightUIVideoRef.current.srcObject = null
      setCameraActive(false)
      setFaceDetected(false)
    } else {
      setCameraError(null)
      setLoadingARScripts(true)
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
        setLoadingARScripts(false)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        if (leftUIVideoRef.current) {
          leftUIVideoRef.current.srcObject = stream
        }
        if (rightUIVideoRef.current) {
          rightUIVideoRef.current.srcObject = stream
        }
        setCameraActive(true)
      } catch (err) {
        console.error(err)
        setCameraError('Kamera tidak ditemukan, izin ditolak, atau library gagal dimuat.')
        setCameraActive(false)
        setLoadingARScripts(false)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    const videoNode = videoRef.current
    return () => {
      if (cameraUtilsRef.current) {
        try { cameraUtilsRef.current.stop() } catch { }
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close() } catch { }
      }
      if (videoNode && videoNode.srcObject) {
        const tracks = videoNode.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  // ─── DUAL AR RENDERING (One FaceMesh -> 2 Three.js Scenes/Canvases) ───
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !leftCanvasRef.current || !rightCanvasRef.current) return

    let active = true
    const leftCanvas = leftCanvasRef.current
    const rightCanvas = rightCanvasRef.current

    let VIDEO_W = 640
    let VIDEO_H = 480

    leftCanvas.width = VIDEO_W
    leftCanvas.height = VIDEO_H
    rightCanvas.width = VIDEO_W
    rightCanvas.height = VIDEO_H

    // Setup Left Three.js Scene
    const leftScene = new THREE.Scene()
    const leftCamera = new THREE.OrthographicCamera(-VIDEO_W / 2, VIDEO_W / 2, VIDEO_H / 2, -VIDEO_H / 2, 0.1, 2000)
    leftCamera.position.set(0, 0, 1000)
    leftCamera.lookAt(0, 0, 0)
    const leftRenderer = new THREE.WebGLRenderer({ canvas: leftCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
    leftRenderer.setSize(VIDEO_W, VIDEO_H, false)
    leftRenderer.setPixelRatio(1)

    leftScene.add(new THREE.AmbientLight(0xffffff, 2.2))
    const leftMainLight = new THREE.DirectionalLight(0xffffff, 1.8)
    leftMainLight.position.set(0, 200, 300)
    leftScene.add(leftMainLight)

    const leftGlassesGroup = new THREE.Group()
    leftScene.add(leftGlassesGroup)

    // Setup Right Three.js Scene
    const rightScene = new THREE.Scene()
    const rightCamera = new THREE.OrthographicCamera(-VIDEO_W / 2, VIDEO_W / 2, VIDEO_H / 2, -VIDEO_H / 2, 0.1, 2000)
    rightCamera.position.set(0, 0, 1000)
    rightCamera.lookAt(0, 0, 0)
    const rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
    rightRenderer.setSize(VIDEO_W, VIDEO_H, false)
    rightRenderer.setPixelRatio(1)

    rightScene.add(new THREE.AmbientLight(0xffffff, 2.2))
    const rightMainLight = new THREE.DirectionalLight(0xffffff, 1.8)
    rightMainLight.position.set(0, 200, 300)
    rightScene.add(rightMainLight)

    const rightGlassesGroup = new THREE.Group()
    rightScene.add(rightGlassesGroup)

    // Helper to load and prepare 3D model in a group
    const setupModel = (modelUrl, targetGroup) => {
      const loader = new GLTFLoader()
      loader.load(modelUrl, (gltf) => {
        if (!active) return
        const model = gltf.scene
        const box = new THREE.Box3()
        let hasMesh = false
        model.traverse((child) => {
          if (child.isMesh) {
            box.expandByObject(child)
            hasMesh = true
          }
        })
        if (!hasMesh) box.setFromObject(model)

        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        let pivotX = center.x
        let pivotY = center.y
        let pivotZ = center.z

        const config = MODEL_CONFIGS[modelUrl] || { rotationY: 0 }
        if (config.rotationY === 0) {
          pivotZ = box.max.z - (size.z * 0.1)
        } else if (config.rotationY === Math.PI / 2) {
          pivotX = box.max.x - (size.x * 0.1)
        } else if (config.rotationY === -Math.PI / 2) {
          pivotX = box.min.x + (size.x * 0.1)
        }

        model.position.set(-pivotX, -pivotY, -pivotZ)
        const wrapper = new THREE.Group()
        wrapper.add(model)
        if (config.rotationY) {
          wrapper.rotation.y = config.rotationY
        }
        const widthDim = Math.max(size.x, size.z)
        if (widthDim > 0) {
          const s = 1.0 / widthDim
          wrapper.scale.set(s, s, s)
        }

        targetGroup.clear()
        targetGroup.add(wrapper)
        targetGroup.visible = false
      })
    }

    if (leftProduct) setupModel(leftProduct.modelUrl, leftGlassesGroup)
    if (rightProduct) setupModel(rightProduct.modelUrl, rightGlassesGroup)

    // Smoothing states
    const leftSmooth = { posX: null, posY: null, posZ: null, scaleVal: null, rotQuat: null, initialized: false }
    const rightSmooth = { posX: null, posY: null, posZ: null, scaleVal: null, rotQuat: null, initialized: false }
    const SMOOTH_ALPHA = 0.75

    // Initialize MediaPipe FaceMesh
    const faceMesh = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    faceMesh.onResults((results) => {
      if (!active) return
      const video = videoRef.current
      if (!video) return

      const vw = video.videoWidth || 640
      const vh = video.videoHeight || 480

      if (leftCanvas.width !== vw || leftCanvas.height !== vh) {
        VIDEO_W = vw
        VIDEO_H = vh
        leftCanvas.width = vw
        leftCanvas.height = vh
        rightCanvas.width = vw
        rightCanvas.height = vh
        leftRenderer.setSize(vw, vh, false)
        rightRenderer.setSize(vw, vh, false)
        leftCamera.left = -vw / 2; leftCamera.right = vw / 2; leftCamera.top = vh / 2; leftCamera.bottom = -vh / 2
        rightCamera.left = -vw / 2; rightCamera.right = vw / 2; rightCamera.top = vh / 2; rightCamera.bottom = -vh / 2
        leftCamera.updateProjectionMatrix()
        rightCamera.updateProjectionMatrix()
      }

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0]
        const leftEyeOuter = landmarks[33]
        const rightEyeOuter = landmarks[263]
        const forehead = landmarks[10]
        const chin = landmarks[152]
        const leftTemple = landmarks[127]
        const rightTemple = landmarks[356]

        if (leftEyeOuter && rightEyeOuter && forehead && chin && leftTemple && rightTemple) {
          setFaceDetected(true)
          leftGlassesGroup.visible = true
          rightGlassesGroup.visible = true

          const get3DPoint = (lm) => {
            return new THREE.Vector3(
              (lm.x - 0.5) * VIDEO_W,
              (0.5 - lm.y) * VIDEO_H,
              -lm.z * VIDEO_W
            )
          }

          const pLeftTemple = get3DPoint(leftTemple)
          const pRightTemple = get3DPoint(rightTemple)
          const pLeftEye = get3DPoint(leftEyeOuter)
          const pRightEye = get3DPoint(rightEyeOuter)
          const pForehead = get3DPoint(forehead)
          const pChin = get3DPoint(chin)

          const pEyeMidpoint = new THREE.Vector3().addVectors(pRightEye, pLeftEye).multiplyScalar(0.5)
          const rawPosX = pEyeMidpoint.x
          const rawPosY = pEyeMidpoint.y
          const rawPosZ = pEyeMidpoint.z
          const faceWidth = pLeftTemple.distanceTo(pRightTemple)

          let vX = new THREE.Vector3().subVectors(pLeftEye, pRightEye).normalize()
          if (vX.x < 0) vX.negate()
          let vYRaw = new THREE.Vector3().subVectors(pForehead, pChin).normalize()
          if (vYRaw.y < 0) vYRaw.negate()
          const vZ = new THREE.Vector3().crossVectors(vX, vYRaw).normalize()
          const vY = new THREE.Vector3().crossVectors(vZ, vX).normalize()

          const rotMatrix = new THREE.Matrix4().makeBasis(vX, vY, vZ)
          const rawQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix)

          // Update Left Panel Model Transform
          if (leftProduct) {
            const leftConfig = MODEL_CONFIGS[leftProduct.modelUrl] || { scaleMultiplier: 1.15, yOffset: -0.04, zOffset: 0.05 }
            const leftRawScale = faceWidth * (leftConfig.scaleMultiplier || 1.15)

            if (!leftSmooth.initialized) {
              leftSmooth.posX = rawPosX; leftSmooth.posY = rawPosY; leftSmooth.posZ = rawPosZ
              leftSmooth.scaleVal = leftRawScale; leftSmooth.rotQuat = rawQuat.clone(); leftSmooth.initialized = true
            } else {
              leftSmooth.posX = lerp(leftSmooth.posX, rawPosX, SMOOTH_ALPHA)
              leftSmooth.posY = lerp(leftSmooth.posY, rawPosY, SMOOTH_ALPHA)
              leftSmooth.posZ = lerp(leftSmooth.posZ, rawPosZ, SMOOTH_ALPHA)
              leftSmooth.scaleVal = lerp(leftSmooth.scaleVal, leftRawScale, SMOOTH_ALPHA)
              leftSmooth.rotQuat.slerp(rawQuat, SMOOTH_ALPHA)
            }

            leftGlassesGroup.position.set(leftSmooth.posX, leftSmooth.posY, leftSmooth.posZ)
            leftGlassesGroup.scale.setScalar(leftSmooth.scaleVal)
            leftGlassesGroup.quaternion.copy(leftSmooth.rotQuat)
            const leftYOffset = (leftConfig.yOffset ?? -0.04) * leftSmooth.scaleVal
            const leftZOffset = (leftConfig.zOffset ?? 0.05) * leftSmooth.scaleVal
            leftGlassesGroup.position.add(vY.clone().multiplyScalar(leftYOffset)).add(vZ.clone().multiplyScalar(leftZOffset))
          }

          // Update Right Panel Model Transform
          if (rightProduct) {
            const rightConfig = MODEL_CONFIGS[rightProduct.modelUrl] || { scaleMultiplier: 1.15, yOffset: -0.04, zOffset: 0.05 }
            const rightRawScale = faceWidth * (rightConfig.scaleMultiplier || 1.15)

            if (!rightSmooth.initialized) {
              rightSmooth.posX = rawPosX; rightSmooth.posY = rawPosY; rightSmooth.posZ = rawPosZ
              rightSmooth.scaleVal = rightRawScale; rightSmooth.rotQuat = rawQuat.clone(); rightSmooth.initialized = true
            } else {
              rightSmooth.posX = lerp(rightSmooth.posX, rawPosX, SMOOTH_ALPHA)
              rightSmooth.posY = lerp(rightSmooth.posY, rawPosY, SMOOTH_ALPHA)
              rightSmooth.posZ = lerp(rightSmooth.posZ, rawPosZ, SMOOTH_ALPHA)
              rightSmooth.scaleVal = lerp(rightSmooth.scaleVal, rightRawScale, SMOOTH_ALPHA)
              rightSmooth.rotQuat.slerp(rawQuat, SMOOTH_ALPHA)
            }

            rightGlassesGroup.position.set(rightSmooth.posX, rightSmooth.posY, rightSmooth.posZ)
            rightGlassesGroup.scale.setScalar(rightSmooth.scaleVal)
            rightGlassesGroup.quaternion.copy(rightSmooth.rotQuat)
            const rightYOffset = (rightConfig.yOffset ?? -0.04) * rightSmooth.scaleVal
            const rightZOffset = (rightConfig.zOffset ?? 0.05) * rightSmooth.scaleVal
            rightGlassesGroup.position.add(vY.clone().multiplyScalar(rightYOffset)).add(vZ.clone().multiplyScalar(rightZOffset))
          }
        }
      } else {
        setFaceDetected(false)
        leftGlassesGroup.visible = false
        rightGlassesGroup.visible = false
        leftSmooth.initialized = false
        rightSmooth.initialized = false
      }

      leftRenderer.render(leftScene, leftCamera)
      rightRenderer.render(rightScene, rightCamera)
    })

    const cameraHelper = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (!active) return
        if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          try {
            await faceMesh.send({ image: videoRef.current })
          } catch { }
        }
      },
      width: 1280,
      height: 720
    })
    cameraHelper.start()
    cameraUtilsRef.current = cameraHelper
    faceMeshRef.current = faceMesh

    return () => {
      active = false
      try { faceMesh.close() } catch { }
      leftRenderer.dispose()
      rightRenderer.dispose()
    }
  }, [cameraActive, leftProduct?.modelUrl, rightProduct?.modelUrl])

  // ─── CAPTURE SCREENSHOT (Dual Split Screen Composite) ───
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !leftCanvasRef.current || !rightCanvasRef.current) return

    const video = videoRef.current
    const leftCanvas = leftCanvasRef.current
    const rightCanvas = rightCanvasRef.current

    const panelW = 640
    const panelH = 480
    const totalW = panelW * 2
    const totalH = panelH

    const captureCanvas = document.createElement('canvas')
    captureCanvas.width = totalW
    captureCanvas.height = totalH
    const ctx = captureCanvas.getContext('2d')

    // Background
    ctx.fillStyle = '#0E0B0A'
    ctx.fillRect(0, 0, totalW, totalH)

    // Helper to draw a mirrored video+AR panel
    const drawPanel = (canvasOverlay, startX) => {
      ctx.save()
      ctx.translate(startX + panelW, 0)
      ctx.scale(-1, 1)
      if (video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, panelW, panelH)
      }
      if (canvasOverlay) {
        ctx.drawImage(canvasOverlay, 0, 0, panelW, panelH)
      }
      ctx.restore()
    }

    // Draw Left and Right sides
    drawPanel(leftCanvas, 0)
    drawPanel(rightCanvas, panelW)

    // Vertical Divider Line
    ctx.strokeStyle = '#C5A880'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(panelW, 0)
    ctx.lineTo(panelW, totalH)
    ctx.stroke()

    // Bottom Badges for product labels
    ctx.fillStyle = 'rgba(28, 24, 22, 0.85)'
    ctx.fillRect(0, totalH - 44, panelW, 44)
    ctx.fillRect(panelW, totalH - 44, panelW, 44)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 15px Outfit, sans-serif'
    ctx.fillText(`A: ${leftProduct ? leftProduct.name + ' (' + formatPrice(leftProduct.price) + ')' : 'Belum Dipilih'}`, 20, totalH - 17)
    ctx.fillText(`B: ${rightProduct ? rightProduct.name + ' (' + formatPrice(rightProduct.price) + ')' : 'Belum Dipilih'}`, panelW + 20, totalH - 17)

    // Top Header Watermark
    ctx.fillStyle = 'rgba(28, 24, 22, 0.75)'
    ctx.fillRect(totalW / 2 - 130, 12, 260, 32)
    ctx.fillStyle = '#C5A880'
    ctx.font = 'bold 12px Outfit, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VTO GLASSES • SPLIT COMPARISON', totalW / 2, 33)

    const dataUrl = captureCanvas.toDataURL('image/png')
    setCapturedImageUrl(dataUrl)
    setShowCaptureModal(true)
    setShowSharePanel(false)
  }, [leftProduct, rightProduct])

  // ─── Modal Actions ───
  const handleDownload = useCallback(() => {
    if (!capturedImageUrl) return
    const leftName = leftProduct ? leftProduct.name : 'Belum_Dipilih'
    const rightName = rightProduct ? rightProduct.name : 'Belum_Dipilih'
    const link = document.createElement('a')
    link.download = `VTO_Compare_${leftName}_vs_${rightName}_${Date.now()}.png`.replace(/\s+/g, '_')
    link.href = capturedImageUrl
    link.click()
    showToast('Foto perbandingan berhasil didownload!')
  }, [capturedImageUrl, leftProduct?.name, rightProduct?.name])

  const handleShare = useCallback(async () => {
    if (!capturedImageUrl) return
    const leftName = leftProduct ? leftProduct.name : 'Belum Dipilih'
    const rightName = rightProduct ? rightProduct.name : 'Belum Dipilih'
    if (navigator.share) {
      try {
        const res = await fetch(capturedImageUrl)
        const blob = await res.blob()
        const file = new File([blob], `VTO_Compare_${leftName}_vs_${rightName}.png`, { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Perbandingan ${leftName} vs ${rightName} di VTO Glasses`,
            text: `Lihat perbandingan try-on virtual antara ${leftName} dan ${rightName}!`,
            files: [file]
          })
          return
        } else {
          await navigator.share({
            title: `Perbandingan ${leftName} vs ${rightName}`,
            text: `Virtual Try-On kacamata di VTO Glasses: ${leftName} vs ${rightName}.`
          })
          return
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShowSharePanel(true)
        }
        return
      }
    }
    setShowSharePanel(prev => !prev)
  }, [capturedImageUrl, leftProduct?.name, rightProduct?.name])

  const handleCopyImage = useCallback(async () => {
    if (!capturedImageUrl) return
    const leftName = leftProduct ? leftProduct.name : 'Belum Dipilih'
    const rightName = rightProduct ? rightProduct.name : 'Belum Dipilih'
    try {
      const res = await fetch(capturedImageUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2500)
    } catch {
      try {
        await navigator.clipboard.writeText(`Bandingkan ${leftName} dan ${rightName} di VTO Glasses Virtual Try-On!`)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2500)
      } catch { }
    }
  }, [capturedImageUrl, leftProduct?.name, rightProduct?.name])

  const shareToWhatsApp = () => {
    const leftName = leftProduct ? leftProduct.name : 'Belum Dipilih'
    const rightName = rightProduct ? rightProduct.name : 'Belum Dipilih'
    const text = encodeURIComponent(`Bandingkan ${leftName} vs ${rightName} di VTO Glasses AR Try-On! Kacamata mana yang lebih cocok? 🕶️`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareToTwitter = () => {
    const leftName = leftProduct ? leftProduct.name : 'Belum Dipilih'
    const rightName = rightProduct ? rightProduct.name : 'Belum Dipilih'
    const text = encodeURIComponent(`Bandingkan ${leftName} vs ${rightName} via Virtual Try-On! 🕶️ #VTOGlasses #VirtualTryOn`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const closeCaptureModal = () => {
    setShowCaptureModal(false)
    setShowSharePanel(false)
    setCopySuccess(false)
  }

  const handleAddToCart = (product) => {
    if (user?.isGuest) {
      alert('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang belanja.')
      navigate('/login')
      return
    }
    let cart = JSON.parse(localStorage.getItem('vto_cart') || '[]')
    const existingIndex = cart.findIndex(item => item.id === product.id)
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        shape: product.shape,
        color: product.color,
        price: product.price,
        image: product.image || showcaseImg,
        category: product.category,
        qty: 1
      })
    }
    localStorage.setItem('vto_cart', JSON.stringify(cart))
    showToast(`${product.name} ditambahkan ke keranjang!`)
  }

  return (
    <div className="cmp-page-container">
      {/* ─── CAPTURE MODAL ─── */}
      {showCaptureModal && capturedImageUrl && (
        <div className="capture-modal-overlay" onClick={closeCaptureModal}>
          <div className="capture-modal cmp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="capture-modal-header">
              <div className="capture-modal-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Hasil Perbandingan Virtual Try-On</span>
              </div>
              <button className="capture-modal-close" onClick={closeCaptureModal} title="Tutup">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="capture-modal-img-wrap">
              <img src={capturedImageUrl} alt="Perbandingan Try-On" className="capture-modal-img" />
              <div className="capture-modal-product-tag">
                <span>🕶️ {leftProduct ? leftProduct.name : '?'} vs {rightProduct ? rightProduct.name : '?'}</span>
              </div>
            </div>

            <div className="capture-modal-actions">
              <button className="capture-action-btn download" onClick={handleDownload}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>

              <button className="capture-action-btn share" onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>

              <button
                className={`capture-action-btn copy ${copySuccess ? 'success' : ''}`}
                onClick={handleCopyImage}
              >
                {copySuccess ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Tersalin!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {showSharePanel && (
              <div className="capture-share-panel">
                <p className="capture-share-label">Bagikan ke:</p>
                <div className="capture-share-grid">
                  <button className="share-platform-btn whatsapp" onClick={shareToWhatsApp}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>

                  <button className="share-platform-btn twitter" onClick={shareToTwitter}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter / X
                  </button>

                  <button className="share-platform-btn facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toastMessage && (
        <div className="cmp-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden single video element for WebRTC camera stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />

      {/* ─── Top Header & Controls ─── */}
      <div className="cmp-top-bar">
        <div className="cmp-breadcrumb">
          <span onClick={() => navigate('/catalog')} className="cmp-bc-link">Katalog</span>
          {leftProductId ? (
            <>
              <span className="cmp-bc-sep">›</span>
              <span onClick={() => navigate(`/catalog/${leftProductId}`)} className="cmp-bc-link">
                Detail Produk
              </span>
            </>
          ) : null}
          <span className="cmp-bc-sep">›</span>
          <span className="cmp-bc-current">Mode Perbandingan (Split Screen)</span>
        </div>

        <div className="cmp-header-main">
          <div>
            <h1 className="cmp-title">Bandingkan 2 Model Kacamata</h1>
            <p className="cmp-subtitle">Uji coba langsung dua kacamata secara berdampingan di wajah Anda dengan Live AR.</p>
          </div>

          <div className="cmp-header-actions">
            <div className="cmp-mode-switch">
              <button
                className={`cmp-mode-pill ${previewMode === 'camera' ? 'active' : ''}`}
                onClick={() => setPreviewMode('camera')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Live AR Camera
              </button>
              <button
                className={`cmp-mode-pill ${previewMode === '3d' ? 'active' : ''}`}
                onClick={() => setPreviewMode('3d')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                3D Studio View
              </button>
            </div>
          </div>
        </div>

        {previewMode === 'camera' && (
          <div className="cmp-cam-controls-bar">
            <div className="cmp-cam-controls">
              <button
                className={`cmp-cam-toggle-btn ${cameraActive ? 'active' : ''}`}
                onClick={toggleCamera}
                disabled={loadingARScripts}
              >
                {loadingARScripts ? 'Memuat AR...' : cameraActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
              </button>
              {cameraActive && (
                <button className="cmp-cam-capture-btn" onClick={handleCapture} title="Ambil Foto Perbandingan">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Capture Split-Screen
                </button>
              )}
            </div>
          </div>
        )}

        {cameraError && (
          <div className="cmp-error-banner">
            ⚠️ {cameraError}
          </div>
        )}
      </div>

      {/* ─── Split Screen Stage Grid ─── */}
      <div className="cmp-split-grid">
        {/* LEFT PRODUCT PANEL */}
        <div className="cmp-panel left-panel">
          <div className="cmp-panel-header">
            <span className="cmp-panel-tag">PILIHAN A</span>
            <div className="cmp-select-wrapper">
              <select
                value={leftProductId}
                onChange={(e) => setLeftProductId(e.target.value ? Number(e.target.value) : '')}
                className="cmp-product-select"
              >
                <option value="">-- Kosongkan Pilihan A --</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id} disabled={p.id === rightProductId}>
                    {p.name} — {formatPrice(p.price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cmp-viewport-stage">
            {!leftProduct ? (
              <div className="cmp-idle-placeholder">
                <span className="cmp-idle-text" style={{ color: '#7A6F68' }}>SILAKAN PILIH KACAMATA A<br/>DARI DROPDOWN DI ATAS</span>
              </div>
            ) : previewMode === 'camera' ? (
              <div className="cmp-ar-view">
                <span className="pdp-ar-pulse-dot" style={{ backgroundColor: cameraActive ? '#22C55E' : '#C5A880' }} />
                {cameraActive && (
                  <div className={`pdp-face-indicator ${faceDetected ? 'detected' : 'searching'}`}>
                    {faceDetected ? 'Wajah Terdeteksi' : 'Mencari Wajah...'}
                  </div>
                )}
                
                <video
                  ref={leftUIVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="cmp-ar-video"
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />

                {cameraActive && (
                  <canvas ref={leftCanvasRef} className="cmp-ar-canvas-overlay" />
                )}

                {!cameraActive && (
                  <div className="cmp-idle-placeholder">
                    <div className="pdp-tryon-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C1816" strokeWidth="1.8">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <span className="cmp-idle-text">AR FITUR KIRI: {leftProduct.name}</span>
                    <button className="cmp-start-btn" onClick={toggleCamera}>Klik "Aktifkan Kamera"</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="cmp-3d-view">
                <Glasses3DViewer modelUrl={leftProduct.modelUrl} showModelSelector={false} autoRotate={true} autoRotateSpeed={1.0} height="100%" />
              </div>
            )}
          </div>

          {/* Left Product Quick Specs */}
          <div className="cmp-card-info" style={{ minHeight: '140px' }}>
            {leftProduct ? (
              <>
                <div className="cmp-card-title-row">
                  <div>
                    <h3 className="cmp-card-name">{leftProduct.name}</h3>
                    <StarRating rating={leftProduct.rating} total={leftProduct.reviews} />
                  </div>
                  <span className="cmp-card-price">{formatPrice(leftProduct.price)}</span>
                </div>

                <div className="cmp-card-actions">
                  <button className="cmp-btn-cart" onClick={() => handleAddToCart(leftProduct)}>
                    + Keranjang
                  </button>
                  <button className="cmp-btn-detail" onClick={() => navigate(`/catalog/${leftProduct.id}`)}>
                    Detail
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#7A6F68', fontSize: '0.85rem' }}>
                Pilih kacamata A untuk melihat detail
              </div>
            )}
          </div>
        </div>

        {/* VS DIVIDER BADGE */}
        <div className="cmp-vs-center">
          <div className="cmp-vs-line" />
          <div className="cmp-vs-circle">VS</div>
          <div className="cmp-vs-line" />
        </div>

        {/* RIGHT PRODUCT PANEL */}
        <div className="cmp-panel right-panel">
          <div className="cmp-panel-header">
            <span className="cmp-panel-tag right">PILIHAN B</span>
            <div className="cmp-select-wrapper">
              <select
                value={rightProductId}
                onChange={(e) => setRightProductId(e.target.value ? Number(e.target.value) : '')}
                className="cmp-product-select"
              >
                <option value="">-- Kosongkan Pilihan B --</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id} disabled={p.id === leftProductId}>
                    {p.name} — {formatPrice(p.price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cmp-viewport-stage">
            {!rightProduct ? (
              <div className="cmp-idle-placeholder">
                <span className="cmp-idle-text" style={{ color: '#7A6F68' }}>SILAKAN PILIH KACAMATA B<br/>DARI DROPDOWN DI ATAS</span>
              </div>
            ) : previewMode === 'camera' ? (
              <div className="cmp-ar-view">
                <span className="pdp-ar-pulse-dot" style={{ backgroundColor: cameraActive ? '#22C55E' : '#C5A880' }} />
                {cameraActive && (
                  <div className={`pdp-face-indicator ${faceDetected ? 'detected' : 'searching'}`}>
                    {faceDetected ? 'Wajah Terdeteksi' : 'Mencari Wajah...'}
                  </div>
                )}

                <video
                  ref={rightUIVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="cmp-ar-video"
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />

                {cameraActive && (
                  <canvas ref={rightCanvasRef} className="cmp-ar-canvas-overlay" />
                )}

                {!cameraActive && (
                  <div className="cmp-idle-placeholder">
                    <div className="pdp-tryon-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C1816" strokeWidth="1.8">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <span className="cmp-idle-text">AR FITUR KANAN: {rightProduct.name}</span>
                    <button className="cmp-start-btn" onClick={toggleCamera}>Klik "Aktifkan Kamera"</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="cmp-3d-view">
                <Glasses3DViewer modelUrl={rightProduct.modelUrl} showModelSelector={false} autoRotate={true} autoRotateSpeed={1.0} height="100%" />
              </div>
            )}
          </div>

          {/* Right Product Quick Specs */}
          <div className="cmp-card-info" style={{ minHeight: '140px' }}>
            {rightProduct ? (
              <>
                <div className="cmp-card-title-row">
                  <div>
                    <h3 className="cmp-card-name">{rightProduct.name}</h3>
                    <StarRating rating={rightProduct.rating} total={rightProduct.reviews} />
                  </div>
                  <span className="cmp-card-price">{formatPrice(rightProduct.price)}</span>
                </div>

                <div className="cmp-card-actions">
                  <button className="cmp-btn-cart" onClick={() => handleAddToCart(rightProduct)}>
                    + Keranjang
                  </button>
                  <button className="cmp-btn-detail" onClick={() => navigate(`/catalog/${rightProduct.id}`)}>
                    Detail
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#7A6F68', fontSize: '0.85rem' }}>
                Pilih kacamata B untuk melihat detail
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Detailed Comparison Table ─── */}
      <div className="cmp-table-container">
        <h2 className="cmp-table-title">Tabel Perbandingan Spesifikasi</h2>
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th className="cmp-th-spec">Spesifikasi</th>
                <th className="cmp-th-item">{leftProduct ? leftProduct.name : '-'}</th>
                <th className="cmp-th-item">{rightProduct ? rightProduct.name : '-'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cmp-td-label">Harga</td>
                <td className="cmp-td-val highlight">{leftProduct ? formatPrice(leftProduct.price) : '-'}</td>
                <td className="cmp-td-val highlight">{rightProduct ? formatPrice(rightProduct.price) : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Bentuk Frame</td>
                <td className="cmp-td-val">{leftProduct ? leftProduct.shape : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? rightProduct.shape : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Warna Frame</td>
                <td className="cmp-td-val">{leftProduct ? leftProduct.color : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? rightProduct.color : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Kategori</td>
                <td className="cmp-td-val">{leftProduct ? leftProduct.category : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? rightProduct.category : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Material Frame</td>
                <td className="cmp-td-val">{leftProduct ? leftProduct.material || 'Premium Acetate' : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? rightProduct.material || 'Titanium Alloy' : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Perlindungan Lensa</td>
                <td className="cmp-td-val">{leftProduct ? leftProduct.lens || 'UV400 Polarized' : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? rightProduct.lens || 'Blue Light Protection' : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Bobot / Berat</td>
                <td className="cmp-td-val">{leftProduct ? leftProduct.weight || '22g' : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? rightProduct.weight || '20g' : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Rating Pelanggan</td>
                <td className="cmp-td-val">{leftProduct ? `★ ${leftProduct.rating} / 5.0 (${leftProduct.reviews || 120} ulasan)` : '-'}</td>
                <td className="cmp-td-val">{rightProduct ? `★ ${rightProduct.rating} / 5.0 (${rightProduct.reviews || 89} ulasan)` : '-'}</td>
              </tr>
              <tr>
                <td className="cmp-td-label">Deskripsi</td>
                <td className="cmp-td-desc">{leftProduct ? leftProduct.description : '-'}</td>
                <td className="cmp-td-desc">{rightProduct ? rightProduct.description : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ComparePage
