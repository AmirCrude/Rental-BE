const { query } = require("../../utils/connection/connections");

const createFraudFlag = async (propertyId, fraudScore, reason = null) => {
  const sql = `
    INSERT INTO fraud_flags (property_id, fraud_score, reason, flagged_at)
    VALUES (?, ?, ?, NOW())
  `;
  const result = await query(sql, [propertyId, fraudScore, reason]);
  return result;
};

const getFraudFlagsByProperty = async (propertyId) => {
  return await query("SELECT * FROM fraud_flags WHERE property_id = ?", [propertyId]);
};

const getAllFraudFlags = async () => {
  return await query(`
    SELECT ff.*, p.title, p.district, u.name as landlord_name 
    FROM fraud_flags ff
    JOIN properties p ON ff.property_id = p.property_id
    JOIN users u ON p.landlord_id = u.user_id
    ORDER BY ff.fraud_score DESC
  `);
};

const deleteFraudFlagByProperty = async (propertyId) => {
  await query("DELETE FROM fraud_flags WHERE property_id = ?", [propertyId]);
};

module.exports = { createFraudFlag, getFraudFlagsByProperty, getAllFraudFlags, deleteFraudFlagByProperty };