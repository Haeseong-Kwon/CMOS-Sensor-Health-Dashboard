
import os
import time
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression

# .env.local 파일에서 환경 변수 로드
load_dotenv(dotenv_path='.env.local')

# Supabase 클라이언트 초기화
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL 또는 Key가 환경 변수에 설정되지 않았습니다.")

supabase: Client = create_client(supabase_url, supabase_key)

# --- 예측 및 분석 설정 ---
DEVICE_ID = 1  # 분석 대상이 되는 센서의 고유 ID
NOISE_CRITICAL_THRESHOLD = 5.0  # RUL 예측을 위한 노이즈 임계값

# 건강 점수 계산을 위한 가중치
HEALTH_SCORE_WEIGHTS = {
    "temp_stability": 0.3,
    "noise_level": 0.5,
    "pixel_growth": 0.2,
}

# 정규화를 위한 각 메트릭의 기대 범위 (min, max)
# 이 값들은 실제 운영 환경의 데이터 분포에 따라 조정해야 합니다.
METRIC_BOUNDS = {
    "temp_std": (0, 2),          # 온도 표준편차의 기대 범위
    "noise_level": (0.5, 5.0),   # 노이즈 레벨의 기대 범위
    "pixel_growth": (0, 5),      # 24시간 동안의 데드 픽셀 증가량 기대 범위
}


def normalize_value(value, bounds):
    """값을 0과 1 사이로 정규화합니다. 값이 낮을수록 좋다고 가정합니다."""
    min_val, max_val = bounds
    normalized = (value - min_val) / (max_val - min_val)
    return np.clip(1 - normalized, 0, 1) # 점수는 1에서 빼서, 값이 낮을수록 높은 점수가 나오게 함

def get_health_score(df_24h):
    """지난 24시간 데이터를 바탕으로 건강 점수를 계산합니다."""
    if df_24h.empty:
        return 0

    # 1. 온도 안정성 점수
    temp_std = df_24h['temperature'].std()
    temp_score = normalize_value(temp_std, METRIC_BOUNDS["temp_std"])

    # 2. 노이즈 레벨 점수
    latest_noise = df_24h.iloc[0]['noise_level']
    noise_score = normalize_value(latest_noise, METRIC_BOUNDS["noise_level"])

    # 3. 데드 픽셀 증가율 점수
    if len(df_24h) > 1:
        pixel_growth = df_24h.iloc[0]['dead_pixel_count'] - df_24h.iloc[-1]['dead_pixel_count']
    else:
        pixel_growth = 0
    pixel_score = normalize_value(pixel_growth, METRIC_BOUNDS["pixel_growth"])

    # 4. 가중 평균 계산
    w = HEALTH_SCORE_WEIGHTS
    health_score = (temp_score * w["temp_stability"] +
                    noise_score * w["noise_level"] +
                    pixel_score * w["pixel_growth"]) * 100
    
    return round(health_score, 2)


def predict_rul(df_all):
    """전체 노이즈 레벨 데이터를 선형 회귀로 분석하여 RUL을 예측합니다."""
    if len(df_all) < 10: # 최소 데이터 포인트 수
        return None, "데이터 부족"

    df_all['time_elapsed'] = (df_all['log_timestamp'] - df_all['log_timestamp'].min()).dt.total_seconds()
    
    X = df_all[['time_elapsed']]
    y = df_all['noise_level']

    model = LinearRegression()
    model.fit(X, y)

    slope = model.coef_[0]

    # 노이즈가 증가하지 않는 경우 RUL 예측 불가
    if slope <= 0:
        return None, "노이즈 증가 추세 없음"

    intercept = model.intercept_
    
    # y = slope * x + intercept  =>  x = (y - intercept) / slope
    seconds_to_threshold = (NOISE_CRITICAL_THRESHOLD - intercept) / slope
    
    if seconds_to_threshold <= df_all['time_elapsed'].max():
        return 0, "임계값 이미 도달" # 이미 임계값을 넘은 경우
        
    predicted_end_date = df_all['log_timestamp'].min() + timedelta(seconds=seconds_to_threshold)
    rul_days = (predicted_end_date - datetime.now()).days

    return max(0, rul_days), "예측 성공"


def ensure_device_exists():
    """분석 대상 장치가 DB에 존재하는지 확인하고, 없으면 생성합니다."""
    try:
        response = supabase.table("sensor_devices").select("id").eq("id", DEVICE_ID).execute()
        if not response.data:
            print(f"장치 ID {DEVICE_ID}가 존재하지 않아 새로 생성합니다.")
            supabase.table("sensor_devices").insert({
                "id": DEVICE_ID,
                "device_name": f"Simulated-CMOS-{DEVICE_ID}",
                "status": "initializing"
            }).execute()
    except Exception as e:
        print(f"장치 확인/생성 중 오류: {e}")
        # 이 경우, 테이블이 존재하지 않을 가능성이 높습니다.
        # 실제 환경에서는 DB 스키마 마이그레이션 도구를 사용해야 합니다.

def run_predictive_engine():
    """주기적으로 RUL과 건강 점수를 계산하고 DB를 업데이트합니다."""
    print("예측 유지보수 엔진을 시작합니다. (매시간 실행)")
    
    while True:
        try:
            # 0. 대상 장치 확인
            ensure_device_exists()

            # 1. 데이터 가져오기
            one_day_ago = (datetime.utcnow() - timedelta(days=1)).isoformat()
            
            # 지난 24시간 데이터
            resp_24h = supabase.table("sensor_health_logs").select("*").gte("log_timestamp", one_day_ago).order("log_timestamp", desc=True).execute()
            df_24h = pd.DataFrame(resp_24h.data)
            if not df_24h.empty:
                 df_24h["log_timestamp"] = pd.to_datetime(df_24h["log_timestamp"])
            
            # 전체 데이터
            resp_all = supabase.table("sensor_health_logs").select("*").order("log_timestamp", asc=True).execute()
            df_all = pd.DataFrame(resp_all.data)
            if not df_all.empty:
                df_all["log_timestamp"] = pd.to_datetime(df_all["log_timestamp"])

            # 2. 분석 실행
            health_score = get_health_score(df_24h)
            rul_days, rul_status = predict_rul(df_all)
            
            print(f"[{datetime.now()}] 분석 완료: 건강 점수={health_score}, RUL={rul_days}일 ({rul_status})")

            # 3. DB 업데이트
            # 3-1. sensor_predictions 테이블에 결과 저장 (Upsert)
            supabase.table("sensor_predictions").upsert({
                "device_id": DEVICE_ID,
                "predicted_rul_days": rul_days,
                "health_score": health_score,
                "prediction_status": rul_status,
                "created_at": datetime.utcnow().isoformat()
            }, on_conflict="device_id").execute()

            # 3-2. sensor_devices 테이블의 상태 업데이트
            device_status = "healthy"
            if health_score < 50:
                device_status = "warning"
            if rul_days is not None and rul_days < 30:
                device_status = "predictive_warning"
            if health_score < 20 or (rul_days is not None and rul_days < 7):
                device_status = "critical"

            supabase.table("sensor_devices").update({"status": device_status, "last_updated": datetime.utcnow().isoformat()}).eq("id", DEVICE_ID).execute()
            print(f"장치 {DEVICE_ID}의 상태를 '{device_status}'로 업데이트했습니다.")

        except Exception as e:
            print(f"예측 엔진 실행 중 오류 발생: {e}")

        # 1시간 대기
        print("다음 분석까지 1시간 대기합니다...")
        time.sleep(3600)

if __name__ == "__main__":
    run_predictive_engine()
