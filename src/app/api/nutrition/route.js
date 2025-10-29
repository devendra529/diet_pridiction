// app/api/nutrition/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const foodItem = searchParams.get('food');

  if (!foodItem) {
    return NextResponse.json({ error: 'Food item required' }, { status: 400 });
  }

  try {
    // Using USDA FoodData Central API (Free, no API key required for basic search)
    // Alternative: Edamam Nutrition API (requires free API key)
    
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodItem)}&pageSize=5&api_key=DEMO_KEY`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch nutrition data');
    }

    const data = await response.json();
    
    if (!data.foods || data.foods.length === 0) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    // Process and format the nutrition data
    const formattedFoods = data.foods.map(food => {
      const nutrients = {};
      food.foodNutrients?.forEach(nutrient => {
        const name = nutrient.nutrientName?.toLowerCase();
        if (name?.includes('protein')) {
          nutrients.protein = nutrient.value;
        } else if (name?.includes('carbohydrate')) {
          nutrients.carbs = nutrient.value;
        } else if (name?.includes('total lipid') || name?.includes('fat')) {
          nutrients.fat = nutrient.value;
        } else if (name?.includes('energy') || name?.includes('calorie')) {
          nutrients.calories = nutrient.value;
        } else if (name?.includes('fiber')) {
          nutrients.fiber = nutrient.value;
        }
      });

      return {
        name: food.description,
        brandName: food.brandName || 'Generic',
        nutrients: nutrients,
        servingSize: food.servingSize || 100,
        servingUnit: food.servingSizeUnit || 'g'
      };
    });

    return NextResponse.json({
      success: true,
      foods: formattedFoods,
      totalResults: data.totalHits
    });

  } catch (error) {
    console.error('Nutrition API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition data', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint for batch nutrition analysis
export async function POST(request) {
  try {
    const { foods } = await request.json();

    if (!foods || !Array.isArray(foods)) {
      return NextResponse.json({ error: 'Foods array required' }, { status: 400 });
    }

    const nutritionPromises = foods.map(async (food) => {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(food)}&pageSize=1&api_key=DEMO_KEY`
      );
      const data = await response.json();
      return data.foods?.[0] || null;
    });

    const results = await Promise.all(nutritionPromises);
    
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    results.forEach(food => {
      if (food && food.foodNutrients) {
        food.foodNutrients.forEach(nutrient => {
          const name = nutrient.nutrientName?.toLowerCase();
          if (name?.includes('protein')) {
            totalNutrition.protein += nutrient.value || 0;
          } else if (name?.includes('carbohydrate')) {
            totalNutrition.carbs += nutrient.value || 0;
          } else if (name?.includes('total lipid') || name?.includes('fat')) {
            totalNutrition.fat += nutrient.value || 0;
          } else if (name?.includes('energy') || name?.includes('calorie')) {
            totalNutrition.calories += nutrient.value || 0;
          } else if (name?.includes('fiber')) {
            totalNutrition.fiber += nutrient.value || 0;
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      totalNutrition: {
        calories: Math.round(totalNutrition.calories),
        protein: Math.round(totalNutrition.protein),
        carbs: Math.round(totalNutrition.carbs),
        fat: Math.round(totalNutrition.fat),
        fiber: Math.round(totalNutrition.fiber)
      },
      foods: results.filter(f => f !== null).map(f => f.description)
    });

  } catch (error) {
    console.error('Batch Nutrition API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch nutrition data' },
      { status: 500 }
    );
  }
}