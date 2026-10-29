#!/usr/bin/env python3
"""
Synthetic Feedback Data Generator for FeedbackIQ.
Generates deterministic multi-week feedback with injected ground-truth patterns.
"""
import argparse
import csv
import json
import os
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Weekly menu item catalogue (18-25 items across weekly rotation)
COLLEGE_ITEMS = {
    "breakfast": ["Idli Sambar", "Dosa", "Poori Masala", "Upma", "Pongal", "Poha", "Aloo Paratha"],
    "lunch": ["Fish Curry", "Paneer Curry", "Chicken Biryani", "Dal Tadka Rice", "Veg Meals", "Sambar Rice", "Curd Rice"],
    "snacks": ["Samosa & Chai", "Veg Puff", "Bajjis", "Filter Coffee"],
    "dinner": ["Chapati Dal", "Fried Rice", "Egg Curry", "Roti Paneer", "Khichdi"]
}

RESTAURANT_ITEMS = {
    "lunch": ["Butter Chicken", "Dal Makhani", "Tandoori Roti", "Mutton Biryani", "Paneer Tikka"],
    "dinner": ["Special Biryani", "Garlic Naan", "Kadai Paneer", "Fish Fry", "Chicken Tikka Masala"],
    "late_night": ["Shawarma Roll", "Late Night Wings", "Loaded Fries"]
}

CHANNELS = ["qr_form", "complaint_box", "csv_import", "google_review"]
LOCATIONS_COLLEGE = ["Central Dining Hall", "North Hostel Mess", "South Wing Canteen"]
LOCATIONS_RESTAURANT = ["Outlet 1 - Downtown", "Outlet 2 - Midtown", "Outlet 3 - West End"]

# Code-mixed phrases
HINGLISH_COMMENTS = {
    "temperature": [
        "khana bilkul thanda tha, heat karo please",
        "dal cold thi aur gravy freeze jaisi thi",
        "ekdum thanda food serve kiya",
        "bain-marie on nahi tha kya? Thanda ho gaya"
    ],
    "taste": [
        "namak bahut jyada tha curry mein",
        "taste bilkul bekar tha aaj",
        "bahut oily aur spicy tha, kha nahi paye",
        "salty gravy tha pura dinner"
    ],
    "hygiene": [
        "plate gandi thi aur baal nikla khane mein",
        "insect dikha salad tray par",
        "counter par safai bilkul nahi thi"
    ],
    "wait_time": [
        "roti ke liye aadha ghanta line mein khade rahe",
        "bheed itni thi ki break khatam ho gaya",
        "very late service queue"
    ],
    "freshness": [
        "biryani baasi lag rahi thi",
        "stale smell aa rahi thi chicken se",
        "fresh nahi tha aaj"
    ],
    "positive": [
        "aaj ka khana bahut badiya tha",
        "sambhar garam aur fresh tha, maza aa gaya",
        "swadishth paneer!",
        "best meal this week, shukriya"
    ]
}

TANGLISH_COMMENTS = {
    "temperature": [
        "sambar romba thanni and cold-ah irunthathu",
        "dosa soodaave illa, romba soggy",
        "saapadu romba cold today"
    ],
    "taste": [
        "uppu romba athigam curry-la",
        "taste nalla illa",
        "oil romba jyasthi",
        "masala balance illai"
    ],
    "hygiene": [
        "saapaatla mudi irunthathu",
        "salad counter la poochi paathen",
        "thattu clean ah illa"
    ],
    "wait_time": [
        "romba neram queue la nikkavendiyathu aachu",
        "service romba late"
    ],
    "freshness": [
        "stale aana smell vanthathu",
        "fresh ah illai"
    ],
    "positive": [
        "idli romba soft and sambar soodu super",
        "taste semma, nalla irunthathu",
        "romba arumai"
    ]
}

