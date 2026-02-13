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
    if not input_format or input_format == "array_int, int":
        wrapper = f'''
{user_code}

# Test harness - parses input and calls user function
import sys
lines = sys.stdin.read().strip().split('\\n') if sys.stdin.read() else []

# For direct execution without stdin
test_input = """{test_input}"""
lines = test_input.strip().split('\\n')

# Parse input
nums = list(map(int, lines[0].split()))
target = int(lines[1])

# Call user function
result = {function_name}(nums, target)

# Print result
if isinstance(result, (list, tuple)):
    print(' '.join(map(str, result)))
else:
    print(result)
'''
        return wrapper
    
    # Generic wrapper for other formats
    return user_code


def wrap_javascript_code(user_code: str, test_input: str, function_name: str, input_format: str):
    """Generate JavaScript wrapper code"""
    
    if not input_format or input_format == "array_int, int":
        wrapper = f'''
{user_code}

// Test harness
const testInput = `{test_input}`;
const lines = testInput.trim().split('\\n');

// Parse input  
const nums = lines[0].split(' ').map(Number);
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
    
    return user_code
