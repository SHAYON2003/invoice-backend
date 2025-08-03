const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/generateInvoicePDF')
const path = require('path')


// Utility function to generate invoice number
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`; // You can replace with other logic later
};

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      customer,
      items,
      totalAmount,
      dueDate,
      status
      // Do NOT take invoiceNumber from frontend
    } = req.body;

    const invoiceNumber = generateInvoiceNumber(); // 👈 Auto-generate here

    const newInvoice = new Invoice({
      customer,
      items,
      totalAmount,
      dueDate,
      status,
      invoiceNumber,
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get All Invoices
exports.getAllInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate("customer");
  res.json(invoices);
};

// Get Invoice by ID
exports.getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("customer");
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
};

// Update Invoice
exports.updateInvoice = async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
};

// Delete Invoice
exports.deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ message: 'Invoice deleted' });
};

exports.downloadInvoicePDF = async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  
      const pdfPath = await generateInvoicePDF(invoice);
      res.download(pdfPath); // Sends the file to client
    } catch (err) {
      console.error('PDF error:', err);
      res.status(500).json({ error: 'Failed to generate invoice PDF' });
    }
  };

  exports.getAnalytics = async (req, res) => {
    try {
      const totalInvoices = await Invoice.countDocuments();
      const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
      const unpaidInvoices = await Invoice.countDocuments({ status: { $ne: 'paid' } });
  
      const totalRevenue = await Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
  
      res.status(200).json({
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        totalRevenue: totalRevenue[0]?.total || 0,
      });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  };
  