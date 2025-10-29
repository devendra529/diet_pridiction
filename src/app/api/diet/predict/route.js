import { NextResponse } from 'next/server';

// Free AI API options (choose one):
// 1. Hugging Face (Free, requires API key)
// 2. Groq (Free, fast inference)
// 3. Together AI (Free tier available)

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Calculate BMI
function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Calculate BMR (Basal Metabolic Rate)
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very active': 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel.toLowerCase()] || 1.2));
}

// Generate diet plan using AI (Hugging Face)
async function generateWithHuggingFace(prompt) {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );

    const data = await response.json();
    return data[0]?.generated_text || null;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    return null;
  }
}

// Generate diet plan using AI (Groq - Fast and Free)
async function generateWithGroq(prompt) {
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist and diet expert. Provide personalized diet advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
}

// Rule-based AI prediction (Fallback - No API needed)
function generateRuleBasedPrediction(userData) {
  const { weight, height, age, gender, activityLevel, goal, medicalConditions, dietaryRestrictions } = userData;
  
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Calculate calorie target based on goal
  let calorieTarget = tdee;
  let adjustment = '';
  
  if (goal.toLowerCase().includes('lose')) {
    calorieTarget -= 500;
    adjustment = 'Creating a 500 calorie deficit for healthy weight loss (0.5kg per week)';
  } else if (goal.toLowerCase().includes('gain')) {
    calorieTarget += 500;
    adjustment = 'Adding 500 calories for muscle gain and healthy weight increase';
  } else if (goal.toLowerCase().includes('muscle')) {
    calorieTarget += 300;
    adjustment = 'Slight calorie surplus with high protein for muscle building';
  } else {
    adjustment = 'Maintaining current weight with balanced nutrition';
  }

  // Calculate macros
  const proteinMultiplier = goal.toLowerCase().includes('muscle') ? 2.2 : 2.0;
  const protein = Math.round(weight * proteinMultiplier);
  const proteinCalories = protein * 4;
  
  const fatPercentage = 0.25;
  const fatCalories = calorieTarget * fatPercentage;
  const fats = Math.round(fatCalories / 9);
  
  const carbCalories = calorieTarget - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);
  
  const fiber = 30;
  const water = Math.round(weight * 0.033);

  // Generate meal recommendations based on conditions
  let mealRecommendations = [];
  let focusAreas = [];
  let avoidAreas = [];
  
  if (medicalConditions.toLowerCase().includes('diabetes')) {
    focusAreas = ['Low glycemic index foods', 'High fiber meals', 'Complex carbohydrates', 'Regular meal timing'];
    avoidAreas = ['Refined sugars', 'White bread and rice', 'Sugary drinks', 'Processed foods'];
    mealRecommendations = [
      'Breakfast: Steel-cut oatmeal with berries and nuts',
      'Snack: Greek yogurt with chia seeds',
      'Lunch: Grilled chicken with quinoa and roasted vegetables',
      'Snack: Apple slices with almond butter',
      'Dinner: Baked salmon with brown rice and steamed broccoli'
    ];
  } else if (medicalConditions.toLowerCase().includes('hypertension')) {
    focusAreas = ['Low sodium foods', 'DASH diet principles', 'Potassium-rich foods', 'Whole grains'];
    avoidAreas = ['Processed meats', 'Canned soups', 'Salty snacks', 'Fast food'];
    mealRecommendations = [
      'Breakfast: Banana smoothie with spinach and oats',
      'Snack: Fresh fruit salad',
      'Lunch: Grilled fish with sweet potato and green beans',
      'Snack: Unsalted nuts and berries',
      'Dinner: Lean turkey with quinoa and mixed vegetables'
    ];
  } else if (medicalConditions.toLowerCase().includes('obesity')) {
    focusAreas = ['Portion control', 'High protein foods', 'Vegetables and fruits', 'Regular exercise'];
    avoidAreas = ['Fast food', 'Sugary beverages', 'Fried foods', 'High-calorie snacks'];
    mealRecommendations = [
      'Breakfast: Egg white omelet with vegetables and whole grain toast',
      'Snack: Vegetables with hummus',
      'Lunch: Large salad with grilled chicken breast',
      'Snack: Fresh fruit',
      'Dinner: Grilled fish with steamed vegetables and small portion of brown rice'
    ];
  } else {
    focusAreas = ['Balanced meals', 'Whole foods', 'Adequate protein', 'Healthy fats'];
    avoidAreas = ['Ultra-processed foods', 'Excessive sugar', 'Trans fats', 'Empty calories'];
    mealRecommendations = [
      'Breakfast: Whole grain toast with avocado and poached eggs',
      'Snack: Mixed nuts and fruit',
      'Lunch: Grilled chicken with quinoa and mixed salad',
      'Snack: Greek yogurt with berries',
      'Dinner: Baked fish with roasted vegetables and sweet potato'
    ];
  }

  // Adjust for dietary restrictions
  if (dietaryRestrictions.toLowerCase().includes('vegan')) {
    mealRecommendations = [
      'Breakfast: Overnight oats with plant milk, chia seeds, and fruits',
      'Snack: Hummus with vegetable sticks',
      'Lunch: Buddha bowl with quinoa, chickpeas, and mixed vegetables',
      'Snack: Fresh fruit and nuts',
      'Dinner: Tofu stir-fry with brown rice and vegetables'
    ];
  } else if (dietaryRestrictions.toLowerCase().includes('vegetarian')) {
    mealRecommendations = [
      'Breakfast: Greek yogurt parfait with granola and berries',
      'Snack: Cheese and whole grain crackers',
      'Lunch: Lentil soup with whole grain bread',
      'Snack: Hard-boiled eggs',
      'Dinner: Vegetable curry with chickpeas and brown rice'
    ];
  }

  // Generate insights
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  
  const insights = [
    `Your BMI is ${bmi} (${bmiCategory}). ${bmi < 18.5 ? 'Consider gaining weight gradually.' : bmi < 25 ? 'You are in the healthy range!' : bmi < 30 ? 'Consider weight management.' : 'Consult a healthcare provider for weight management.'}`,
    `Your daily calorie target is ${calorieTarget} kcal. ${adjustment}`,
    `Aim for ${protein}g protein, ${carbs}g carbs, and ${fats}g healthy fats daily.`,
    `Drink ${water} liters of water per day for optimal hydration.`,
    goal.toLowerCase().includes('lose') 
      ? 'Combine your diet with 150 minutes of moderate exercise per week for best results.'
      : goal.toLowerCase().includes('gain') || goal.toLowerCase().includes('muscle')
      ? 'Include resistance training 3-4 times per week to build muscle effectively.'
      : 'Stay active with at least 30 minutes of exercise most days of the week.'
  ];

  return {
    success: true,
    prediction: {
      bmi: parseFloat(bmi),
      bmr: Math.round(bmr),
      tdee: tdee,
      calories: calorieTarget,
      macros: {
        protein: protein,
        carbs: carbs,
        fats: fats,
        fiber: fiber
      },
      hydration: water,
      mealPlan: mealRecommendations,
      focusAreas: focusAreas,
      avoidAreas: avoidAreas,
      insights: insights,
      healthScore: calculateHealthScore(bmi, activityLevel, medicalConditions)
    }
  };
}

