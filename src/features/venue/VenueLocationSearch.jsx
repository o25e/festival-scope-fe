import { useEffect, useState } from 'react'
import { REGIONS } from '../../data/prototype'

const getMapEmbedUrl = ({ lat, lon }) => {
  const latitude = Number(lat)
  const longitude = Number(lon)
  const delta = 0.015
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

const getMapLink = ({ lat, lon }) =>
  `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lon)}#map=17/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`

export function VenueLocationCard({ location, status }) {
  const hasLocation =
    location && Number.isFinite(location.lat) && Number.isFinite(location.lon)

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
          <div className="venue-map-wrap">
            <iframe
              title={`${location.name} 위치 지도`}
              src={getMapEmbedUrl(location)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
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

  useEffect(() => {
    const venue = plan.venue.trim()
    if (!venue) {
      setVenueLocationStatus('idle')
      setPlan((p) => (p.venueLocation ? { ...p, venueLocation: null } : p))
      return undefined
    }

    const controller = new AbortController()
    const regionName = REGIONS[plan.region]?.name || ''
    const queries = [
      `${venue}, ${regionName}, 대한민국`,
      `${venue}, 대한민국`,
      venue,
    ].filter((query, index, list) => query && list.indexOf(query) === index)
    setVenueLocationStatus('loading')

    const findVenue = async () => {
      try {
        let result = null
        for (const query of queries) {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=kr&accept-language=ko&q=${encodeURIComponent(query)}`,
            {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            },
          )
          if (!response.ok) continue
          const results = await response.json()
          if (results.length) {
            result = results[0]
            break
          }
        }
        if (!result) throw new Error('검색 결과가 없습니다.')

        const location = {
          name: venue,
          address: result.display_name,
          lat: Number(result.lat),
          lon: Number(result.lon),
          placeId: result.place_id,
          mapUrl: getMapLink({ lat: result.lat, lon: result.lon }),
        }
        setPlan((p) => (p.venue.trim() === venue ? { ...p, venueLocation: location } : p))
        setVenueLocationStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return
        setPlan((p) => (p.venue.trim() === venue ? { ...p, venueLocation: null } : p))
        setVenueLocationStatus('error')
      }
    }

    const timer = window.setTimeout(findVenue, 450)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [plan.venue, plan.region, setPlan])
  return venueLocationStatus
}
