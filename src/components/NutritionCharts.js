'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function NutritionCharts({ dietData, nutritionPrediction }) {
  const macroChartRef = useRef(null);
  const progressChartRef = useRef(null);
  const macroChartInstance = useRef(null);
  const progressChartInstance = useRef(null);

  useEffect(() => {
    if (!nutritionPrediction) return;

    // Macro Distribution Chart
    if (macroChartRef.current) {
      if (macroChartInstance.current) {
        macroChartInstance.current.destroy();
      }

      const ctx = macroChartRef.current.getContext('2d');
      macroChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Protein', 'Carbs', 'Fats'],
          datasets: [{
            data: [
              nutritionPrediction.protein,
              nutritionPrediction.carbs,
              nutritionPrediction.fats
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            title: {
              display: true,
              text: 'Macronutrient Distribution (grams)',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: 20
            }
          }
        }
      });
    }

    // Weekly Progress Chart (Sample Data)
    if (progressChartRef.current) {
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy();
      }

      const ctx = progressChartRef.current.getContext('2d');
      progressChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [
            {
              label: 'Weight (kg)',
              data: [
                dietData.weight,
                dietData.weight - 0.5,
                dietData.weight - 1,
                dietData.weight - 1.5,
                dietData.weight - 2,
                dietData.weight - 2.5
              ],
              borderColor: 'rgba(102, 126, 234, 1)',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Target Weight (kg)',
              data: Array(6).fill(dietData.weight - 5),
              borderColor: 'rgba(76, 175, 80, 1)',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderDash: [10, 5],
              tension: 0,
              fill: false,
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            title: {
              display: true,
              text: 'Weight Progress Tracking',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: 20
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (macroChartInstance.current) {
        macroChartInstance.current.destroy();
      }
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy();
      }
    };
  }, [dietData, nutritionPrediction]);

  if (!nutritionPrediction) return null;

  return (
    <>
      <div className="info-card chart-card">
        <div className="chart-container">
          <canvas ref={macroChartRef}></canvas>
        </div>
      </div>

      <div className="info-card chart-card" style={{ gridColumn: 'span 2' }}>
        <div className="chart-container" style={{ height: '350px' }}>
          <canvas ref={progressChartRef}></canvas>
        </div>
      </div>
    </>
  );
}