function calculateHealthScore(bmi, activityLevel, medicalConditions) {
  let score = 100;
  
  // BMI impact
  if (bmi < 18.5 || bmi > 30) score -= 20;
  else if (bmi < 20 || bmi > 27) score -= 10;
  
  // Activity level impact
  if (activityLevel === 'sedentary') score -= 15;
  else if (activityLevel === 'light') score -= 5;
  
  // Medical conditions impact
  if (medicalConditions && medicalConditions !== 'none') {
    score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

export async function POST(request) {
  try {
    const userData = await request.json();

    // Validate required fields
    if (!userData.weight || !userData.height || !userData.age) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create AI prompt
    const prompt = `As a professional nutritionist, create a personalized diet plan for:
- Age: ${userData.age}, Gender: ${userData.gender}
- Weight: ${userData.weight}kg, Height: ${userData.height}cm
- Activity Level: ${userData.activityLevel}
- Goal: ${userData.goal}
- Medical Conditions: ${userData.medicalConditions}
- Dietary Restrictions: ${userData.dietaryRestrictions}

Provide specific meal recommendations, calorie targets, and health insights.`;

    let aiResponse = null;

    // Try Groq first (fastest and free)
    if (GROQ_API_KEY) {
      aiResponse = await generateWithGroq(prompt);
    }

    // Try Hugging Face if Groq fails
    if (!aiResponse && HUGGING_FACE_API_KEY) {
      aiResponse = await generateWithHuggingFace(prompt);
    }

    // Use rule-based prediction if no AI API available or if AI fails
    const prediction = generateRuleBasedPrediction(userData);

    // If AI response exists, add it as additional insights
    if (aiResponse) {
      prediction.prediction.aiInsights = aiResponse;
    }

    return NextResponse.json(prediction);

  } catch (error) {
    console.error('Prediction error:', error);
    
    // Return rule-based prediction as fallback
    try {
      const userData = await request.json();
      const fallbackPrediction = generateRuleBasedPrediction(userData);
      return NextResponse.json(fallbackPrediction);
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate prediction',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}