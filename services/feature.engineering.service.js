const { MARKET_STATS, AREA_TIERS, TIER_ENCODED } = require("../configs/market.stats");

// Building type mapping
const TYPE_MAP = {
  'apartment': 'Apartment Building',
  'studio': 'Condominium',
  'commercial': 'Apartment Building',
  'house': 'Townhouse',
  'villa': 'Villa Compound',
};

/**
 * Get area tier from district name
 */
const getAreaTier = (area) => {
  for (const [tier, areas] of Object.entries(AREA_TIERS)) {
    if (areas.includes(area)) return tier;
  }
  return "mid"; // fallback
};

/**
 * Safe division helper
 */
const safeDivide = (numerator, denominator) => {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
};

/**
 * Compute all engineered features from raw property data
 */
const computeFeatures = (propertyData, amenityNames = []) => {
  const price = parseFloat(propertyData.price) || 0;
  const bedrooms = parseInt(propertyData.bedrooms) || 0;
  const bathrooms = parseInt(propertyData.bathrooms) || 0;
  const size_sqm = parseInt(propertyData.size) || 0;
  const floor_number = parseInt(propertyData.floor_number) || 0;
  
  const building_type = TYPE_MAP[propertyData.property_type.toLowerCase()] || 'Apartment Building';
  const area = propertyData.district || 'Bole';
  
  const furnished = amenityNames.some(n => n.toLowerCase().includes('furnished')) ? 1 : 0;
  const has_generator = amenityNames.some(n => n.toLowerCase().includes('generator')) ? 1 : 0;
  const has_parking = amenityNames.some(n => n.toLowerCase().includes('parking')) ? 1 : 0;
  const has_security = amenityNames.some(n => 
    n.toLowerCase().includes('security') || n.toLowerCase().includes('guard')
  ) ? 1 : 0;
  const has_elevator = amenityNames.some(n => n.toLowerCase().includes('elevator')) ? 1 : 0;
  
  const listing_age_days = Math.max(1, propertyData.listing_age_days || 1);
  const views = Math.max(10, propertyData.views || 10);
  const contact_clicks = Math.max(2, propertyData.contact_clicks || 2);
  
  const area_tier = getAreaTier(area);
  const area_tier_encoded = TIER_ENCODED[area_tier];
  
  const price_per_sqm = safeDivide(price, size_sqm);
  const price_per_bedroom = safeDivide(price, bedrooms + 1);
  const size_per_bedroom = safeDivide(size_sqm, bedrooms + 1);
  
  const statsKey = `${building_type}_${area_tier}`;
  const marketStats = MARKET_STATS[statsKey] || { 
    mean_price_per_sqm: 500, 
    std_price_per_sqm: 300 
  };
  
  const expected_price = marketStats.mean_price_per_sqm * size_sqm;
  const price_position = safeDivide(price, expected_price);
  const price_zscore = safeDivide(
    price_per_sqm - marketStats.mean_price_per_sqm, 
    marketStats.std_price_per_sqm || 1
  );
  
  const engagement_rate = safeDivide(contact_clicks, views + 1);
  const engagement_velocity = safeDivide(contact_clicks, listing_age_days + 1);
  
  const is_condo = building_type === "Condominium" ? 1 : 0;
  const is_villa = building_type === "Villa Compound" ? 1 : 0;
  const is_townhouse = building_type === "Townhouse" ? 1 : 0;
  const is_apartment = building_type === "Apartment Building" ? 1 : 0;
  
  const amenity_count = has_generator + has_parking + has_security + has_elevator;

  return {
    price, bedrooms, bathrooms, size_sqm, floor_number,
    building_type, area,
    furnished, has_generator, has_parking, has_security, has_elevator,
    listing_age_days, views, contact_clicks,
    price_per_sqm, price_per_bedroom, size_per_bedroom,
    area_tier_encoded,
    engagement_rate, engagement_velocity,
    is_condo, is_villa, is_townhouse, is_apartment,
    amenity_count,
    price_position, price_zscore,
  };
};

module.exports = { computeFeatures, getAreaTier, TYPE_MAP };