import numpy as np
from sklearn.linear_model import LinearRegression

def predict_demand(historical_claims, day_of_week):
    """
    Mock implementation of a demand forecasting model.
    In a real scenario, this would use a trained time-series model (e.g., ARIMA or Prophet)
    or a Random Forest regressor with lag features.
    """
    if not historical_claims:
        return 10 # default baseline
    
    # Simple linear regression over recent days for demonstration
    X = np.arange(len(historical_claims)).reshape(-1, 1)
    y = np.array(historical_claims)
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next day
    next_day_idx = np.array([[len(historical_claims)]])
    prediction = model.predict(next_day_idx)[0]
    
    # Add a slight weight for the day of week (e.g., weekends have higher demand)
    day_weight = 1.2 if day_of_week >= 5 else 1.0
    
    return max(0, int(prediction * day_weight))

def analyze_wastage(historical_donations):
    """
    Analyze patterns to see if a donor is consistently over-donating items that go unclaimed.
    """
    if not historical_donations:
        return {"status": "insufficient_data", "recommendation": "Need more data."}
    
    total_donated = sum(d.get("quantity", 0) for d in historical_donations)
    total_claimed = sum(d.get("claimed", 0) for d in historical_donations)
    
    if total_donated == 0:
        return {"status": "no_donations", "recommendation": "No food donated yet."}
        
    wastage_rate = (total_donated - total_claimed) / total_donated
    
    if wastage_rate > 0.3:
        recommendation = "High wastage detected. Consider donating smaller batches or items with longer shelf life."
    elif wastage_rate > 0.1:
        recommendation = "Moderate wastage. Review demand forecasts before prepping food."
    else:
        recommendation = "Excellent efficiency! Very little food goes to waste."
        
    return {
        "wastage_rate_percentage": round(wastage_rate * 100, 2),
        "recommendation": recommendation
    }
