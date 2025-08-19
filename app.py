from flask import Flask, request, jsonify, render_template
from datetime import datetime, timezone
from pathlib import Path
import csv

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")

# 반별 정보 저장 > 이후 db로 전환 예정
CONFIGS = {
    (1, 3): {
        "classSize": 31,
        "skipNumbers": [12],
    }
}

DEFAULT_CONFIG = {
    "classSize": 30,
    "skipNumbers": [],
}

def get_class_config(grade: int, section: int) -> dict:
    """(학년, 반) 튜플로 설정 조회. 없으면 기본값 반환."""
    return CONFIGS.get((grade, section), DEFAULT_CONFIG)

# ====== 페이지 라우트 (HTML 파일 그대로 사용) ======
@app.get("/")
def index():
    grade = request.args.get("grade", type=int)
    section = request.args.get("section", type=int)

    if grade == None or section == None:
        return render_template("home.html")
    
    cfg = get_class_config(grade, section)
    
    page_props = {
        "grade": grade,
        "section": section,
        "config": cfg,
        "serverNow": datetime.now().isoformat(timespec="seconds"),
    }
    
    return render_template("index.html", page_props=page_props)
if __name__ == "__main__":
    # 개발 편의를 위해 debug=True (운영 배포 시 False 권장)
    app.run(host="0.0.0.0", port=5000, debug=True)