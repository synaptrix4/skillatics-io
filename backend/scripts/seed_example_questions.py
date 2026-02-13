import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from urllib.parse import urlparse
import random

def gen_general_questions():
    # Each tuple: (topic, questions[])
    topics = {
        "Percentages": [
            ("What is 20% of 500?", ["80", "100", "90", "70"], "100", 1),
            ("If the price increases by 10%, what is the new price of a 250 item?", ["260", "275", "225", "250"], "275", 2),
            ("20% decrease on Rs. 300 gives?", ["280", "240", "260", "220"], "240", 1),
            ("If 50% of a number is 150, what is the number?", ["75", "250", "200", "300"], "300", 1),
            ("If population increases by 5% for 2 years successively, overall increase?", ["10.25%", "10%", "12%", "9.5%"], "10.25%", 3),
            ("What percent is 45 of 180?", ["20%", "25%", "18%", "30%"], "25%", 2),
            ("If 10% of M is 25% of N, N is what % of M?", ["25%", "40%", "50%", "60%"], "40%", 4),
            ("If mark price is 150 and sold at 120, find % loss.", ["20%", "25%", "30%", "22%"], "20%", 2),
            ("50 is what % more than 40?", ["25%", "20%", "10%", "12%"], "25%", 2),
            ("If 70 is increased to 98, then % increase?", ["28%", "35%", "40%", "45%"], "40%", 3),
            ("What percent of 1 hr is 15 min?", ["15%", "25%", "30%", "20%"], "25%", 1),
            ("A salary is increased by 30% and then decreased by 23%, total effect?", ["10.9%", "2.5%", "7.9%", "5.1%"], "0.9%", 5),
        ],
        "Averages": [
            ("Average of 4, 8, 5, 3, 7", ["5.4", "4.5", "5.6", "5.2"], "5.4", 1),
            ("Average of first 5 even numbers?", ["6", "5", "7", "8"], "6", 1),
            ("A player's average runs in five matches: 40. Total runs?", ["160", "120", "200", "140"], "200", 2),
            ("Average of 56, 34, 7, 23, 15, 21?", ["17", "26", "21", "22"], "26", 2),
            ("If average is 60, and new value 80 added, average becomes? (for 5 prev)", ["65", "62", "70", "68"], "65", 3),
            ("Average of 33, 44, 55, 66, 77, 88, 99?", ["66", "77", "70", "80"], "66", 2),
            ("Class average is 52, top scorer has 98, rest average? (30 total)", ["50.5", "49.6", "53.6", "51.6"], "50.5", 4),
            ("Find average temperature: 18, 20, 22, 26", ["21.5", "26", "20.5", "23.5"], "21.5", 1),
        ],
        "Ratios": [
            ("Ratio of 8:24:", ["1:3", "3:1", "2:3", "1:2"], "1:3", 1),
            ("Find x if 3:x = 1:5", ["10", "7", "8", "15"], "15", 1),
            ("Divide 1200 in 2:3 ratio.", ["480/720", "500/700", "400/800", "600/600"], "480/720", 1),
            ("Simplify 50:60::80:?", ["96", "100", "110", "120"], "96", 2),
            ("If A:B=2:3, B:C=4:5, then A:B:C is:", ["8:12:15", "2:4:5", "6:8:10", "4:6:8"], "8:12:15", 3),
        ],
        "Profit and Loss": [
            ("SP=Rs.120, CP=Rs.100, Profit%?", ["20%", "10%", "15%", "30%"], "20%", 1),
            ("Loss of Rs.50 on Rs.1000, loss%?", ["5%", "2%", "10%", "8%"], "5%", 1),
            ("Profit% on Rs.600 CP, Rs.660 SP?", ["10%", "15%", "11%", "12%"], "10%", 2),
            ("Mark up 20%, discount 10%, net profit %?", ["8%", "10%", "12%", "15%"], "8%", 3),
            ("If loss is same as profit at Rs.220 and Rs.240, CP?", ["230", "210", "215", "250"], "230", 4),
        ],
        "Time & Work": [
            ("A does work in 10 days, B in 15. Together in?", ["6", "5", "7", "8"], "6", 1),
            ("A 6 hr/day, B 8 hr/day: A takes 15 days, B?", ["12", "14", "11", "10"], "11", 2),
            ("If 10 men finish in 4 days, then 5 will do in?", ["8", "9", "7", "10"], "8", 1),
            ("Work: 36 days for 5 men. For 9 men?", ["20", "22", "18", "25"], "20", 2),
        ],
        "Simple Interest": [
            ("SI on Rs.1000 for 2 years at 5%?", ["100", "150", "200", "90"], "100", 1),
            ("What is the SI on Rs.500 at 8% for 3 yrs?", ["120", "100", "90", "130"], "120", 2),
            ("Principal = 2000, SI=100, rate=5%. Time?", ["1", "2", "3", "4"], "1", 3),
            ("Rs.800 in 4 years @ 12.5%, SI?", ["400", "320", "280", "350"], "400", 2),
        ],
    }
    qs = []
    for topic, qlist in topics.items():
        for text, opts, ans, diff in qlist:
            qs.append({
                "text": text,
                "topic": topic,
                "type": "General Aptitude",
                "difficulty": diff,
                "options": opts,
                "answer": ans,
                "createdAt": datetime.utcnow(),
            })
        # fill up to at least 15 per topic
        n = len(qlist)
        base = qlist[0] if qlist else ("Sample question for {}?".format(topic), ["A", "B", "C", "D"], "A", 1)
        for i in range(n, 15):
            text = f"Sample question {i+1} for {topic}?"
            opts = [f"Opt{i+1}A", f"Opt{i+1}B", f"Opt{i+1}C", f"Opt{i+1}D"]
            ans = opts[i % 4]
            diff = (i % 5) + 1
            qs.append({
                "text": text,
                "topic": topic,
                "type": "General Aptitude",
                "difficulty": diff,
                "options": opts,
                "answer": ans,
                "createdAt": datetime.utcnow(),
            })
    return qs

