import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from urllib.parse import urlparse

def main():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
    explicit_db = os.getenv("MONGO_DB") or os.getenv("DB_NAME") or os.getenv("MONGO_DATABASE")
    parsed = urlparse(mongo_uri)
    parsed_db = parsed.path.lstrip("/") if parsed.path and parsed.path != "/" else None
    db_name = (explicit_db or parsed_db or "skillatics").strip()
    client = MongoClient(mongo_uri)
    db = client[db_name]
    topics = db["topics"]
    if topics.count_documents({}) > 0:
        print("Topics already exist, skipping seed.")
        return
    now = datetime.utcnow()
    topic_docs = [
        # General Aptitude
        {
            "name": "Percentages",
            "category": "General Aptitude",
            "theory": "<b>Percents</b> are ratios with 100 as the denominator. For example: 20% = 20/100 = 0.2.<br>Applications include profit/loss, discounts, and population changes.",
            "shortcuts": "To calculate x% of y: <b>(x/100) × y</b>.<ul><li>For quick change: Final = Initial × (1 ± (percent/100))</li></ul>",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Averages",
            "category": "General Aptitude",
            "theory": "The <b>average</b> of n numbers is their sum divided by n. Used to find typical value.",
            "shortcuts": "If total changes by x, average changes by x/n.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Ratios",
            "category": "General Aptitude",
            "theory": "A <b>ratio</b> compares two quantities. Expressed a:b. Can be scaled up/down.",
            "shortcuts": "To combine two ratios, express so that the common term is the same in both.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Profit and Loss",
            "category": "General Aptitude",
            "theory": "Profit = Selling Price - Cost Price. Loss = Cost Price - Selling Price.",
            "shortcuts": "Profit% = (Profit/CP)×100. Loss% = (Loss/CP)×100.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Time & Work",
            "category": "General Aptitude",
            "theory": "Work done = Rate × Time. If A does a work in x days, A's 1 day's work = 1/x.",
            "shortcuts": "For A+B working together: 1/x + 1/y per day. Total time = xy / (x+y).",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Simple Interest",
            "category": "General Aptitude",
            "theory": "Simple Interest = Principal × Rate × Time / 100.",
            "shortcuts": "SI = PRT/100. To double money: Time = 100/Rate × 1.",
            "createdAt": now, "updatedAt": now
        },
        # Technical Aptitude
        {
            "name": "Data Structures",
            "category": "Technical Aptitude",
            "theory": "<b>Data Structures</b> organize data for efficient access (Array, List, Stack, Queue, Tree, Graph).",
            "shortcuts": "Stack: LIFO. Queue: FIFO. Trees: O(log n) search. Use hash tables for O(1) lookup.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Algorithms",
            "category": "Technical Aptitude",
            "theory": "<b>Algorithms</b> are step-by-step procedures for computation. Types: sorting, searching, recursion, divide and conquer.",
            "shortcuts": "Sorting: QuickSort avg O(n log n). Binary search: O(log n).",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Operating Systems",
            "category": "Technical Aptitude",
            "theory": "<b>OS</b> manages hardware. Key units: process mgmt, memory mgmt, file systems, scheduling.",
            "shortcuts": "Round Robin: each process gets a time slice. Deadlock: mutual exclusion + hold and wait + no preemption + circular wait.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "DBMS",
            "category": "Technical Aptitude",
            "theory": "<b>Database Management System</b>: Stores and retrieves data using tables, keys, SQL.",
            "shortcuts": "Normalization: reduce redundancy. SQL: SELECT, INSERT, UPDATE, DELETE.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Computer Networks",
            "category": "Technical Aptitude",
            "theory": "Networks connect devices. Layers: Physical, Data Link, Network, Transport, etc.",
            "shortcuts": "IP: 4 bytes. TCP: reliable; UDP: faster. OSI Model: 7 layers.",
            "createdAt": now, "updatedAt": now
        },
        {
            "name": "Programming Fundamentals",
            "category": "Technical Aptitude",
            "theory": "Covers variables, data types, loops, conditionals, functions, OOP basics.",
            "shortcuts": "Loop for N: for(int i=0;i<N;i++). swap(a,b): temp=a;a=b;b=temp.",
            "createdAt": now, "updatedAt": now
        }
    ]
    topics.insert_many(topic_docs)
    print(f"Seeded {len(topic_docs)} topics.")

if __name__ == "__main__":
    main()