ENGLISH_COMMENTS = {
    "temperature": [
        "Food was lukewarm and cold when served.",
        "Fish curry was not heated properly today.",
        "Served cold, please keep bain-marie at proper temperature.",
        "Dosa was cold, rubbery, and completely soggy."
    ],
    "taste": [
        "Too salty, could barely eat the gravy.",
        "Excessive salt in the paneer curry today.",
        "Extremely bland and lacking seasoning.",
        "Overly oily and hard to digest."
    ],
    "hygiene": [
        "Found a hair strand in the food tray.",
        "Dead insect found in shredded vegetable counter.",
        "Hygiene is concerning, plates were oily and unwashed."
    ],
    "wait_time": [
        "Wait time was excessive, 20 minutes in queue.",
        "Bottleneck at the counter during peak lunch rush.",
        "Line moved too slowly, missed my next session."
    ],
    "freshness": [
        "Smelled stale and didn't seem fresh.",
        "Meat did not seem freshly prepared.",
        "Vegetables tasted old."
    ],
    "quantity": [
        "Portions are too small for dinner.",
        "Ran out of rice during peak rush.",
        "Quantity served was inadequate."
    ],
    "positive": [
        "Piping hot, fresh, and delicious!",
        "Great quality today, really enjoyed the meal.",
        "Everything was clean, hot, and prompt. Keep it up!",
        "Tasty and well seasoned."
    ]
}

