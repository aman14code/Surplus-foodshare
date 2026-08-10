from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from models.forecaster import predict_demand, analyze_wastage

app = FastAPI(title="Surplus Food ML Microservice")

class DemandRequest(BaseModel):
    shelter_id: str
    historical_claims: List[int] # Daily claims over the last N days
    day_of_week: int

class WastageRequest(BaseModel):
    donor_id: str
    historical_donations: List[dict] # { "date": "...", "quantity": int, "claimed": int }

@app.get("/")
def root():
    return {"message": "Surplus Food ML API is running."}

@app.post("/forecast/demand")
def forecast_demand(req: DemandRequest):
    try:
        prediction = predict_demand(req.historical_claims, req.day_of_week)
        return {"shelter_id": req.shelter_id, "predicted_demand": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analysis/wastage")
def analyze_wastage_pattern(req: WastageRequest):
    try:
        analysis = analyze_wastage(req.historical_donations)
        return {"donor_id": req.donor_id, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
