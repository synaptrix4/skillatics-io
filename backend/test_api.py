import requests

code = '''def maxSubArray(nums):
    current_sum = nums[0]
    max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum
'''

payload = {
    'language': 'python',
    'source_code': code,
    'function_name': 'maxSubArray',
    'input_format': 'array_int',
    'test_cases': [
        {'input': '-2 1 -3 4 -1 2 1 -5 4', 'expected_output': '6', 'hidden': False},
        {'input': '1', 'expected_output': '1', 'hidden': False},
        {'input': '5 4 -1 7 8', 'expected_output': '23', 'hidden': True},
        {'input': '-1 -2 -3', 'expected_output': '-1', 'hidden': True}
    ]
}

try:
    resp = requests.post('http://localhost:5000/api/code/execute', json=payload, headers={'Content-Type': 'application/json'})
    import pprint
    pprint.pprint(resp.json())
except Exception as e:
    print(e)
