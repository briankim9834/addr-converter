// lib/slack.ts

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export async function notifySlackError(message: string, detail?: string): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return

  const text = [
    `🚨 *도구함 에러 알림*`,
    `> ${message}`,
    detail ? `\`\`\`${detail}\`\`\`` : '',
    `_${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}_`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    // Slack 알림 실패는 무시 (서비스 영향 없음)
  }
}
