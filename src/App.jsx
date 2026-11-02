import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
const AuthPanel = lazy(() => import('./AuthPanel'))
import { supabase } from './lib/supabase'
const HotelBooking = lazy(() => import('./HotelBooking'))
const HotelRoomManagement = lazy(() => import('./HotelRoomManagement'))
const HotelBookingManagement = lazy(() => import('./HotelBookingManagement'))
import { Translate } from './i18n'

const categories = [
  'NYAATA',
  'DHUGAATII',
]

const foodSuggestions = {
  'NYAATA': [
    'Injera', 'Marqaa', 'Caccabsaa', 'Buddeena', 'Firfir',
    'Doro Wot', 'Siga Wot', 'Shiro Wot', 'Misir Wot',
    'Kik Wot', 'Atakilt Wot', 'Bayenetu', 'Kitfo',
    'Gored Gored', 'Dulet', 'Tibs', 'Quanta Firfir',
    'Chechebsa', 'Genfo', 'Bursame', 'Kitta',
    'Anjero', 'Fuul', 'Sambusa', 'Omelette',
    'Egg Sandwich', 'Pancake', 'Toast', 'Porridge',
    'Boqqolloo Affeelame', 'Boqqolloo Waadame', 'Kolo',
    'Pizza', 'Burger', 'Cheeseburger', 'Sandwich',
    'Shawarma', 'Pasta', 'Spaghetti', 'Macaroni',
    'Fried Chicken', 'Grilled Chicken', 'Chicken Wings',
    'French Fries', 'Fried Fish', 'Grilled Fish',
    'Rice', 'Salad', 'Steak', 'Hot Dog',
    'Popcorn', 'Chips', 'Biscuit', 'Peanuts',
    'Cake', 'Donut', 'Ice Cream', 'Pudding',
    'Baklava', 'Fruit Salad', 'Samosa'
  ],
  'DHUGAATII': [
    'Buna Oromoo', 'Buna Jebena', 'Buna Aannan',
    'Shaayii', 'Shaayii Aadaa', 'Atmit',
    'Aannan', 'Aannan Dhadhaa',
    'Juice Burtukaana', 'Juice Muuzii', 'Juice Mango',
    'Juice Avokaadoo', 'Juice Paappayaa',
    'Mixed Juice', 'Watermelon Juice', 'Lemon Juice',
    'Fruit Smoothie', 'Milkshake', 'Bishaan',
    'Coca-Cola', 'Fanta', 'Sprite', 'Pepsi',
    'Coffee', 'Iced Coffee', 'Iced Tea',
    'Hot Chocolate', 'Lemonade'
  ]
}

