import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

export default function HotelRoomManagement({ vendorId, language = 'om' }) {
  const words = {
    om: {
      title: '🏨 Bulchiinsa Kutaa Hotelii',
      name: 'Maqaa kutaa',
      description: 'Ibsa kutaa',
      price: 'Gatii halkan tokkoo (ETB)',
      capacity: 'Baay’ina namoota simatu',
      image: 'Suuraa kutaa filadhu',
      save: 'Kutaa Galmeessi',
      update: 'Jijjiirama Kuusi',
      edit: 'Gulaali',
      remove: 'Haqi',
      available: 'Kutaan jira',
      unavailable: 'Kutaan hin jiru',
      loading: 'Kutaa fe’aa jira...',
      empty: 'Ammaaf kutaan hin galmoofne.',
      success: 'Kutaan hotelii kuufameera.',
      error: 'Dogoggora: ',
      cancel: 'Dhiisi',
      refresh: 'Haaromsi',
      roomPlaceholder: 'Standard, Deluxe, Family...',
      descriptionPlaceholder: 'Ibsa kutaa hotelii',
      saving: 'Kuusaa jira...',
      loadError: 'Kutaa fe’uun hin milkoofne.',
      imageTypeError: 'JPEG, PNG ykn WebP qofa filadhu.',
      imageSizeError: 'Suuraan 5 MB ol ta’uu hin qabu.',
      validation: 'Maqaa, gatii sirrii fi baay’ina namoota lakkoofsa guutuu ta’e galchi.',
      saveError: 'Kutaa kuusuun hin milkoofne. Odeeffannoo galchite fi mirga account kee mirkaneessi.',
      availabilityError: 'Haala kutaa jijjiiruun hin milkoofne.',
      confirmDelete: 'Kutaa kana haquu barbaaddaa?',
      deleted: 'Kutaan haqameera.',
      deleteError: 'Kutaa haquun hin milkoofne. Booking jiru yoo jiraate, database haquu dhoowwuu danda’a.',
      night: 'halkan',
      guests: 'keessummoota'
    },
    en: {
      title: '🏨 Hotel Room Management',
      name: 'Room name',
      description: 'Room description',
      price: 'Nightly price (ETB)',
      capacity: 'Guest capacity',
      image: 'Choose room image',
      save: 'Add Room',
      update: 'Save Changes',
      edit: 'Edit',
      remove: 'Delete',
      available: 'Available',
      unavailable: 'Unavailable',
      loading: 'Loading rooms...',
      empty: 'No rooms registered yet.',
      success: 'Room saved successfully.',
      error: 'Error: ',
      cancel: 'Cancel',
      refresh: 'Refresh',
      roomPlaceholder: 'Standard, Deluxe, Family...',
      descriptionPlaceholder: 'Hotel room description',
      saving: 'Saving...',
      loadError: 'Could not load rooms.',
      imageTypeError: 'Please choose JPEG, PNG or WebP only.',
      imageSizeError: 'Image must not exceed 5 MB.',
      validation: 'Enter a room name, valid price and whole-number guest capacity.',
      saveError: 'Could not save room. Check your information and account permissions.',
      availabilityError: 'Could not update room availability.',
      confirmDelete: 'Do you want to delete this room?',
      deleted: 'Room deleted.',
      deleteError: 'Could not delete room. Existing bookings may prevent deletion.',
      night: 'night',
      guests: 'guests'
    },
    am: {
      title: '🏨 የሆቴል ክፍሎች አስተዳደር',
      name: 'የክፍሉ ስም',
      description: 'የክፍሉ መግለጫ',
      price: 'የአንድ ሌሊት ዋጋ (ETB)',
      capacity: 'የእንግዶች ብዛት',
      image: 'የክፍሉን ፎቶ ይምረጡ',
      save: 'ክፍል ያስመዝግቡ',
      update: 'ለውጡን ያስቀምጡ',
      edit: 'አስተካክል',
      remove: 'ሰርዝ',
      available: 'ክፍሉ ይገኛል',
      unavailable: 'ክፍሉ አይገኝም',
      loading: 'ክፍሎችን በመጫን ላይ...',
      empty: 'እስካሁን ክፍል አልተመዘገበም።',
      success: 'ክፍሉ ተቀምጧል።',
      error: 'ስህተት: ',
      cancel: 'ይቅር',
      refresh: 'አድስ',
      roomPlaceholder: 'መደበኛ፣ ዴሉክስ፣ ቤተሰብ...',
      descriptionPlaceholder: 'የሆቴል ክፍል መግለጫ',
      saving: 'በማስቀመጥ ላይ...',
      loadError: 'ክፍሎችን መጫን አልተቻለም።',
      imageTypeError: 'JPEG፣ PNG ወይም WebP ብቻ ይምረጡ።',
      imageSizeError: 'የፎቶው መጠን ከ5 MB መብለጥ የለበትም።',
      validation: 'የክፍል ስም፣ ትክክለኛ ዋጋ እና የእንግዶች ብዛት ያስገቡ።',
      saveError: 'ክፍሉን ማስቀመጥ አልተቻለም። መረጃዎንና የመለያዎን ፈቃድ ያረጋግጡ።',
      availabilityError: 'የክፍሉን መገኘት ሁኔታ መቀየር አልተቻለም።',
      confirmDelete: 'ይህን ክፍል መሰረዝ ይፈልጋሉ?',
      deleted: 'ክፍሉ ተሰርዟል።',
      deleteError: 'ክፍሉን መሰረዝ አልተቻለም። ያሉ ቦታ ማስያዣዎች መሰረዙን ሊከለክሉ ይችላሉ።',
      night: 'ሌሊት',
      guests: 'እንግዶች'
    }
  }

  const t = words[language] || words.en
  const roomsRequest = useRef(0)
  const saveRoomLock = useRef(false)

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [capacity, setCapacity] = useState('1')
  const [imageFile, setImageFile] = useState(null)
  const [currentImage, setCurrentImage] = useState('')

  const loadRooms = useCallback(async () => {
    const selectedVendorId = vendorId

    if (!selectedVendorId) {
      roomsRequest.current += 1
      setRooms([])
      setLoading(false)
      return
    }

    const requestId = ++roomsRequest.current
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('hotel_rooms')
        .select('id,room_name,description,nightly_price,capacity,image_url,available')
        .eq('vendor_id', selectedVendorId)
        .order('created_at', { ascending: false })

      if (requestId !== roomsRequest.current) return
      if (error) throw error

      setRooms(data || [])
    } catch (err) {
      if (requestId !== roomsRequest.current) return
      console.error('Hotel rooms loading failed:', err)
      setMessage(t.error + t.loadError)
    } finally {
      if (requestId === roomsRequest.current) setLoading(false)
    }
  }, [vendorId, t.error])

  useEffect(() => {
    let active = true

    Promise.resolve().then(() => {
      if (active) loadRooms()
    })

    return () => {
      active = false
      roomsRequest.current += 1
    }
  }, [loadRooms])

  function resetForm() {
    setEditingId(null)
    setRoomName('')
    setDescription('')
    setPrice('')
    setCapacity('1')
    setImageFile(null)
    setCurrentImage('')
  }

  async function uploadImage() {
    if (!imageFile) {
      return { url: currentImage || null, path: null }
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(imageFile.type)) {
      throw new Error(t.imageTypeError)
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error(t.imageSizeError)
    }

    const extension = imageFile.type.split('/')[1].replace('jpeg', 'jpg')
    const path = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

    const { error } = await supabase.storage
      .from('hotel-room-images')
      .upload(path, imageFile, {
        cacheControl: '3600',
        contentType: imageFile.type,
        upsert: false
      })

    if (error) throw error

    const { data } = supabase.storage
      .from('hotel-room-images')
      .getPublicUrl(path)

    return { url: data.publicUrl, path }
  }

  function getRoomImagePath(imageUrl) {
    if (!imageUrl) return null

    const marker = '/storage/v1/object/public/hotel-room-images/'
    const index = imageUrl.indexOf(marker)
    if (index === -1) return null

    try {
      return decodeURIComponent(imageUrl.slice(index + marker.length))
    } catch {
      return null
    }
  }

  async function saveRoom(e) {
    e.preventDefault()

    if (!vendorId || saveRoomLock.current) return

    const numericPrice = Number(price)
    const numericCapacity = Number(capacity)

    if (
      !roomName.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !Number.isFinite(numericCapacity) ||
      !Number.isInteger(numericCapacity) ||
      numericCapacity < 1
    ) {
      setMessage(t.validation)
      return
    }

    saveRoomLock.current = true
    setSaving(true)
    setMessage('')

    let uploadedImagePath = null

    try {
      const uploadedImage = await uploadImage()
      uploadedImagePath = uploadedImage.path

      const values = {
        room_name: roomName.trim(),
        description: description.trim(),
        nightly_price: numericPrice,
        capacity: numericCapacity,
        image_url: uploadedImage.url
      }

      let result

      if (editingId) {
        result = await supabase
          .from('hotel_rooms')
          .update(values)
          .eq('id', editingId)
          .eq('vendor_id', vendorId)
          .select('id')
          .single()
      } else {
        result = await supabase
          .from('hotel_rooms')
          .insert({
            ...values,
            vendor_id: vendorId,
            available: true
          })
          .select('id')
          .single()
      }

      if (result.error) throw result.error

      // Suuraa duraanii haquu: database update milkaa'uu booda qofa.
      if (editingId && uploadedImagePath && currentImage) {
        const oldPath = getRoomImagePath(currentImage)

        if (oldPath) {
          const { error: cleanupError } = await supabase.storage
            .from('hotel-room-images')
            .remove([oldPath])

          if (cleanupError) {
            console.warn('Old room image cleanup failed:', cleanupError)
          }
        }
      }

      setMessage(t.success)
      resetForm()
      await loadRooms()
    } catch (error) {
      // Database save yoo kufe suuraa haaraa olkaa'ame qulqulleessi.
      if (uploadedImagePath) {
        const { error: cleanupError } = await supabase.storage
          .from('hotel-room-images')
          .remove([uploadedImagePath])

        if (cleanupError) {
          console.warn('New room image cleanup failed:', cleanupError)
        }
      }

      console.error('Hotel room save failed:', error)
      setMessage(t.error + t.saveError)
    } finally {
      saveRoomLock.current = false
      setSaving(false)
    }
  }

  function editRoom(room) {
    setEditingId(room.id)
    setRoomName(room.room_name || '')
    setDescription(room.description || '')
    setPrice(String(room.nightly_price))
    setCapacity(String(room.capacity))
    setCurrentImage(room.image_url || '')
    setImageFile(null)
    setMessage('')
  }

  async function toggleAvailability(room) {
    if (!vendorId || actionId || saving) return

    setActionId(room.id)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('hotel_rooms')
        .update({ available: !room.available })
        .eq('id', room.id)
        .eq('vendor_id', vendorId)
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Room not found or update not permitted.')

      await loadRooms()
    } catch (err) {
      console.error('Room availability update failed:', err)
      setMessage(t.error + t.availabilityError)
    } finally {
      setActionId(null)
    }
  }

  async function deleteRoom(room) {
    if (!vendorId || actionId || saving) return
    if (!window.confirm(t.confirmDelete)) return

    setActionId(room.id)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('hotel_rooms')
        .delete()
        .eq('id', room.id)
        .eq('vendor_id', vendorId)
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Room not found or deletion not permitted.')

      const imagePath = getRoomImagePath(room.image_url)

      if (imagePath) {
        const { error: imageError } = await supabase.storage
          .from('hotel-room-images')
          .remove([imagePath])

        if (imageError) {
          console.warn('Room image cleanup failed:', imageError)
        }
      }

      setMessage(t.deleted)
      await loadRooms()
    } catch (err) {
      console.error('Room deletion failed:', err)
      setMessage(t.error + t.deleteError)
    } finally {
      setActionId(null)
    }
  }

  return (
    <section className="vendor-orders">
      <h3>{t.title}</h3>

      <form className="order-form" onSubmit={saveRoom}>
        <label>{t.name}</label>
        <input
          required
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
          placeholder={t.roomPlaceholder}
        />

        <label>{t.description}</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t.descriptionPlaceholder}
        />

        <label>{t.price}</label>
        <input
          required
          type="number"
          min="1"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />

        <label>{t.capacity}</label>
        <input
          required
          type="number"
          min="1"
          step="1"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
        />

        <label>{t.image} (max 5 MB)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
        />

        {currentImage && !imageFile && (
          <img
            src={currentImage}
            alt="Room"
            style={{ width: '150px', borderRadius: '8px' }}
          />
        )}

        {imageFile && (
          <p>{imageFile.name}</p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={saving}
        >
          {saving ? t.saving : editingId ? t.update : t.save}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            {t.cancel}
          </button>
        )}
      </form>

      {message && <p className="notice">{message}</p>}

      <h3>{t.title} — {rooms.length}</h3>

      <button
        type="button"
        className="primary-button"
        onClick={loadRooms}
        disabled={loading}
      >
        {loading ? t.loading : t.refresh}
      </button>

      {loading && <p>{t.loading}</p>}

      {!loading && rooms.length === 0 && <p>{t.empty}</p>}

      {rooms.map(room => (
        <article className="cart-item" key={room.id}>
          <div>
            {room.image_url && (
              <img
                src={room.image_url}
                alt={room.room_name}
                style={{
                  width: '100%',
                  maxWidth: '260px',
                  borderRadius: '8px'
                }}
              />
            )}

            <h4>{room.room_name}</h4>
            <p>{room.description}</p>
            <p><strong>{Number(room.nightly_price).toLocaleString()} ETB / {t.night}</strong></p>
            <p>{room.capacity} {t.guests}</p>
            <p>{room.available ? t.available : t.unavailable}</p>
          </div>

          <button type="button" disabled={!!actionId || saving} onClick={() => editRoom(room)}>
            {t.edit}
          </button>

          <button type="button" disabled={!!actionId || saving} onClick={() => toggleAvailability(room)}>
            {room.available ? t.unavailable : t.available}
          </button>

          <button type="button" disabled={!!actionId || saving} onClick={() => deleteRoom(room)}>
            {t.remove}
          </button>
        </article>
      ))}
    </section>
  )
}
