const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const generateDescription = async (propertyData) => {
  try {
    const prompt = `You are a real estate agent in Addis Ababa, Ethiopia. Write a professional, engaging rental property description in 3-4 sentences.

Property Details:
- Title: ${propertyData.title || 'Beautiful Property'}
- Type: ${propertyData.type || 'Not specified'}
- Location: ${propertyData.district || 'Addis Ababa'}, Ethiopia
- Bedrooms: ${propertyData.bedrooms || 'N/A'}
- Bathrooms: ${propertyData.bathrooms || 'N/A'}
- Size: ${propertyData.size ? propertyData.size + ' m²' : 'N/A'}
- Monthly Rent: ${propertyData.price ? propertyData.price + ' ETB' : 'N/A'}
- Amenities: ${propertyData.amenities || 'None specified'}

Write ONLY the description text. No labels, no introductions, no quotes. Make it appealing to potential tenants.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 200,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq AI Error:", error.message);
    throw new Error("Failed to generate description");
  }
};

const enhanceSearch = async (query) => {
  try {
    const prompt = `Analyze this rental search query for Addis Ababa, Ethiopia and extract ALL possible filters.

Search query: "${query}"

Known Addis districts: Bole, CMC, Kazanchis, Piassa, Arat Kilo, Sidist Kilo, Ayat, Old Airport, Sarbet, Megenagna, Merkato, Mexico, Saris, Kaliti, Jemo, Gerji, Summit, Bole Michael, Megenagna, Lamberet, Kotebe.

Known property types: apartment, studio, house, villa, commercial.

Common amenity keywords and what they mean:
- parking/garage → Parking, Covered Parking, Basement Parking
- wifi/internet → WiFi Ready, Fiber Optic Internet
- security/guard → 24/7 Security Guard, CCTV Surveillance
- furnished → Furnished
- water → 24/7 Water Supply, Water Tank
- gym/fitness → Gym, Fitness/Gym Nearby
- pool → Swimming Pool
- garden/yard → Compound Garden, Green Area/Yard
- balcony/veranda → Veranda/Balcony, Rooftop Terrace
- elevator → Elevator
- generator → Generator (Diesel), Backup Generator

Price context:
- cheap/affordable/budget → max 15,000 ETB
- moderate/mid-range → 15,000-30,000 ETB
- expensive/luxury/premium → min 50,000 ETB

Bedroom context:
- single/individual/one person → 1 bedroom
- couple → 1-2 bedrooms
- family → 3+ bedrooms
- student → studio or 1 bedroom

Return ONLY a valid JSON object (no other text):
{
  "district": "best matching district from list, or empty",
  "property_type": "apartment/studio/house/villa/commercial or empty",
  "min_bedrooms": number or empty,
  "max_price": number in ETB or empty,
  "min_price": number in ETB or empty,
  "amenities": ["amenity1", "amenity2"] or empty array,
  "original_search": "${query}"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 300,
    });

    const text = chatCompletion.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("JSON parse failed:", e);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Groq Search Error:", error.message);
    return null;
  }
};

module.exports = { generateDescription, enhanceSearch };