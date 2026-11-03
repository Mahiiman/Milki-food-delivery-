import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

const translations = {
  om: {
    title: '📅 Booking Maamiltootaa',
    refresh: 'Booking Haaromsi',
    loading: 'Fe’aa jira...',
    empty: 'Ammaaf booking maamilaa hin jiru.',
    customer: 'Maamila',
    phone: 'Bilbila',
    checkIn: 'Guyyaa seensaa',
    checkOut: 'Guyyaa ba’umsaa',
    guests: 'Keessummoota',
    special: 'Gaaffii addaa',
    total: 'Waliigala',
    due: 'Amma kaffalamuu kan qabu',
    remaining: 'Kaffaltii hafe',
    bookingStatus: 'Haala booking',
    paymentStatus: 'Haala kaffaltii',
    paid: 'Kaffalame',
    confirm: 'Fudhadhu',
    reject: 'Didi',
    confirmQuestion: 'Booking kana fudhachuu barbaaddaa?',
    rejectQuestion: 'Booking kana diduu barbaaddaa?',
    changed: 'Booking kun duraan jijjiirameera ykn kutaa kanaaf hin argamu. Tarree haaromsi.',
    updated: 'Haalli booking jijjiirameera.',
    loadError: 'Booking fe’uun hin milkoofne. Irra deebi’i.',
    updateError: 'Haala booking jijjiiruun hin milkoofne. Irra deebi’i.',
    requested: 'Eegaa jira',
    confirmed: 'Mirkanaa’e',
    rejected: 'Didame',
    pending: 'Eegaa jira',
    paidStatus: 'Kaffalame',
    partiallyPaid: 'Gariin kaffalame',
    unpaid: 'Hin kaffalamne'
  },
  en: {
    title: '📅 Customer Bookings',
    refresh: 'Refresh Bookings',
    loading: 'Loading...',
    empty: 'There are no customer bookings yet.',
    customer: 'Customer',
    phone: 'Phone',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    special: 'Special request',
    total: 'Total',
    due: 'Due now',
    remaining: 'Remaining balance',
    bookingStatus: 'Booking status',
    paymentStatus: 'Payment status',
    paid: 'Amount paid',
    confirm: 'Confirm',
    reject: 'Reject',
    confirmQuestion: 'Do you want to confirm this booking?',
    rejectQuestion: 'Do you want to reject this booking?',
    changed: 'The booking has changed or is not available for this room. Refresh the list.',
    updated: 'Booking status updated.',
    loadError: 'Could not load bookings. Please try again.',
    updateError: 'Could not update booking status. Please try again.',
    requested: 'Requested',
    confirmed: 'Confirmed',
    rejected: 'Rejected',
    pending: 'Pending',
    paidStatus: 'Paid',
    partiallyPaid: 'Partially paid',
    unpaid: 'Unpaid'
  },
  am: {
    title: '📅 የደንበኞች ቦታ ማስያዣዎች',
    refresh: 'ቦታ ማስያዣዎችን አድስ',
    loading: 'በመጫን ላይ...',
    empty: 'እስካሁን የደንበኛ ቦታ ማስያዣ የለም።',
    customer: 'ደንበኛ',
    phone: 'ስልክ',
    checkIn: 'የመግቢያ ቀን',
    checkOut: 'የመውጫ ቀን',
    guests: 'እንግዶች',
    special: 'ልዩ ጥያቄ',
    total: 'ጠቅላላ',
    due: 'አሁን መከፈል ያለበት',
    remaining: 'የቀረ ክፍያ',
    bookingStatus: 'የቦታ ማስያዣ ሁኔታ',
    paymentStatus: 'የክፍያ ሁኔታ',
    paid: 'የተከፈለ',
    confirm: 'አረጋግጥ',
    reject: 'ውድቅ አድርግ',
    confirmQuestion: 'ይህን ቦታ ማስያዣ ማረጋገጥ ይፈልጋሉ?',
    rejectQuestion: 'ይህን ቦታ ማስያዣ ውድቅ ማድረግ ይፈልጋሉ?',
    changed: 'ቦታ ማስያዣው ተቀይሯል ወይም ለዚህ ክፍል አይገኝም። ዝርዝሩን ያድሱ።',
    updated: 'የቦታ ማስያዣው ሁኔታ ተቀይሯል።',
    loadError: 'ቦታ ማስያዣዎችን መጫን አልተቻለም። እንደገና ይሞክሩ።',
    updateError: 'የቦታ ማስያዣውን ሁኔታ መቀየር አልተቻለም። እንደገና ይሞክሩ።',
    requested: 'በመጠባበቅ ላይ',
    confirmed: 'ተረጋግጧል',
    rejected: 'ውድቅ ተደርጓል',
    pending: 'በመጠባበቅ ላይ',
    paidStatus: 'ተከፍሏል',
    partiallyPaid: 'በከፊል ተከፍሏል',
    unpaid: 'አልተከፈለም'
  }
}

