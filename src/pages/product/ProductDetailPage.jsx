import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import Glasses3DViewer from '../../components/3d/Glasses3DViewer'
import './ProductDetailPage.css'

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

function StarRating({ rating, total }) {
  return (
    <div className="pdp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#C5A880' : 'none'}
          stroke={i <= Math.round(rating) ? '#C5A880' : '#D2C7BC'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="pdp-rating-num">{rating} ({total} ulasan)</span>
    </div>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [previewMode, setPreviewMode] = useState('3d') // '3d' or 'camera'
  const [toastMessage, setToastMessage] = useState(null)

  // Camera State directly inside Fitting Room panel
  const videoRef = useRef(null)
  const arCanvasRef = useRef(null)
  const cameraUtilsRef = useRef(null)
  const faceMeshRef = useRef(null)
  
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [loadingARScripts, setLoadingARScripts] = useState(false)

  const product = DUMMY_PRODUCTS[id] || DUMMY_PRODUCTS[1]

  // Sync initial favorite state from local storage
  useEffect(() => {
    let localFavs = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
    setIsFavorite(localFavs.some(p => p.id === product.id))
  }, [product.id])

  const handleToggleFav = async () => {
    let localFavs = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
    const exists = localFavs.some(p => p.id === product.id)
    let updated
    if (exists) {
      updated = localFavs.filter(p => p.id !== product.id)
      setIsFavorite(false)
      setToastMessage('Dihapus dari favorit.')
    } else {
      updated = [...localFavs, product]
      setIsFavorite(true)
      setToastMessage('Ditambahkan ke favorit.')
    }
    localStorage.setItem('vto_favorites', JSON.stringify(updated))
    setTimeout(() => setToastMessage(null), 3000)
  }

  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraUtilsRef.current) {
        try { cameraUtilsRef.current.stop() } catch {}
        cameraUtilsRef.current = null
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close() } catch {}
        faceMeshRef.current = null
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      setCameraActive(false)
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
        try { cameraUtilsRef.current.stop() } catch {}
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close() } catch {}
      }
      if (videoNode && videoNode.srcObject) {
        const tracks = videoNode.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  // MediaPipe + Three.js Face Mesh Overlay Tracker Effect
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !arCanvasRef.current) return

    let active = true
    const canvas = arCanvasRef.current
    const width = canvas.clientWidth || 320
    const heightPx = canvas.clientHeight || 280

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 1000)
    camera.position.set(0, 0, 10)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
    mainLight.position.set(0, 4, 4)
    scene.add(mainLight)

    const glassesGroup = new THREE.Group()
    scene.add(glassesGroup)

    let glassesModel = null
    const loader = new GLTFLoader()
    loader.load(product.modelUrl, (gltf) => {
      if (!active) return
      glassesModel = gltf.scene

      // Center the model pivot using meshes only
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

      glassesModel.position.set(-center.x, -center.y, -center.z)

      // Normalize scale
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) {
        const s = 1.0 / maxDim
        glassesModel.scale.set(s, s, s)
      }

      glassesGroup.add(glassesModel)
      glassesGroup.visible = false
    })

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
        const nose = landmarks[168]
        const leftEye = landmarks[133]
        const rightEye = landmarks[362]
        const forehead = landmarks[10]
        const chin = landmarks[152]

        if (nose && leftEye && rightEye && glassesGroup) {
          glassesGroup.visible = true

          // Mirror X axis since video has scaleX(-1) style
          const ndcX = -(nose.x * 2 - 1)
          const ndcY = -(nose.y * 2 - 1)
          const targetZ = -5

          const vFOV = camera.fov * Math.PI / 180
          const planeHeight = 2 * Math.tan(vFOV / 2) * Math.abs(targetZ)
          const planeWidth = planeHeight * camera.aspect

          glassesGroup.position.x = ndcX * (planeWidth / 2)
          glassesGroup.position.y = ndcY * (planeHeight / 2)
          // Add subtle depth offset
          glassesGroup.position.z = targetZ + (1.0 - nose.z) * 2

          // Dynamic scale based on eye distance
          const dx = rightEye.x - leftEye.x
          const dy = rightEye.y - leftEye.y
          const eyeDist = Math.sqrt(dx * dx + dy * dy)

          const baseScale = eyeDist * planeWidth * 1.05
          glassesGroup.scale.set(baseScale, baseScale, baseScale)

          // Y-axis rotation (Yaw)
          const distToLeft = Math.abs(nose.x - leftEye.x)
          const distToRight = Math.abs(nose.x - rightEye.x)
          const yaw = (distToLeft - distToRight) / (distToLeft + distToRight || 1)
          glassesGroup.rotation.y = yaw * 1.2

          // Z-axis rotation (Roll)
          const roll = Math.atan2(dy, dx)
          glassesGroup.rotation.z = -roll

          // X-axis rotation (Pitch)
          const faceHeight = Math.abs(forehead.y - chin.y)
          const pitch = (nose.y - (forehead.y + chin.y) / 2) / (faceHeight || 1)
          glassesGroup.rotation.x = pitch * 1.5
        }
      } else {
        if (glassesGroup) {
          glassesGroup.visible = false
        }
      }
      renderer.render(scene, camera)
    })

    const cameraHelper = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (!active) return
        if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          try {
            await faceMesh.send({ image: videoRef.current })
          } catch {}
        }
      },
      width: 640,
      height: 480
    })
    cameraHelper.start()
    cameraUtilsRef.current = cameraHelper
    faceMeshRef.current = faceMesh

    return () => {
      active = false
      try { faceMesh.close() } catch {}
      renderer.dispose()
    }
  }, [cameraActive, product.modelUrl])

  const handleAddToCart = () => {
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

          <StarRating rating={product.rating} total={product.reviews} />
          <p className="pdp-price">{formatPrice(product.price)}</p>
          <p className="pdp-meta">{product.shape} • {product.color} • {product.category}</p>

          {/* Description / Specifications Tabs */}
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', width: '100%' }}>
            <button
              onClick={() => setPreviewMode('3d')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(229,219,208,0.2)',
                background: previewMode === '3d' ? '#C5A880' : 'rgba(28,24,22,0.8)',
                color: previewMode === '3d' ? '#1C1816' : '#FAF8F5',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Preview Model 3D
            </button>
            <button
              onClick={() => setPreviewMode('camera')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(229,219,208,0.2)',
                background: previewMode === 'camera' ? '#C5A880' : 'rgba(28,24,22,0.8)',
                color: previewMode === 'camera' ? '#1C1816' : '#FAF8F5',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
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
                <span className="pdp-ar-pulse-dot" style={{ backgroundColor: cameraActive ? '#22C55E' : '#C5A880' }} />
                
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
                      zIndex: 15,
                      pointerEvents: 'none'
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

              <button className="pdp-tryon-cta" onClick={toggleCamera} disabled={loadingARScripts}>
                {cameraActive ? 'Matikan Kamera' : loadingARScripts ? 'Memuat...' : 'Aktifkan Kamera'}
              </button>
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
  )
}

export default ProductDetailPage
