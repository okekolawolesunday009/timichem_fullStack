class AggregationHelpers {
  // Helper to build date range match stage
  static buildDateRangeMatch(startDate, endDate, dateField = "createdAt") {
    const match = {}
    if (startDate || endDate) {
      match[dateField] = {}
      if (startDate) match[dateField].$gte = new Date(startDate)
      if (endDate) match[dateField].$lte = new Date(endDate)
    }
    return match
  }

  // Helper to build search match stage
  static buildSearchMatch(searchTerm, searchFields) {
    if (!searchTerm || !searchFields.length) return {}

    return {
      $or: searchFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    }
  }

  // Helper to build pagination pipeline
  static buildPaginationPipeline(page = 1, limit = 10) {
    const skip = (page - 1) * limit
    return [{ $skip: skip }, { $limit: Number.parseInt(limit) }]
  }

  // Helper to build sort stage
  static buildSortStage(sortBy = "createdAt", sortOrder = "desc") {
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1
    return { $sort: sort }
  }

  // Helper for monthly grouping
  static getMonthlyGroupStage(dateField = "createdAt") {
    return {
      $group: {
        _id: {
          year: { $year: `$${dateField}` },
          month: { $month: `$${dateField}` },
        },
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        avgAmount: { $avg: "$totalAmount" },
      },
    }
  }

  // Helper for category grouping
  static getCategoryGroupStage() {
    return {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        avgAmount: { $avg: "$totalAmount" },
        maxAmount: { $max: "$totalAmount" },
        minAmount: { $min: "$totalAmount" },
      },
    }
  }

  // Helper for vendor lookup
  static getVendorLookupStage() {
    return {
      $lookup: {
        from: "vendors",
        localField: "vendor",
        foreignField: "_id",
        as: "vendorInfo",
      },
    }
  }

  // Helper for user lookup
  static getUserLookupStage(localField = "createdBy", as = "createdByInfo") {
    return {
      $lookup: {
        from: "users",
        localField,
        foreignField: "_id",
        as,
        pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
      },
    }
  }
}

module.exports = AggregationHelpers
