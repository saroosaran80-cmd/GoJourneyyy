import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats, totalAmount, passengers, contactInfo } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    walletType: '',
    bankName: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cvvVisible, setCvvVisible] = useState(false);
  const [cardType, setCardType] = useState('');
  const [errors, setErrors] = useState({});
  const [currentStep] = useState(4);

  const serviceFee = Math.round((totalAmount || 0) * 0.02);
  const taxes = Math.round((totalAmount || 0) * 0.05);
  const discountAmount = couponApplied ? discount : 0;
  const grandTotal = (totalAmount || 0) + serviceFee + taxes - discountAmount;

  const COUPONS = {
    'FIRST10': { discount: Math.round((totalAmount || 0) * 0.10), label: '10% off' },
    'GOJOURNEY': { discount: 100, label: '₹100 flat off' },
    'SAVE50': { discount: 50, label: '₹50 flat off' },
  };

  const paymentMethods = [
    { id: 'card', name: 'Card', icon: '💳', desc: 'Credit / Debit Card' },
    { id: 'upi', name: 'UPI', icon: '📱', desc: 'UPI / QR Code' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All Major Banks' },
    { id: 'wallet', name: 'Wallet', icon: '👛', desc: 'Paytm, PhonePe...' },
  ];

  const wallets = [
    { id: 'paytm', name: 'Paytm', emoji: '🔵' },
    { id: 'phonepe', name: 'PhonePe', emoji: '🟣' },
    { id: 'amazon', name: 'Amazon Pay', emoji: '🟠' },
    { id: 'freecharge', name: 'Freecharge', emoji: '🟢' },
  ];

  const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra' },
    { id: 'pnb', name: 'Punjab National Bank' },
    { id: 'bob', name: 'Bank of Baroda' },
    { id: 'yes', name: 'Yes Bank' },
  ];

  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', color: '#5f259f', emoji: '📲' },
    { id: 'gpay', name: 'Google Pay', color: '#1a73e8', emoji: '💙' },
    { id: 'paytm', name: 'Paytm', color: '#00b9f1', emoji: '🔵' },
    { id: 'bhim', name: 'BHIM', color: '#e53935', emoji: '🇮🇳' },
  ];

  const detectCardType = (num) => {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[1-5]/.test(n)) return 'mastercard';
    if (/^6/.test(n)) return 'rupay';
    if (/^3[47]/.test(n)) return 'amex';
    return '';
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setPaymentDetails({ ...paymentDetails, cardNumber: formatted });
    setCardType(detectCardType(val));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    setPaymentDetails({ ...paymentDetails, expiryDate: val });
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setDiscount(COUPONS[code].discount);
      setCouponApplied(true);
      setCouponMessage(`✅ Coupon applied! You saved ₹${COUPONS[code].discount} (${COUPONS[code].label})`);
    } else {
      setCouponApplied(false);
      setDiscount(0);
      setCouponMessage('❌ Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
    setCouponMessage('');
  };

  const validateForm = () => {
    const errs = {};
    if (!paymentMethod) { errs.method = 'Please select a payment method'; return errs; }
    if (paymentMethod === 'card') {
      const rawCard = paymentDetails.cardNumber.replace(/\s/g, '');
      if (rawCard.length < 16) errs.cardNumber = 'Enter a valid 16-digit card number';
      if (!paymentDetails.cardName.trim()) errs.cardName = 'Cardholder name is required';
      if (paymentDetails.expiryDate.length < 5) errs.expiryDate = 'Enter valid expiry (MM/YY)';
      if (paymentDetails.cvv.length < 3) errs.cvv = 'Enter valid CVV';
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId.includes('@')) errs.upiId = 'Enter a valid UPI ID (eg: name@okaxis)';
    } else if (paymentMethod === 'netbanking') {
      if (!paymentDetails.bankName) errs.bankName = 'Please select a bank';
    } else if (paymentMethod === 'wallet') {
      if (!paymentDetails.walletType) errs.walletType = 'Please select a wallet';
    }
    return errs;
  };

  const handlePayment = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsProcessing(true);

    try {
      let userEmail = contactInfo.email;
      try {
        const gjUser = JSON.parse(localStorage.getItem('gj_user'));
        if (gjUser && gjUser.email) userEmail = gjUser.email;
      } catch (e) { }

      const bookingData = {
        bus_id: bus.id,
        operator: bus.operator,
        bus_type: bus.busType,
        from_city: searchData.from,
        to_city: searchData.to,
        travel_date: searchData.date,
        departure: bus.departure,
        arrival: bus.arrival,
        selected_seats: selectedSeats.join(','),
        passenger_count: passengers.length,
        base_fare: totalAmount,
        service_fee: serviceFee,
        taxes: taxes,
        discount: discountAmount,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        user_email: userEmail,
        contact_name: contactInfo.name,
        contact_email: contactInfo.email,
        contact_phone: contactInfo.phone,
        passengers: passengers,
        coupon_code: couponApplied ? couponCode.toUpperCase() : null,
      };

      let bookingId = null;
      try {
        const response = await fetch('http://localhost:5000/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });
        const result = await response.json();
        if (result.booking_id) bookingId = result.booking_id;
      } catch (err) {
        // Backend offline – use local ID
        bookingId = null;
      }

      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/confirmation', {
          state: {
            bus, searchData, selectedSeats, totalAmount,
            passengers, contactInfo, paymentMethod,
            serviceFee, taxes, discountAmount, grandTotal,
            bookingId, userEmail
          }
        });
      }, 2000);
    } catch (err) {
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  if (!bus || !selectedSeats) {
    return (
      <div className="pay-error-screen">
        <div className="pay-error-icon">⚠️</div>
        <h2>Invalid booking data</h2>
        <p>Please start your booking from the beginning.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const cardTypeLogos = { visa: '💙 VISA', mastercard: '🔴 Mastercard', rupay: '🇮🇳 RuPay', amex: '🟦 Amex' };

  return (
    <div className="pay-page">
      {isProcessing && !isSuccess && (
        <div className="pay-overlay">
          <div className="pay-spinner-wrap">
            <div className="pay-spinner"></div>
            <p>Processing your payment…</p>
            <span>Please do not close this window</span>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="pay-overlay">
          <div className="pay-success-wrap">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <h2>Payment Successful!</h2>
            <p>Generating your secure ticket...</p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="pay-steps">
        {['Search', 'Seats', 'Passengers', 'Payment', 'Confirm'].map((step, i) => (
          <div key={i} className={`pay-step ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'done' : ''}`}>
            <div className="pay-step-circle">{i + 1 < currentStep ? '✓' : i + 1}</div>
            <div className="pay-step-label">{step}</div>
          </div>
        ))}
      </div>

      <div className="pay-header">
        <div className="pay-header-left">
          <h1>Secure Payment</h1>
          <p>{searchData.from} → {searchData.to} &nbsp;|&nbsp; {searchData.date}</p>
        </div>
        <div className="pay-header-amount">
          <span className="pay-amount-label">Pay</span>
          <span className="pay-amount-value">₹{grandTotal.toLocaleString()}</span>
        </div>
        <div className="pay-secure-badge">
          <span>🔒</span> 100% Secure
        </div>
      </div>

      <div className="pay-body">
        {/* ===== Left Column ===== */}
        <div className="pay-left">

          {/* Payment Method Tabs */}
          <div className="pay-card">
            <h2 className="pay-section-title">Select Payment Method</h2>
            {errors.method && <p className="pay-err">{errors.method}</p>}
            <div className="pay-method-tabs">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  className={`pay-method-tab ${paymentMethod === m.id ? 'active' : ''}`}
                  onClick={() => { setPaymentMethod(m.id); setErrors({}); }}
                >
                  <span className="pm-icon">{m.icon}</span>
                  <span className="pm-name">{m.name}</span>
                  <span className="pm-desc">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== Card Payment ===== */}
          {paymentMethod === 'card' && (
            <div className="pay-card animate-in">
              <h2 className="pay-section-title">
                Card Details
                {cardType && <span className="card-type-badge">{cardTypeLogos[cardType]}</span>}
              </h2>

              {/* Visual Card */}
              <div className="visual-card">
                <div className="vc-chip">💳</div>
                <div className="vc-number">
                  {paymentDetails.cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="vc-bottom">
                  <div>
                    <div className="vc-sub">Card Holder</div>
                    <div className="vc-val">{paymentDetails.cardName || 'YOUR NAME'}</div>
                  </div>
                  <div>
                    <div className="vc-sub">Expiry</div>
                    <div className="vc-val">{paymentDetails.expiryDate || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              <div className="pay-form-grid">
                <div className="pay-field full">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={errors.cardNumber ? 'err' : ''}
                  />
                  {errors.cardNumber && <span className="pay-err">{errors.cardNumber}</span>}
                </div>
                <div className="pay-field full">
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    placeholder="As printed on card"
                    value={paymentDetails.cardName}
                    onChange={e => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                    className={errors.cardName ? 'err' : ''}
                  />
                  {errors.cardName && <span className="pay-err">{errors.cardName}</span>}
                </div>
                <div className="pay-field">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentDetails.expiryDate}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className={errors.expiryDate ? 'err' : ''}
                  />
                  {errors.expiryDate && <span className="pay-err">{errors.expiryDate}</span>}
                </div>
                <div className="pay-field">
                  <label>CVV *</label>
                  <div className="cvv-wrap">
                    <input
                      type={cvvVisible ? 'text' : 'password'}
                      placeholder="•••"
                      value={paymentDetails.cvv}
                      onChange={e => setPaymentDetails({ ...paymentDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      maxLength={4}
                      className={errors.cvv ? 'err' : ''}
                    />
                    <button className="cvv-eye" onClick={() => setCvvVisible(!cvvVisible)} type="button">
                      {cvvVisible ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.cvv && <span className="pay-err">{errors.cvv}</span>}
                </div>
              </div>
              <p className="pay-note">🔒 Your card details are encrypted with 256-bit SSL</p>
            </div>
          )}

          {/* ===== UPI Payment ===== */}
          {paymentMethod === 'upi' && (
            <div className="pay-card animate-in">
              <h2 className="pay-section-title">Pay via UPI</h2>
              <div className="upi-apps">
                {upiApps.map(app => (
                  <button
                    key={app.id}
                    className={`upi-app-btn ${paymentDetails.walletType === app.id ? 'active' : ''}`}
                    onClick={() => setPaymentDetails({ ...paymentDetails, walletType: app.id })}
                  >
                    <span>{app.emoji}</span>
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
              <div className="upi-divider"><span>or enter UPI ID manually</span></div>
              <div className="pay-field">
                <label>UPI ID *</label>
                <input
                  type="text"
                  placeholder="yourname@okaxis"
                  value={paymentDetails.upiId}
                  onChange={e => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                  className={errors.upiId ? 'err' : ''}
                />
                {errors.upiId && <span className="pay-err">{errors.upiId}</span>}
              </div>
              <p className="pay-note">💡 UPI payments are instant and free of charge</p>
            </div>
          )}

          {/* ===== Net Banking ===== */}
          {paymentMethod === 'netbanking' && (
            <div className="pay-card animate-in">
              <h2 className="pay-section-title">Net Banking</h2>
              <div className="bank-grid">
                {banks.map(bank => (
                  <button
                    key={bank.id}
                    className={`bank-btn ${paymentDetails.bankName === bank.id ? 'active' : ''}`}
                    onClick={() => setPaymentDetails({ ...paymentDetails, bankName: bank.id })}
                  >
                    🏦 {bank.name}
                  </button>
                ))}
              </div>
              {errors.bankName && <p className="pay-err">{errors.bankName}</p>}
              <p className="pay-note">⚡ You will be redirected to your bank's secure portal</p>
            </div>
          )}

          {/* ===== Wallet ===== */}
          {paymentMethod === 'wallet' && (
            <div className="pay-card animate-in">
              <h2 className="pay-section-title">Choose Wallet</h2>
              <div className="wallet-grid">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    className={`wallet-btn ${paymentDetails.walletType === w.id ? 'active' : ''}`}
                    onClick={() => setPaymentDetails({ ...paymentDetails, walletType: w.id })}
                  >
                    <span className="wallet-emoji">{w.emoji}</span>
                    <span className="wallet-name">{w.name}</span>
                  </button>
                ))}
              </div>
              {errors.walletType && <p className="pay-err">{errors.walletType}</p>}
            </div>
          )}

          {/* ===== Coupon ===== */}
          <div className="pay-card">
            <h2 className="pay-section-title">🎟️ Promo / Coupon Code</h2>
            <div className="coupon-row">
              <input
                type="text"
                placeholder="Enter coupon code (e.g. FIRST10)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                disabled={couponApplied}
              />
              {!couponApplied
                ? <button className="coupon-btn" onClick={applyCoupon}>Apply</button>
                : <button className="coupon-btn remove" onClick={removeCoupon}>Remove</button>
              }
            </div>
            {couponMessage && <p className={`coupon-msg ${couponApplied ? 'success' : 'fail'}`}>{couponMessage}</p>}
            <p className="coupon-hint">Try: <code>FIRST10</code>, <code>GOJOURNEY</code>, <code>SAVE50</code></p>
          </div>

        </div>

        {/* ===== Right Column – Summary ===== */}
        <div className="pay-right">
          <div className="pay-summary-card">
            <h2 className="pay-section-title">Booking Summary</h2>

            <div className="summary-journey">
              <div className="sj-city">{searchData.from}</div>
              <div className="sj-arrow">✈ ──────</div>
              <div className="sj-city">{searchData.to}</div>
            </div>

            <div className="summary-table">
              <div className="st-row"><span>Operator</span><span>{bus.operator}</span></div>
              <div className="st-row"><span>Bus Type</span><span>{bus.busType}</span></div>
              <div className="st-row"><span>Date</span><span>{searchData.date}</span></div>
              <div className="st-row"><span>Departure</span><span>{bus.departure}</span></div>
              <div className="st-row"><span>Seats</span><span>{selectedSeats.join(', ')}</span></div>
              <div className="st-row"><span>Passengers</span><span>{passengers.length}</span></div>
            </div>

            <div className="price-table">
              <div className="pt-row"><span>Base Fare</span><span>₹{totalAmount?.toLocaleString()}</span></div>
              <div className="pt-row"><span>Service Fee (2%)</span><span>₹{serviceFee}</span></div>
              <div className="pt-row"><span>Taxes (5%)</span><span>₹{taxes}</span></div>
              {discountAmount > 0 && (
                <div className="pt-row discount"><span>🎟️ Discount</span><span>- ₹{discountAmount}</span></div>
              )}
              <div className="pt-total"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>

            {/* Passengers Mini List */}
            <div className="mini-passengers">
              <h4>Passengers</h4>
              {passengers.map((p, i) => (
                <div key={i} className="mini-pax">
                  <span>👤 {p.name}</span>
                  <span className="mini-pax-seat">Seat {p.seatNumber}</span>
                </div>
              ))}
            </div>

            <div className="pay-actions">
              <button className="btn-back-pay" onClick={() => navigate(-1)}>← Back</button>
              <button className="btn-pay-now" onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? 'Processing…' : `Pay ₹${grandTotal.toLocaleString()}`}
              </button>
            </div>

            <div className="pay-trust-badges">
              <span>🔒 SSL Secured</span>
              <span>✅ PCI DSS</span>
              <span>🛡️ Fraud Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