def gen_technical_questions():
    topics = {
        "Data Structures": [
            ("Queue works as?", ["FIFO", "LIFO", "Random", "Priority"], "FIFO", 1),
            ("Which data structure for recursion?", ["Stack", "Queue", "Array", "Graph"], "Stack", 2),
            ("BST best case search time?", ["O(log n)", "O(n)", "O(1)", "O(n log n)"], "O(log n)", 3),
        ],
        "Algorithms": [
            ("QuickSort avg time complexity?", ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"], "O(n log n)", 2),
            ("Which algorithm uses divide and conquer?", ["Merge Sort", "Bubble Sort", "Selection Sort", "None"], "Merge Sort", 2),
            ("Find min in O(n) time?", ["Linear search", "Binary search", "Counting sort", "Radix"], "Linear search", 1),
        ],
        "Operating Systems": [
            ("OS kernel is?", ["Core part", "UI", "Threads", "Files"], "Core part", 1),
            ("Best scheduling for timesharing?", ["Round Robin", "FCFS", "SJF", "Priority"], "Round Robin", 2),
        ],
        "DBMS": [
            ("Normalization removes?", ["Redundancy", "Keys", "Data", "Records"], "Redundancy", 1),
            ("SQL for remove a table?", ["DROP", "INSERT", "CHECK", "ALTER"], "DROP", 1),
        ],
        "Computer Networks": [
            ("OSI model layers?", ["7", "6", "5", "8"], "7", 1),
            ("Transport layer protocol?", ["TCP", "IP", "HTTP", "DNS"], "TCP", 2),
        ],
        "Programming Fundamentals": [
            ("OOP full form?", ["Object Oriented Programming", "Object Operating Program", "Operator Overloading Program", "None"], "Object Oriented Programming", 1),
            ("Best loop for known times?", ["for", "while", "do-while", "foreach"], "for", 1),
        ],
    }
    qs = []
    for topic, qlist in topics.items():
        for text, opts, ans, diff in qlist:
            qs.append({
                "text": text,
                "topic": topic,
                "type": "Technical Aptitude",
                "difficulty": diff if isinstance(diff, int) else 1,
                "options": opts,
                "answer": ans,
                "createdAt": datetime.utcnow(),
            })
        n = len(qlist)
        for i in range(n, 15):
            text = f"Sample technical question {i+1} for {topic}?"
            opts = [f"TOpt{i+1}A", f"TOpt{i+1}B", f"TOpt{i+1}C", f"TOpt{i+1}D"]
            ans = opts[i % 4]
            diff = (i % 5) + 1
            qs.append({
                "text": text,
                "topic": topic,
                "type": "Technical Aptitude",
                "difficulty": diff,
                "options": opts,
                "answer": ans,
                "createdAt": datetime.utcnow(),
            })
    return qs

def main():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
    explicit_db = os.getenv("MONGO_DB") or os.getenv("DB_NAME") or os.getenv("MONGO_DATABASE")
    parsed = urlparse(mongo_uri)
    parsed_db = parsed.path.lstrip("/") if parsed.path and parsed.path != "/" else None
    db_name = (explicit_db or parsed_db or "skillatics").strip()
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions = db["questions"]
    if questions.count_documents({}) > 0:
        print("Questions already exist, skipping seed.")
        return
    docs = gen_general_questions() + gen_technical_questions()
    questions.insert_many(docs)
    print(f"Seeded {len(docs)} questions.")

if __name__ == "__main__":
    main()
