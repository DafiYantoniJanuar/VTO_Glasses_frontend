import { isRecommendedForShape } from '../../utils/faceShapeDetection'
import './FaceShape.css'

function FaceShapeBadge({ productShape, faceShape }) {
  if (!faceShape || !productShape) return null

  const recommended = isRecommendedForShape(productShape, faceShape)

  if (!recommended) return null

  return (
    <span className="fsb-badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Cocok untuk Anda
    </span>
  )
}

export default FaceShapeBadge