export default function App() {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('milki-food-language')
      return ['om', 'en', 'am'].includes(saved) ? saved : 'om'
    } catch {
      return 'om'
    }
  })

  useEffect(() => {
    localStorage.setItem('milki-food-language', language)
  }, [language])

  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Session error:', error.message)
        return
      }
      if (mounted) setUser(data.session?.user ?? null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) setUser(session?.user ?? null)
      }
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('milki-food-items') || '[]')
      return saved.map(item => ({
        ...item,
        category: String(item.category || '').startsWith('Dhugaatii') ||
          item.category === 'DHUGAATII'
          ? 'DHUGAATII'
          : 'NYAATA'
      }))
    } catch {
      return []
    }
  })

  //
  const [vendors, setVendors] = useState([])
  const [newVendor, setNewVendor] = useState('')
  const [newVendorType, setNewVendorType] = useState('Hotel')
  const [newVendorPhone, setNewVendorPhone] = useState('')
  const [newVendorCity, setNewVendorCity] = useState('')
  const [newVendorAddress, setNewVendorAddress] = useState('')
  const [vendor, setVendor] = useState('')
  const [vendorType, setVendorType] = useState('Restaurant')
  const [, setVendorPhone] = useState('')
  const [, setVendorCity] = useState('')
  const [, setVendorAddress] = useState('')
  const [vendorStatus, setVendorStatus] = useState('Hin galmoofne')
  const [vendorDbId, setVendorDbId] = useState(null)
  const [vendorLoading, setVendorLoading] = useState(false)
  const vendorOrdersRequest = useRef(0)
  const vendorRegistrationLock = useRef(false)
  const menuItemLock = useRef(false)



  const [food, setFood] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Hunda')
  const [message, setMessage] = useState('')
  const [showVendor, setShowVendor] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminVendors, setAdminVendors] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [vendorStatusUpdating, setVendorStatusUpdating] = useState(false)

  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerCity, setCustomerCity] = useState('')
  const [customerArea, setCustomerArea] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const orderSubmitLock = useRef(false)
  const orderStatusUpdates = useRef(new Set())
  const [orderTrackingCodes, setOrderTrackingCodes] = useState([])
  const [trackingToken, setTrackingToken] = useState('')
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [trackingMessage, setTrackingMessage] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [vendorOrders, setVendorOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersMessage, setOrdersMessage] = useState('')

  function applyVendorSelection(row) {
    vendorOrdersRequest.current += 1
    setVendorOrders([])
    setOrdersMessage('')
    setOrdersLoading(false)
    if (!row) {
      setVendorDbId(null)
      setVendor('')
      setVendorType('Restaurant')
      setVendorPhone('')
      setVendorCity('')
      setVendorAddress('')
      setVendorStatus('Hin galmoofne')
      return
    }

    setVendorDbId(row.id)
    setVendor(row.business_name || '')
    setVendorType(row.vendor_type || 'Restaurant')
    setVendorPhone(row.phone || '')
    setVendorCity(row.city || '')
    setVendorAddress(row.address || '')
    setVendorStatus(
      row.status === 'approved' ? 'Raggaasifame' :
      row.status === 'pending' ? 'Eeggataa' :
      row.status === 'rejected' ? 'Didame' :
      row.status === 'suspended' ? 'Dhaabbate' : 'Hin galmoofne'
    )
  }

  useEffect(() => {
    let active = true

    async function loadMyVendors() {
      if (!user) {
        setVendors([])
        applyVendorSelection(null)
        setVendorLoading(false)
        return
      }

      setVendorLoading(true)
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('id,business_name,vendor_type,phone,city,address,status,created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!active) return

        const rows = data || []
        setVendors(rows)
        applyVendorSelection(rows[0] || null)
      } catch (error) {
        console.error('Vendor profiles loading error:', error)
        if (active) {
          setMessage('Odeeffannoo daldaltootaa fiduun hin milkoofne. Maaloo irra deebi’i.')
        }
      } finally {
        if (active) setVendorLoading(false)
      }
    }

    loadMyVendors()
    return () => { active = false }
  }, [user])



  useEffect(() => {
    localStorage.setItem('milki-food-items', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    let active = true

    async function loadMenuItems() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id,name,category,description,price,vendor_id,vendors(business_name)')
        .eq('available', true)
        .order('created_at', { ascending: false })

      if (!active) return

      if (error) {
        console.error('Menu loading error:', error)
        setMessage('Menu fiduun hin milkoofne: ' + error.message)
        return
      }

      setItems((data || []).map(item => ({
        id: item.id,
        vendor_id: item.vendor_id,
        vendor: item.vendors?.business_name || '',
        food: item.name,
        category: item.category,
        price: Number(item.price),
        description: item.description || ''
      })))
    }

    loadMenuItems()
    return () => { active = false }
  }, [user])

  const loadVendorOrders = useCallback(async () => {
    const selectedVendorId = vendorDbId

    if (!selectedVendorId || vendorStatus !== 'Raggaasifame') {
      vendorOrdersRequest.current += 1
      setVendorOrders([])
      setOrdersLoading(false)
      setOrdersMessage('Daldalaan raggaasifame qofti ajajoota ilaalu danda’a.')
      return
    }

    const requestId = ++vendorOrdersRequest.current
    setOrdersLoading(true)
    setOrdersMessage('Ajajoota feaa jira...')

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id,customer_name,customer_phone,city,neighborhood,delivery_address,delivery_notes,status,subtotal,created_at,order_items(item_name,unit_price,quantity,line_total)')
        .eq('vendor_id', selectedVendorId)
        .order('created_at', { ascending: false })

      if (requestId !== vendorOrdersRequest.current) return
      if (error) throw error

      setVendorOrders(data || [])
      setOrdersMessage(data?.length ? '' : 'Ammaaf ajajni haaraan hin jiru.')
    } catch (error) {
      console.error('Vendor orders loading error:', error)
      if (requestId === vendorOrdersRequest.current) {
        setOrdersMessage('Ajajoota fiduun hin milkoofne. Maaloo irra deebi’i.')
      }
    } finally {
      if (requestId === vendorOrdersRequest.current) {
        setOrdersLoading(false)
      }
    }
  }, [vendorDbId, vendorStatus])
  useEffect(() => {
    let active = true

    Promise.resolve().then(() => {
      if (active && showVendor && vendorDbId && vendorStatus === 'Raggaasifame') {
        loadVendorOrders()
      }
    })

    return () => {
      active = false
    }
  }, [showVendor, vendorDbId, vendorStatus, loadVendorOrders])

  async function updateVendorOrderStatus(orderId, nextStatus) {
    const allowedStatuses = [
      'new', 'accepted', 'preparing', 'ready',
      'on_the_way', 'out_for_delivery', 'delivered', 'cancelled'
    ]

    if (
      !vendorDbId ||
      vendorStatus !== 'Raggaasifame' ||
      !allowedStatuses.includes(nextStatus) ||
      orderStatusUpdates.current.has(orderId)
    ) {
      return
    }

    orderStatusUpdates.current.add(orderId)
    setOrdersMessage('Haala ajajaa haaromsaa jira...')

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId)
        .eq('vendor_id', vendorDbId)
        .select('id,status')
        .single()

      if (error) throw error

      setVendorOrders(current =>
        current.map(order =>
          order.id === orderId ? { ...order, status: data.status } : order
        )
      )
      setOrdersMessage('Haalli ajajaa jijjiirameera.')
    } catch (error) {
      console.error('Order status update error:', error)
      setOrdersMessage('Haala ajajaa jijjiiruun hin milkoofne.')
    } finally {
      orderStatusUpdates.current.delete(orderId)
    }
  }

  async function registerVendor() {
    if (!user) {
      setMessage('Dura account kee seeni.')
      return
    }

    if (vendorRegistrationLock.current) return

    if (!newVendor.trim() || !newVendorPhone.trim() || !newVendorCity.trim() || !newVendorAddress.trim()) {
      setMessage('Maqaa daldalaa, bilbila, magaalaa fi teessoo guutuu galchi.')
      return
    }

    vendorRegistrationLock.current = true
    setVendorLoading(true)

    try {
      const { data, error } = await supabase.from('vendors').insert({
        owner_id: user.id,
        business_name: newVendor.trim(),
        vendor_type: newVendorType,
        phone: newVendorPhone.trim(),
        city: newVendorCity.trim(),
        address: newVendorAddress.trim()
      }).select('id,business_name,vendor_type,phone,city,address,status,created_at').single()

      if (error) throw error

      setVendors(current => [data, ...current])
      applyVendorSelection(data)
      setNewVendor('')
      setNewVendorPhone('')
      setNewVendorCity('')
      setNewVendorAddress('')
      setMessage('Daldalaan haaraan galmaa’eera. Eeyyama Admin MILKI eeggadhu.')
    } catch (error) {
      console.error('Vendor registration error:', error)
      setMessage('Galmeen daldalaa hin milkoofne. Maaloo irra deebi’i.')
    } finally {
      vendorRegistrationLock.current = false
      setVendorLoading(false)
    }
  }

  async function loadAdminVendors() {
    setAdminLoading(true)

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id,business_name,vendor_type,phone,city,address,status,created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      setAdminVendors(data || [])
    } catch (error) {
      console.error('Admin vendor loading error:', error)
      setMessage('Galmee daldaltootaa fiduun hin milkoofne. Maaloo irra deebi’i.')
    } finally {
      setAdminLoading(false)
    }
  }

  async function updateVendorStatus(id, status) {
    if (!id || !['approved', 'rejected'].includes(status)) {
      setMessage('Odeeffannoon jijjiirraa sirrii miti.')
      return
    }

    if (user?.app_metadata?.role !== 'admin') {
      setMessage('Jijjiirraa kana raawwachuuf hayyama admin barbaachisa.')
      return
    }

    if (vendorStatusUpdating) return

    setVendorStatusUpdating(true)
    try {
      const { error } = await supabase
        .from('vendors')
        // oxlint-disable-next-line react/purity -- timestamp is generated only when an admin updates vendor status
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setMessage(status === 'approved'
        ? 'Daldalaan raggaasifameera.'
        : 'Galmeen daldalaa didameera.')

      await loadAdminVendors()
    } catch (error) {
      console.error('Vendor status update error:', error)
      setMessage('Haala galmee daldalaa jijjiiruun hin milkoofne. Maaloo irra deebi’i.')
    } finally {
      setVendorStatusUpdating(false)
    }
  }

  useEffect(() => {
    let active = true

    Promise.resolve().then(() => {
      if (active && showAdmin && user?.app_metadata?.role === 'admin') {
        loadAdminVendors()
      }
    })

    return () => {
      active = false
    }
  }, [showAdmin, user])

  async function addItem(e) {
    e.preventDefault()

    if (!user) {
      setMessage('Dura account kee seeni.')
      return
    }

    if (!vendorDbId || vendorStatus !== 'Raggaasifame') {
      setMessage('Daldalaan kee database keessatti raggaasifamuu qaba.')
      return
    }

    const numericPrice = Number(price)
    if (!food.trim() || !price || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setMessage('Maqaa nyaataa fi gatii sirrii galchi.')
      return
    }

    if (menuItemLock.current) return
    menuItemLock.current = true

    try {
      const selectedVendorId = vendorDbId
      const selectedVendorName = vendor

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          vendor_id: selectedVendorId,
          name: food.trim(),
          category,
          price: numericPrice,
          description: description.trim(),
          available: true
        })
        .select('id,name,category,description,price,vendor_id')
        .single()

      if (error) throw error

      setItems(previous => [{
        id: data.id,
        vendor_id: data.vendor_id,
        vendor: selectedVendorName,
        food: data.name,
        category: data.category,
        price: Number(data.price),
        description: data.description || ''
      }, ...previous])

      setFood('')
      setPrice('')
      setDescription('')
      setMessage('Menu database MILKI keessatti kuufameera.')
    } catch (error) {
      console.error('Menu insert error:', error)
      setMessage('Menu kuusuun hin milkoofne. Maaloo irra deebi’i.')
    } finally {
      menuItemLock.current = false
    }
  }

  async function deleteItem(id) {
    const item = items.find(entry => entry.id === id)

    if (!item || item.vendor_id !== vendorDbId) {
      setMessage('Menu kana haquuf hayyama hin qabdu.')
      return
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('vendor_id', vendorDbId)

    if (error) {
      console.error('Menu delete error:', error)
      setMessage('Menu haquun hin milkoofne: ' + error.message)
      return
    }

    setItems(previous => previous.filter(entry => entry.id !== id))
    setMessage('Menu database irraa haqameera.')
  }


  function getOrderStatusLabel(status) {
    const labels = {
      new: 'Ajaja haaraa',
      accepted: 'Ajajni fudhatame',
      preparing: 'Nyaata qopheessaa jiru',
      ready: 'Nyaanni qophaaʼeera',
      on_the_way: 'Karaa irra jira',
      out_for_delivery: 'Geejjibaan ergame',
      delivered: 'Maamila bira gaʼe',
      cancelled: 'Ajajni haqame',
    }
    return labels[status] || status
  }

  async function trackCustomerOrder(e) {
    e?.preventDefault()
    const token = trackingToken.trim()

    if (!token) {
      setTrackingMessage('Koodii iccitii hordoffii galchi.')
      return
    }

    setTrackingLoading(true)
    setTrackingMessage('')

    try {
      const { data, error } = await supabase.rpc('track_guest_order', {
        p_token: token
      })

      if (error) throw error

      if (!data || !data.order_id) {
        setTrackingMessage('Koodiin hordoffii sirrii miti.')
        setTrackingOrder(null)
      } else {
        setTrackingOrder(data)
        setTrackingMessage('Haalli ajajaa haaromfameera.')
      }
    } catch (error) {
      console.error('Order tracking error:', error)
      setTrackingMessage('Hordoffiin hin milkoofne. Maaloo koodii kee mirkaneessiitii irra deebi’i.')
    } finally {
      setTrackingLoading(false)
    }
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()

    if (orderSubmitLock.current || orderSubmitting) return

    if (!cart.length) {
      setOrderMessage('Cart kee duwwaa dha.')
      return
    }

    const phoneDigits = customerPhone.replace(/\D/g, '')
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setOrderMessage('Lakkoofsi bilbilaa sirrii galchi.')
      return
    }

    if (
      customerName.trim().length < 2 ||
      customerCity.trim().length < 2 ||
      customerArea.trim().length < 1 ||
      deliveryAddress.trim().length < 4
    ) {
      setOrderMessage('Odeeffannoo maamilaa fi teessoo guutuu sirreessi.')
      return
    }

    if (cart.some(item =>
      !item.id ||
      !item.vendor_id ||
      !Number.isInteger(Number(item.quantity || 1)) ||
      Number(item.quantity || 1) < 1 ||
      Number(item.quantity || 1) > 99
    )) {
      setOrderMessage('Meeshaa ykn baay’ina isaa sirreessi; menu haaromsi.')
      return
    }

    orderSubmitLock.current = true
    setOrderSubmitting(true)
    setOrderMessage('Ajaja kee database MILKI keessatti kuusaa jira...')

    try {
      const groups = cart.reduce((result, item) => {
        if (!result[item.vendor_id]) result[item.vendor_id] = []
        result[item.vendor_id].push(item)
        return result
      }, {})

      const results = []
      const failedVendors = []
      const successfulVendorIds = []

      for (const [vendorId, vendorItems] of Object.entries(groups)) {
        try {
          const { data, error } = await supabase.rpc('place_guest_order', {
            p_vendor_id: vendorId,
            p_customer_name: customerName.trim(),
            p_customer_phone: customerPhone.trim(),
            p_city: customerCity.trim(),
            p_neighborhood: customerArea.trim(),
            p_delivery_address: deliveryAddress.trim(),
            p_delivery_notes: deliveryNote.trim(),
            p_items: vendorItems.map(item => ({
              menu_item_id: item.id,
              quantity: Number(item.quantity || 1)
            }))
          })

          if (error) throw error
          if (!data?.order_id || !data?.tracking_token) {
            throw new Error('Deebiin ajajaa guutuu miti.')
          }

          results.push(data)
          successfulVendorIds.push(vendorId)
        } catch (error) {
          console.error('Vendor order error:', vendorId, error)
          failedVendors.push({ vendorId, message: error.message })
        }
      }

      if (results.length) {
        setOrderTrackingCodes(previous => [
          ...previous,
          ...results.map((result, index) => ({
            orderId: result.order_id,
            token: result.tracking_token,
            index: previous.length + index + 1
          }))
        ])
      }

      if (successfulVendorIds.length) {
        setCart(previous =>
          previous.filter(item => !successfulVendorIds.includes(item.vendor_id))
        )
      }

      const total = results.reduce(
        (sum, result) => sum + Number(result.subtotal || 0), 0
      )

      if (failedVendors.length) {
        setOrderMessage(
          `${results.length} ajajni milkaa'e. Waliigala: ${total} ETB. ` +
          `${failedVendors.length} ajajni kufe; meeshaaleen isaanii cart keessatti hafaniiru.`
        )
      } else if (results.length) {
        setOrderMessage(
          `Ajajni kee hundi Supabase keessatti kuufameera. Waliigala: ${total} ETB.`
        )
      } else {
        setOrderMessage('Ajaja kee kuusuun hin milkoofne. Odeeffannoo kee ilaali.')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      setOrderMessage('Ajaja kuusuun hin milkoofne. Maaloo irra deebi’i.')
    } finally {
      orderSubmitLock.current = false
      setOrderSubmitting(false)
    }
  }

  const vendorMenuItems = items.filter(
    item => item.vendor_id === vendorDbId
  )

  const filteredItems = items.filter(item => {
    const matchesSearch =
      `${item.food} ${item.vendor} ${item.category}`
        .toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filter === 'Hunda' || item.category === filter
    return matchesSearch && matchesCategory
  })

  return (
    <Translate language={language}>
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">🍽️</span>
          <span>MILKI <b>FOOD</b><small>& DRINK DELIVERY</small></span>
        </a>
        <button className="cart-button" onClick={() => setShowVendor(!showVendor)}>
          🏪 Dashboard Daldalaa
        </button>
        <label className="language-picker">
          Language
          <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Language">
            <option value="om">Afaan Oromoo</option>
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
        </label>
        {user?.app_metadata?.role === 'admin' && (
          <button className="cart-button" onClick={() => setShowAdmin(v => !v)}>
            🔐 Admin
          </button>
        )}
      </header>

      <Suspense fallback={<p>Fuula fe’aa jira...</p>}><AuthPanel user={user} onAuthChange={setUser} language={language} /></Suspense>

      {showAdmin && user?.app_metadata?.role === 'admin' && (
        <section className="vendor-panel">
          <h2>🔐 Dashboard Admin MILKI</h2>
          <h3>Galmee daldaltootaa ({adminVendors.length})</h3>
          <button type="button" onClick={loadAdminVendors}>
            Haaromsi
          </button>
          {adminLoading && <p>Galmee daldaltootaa fe'aa jira...</p>}
          {!adminLoading && adminVendors.length === 0 && (
            <p>Ammaaf galmeen daldalaa hin jiru.</p>
          )}
          {adminVendors.map(v => (
            <div className="cart-item" key={v.id}>
              <div>
                <h3>{v.business_name}</h3>
                <p>Gosa: {v.vendor_type}</p>
                <p>Bilbila: {v.phone}</p>
                <p>Magaalaa: {v.city}</p>
                <p>Teessoo: {v.address}</p>
                <p>Haala: <strong>{v.status}</strong></p>
              </div>
              <button type="button" className="primary-button"
                disabled={vendorStatusUpdating || v.status === 'approved'}
                onClick={() => updateVendorStatus(v.id, 'approved')}>
                ✓ Raggaasisi
              </button>
              <button type="button"
                disabled={vendorStatusUpdating || v.status === 'rejected'}
                onClick={() => updateVendorStatus(v.id, 'rejected')}>
                ✕ Diduu
              </button>
            </div>
          ))}
        </section>
      )}

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">ETHIOPIA WIDE DELIVERY 🇪🇹</span>
            <h1>Nyaata jaallattu, balbala mana keetti!</h1>
            <p>Nyaata fi dhugaatii filadhu. Daldalaan siif geessa.</p>
            <button className="primary-button"
              onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>
              Menu Ilaali ↓
            </button>
          </div>
          <div className="hero-art">🍲🥤</div>
        </section>

        {showVendor && (
          <section className="vendor-panel">
            <h2>🏪 Dashboard Daldalaa</h2>
            <p>Nyaata kee galmeessi; gatii isaa ati murteessi.</p>

            {vendorType?.toLowerCase() === 'hotel' && vendorDbId && vendorStatus === 'Raggaasifame' && (
              <>
                <Suspense fallback={<p>Fuula kutaa hoteelaa fe’aa jira...</p>}><HotelRoomManagement vendorId={vendorDbId} language={language} />
                <HotelBookingManagement vendorId={vendorDbId} language={language} /></Suspense>
              </>
            )}

            <section className="vendor-orders">
              <h3>📦 Ajajoota Maamiltootaa ({vendorOrders.length})</h3>
              <button type="button" className="primary-button"
                onClick={loadVendorOrders} disabled={ordersLoading || !vendorDbId || vendorStatus !== 'Raggaasifame'}>
                {ordersLoading ? 'Feaa jira...' : 'Ajajoota Haaromsi'}
              </button>
              {ordersMessage && <p className="notice">{ordersMessage}</p>}
              {vendorOrders.map(order => (
                <article className="cart-item" key={order.id}>
                  <div>
                    <h4>Ajaja #{order.id.slice(0, 8)}</h4>
                    <p style={{ overflowWrap: 'anywhere' }}>
                      <strong>ID Ajajaa Guutuu:</strong> <code>{order.id}</code>
                    </p>
                    <p><strong>Maamila:</strong> {order.customer_name}</p>
                    <p><strong>Bilbila:</strong> {order.customer_phone}</p>
                    <p><strong>Magaalaa:</strong> {order.city} · {order.neighborhood}</p>
                    <p><strong>Teessoo:</strong> {order.delivery_address}</p>
                    {order.delivery_notes && <p><strong>Yaada:</strong> {order.delivery_notes}</p>}
                    <p><strong>Haala amma:</strong> {order.status}</p>
                    <label>Haala ajajaa jijjiiri</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateVendorOrderStatus(order.id, e.target.value)}
                    >
                      <option value="new">Ajaja haaraa</option>
                      <option value="accepted">Ajaja fudhatame</option>
                      <option value="preparing">Nyaata qopheessaa jira</option>
                      <option value="ready">Nyaanni qophaa'eera</option>
                      <option value="on_the_way">Karaa irra jira</option>
                      <option value="out_for_delivery">Geejjibaan ergame</option>
                      <option value="delivered">Maamila bira gahe</option>
                      <option value="cancelled">Ajaja haqame</option>
                    </select>
                    <p><strong>Waliigala:</strong> {Number(order.subtotal).toFixed(2)} ETB</p>
                    <ul>
                      {(order.order_items || []).map((item, index) => (
                        <li key={index}>
                          {item.item_name} — {item.quantity} × {item.unit_price} ETB
                        </li>
                      ))}
                    </ul>
                    <small>{new Date(order.created_at).toLocaleString()}</small>
                  </div>
                </article>
              ))}
            </section>


            <div className="vendor-switcher">
              <label>Daldalaa filadhu</label>
              <select
                value={vendorDbId || ''}
                onChange={e => {
                  const selected = vendors.find(item => item.id === e.target.value)
                  if (selected) applyVendorSelection(selected)
                }}
              >
                <option value="">Daldalaa filadhu</option>
                {vendors.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.business_name} — {item.vendor_type}
                  </option>
                ))}
              </select>
              {vendorLoading && <p>Odeeffannoo daldalaa fe'aa jira...</p>}
            </div>

            <section className="vendor-registration">
              <h3>＋ Daldalaa haaraa galmeessi</h3>
              <label>Maqaa daldalaa haaraa</label>
              <input
                value={newVendor}
                onChange={e => setNewVendor(e.target.value)}
                placeholder="Maqaa Hotel ykn Restaurant"
              />

              <label>Gosa daldalaa</label>
              <select value={newVendorType} onChange={e => setNewVendorType(e.target.value)}>
                <option value="Hotel">Hotel</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Café">Café</option>
                <option value="Bakery">Bakery</option>
                <option value="Other">Kan biraa</option>
              </select>

              <label>Lakkoofsa bilbilaa</label>
              <input
                type="tel"
                value={newVendorPhone}
                onChange={e => setNewVendorPhone(e.target.value)}
                placeholder="09... ykn +251..."
              />

              <label>Magaalaa</label>
              <input
                value={newVendorCity}
                onChange={e => setNewVendorCity(e.target.value)}
                placeholder="Magaalaa daldalli jiru"
              />

              <label>Teessoo guutuu</label>
              <textarea
                value={newVendorAddress}
                onChange={e => setNewVendorAddress(e.target.value)}
                placeholder="Naannoo, kebele fi teessoo daldalaa"
              />

              <button
                className="primary-button"
                type="button"
                onClick={registerVendor}
                disabled={vendorLoading}
              >
                {vendorLoading ? 'Galmeessaa jira...' : 'Daldalaa Haaraa Galmeessi'}
              </button>
            </section>

            <p><strong>Daldalaa filatame:</strong> {vendor || 'Hin filatamne'}</p>
            <p><strong>Haala galmee:</strong> {vendorStatus}</p>

            {vendorDbId && vendorStatus === 'Raggaasifame' ? (
              <form className="order-form" onSubmit={addItem}>
              <label>Maqaa nyaataa ykn dhugaatii</label>
              <input required list="food-options" value={food}
                onChange={e => setFood(e.target.value)}
                placeholder="Maqaa nyaataa filadhu ykn barreessi" />
              <datalist id="food-options">
                {(foodSuggestions[category] || []).map(name =>
                  <option key={name} value={name} />
                )}
              </datalist>

              <label>Gosa nyaataa ({categories.length} filannoo)</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(name => <option key={name} value={name}>{name}</option>)}
              </select>

              <label>Gatii (ETB)</label>
              <input required type="number" min="1" value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Gatii daldalaan murteesse" />

              <label>Ibsa nyaataa (dirqama miti)</label>
              <textarea value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ibsa gabaabaa nyaataa" />

              <button className="primary-button" type="submit">
                + Menu irratti dabali
              </button>
            </form>
            ) : (
              <p className="notice">
                Daldalaa raggaasifame filadhu. Galmeen daldalaa haaraan eeyyama Admin MILKI eeggata.
              </p>
            )}


            {message && <p className="notice">{message}</p>}

            <h3>Nyaata ani galmeesse: {vendorMenuItems.length}</h3>
            {vendorMenuItems.map(item => (
              <div className="cart-item" key={item.id}>
                <span>{item.food} — {item.price} ETB</span>
                <button onClick={() => deleteItem(item.id)}>Haquu ✕</button>
              </div>
            ))}
          </section>
        )}

        <section className="menu-section">
          <h2>🛒 Cart Koo ({cart.length})</h2>
          {cart.map((item, index) => (
            <div className="cart-item" key={`${item.id}-${index}`}>
              <span>{item.food} — {item.price} ETB</span>
              <button type="button" onClick={() =>
                setCart(previous => previous.map((entry, i) =>
                  i === index ? { ...entry, quantity: Math.max(1, (entry.quantity || 1) - 1) } : entry
                ))
              }>−</button>
              <strong>{item.quantity || 1}</strong>
              <button type="button" onClick={() =>
                setCart(previous => previous.map((entry, i) =>
                  i === index ? { ...entry, quantity: Math.min(99, (entry.quantity || 1) + 1) } : entry
                ))
              }>+</button>
              <button type="button" onClick={() =>
                setCart(previous => previous.filter((_, i) => i !== index))
              }>Haquu ✕</button>
            </div>
          ))}
          <h3>
            Waliigala: {cart.reduce((total, item) => total + Number(item.price) * (item.quantity || 1), 0)} ETB
          </h3>
          <button className="primary-button"
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(!showCheckout)}>
            Odeeffannoo geejjibaa guuti
          </button>

          {showCheckout && (
            <form className="order-form" onSubmit={handlePlaceOrder}>
              <label>Maqaa guutuu</label>
              <input required value={customerName}
                onChange={e => setCustomerName(e.target.value)} />

              <label>Lakkoofsa bilbilaa</label>
              <input required type="tel" value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)} />

              <label>Magaalaa</label>
              <input required value={customerCity}
                onChange={e => setCustomerCity(e.target.value)} />

              <label>Naannoo / Kebele</label>
              <input required value={customerArea}
                onChange={e => setCustomerArea(e.target.value)} />

              <label>Teessuma geejjibaa guutuu</label>
              <textarea required value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)} />

              <label>Yaada dabalataa (dirqama miti)</label>
              <textarea value={deliveryNote}
                onChange={e => setDeliveryNote(e.target.value)} />

              <button className="primary-button" type="submit"
                disabled={orderSubmitting}>
                {orderSubmitting ? 'Ajaja ergaa jira...' : 'Order koo qopheessi'}
              </button>
              {orderMessage && <p className="notice">{orderMessage}</p>}
              {orderTrackingCodes.map(code => (
                <div className="notice" key={code.orderId}>
                  <p><strong>Ajaja {code.index}</strong>: {code.orderId}</p>
                  <p><strong>Koodii hordoffii:</strong></p>
                  <p style={{ overflowWrap: 'anywhere', fontWeight: 'bold' }}>{code.token}</p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => navigator.clipboard.writeText(code.token)}
                  >
                    Koodii Copy Godhi
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setTrackingToken(code.token)
                      setTrackingMessage('')
                      setTrackingOrder(null)
                    }}
                  >
                    Koodii Hordoffii Guuti
                  </button>
                </div>
              ))}
            </form>
          )}
        </section>

        <Suspense fallback={<p>Fuula booking fe’aa jira...</p>}><HotelBooking language={language} /></Suspense>

        <section className="tracking-section">
        <h2>Ajaja Koo Hordofi</h2>
        <p>Koodii iccitii hordoffii kee galchi.</p>
        <form className="order-form" onSubmit={trackCustomerOrder}>
          <label>Koodii Hordoffii</label>
          <input
            value={trackingToken}
            onChange={e => setTrackingToken(e.target.value)}
            placeholder="Koodii iccitii hordoffii"
            autoComplete="off"
            required
          />
          <button className="primary-button" type="submit" disabled={trackingLoading}>
            {trackingLoading ? 'Hordofaa jira...' : 'Ajaja koo ilaali'}
          </button>
        </form>
        {trackingMessage && <p className="notice">{trackingMessage}</p>}
        {trackingOrder && (
          <article className="cart-item">
            <h3>Ajaja #{trackingOrder.order_id.slice(0, 8)}</h3>
            <p><strong>Daldalaa:</strong> {trackingOrder.vendor_name}</p>
            <p><strong>Haala:</strong> {getOrderStatusLabel(trackingOrder.status)}</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => trackCustomerOrder()}
              disabled={trackingLoading}
            >
              {trackingLoading ? 'Haaromsaa jira...' : 'Ajaja koo haaromsi'}
            </button>
            <p><strong>Waliigala:</strong> {Number(trackingOrder.subtotal).toFixed(2)} ETB</p>
            <ul>
              {(trackingOrder.items || []).map((item, index) => (
                <li key={index}>
                  {item.name} — {item.quantity} × {item.unit_price} ETB
                </li>
              ))}
            </ul>
            <small>{new Date(trackingOrder.created_at).toLocaleString()}</small>
          </article>
        )}
      </section>

      <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MILKI MENU</span>
              <h2>Menu Nyaataa fi Dhugaatii</h2>
            </div>
            <input className="search" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nyaata ykn daldalaa barbaadi..." />
          </div>

          <label>Gosa nyaataa filadhu</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="Hunda">Gosoota hunda</option>
            {categories.map(name => <option key={name} value={name}>{name}</option>)}
          </select>

          <div className="food-grid">
            {filteredItems.map(item => (
              <article className="food-card" key={item.id}>
                <div className="food-image">🍽️</div>
                <div className="food-info">
                  <h3>{item.food}</h3>
                  <p>{item.vendor} · {item.category}</p>
                  {item.description && <p>{item.description}</p>}
                  <div className="food-bottom">
                    <strong>{item.price} ETB</strong>
                    <button
                      className="primary-button"
                      onClick={() => setCart(previous => [...previous, { ...item, quantity: 1 }])}
                    >
                      🛒 Cart keessa galchi
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <p className="empty-menu">
              Menu irratti nyaanni hin jiru. Daldalaan nyaata jalqaba galmeessuu qaba.
            </p>
          )}
        </section>

        <section className="vendor-banner">
          <div>
            <h2>Daldalaa ta'uu barbaaddaa?</h2>
            <p>Hotel, Restaurant, Café, Bakery fi daldaltoota nyaataa hundaaf.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowVendor(true)
              setTimeout(() => {
                document.querySelector('.vendor-panel')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }, 100)
            }}
          >
            Menu kee galchi
          </button>
        </section>
      </main>

      <footer>© 2026 MILKI FOOD & DRINK DELIVERY · Ethiopia</footer>
    </div>
    </Translate>
  )
}
