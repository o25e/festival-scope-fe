import { useEffect, useRef, useState } from 'react'
import { isResolvedVenueLocation } from '../input/festivalPlanParser'

const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
const NAVER_MAP_SCRIPT_ID = 'naver-maps-sdk'
const NAVER_MAP_CALLBACK_NAME = '__festivalScopeNaverMapsReady'
const NAVER_LOCAL_SEARCH_ENDPOINT = '/api/naver/local-search'
let naverMapsPromise

const createAbortError = () => {
  const error = new Error('요청이 취소되었습니다.')
  error.name = 'AbortError'
  return error
}

const getNaverMapsDiagnostics = (scriptUrl) => ({
  origin: window.location.origin,
  clientIdConfigured: Boolean(NAVER_MAP_CLIENT_ID),
  scriptUrl,
  hasNaver: Boolean(window.naver),
  hasMaps: Boolean(window.naver?.maps),
  hasMapConstructor: Boolean(window.naver?.maps?.Map),
  hasGeocoderService: Boolean(window.naver?.maps?.Service),
  jsContentLoaded: window.naver?.maps?.jsContentLoaded,
})

const loadNaverMaps = () => {
  if (window.naver?.maps?.Map) return Promise.resolve(window.naver.maps)
  if (!NAVER_MAP_CLIENT_ID) {
    return Promise.reject(new Error('VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.'))
  }
  if (naverMapsPromise) return naverMapsPromise

  naverMapsPromise = new Promise((resolve, reject) => {
    const scriptUrl = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      NAVER_MAP_CLIENT_ID,
    )}&submodules=geocoder&callback=${NAVER_MAP_CALLBACK_NAME}`
    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID)
    if (
      existingScript &&
      (existingScript.getAttribute('src') !== scriptUrl ||
        existingScript.dataset.naverMapsState === 'error')
    ) {
      existingScript.remove()
    }

    let settled = false
    let timeoutId
    const previousAuthFailure = window.navermap_authFailure
    const script =
      document.getElementById(NAVER_MAP_SCRIPT_ID) ||
      Object.assign(document.createElement('script'), {
        id: NAVER_MAP_SCRIPT_ID,
        async: true,
        src: scriptUrl,
      })

    const cleanup = () => {
      window.clearTimeout(timeoutId)
      script.removeEventListener('error', onScriptError)
      if (window[NAVER_MAP_CALLBACK_NAME] === onReady) {
        delete window[NAVER_MAP_CALLBACK_NAME]
      }
      if (window.navermap_authFailure === onAuthFailure) {
        if (previousAuthFailure) window.navermap_authFailure = previousAuthFailure
        else delete window.navermap_authFailure
      }
    }
    const finishError = (error) => {
      if (settled) return
      settled = true
      script.dataset.naverMapsState = 'error'
      cleanup()
      if (script.isConnected) script.remove()
      console.error('[NAVER Maps] SDK 로딩 실패', error, getNaverMapsDiagnostics(scriptUrl))
      reject(error)
    }
    const onAuthFailure = (...args) => {
      const error = new Error(
        '네이버 지도 API 인증에 실패했습니다. Client ID와 Web Service URL을 확인하세요.',
      )
      error.details = args
      finishError(error)
      previousAuthFailure?.(...args)
    }
    const onReady = () => {
      if (settled) return
      if (window.naver?.maps?.Map) {
        settled = true
        script.dataset.naverMapsState = 'ready'
        cleanup()
        resolve(window.naver.maps)
      } else {
        finishError(new Error('네이버 지도 SDK callback 이후 Map 객체가 없습니다.'))
      }
    }
    const onScriptError = () =>
      finishError(new Error('네이버 지도 SDK script를 불러오지 못했습니다.'))

    window[NAVER_MAP_CALLBACK_NAME] = onReady
    window.navermap_authFailure = onAuthFailure
    script.addEventListener('error', onScriptError, { once: true })
    script.dataset.naverMapsState = 'loading'
    timeoutId = window.setTimeout(
      () => finishError(new Error('네이버 지도 SDK 로딩 시간이 초과되었습니다.')),
      10000,
    )
    if (!script.isConnected) document.head.appendChild(script)
  }).catch((error) => {
    naverMapsPromise = undefined
    throw error
  })

  return naverMapsPromise
}

const getCoordinate = (address) => {
  const latitude = Number(address?.y)
  const longitude = Number(address?.x)
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }
  return { latitude, longitude }
}

const getAddressText = (address) =>
  address?.roadAddress || address?.jibunAddress || address?.englishAddress || ''

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').trim()

const getLocalCoordinate = (item) => {
  const rawLatitude = Number(item?.mapy)
  const rawLongitude = Number(item?.mapx)
  const latitude = rawLatitude > 90 ? rawLatitude / 10000000 : rawLatitude
  const longitude = rawLongitude > 180 ? rawLongitude / 10000000 : rawLongitude
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }
  return { latitude, longitude }
}

const scoreAddress = (address, regionName) => {
  const addressText = `${address?.roadAddress || ''} ${address?.jibunAddress || ''}`
  const regionTokens = regionName.split(/\s+/).filter(Boolean)
  return regionTokens.reduce(
    (score, token) => score + (addressText.includes(token) ? 1 : 0),
    0,
  )
}

const geocode = (naverMaps, query, signal) =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError())
      return
    }

    let settled = false
    const abort = () => {
      if (settled) return
      settled = true
      reject(createAbortError())
    }
    signal.addEventListener('abort', abort, { once: true })

    naverMaps.Service.geocode({ query, count: 5 }, (status, response) => {
      signal.removeEventListener('abort', abort)
      if (settled) return
      settled = true
      if (status !== naverMaps.Service.Status.OK) {
        reject(new Error('네이버 지도 위치 검색에 실패했습니다.'))
        return
      }
      resolve(response?.v2?.addresses || [])
    })
  })

const localSearch = async (query, signal) => {
  const response = await fetch(
    `${NAVER_LOCAL_SEARCH_ENDPOINT}?query=${encodeURIComponent(
      query,
    )}&display=5&start=1&sort=random&format=json`,
    { signal },
  )
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      result?.error?.message ||
      result?.errorMessage ||
      `HTTP ${response.status}`
    const error = new Error(`NAVER API HUB 지역 검색 실패 (${response.status}): ${message}`)
    error.status = response.status
    error.payload = result
    throw error
  }
  return result.items || []
}

const getMapLink = ({ name, address }) =>
  `https://map.naver.com/p/search/${encodeURIComponent(`${name} ${address}`)}`

function NaverMap({ name, latitude, longitude }) {
  const mapElementRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    let disposed = false
    let frameId
    setMapError(false)

    const initializeMap = async () => {
      try {
        const naverMaps = await loadNaverMaps()
        if (disposed || !mapElementRef.current) return

        const mapElement = mapElementRef.current
        const bounds = mapElement.getBoundingClientRect()
        if (bounds.width === 0 || bounds.height === 0) {
          throw new Error(
            `지도 컨테이너 크기가 유효하지 않습니다: ${bounds.width}x${bounds.height}`,
          )
        }

        const position = new naverMaps.LatLng(latitude, longitude)
        const map = new naverMaps.Map(mapElement, {
          center: position,
          zoom: 16,
          zoomControl: false,
          mapDataControl: false,
        })
        mapRef.current = map
        const marker = new naverMaps.Marker({
          map,
          position,
          title: name,
        })

        markerRef.current = marker
      } catch (error) {
        if (disposed) return
        console.error('[NAVER Maps] 지도 초기화 실패', error, {
          origin: window.location.origin,
          latitude,
          longitude,
          container: mapElementRef.current
            ? {
                width: mapElementRef.current.getBoundingClientRect().width,
                height: mapElementRef.current.getBoundingClientRect().height,
              }
            : null,
          hasNaver: Boolean(window.naver),
          hasMaps: Boolean(window.naver?.maps),
          hasMapConstructor: Boolean(window.naver?.maps?.Map),
        })
        setMapError(true)
      }
    }

    frameId = window.requestAnimationFrame(initializeMap)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      markerRef.current?.setMap(null)
      markerRef.current = null
      if (typeof mapRef.current?.destroy === 'function') mapRef.current.destroy()
      mapRef.current = null
    }
  }, [latitude, longitude, name])

  return (
    <div className="venue-map-wrap">
      <div
        ref={mapElementRef}
        className="venue-map"
        role="img"
        aria-label={`${name} 위치 지도`}
      />
      {mapError && (
        <div className="venue-map-error" role="status">
          네이버 지도를 불러오지 못했습니다. 지도 API 설정을 확인해 주세요.
        </div>
      )}
    </div>
  )
}

