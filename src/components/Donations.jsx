import React, { useState } from 'react'

const Donation = () => {
  const [donationAmount, setDonationAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const suggestedAmounts = [25, 50, 100]
  const API_BASE_URL = 'http://localhost:4000' // Your backend URL

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount)
    setDonationAmount(amount.toString())
    setError('') // Clear any previous errors
  }

  const handleCustomAmount = (e) => {
    const value = e.target.value
    setDonationAmount(value)
    setSelectedAmount(null)
    setError('') // Clear any previous errors
  }

  const handleDonate = async () => {
    const amount = parseFloat(donationAmount)
    
    // Validation
    if (!amount || amount <= 0) {
      setError('Please enter a valid donation amount.')
      return
    }

    if (amount < 1) {
      setError('Minimum donation amount is $1.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Call backend to create Stripe checkout session
      const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: amount,
          currency: 'usd'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
      
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError(error.message || 'Something went wrong. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <section id="donate" className="py-16 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Support Our Mission</h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Your contribution helps preserve Harari culture for future generations
          </p>
        </div>

        {/* Donation Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-amber-900 mb-2">Make a Donation</h3>
            <p className="text-amber-700 mb-6">Every amount makes a difference</p>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {/* Custom Amount Input */}
            <div className="mb-8 max-w-md mx-auto">
              <label htmlFor="donation-amount" className="block text-sm font-medium text-amber-800 mb-2">
                Enter your amount (USD)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-amber-500 sm:text-sm">$</span>
                </div>
                <input 
                  type="number" 
                  id="donation-amount"
                  value={donationAmount}
                  onChange={handleCustomAmount}
                  disabled={isProcessing}
                  className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-7 pr-12 py-4 border-amber-300 rounded-md text-lg font-semibold text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder="50" 
                  min="1" 
                  step="1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <span className="text-amber-500 pr-3 sm:text-sm">USD</span>
                </div>
              </div>
            </div>

            {/* Suggested Amounts */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {suggestedAmounts.map((amount) => (
                <button 
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  disabled={isProcessing}
                  className={`donation-option px-4 py-2 rounded-full transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAmount === amount 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-200 hover:bg-amber-300 text-amber-800'
                  }`}
                >
                  ${amount}
                </button>
              ))}
              <button 
                onClick={() => {
                  setSelectedAmount('other')
                  setDonationAmount('')
                  setError('')
                }}
                disabled={isProcessing}
                className={`donation-option px-4 py-2 rounded-full transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedAmount === 'other' 
                    ? 'bg-amber-500 text-white' 
                    : 'border border-amber-400 hover:bg-amber-50 text-amber-700'
                }`}
              >
                Other
              </button>
            </div>

            {/* Donation Benefits */}
            <ul className="mb-8 space-y-3 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-amber-800">Tax-deductible donation</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-amber-800">Monthly newsletter updates</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-amber-800">Digital certificate of appreciation</span>
              </li>
            </ul>

            {/* Donate Button */}
            <button 
              onClick={handleDonate}
              disabled={isProcessing || !donationAmount}
              className="w-full max-w-xs mx-auto bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105 disabled:transform-none"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Donate Now'
              )}
            </button>

            <p className="mt-4 text-sm text-amber-600">
              🔒 Secure payment processing via Stripe
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Donation