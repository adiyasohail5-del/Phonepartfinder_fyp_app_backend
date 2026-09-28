const PartModel = require('../models/PartModel');


async function searchParts(req, res, next) {
  try {
    const { brandId, partTypeId, model, city } = req.query;

    let results = await PartModel.search({ brandId, partTypeId, model, city });
    let fallback = false;
    let message = 'Parts retrieved successfully';

    if (city && results.length === 0) {
      results = await PartModel.search({ brandId, partTypeId, model, city: null });
      fallback = true;
      message = 'No parts found in your city, showing results from other locations';
    }

    res.json({
      success: true,
      fallback,
      message,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchParts
};