import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function HotelBooking() {
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

  const today = new Date().toLocaleDateString('en-CA')

  async function loadRooms() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('id, room_name, description, nightly_price, capacity, image_url, vendors!inner(business_name, city, address, status)')
      .eq('available', true)
      .eq('vendors.status', 'approved')
      .order('nightly_price', { ascending: true })

    if (error) setError(error.message)
    else setRooms(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadRooms()
  }, [])

  async function trackBooking(e) {
    e.preventDefault()
    setTrackingLoading(true)
    setTrackingError('')
    setTrackingResult(null)

    const { data, error } = await supabase.rpc('track_guest_room_booking', {
      p_token: trackingToken.trim()
    })

    if (error) setTrackingError('Booking hin argamne. Koodii sirrii galchi.')
    else setTrackingResult(data)

    setTrackingLoading(false)
  }

  async function bookRoom(e) {
    e.preventDefault()
    if (!selected) return
    if (checkIn < today || checkOut <= checkIn) {
      setError('Guyyaa seensaa fi bahumsaa sirriitti filadhu.')
      return
    }

    setSaving(true)
    setError('')
    setResult(null)

    const { data, error } = await supabase.rpc('create_guest_room_booking', {
      p_room_id: selected.id,
      p_customer_name: name.trim(),
      p_customer_phone: phone.trim(),
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guest_count: Number(guests),
      p_special_request: request.trim()
    })

    if (error) {
      setError(error.message)
    } else if (data?.booking_reference) {
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
    setSaving(false)
  }

  return (
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
            <p>Haala booking: <strong>{trackingResult.status}</strong></p>
            <p>Seensa: {trackingResult.check_in} | Bahumsa: {trackingResult.check_out}</p>
            <p>Waliigala: {Number(trackingResult.total_price).toLocaleString()} ETB</p>
            <p>Amma kaffalamu: {Number(trackingResult.amount_due_now).toLocaleString()} ETB</p>
            <p>Kaffalame: {Number(trackingResult.amount_paid).toLocaleString()} ETB</p>
            <p>Haala kaffaltii: <strong>{trackingResult.payment_status}</strong></p>
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
  )
}
