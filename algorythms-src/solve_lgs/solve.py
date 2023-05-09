from typing import List, Dict

SystemOfEquation = List[Dict[str, float]]

if __name__ == "__main__":
    # H2 + O2 = H20
    system_of_equation = [
        {'a': 2, 'b': 0, 'c': -2},
        {'a': 0, 'b': 2, 'c': 1}
    ]