const Purchase = require("../models/Purchase")
const Revenue = require("../models/Revenue")
const { validationResult } = require("express-validator")

class ReportController {
  // Generate Profit & Loss Report
  async getProfitLossReport(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const { startDate, endDate, period = "monthly", compareWithPrevious = false } = req.query
      const start = new Date(startDate)
      const end = new Date(endDate)

      // Revenue aggregation
      const revenueData = await Revenue.aggregate([
        {
          $match: {
            revenueDate: { $gte: start, $lte: end },
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
          },
        },
      ])

      // Purchase aggregation (for COGS and Operating Expenses)
      const purchaseData = await Purchase.aggregate([
        {
          $match: {
            purchaseDate: { $gte: start, $lte: end },
            status: { $in: ["received", "paid"] },
          },
        },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
      ])

      // Format revenue data
      const revenue = {
        productSales: 0,
        serviceSales: 0,
        otherIncome: 0,
      }

      revenueData.forEach((item) => {
        if (revenue.hasOwnProperty(item._id)) {
          revenue[item._id] = item.totalAmount
        }
      })

      // Format purchase data into COGS and Operating Expenses
      const cogs = {
        materials: 0,
        labor: 0,
        manufacturing: 0,
      }

      const operatingExpenses = {
        salaries: 0,
        rent: 0,
        utilities: 0,
        marketing: 0,
        insurance: 0,
        depreciation: 0,
        other: 0,
      }

      purchaseData.forEach((item) => {
        if (cogs.hasOwnProperty(item._id)) {
          cogs[item._id] = item.totalAmount
        } else if (operatingExpenses.hasOwnProperty(item._id)) {
          operatingExpenses[item._id] = item.totalAmount
        }
      })

      // Calculate totals and ratios
      const totalRevenue = Object.values(revenue).reduce((sum, val) => sum + val, 0)
      const totalCOGS = Object.values(cogs).reduce((sum, val) => sum + val, 0)
      const grossProfit = totalRevenue - totalCOGS
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

      const totalOperatingExpenses = Object.values(operatingExpenses).reduce((sum, val) => sum + val, 0)
      const operatingIncome = grossProfit - totalOperatingExpenses
      const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0

      // Non-operating items (you can extend this based on your needs)
      const nonOperating = {
        interestIncome: 0,
        interestExpense: 0,
        otherIncome: 0,
        otherExpenses: 0,
      }

      const netIncome =
        operatingIncome +
        nonOperating.interestIncome -
        nonOperating.interestExpense +
        nonOperating.otherIncome -
        nonOperating.otherExpenses
      const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

      let comparison = null

      // Period comparison if requested
      if (compareWithPrevious) {
        const periodLength = end.getTime() - start.getTime()
        const prevStart = new Date(start.getTime() - periodLength)
        const prevEnd = new Date(start.getTime() - 1)

        const [prevRevenueData, prevPurchaseData] = await Promise.all([
          Revenue.aggregate([
            {
              $match: {
                revenueDate: { $gte: prevStart, $lte: prevEnd },
                status: "completed",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
              },
            },
          ]),
          Purchase.aggregate([
            {
              $match: {
                purchaseDate: { $gte: prevStart, $lte: prevEnd },
                status: { $in: ["received", "paid"] },
              },
            },
            {
              $group: {
                _id: "$category",
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ]),
        ])

        const prevTotalRevenue = prevRevenueData.length > 0 ? prevRevenueData[0].totalAmount : 0
        const prevTotalExpenses = prevPurchaseData.reduce((sum, item) => sum + item.totalAmount, 0)
        const prevNetIncome = prevTotalRevenue - prevTotalExpenses

        comparison = {
          previousPeriod: {
            startDate: prevStart,
            endDate: prevEnd,
            totalRevenue: prevTotalRevenue,
            totalExpenses: prevTotalExpenses,
            netIncome: prevNetIncome,
          },
          growth: {
            revenue: prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0,
            expenses:
              prevTotalExpenses > 0
                ? ((totalCOGS + totalOperatingExpenses - prevTotalExpenses) / prevTotalExpenses) * 100
                : 0,
            netIncome: prevNetIncome !== 0 ? ((netIncome - prevNetIncome) / Math.abs(prevNetIncome)) * 100 : 0,
          },
        }
      }

      // Monthly breakdown for trends
      const monthlyBreakdown = await this.getMonthlyBreakdown(start, end)

      res.json({
        success: true,
        data: {
          period: {
            startDate: start,
            endDate: end,
            type: period,
          },
          revenue,
          cogs,
          operatingExpenses,
          nonOperating,
          totals: {
            totalRevenue,
            totalCOGS,
            grossProfit,
            grossMargin,
            totalOperatingExpenses,
            operatingIncome,
            operatingMargin,
            netIncome,
            netMargin,
          },
          comparison,
          monthlyBreakdown,
          metadata: {
            generatedAt: new Date(),
            generatedBy: req.user.id,
          },
        },
      })
    } catch (error) {
      console.error("Error generating P&L report:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate P&L report",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Get monthly breakdown for trends
  async getMonthlyBreakdown(startDate, endDate) {
    try {
      const [monthlyRevenue, monthlyExpenses] = await Promise.all([
        Revenue.aggregate([
          {
            $match: {
              revenueDate: { $gte: startDate, $lte: endDate },
              status: "completed",
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$revenueDate" },
                month: { $month: "$revenueDate" },
              },
              totalRevenue: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Purchase.aggregate([
          {
            $match: {
              purchaseDate: { $gte: startDate, $lte: endDate },
              status: { $in: ["received", "paid"] },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$purchaseDate" },
                month: { $month: "$purchaseDate" },
              },
              totalExpenses: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ])

      // Merge revenue and expenses by month
      const monthlyData = {}

      monthlyRevenue.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}`
        monthlyData[key] = {
          ...monthlyData[key],
          revenue: item.totalRevenue,
          revenueCount: item.count,
        }
      })

      monthlyExpenses.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}`
        monthlyData[key] = {
          ...monthlyData[key],
          expenses: item.totalExpenses,
          expenseCount: item.count,
        }
      })

      return Object.entries(monthlyData).map(([key, data]) => {
        const [year, month] = key.split("-")
        return {
          year: Number.parseInt(year),
          month: Number.parseInt(month),
          revenue: data.revenue || 0,
          expenses: data.expenses || 0,
          netIncome: (data.revenue || 0) - (data.expenses || 0),
          revenueCount: data.revenueCount || 0,
          expenseCount: data.expenseCount || 0,
        }
      })
    } catch (error) {
      console.error("Error getting monthly breakdown:", error)
      return []
    }
  }

  // Generate Cash Flow Report
  async getCashFlowReport(req, res) {
    try {
      const { startDate, endDate } = req.query
      const start = new Date(startDate)
      const end = new Date(endDate)

      // Cash inflows (Revenue)
      const cashInflows = await Revenue.aggregate([
        {
          $match: {
            revenueDate: { $gte: start, $lte: end },
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$revenueDate" },
              month: { $month: "$revenueDate" },
              day: { $dayOfMonth: "$revenueDate" },
            },
            totalInflow: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])

      // Cash outflows (Purchases with payment dates)
      const cashOutflows = await Purchase.aggregate([
        {
          $match: {
            paymentDate: { $gte: start, $lte: end },
            status: "paid",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$paymentDate" },
              month: { $month: "$paymentDate" },
              day: { $dayOfMonth: "$paymentDate" },
            },
            totalOutflow: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])

      // Calculate net cash flow
      const netCashFlow = []
      const inflowMap = new Map()
      const outflowMap = new Map()

      cashInflows.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}-${item._id.day}`
        inflowMap.set(key, item)
      })

      cashOutflows.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}-${item._id.day}`
        outflowMap.set(key, item)
      })

      // Combine all dates
      const allDates = new Set([...inflowMap.keys(), ...outflowMap.keys()])

      allDates.forEach((dateKey) => {
        const inflow = inflowMap.get(dateKey) || { totalInflow: 0, count: 0 }
        const outflow = outflowMap.get(dateKey) || { totalOutflow: 0, count: 0 }
        const [year, month, day] = dateKey.split("-").map(Number)

        netCashFlow.push({
          date: new Date(year, month - 1, day),
          inflow: inflow.totalInflow,
          outflow: outflow.totalOutflow,
          netFlow: inflow.totalInflow - outflow.totalOutflow,
          inflowCount: inflow.count,
          outflowCount: outflow.count,
        })
      })

      // Sort by date
      netCashFlow.sort((a, b) => a.date - b.date)

      // Calculate running balance (assuming starting balance of 0)
      let runningBalance = 0
      netCashFlow.forEach((item) => {
        runningBalance += item.netFlow
        item.runningBalance = runningBalance
      })

      // Summary statistics
      const totalInflow = cashInflows.reduce((sum, item) => sum + item.totalInflow, 0)
      const totalOutflow = cashOutflows.reduce((sum, item) => sum + item.totalOutflow, 0)
      const netCashFlowTotal = totalInflow - totalOutflow

      res.json({
        success: true,
        data: {
          period: { startDate: start, endDate: end },
          summary: {
            totalInflow,
            totalOutflow,
            netCashFlow: netCashFlowTotal,
            finalBalance: runningBalance,
          },
          dailyCashFlow: netCashFlow,
          cashInflows,
          cashOutflows,
        },
      })
    } catch (error) {
      console.error("Error generating cash flow report:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate cash flow report",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Generate Expense Report by Category
  async getExpenseReport(req, res) {
    try {
      const { startDate, endDate, category, vendor } = req.query
      const start = new Date(startDate)
      const end = new Date(endDate)

      const matchStage = {
        purchaseDate: { $gte: start, $lte: end },
        status: { $in: ["received", "paid"] },
      }

      if (category) matchStage.category = category
      if (vendor) matchStage.vendor = vendor

      // Expense breakdown by category
      const expenseByCategory = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$totalAmount" },
            maxAmount: { $max: "$totalAmount" },
            minAmount: { $min: "$totalAmount" },
          },
        },
        { $sort: { totalAmount: -1 } },
      ])

      // Expense breakdown by vendor
      const expenseByVendor = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$vendor",
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "vendors",
            localField: "_id",
            foreignField: "_id",
            as: "vendorInfo",
          },
        },
        {
          $project: {
            totalAmount: 1,
            count: 1,
            avgAmount: 1,
            vendor: { $arrayElemAt: ["$vendorInfo", 0] },
          },
        },
      ])

      // Monthly expense trends
      const monthlyTrends = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: "$purchaseDate" },
              month: { $month: "$purchaseDate" },
              category: "$category",
            },
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])

      const totalExpenses = expenseByCategory.reduce((sum, item) => sum + item.totalAmount, 0)

      res.json({
        success: true,
        data: {
          period: { startDate: start, endDate: end },
          summary: {
            totalExpenses,
            totalTransactions: expenseByCategory.reduce((sum, item) => sum + item.count, 0),
            avgTransactionAmount: totalExpenses / expenseByCategory.reduce((sum, item) => sum + item.count, 1),
          },
          expenseByCategory,
          expenseByVendor,
          monthlyTrends,
        },
      })
    } catch (error) {
      console.error("Error generating expense report:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate expense report",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }
}

module.exports = new ReportController()