def generate_dataset(template_name: str, weeks: int = 16, seed: int = 42, out_dir: str = "data/out"):
    random.seed(seed)
    os.makedirs(out_dir, exist_ok=True)

    items_map = COLLEGE_ITEMS if "college" in template_name else RESTAURANT_ITEMS
    locations = LOCATIONS_COLLEGE if "college" in template_name else LOCATIONS_RESTAURANT

    base_start = datetime(2026, 7, 6, 8, 0, 0) # A Monday
    total_days = weeks * 7

    feedback_records = []
    ground_truth = {
        "template": template_name,
        "seed": seed,
        "weeks": weeks,
        "injected_patterns": {
            "P1": {"name": "Fish Curry Friday Cold", "item": "Fish Curry", "day": "Friday", "meal": "lunch", "category": "temperature", "expected_rate": "55-70%", "risk": "High"},
            "P2": {"name": "Dosa Monday Soggy/Cold", "item": "Dosa", "day": "Monday", "meal": "breakfast", "category": "temperature", "expected_rate": "~50%", "risk": "High"},
            "P3": {"name": "Rice High Footfall Volume", "item": "Dal Tadka Rice", "condition": "Footfall > 80th percentile", "category": "quantity", "risk": "Correlated"},
            "P4": {"name": "Week 5 Dinner Wait Time Spike", "item": "Chapati Dal", "week": 5, "meal": "dinner", "category": "wait_time", "risk": "Low (Spike)"},
            "P5": {"name": "Week 12 Hygiene Incident Alerts", "week": 12, "count": 3, "category": "hygiene", "risk": "Critical Alert / Pin"},
            "P6": {"name": "Paneer Salt Fixed at Week 10", "item": "Paneer Curry", "day": "Wednesday", "meal": "lunch", "category": "taste", "pre_fix_rate": "~50%", "post_fix_rate": "~8%", "fix_week": 10},
            "P7": {"name": "Chicken Biryani Freshness Emerging", "item": "Chicken Biryani", "category": "freshness", "pattern": "0% rising to 40% at week 16", "risk": "Rising"}
        },
        "stats": {}
    }

    fb_id_counter = 1
    code_mixed_count = 0
    pattern_hits = {"P1": 0, "P1_total": 0, "P2": 0, "P2_total": 0, "P4": 0, "P5": 0, "P6_pre": 0, "P6_pre_total": 0, "P6_post": 0, "P6_post_total": 0, "P7": 0, "P7_total": 0}

    for day_idx in range(total_days):
        current_date = base_start + timedelta(days=day_idx)
        current_week = (day_idx // 7) + 1
        day_of_week = current_date.strftime("%A")

        # 25-80 comments per day, higher on Mondays and Weekends
        base_comments = random.randint(30, 55)
        if day_of_week in ("Monday", "Saturday", "Sunday"):
            base_comments += random.randint(15, 25)

        # Check high footfall for P3
        is_high_footfall = base_comments > 60

        for _ in range(base_comments):
            # Select meal
            meal = random.choices(["breakfast", "lunch", "snacks", "dinner"], weights=[0.25, 0.40, 0.10, 0.25])[0]
            if meal not in items_map:
                meal = list(items_map.keys())[0]

            item = random.choice(items_map[meal])
            location = random.choice(locations)
            channel = random.choices(CHANNELS, weights=[0.55, 0.20, 0.15, 0.10])[0]

            issue_cat = "positive"
            rating = 4
            text = ""
            lang = "en"

            # Injected Pattern overrides
            injected = False

            # P5: Week 12 exactly 3 hygiene comments
            if current_week == 12 and pattern_hits["P5"] < 3 and random.random() < 0.15:
                issue_cat = "hygiene"
                rating = 1
                pattern_hits["P5"] += 1
                text = random.choice(["Found a cockroach in the cabbage salad bowl!", "Dead insect found in food tray!", "Found a hair strand inside the dal curry."])
                injected = True

            # P1: Fish curry, Friday lunch, temperature (55-70% complaint rate)
            elif day_of_week == "Friday" and meal == "lunch" and item == "Fish Curry":
                pattern_hits["P1_total"] += 1
                if random.random() < 0.62: # 62% in 55-70% range
                    issue_cat = "temperature"
                    rating = random.choice([1, 2])
                    pattern_hits["P1"] += 1
                    injected = True

            # P2: Dosa, Monday breakfast, temperature/soggy (~50%)
            elif day_of_week == "Monday" and meal == "breakfast" and item == "Dosa":
                pattern_hits["P2_total"] += 1
                if random.random() < 0.50:
                    issue_cat = "temperature"
                    rating = random.choice([1, 2])
                    pattern_hits["P2"] += 1
                    injected = True

            # P4: Week 5 only, wait_time at dinner (one-off spike)
            elif current_week == 5 and meal == "dinner" and not injected:
                if random.random() < 0.35:
                    issue_cat = "wait_time"
                    rating = 2
                    pattern_hits["P4"] += 1
                    injected = True

            # P6: Paneer curry, Wednesday lunch, taste (too salty) ~50% weeks 1-9, ~8% from week 10
            elif day_of_week == "Wednesday" and meal == "lunch" and item == "Paneer Curry":
                if current_week <= 9:
                    pattern_hits["P6_pre_total"] += 1
                    if random.random() < 0.52:
                        issue_cat = "taste"
                        rating = random.choice([1, 2])
                        pattern_hits["P6_pre"] += 1
                        injected = True
                else:
                    pattern_hits["P6_post_total"] += 1
                    if random.random() < 0.08:
                        issue_cat = "taste"
                        rating = 2
                        pattern_hits["P6_post"] += 1
                        injected = True

            # P7: Chicken biryani freshness: 0% rising to 40% by week 16
            elif item == "Chicken Biryani":
                pattern_hits["P7_total"] += 1
                rising_rate = (current_week / weeks) * 0.40
                if random.random() < rising_rate:
                    issue_cat = "freshness"
                    rating = random.choice([1, 2])
                    pattern_hits["P7"] += 1
                    injected = True

            # P3: Rice on high-footfall days, quantity issues
            elif is_high_footfall and item == "Dal Tadka Rice" and random.random() < 0.30:
                issue_cat = "quantity"
                rating = 2
                injected = True

            # Background generation if not injected
            if not injected:
                # 12-15% neutral/positive
                if random.random() < 0.14:
                    issue_cat = "positive"
                    rating = random.choice([4, 5])
                else:
                    issue_cat = random.choice(["temperature", "taste", "wait_time", "freshness", "quantity"])
                    rating = random.choice([1, 2, 3])

            # Language selection (18-22% code-mixed)
            lang_roll = random.random()
            if lang_roll < 0.12:
                lang = "hi_code_mixed"
                code_mixed_count += 1
                pool = HINGLISH_COMMENTS.get(issue_cat, HINGLISH_COMMENTS["positive"])
                text = random.choice(pool)
            elif lang_roll < 0.20:
                lang = "ta_code_mixed"
                code_mixed_count += 1
                pool = TANGLISH_COMMENTS.get(issue_cat, TANGLISH_COMMENTS["positive"])
                text = random.choice(pool)
            else:
                lang = "en"
                pool = ENGLISH_COMMENTS.get(issue_cat, ENGLISH_COMMENTS["positive"])
                text = random.choice(pool)

            # Minor formatting variations (ALL CAPS / Typos)
            if random.random() < 0.08:
                text = text.upper()

            rec = {
                "feedback_id": f"fb_{fb_id_counter:06d}",
                "date": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                "meal_type": meal,
                "item": item,
                "rating": rating,
                "comment": text,
                "channel": channel,
                "issue_category": issue_cat,
                "location": location
            }
            feedback_records.append(rec)
            fb_id_counter += 1

    # Write feedback.csv
    csv_path = Path(out_dir) / "feedback.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "feedback_id", "date", "meal_type", "item", "rating",
            "comment", "channel", "issue_category", "location"
        ])
        writer.writeheader()
        writer.writerows(feedback_records)

    # Compute measured pattern rates
    p1_rate = (pattern_hits["P1"] / max(1, pattern_hits["P1_total"])) * 100
    p2_rate = (pattern_hits["P2"] / max(1, pattern_hits["P2_total"])) * 100
    p6_pre_rate = (pattern_hits["P6_pre"] / max(1, pattern_hits["P6_pre_total"])) * 100
    p6_post_rate = (pattern_hits["P6_post"] / max(1, pattern_hits["P6_post_total"])) * 100
    code_mixed_pct = (code_mixed_count / len(feedback_records)) * 100

    ground_truth["stats"] = {
        "total_records": len(feedback_records),
        "code_mixed_percentage": round(code_mixed_pct, 2),
        "P1_measured_rate": round(p1_rate, 2),
        "P2_measured_rate": round(p2_rate, 2),
        "P5_hygiene_alert_count": pattern_hits["P5"],
        "P6_pre_fix_rate": round(p6_pre_rate, 2),
        "P6_post_fix_rate": round(p6_post_rate, 2),
        "P4_week5_spikes": pattern_hits["P4"]
    }

    # Write ground_truth.json
    gt_path = Path(out_dir) / "ground_truth.json"
    with open(gt_path, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)

    # Print summary table
    print("\n================ SYNTHETIC DATA GENERATION SUMMARY ================")
    print(f"Template: {template_name} | Seed: {seed} | Weeks: {weeks} | Total Rows: {len(feedback_records)}")
    print(f"Code-mixed (Hinglish/Tanglish) share: {code_mixed_pct:.1f}% (target: 15-25%)")
    print("-------------------------------------------------------------------")
    print(f"P1 (Fish Curry Friday Cold) Complaint Rate: {p1_rate:.1f}% (target: 55-70%)")
    print(f"P2 (Dosa Monday Soggy/Cold) Complaint Rate: {p2_rate:.1f}% (target: ~50%)")
    print(f"P4 (Week 5 Dinner Wait Time Spike): {pattern_hits['P4']} complaints (one-off)")
    print(f"P5 (Week 12 Hygiene Incident Alerts): {pattern_hits['P5']} alerts generated (target: exactly 3)")
    print(f"P6 (Paneer Salt Fixed): Pre-fix: {p6_pre_rate:.1f}% -> Post-fix: {p6_post_rate:.1f}% (target: ~50% -> ~8%)")
    print(f"P7 (Biryani Freshness Rising): {pattern_hits['P7']} complaints total")
    print("===================================================================\n")
    return feedback_records, ground_truth

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic feedback with injected patterns")
    parser.add_argument("--template", default="college_mess", help="Template name")
    parser.add_argument("--weeks", type=int, default=16, help="Number of weeks")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--out", default="data/out", help="Output directory")
    args = parser.parse_args()

    generate_dataset(args.template, args.weeks, args.seed, args.out)
