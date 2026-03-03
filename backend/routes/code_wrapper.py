"""
Helper function to wrap user code with test harness for LeetCode-style execution.
This allows users to write just the function, not I/O logic.
"""

def wrap_user_code_with_test_harness(user_code: str, language: str, test_input: str, function_name: str = None, input_format: str = None):
    """
    Wraps user's function with code to parse input and call the function.
    
    Args:
        user_code: User's function definition
        language: Programming language
        test_input: Raw test input string
        function_name: Name of the function to call (e.g., "twoSum")
        input_format: How to parse input (e.g., "array_int, int" means first line is array, second is int)
    
    Returns:
        Complete executable code
    """
    
    # If no function name provided, assume user wrote full I/O program
    if not function_name:
        return user_code
        
    input_format = str(input_format or "").strip().replace(" ", "").lower()
    
    if language == "python":
        return wrap_python_code(user_code, test_input, function_name, input_format)
    elif language == "javascript":
        return wrap_javascript_code(user_code, test_input, function_name, input_format)
    else:
        # For other languages, return as-is for now
        return user_code


def wrap_python_code(user_code: str, test_input: str, function_name: str, input_format: str):
    """Generate Python wrapper code"""
    
    # Parse the test input based on format
    input_lines = test_input.strip().split('\n')
    
# Default parsing for Two Sum style: array on line 1, target on line 2
    if not input_format or input_format == "array_int,int":
        wrapper = f'''
{user_code}

# Test harness - parses input and calls user function
import sys
import ast

# For direct execution without stdin
test_input = """{test_input}"""
lines = test_input.strip().split('\\n')

# Parse input
try:
    # Handle both space-separated string "2 7 11" and array string "[2, 7, 11]"
    first_line = lines[0].strip()
    if first_line.startswith('['):
        nums = ast.literal_eval(first_line)
    else:
        nums = list(map(int, first_line.split()))
        
    target = int(lines[1].strip())
except Exception as e:
    print(f"Error parsing input: {{e}}")
    sys.exit(1)

# Call user function
result = {function_name}(nums, target)

# Print result
if isinstance(result, (list, tuple)):
    print(' '.join(map(str, result)))
else:
    print(result)
'''
        return wrapper

    elif input_format == "string":
        wrapper = f'''
{user_code}

# Test harness
import sys

# For direct execution without stdin
test_input = """{test_input}"""
s = test_input.strip()

# Call user function
result = {function_name}(s)

# Print result
print(result)
'''
        return wrapper
        
    elif input_format == "int":
        wrapper = f'''
{user_code}

# Test harness
import sys

# For direct execution without stdin
test_input = """{test_input}"""
n = int(test_input.strip())

# Call user function
result = {function_name}(n)

# Print result
print(result)
'''
        return wrapper
    
    elif input_format == "array_int":
        wrapper = f'''
{user_code}

# Test harness
import sys
import ast

test_input = """{test_input}"""
first_line = test_input.strip().split('\\n')[0].strip()
if first_line.startswith('['):
    nums = ast.literal_eval(first_line)
else:
    nums = list(map(int, first_line.split()))

result = {function_name}(nums)

if isinstance(result, (list, tuple)):
    print(' '.join(map(str, result)))
elif result is True:
    print('True')
elif result is False:
    print('False')
else:
    print(result)
'''
        return wrapper

    elif input_format in ("array_int,array_int", "two_arrays"):
        wrapper = f'''
{user_code}

import sys, ast
test_input = """{test_input}"""
lines = test_input.strip().split('\\n')
def parse_line(l):
    l = l.strip()
    return ast.literal_eval(l) if l.startswith('[') else list(map(int, l.split()))
nums1 = parse_line(lines[0])
nums2 = parse_line(lines[1]) if len(lines) > 1 else []
result = {function_name}(nums1, nums2)
if isinstance(result, (list, tuple)):
    print(' '.join(map(str, result)))
else:
    print(result)
'''
        return wrapper

    # Generic fallback — return code that explicitly raises an error
    return f'''
{user_code}
import sys
print("Error: Unknown or missing input_format '{input_format}' in the question settings. Please ask the admin to edit this question and set a valid Input Format.", file=sys.stderr)
sys.exit(1)
'''


def wrap_javascript_code(user_code: str, test_input: str, function_name: str, input_format: str):
    """Generate JavaScript wrapper code"""
    
    if not input_format or input_format == "array_int,int":
        wrapper = f'''
{user_code}

// Test harness
const testInput = `{test_input}`;
const lines = testInput.trim().split('\\n');

// Parse input  
let nums;
const firstLine = lines[0].trim();
if (firstLine.startsWith('[')) {{
    nums = JSON.parse(firstLine);
}} else {{
    nums = firstLine.split(' ').map(Number);
}}
const target = parseInt(lines[1]);

// Call user function
const result = {function_name}(nums, target);

// Print result
if (Array.isArray(result)) {{
    console.log(result.join(' '));
}} else {{
    console.log(result);
}}
'''
        return wrapper

    elif input_format == "string":
        wrapper = f'''
{user_code}

// Test harness
const testInput = `{test_input}`;
const s = testInput.trim();

// Call user function
const result = {function_name}(s);

// Print result
console.log(result);
'''
        return wrapper
        
    elif input_format == "int":
        wrapper = f'''
{user_code}

// Test harness
const testInput = `{test_input}`;
const n = parseInt(testInput.trim());

// Call user function
const result = {function_name}(n);

// Print result
console.log(result);
'''
        return wrapper
    
    elif input_format == "array_int":
        wrapper = f'''
{user_code}

// Test harness
const testInput = `{test_input}`;
const firstLine = testInput.trim().split('\\n')[0].trim();
const nums = firstLine.startsWith('[') ? JSON.parse(firstLine) : firstLine.split(' ').map(Number);

const result = {function_name}(nums);

if (Array.isArray(result)) {{
    console.log(result.join(' '));
}} else {{
    console.log(result);
}}
'''
        return wrapper

    elif input_format in ("array_int,array_int", "two_arrays"):
        wrapper = f'''
{user_code}

const testInput = `{test_input}`;
const lines = testInput.trim().split('\\n');
const nums1 = lines[0].trim().startsWith('[') ? JSON.parse(lines[0]) : lines[0].trim().split(' ').map(Number);
const nums2 = lines.length > 1
    ? (lines[1].trim().startsWith('[') ? JSON.parse(lines[1]) : lines[1].trim().split(' ').map(Number))
    : [];

const result = {function_name}(nums1, nums2);
if (Array.isArray(result)) {{
    console.log(result.join(' '));
}} else {{
    console.log(result);
}}
'''
        return wrapper

    return f'''
{user_code}
console.error("Error: Unknown or missing input_format '{input_format}' in the question settings. Please ask the admin to edit this question and set a valid Input Format.");
process.exit(1);
'''
