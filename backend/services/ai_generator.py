from typing import List, Dict, Optional
import os
import json
import google.generativeai as genai
from flask import current_app

class QuestionGenerator:
    """
    Service to generate questions using Google's Gemini AI.
    """
    
    @staticmethod
    def _get_api_key():
        key = os.getenv("GEMINI_API_KEY")
        if not key:
             # Fallback or error logic
             print("Warning: GEMINI_API_KEY not set.")
        return key

    @staticmethod
    def generate_batch(topic: str, difficulty: int, count: int = 5) -> List[Dict]:
        """
        Generates a batch of multiple-choice questions.
        """
        api_key = QuestionGenerator._get_api_key()
        if not api_key:
            raise Exception("GEMINI_API_KEY is not configured.")

        genai.configure(api_key=api_key)
        
        # List of models to try in order of preference
        # User can force a model via env var GEMINI_MODEL
        preferred = os.getenv("GEMINI_MODEL")
        candidates = [preferred] if preferred else [
            "gemini-2.5-flash"
        ]

        last_error = None
        
        # Helper to try generation
        for model_name in candidates:
            try:
                model = genai.GenerativeModel(model_name)
                # We do the generation inside the loop to catch the specific 404 for that model
                # Note: We need to move the prompt generation UP to avoid repeating it, 
                # but for this refactor I'll just instantiate here and let the try/catch block below handle the call.
                # Actually, simpler: just set self.model here? No, GenerativeModel is just a client.
                # We will just break if we successfully instantiate? No, instantiation doesn't validate.
                # We have to try generating.
                
                # ... Rest of logic needs to be indented or structural change ...
                # optimization: Just pick the model string here, and let the main try/catch handle it?
                # No, because we want to fail over.
                pass 
            except:
                continue

        # REFACTORING for robustness:
        # We will wrap the generation call in a loop.
        
        topic_lower = topic.lower()
        if "general aptitude" in topic_lower:
            topic_instruction = 'on various General Aptitude topics (like Quantitative Analysis, Logical Reasoning, Verbal Ability)'
        elif "technical aptitude" in topic_lower:
            topic_instruction = 'on various Technical Aptitude topics (like Computer Science, Programming, Data Structures, Algorithms, Operating Systems, Databases)'
        elif topic_lower in ["mixed", "any", "mixed aptitude"] or not topic:
             topic_instruction = 'on a mix of General Aptitude and Technical Computer Science topics'
        else:
             topic_instruction = f'on the topic "{topic}"'

        prompt = f"""
        Generate {count} multiple-choice questions {topic_instruction} with a difficulty level of {difficulty} (on a scale of 1 to 5, where 5 is expert).
        
        Return ONLY a raw JSON array. Do not wrap in markdown code blocks.
        
        Each object in the array must have:
        - "text": The question text (string)
        - "options": An array of 4 distinct string options
        - "answer": The correct option string (must be one of the options)
        - "explanation": A brief explanation of why the answer is correct (string)
        
        Ensure the questions are high quality and relevant to the topic.
        """

        for model_name in candidates:
            try:
                # print(f"Trying model: {model_name}") 
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                # If we get here, it worked! Process response
                text = response.text.strip()
                # ... processing logic ...
                if text.startswith("```"):
                    lines = text.splitlines()
                    if lines[0].startswith("```"): lines = lines[1:]
                    if lines[-1].startswith("```"): lines = lines[:-1]
                    text = "\n".join(lines)
                
                questions = json.loads(text)
                
                # Validate
                valid_questions = []
                for q in questions:
                    if all(k in q for k in ["text", "options", "answer"]) and len(q["options"]) >= 2:
                        q["difficulty"] = difficulty
                        q["topic"] = topic
                        q["type"] = "Technical Aptitude"
                        if q["answer"] not in q["options"]: continue 
                        valid_questions.append(q)
                
                if not valid_questions:
                    raise Exception("Generated JSON contained no valid questions")

                print(f"[AI] Success with model: {model_name}")
                return valid_questions[:count]

            except Exception as e:
                last_error = e
                print(f"[AI] Model {model_name} failed: {e}")
                continue
        
        # If all fail
        raise last_error
