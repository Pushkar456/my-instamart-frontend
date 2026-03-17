'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Utensils,
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  ArrowLeft,
  Lock,
  DollarSign
} from 'lucide-react'
import { useMutation } from '@apollo/client/react'
import { CLEAR_CART } from '@/graphql/payment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function PaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' })
  const [upiForm, setUpiForm] = useState({ upiId: '' })
  const [clearCart] = useMutation(CLEAR_CART)

  // Load checkout data
  useEffect(() => {
    console.log('[ Loading checkoutData...')
    const data = localStorage.getItem('checkoutData')
    if (!data) {
      console.warn('No checkout data found, redirecting to cart')
      router.push('/user/cart')
      return
    }
    setCheckoutData(JSON.parse(data))
    setLoading(false)
  }, [router])

  // Payment handler
  const handlePayment = async () => {
    if (!checkoutData) {
      alert('Checkout data missing!')
      router.push('/user/cart')
      return
    }

    // Validate form
    if (paymentMethod === 'card') {
      if (!cardForm.cardNumber || !cardForm.cardName || !cardForm.expiryDate || !cardForm.cvv) {
        alert('Please fill in all card details')
        return
      }
    }
    if (paymentMethod === 'upi' && !upiForm.upiId) {
      alert('Please enter your UPI ID')
      return
    }

    console.log(' Starting mock payment...')
    setProcessing(true)

    try {
      // Simulate delay
      await new Promise((r) => setTimeout(r, 1000))

      // Mock payment success
      console.log(' Payment success! Creating receipt...')
      const receipt = {
        orderId: checkoutData?.orderId,
        total: checkoutData?.total,
        method: paymentMethod,
        timestamp: new Date().toISOString(),
        cartItems: checkoutData?.cartItems,
      }

      // Clear cart from Redis
      try {
        console.log(' [DEBUG] Clearing Redis cart...')
        await clearCart()
        console.log('[DEBUG] Cart cleared successfully')
      } catch (err) {
        console.warn('Failed to clear Redis cart:', err)
      }

      // Save receipt & clean up
      localStorage.setItem('paymentReceipt', JSON.stringify(receipt))
      localStorage.removeItem('checkoutData')

      console.log('🧾 [DEBUG] Stored receipt:', receipt)

      // Redirect to receipt page
      setTimeout(() => {
        setProcessing(false)
        router.push('/user/receipt')
      }, 800)
    } catch (err) {
      console.error(' [DEBUG] Payment failed:', err)
      alert('Payment simulation failed.')
      setProcessing(false)
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/user/products" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">FoodExpress</span>
          </Link>
          <Link href="/user/checkout">
            <Button variant="ghost" className="text-gray-700 hover:text-orange-600">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Checkout
            </Button>
          </Link>
        </div>
      </nav>

      {/* Payment Body */}
      <div className="max-w-4xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        {/* Left: Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>All transactions are secure and encrypted</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {[
                    { value: 'card', icon: <CreditCard className="h-5 w-5 text-blue-600" />, title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                    { value: 'upi', icon: <Smartphone className="h-5 w-5 text-green-600" />, title: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                    { value: 'wallet', icon: <Wallet className="h-5 w-5 text-purple-600" />, title: 'Wallet', desc: 'Paytm, Amazon Pay, Mobikwik' },
                    { value: 'netbanking', icon: <Building2 className="h-5 w-5 text-orange-600" />, title: 'Net Banking', desc: 'All major banks supported' },
                    { value: 'cod', icon: <DollarSign className="h-5 w-5 text-gray-600" />, title: 'Cash on Delivery', desc: 'Pay on arrival' },
                  ].map((m) => (
                    <div key={m.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                      <RadioGroupItem value={m.value} id={m.value} />
                      <Label htmlFor={m.value} className="flex items-center gap-3 flex-1 cursor-pointer">
                        {m.icon}
                        <div>
                          <p className="font-semibold">{m.title}</p>
                          <p className="text-sm text-gray-600">{m.desc}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" /> Card Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Card Number" value={cardForm.cardNumber} onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })} />
                <Input placeholder="Cardholder Name" value={cardForm.cardName} onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM/YY" value={cardForm.expiryDate} onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })} />
                  <Input placeholder="CVV" type="password" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" /> UPI Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="username@upi" value={upiForm.upiId} onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{(checkoutData?.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>₹{(checkoutData?.tax ?? 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-orange-600">₹{(checkoutData?.total ?? 0).toFixed(2)}</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full h-12 text-lg text-white flex items-center justify-center ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" /> Pay ₹{(checkoutData?.total ?? 0).toFixed(2)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
