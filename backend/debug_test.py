import sys
import ast
import subprocess

user_code = '''def maxSubArray(nums):
    current_sum = nums[0]
    max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum
'''

test_input = "-2 1 -3 4 -1 2 1 -5 4"
function_name = "maxSubArray"

wrapper_code = f'''
{user_code}

# Test harness
import sys
import ast

test_input = """\\n{test_input}\\n"""
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

with open('temp_wrapper.py', 'w') as f:
    f.write(wrapper_code)

res = subprocess.run(['python', 'temp_wrapper.py'], capture_output=True, text=True)
print("STDOUT:", repr(res.stdout))
print("STDERR:", repr(res.stderr))
