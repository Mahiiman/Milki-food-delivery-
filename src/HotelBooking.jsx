import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Translate, translateText } from './i18n'

export default function HotelBooking({ language = 'om' }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [request, setRequest] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [trackingToken, setTrackingToken] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState('')

  const [today] = useState(() => new Date().toLocaleDateString('en-CA'))

  async function loadRooms(isActive = () => true) {
    if (!isActive()) return

    setLoading(true)
    setError('')

    try {
      const { data: hotels, error: hotelError } = await supabase
        .from('vendors')
        .select('id,business_name,city,address')
        .eq('vendor_type', 'Hotel')
        .eq('status', 'approved')

      if (hotelError) throw hotelError
      if (!isActive()) return

      const hotelIds = (hotels || []).map(hotel => hotel.id)

      if (!hotelIds.length) {
        setRooms([])
        return
      }

      const { data: roomData, error: roomError } = await supabase
        .from('hotel_rooms')
        .select('id,room_name,description,nightly_price,capacity,image_url,vendor_id')
        .eq('available', true)
        .in('vendor_id', hotelIds)
        .order('nightly_price', { ascending: true })

      if (roomError) throw roomError
      if (!isActive()) return

      const hotelMap = new Map((hotels || []).map(hotel => [hotel.id, hotel]))
      setRooms((roomData || []).map(room => ({
        ...room,
        vendors: hotelMap.get(room.vendor_id) || null
      })))
    } catch (err) {
      if (!isActive()) return
      console.error('Hotel room loading failed:', err)
      setError('Kutaa hotelii fe’uun hin milkoofne. Maaloo irra deebi’i.')
      setRooms([])
    } finally {
      if (isActive()) setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    Promise.resolve().then(() => {
      if (active) loadRooms(() => active)
    })

    return () => {
      active = false
    }
  }, [])

  async function trackBooking(e) {
    e.preventDefault()
    if (trackingLoading) return

    setTrackingLoading(true)
    setTrackingError('')
    setTrackingResult(null)

    try {
      const { data, error } = await supabase.rpc('track_guest_room_booking', {
        p_token: trackingToken.trim()
      })

      if (error) throw error

      if (data) {
        setTrackingResult(data)
      } else {
        setTrackingError('Booking hin argamne. Koodii sirrii galchi.')
      }
    } catch (err) {
      console.error('Booking tracking failed:', err)
      setTrackingError('Booking hin argamne. Koodii sirrii galchi.')
    } finally {
      setTrackingLoading(false)
    }
  }

  async function bookRoom(e) {
    e.preventDefault()
    if (!selected || saving) return

    const guestCount = Number(guests)

    if (
      checkIn < today ||
      checkOut <= checkIn ||
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > Number(selected.capacity)
    ) {
      setError('Guyyaa seensaa, bahumsaa fi baayina keessummootaa sirriitti mirkaneessi.')
      return
    }

    setSaving(true)
    setError('')
    setResult(null)

    try {
      const { data, error } = await supabase.rpc('create_guest_room_booking', {
        p_room_id: selected.id,
        p_customer_name: name.trim(),
        p_customer_phone: phone.trim(),
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_guest_count: guestCount,
        p_special_request: request.trim()
      })

      if (error) throw error

      if (data?.booking_reference) {
        setResult(data)
        setSelected(null)
        setName('')
        setPhone('')
        setCheckIn('')
        setCheckOut('')
        setGuests(1)
        setRequest('')
      } else {
        setError(data?.message || 'Booking hin milkoofne. Irra deebi’i.')
      }
    } catch (err) {
      console.error('Hotel booking submission failed:', err)
      setError('Booking erguun hin milkoofne. Maaloo irra deebi’i.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Translate language={language}>
    <section className="hotel-booking">
      <div className="hotel-heading">
        <span className="eyebrow">MILKI HOTEL CONNECT</span>
        <h2>🏨 Kutaa Hotelii Qabadhu</h2>
        <p>Hotel filadhu; guyyaa turtii kee galchi; booking kee ergi.</p>
      </div>

      {error && <p className="hotel-error">{error}</p>}

      {result && (
        <div className="hotel-success">
          <h3>✓ Booking kee ergameera!</h3>
          <p>Lakkoofsa booking: <strong>{result.booking_reference}</strong></p>
          <p>Koodii hordoffii dhuunfaa:</p>
          <p className="guest-token">{result.guest_token}</p>
          <p>Koodii kana copy godhii bakka nageenya qabu kuufadhu. Booking kee ittiin hordofita.</p>
          <p>Waliigala: <strong>{Number(result.total_price).toLocaleString()} ETB</strong></p>
          <p>Akkaataa kaffaltii: <strong>{result.payment_policy === 'deposit' ? 'Kaffaltii dursaa' : 'Kaffaltii guutuu'}</strong></p>
          <p>Amma kaffalamu: <strong>{Number(result.amount_due_now).toLocaleString()} ETB</strong></p>
          <p>Haala kaffaltii: Kaffaltiin hanga mirkanaa’utti hin kaffalamne.</p>
          <p className="hotel-warning">Lakkoofsa booking kana kuufadhu. Kaffaltii Telebirr/Bank amma hin raawwatamin; hoteliin mirkaneessa siif kenna.</p>
        </div>
      )}

      {loading ? <p>Hotelii fi kutaa jiru barbaadaa jira...</p> :
        rooms.length === 0 ? (
          <p className="empty-menu">Ammaaf kutaan hotelii raggaasifame hin jiru.</p>
        ) : (
          <div className="hotel-grid">
            {rooms.map(room => (
              <article className="hotel-card" key={room.id}>
                {room.image_url ? (
                  <img src={room.image_url} alt={room.room_name} />
                ) : <div className="hotel-image">🛏️</div>}
                <div className="hotel-card-body">
                  <h3>{room.room_name}</h3>
                  <strong>{room.vendors?.business_name}</strong>
                  <p>📍 {room.vendors?.city || ''} · {room.vendors?.address || ''}</p>
                  <p>{room.description}</p>
                  <p>👥 Namoota {room.capacity} fudhata</p>
                  <strong>{Number(room.nightly_price).toLocaleString()} ETB / halkan</strong>
                  <button type="button" className="primary-button" onClick={() => {
                    setSelected(room)
                    setResult(null)
                    setError('')
                  }}>Kutaa kana qabadhu</button>
                </div>
              </article>
            ))}
          </div>
        )
      }

      <div className="hotel-tracking">
        <h3>🔎 Booking kee hordofi</h3>
        <p>Koodii dhuunfaa booking yeroo qabattu argatte galchi.</p>
        <form onSubmit={trackBooking}>
          <input
            required
            minLength="40"
            maxLength="100"
            value={trackingToken}
            onChange={e => setTrackingToken(e.target.value)}
            placeholder="Koodii hordoffii galchi"
          />
          <button className="primary-button" type="submit" disabled={trackingLoading}>
            {trackingLoading ? 'Barbaadaa jira...' : 'Booking koo ilaali'}
          </button>
        </form>
        {trackingError && <p className="hotel-error">{trackingError}</p>}
        {trackingResult && (
          <div className="hotel-success">
            <h4>{trackingResult.hotel_name} — {trackingResult.room_name}</h4>
            <p>Lakkoofsa: <strong>{trackingResult.booking_reference}</strong></p>
            <p>{translateText('Haala booking:', language)} <strong>{translateText(trackingResult.status, language)}</strong></p>
            <p>{translateText('Seensa:', language)} {trackingResult.check_in}</p>
            <p>{translateText('Bahumsa:', language)} {trackingResult.check_out}</p>
            <p>{translateText('Waliigala:', language)} {Number(trackingResult.total_price).toLocaleString()} ETB</p>
            <p>{translateText('Amma kaffalamu:', language)} {Number(trackingResult.amount_due_now).toLocaleString()} ETB</p>
            <p>{translateText('Kaffalame:', language)} {Number(trackingResult.amount_paid).toLocaleString()} ETB</p>
            <p>{translateText('Haala kaffaltii:', language)} <strong>{translateText(trackingResult.payment_status, language)}</strong></p>
          </div>
        )}
      </div>

      {selected && (
        <form className="hotel-form" onSubmit={bookRoom}>
          <h3>Booking: {selected.room_name}</h3>
          <label>Maqaa guutuu</label>
          <input required minLength="2" maxLength="120" value={name} onChange={e => setName(e.target.value)} />
          <label>Lakkoofsa bilbilaa</label>
          <input required type="tel" minLength="7" maxLength="30" value={phone} onChange={e => setPhone(e.target.value)} />
          <label>Guyyaa seensaa</label>
          <input required type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
          <label>Guyyaa bahumsaa</label>
          <input required type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
          <label>Baayina keessummootaa</label>
          <input required type="number" min="1" max={selected.capacity} value={guests} onChange={e => setGuests(e.target.value)} />
          <label>Gaaffii addaa (dirqama miti)</label>
          <textarea value={request} onChange={e => setRequest(e.target.value)} />
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Booking ergaa jira...' : 'Booking mirkaneessi'}
          </button>
          <button type="button" onClick={() => setSelected(null)}>Dhiisi</button>
        </form>
      )}
    </section>
    </Translate>
  )
}
