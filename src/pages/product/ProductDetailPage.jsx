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
  1: { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', rating: 4.7, reviews: 89, image: showcaseImg, modelUrl: '/models/kacamata-1.glb', description: 'A timeless round silhouette crafted from premium Italian acetate. The Cambridge offers UV400 protection and ultra-lightweight comfort — perfect for everyday wear.' },
  2: { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', rating: 4.6, reviews: 120, image: heroImg, modelUrl: '/models/glasses_2.glb', description: 'Timeless design meets modern engineering. The Architect features aerospace-grade titanium frames and polarized lenses for uncompromising style and clarity.' },
  3: { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', rating: 4.9, reviews: 210, image: showcaseImg, modelUrl: '/models/eyeglasses_specs.glb', description: 'Bold, iconic, unmistakable. The Maverick aviator features a classic teardrop silhouette with a lustrous gold frame and premium gradient lenses.' },
  4: { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear Crystal', price: 2235000, category: 'Blue Light', rating: 4.5, reviews: 65, image: heroImg, modelUrl: '/models/glasses_4.glb', description: 'Barely-there sophistication. The Ghost features ultra-clear acetate for an almost invisible look that lets your face take center stage, with blue light blocking.' },
  5: { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading Glasses', rating: 4.4, reviews: 44, image: showcaseImg, modelUrl: '/models/low_poly_eyeglass.glb', description: 'Refined and scholarly, the Classic Scholar combines a vintage-inspired round silhouette with modern lightweight materials for all-day reading comfort.' },
  6: { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Midnight Black', price: 2450000, category: 'Minus', rating: 4.8, reviews: 178, image: heroImg, modelUrl: '/models/titanium_frame_glass.glb', description: 'The ultimate in minimal elegance. Aero Slim\'s ultra-thin titanium frame practically disappears on your face, available with prescription lenses.' },
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

    // Fixed resolution matching the video feed exactly
    const VIDEO_W = 640
    const VIDEO_H = 480

    // Set canvas internal resolution to match video
    canvas.width = VIDEO_W
    canvas.height = VIDEO_H

    const scene = new THREE.Scene()

    // Orthographic Camera mapping directly to 640x480 pixel space
    // Center of the canvas is (0, 0).
    const camera = new THREE.OrthographicCamera(-320, 320, 240, -240, 0.1, 2000)
    camera.position.set(0, 0, 1000)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
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

      // Center the model pivot using mesh bounding box
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

      // Center the model so its pivot is at its geometric center
      glassesModel.position.set(-center.x, -center.y, -center.z)

      // Normalize scale so the model width (X dimension) = 1.0 unit
      if (size.x > 0) {
        const s = 1.0 / size.x
        glassesModel.scale.set(s, s, s)
      }

      glassesGroup.add(glassesModel)
      glassesGroup.visible = false
    })

    // ─── Temporal smoothing state ───
    const smoothState = {
      posX: null, posY: null, posZ: null,
      scaleVal: null,
      rotQuat: null,
      initialized: false
    }

    const SMOOTH_POS = 0.50
    const SMOOTH_SCALE = 0.40
    const SMOOTH_ROT = 0.45

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

          const pNoseBridge = get3DPoint(noseBridge)
          const pLeftTemple = get3DPoint(leftTemple)
          const pRightTemple = get3DPoint(rightTemple)
          const pLeftEye = get3DPoint(leftEyeOuter)
          const pRightEye = get3DPoint(rightEyeOuter)
          const pForehead = get3DPoint(forehead)
          const pChin = get3DPoint(chin)

          // 1. Position: anchored directly on the nose bridge
          const rawPosX = pNoseBridge.x
          const rawPosY = pNoseBridge.y
          const rawPosZ = pNoseBridge.z

          // 2. Sizing: distance between left and right temple landmarks in pixel space
          const faceWidth = pLeftTemple.distanceTo(pRightTemple)
          // 1.05 adds a tiny padding to fit around the face profile nicely
          const rawScale = faceWidth * 1.05

          // 3. Rotation: build face coordinate system
          const vX = new THREE.Vector3().subVectors(pRightEye, pLeftEye).normalize()
          const vYRaw = new THREE.Vector3().subVectors(pForehead, pChin).normalize()
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
          const verticalOffset = -0.04 * smoothState.scaleVal
          const depthOffset = 0.08 * smoothState.scaleVal
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
      width: VIDEO_W,
      height: VIDEO_H
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

  // ─── CAPTURE SCREENSHOT ───
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '14px Outfit, sans-serif'
    ctx.fillText(`VTO Glasses — ${product.name}`, 16, captureCanvas.height - 16)

    // Trigger download
    const link = document.createElement('a')
    link.download = `VTO_TryOn_${product.name.replace(/\s+/g, '_')}_${Date.now()}.png`
    link.href = captureCanvas.toDataURL('image/png')
    link.click()

    setToastMessage('Screenshot berhasil disimpan!')
    setTimeout(() => setToastMessage(null), 3000)
  }, [product.name])


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
            <Glasses3DViewer modelUrl={product.modelUrl} height="320px" modelScale={4.8} />
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
            <Glasses3DViewer modelUrl={product.modelUrl} showModelSelector={false} />
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
