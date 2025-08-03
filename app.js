const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const app = express()

// ✅ Apply CORS as early as possible
app.use(cors({
  origin: 'http://localhost:3001', // or use '*' for dev only
  credentials: true,
}));

// ✅ Parse JSON
app.use(express.json())

// ✅ Routes
const webhookRoutes = require('./routes/webhookRoutes')
app.use('/api/webhooks', webhookRoutes)

const customerRoutes = require('./routes/customerRoutes')
app.use('/api/customers', customerRoutes)

const invoiceRoutes = require('./routes/invoiceRoutes')
app.use('/api/invoices', invoiceRoutes)

app.get('/', (req, res) => {
  res.send('Invoice API is running...')
})

// ✅ Connect DB & start server
const PORT = process.env.PORT || 4000
mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((error) => console.error('❌ Database connection error:', error))
