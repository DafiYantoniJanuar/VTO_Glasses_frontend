import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useAuth } from '../../context/AuthContext'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import Glasses3DViewer from '../../components/3d/Glasses3DViewer'
import ReviewSection from '../../components/review/ReviewSection'
import './ProductDetailPage.css'

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
  1: { id: 1, name: 'Classic Aviator', shape: 'Aviator', color: 'Gold/Green', price: 1599000, category: 'Anti-Radiasi', rating: 4.8, reviews: 124, image: heroImg, modelUrl: '/models/kacamata-1.glb', description: 'Timeless aviator design featuring premium metal frames and polarized lenses for ultimate UV protection.' },
  2: { id: 2, name: 'Retro Square', shape: 'Square', color: 'Tortoise', price: 1250000, category: 'Anti-Radiasi', rating: 4.6, reviews: 89, image: showcaseImg, modelUrl: '/models/glasses_2.glb', description: 'Bold and intellectual. These retro square frames in classic tortoise shell are perfect for everyday wear.' },
  3: { id: 3, name: 'Minimalist Round', shape: 'Round', color: 'Matte Black', price: 1850000, category: 'Minus', rating: 4.9, reviews: 210, image: heroImg, modelUrl: '/models/eyeglasses_specs.glb', description: 'Ultra-lightweight titanium frames in a modern round silhouette. Engineered for all-day comfort.' },
  4: { id: 4, name: 'Geometric Edge', shape: 'Geometric', color: 'Rose Gold', price: 1450000, category: 'Anti-Radiasi', rating: 4.7, reviews: 156, image: showcaseImg, modelUrl: '/models/glasses_4.glb', description: 'Stand out with these unique geometric frames. Crafted from durable alloy with a stunning rose gold finish.' },
  5: { id: 5, name: 'Vintage Browline', shape: 'Browline', color: 'Black/Silver', price: 1650000, category: 'Anti-Radiasi', rating: 4.5, reviews: 112, image: showcaseImg, modelUrl: '/models/low_poly_eyeglass.glb', description: 'A mid-century classic reborn. Features acetate upper frames and sleek metal lower rims.' },
  6: { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Midnight Black', price: 2450000, category: 'Minus', rating: 4.8, reviews: 178, image: heroImg, modelUrl: '/models/titanium_frame_glass.glb', description: 'The ultimate in minimal elegance. Aero Slim\'s ultra-thin titanium frame practically disappears on your face, available with prescription lenses.' },
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

// Temporal smoothing helper — lerp for scalars
const lerp = (prev, next, alpha) => prev + (next - prev) * alpha

