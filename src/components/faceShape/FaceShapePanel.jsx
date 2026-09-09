import { useState, useEffect, useRef, useMemo } from 'react'
import { classifyFaceShape, getRecommendation, FACE_SHAPES } from '../../utils/faceShapeDetection'
import './FaceShape.css'

const FACE_DIAGRAMS = {
  [FACE_SHAPES.OVAL]: (
    <svg viewBox="0 0 40 52" fill="none">
      <ellipse cx="20" cy="26" rx="14" ry="21" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
      <circle cx="14" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="26" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <path d="M16 32 Q20 35 24 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  [FACE_SHAPES.ROUND]: (
    <svg viewBox="0 0 40 52" fill="none">
      <circle cx="20" cy="26" r="17" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
      <circle cx="14" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="26" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <path d="M16 32 Q20 35 24 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  [FACE_SHAPES.SQUARE]: (
    <svg viewBox="0 0 40 52" fill="none">
      <rect x="4" y="6" width="32" height="40" rx="6" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
      <circle cx="14" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="26" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <path d="M16 32 Q20 35 24 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  [FACE_SHAPES.HEART]: (
    <svg viewBox="0 0 40 52" fill="none">
      <path d="M20 46 C8 34 2 22 8 14 C13 7 20 10 20 16 C20 10 27 7 32 14 C38 22 32 34 20 46Z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
      <circle cx="15" cy="24" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="25" cy="24" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <path d="M17 32 Q20 34 23 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  [FACE_SHAPES.OBLONG]: (
    <svg viewBox="0 0 40 52" fill="none">
      <ellipse cx="20" cy="26" rx="12" ry="22" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
      <circle cx="14" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="26" cy="22" r="1.8" fill="currentColor" fillOpacity="0.6"/>
      <path d="M16 32 Q20 35 24 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
}

function FaceShapePanel({ landmarks, faceDetected, onShapeDetected, onClose }) {
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(true)
  const stableRef = useRef(null)
  const frameCountRef = useRef(0)
  const scoreHistoryRef = useRef([])

  useEffect(() => {
    if (!faceDetected || !landmarks) {
      setAnalyzing(true)
      setResult(null)
      frameCountRef.current = 0
      stableRef.current = null
      scoreHistoryRef.current = []
      return
    }

    frameCountRef.current++
    if (frameCountRef.current % 5 !== 0) return

    const detected = classifyFaceShape(landmarks)
    if (!detected) return

    scoreHistoryRef.current.push(detected.shape)
    if (scoreHistoryRef.current.length > 12) scoreHistoryRef.current.shift()

    const counts = {}
    scoreHistoryRef.current.forEach(s => { counts[s] = (counts[s] || 0) + 1 })
    const stableShape = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]

    if (stableShape !== detected.shape) {
      detected.shape = stableShape
      detected.confidence = Math.round((counts[stableShape] / scoreHistoryRef.current.length) * 100)
    }

    if (!stableRef.current || stableRef.current.shape !== detected.shape) {
      stableRef.current = detected
      setResult(detected)
      if (onShapeDetected) onShapeDetected(detected.shape)
    } else {
      stableRef.current = detected
      setResult(detected)
    }

    if (frameCountRef.current > 15) setAnalyzing(false)
  }, [landmarks, faceDetected, onShapeDetected])

  const rec = useMemo(() => result ? getRecommendation(result.shape) : null, [result])

  return (
    <div className="fsp-card">
      {/* Header */}
      <div className="fsp-card-header">
        <div className="fsp-card-title-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2">
            <path d="M7 3H5a2 2 0 0 0-2 2v2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M3 17v2a2 2 0 0 0 2 2h2"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="fsp-card-title">Analisis Bentuk Wajah</span>
        </div>
        <button className="fsp-close-btn" onClick={onClose} title="Tutup">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Analyzing State */}
      {analyzing && (
        <div className="fsp-analyzing">
          <div className="fsp-analyzing-spinner" />
          <span className="fsp-analyzing-text">
            {!faceDetected ? 'Arahkan wajah ke kamera...' : 'Menganalisis bentuk wajah...'}
          </span>
        </div>
      )}

      {/* Result */}
      {!analyzing && result && rec && (
        <div className="fsp-result">
          {/* Shape + Diagram */}
          <div className="fsp-result-top">
            <div className="fsp-diagram-wrap" style={{ color: rec.color }}>
              <div className="fsp-diagram">{FACE_DIAGRAMS[result.shape]}</div>
            </div>
            <div className="fsp-result-info">
              <span className="fsp-result-shape">{rec.label}</span>
              <span className="fsp-result-confidence">{result.confidence}% cocok</span>
              <p className="fsp-result-desc">{rec.description}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="fsp-divider" />

          {/* Recommended */}
          <div className="fsp-section">
            <div className="fsp-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Frame yang Cocok
            </div>
            <div className="fsp-chip-row">
              {rec.recommended.map(s => (
                <span key={s} className="fsp-chip good">{s}</span>
              ))}
            </div>
          </div>

          {/* Avoid */}
          {rec.avoid.length > 0 && (
            <div className="fsp-section">
              <div className="fsp-section-label avoid">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Hindari
              </div>
              <div className="fsp-chip-row">
                {rec.avoid.map(s => (
                  <span key={s} className="fsp-chip bad">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Current product hint */}
          <div className="fsp-current-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>
              {rec.recommended.includes('Round') || rec.recommended.includes('Square') || rec.recommended.includes('Aviator') || rec.recommended.includes('Oval') || rec.recommended.includes('Cat Eye') || rec.recommended.includes('Geometric') || rec.recommended.includes('Browline')
                ? <>Model ini <b>{rec.recommended.includes('Round') ? 'cocok' : rec.recommended.includes('Square') ? 'cocok' : rec.recommended.includes('Aviator') ? 'cocok' : rec.recommended.includes('Oval') ? 'cocok' : 'perlu dipertimbangkan'}</b> untuk bentuk wajah Anda.</>
                : 'Coba model lain yang lebih sesuai.'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FaceShapePanel
