
def maxSubArray(nums):
    current_sum = nums[0]
    max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum


# Test harness
import sys
import ast

test_input = """\n-2 1 -3 4 -1 2 1 -5 4\n"""
first_line = test_input.strip().split('\n')[0].strip()
if first_line.startswith('['):
    nums = ast.literal_eval(first_line)
else:
    nums = list(map(int, first_line.split()))

result = maxSubArray(nums)

if isinstance(result, (list, tuple)):
    print(' '.join(map(str, result)))
elif result is True:
    print('True')
elif result is False:
    print('False')
else:
    print(result)