export default function HotelBookingManagement({ vendorId, language = 'en' }) {
  const t = translations[language] || translations.en
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [expandedBookingId, setExpandedBookingId] = useState(null)
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
      setMessage(t.loadError)
      setBookings([])
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [vendorId, t.loadError])

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

  function statusLabel(status) {
    return t[status] || status || '—'
  }

  async function updateStatus(booking, status) {
    if (!vendorId || savingId) return
    if (!['confirmed', 'rejected'].includes(status)) return
    if (booking.status !== 'requested') return

    const question = status === 'confirmed' ? t.confirmQuestion : t.rejectQuestion
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
        setMessage(t.changed)
        await loadBookings()
        return
      }

      setMessage(t.updated)
      await loadBookings()
    } catch (err) {
      console.error('Hotel booking status update failed:', err)
      setMessage(t.updateError)
    } finally {
      setSavingId(null)
    }
  }

  function paymentStatusLabel(status) {
    const key = status === 'partially_paid' ? 'partiallyPaid' :
      status === 'paid' ? 'paidStatus' :
      status === 'unpaid' ? 'unpaid' : status
    return t[key] || status || '—'
  }

  return (
    <section className="vendor-orders">
      <h3>{t.title} ({bookings.length})</h3>

      <button
        type="button"
        className="primary-button"
        onClick={loadBookings}
        disabled={loading || !!savingId}
      >
        {loading ? t.loading : t.refresh}
      </button>

      {message && <p className="notice">{message}</p>}

      {!loading && bookings.length === 0 && <p>{t.empty}</p>}

      {bookings.map(booking => (
        <article className="cart-item" key={booking.id}>
          <button
            type="button"
            className="booking-details-toggle"
            aria-expanded={expandedBookingId === booking.id}
            onClick={() => setExpandedBookingId(
              current => current === booking.id ? null : booking.id
            )}
          >
            {booking.booking_reference} — {booking.hotel_rooms?.room_name}
            {expandedBookingId === booking.id ? ' ▲' : ' ▼'}
          </button>

          {expandedBookingId === booking.id && (
            <div className="booking-details">
              <p><strong>{t.customer}:</strong> {booking.customer_name}</p>
              <p><strong>{t.phone}:</strong> {booking.customer_phone}</p>
              <p><strong>{t.checkIn}:</strong> {booking.check_in}</p>
              <p><strong>{t.checkOut}:</strong> {booking.check_out}</p>
              <p><strong>{t.guests}:</strong> {booking.guest_count}</p>
              {booking.special_request && (
                <p><strong>{t.special}:</strong> {booking.special_request}</p>
              )}
              <p><strong>{t.total}:</strong> {Number(booking.total_price || 0).toLocaleString()} ETB</p>
              <p><strong>{t.due}:</strong> {Number(booking.amount_due_now || 0).toLocaleString()} ETB</p>
              <p><strong>{t.remaining}:</strong> {Math.max(0, Number(booking.total_price || 0) - Number(booking.amount_paid || 0)).toLocaleString()} ETB</p>
              <p><strong>{t.bookingStatus}:</strong> {statusLabel(booking.status)}</p>
              <p><strong>{t.paymentStatus}:</strong> {paymentStatusLabel(booking.payment_status)}</p>
              <p><strong>{t.paid}:</strong> {Number(booking.amount_paid || 0).toLocaleString()} ETB</p>
            </div>
          )}

          {booking.status === 'requested' && (
            <div>
              <button
                type="button"
                className="primary-button"
                disabled={!!savingId}
                onClick={() => updateStatus(booking, 'confirmed')}
              >
                {t.confirm}
              </button>
              <button
                type="button"
                disabled={!!savingId}
                onClick={() => updateStatus(booking, 'rejected')}
              >
                {t.reject}
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  )
}
