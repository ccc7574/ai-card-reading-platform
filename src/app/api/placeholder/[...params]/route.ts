import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  const resolvedParams = await params
  const [width = '200', height = '150'] = resolvedParams.params || []
  
  // 创建一个简单的SVG占位图
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="20%" y="20%" width="60%" height="60%" fill="#e5e7eb" rx="8"/>
      <circle cx="40%" cy="40%" r="8%" fill="#9ca3af"/>
      <rect x="55%" y="35%" width="25%" height="4%" fill="#9ca3af" rx="2"/>
      <rect x="55%" y="45%" width="20%" height="4%" fill="#9ca3af" rx="2"/>
      <text x="50%" y="75%" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="12">
        AI Card Image
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
