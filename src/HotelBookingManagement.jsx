import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

export default function HotelBookingManagement({ vendorId, language = 'om' }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState(null)
  const requestRef = useRef(0)

  const loadBookings = useCallback(async () => {
    const selectedVendorId = vendorId
    if (!selectedVendorId) {
      requestRef.current += 1
      setBookings([])
      setLoading(false)
      return
    }

    const requestId = ++requestRef.current
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          id, room_id, customer_name, customer_phone, check_in, check_out,
          guest_count, special_request, status, total_price,
          booking_reference, payment_status, amount_due_now,
          amount_paid, created_at,
          hotel_rooms!inner(room_name, vendor_id)
        `)
        .eq('hotel_rooms.vendor_id', selectedVendorId)
        .order('created_at', { ascending: false })

      if (requestId !== requestRef.current) return
      if (error) throw error

      setBookings(data || [])
    } catch (err) {
      if (requestId !== requestRef.current) return
      console.error('Hotel bookings loading failed:', err)
      setMessage('Booking fe’uun hin milkoofne. Irra deebi’i.')
      setBookings([])
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false)
      }
    }

  }, [vendorId])

  useEffect(() => {
    let active = true

    Promise.resolve().then(() => {
      if (active) loadBookings()
    })

    return () => {
      active = false
      requestRef.current += 1
    }
  }, [loadBookings])

  async function updateStatus(booking, status) {
    if (!vendorId || savingId) return
    if (!['confirmed', 'rejected'].includes(status)) return
    if (booking.status !== 'requested') return

    const question = status === 'confirmed'
      ? 'Booking kana fudhachuu barbaaddaa?'
      : 'Booking kana diduu barbaaddaa?'

    if (!window.confirm(question)) return

    setSavingId(booking.id)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .update({ status })
        .eq('id', booking.id)
        .eq('room_id', booking.room_id)
        .eq('status', 'requested')
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        setMessage(
          language === 'am'
            ? 'ቦታ ማስያዣው ቀድሞ ተቀይሯል ወይም ለዚህ ሆቴል አይደለም። ዝርዝሩን ያድሱ።'
            : language === 'en'
              ? 'The booking has changed or is not available for this room. Refresh the list.'
              : 'Booking kun duraan jijjiirameera ykn kutaa kanaaf hin argamu. Tarree haaromsi.'
        )
        await loadBookings()
        return
      }

      setMessage(
        language === 'am'
          ? 'የቦታ ማስያዣው ሁኔታ ተቀይሯል።'
          : language === 'en'
            ? 'Booking status updated.'
            : 'Haalli booking jijjiirameera.'
      )
      await loadBookings()
    } catch (err) {
      console.error('Hotel booking status update failed:', err)
      setMessage('Haala booking jijjiiruun hin milkoofne. Irra deebi’i.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="vendor-orders">
      <h3>📅 Booking Maamiltootaa ({bookings.length})</h3>

      <button
        type="button"
        className="primary-button"
        onClick={loadBookings}
        disabled={loading || !!savingId}
      >
        {loading ? 'Fe’aa jira...' : 'Booking Haaromsi'}
      </button>

      {message && <p className="notice">{message}</p>}

      {!loading && bookings.length === 0 && (
        <p>Ammaaf booking maamilaa hin jiru.</p>
      )}

      {bookings.map(booking => (
        <article className="cart-item" key={booking.id}>
          <h4>{booking.booking_reference} — {booking.hotel_rooms?.room_name}</h4>
          <p><strong>Maamila:</strong> {booking.customer_name}</p>
          <p><strong>Bilbila:</strong> {booking.customer_phone}</p>
          <p><strong>Seensa:</strong> {booking.check_in}</p>
          <p><strong>Ba’umsaa:</strong> {booking.check_out}</p>
          <p><strong>Keessummoota:</strong> {booking.guest_count}</p>
          {booking.special_request && (
            <p><strong>Gaaffii addaa:</strong> {booking.special_request}</p>
          )}
          <p><strong>Waliigala:</strong> {Number(booking.total_price).toLocaleString()} ETB</p>
          <p><strong>{language === 'am' ? 'አሁን መከፈል ያለበት:' : language === 'en' ? 'Due now:' : 'Amma kaffalamuu kan qabu:'}</strong> {Number(booking.amount_due_now || 0).toLocaleString()} ETB</p>
          <p><strong>{language === 'am' ? 'የቀረ ክፍያ:' : language === 'en' ? 'Remaining balance:' : 'Kaffaltii hafe:'}</strong> {Math.max(0, Number(booking.total_price || 0) - Number(booking.amount_paid || 0)).toLocaleString()} ETB</p>
          <p><strong>Haala booking:</strong> {booking.status}</p>
          <p><strong>Haala kaffaltii:</strong> {booking.payment_status}</p>
          <p><strong>Kaffalame:</strong> {Number(booking.amount_paid).toLocaleString()} ETB</p>

          {booking.status === 'requested' && (
            <div>
              <button
                type="button"
                className="primary-button"
                disabled={!!savingId}
                onClick={() => updateStatus(booking, 'confirmed')}
              >
                Fudhadhu
              </button>
              <button
                type="button"
                disabled={!!savingId}
                onClick={() => updateStatus(booking, 'rejected')}
              >
                Didi
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  )
}
