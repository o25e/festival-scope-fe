const NAVER_LOCAL_SEARCH_URL =
  'https://naverapihub.apigw.ntruss.com/search/v1/local'

const json = (response, status, body) => {
  response.status(status).setHeader('Cache-Control', 'no-store')
  return response.json(body)
}

const getQueryParam = (request, name) => {
  if (request.query && typeof request.query[name] === 'string') {
    return request.query[name]
  }

  return new URL(request.url, 'https://festivalscope.invalid').searchParams.get(name) || ''
}

const getNumberParam = (request, name, fallback, min, max) => {
  const value = Number.parseInt(getQueryParam(request, name), 10)
  if (!Number.isFinite(value)) return fallback
  return Math.min(Math.max(value, min), max)
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return json(response, 405, { error: { message: 'Method Not Allowed' } })
  }

  const clientId = process.env.NAVER_SEARCH_CLIENT_ID
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return json(response, 500, {
      error: { message: 'NAVER Search API 환경 변수가 설정되지 않았습니다.' },
    })
  }

  const query = getQueryParam(request, 'query').trim()
  if (!query) {
    return json(response, 400, {
      error: { message: 'query 파라미터가 필요합니다.' },
    })
  }

  const searchParams = new URLSearchParams({
    query,
    display: String(getNumberParam(request, 'display', 5, 1, 5)),
    start: String(getNumberParam(request, 'start', 1, 1, 1000)),
    sort: getQueryParam(request, 'sort') === 'comment' ? 'comment' : 'random',
    format: 'json',
  })

  try {
    const upstreamResponse = await fetch(
      `${NAVER_LOCAL_SEARCH_URL}?${searchParams.toString()}`,
      {
        headers: {
          Accept: 'application/json',
          'X-NCP-APIGW-API-KEY-ID': clientId,
          'X-NCP-APIGW-API-KEY': clientSecret,
        },
      },
    )
    const rawBody = await upstreamResponse.text()
    let body
    try {
      body = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      body = { error: { message: 'NAVER API가 올바른 JSON을 반환하지 않았습니다.' } }
    }

    return json(response, upstreamResponse.status, body)
  } catch (error) {
    console.error('[NAVER API HUB] upstream request failed', error)
    return json(response, 502, {
      error: { message: 'NAVER Search API에 연결하지 못했습니다.' },
    })
  }
}
