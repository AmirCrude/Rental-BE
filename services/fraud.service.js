const { computeFeatures } = require("./feature.engineering.service");

const FRAUD_API_URL = "http://127.0.0.1:8000";
const checkFraud = async (propertyData, amenityNames = []) => {
  try {
    const features = computeFeatures(propertyData, amenityNames);
    
    // DEBUG: Log exactly what's being sent
    console.log("\n====================");
    console.log("📤 DATA SENT TO AI:");
    console.log("====================");
    console.log(JSON.stringify(features, null, 2));
    console.log("====================\n");
    
    const response = await fetch(`${FRAUD_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_type: "residential",
        ...features
      }),
    });
    
    const data = await response.json();
    
    // DEBUG: Log the response
    console.log("\n====================");
    console.log("📥 AI RESPONSE:");
    console.log("====================");
    console.log(JSON.stringify(data, null, 2));
    console.log("====================\n");
    
    return data;
  } catch (error) {
    console.error("Fraud detection error:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { checkFraud };