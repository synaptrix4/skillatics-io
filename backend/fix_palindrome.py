from pymongo import MongoClient

try:
    print("Fixing Palindrome test cases...")
    client = MongoClient("mongodb+srv://synaptrix4_db_user:J9XtgV7H3xSqyfMT@skillaticscluster.nlzuvuu.mongodb.net/?retryWrites=true&w=majority&appName=SkillaticsCluster", serverSelectionTimeoutMS=5000)
    db = client.skillatics
    
    q = db.questions.find_one({"title": "Palindrome Number"})
    if q and "test_cases" in q:
        new_test_cases = []
        changed = False
        for tc in q["test_cases"]:
            expected = tc.get("expected_output", "").strip()
            if expected.lower() == "true":
                tc["expected_output"] = "True"
                changed = True
            elif expected.lower() == "false":
                tc["expected_output"] = "False"
                changed = True
            new_test_cases.append(tc)
            
        if changed:
            db.questions.update_one(
                {"_id": q["_id"]},
                {"$set": {"test_cases": new_test_cases}}
            )
            print("Successfully capitalized true/false in database test cases!")
        else:
            print("No boolean outputs needed changing.")
except Exception as e:
    print(f"Error: {e}")
