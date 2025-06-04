import { NextRequest, NextResponse } from 'next/server'
import { AgentOrchestrator } from '@/lib/agents/AgentOrchestrator'

const orchestrator = new AgentOrchestrator()

// 获取工作流信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'list' | 'agents'

    switch (type) {
      case 'agents':
        const agents = orchestrator.getAvailableAgents()
        return NextResponse.json({ 
          success: true,
          agents 
        })

      case 'list':
      default:
        const workflows = orchestrator.getAvailableWorkflows()
        return NextResponse.json({ 
          success: true,
          workflows 
        })
    }
  } catch (error) {
    console.error('Workflow API error:', error)
    return NextResponse.json(
      { error: 'Failed to get workflow information' },
      { status: 500 }
    )
  }
}

// 执行工作流
export async function POST(request: NextRequest) {
  try {
    const { workflowId, input } = await request.json()

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }

    console.log(`🚀 启动多Agent工作流: ${workflowId}`)
    
    const result = await orchestrator.executeWorkflow(workflowId, input)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute workflow', details: error.message },
      { status: 500 }
    )
  }
}