function StarRating({ rating, total, onClick }) {
  return (
    <div className="pdp-stars" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} title="Lihat Ulasan Pembeli">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#C5A880' : 'none'}
          stroke={i <= Math.round(rating) ? '#C5A880' : '#D2C7BC'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="pdp-rating-num">{Number(rating || 5.0).toFixed(1)} ({total} ulasan)</span>
    </div>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [previewMode, setPreviewMode] = useState('3d') // '3d' or 'camera'
  const [toastMessage, setToastMessage] = useState(null)

  // Camera State
  const videoRef = useRef(null)
  const arCanvasRef = useRef(null)
  const cameraUtilsRef = useRef(null)
  const faceMeshRef = useRef(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [loadingARScripts, setLoadingARScripts] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)

  // Capture & Share State
  const [capturedImageUrl, setCapturedImageUrl] = useState(null)
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // ─── TRY-ON HISTORY LOGGING LOGIC ───
  const historyLoggedRef = useRef(false)
  const logTryOnHistoryRef = useRef(null)

  const product = DUMMY_PRODUCTS[id] || DUMMY_PRODUCTS[1]

  // Dynamic Rating State synced with ReviewSection
  const [currentRating, setCurrentRating] = useState(product.rating || 4.7)
  const [currentReviewsCount, setCurrentReviewsCount] = useState(product.reviews || 0)

  useEffect(() => {
    setCurrentRating(product.rating || 4.7)
    setCurrentReviewsCount(product.reviews || 0)
  }, [product])

  const scrollToReviews = () => {
    const el = document.getElementById('reviews-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // ─── FAVORITES LOGIC (API + localStorage sync) ───
  const isLoggedIn = user && !user.isGuest && user.token

  // Keep latest logging function in ref to avoid re-triggering camera useEffect
  useEffect(() => {
    logTryOnHistoryRef.current = async () => {
      if (isLoggedIn) {
        try {
          await fetch(`${API_BASE_URL}/history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({ product_id: product.id })
          })
        } catch (e) {
          console.error('Failed to log history on backend:', e)
        }
      }

      // Always store to local storage for guests and offline cache
      let localHist = JSON.parse(localStorage.getItem('vto_history') || '[]')
      localHist = localHist.filter(h => h.productId !== product.id)
      localHist.unshift({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        dateLabel: 'Baru saja'
      })
      if (localHist.length > 20) {
        localHist = localHist.slice(0, 20)
      }
      localStorage.setItem('vto_history', JSON.stringify(localHist))
    }
  }, [product, isLoggedIn, user?.token])

  useEffect(() => {
    const checkFavorite = async () => {
      if (isLoggedIn) {
        try {
          const res = await fetch(`${API_BASE_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${user.token}`, 'Accept': 'application/json' }
          })
          if (res.ok) {
            const json = await res.json()
            const favIds = (json.data || []).map(p => p.id)
            setIsFavorite(favIds.includes(product.id))
            return
          }
        } catch { /* fallback to localStorage */ }
      }
      // Guest or API failed: check localStorage
      const localFavs = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
      setIsFavorite(localFavs.some(p => p.id === product.id))
    }
    checkFavorite()
  }, [product.id, isLoggedIn, user?.token])

  const handleToggleFav = async () => {
    if (isLoggedIn) {
      // Call backend API
      try {
        const res = await fetch(`${API_BASE_URL}/favorites/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ product_id: product.id })
        })
        if (res.ok) {
          const json = await res.json()
          setIsFavorite(json.is_favorited)
          setToastMessage(json.is_favorited ? 'Ditambahkan ke favorit.' : 'Dihapus dari favorit.')
        }
      } catch {
        setToastMessage('Gagal mengubah favorit.')
      }
    } else {
      // Guest: localStorage only
      let localFavs = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
      const exists = localFavs.some(p => p.id === product.id)
      if (exists) {
        localFavs = localFavs.filter(p => p.id !== product.id)
        setIsFavorite(false)
        setToastMessage('Dihapus dari favorit.')
      } else {
        localFavs = [...localFavs, product]
        setIsFavorite(true)
        setToastMessage('Ditambahkan ke favorit.')
      }
      localStorage.setItem('vto_favorites', JSON.stringify(localFavs))
    }
    setTimeout(() => setToastMessage(null), 3000)
  }

  // ─── CAMERA TOGGLE ───
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
      setCameraActive(false)
      setFaceDetected(false)
      historyLoggedRef.current = false
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

  // ─── MEDIAPIPE + THREE.JS AR OVERLAY (REWRITTEN WITH ORTHOGRAPHIC) ───
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !arCanvasRef.current) return

    let active = true
    const canvas = arCanvasRef.current

    let VIDEO_W = 640
    let VIDEO_H = 480

    // Set canvas internal resolution to match video
    canvas.width = VIDEO_W
    canvas.height = VIDEO_H

    const scene = new THREE.Scene()

    // Orthographic Camera mapping directly to pixel space
    // Center of the canvas is (0, 0).
    const camera = new THREE.OrthographicCamera(-VIDEO_W / 2, VIDEO_W / 2, VIDEO_H / 2, -VIDEO_H / 2, 0.1, 2000)
    camera.position.set(0, 0, 1000)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true })

    renderer.setSize(VIDEO_W, VIDEO_H, false)
    renderer.setPixelRatio(1)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8)
    mainLight.position.set(0, 200, 300)
    scene.add(mainLight)

    const glassesGroup = new THREE.Group()
    scene.add(glassesGroup)

    // Load 3D model
    let glassesModel = null
    const loader = new GLTFLoader()
    loader.load(product.modelUrl, (gltf) => {
      if (!active) return
      glassesModel = gltf.scene

      // 1. Compute bounding box BEFORE any rotation
      const box = new THREE.Box3()
      let hasMesh = false
      glassesModel.traverse((child) => {
        if (child.isMesh) {
          box.expandByObject(child)
          hasMesh = true
        }
      })

      if (!hasMesh) {
        box.setFromObject(glassesModel)
      }

      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      // Determine the precise NOSE BRIDGE location to use as the pivot point
      let pivotX = center.x
      let pivotY = center.y
      let pivotZ = center.z

      const config = MODEL_CONFIGS[product.modelUrl] || { rotationY: 0 }
      
      // Glasses models have temples that push the geometric center far back.
      // We must pivot exactly at the front frame (nose bridge) to prevent drifting when turning the head!
      if (config.rotationY === 0) {
        // Faces +Z. Front is max Z
        pivotZ = box.max.z - (size.z * 0.1) // 10% behind the absolute front
      } else if (config.rotationY === Math.PI / 2) {
        // Faces +X. Front is max X
        pivotX = box.max.x - (size.x * 0.1)
      } else if (config.rotationY === -Math.PI / 2) {
        // Faces -X. Front is min X
        pivotX = box.min.x + (size.x * 0.1)
      }

      // 2. Center the geometry to its NOSE BRIDGE pivot
      glassesModel.position.set(-pivotX, -pivotY, -pivotZ)


      // 3. Create a wrapper to handle model-specific rotation
      const wrapper = new THREE.Group()
      wrapper.add(glassesModel)

      // Apply model-specific rotation to ensure it faces forward (along +Z)
      if (config.rotationY) {
        wrapper.rotation.y = config.rotationY
      }

      // Normalize scale so the main width dimension = 1.0 unit
      // Since it could be initially sideways, we use the maximum horizontal dimension
      const widthDim = Math.max(size.x, size.z)
      if (widthDim > 0) {
        const s = 1.0 / widthDim
        wrapper.scale.set(s, s, s)
      }

      glassesGroup.add(wrapper)
      glassesGroup.visible = false
    })

    // ─── Temporal smoothing state ───
    const smoothState = {
      posX: null, posY: null, posZ: null,
      scaleVal: null,
      rotQuat: null,
      initialized: false
    }

    const SMOOTH_POS = 0.75
    const SMOOTH_SCALE = 0.75
    const SMOOTH_ROT = 0.75

    // FaceMesh setup
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

      // Synchronize canvas resolution with actual video resolution
      const vw = video.videoWidth || 640
      const vh = video.videoHeight || 480

      if (canvas.width !== vw || canvas.height !== vh) {
        VIDEO_W = vw
        VIDEO_H = vh
        canvas.width = vw
        canvas.height = vh
        renderer.setSize(vw, vh, false)
        camera.left = -vw / 2
        camera.right = vw / 2
        camera.top = vh / 2
        camera.bottom = -vh / 2
        camera.updateProjectionMatrix()
      }

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0]

        // Key landmarks for alignment
        const noseBridge = landmarks[6] // Center of nose bridge (exactly between the eyes)
        const leftEyeOuter = landmarks[33]
        const rightEyeOuter = landmarks[263]
        const forehead = landmarks[10]
        const chin = landmarks[152]
        const leftTemple = landmarks[127]
        const rightTemple = landmarks[356]

        if (noseBridge && leftEyeOuter && rightEyeOuter && forehead && chin && leftTemple && rightTemple && glassesGroup) {
          setFaceDetected(true)
          glassesGroup.visible = true

          if (!historyLoggedRef.current) {
            historyLoggedRef.current = true
            if (logTryOnHistoryRef.current) {
              logTryOnHistoryRef.current()
            }
          }

          // Helper to map normalized landmark to orthographic 3D pixel coordinate
          const get3DPoint = (lm) => {
            return new THREE.Vector3(
              (lm.x - 0.5) * VIDEO_W,
              (0.5 - lm.y) * VIDEO_H,
              -lm.z * VIDEO_W // depth approximation scaled to match X/Y
            )
          }

          const pLeftTemple = get3DPoint(leftTemple)
          const pRightTemple = get3DPoint(rightTemple)
          const pLeftEye = get3DPoint(leftEyeOuter)
          const pRightEye = get3DPoint(rightEyeOuter)
          const pForehead = get3DPoint(forehead)
          const pChin = get3DPoint(chin)

          // 1. Position: anchored directly at eye level (midpoint between eyes)
          const pEyeMidpoint = new THREE.Vector3().addVectors(pRightEye, pLeftEye).multiplyScalar(0.5)
          // Use direct coordinates (do not invert!)
          const rawPosX = pEyeMidpoint.x
          const rawPosY = pEyeMidpoint.y
          const rawPosZ = pEyeMidpoint.z

          // 2. Sizing: distance between left and right temple landmarks in pixel space
          const faceWidth = pLeftTemple.distanceTo(pRightTemple)
          const config = MODEL_CONFIGS[product.modelUrl] || { scaleMultiplier: 1.15, yOffset: -0.04, zOffset: 0.05 }
          const rawScale = faceWidth * (config.scaleMultiplier || 1.15)
          
          // 3. Rotation: build face coordinate system
          let vX = new THREE.Vector3().subVectors(pLeftEye, pRightEye).normalize()
          // GUARANTEE vX points RIGHT (+X) so glasses are never rendered backwards!
          if (vX.x < 0) vX.negate()

          let vYRaw = new THREE.Vector3().subVectors(pForehead, pChin).normalize()
          // GUARANTEE vYRaw points UP (+Y)
          if (vYRaw.y < 0) vYRaw.negate()

          const vZ = new THREE.Vector3().crossVectors(vX, vYRaw).normalize()
          const vY = new THREE.Vector3().crossVectors(vZ, vX).normalize()

          const rotMatrix = new THREE.Matrix4().makeBasis(vX, vY, vZ)
          const rawQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix)

          // ─── TEMPORAL SMOOTHING ───
          if (!smoothState.initialized) {
            smoothState.posX = rawPosX
            smoothState.posY = rawPosY
            smoothState.posZ = rawPosZ
            smoothState.scaleVal = rawScale
            smoothState.rotQuat = rawQuat.clone()
            smoothState.initialized = true
          } else {
            smoothState.posX = lerp(smoothState.posX, rawPosX, SMOOTH_POS)
            smoothState.posY = lerp(smoothState.posY, rawPosY, SMOOTH_POS)
            smoothState.posZ = lerp(smoothState.posZ, rawPosZ, SMOOTH_POS)
            smoothState.scaleVal = lerp(smoothState.scaleVal, rawScale, SMOOTH_SCALE)
            smoothState.rotQuat.slerp(rawQuat, SMOOTH_ROT)
          }

          // Apply smoothed transform
          glassesGroup.position.set(smoothState.posX, smoothState.posY, smoothState.posZ)
          glassesGroup.scale.setScalar(smoothState.scaleVal)
          glassesGroup.quaternion.copy(smoothState.rotQuat)

          // Apply offset in face-local space:
          // - Shift down slightly so frame sits on nose bridge (y direction)
          // - Shift forward slightly to avoid lens clipping (z direction)
          const verticalOffset = (config.yOffset ?? -0.04) * smoothState.scaleVal
          const depthOffset = (config.zOffset ?? 0.05) * smoothState.scaleVal
          const yOffsetVec = vY.clone().multiplyScalar(verticalOffset)
          const zOffsetVec = vZ.clone().multiplyScalar(depthOffset)
          glassesGroup.position.add(yOffsetVec).add(zOffsetVec)
        }
      } else {
        setFaceDetected(false)
        if (glassesGroup) {
          glassesGroup.visible = false
        }
        smoothState.initialized = false
      }
      renderer.render(scene, camera)
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
      renderer.dispose()
    }
  }, [cameraActive, product.modelUrl])

  // ─── CAPTURE SCREENSHOT → opens modal preview ───
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !arCanvasRef.current) return

    const video = videoRef.current
    const arCanvas = arCanvasRef.current

    // Create offscreen canvas with video dimensions
    const captureCanvas = document.createElement('canvas')
    captureCanvas.width = 640
    captureCanvas.height = 480
    const ctx = captureCanvas.getContext('2d')

    // Draw both video and overlay inside the mirrored matrix so they align perfectly
    ctx.save()
    ctx.translate(captureCanvas.width, 0)
    ctx.scale(-1, 1)

    // Draw mirrored video frame
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)

    // Draw mirrored Three.js AR overlay
    ctx.drawImage(arCanvas, 0, 0, captureCanvas.width, captureCanvas.height)
    ctx.restore()

    // Add watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.font = 'bold 13px Outfit, sans-serif'
    ctx.fillText(`VTO Glasses — ${product.name}`, 16, captureCanvas.height - 16)

    // Store dataURL → open modal (no direct download)
    const dataUrl = captureCanvas.toDataURL('image/png')
    setCapturedImageUrl(dataUrl)
    setShowCaptureModal(true)
    setShowSharePanel(false)
  }, [product.name])

  // ─── DOWNLOAD dari modal ───
  const handleDownload = useCallback(() => {
    if (!capturedImageUrl) return
    const link = document.createElement('a')
    link.download = `VTO_TryOn_${product.name.replace(/\s+/g, '_')}_${Date.now()}.png`
    link.href = capturedImageUrl
    link.click()
    setToastMessage('Screenshot berhasil disimpan!')
    setTimeout(() => setToastMessage(null), 3000)
  }, [capturedImageUrl, product.name])

  // ─── SHARE hasil try-on ───
  const handleShare = useCallback(async () => {
    if (!capturedImageUrl) return

    // Coba Web Share API (native, terutama di mobile)
    if (navigator.share) {
      try {
        // Convert dataURL → Blob → File untuk di-share sebagai file gambar
        const res = await fetch(capturedImageUrl)
        const blob = await res.blob()
        const file = new File([blob], `VTO_${product.name}.png`, { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Coba ${product.name} di VTO Glasses`,
            text: `Lihat bagaimana saya tampil dengan ${product.name}! Virtual Try-On via VTO Glasses.`,
            files: [file]
          })
          return
        } else {
          // Share tanpa file (hanya teks)
          await navigator.share({
            title: `Coba ${product.name} di VTO Glasses`,
            text: `Lihat bagaimana saya tampil dengan ${product.name}! Virtual Try-On via VTO Glasses.`
          })
          return
        }
      } catch (err) {
        // User cancel atau gagal → tampilkan panel manual
        if (err.name !== 'AbortError') {
          setShowSharePanel(true)
        }
        return
      }
    }

    // Fallback: tampilkan share panel manual
    setShowSharePanel(prev => !prev)
  }, [capturedImageUrl, product.name])

  // ─── COPY image ke clipboard ───
  const handleCopyImage = useCallback(async () => {
    if (!capturedImageUrl) return
    try {
      const res = await fetch(capturedImageUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2500)
    } catch {
      // Fallback: copy teks promo
      try {
        await navigator.clipboard.writeText(
          `Coba ${product.name} di VTO Glasses! Virtual Try-On kacamata berbasis AR.`
        )
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2500)
      } catch { /* nothing */ }
    }
  }, [capturedImageUrl, product.name])

  // ─── SHARE ke platform spesifik ───
  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Coba ${product.name} di VTO Glasses! Fitur Virtual Try-On kacamata berbasis AR. Download dulu fotonya di bawah ya 🕶️`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }, [product.name])

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(`Baru coba ${product.name} secara virtual! 🕶️ #VTOGlasses #VirtualTryOn #Kacamata`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }, [product.name])

  const shareToFacebook = useCallback(() => {
    const pageUrl = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, '_blank')
  }, [])

  const closeCaptureModal = useCallback(() => {
    setShowCaptureModal(false)
    setShowSharePanel(false)
    setCopySuccess(false)
  }, [])


  const handleAddToCart = () => {
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
    setToastMessage(`${product.name} ditambahkan ke keranjang!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="pdp-wrapper">
      {/* ─── CAPTURE MODAL ─── */}
      {showCaptureModal && capturedImageUrl && (
        <div className="capture-modal-overlay" onClick={closeCaptureModal}>
          <div className="capture-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="capture-modal-header">
              <div className="capture-modal-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Hasil Foto Try-On</span>
              </div>
              <button className="capture-modal-close" onClick={closeCaptureModal} title="Tutup">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Preview Image */}
            <div className="capture-modal-img-wrap">
              <img src={capturedImageUrl} alt={`Try-On ${product.name}`} className="capture-modal-img" />
              <div className="capture-modal-product-tag">
                <span>🕶️ {product.name}</span>
              </div>
            </div>

            {/* Action Buttons */}
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

            {/* Share Panel (fallback / tambahan) */}
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

                  <button className="share-platform-btn facebook" onClick={shareToFacebook}>
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
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '85px',
          right: '30px',
          backgroundColor: '#1C1816',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '0.84rem',
          fontWeight: '500',
          zIndex: 10000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Grid (Left Info & Right AR Showcase) */}
      <div className="pdp-main-grid">
        {/* Left Column: Image Showcase & Details */}
        <div className="pdp-left">
        {/* Breadcrumb Navigation */}
        <nav className="pdp-breadcrumb">
          <span onClick={() => navigate('/catalog')} className="pdp-bc-link">Catalog</span>
          <span className="pdp-bc-sep">›</span>
          <span onClick={() => navigate('/catalog')} className="pdp-bc-link">{product.category}</span>
          <span className="pdp-bc-sep">›</span>
          <span className="pdp-bc-current">{product.name}</span>
        </nav>

        {/* Product Image Card */}
        <div className="pdp-image-card" style={{ padding: '16px' }}>
          <div className="pdp-img-main" style={{ height: '320px' }}>
            <Glasses3DViewer modelUrl={product.modelUrl} height="320px" modelScale={2.2} />
          </div>
        </div>

        {/* Product Information Card */}
        <div className="pdp-info">
          <div className="pdp-name-row">
            <h1 className="pdp-name">{product.name}</h1>
            <button
              className={`pdp-fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFav}
              title={isFavorite ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={isFavorite ? '#E05C5C' : 'none'}
                stroke={isFavorite ? '#E05C5C' : '#8A7F78'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <StarRating rating={currentRating} total={currentReviewsCount} onClick={scrollToReviews} />
          <p className="pdp-price">{formatPrice(product.price)}</p>
          <p className="pdp-meta">{product.shape} • {product.color} • {product.category}</p>

          {/* Description / Specifications / Reviews Tabs */}
          <div className="pdp-tabs">
            <button
              className={`pdp-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Deskripsi
            </button>
            <button
              className={`pdp-tab ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Spesifikasi
            </button>
            <button
              className="pdp-tab"
              onClick={scrollToReviews}
            >
              Ulasan ({currentReviewsCount})
            </button>
          </div>

          {activeTab === 'description' && (
            <p className="pdp-desc">{product.description}</p>
          )}

          {activeTab === 'specs' && (
            <div className="pdp-specs">
              <div className="pdp-spec-row"><span>Bentuk Frame</span><span>{product.shape}</span></div>
              <div className="pdp-spec-row"><span>Warna</span><span>{product.color}</span></div>
              <div className="pdp-spec-row"><span>Kategori</span><span>{product.category}</span></div>
              <div className="pdp-spec-row"><span>Bahan Material</span><span>Premium Italian Acetate</span></div>
              <div className="pdp-spec-row"><span>Perlindungan Lensa</span><span>UV400 Polarized</span></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pdp-actions">
            <button className="pdp-btn-cart" onClick={handleAddToCart} style={{ width: '100%' }}>
              + Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive 3D Model & Virtual Try-On Stage */}
      <div className="pdp-right">
        <div className="pdp-tryon-placeholder">
          {/* Studio Mode Selector */}
          <div className="pdp-mode-selector">
            <button
              onClick={() => setPreviewMode('3d')}
              className={`pdp-mode-btn ${previewMode === '3d' ? 'active' : ''}`}
            >
              Preview Model 3D
            </button>
            <button
              onClick={() => setPreviewMode('camera')}
              className={`pdp-mode-btn ${previewMode === 'camera' ? 'active' : ''}`}
            >
              Live AR Camera
            </button>
          </div>

          {/* Interactive 3D Preview Mode */}
          {previewMode === '3d' && (
            <Glasses3DViewer modelUrl={product.modelUrl} showModelSelector={false} autoRotate={true} autoRotateSpeed={1.0} />
          )}

          {/* Live Camera AR Mode */}
          {previewMode === 'camera' && (
            <>
              <div className="pdp-ar-preview-stage">
                {/* Status indicators */}
                <span className="pdp-ar-pulse-dot" style={{ backgroundColor: cameraActive ? '#22C55E' : '#C5A880' }} />

                {cameraActive && (
                  <div className={`pdp-face-indicator ${faceDetected ? 'detected' : 'searching'}`}>
                    {faceDetected ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Wajah Terdeteksi</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                        <span>Mencari Wajah...</span>
                      </>
                    )}
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    display: cameraActive ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                  }}
                />

                {cameraActive && (
                  <canvas
                    ref={arCanvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 15,
                      pointerEvents: 'none',
                      transform: 'scaleX(-1)'
                    }}
                  />
                )}

                {loadingARScripts && (
                  <div className="vto-3d-loader">
                    <div className="vto-3d-spinner"></div>
                    <span style={{ fontSize: '0.78rem', color: '#7A6F68', marginTop: '8px' }}>Memuat modul AR...</span>
                  </div>
                )}

                {!cameraActive && !loadingARScripts && (
                  <>
                    <div className="pdp-tryon-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1C1816" strokeWidth="1.8">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1C1816' }}>
                      VIRTUAL FITTING ROOM
                    </span>
                  </>
                )}
              </div>

              <p className="pdp-tryon-hint">
                {cameraError ? cameraError : <>Uji kesesuaian bingkai <b>{product.name}</b> di wajah Anda secara <i>real-time</i>.</>}
              </p>

              {/* Camera action buttons */}
              <div className="pdp-camera-actions">
                <button className="pdp-tryon-cta" onClick={toggleCamera} disabled={loadingARScripts}>
                  {cameraActive ? 'Matikan Kamera' : loadingARScripts ? 'Memuat...' : 'Aktifkan Kamera'}
                </button>

                {cameraActive && (
                  <button className="pdp-capture-btn" onClick={handleCapture} title="Ambil Screenshot">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Capture
                  </button>
                )}
              </div>
            </>
          )}

          {/* Model Switcher Cards */}
          <div className="pdp-model-switcher" style={{ marginTop: '16px' }}>
            <span className="pdp-switch-label">Ganti Model Frame</span>
            <div className="pdp-switch-pills">
              {Object.values(DUMMY_PRODUCTS).map(p => (
                <div
                  key={p.id}
                  className={`pdp-switch-item ${p.id === product.id ? 'active' : ''}`}
                  onClick={() => navigate(`/catalog/${p.id}`)}
                  title={p.name}
                >
                  <img src={p.image} alt={p.name} className="pdp-switch-img" />
                  <span className="pdp-switch-name">{p.name}</span>
                  <span className="pdp-switch-shape">{p.shape}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Full-width Product Reviews Section */}
    <div className="pdp-reviews-container" id="reviews-section">
      <div className="pdp-reviews-divider" />
      <ReviewSection
        productId={product.id}
        productName={product.name}
        onRatingUpdated={(avg, count) => {
          setCurrentRating(avg)
          setCurrentReviewsCount(count)
        }}
      />
    </div>
  </div>
)
}

export default ProductDetailPage
