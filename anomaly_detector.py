
import os
import time
import pandas as pd
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local 파일에서 환경 변수 로드
load_dotenv(dotenv_path='.env.local')

# Supabase 클라이언트 초기화
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL 또는 Key가 환경 변수에 설정되지 않았습니다.")

supabase: Client = create_client(supabase_url, supabase_key)

# --- 이상 징후 탐지 설정 ---
# 1. 고정 임계값
THRESHOLDS = {
    "temperature": {"warning": 45, "critical": 60},
    "noise_level": {"warning": 2.5, "critical": 5.0},
    "dead_pixel_count": {"warning": 20, "critical": 50},
}

# 2. 스파이크(Spike) 탐지 민감도 (이전 값 대비 % 증가)
SPIKE_SENSITIVITY = 1.5  # 50% 이상 급증 시 스파이크로 간주

# 3. 3-Sigma 분석 설정
SIGMA_FACTOR = 3

# 경고 중복 방지를 위한 마지막 경고 시간 기록
last_alert_times = {}
ALERT_COOLDOWN_SECONDS = 300  # 5분

def trigger_alert(metric, severity, message, details):
    """Supabase 'sensor_alerts' 테이블에 경고를 삽입합니다."""
    
    # 경고 쿨다운 확인
    current_time = time.time()
    last_alert_time = last_alert_times.get(metric)
    if last_alert_time and (current_time - last_alert_time < ALERT_COOLDOWN_SECONDS):
        print(f"[{datetime.now()}] 쿨다운: '{metric}'에 대한 경고는 이미 최근에 발생했습니다.")
        return

    try:
        data_to_insert = {
            "metric": metric,
            "severity": severity,
            "message": message,
            "details": details,
        }
        data, count = supabase.table("sensor_alerts").insert(data_to_insert).execute()
        print(f"🚨 [{datetime.now()}] 경고 발생! -> {message}")
        last_alert_times[metric] = current_time

    except Exception as e:
        print(f"경고 삽입 중 오류 발생: {e}")

def analyze_sensor_data():
    """
    최근 센서 데이터를 분석하여 이상 징후를 탐지하고 경고를 발생시킵니다.
    """
    # 지난 1시간의 데이터 가져오기
    try:
        one_hour_ago = (datetime.utcnow() - timedelta(hours=1)).isoformat()
        response = supabase.table("sensor_health_logs") 
            .select("*") 
            .gte("log_timestamp", one_hour_ago) 
            .order("log_timestamp", desc=True) 
            .execute()

        if not response.data:
            print("지난 1시간 내에 분석할 데이터가 없습니다.")
            return

        df = pd.DataFrame(response.data)
        df["log_timestamp"] = pd.to_datetime(df["log_timestamp"])
        
        # 가장 최신 데이터 포인트를 분석 대상으로 함
        latest_data = df.iloc[0]

        # --- 분석 로직 ---
        for metric in ["temperature", "noise_level", "dead_pixel_count"]:
            value = latest_data[metric]
            
            # 1. 고정 임계값 분석
            if value >= THRESHOLDS[metric]["critical"]:
                trigger_alert(metric, "critical", f"{metric} 임계값 초과 (Critical)", {"value": value, "threshold": THRESHOLDS[metric]["critical"]})
            elif value >= THRESHOLDS[metric]["warning"]:
                trigger_alert(metric, "warning", f"{metric} 임계값 초과 (Warning)", {"value": value, "threshold": THRESHOLDS[metric]["warning"]})

            if len(df) > 1:
                previous_value = df.iloc[1][metric]
                # 2. 스파이크 탐지
                if previous_value > 0 and value > previous_value * SPIKE_SENSITIVITY:
                     trigger_alert(metric, "high", f"{metric} 값 급증 (Spike)", {"from": previous_value, "to": value})

            if len(df) > 10: # 통계적 의미를 위해 최소 10개 이상 데이터 필요
                # 3. 3-Sigma 분석
                mean = df[metric].mean()
                std = df[metric].std()
                upper_bound = mean + SIGMA_FACTOR * std
                
                if value > upper_bound:
                    trigger_alert(metric, "high", f"{metric} 3-Sigma 상한 초과", {"value": value, "mean": round(mean,2), "upper_bound": round(upper_bound,2)})

    except Exception as e:
        print(f"데이터 분석 중 오류 발생: {e}")


def run_detector():
    """메인 탐지기 루프. 10초마다 센서 데이터를 분석합니다."""
    print("이상 징후 탐지 엔진을 시작합니다. 10초 간격으로 데이터를 분석합니다.")
    while True:
        analyze_sensor_data()
        time.sleep(10)

if __name__ == "__main__":
    run_detector()
