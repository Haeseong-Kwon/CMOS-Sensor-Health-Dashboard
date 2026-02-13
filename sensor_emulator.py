
import os
import time
import random
import math
from datetime import datetime
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

# 센서의 초기 상태 설정
base_temperature = 25.0  # 섭씨
temperature_drift = 0.1  # 시간당 온도 상승률
base_dead_pixels = 5
simulation_start_time = time.time()

def get_sensor_data():
    """
    시간이 지남에 따라 온도가 서서히 오르고,
    그에 따라 노이즈가 지수적으로 증가하는 것을 시뮬레이션합니다.
    불량 픽셀 수도 시간에 따라 서서히 증가할 수 있습니다.
    """
    global base_temperature, simulation_start_time

    # 현재까지 경과된 시간(초)
    elapsed_time = time.time() - simulation_start_time

    # 온도 모델링: 시간에 따라 선형적으로 증가
    current_temperature = base_temperature + (elapsed_time / 3600) * temperature_drift
    current_temperature += random.uniform(-0.5, 0.5) # 약간의 무작위 변동 추가

    # 노이즈 모델링: 온도가 기준치를 넘으면 지수적으로 증가
    noise_level = 0.5 * math.exp(0.08 * (current_temperature - base_temperature))
    noise_level += random.uniform(-0.1, 0.1)

    # 불량 픽셀 모델링: 시간이 지남에 따라 증가할 확률을 가짐
    dead_pixel_count = base_dead_pixels + int(elapsed_time / 7200) + random.randint(0, 2)

    return round(current_temperature, 2), round(noise_level, 2), dead_pixel_count

def get_health_status(temp, noise, pixels):
    """
    센서 데이터에 기반하여 현재 센서의 건강 상태를 결정합니다.
    """
    if temp > 60 or noise > 5.0 or pixels > 50:
        return "critical"
    elif temp > 45 or noise > 2.5 or pixels > 20:
        return "warning"
    else:
        return "healthy"

def run_simulator():
    """
    메인 시뮬레이터 루프. 5초마다 센서 데이터를 생성하고 Supabase에 전송합니다.
    """
    print("CMOS 센서 시뮬레이터를 시작합니다. 5초 간격으로 데이터를 Supabase에 전송합니다.")
    print(f"Supabase URL: {supabase_url}")
    
    while True:
        try:
            # 1. 가상 센서 데이터 생성
            temp, noise, pixels = get_sensor_data()

            # 2. 센서 상태 평가
            status = get_health_status(temp, noise, pixels)

            # 3. Supabase에 저장할 데이터 구성
            log_time = datetime.utcnow().isoformat()
            data_to_insert = {
                "log_timestamp": log_time,
                "temperature": temp,
                "noise_level": noise,
                "dead_pixel_count": pixels,
                "status": status,
            }

            # 4. Supabase 'sensor_health_logs' 테이블에 데이터 삽입
            # 실제 'table' 이름은 Supabase 프로젝트의 테이블 이름과 일치해야 합니다.
            data, count = supabase.table("sensor_health_logs").insert(data_to_insert).execute()
            
            print(f"[{log_time}] 데이터 전송 성공: Temp={temp}°C, Noise={noise}, Dead Pixels={pixels}, Status={status}")

        except Exception as e:
            print(f"오류 발생: {e}")

        # 5초 대기
        time.sleep(5)

if __name__ == "__main__":
    # 스크립트가 백그라운드에서 실행될 수 있도록
    # 'python sensor_emulator.py &' 와 같이 실행할 수 있습니다.
    run_simulator()
