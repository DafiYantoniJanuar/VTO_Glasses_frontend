const FACE_SHAPES = {
  OVAL: 'Oval',
  ROUND: 'Round',
  SQUARE: 'Square',
  HEART: 'Heart',
  OBLONG: 'Oblong',
}

const GLASSES_RECOMMENDATIONS = {
  [FACE_SHAPES.OVAL]: {
    label: 'Oval',
    description: 'Wajah oval sangat serbaguna — hampir semua bentuk frame cocok karena proporsi seimbang.',
    recommended: ['Round', 'Square', 'Aviator', 'Cat Eye', 'Geometric'],
    avoid: [],
    color: '#C5A880',
  },
  [FACE_SHAPES.ROUND]: {
    label: 'Bulat',
    description: 'Wajah bulat cocok dengan frame tegas dan angular untuk memberikan dimensi dan struktur.',
    recommended: ['Square', 'Geometric', 'Browline', 'Aviator'],
    avoid: ['Round'],
    color: '#E07C5C',
  },
  [FACE_SHAPES.SQUARE]: {
    label: 'Kotak',
    description: 'Wajah kotak cocok dengan frame melengkung untuk melembutkan garis rahang yang tegas.',
    recommended: ['Round', 'Aviator', 'Oval', 'Cat Eye'],
    avoid: ['Square', 'Geometric'],
    color: '#5CA0E0',
  },
  [FACE_SHAPES.HEART]: {
    label: 'Hati',
    description: 'Wajah hati (dagu lancip, dahi lebar) cocok dengan frame yang lebih berat di bagian bawah.',
    recommended: ['Aviator', 'Round', 'Oval'],
    avoid: ['Cat Eye'],
    color: '#E05C8A',
  },
  [FACE_SHAPES.OBLONG]: {
    label: 'Memanjang',
    description: 'Wajah memanjang cocok dengan frame lebar dan besar yang menambah dimensi horizontal.',
    recommended: ['Square', 'Browline', 'Geometric', 'Round'],
    avoid: ['Aviator'],
    color: '#8B5CE0',
  },
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z || 0) - (b.z || 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function classifyFaceShape(landmarks) {
  if (!landmarks || landmarks.length < 468) return null

  const foreheadCenter = landmarks[10]
  const chin = landmarks[152]

  const leftTemple = landmarks[127]
  const rightTemple = landmarks[356]

  const leftCheekbone = landmarks[234]
  const rightCheekbone = landmarks[454]

  const leftJawAngle = landmarks[172]
  const rightJawAngle = landmarks[397]

  const leftBrowOuter = landmarks[70]
  const rightBrowOuter = landmarks[300]

  const leftJawLower = landmarks[215]
  const rightJawLower = landmarks[435]

  const faceLength = dist(foreheadCenter, chin)
  const faceWidth = dist(leftTemple, rightTemple)
  const cheekWidth = dist(leftCheekbone, rightCheekbone)
  const jawWidth = dist(leftJawAngle, rightJawAngle)
  const foreheadWidth = dist(leftBrowOuter, rightBrowOuter)
  const lowerJawWidth = dist(leftJawLower, rightJawLower)

  const ratioLW = faceLength / faceWidth
  const ratioJawForehead = jawWidth / foreheadWidth
  const ratioCheekJaw = cheekWidth / jawWidth
  const ratioLowerJaw = lowerJawWidth / faceWidth
  const ratioForeheadCheek = foreheadWidth / cheekWidth

  let shape = FACE_SHAPES.OVAL
  let confidence = 0.5

  const isLongFace = ratioLW > 1.35
  const isWideJaw = ratioJawForehead > 0.93
  const isNarrowJaw = ratioJawForehead < 0.75
  const isFullCheek = ratioCheekJaw > 1.12
  const isRoundish = ratioLW < 1.05
  const isWideLower = ratioLowerJaw > 0.75

  if (isLongFace && !isWideJaw) {
    shape = FACE_SHAPES.OBLONG
    confidence = Math.min(0.95, 0.6 + (ratioLW - 1.35) * 0.5)
  } else if (isRoundish && isWideJaw) {
    shape = FACE_SHAPES.ROUND
    confidence = Math.min(0.95, 0.6 + (1.05 - ratioLW) * 0.8)
  } else if (isWideJaw && isWideLower && !isFullCheek) {
    shape = FACE_SHAPES.SQUARE
    confidence = Math.min(0.95, 0.6 + (ratioJawForehead - 0.93) * 1.5)
  } else if (isNarrowJaw && isFullCheek && !isLongFace) {
    shape = FACE_SHAPES.HEART
    confidence = Math.min(0.95, 0.6 + (1.12 - ratioCheekJaw + (0.75 - ratioJawForehead)) * 0.5)
  } else {
    shape = FACE_SHAPES.OVAL
    confidence = 0.7
  }

  return {
    shape,
    confidence: Math.round(confidence * 100),
    metrics: {
      ratioLW: ratioLW.toFixed(3),
      ratioJawForehead: ratioJawForehead.toFixed(3),
      ratioCheekJaw: ratioCheekJaw.toFixed(3),
      ratioLowerJaw: ratioLowerJaw.toFixed(3),
    },
  }
}

function getRecommendation(faceShape) {
  return GLASSES_RECOMMENDATIONS[faceShape] || null
}

function isRecommendedForShape(productShape, faceShape) {
  const rec = GLASSES_RECOMMENDATIONS[faceShape]
  if (!rec) return false
  return rec.recommended.includes(productShape)
}

export {
  FACE_SHAPES,
  GLASSES_RECOMMENDATIONS,
  classifyFaceShape,
  getRecommendation,
  isRecommendedForShape,
}
