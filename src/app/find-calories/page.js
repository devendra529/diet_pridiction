"use client";
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Image from "next/image";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { Camera, Upload, X } from "lucide-react";

export default function FindCaloriesPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detectedFood, setDetectedFood] = useState(null);
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Load TensorFlow model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("Model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setDetectedFood(null);
      setNutritionInfo(null);
    }
  };

  const detectFood = async () => {
    if (!model || !imageRef.current) {
      alert("Model not loaded yet. Please wait.");
      return;
    }

    setLoading(true);
    try {
      // Detect objects in image
      const predictions = await model.detect(imageRef.current);
      
      // Filter food-related predictions
      const foodKeywords = [
        'apple', 'banana', 'orange', 'sandwich', 'pizza', 'cake', 'hot dog',
        'donut', 'carrot', 'broccoli', 'bowl', 'cup', 'bottle'
      ];
      
      const foodPredictions = predictions.filter(pred => 
        foodKeywords.some(keyword => pred.class.toLowerCase().includes(keyword))
      );

      if (foodPredictions.length > 0) {
        const topPrediction = foodPredictions[0];
        setDetectedFood({
          name: topPrediction.class,
          confidence: (topPrediction.score * 100).toFixed(1)
        });

        // Fetch nutrition data
        await fetchNutritionData(topPrediction.class);
      } else {
        alert("No food detected in the image. Try another image with common foods.");
        setDetectedFood(null);
      }
    } catch (error) {
      console.error("Detection error:", error);
      alert("Error detecting food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNutritionData = async (foodName) => {
    try {
      const response = await fetch(`/api/nutrition?food=${encodeURIComponent(foodName)}`);
      const data = await response.json();
      
      if (data.success && data.foods.length > 0) {
        setNutritionInfo(data.foods[0]);
      } else {
        // Fallback nutrition data
        setNutritionInfo({
          name: foodName,
          nutrients: {
            calories: "N/A",
            protein: "N/A",
            carbs: "N/A",
            fat: "N/A"
          },
          servingSize: "1",
          servingUnit: "serving"
        });
      }
    } catch (error) {
      console.error("Error fetching nutrition:", error);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setDetectedFood(null);
    setNutritionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">📸 AI Calorie Detector</h1>
          <p className="page-subtitle">
            Upload a food image and let AI detect calories instantly
          </p>
        </div>

        <div className="detector-container">
          {!preview ? (
            <div className="upload-area">
              <div className="upload-content">
                <Camera size={64} color="#667eea" />
                <h3>Upload Food Image</h3>
                <p>Click to upload or drag and drop</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-button"
                >
                  <Upload size={20} />
                  Choose Image
                </button>
              </div>
            </div>
          ) : (
            <div className="preview-area">
              <div className="image-container">
                <button onClick={clearImage} className="clear-button">
                  <X size={20} />
                </button>
       <Image
        ref={imageRef}
        src={preview}
        alt="Food preview"
        width={300}
        height={200}
        className="preview-image"
        crossOrigin="anonymous"
        unoptimized
      />

              </div>

              <button
                onClick={detectFood}
                disabled={loading || !model}
                className="detect-button"
              >
                {loading ? "Detecting..." : "🔍 Detect Food & Calories"}
              </button>

              {detectedFood && (
                <div className="detection-result">
                  <h3>✅ Detection Result</h3>
                  <div className="detected-item">
                    <span className="food-name">{detectedFood.name}</span>
                    <span className="confidence">
                      Confidence: {detectedFood.confidence}%
                    </span>
                  </div>
                </div>
              )}

              {nutritionInfo && (
                <div className="nutrition-card">
                  <h3>📊 Nutrition Information</h3>
                  <div className="nutrition-details">
                    <div className="nutrition-row">
                      <span className="label">Food:</span>
                      <span className="value">{nutritionInfo.name}</span>
                    </div>
                    {nutritionInfo.brandName && (
                      <div className="nutrition-row">
                        <span className="label">Brand:</span>
                        <span className="value">{nutritionInfo.brandName}</span>
                      </div>
                    )}
                    <div className="nutrition-row highlight">
                      <span className="label">🔥 Calories:</span>
                      <span className="value">
                        {nutritionInfo.nutrients.calories || "N/A"} kcal
                      </span>
                    </div>
                    <div className="nutrition-row">
                      <span className="label">💪 Protein:</span>
                      <span className="value">
                        {nutritionInfo.nutrients.protein || "N/A"} g
                      </span>
                    </div>
                    <div className="nutrition-row">
                      <span className="label">🍞 Carbs:</span>
                      <span className="value">
                        {nutritionInfo.nutrients.carbs || "N/A"} g
                      </span>
                    </div>
                    <div className="nutrition-row">
                      <span className="label">🥑 Fat:</span>
                      <span className="value">
                        {nutritionInfo.nutrients.fat || "N/A"} g
                      </span>
                    </div>
                    <div className="serving-info">
                      Per {nutritionInfo.servingSize} {nutritionInfo.servingUnit}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="info-section">
          <h3>ℹ️ How it works</h3>
          <ol>
            <li>Upload a clear image of your food</li>
            <li>Our AI model (COCO-SSD) detects the food items</li>
            <li>We fetch detailed nutrition information from our database</li>
            <li>Get instant calorie and macro breakdown</li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        .detector-container {
          max-width: 800px;
          margin: 0 auto 3rem;
        }

        .upload-area {
          background: white;
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          border: 3px dashed #e0e0e0;
          transition: all 0.3s ease;
        }

        .upload-area:hover {
          border-color: #667eea;
          background: #f9f9ff;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-content h3 {
          font-size: 1.5rem;
          color: #333;
          margin: 1rem 0 0.5rem;
        }

        .upload-content p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .file-input {
          display: none;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .preview-area {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .image-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .preview-image {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          border-radius: 12px;
        }

        .clear-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .clear-button:hover {
          background: #ff4444;
          color: white;
        }

        .detect-button {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .detect-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .detect-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .detection-result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border-radius: 12px;
        }

        .detection-result h3 {
          margin-bottom: 1rem;
          color: #2e7d32;
        }

        .detected-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .food-name {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: capitalize;
          color: #1b5e20;
        }

        .confidence {
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 20px;
          font-weight: 600;
          color: #2e7d32;
        }

        .nutrition-card {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .nutrition-card h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .nutrition-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .nutrition-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
        }

        .nutrition-row.highlight {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          font-weight: 700;
        }

        .nutrition-row .label {
          color: #666;
        }

        .nutrition-row .value {
          font-weight: 600;
          color: #333;
        }

        .serving-info {
          margin-top: 1rem;
          text-align: center;
          color: #666;
          font-style: italic;
        }

        .info-section {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .info-section h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .info-section ol {
          padding-left: 1.5rem;
        }

        .info-section li {
          margin-bottom: 0.75rem;
          color: #666;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .upload-area {
            padding: 2rem 1rem;
          }

          .preview-area {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}