export function VenueLocationCard({ location, status }) {
  const hasLocation =
    location &&
    Number.isFinite(Number(location.latitude ?? location.lat)) &&
    Number.isFinite(Number(location.longitude ?? location.lon))

  return (
    <section className="venue-location" aria-labelledby="venue-location-title">
      <div className="venue-location-head">
        <div>
          <h2 id="venue-location-title">참고 위치</h2>
          <p>행사장의 위치를 지도로 확인해보세요.</p>
        </div>
        {status === 'loading' && <span className="venue-location-status">검색 중</span>}
      </div>
      {hasLocation ? (
        <>
          <NaverMap
            name={location.name}
            latitude={Number(location.latitude ?? location.lat)}
            longitude={Number(location.longitude ?? location.lon)}
          />
          <div className="venue-location-foot">
            <div className="venue-address">
              <span className="venue-marker" aria-hidden="true">●</span>
              <div>
                <strong>{location.name}</strong>
                <p>{location.address}</p>
              </div>
            </div>
            <a
              className="venue-map-link"
              href={location.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              지도에서 보기 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </>
      ) : (
        <div className="venue-location-empty" role="status">
          {status === 'loading'
            ? '행사장명을 기준으로 위치를 검색하고 있습니다.'
            : status === 'error'
              ? '행사장 위치를 찾지 못했습니다. 행사장명을 확인해 주세요.'
              : '행사장명을 입력하면 검색된 위치가 표시됩니다.'}
        </div>
      )}
    </section>
  )
}

export function useVenueLocationSearch({ plan, setPlan }) {
  const [venueLocationStatus, setVenueLocationStatus] = useState('idle')
  const requestIdRef = useRef(0)

  useEffect(() => {
    const venue = plan.venue.trim()
    const region = { sido: plan.sido, sigungu: plan.sigungu }
    const regionName = [plan.sido, plan.sigungu].filter(Boolean).join(' ')
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!venue) {
      setVenueLocationStatus('idle')
      setPlan((p) => (p.venueLocation ? { ...p, venueLocation: null } : p))
      return undefined
    }

    if (isResolvedVenueLocation(plan.venueLocation, venue, region)) {
      setVenueLocationStatus('success')
      return undefined
    }

    const controller = new AbortController()
    setVenueLocationStatus('loading')
    setPlan((p) => (p.venueLocation ? { ...p, venueLocation: null } : p))

    const queries = [
      `${regionName} ${venue}`,
      venue,
    ].filter((query, index, list) => query && list.indexOf(query) === index)

    const findVenue = async () => {
      try {
        const localCandidates = []
        for (const query of queries) {
          try {
            const results = await localSearch(query, controller.signal)
            localCandidates.push(...results)
          } catch (error) {
            if (error.name === 'AbortError') throw error
            if (import.meta.env.DEV) {
              console.warn('[NAVER API HUB] 지역 검색 요청 실패. Geocoder fallback을 시도합니다.', error)
            }
          }
        }

        const localResult = localCandidates
          .map((item, index) => ({
            item,
            index,
            coordinates: getLocalCoordinate(item),
          }))
          .filter((candidate) => candidate.coordinates)
          .sort(
            (a, b) =>
              scoreAddress(
                { roadAddress: b.item.roadAddress, jibunAddress: b.item.address },
                regionName,
              ) -
              scoreAddress(
                { roadAddress: a.item.roadAddress, jibunAddress: a.item.address },
                regionName,
              ) ||
              a.index - b.index,
          )[0]

        let coordinates = localResult?.coordinates
        let address = localResult
          ? stripHtml(localResult.item.roadAddress || localResult.item.address)
          : ''

        if (!localResult) {
          const naverMaps = await loadNaverMaps()
          const geocodeCandidates = []
          for (const query of queries) {
            const results = await geocode(naverMaps, query, controller.signal)
            geocodeCandidates.push(...results)
          }

          const geocodeResult = geocodeCandidates
            .map((item, index) => ({
              item,
              index,
              coordinates: getCoordinate(item),
            }))
            .filter((candidate) => candidate.coordinates)
            .sort(
              (a, b) =>
                scoreAddress(b.item, regionName) -
                scoreAddress(a.item, regionName) ||
                a.index - b.index,
            )[0]

          coordinates = geocodeResult?.coordinates
          address = geocodeResult ? getAddressText(geocodeResult.item) : ''
        }

        if (!coordinates) throw new Error('검색 결과가 없습니다.')
        const location = {
          name: venue,
          address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          mapUrl: getMapLink({ name: venue, address }),
          // Keep the aliases for existing consumers of the prototype data.
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          sido: plan.sido,
          sigungu: plan.sigungu,
        }

        if (requestIdRef.current !== requestId || controller.signal.aborted) return
        setPlan((p) =>
          p.venue.trim() === venue &&
          p.sido === region.sido &&
          p.sigungu === region.sigungu
            ? { ...p, venueLocation: location }
            : p,
        )
        setVenueLocationStatus('success')
      } catch (error) {
        if (
          error.name === 'AbortError' ||
          requestIdRef.current !== requestId ||
          controller.signal.aborted
        ) {
          return
        }
        setPlan((p) =>
          p.venue.trim() === venue &&
          p.sido === region.sido &&
          p.sigungu === region.sigungu
            ? { ...p, venueLocation: null }
            : p,
        )
        setVenueLocationStatus('error')
      }
    }

    const timer = window.setTimeout(findVenue, 450)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [plan.venue, plan.sido, plan.sigungu, setPlan])

  return venueLocationStatus
}
