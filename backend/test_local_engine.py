from routes.code_execution import execute_code_piston

def test_local_exec():
    print("Testing Python...")
    source = "print('Hello local python!\\n' + input())"
    stdin = "world"
    res = execute_code_piston(source, "python", stdin)
    print("Python Result:", res)
    
    print("\nTesting JavaScript...")
    js_source = "const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8'); console.log('Hello local JS! ' + input);"
    res_js = execute_code_piston(js_source, "javascript", stdin)
    print("JS Result:", res_js)

if __name__ == "__main__":
    test_local_exec()
