#!/usr/bin/env python3
"""
Zomato Bangalore review dataset loader for Analysis agent evaluation.
Mandatory notice printed: 'PROXY DATA, NOT CANTEEN DATA. For Analysis-agent testing only.'
"""
import os
import csv
import sys
from pathlib import Path

NOTICE = "PROXY DATA, NOT CANTEEN DATA. For Analysis-agent testing only."

def load_zomato_dataset(filepath: str = "data/zomato.csv"):
    print(NOTICE)
    path = Path(filepath)
    if not path.exists():
        print(f"Notice: '{filepath}' not found. Generating sample proxy review fixture.")
        sample_rows = [
            {"review_id": "zomato_001", "restaurant": "Empire Restaurant", "rating": "2", "text": "Food was cold and delivered 45 minutes late.", "aspect": "delivery"},
            {"review_id": "zomato_002", "restaurant": "Meghana Foods", "rating": "5", "text": "Piping hot biryani, best taste in Bangalore!", "aspect": "taste"},
            {"review_id": "zomato_003", "restaurant": "Truffles", "rating": "1", "text": "Found a plastic wrapper inside the burger bun.", "aspect": "hygiene"},
            {"review_id": "zomato_004", "restaurant": "A2B", "rating": "3", "text": "Sambar was lukewarm and dosas were rubbery.", "aspect": "temperature"},
        ]
        return sample_rows

    reviews = []
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            reviews.append(row)
    print(f"Loaded {len(reviews)} proxy records from {filepath}")
    return reviews

if __name__ == "__main__":
    load_zomato_dataset()
